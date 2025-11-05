// src/pages/hr/ManageJobPositionsPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import Notiflix from "notiflix";
import { useAuth } from "../../context/AuthContext"; // <-- PENTING: Impor useAuth

import JobPositionsTable from "../../components/hr/JobPositionsTable"; 
import JobPositionFormModal from "../../components/hr/JobPositionFormModal"; // Modal Tambah (Head HR)
import PublishFormModal from "../../components/hr/PublishFormModal"; // Modal Publish (Staff HR)

import { PlusIcon, ChevronDownIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ADMIN_POSITIONS_URL = `${API_BASE_URL}/api/hr/job-positions`;
const API_UPDATE_POSITION_URL = (id) => `${API_BASE_URL}/api/hr/job-positions/${id}`;
const API_DELETE_POSITION_URL = (id) => `${API_BASE_URL}/api/hr/job-positions/${id}`;

// Status yang BISA dilihat oleh Staff HR
const STAFF_HR_VISIBLE_STATUS = ["Approved", "Open", "Closed"];

const POSITION_STATUS_OPTIONS = ["Draft", "Approved", "Open", "Closed", "Rejected"];

const getAuthToken = () => {
  return localStorage.getItem("token");
};

const ITEMS_PER_PAGE = 10;

function ManageJobPositionsPage() {
  const { user } = useAuth(); // <-- Ambil 'user' yang sedang login

  const [allPositions, setAllPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [positionToEdit, setPositionToEdit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); 
  const [dateFilter, setDateFilter] = useState(null);
  const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // --- FUNGSI PENGAMBILAN DATA (ROLE-AWARE) ---
  const fetchAllPositions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) { /* ... (Error handling token) ... */ }

      const response = await axios.get(API_ADMIN_POSITIONS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let positions = response.data;

      // --- INI LOGIKA "ANTI-CHALLENGE" (ANTI-BANTAH) ANDA ---
      // "Defense" (Pertahanan) TA: Staff HR hanya melihat antrian (queue) yang relevan
      if (user && user.role === 'staff_hr') {
        console.log("Role 'staff_hr' terdeteksi: Memfilter lowongan...");
        positions = positions.filter(pos => 
          STAFF_HR_VISIBLE_STATUS.includes(pos.status)
        );
      }
      // (Head HR bisa melihat semua, jadi tidak perlu di-filter)

      setAllPositions(positions);
      
    } catch (err) {
      setError(err);
      if (err.response && err.response.status === 401) { /* ... */ } 
      else { /* ... */ }
    } finally {
      setLoading(false);
    }
  }, [user]); // <-- Tambahkan 'user' sebagai dependensi

  useEffect(() => {
    if (user) { // Hanya jalankan jika 'user' sudah ter-load
      fetchAllPositions();
    }
  }, [fetchAllPositions, user]);

  // --- LOGIKA FILTER, SORT, PAGINASI (TETAP SAMA) ---
  const processedPositions = useMemo(() => {
    let filtered = [...allPositions];
    
    // 1. Filtering
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((pos) =>
        (pos.name && pos.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (pos.location && pos.location.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    if (statusFilter) {
      filtered = filtered.filter((pos) => pos.status === statusFilter);
    }
    if (dateFilter) {
      // (Logika filter tanggal Anda sudah benar)
      const filterDateObj = new Date(dateFilter);
      filterDateObj.setHours(0, 0, 0, 0);
      filtered = filtered.filter((pos) => {
         try {
           const startDate = new Date(pos.registrationStartDate);
           const endDate = new Date(pos.registrationEndDate);
           startDate.setHours(0, 0, 0, 0);
           endDate.setHours(23, 59, 59, 999);
           return filterDateObj.getTime() >= startDate.getTime() && filterDateObj.getTime() <= endDate.getTime();
         } catch (e) { return false; }
      });
    }

    // 2. Sorting (Logika Anda sudah benar)
    if (sortColumn) {
      filtered.sort((a, b) => { /* ... (logika sort Anda) ... */ });
    }

    // 3. Paginasi (Logika Anda sudah benar)
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    const validPage = Math.max(1, Math.min(currentPage, totalPages > 0 ? totalPages : 1));
    if (currentPage !== validPage) {
      setTimeout(() => setCurrentPage(validPage), 0);
    }
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    
    return {
      data: paginatedData, totalItems, totalPages,
      currentPage: validPage, firstItemIndex: totalItems > 0 ? startIndex + 1 : 0,
      lastItemIndex: Math.min(startIndex + ITEMS_PER_PAGE, totalItems),
    };
  }, [allPositions, searchTerm, statusFilter, dateFilter, sortColumn, sortDirection, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, sortColumn, sortDirection]);

  // --- Handlers (Penangan) Filter & Paginasi (Sudah benar) ---
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);
  const handleDateFilterChange = (date) => setDateFilter(date);
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  const handlePageChange = (page) => {
    const validPage = Math.max(1, Math.min(page, processedPositions.totalPages > 0 ? processedPositions.totalPages : 1));
    setCurrentPage(validPage);
  };

  // --- Handlers (Penangan) Aksi ---
  const handleAddPositionClick = () => {
    setPositionToEdit(null);
    setShowCreateModal(true); // Buka Modal 1 (Form Kosong)
  };

  const handleEditPositionClick = (position) => {
    setPositionToEdit(position);
    setShowCreateModal(true); // Buka Modal 1 (Form Terisi)
  };
  
  const handlePublishClick = (position) => {
    setPositionToEdit(position); // Kirim data "mentah"
    setShowPublishModal(true); // Buka Modal 2 (Form Pemanis)
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowPublishModal(false);
    setPositionToEdit(null);
  };
  
  // Handler (Penangan) untuk Modal 1 (Create/Edit Penuh - Head HR)
  const handleSubmitFullForm = async (formData) => {
    setIsSubmitting(true);
    const isEditing = !!positionToEdit;
    Notiflix.Loading.standard(isEditing ? "Updating Position..." : "Adding Position...");
    
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Token not found");
      const headers = { Authorization: `Bearer ${token}` };

      // (Logika ini hanya untuk Head HR)
      if (isEditing) {
        await axios.put(`${API_ADMIN_POSITIONS_URL}/${positionToEdit.id}`, formData, { headers });
        Notiflix.Report.success("Berhasil Diupdate", "Posisi lowongan berhasil diperbarui.", "Okay");
      } else {
        await axios.post(API_ADMIN_POSITIONS_URL, { ...formData, status: "Draft" }, { headers });
        Notiflix.Report.success("Berhasil Ditambah", "Posisi lowongan (Draft) berhasil ditambahkan.", "Okay");
      }
      
      handleCloseModals();
      fetchAllPositions();
      
    } catch (err) {
      console.error("Error submitting full form:", err);
      Notiflix.Report.failure(isEditing ? "Gagal Update" : "Gagal Tambah", err.response?.data?.message || "Terjadi kesalahan.", "Okay");
    } finally {
      setIsSubmitting(false);
      Notiflix.Loading.remove();
    }
  };

  // Handler (Penangan) untuk Modal 2 (Publish - Staff HR)
  const handleSubmitPublishForm = async (positionId, dataPemanis) => {
    setIsSubmitting(true);
    Notiflix.Loading.standard("Memublikasikan lowongan...");
    
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Token not found");
      
      // 'dataPemanis' berisi: { announcement, registrationStartDate, status: "Open" }
      await axios.put(
        API_UPDATE_POSITION_URL(positionId), 
        dataPemanis, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Notiflix.Loading.remove();
      Notiflix.Report.success("Berhasil Dipublikasikan", "Lowongan telah berhasil di-set 'Open' dan siap menerima pelamar.", "Okay");
      
      handleCloseModals();
      fetchAllPositions();
      
    } catch (error) {
      Notiflix.Loading.remove();
      console.error("Error submitting publish form:", error);
      Notiflix.Report.failure("Gagal Publikasi", error.response?.data?.message || "Terjadi kesalahan.", "Okay");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler (Penangan) Delete (Hanya Head HR)
  const handleDeletePositionClick = (position) => {
    Notiflix.Confirm.show(
      "Konfirmasi Hapus",
      `Anda yakin ingin menghapus lowongan "${position.name}"? Aksi ini tidak dapat dibatalkan.`,
      "Hapus", "Batal",
      async () => {
        Notiflix.Loading.standard("Deleting Position...");
        try {
          const token = getAuthToken();
          if (!token) throw new Error("Token not found");
          await axios.delete(`${API_DELETE_POSITION_URL(position.id)}`, { headers: { Authorization: `Bearer ${token}` } });
          Notiflix.Loading.remove();
          Notiflix.Report.success("Berhasil Dihapus", "Posisi lowongan berhasil dihapus.", "Okay");
          fetchAllPositions();
        } catch (err) {
          Notiflix.Loading.remove();
          Notiflix.Report.failure("Gagal Hapus", err.response?.data?.message || "Terjadi kesalahan.", "Okay");
        }
      }
    );
  };
  
  // Handler (Penangan) Update Status (Hanya Head HR, untuk "Closed")
  const handleUpdateStatus = async (positionId, newStatus) => {
     // (Logika ini mungkin hanya relevan untuk 'Head HR' yang bisa menutup paksa)
    Notiflix.Loading.standard("Updating Status...");
    try {
      const token = getAuthToken();
      await axios.put(`${API_UPDATE_POSITION_URL(positionId)}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      Notiflix.Report.success("Status Berhasil Diupdate", `Status diubah menjadi ${newStatus}.`, "Okay");
      fetchAllPositions();
    } catch(err) {
      Notiflix.Report.failure("Gagal Update", err.response?.data?.message || "Gagal update status.", "Okay");
    } finally {
      Notiflix.Loading.remove();
    }
  };


  // Tampilan loading/error
  if (loading && allPositions.length === 0) {
    return <div className="text-center p-8 text-gray-600">Memuat data lowongan...</div>;
  }
  if (error && allPositions.length === 0) {
    return <div className="text-center p-8 text-red-600">Gagal memuat data: {error.message}</div>;
  }
  
  return (
    <div className="manage-positions-page-container p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Job Positions</h2>

      {/* --- Bagian Filter dan Tombol Tambah --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name, location..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="shadow appearance-none border rounded w-full sm:w-64 py-2 px-3 text-gray-700"
          />
          
          {/* --- PERBAIKAN: Filter "Sadar Peran" (Role-Aware) --- */}
          <div className="relative w-full sm:w-auto">
            <select value={statusFilter} onChange={handleStatusFilterChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 pr-8">
              {user?.role === 'head_hr' && (
                <>
                  <option value="">All Status (Head HR)</option>
                  {POSITION_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </>
              )}
              {user?.role === 'staff_hr' && (
                <>
                  <option value="">All (Approved, Open, Closed)</option>
                  <option value="Approved">Approved (To-Do)</option>
                  <option value="Open">Open (Published)</option>
                  <option value="Closed">Closed</option>
                </>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          {/* --- BATAS PERBAIKAN --- */}
          
          <div className="relative w-full sm:w-auto min-w-[150px]">
            <DatePicker
              selected={dateFilter}
              onChange={handleDateFilterChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="Filter by Date"
              isClearable
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            />
            {!dateFilter && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <CalendarDaysIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
            )}
          </div>
        </div>

        {/* --- PERBAIKAN: Tombol "Tambah" hanya untuk Head HR --- */}
        {user && user.role === 'head_hr' && (
          <button onClick={handleAddPositionClick} className="flex items-center bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-full sm:w-auto">
            <PlusIcon className="h-5 w-5 mr-2" />
            Tambah Lowongan (Draft)
          </button>
        )}
      </div>


      {/* Komponen Tabel (Sekarang "Sadar Peran" / Role-Aware) */}
      <JobPositionsTable
        data={processedPositions.data}
        currentUserRole={user?.role} // <-- Kirim role (peran) user ke tabel
        onEdit={handleEditPositionClick} // Untuk Head HR
        onPublish={handlePublishClick} // <-- Handler (Penangan) BARU untuk Staff HR
        onDelete={handleDeletePositionClick} // Untuk Head HR
        onUpdateStatus={handleUpdateStatus} // Untuk Head HR
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        currentPage={processedPositions.currentPage}
        totalPages={processedPositions.totalPages}
        onPageChange={handlePageChange}
        totalItems={processedPositions.totalItems}
        firstItemIndex={processedPositions.firstItemIndex}
        lastItemIndex={processedPositions.lastItemIndex}
      />
      
      {/* Modal 1: Untuk Tambah/Edit Penuh (Hanya untuk Head HR) */}
      <JobPositionFormModal 
        isOpen={showCreateModal} 
        onClose={handleCloseModals} 
        onSubmit={handleSubmitFullForm} 
        initialData={positionToEdit}
        isLoading={isSubmitting}
      />
      
      {/* Modal 2: Untuk "Pemanis" (Sweetener) & Publish (Hanya untuk Staff HR) */}
      <PublishFormModal
        isOpen={showPublishModal}
        onClose={handleCloseModals}
        onSubmit={handleSubmitPublishForm}
        initialData={positionToEdit} // Kirim data "mentah"
        isLoading={isSubmitting}
      />

    </div>
  );
}

export default ManageJobPositionsPage;