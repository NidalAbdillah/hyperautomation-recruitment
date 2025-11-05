// src/components/hr/JobPositionsTable.jsx
import React from "react";
import moment from 'moment';
import { PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, EyeIcon, ArrowUpIcon, ArrowDownIcon, DocumentArrowUpIcon } from "@heroicons/react/24/outline";

// Helper (Pembantu) Lencana (Badge) Status (Kita copy dari ApproveTable)
const StatusBadge = ({ status }) => {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-800";
  let label = status;

  switch (status) {
    case 'Draft':
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      label = "Draft (Waiting Approval)";
      break;
    case 'Approved':
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      label = "Approved (Ready to Publish)"; // <-- Status "To-Do List" (Daftar Tugas) Staff HR
      break;
    case 'Open':
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      label = "Published (Open)";
      break;
    case 'Closed':
      bgColor = "bg-gray-200";
      textColor = "text-gray-800";
      label = "Closed";
      break;
    case 'Rejected':
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      label = "Rejected";
      break;
    default:
      label = status ? status.toUpperCase() : 'N/A';
  }
  return <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${bgColor} ${textColor}`}>{label}</span>;
};


function JobPositionsTable({
  data,
  currentUserRole, // <-- 1. PROPS (PROPERTI) BARU: Kita butuh tahu siapa yang melihat
  onEdit,
  onPublish, // <-- 2. PROPS (PROPERTI) BARU: Handler (Penangan) untuk tombol "Publish" (Terbitkan)
  onDelete,
  onUpdateStatus, // (Ini mungkin tidak dipakai lagi, tapi kita biarkan)
  sortColumn,
  sortDirection,
  onSort,
  currentPage,
  itemsPerPage,
  // Kita ganti props paginasi agar lebih bersih
  totalPages,
  onPageChange,
  totalItems,
  firstItemIndex,
  lastItemIndex,
}) {

  // Helper (Pembantu) render (sudah benar)
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
  
  // Helper (Pembantu) untuk memformat tanggal (sudah benar)
  const formatDate = (dateString) => {
    if (!dateString) return <span className="text-gray-400">N/A</span>;
    return moment(dateString).format("DD MMM YYYY");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => onSort("name")}>
                Posisi
                {renderSortIcon("name")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => onSort("status")}>
                Status
                {renderSortIcon("status")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => onSort("registrationStartDate")}>
                Tanggal Publikasi
                {renderSortIcon("registrationStartDate")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => onSort("availableSlots")}>
                Slot
                {renderSortIcon("availableSlots")}
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data && data.length > 0 ? (
              data.map((position) => (
                <tr key={position.id} className="hover:bg-gray-50">
                  {/* Kolom Posisi */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{position.name}</div>
                    <div className="text-xs text-gray-500">{position.location}</div>
                  </td>
                  {/* Kolom Status */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <StatusBadge status={position.status} />
                  </td>
                  {/* Kolom Tanggal */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(position.registrationStartDate)} - {formatDate(position.registrationEndDate)}
                  </td>
                  {/* Kolom Slot */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {position.availableSlots}
                  </td>
                  
                  {/* --- 3. PERBAIKAN: Aksi "Sadar Peran" (Role-Aware) --- */}
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-3">
                      
                      {/* Aksi untuk 'head_hr' */}
                      {currentUserRole === 'head_hr' && (
                        <>
                          <button
                            onClick={() => onEdit(position)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit Detail (Head HR)"
                          >
                            <PencilIcon className="h-6 w-6" />
                          </button>
                          <button
                            onClick={() => onDelete(position)}
                            className="text-red-600 hover:text-red-900"
                            title="Hapus (Head HR)"
                          >
                            <TrashIcon className="h-6 w-6" />
                          </button>
                        </>
                      )}
                      
                      {/* Aksi untuk 'staff_hr' */}
                      {currentUserRole === 'staff_hr' && (
                        <>
                          {/* Tombol "Siapkan/Publish" (Terbitkan) HANYA muncul jika status 'Approved' */}
                          {position.status === 'Approved' && (
                            <button
                              onClick={() => onPublish(position)}
                              className="text-green-600 hover:text-green-900"
                              title="Siapkan & Publish Lowongan Ini"
                            >
                              <DocumentArrowUpIcon className="h-6 w-6" />
                            </button>
                          )}
                          
                          {/* Tombol "Edit" (untuk Staff HR) HANYA muncul jika status 'Open' */}
                          {position.status === 'Open' && (
                            <button
                              onClick={() => onPublish(position)} // Gunakan modal 'Publish' yang sama untuk mengedit
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit Pengumuman/Tanggal"
                            >
                              <PencilIcon className="h-6 w-6" />
                            </button>
                          )}
                        </>
                      )}
                      
                    </div>
                  </td>
                  {/* --- BATAS PERBAIKAN 3 --- */}
                  
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5} // <-- Sesuaikan colSpan
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Tidak ada data lowongan yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* --- Paginasi (Logika tidak berubah) --- */}
      {/* ... (Seluruh JSX Paginasi Anda di sini) ... */}
      
    </div>
  );
}

export default JobPositionsTable;