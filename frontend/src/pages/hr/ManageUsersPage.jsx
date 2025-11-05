// src/pages/hr/ManageUsersPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import UsersTable from "../../components/hr/UsersTable";
import UserFormModal from "../../components/hr/UserFormModal";
import { PlusIcon, ChevronDownIcon, ArrowUpIcon, ArrowDownIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Notiflix from "notiflix";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// URL API (Sudah benar)
const API_GET_USERS_URL = `${API_BASE_URL}/api/hr/users`;
const API_CREATE_USER_URL = `${API_BASE_URL}/api/hr/users`;
const API_UPDATE_USER_URL = (id) => `${API_BASE_URL}/api/hr/users/${id}`;
const API_DELETE_USER_URL = (id) => `${API_BASE_URL}/api/hr/users/${id}`;

// getAuthToken (Sudah benar)
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Roles (Peran) (Sudah benar)
const AVAILABLE_ROLES_FOR_FILTER = ["All", "head_hr", "staff_hr", "manager"];
const ITEMS_PER_PAGE = 10;

// Nama Fungsi (Sudah benar)
function ManageUsersPage() {
  console.log("ManageUsersPage component rendering...");

  // State (Sudah benar)
  const [allUserData, setAllUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserData, setEditingUserData] = useState(null);
  const [isSubmittingUserForm, setIsSubmittingUserForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // fetchUserData (Sudah benar)
  const fetchUserData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`ManageUsersPage: Fetching user data from: ${API_GET_USERS_URL}`);
      const token = getAuthToken();
      if (!token) {
        const authError = new Error("User not authenticated. Token missing.");
        authError.response = { status: 401, data: { message: "Silakan login kembali." } };
        throw authError;
      }
      const response = await axios.get(API_GET_USERS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUserData(response.data);
      console.log("ManageUsersPage: User Data fetched successfully:", response.data.length, "items.");
    } catch (err) {
      setError(err);
      console.error("ManageUsersPage Error fetching user data:", err);
      if (err.response && err.response.status === 401) {
        Notiflix.Report.warning("Sesi Habis", "Sesi Anda telah berakhir. Silakan login kembali.", "Okay");
      } else {
        Notiflix.Report.failure("Gagal Memuat Data Staf", err.response?.data?.message || "Terjadi kesalahan saat memuat data staf.", "Okay");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("ManageUsersPage useEffect triggered.");
    fetchUserData();
  }, [fetchUserData]);

  // processedUserData (useMemo) (Sudah benar)
  const processedUserData = useMemo(() => {
    let filtered = [...allUserData];
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((user) => (user.name && user.name.toLowerCase().includes(lowerCaseSearchTerm)) || (user.email && user.email.toLowerCase().includes(lowerCaseSearchTerm)));
    }
    if (roleFilter !== "All") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }
    if (sortColumn) {
      filtered.sort((a, b) => {
        // (Logika sort Anda sudah benar)
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortDirection === "asc" ? -1 : 1;
        if (bValue == null) return sortDirection === "asc" ? 1 : -1;
        if (typeof aValue === "string" && typeof bValue === "string") {
          const stringA = aValue.toLowerCase();
          const stringB = bValue.toLowerCase();
          if (sortDirection === "asc") return stringA.localeCompare(stringB);
          else return stringB.localeCompare(stringA);
        } else {
          if (sortDirection === "asc") return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          else return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
        }
      });
    }
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
  }, [allUserData, searchTerm, roleFilter, sortColumn, sortDirection, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  // Handlers (Penangan) (Sudah benar)
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleRoleFilterChange = (e) => setRoleFilter(e.target.value);
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  const handlePageChange = (page) => {
    const validPage = Math.max(1, Math.min(page, processedUserData.totalPages > 0 ? processedUserData.totalPages : 1));
    setCurrentPage(validPage);
  };
  const handleAddUser = () => {
    setEditingUserData(null);
    setShowUserModal(true);
  };
  const handleEditUser = (user) => {
    setEditingUserData(user);
    setShowUserModal(true);
  };
  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setEditingUserData(null);
  };
  const handleDeleteUser = (user) => {
    Notiflix.Confirm.show(
      "Konfirmasi Hapus Staf",
      `Anda yakin ingin menghapus staf "${user.name}"?`,
      "Hapus",
      "Batal",
      async () => {
        try {
          Notiflix.Loading.standard(`Menghapus staf ${user.name}...`);
          const deleteApiUrl = API_DELETE_USER_URL(user.id);
          const token = getAuthToken();
          if (!token) throw new Error("Token not found");
          const response = await axios.delete(deleteApiUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Notiflix.Loading.remove();
          Notiflix.Report.success("Berhasil Dihapus", response.data.message || `Staf "${user.name}" berhasil dihapus.`, "Okay");
          fetchUserData();
        } catch (error) {
          Notiflix.Loading.remove();
          if (error.response && error.response.status === 401) {
            Notiflix.Report.warning("Sesi Habis", "Sesi Anda telah berakhir. Silakan login kembali.", "Okay");
          } else {
            Notiflix.Report.failure("Gagal Menghapus Staf", error.response?.data?.message || "Terjadi kesalahan saat menghapus staf.", "Okay");
          }
        }
      },
      () => { /* Batal */ }
    );
  };

  // --- PERBAIKAN UTAMA DI SINI ---
  // Handler untuk submit form dari modal (Tambah atau Edit)
  const handleSubmitUserForm = async (userId, dataToSubmit) => {
    setIsSubmittingUserForm(true);
    try {
      console.log("ManageUsersPage: Received dataToSubmit from modal:", dataToSubmit);

      const formDataToSend = new FormData();
      formDataToSend.append("name", dataToSubmit.name);
      formDataToSend.append("email", dataToSubmit.email);
      formDataToSend.append("role", dataToSubmit.role);

      // --- 1. TAMBAHKAN LOGIKA 'department' ---
      // dataToSubmit.department dikirim dari UserFormModal
      if (dataToSubmit.department) {
        formDataToSend.append("department", dataToSubmit.department);
      }
      // --- BATAS TAMBAHAN 1 ---

      if (dataToSubmit.password) {
        formDataToSend.append("password", dataToSubmit.password);
      }
      if (dataToSubmit.photo) {
        formDataToSend.append("photo", dataToSubmit.photo);
      } else if (userId && dataToSubmit.removePhoto) {
        formDataToSend.append("removePhoto", "true");
      }

      const token = getAuthToken();
      if (!token) throw new Error("Token not found");
      
      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      };

      let response;
      if (userId) {
        // Mode Edit (PUT)
        Notiflix.Loading.standard("Menyimpan perubahan...");
        response = await axios.put(API_UPDATE_USER_URL(userId), formDataToSend, { headers });
        Notiflix.Report.success("Berhasil Diubah", response.data.message || `Data staf "${dataToSubmit.name}" berhasil disimpan.`, "Okay");
      } else {
        // Mode Tambah (POST)
        Notiflix.Loading.standard("Menambah staf baru...");
        response = await axios.post(API_CREATE_USER_URL, formDataToSend, { headers });
        Notiflix.Report.success("Berhasil Ditambah", response.data.message || `Staf "${dataToSubmit.name}" berhasil ditambahkan.`, "Okay");
      }

      Notiflix.Loading.remove();
      fetchUserData();
      handleCloseUserModal();
    } catch (error) {
      Notiflix.Loading.remove();
      if (error.response && error.response.status === 401) {
        Notiflix.Report.warning("Sesi Habis", "Sesi Anda telah berakhir. Silakan login kembali.", "Okay");
      } else {
        const errorMessage = error.response?.data?.message || (userId ? "Terjadi kesalahan saat menyimpan perubahan." : "Terjadi kesalahan saat menambah staf baru.");
        Notiflix.Report.failure(userId ? "Gagal Menyimpan" : "Gagal Menambah", errorMessage, "Okay");
      }
    } finally {
      setIsSubmittingUserForm(false);
    }
  };
  // --- BATAS PERBAIKAN UTAMA ---

  // Tampilan loading atau error (Sudah benar)
  if (loading && allUserData.length === 0) {
    return <div className="text-center p-8 text-gray-600">Memuat data Staf...</div>;
  }
  if (error && allUserData.length === 0) {
    return <div className="text-center p-8 text-red-600">Gagal memuat data staf {error.message}.</div>;
  }

  return (
    <div className="manage-user-page-container p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-16">Manage Staff</h2>

      {/* Bagian Filter dan Tombol Aksi (Sudah benar) */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="shadow appearance-none border rounded w-full sm:w-64 py-2 px-3 text-gray-700"
          />
          <div className="relative w-full sm:w-auto">
            <select value={roleFilter} onChange={handleRoleFilterChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 pr-8">
              {AVAILABLE_ROLES_FOR_FILTER.map((role) => (
                <option key={role} value={role}>
                  {role === "All" ? "All Roles" : role}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="flex justify-end w-full sm:w-auto">
          <button
            onClick={handleAddUser}
            className="bg-gray-500 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded inline-flex items-center w-full sm:w-auto justify-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
            Tambah Staf
          </button>
        </div>
      </div>

      {/* Render komponen tabel (Sudah benar) */}
      <UsersTable
        data={processedUserData?.data || []}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        currentPage={processedUserData?.currentPage || 1}
        totalPages={processedUserData?.totalPages || 1}
        onPageChange={handlePageChange}
        totalItems={processedUserData?.totalItems || 0}
        firstItemIndex={processedUserData?.firstItemIndex || 0}
        lastItemIndex={processedUserData?.lastItemIndex || 0}
      />

      {/* Render komponen Modal (Sudah benar) */}
      <UserFormModal
        isOpen={showUserModal}
        onClose={handleCloseUserModal}
        onSubmit={handleSubmitUserForm}
        initialData={editingUserData}
        isLoading={isSubmittingUserForm}
      />
    </div>
  );
}

export default ManageUsersPage;