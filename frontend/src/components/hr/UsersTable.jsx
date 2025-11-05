// src/components/hr/UsersTable.jsx
import React from "react";
import {
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserCircleIcon,
  ShieldCheckIcon, // head_hr
  UserIcon, // staff_hr
  BriefcaseIcon, // manager
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

// Helper (Konfigurasi Tampilan) untuk Role (Peran)
const roleDisplayConfig = {
  head_hr: {
    icon: ShieldCheckIcon,
    color: "text-yellow-500",
    label: "Head HR",
  },
  staff_hr: {
    icon: UserIcon,
    color: "text-blue-500",
    label: "Staff HR",
  },
  manager: {
    icon: BriefcaseIcon,
    color: "text-gray-500",
    label: "Manager",
  },
};

/**
 * Komponen Tabel untuk menampilkan daftar User (Staf).
 * Menerima data dan handler (penangan) dari ManageUsersPage.
 */
function UsersTable({
  data,
  onEditUser,
  onDeleteUser,
  sortColumn,
  sortDirection,
  onSort,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  firstItemIndex,
  lastItemIndex,
}) {
  
  // Handler (Penangan) untuk meneruskan aksi ke parent (induk)
  const handleEditClick = (user) => {
    console.log("Edit User:", user.id, user.name);
    onEditUser?.(user);
  };

  const handleDeleteClick = (user) => {
    console.log("Delete User:", user.id, user.name);
    onDeleteUser?.(user);
  };

  // Helper (Pembantu) untuk render ikon sort
  const renderSortIcon = (column) => {
    if (sortColumn === column) {
      return sortDirection === "asc" ? (
        <ArrowUpIcon className="h-3 w-3 inline ml-1" />
      ) : (
        <ArrowDownIcon className="h-3 w-3 inline ml-1" />
      );
    }
    return null;
  };

  // Helper (Pembantu) untuk render Role (Peran) dengan Ikon
  const renderRole = (roleKey) => {
    const config = roleDisplayConfig[roleKey];
    if (!config) {
      return <span>{roleKey}</span>; // Fallback
    }
    const IconComponent = config.icon;
    return (
      <div className={`flex items-center ${config.color}`}>
        <IconComponent
          className={`h-5 w-5 mr-1`}
          aria-hidden="true"
        />
        <span>{config.label || roleKey}</span>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* --- HEADER TABEL --- */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Foto
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                onClick={() => onSort("name")}
              >
                Nama
                {renderSortIcon("name")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                onClick={() => onSort("email")}
              >
                Email
                {renderSortIcon("email")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                onClick={() => onSort("role")}
              >
                Role
                {renderSortIcon("role")}
              </th>
              
              {/* --- PERBAIKAN 1: Tambahkan Kolom Header Department --- */}
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                onClick={() => onSort("department")}
              >
                Department
                {renderSortIcon("department")}
              </th>
              {/* --- BATAS PERBAIKAN 1 --- */}

              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>

          {/* --- ISI TABEL --- */}
          <tbody className="bg-white divide-y divide-gray-200">
            {data && data.length > 0 ? (
              data.map((user, index) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition duration-150 ease-in-out"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {firstItemIndex + index}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt={user.name || "User Photo"}
                        className="h-8 w-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/32x32/E5E7EB/4B5563?text=No+Photo";
                          e.target.alt = "No Photo Available";
                        }}
                      />
                    ) : (
                      <UserCircleIcon
                        className="h-8 w-8 text-gray-400"
                        aria-hidden="true"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {renderRole(user.role)}
                  </td>

                  {/* --- PERBAIKAN 2: Tambahkan Kolom Isi Department --- */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* Logika "Anti-Challenge": Tampilkan HANYA jika role-nya manager */}
                    {user.role === 'manager' ? (
                      user.department
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  {/* --- BATAS PERBAIKAN 2 --- */}

                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit User"
                        aria-label={`Edit user ${user.name}`}
                      >
                        <PencilIcon className="h-6 w-6" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-600 hover:text-red-900"
                        title="Hapus User"
                        aria-label={`Hapus user ${user.name}`}
                      >
                        <TrashIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                {/* --- PERBAIKAN 3: Update colSpan dari 6 menjadi 7 --- */}
                <td
                  colSpan={7} // <-- DIUBAH
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Tidak ada data staf.
                </td>
                {/* --- BATAS PERBAIKAN 3 --- */}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Paginasi (Logika tetap sama) --- */}
      {totalItems > 0 &&
        totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-b-lg">
            {/* ... (Seluruh JSX Paginasi Anda di sini) ... */}
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Menampilkan{" "}
                  <span className="font-medium">{firstItemIndex}</span>–
                  <span className="font-medium">{lastItemIndex}</span> dari{" "}
                  <span className="font-medium">{totalItems}</span>
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        aria-current={currentPage === page ? "page" : undefined}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? "z-10 bg-red-100 border-red-500 text-red-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
            {/* ... (Paginasi Mobile Anda) ... */}
          </div>
        )}
    </div>
  );
}

export default UsersTable;