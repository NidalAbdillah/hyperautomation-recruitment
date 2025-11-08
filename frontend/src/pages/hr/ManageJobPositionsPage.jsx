// frontend/src/pages/hr/ManageJobPositionsPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import Notiflix from "notiflix";
import { useAuth } from "../../context/AuthContext";
import JobPositionsTable from "../../components/hr/JobPositionsTable";
import JobPositionFormModal from "../../components/hr/JobPositionFormModal";

import {
  PlusIcon,
  ChevronDownIcon,
  CalendarDaysIcon,
  // --- 1. IMPORT IKON BARU (Tiru ManageCVsPage) ---
  CheckCircleIcon,
  XCircleIcon,
  ArchiveBoxIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ADMIN_POSITIONS_URL = `${API_BASE_URL}/api/hr/job-positions`;
const API_UPDATE_POSITION_URL = (id) => `${API_BASE_URL}/api/hr/job-positions/${id}`;
const API_DELETE_POSITION_URL = (id) => `${API_BASE_URL}/api/hr/job-positions/${id}`;
// --- 2. ENDPOINT API BARU (dari routes) ---
const API_ARCHIVE_POSITIONS_URL = `${API_BASE_URL}/api/hr/job-positions/archive`; 

const STAFF_HR_VISIBLE_STATUS = ["Approved", "Open", "Closed"];
const POSITION_STATUS_OPTIONS = [ "Draft", "Approved", "Open", "Closed", "Rejected" ];
const getAuthToken = () => localStorage.getItem("token");
const ITEMS_PER_PAGE = 10;

function ManageJobPositionsPage() {
  const { user } = useAuth();
  const [allPositions, setAllPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [positionToEdit, setPositionToEdit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // (State filter, sort, paginasi)
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(null);
  const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  
  // --- 3. STATE BARU (Tiru ManageCVsPage) ---
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState([]);

  // --- 4. FUNGSI FETCH DATA (Filter 'isArchived: false') ---
  const fetchAllPositions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Token tidak ditemukan");

      // Panggil backend service listAllPositions (yang sudah kita update)
      const response = await axios.get(API_ADMIN_POSITIONS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let positions = response.data;

      // Filter "Sadar Peran" (Frontend tetap filter, best practice)
      if (user) {
        if (user.role === "staff_hr") {
          positions = positions.filter((pos) =>
            STAFF_HR_VISIBLE_STATUS.includes(pos.status)
          );
        } else if (user.role === "manager") {
          positions = positions.filter(
            (pos) => pos.requestor && pos.requestor.id === user.id
          );
        }
      }
      // Service backend sudah filter 'isArchived: false', jadi tidak perlu filter di sini
      setAllPositions(positions);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAllPositions();
    }
  }, [fetchAllPositions, user]);

  // --- 5. PROCESSED DATA (Tiru ManageCVsPage) ---
  const processedPositions = useMemo(() => {
    // Filter 'isArchived' TIDAK PERLU lagi, karena backend service sudah melakukannya
    let filtered = [...allPositions]; 

    // (Filtering, Sorting, Paginasi... tetap sama)
    // 1. Filtering
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (pos) =>
          (pos.name && pos.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (pos.location &&
            pos.location.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    if (statusFilter) {
      filtered = filtered.filter((pos) => pos.status === statusFilter);
    }
    if (dateFilter) {
      const filterDateObj = new Date(dateFilter);
      filterDateObj.setHours(0, 0, 0, 0);
      filtered = filtered.filter((pos) => {
        try {
          const startDate = new Date(pos.registrationStartDate);
          const endDate = new Date(pos.registrationEndDate);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          return (
            filterDateObj.getTime() >= startDate.getTime() &&
            filterDateObj.getTime() <= endDate.getTime()
          );
        } catch (e) {
          return false;
        }
      });
    }

    // 2. Sorting
    const filteredAndSortedData = [...filtered]; // <-- Gunakan ini untuk Quick Select
    if (sortColumn) {
      filteredAndSortedData.sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];
        if (
          sortColumn === "createdAt" ||
          sortColumn === "registrationStartDate"
        ) {
          aVal = aVal ? new Date(aVal).getTime() : 0;
          bVal = bVal ? new Date(bVal).getTime() : 0;
        }
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    // 3. Paginasi
    const totalItems = filteredAndSortedData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    const validPage = Math.max(
      1,
      Math.min(currentPage, totalPages > 0 ? totalPages : 1)
    );
    if (currentPage !== validPage) {
      setTimeout(() => setCurrentPage(validPage), 0);
    }
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = filteredAndSortedData.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );

    return {
      data: paginatedData,
      filteredAndSortedData, // <-- Ekspor data yg sudah difilter (untuk Quick Select)
      totalItems,
      totalPages,
      currentPage: validPage,
      firstItemIndex: totalItems > 0 ? startIndex + 1 : 0,
      lastItemIndex: Math.min(startIndex + ITEMS_PER_PAGE, totalItems),
    };
  }, [
    allPositions,
    searchTerm,
    statusFilter,
    dateFilter,
    sortColumn,
    sortDirection,
    currentPage,
  ]);

  useEffect(() => {
    setCurrentPage(1);
    // --- 6. RESET SELECTION (Tiru ManageCVsPage) ---
    if (!isSelectMode) {
      setSelectedPositions([]);
    }
  }, [searchTerm, statusFilter, dateFilter, sortColumn, sortDirection, isSelectMode]);

  // (Handlers Filter & Paginasi tetap sama)
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
    const validPage = Math.max(
      1,
      Math.min(
        page,
        processedPositions.totalPages > 0 ? processedPositions.totalPages : 1
      )
    );
    setCurrentPage(validPage);
  };

  // --- 7. HANDLER AKSI BARU (Tiru ManageCVsPage) ---
  const handleToggleSelectMode = useCallback(() => {
    setIsSelectMode((prev) => !prev);
    setSelectedPositions([]);
  }, []);

  const handleAddPositionClick = () => {
    setPositionToEdit(null);
    setShowFormModal(true);
  };

  const handleEditPositionClick = (position) => {
    setPositionToEdit(position);
    setShowFormModal(true);
  };

  const handleCloseModals = () => {
    setShowFormModal(false);
    setPositionToEdit(null);
  };

  // (Handler handleSubmitForm, handleDeletePositionClick, handleUpdateStatus... tetap sama)
  const handleSubmitForm = async (formData) => {
    setIsSubmitting(true);
    const isEditing = !!positionToEdit;
    Notiflix.Loading.standard(
      isEditing ? "Updating Position..." : "Adding Position..."
    );

    try {
      const token = getAuthToken();
      if (!token) throw new Error("Token not found");
      const headers = { Authorization: `Bearer ${token}` };

      if (isEditing) {
        await axios.put(
          `${API_ADMIN_POSITIONS_URL}/${positionToEdit.id}`,
          formData,
          { headers }
        );
        Notiflix.Report.success(
          "Berhasil Diupdate",
          "Data publikasi berhasil diperbarui.",
          "Okay"
        );
      } else {
        await axios.post(API_ADMIN_POSITIONS_URL, formData, { headers });
        Notiflix.Report.success(
          "Berhasil Ditambah",
          "Posisi lowongan (Draft) berhasil ditambahkan.",
          "Okay"
        );
      }

      handleCloseModals();
      fetchAllPositions();
    } catch (err) {
      console.error("Error submitting form:", err);
      Notiflix.Report.failure(
        isEditing ? "Gagal Update" : "Gagal Tambah",
        err.response?.data?.message || "Terjadi kesalahan.",
        "Okay"
      );
    } finally {
      setIsSubmitting(false);
      Notiflix.Loading.remove();
    }
  };

  const handleDeletePositionClick = (position) => {
    Notiflix.Confirm.show(
      "Konfirmasi Hapus",
      `Anda yakin ingin menghapus lowongan "${position.name}"?`,
      "Hapus",
      "Batal",
      async () => {
        Notiflix.Loading.standard("Deleting Position...");
        try {
          const token = getAuthToken();
          if (!token) throw new Error("Token not found");
          await axios.delete(`${API_DELETE_POSITION_URL(position.id)}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Notiflix.Loading.remove();
          Notiflix.Report.success(
            "Berhasil Dihapus",
            "Posisi lowongan berhasil dihapus.",
            "Okay"
          );
          fetchAllPositions();
        } catch (err) {
          Notiflix.Loading.remove();
          Notiflix.Report.failure(
            "Gagal Hapus",
            err.response?.data?.message || "Terjadi kesalahan.",
            "Okay"
          );
        }
      }
    );
  };

  const handleUpdateStatus = async (positionId, newStatus) => {
    Notiflix.Loading.standard("Updating Status...");
    try {
      const token = getAuthToken();
      await axios.put(
        `${API_UPDATE_POSITION_URL(positionId)}`,
        { status: newStatus }, // Hanya kirim status
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Notiflix.Report.success(
        "Status Berhasil Diupdate",
        `Status diubah menjadi ${newStatus}.`,
        "Okay"
      );
      fetchAllPositions();
    } catch (err) {
      Notiflix.Report.failure(
        "Gagal Update",
        err.response?.data?.message || "Gagal update status.",
        "Okay"
      );
    } finally {
      Notiflix.Loading.remove();
    }
  };

  // --- 8. HANDLER AKSI MASAL (BULK ACTION) BARU ---
  
  // Handler untuk Tombol Arsip (Individual & Bulk)
  const handleArchivePosition = async (positionIds) => {
    Notiflix.Confirm.show(
      "Konfirmasi Arsip",
      `Anda yakin ingin mengarsipkan ${positionIds.length} lowongan? Lowongan harus berstatus 'Closed'.`,
      "Arsipkan",
      "Batal",
      async () => {
        Notiflix.Loading.standard("Mengarsipkan...");
        
        // Filter di frontend: Hanya arsipkan yang 'Closed'
        const positionsToArchive = allPositions.filter(p => 
          positionIds.includes(p.id) && p.status === 'Closed'
        );
        const idsToArchive = positionsToArchive.map(p => p.id);
        
        if (idsToArchive.length === 0) {
           Notiflix.Loading.remove();
           Notiflix.Report.info("Tidak Ada Arsip", "Hanya lowongan berstatus 'Closed' yang dapat diarsipkan.", "Okay");
           return;
        }

        try {
          const token = getAuthToken();
          // Panggil API baru (dari routes)
          await axios.put(
            API_ARCHIVE_POSITIONS_URL, 
            { ids: idsToArchive }, // Kirim array ID
            { headers: { Authorization: `Bearer ${token}` } }
          );
          Notiflix.Loading.remove();
          Notiflix.Report.success("Berhasil Diarsip", `${idsToArchive.length} lowongan berhasil diarsipkan.`, "Okay");
          
          fetchAllPositions(); // Refresh tabel
          setSelectedPositions([]); // Kosongkan seleksi
          setIsSelectMode(false); // Matikan mode select
          
        } catch (err) {
          Notiflix.Loading.remove();
          Notiflix.Report.failure("Gagal Arsip", err.response?.data?.message || "Terjadi kesalahan.", "Okay");
        }
      }
    );
  };

  // Quick Select Handlers
  const handleSelectAll = useCallback(() => setSelectedPositions(processedPositions.filteredAndSortedData.map(p => p.id)), [processedPositions.filteredAndSortedData]);
  const handleSelectNone = useCallback(() => setSelectedPositions([]), []);
  const handleSelectClosed = useCallback(() => setSelectedPositions(processedPositions.filteredAndSortedData.filter(p => p.status === 'Closed').map(p => p.id)), [processedPositions.filteredAndSortedData]);


  // (Tampilan loading/error)
  if (loading && allPositions.length === 0) { /* ... */ }
  if (error && allPositions.length === 0) { /* ... */ }

  return (
    <div className="manage-positions-page-container p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Manage Job Positions
      </h2>

      {/* --- 9. BAGIAN TOMBOL DAN FILTER (Di-update) --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          {/* (Input Search, Select Status, DatePicker... tetap sama) */}
          <input
            type="text"
            placeholder="Search by name, location..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="shadow appearance-none border rounded w-full sm:w-64 py-2 px-3 text-gray-700"
          />
          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 pr-8"
            >
              {user?.role === "head_hr" && (
                <>
                  <option value="">All Status (Head HR)</option>
                  {POSITION_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </>
              )}
              {user?.role === "staff_hr" && (
                <>
                  <option value="">All (Approved, Open, Closed)</option>
                  <option value="Approved">Approved (To-Do)</option>
                  <option value="Open">Open (Published)</option>
                  <option value="Closed">Closed</option>
                </>
              )}
              {user?.role === "manager" && (
                <>
                  <option value="">All My Requests</option>
                  <option value="Draft">Draft</option>
                  <option value="Approved">Approved</option>
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                  <option value="Rejected">Rejected</option>
                </>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="relative w-full sm:w-auto min-w-[150px]">
            <DatePicker
              selected={dateFilter}
              onChange={handleDateFilterChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="Filter by Date"
              isClearable
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            />
          </div>
        </div>

        {/* Tombol Aksi Kanan */}
        <div className="flex items-center space-x-2">
          {/* Tombol "Tambah" (Hanya untuk Head HR & Manager) */}
          {(user?.role === "head_hr" || user?.role === "manager") && !isSelectMode && (
            <button
              onClick={handleAddPositionClick}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full sm:w-auto"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Buat Permintaan (Draft)
            </button>
          )}
          
          {/* --- 10. TOMBOL SELECT MODE BARU (Tiru ManageCVsPage) --- */}
          {(user?.role === "head_hr") && ( // Hanya Head HR yang bisa bulk archive/delete
            <button
              onClick={handleToggleSelectMode}
              className={`flex items-center px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 text-sm whitespace-nowrap transition-colors duration-150 ${
                isSelectMode
                  ? "bg-gray-700 hover:bg-gray-800 focus:ring-gray-600 text-white"
                  : "bg-gray-500 hover:bg-gray-600 focus:ring-gray-400 text-white"
              }`}
            >
              {isSelectMode ? (
                <> <XCircleIcon className="mr-1.5 h-4 w-4" /> Batal Pilih </>
              ) : (
                <> <CheckCircleIcon className="mr-1.5 h-4 w-4" /> Pilih Aksi Masal </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* --- 11. PANEL AKSI MASAL (BULK ACTION) BARU (Tiru ManageCVsPage) --- */}
      {isSelectMode && (
        <div className="mb-4 p-3 bg-gray-100 rounded border flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600 mr-2">
              Quick Select:
            </span>
            <button onClick={handleSelectAll} className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-600">
              All ({processedPositions.filteredAndSortedData.length})
            </button>
            <button onClick={handleSelectNone} disabled={selectedPositions.length === 0} className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-gray-600">
              None
            </button>
            <button onClick={handleSelectClosed} className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 text-gray-700">
              Closed Only
            </button>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {selectedPositions.length > 0 ? (
              <>
                <button 
                  onClick={() => handleArchivePosition(selectedPositions)} 
                  title="Arsipkan lowongan (Hanya yang 'Closed')" 
                  className="flex items-center px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400 text-white text-xs whitespace-nowrap"
                >
                  <ArchiveBoxIcon className="mr-1 h-4 w-4" /> Arsipkan ({selectedPositions.length})
                </button>
                <button 
                  onClick={() => handleDeletePositionClick({ id: selectedPositions, name: `${selectedPositions.length} lowongan` })} 
                  title="Hapus lowongan terpilih" 
                  className="flex items-center px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white text-xs whitespace-nowrap"
                >
                  <TrashIcon className="mr-1 h-4 w-4" /> Hapus ({selectedPositions.length})
                </button>
              </>
            ) : (
              <span className="text-sm text-gray-500 italic">
                Pilih lowongan untuk melakukan aksi masal.
              </span>
            )}
          </div>
        </div>
      )}
      {/* --- BATAS PANEL AKSI MASAL --- */}


      {/* Komponen Tabel */}
      <JobPositionsTable
        data={processedPositions.data}
        currentUserRole={user?.role}
        onEdit={handleEditPositionClick}
        onDelete={handleDeletePositionClick}
        onUpdateStatus={handleUpdateStatus}
        onArchive={handleArchivePosition} // <-- 12. Kirim handler arsip
        // --- 13. Kirim props select mode ---
        isSelectMode={isSelectMode}
        selectedPositions={selectedPositions}
        setSelectedPositions={setSelectedPositions}
        // --- Batas props ---
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

      {/* Modal (Tetap 1 modal) */}
      <JobPositionFormModal
        isOpen={showFormModal}
        onClose={handleCloseModals}
        onSubmit={handleSubmitForm}
        initialData={positionToEdit}
      />
    </div>
  );
}

export default ManageJobPositionsPage;