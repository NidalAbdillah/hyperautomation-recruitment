// src/components/hr/JobPositionsTable.jsx
import React from "react";
import moment from "moment";
import { PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

// Helper (Pembantu) Lencana (Badge) Status
const StatusBadge = ({ status }) => {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-800";
  let label = status;

  switch (status) {
    case "Draft":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      label = "Draft (Waiting Approval)";
      break;
    case "Approved":
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      label = "Approved (Ready to Open)"; // <-- Label diubah
      break;
    case "Open":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      label = "Published (Open)";
      break;
    case "Closed":
      bgColor = "bg-gray-200";
      textColor = "text-gray-800";
      label = "Closed";
      break;
    case "Rejected":
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      label = "Rejected";
      break;
    default:
      label = status ? status.toUpperCase() : "N/A";
  }
  return <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${bgColor} ${textColor}`}>{label}</span>;
};

function JobPositionsTable({
  data,
  currentUserRole,
  onEdit,
  // --- PERUBAHAN: 'onPublish' DIHAPUS ---
  onDelete,
  onUpdateStatus, // <-- Prop ini sekarang SANGAT PENTING
  sortColumn,
  sortDirection,
  onSort,
  // ... (props paginasi tetap sama) ...
  totalPages,
  onPageChange,
  totalItems,
  firstItemIndex,
}) {
  const renderSortIcon = (column) => {
    if (sortColumn === column) {
      return sortDirection === "asc" ? <ArrowUpIcon className="h-3 w-3 inline ml-1" /> : <ArrowDownIcon className="h-3 w-3 inline ml-1" />;
    }
    return null;
  };

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
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              {/* --- TAMBAHAN BARU: Kolom Update Status --- */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update Status</th>
              {/* --- BATAS TAMBAHAN --- */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data && data.length > 0 ? (
              data.map((position) => {
                // --- TAMBAHAN BARU: Logika Pengecekan Tanggal ---
                const isDateMissing = !position.registrationStartDate || !position.registrationEndDate;

                // Tentukan apakah dropdown boleh diubah
                const isDropdownDisabled =
                  // Staff HR tidak bisa mengubah status 'Closed'
                  (currentUserRole === "staff_hr" && position.status === "Closed") ||
                  // Semua tidak bisa mengubah 'Draft' atau 'Rejected' di tabel ini
                  position.status === "Draft" ||
                  position.status === "Rejected";
                // --- BATAS TAMBAHAN ---

                return (
                  <tr key={position.id} className="hover:bg-gray-50">
                    {/* ... (Kolom Posisi, Status, Tanggal, Slot tetap sama) ... */}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{position.availableSlots}</td>

                    {/* --- PERUBAHAN: Aksi "Sadar Peran" (Role-Aware) --- */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-3">
                        {/* Aksi untuk 'head_hr' */}
                        {currentUserRole === "head_hr" && (
                          <>
                            <button onClick={() => onEdit(position)} className="text-indigo-600 hover:text-indigo-900" title="Edit Detail (Head HR)">
                              <PencilIcon className="h-6 w-6" />
                            </button>
                            <button onClick={() => onDelete(position)} className="text-red-600 hover:text-red-900" title="Hapus (Head HR)">
                              <TrashIcon className="h-6 w-6" />
                            </button>
                          </>
                        )}

                        {/* Aksi untuk 'staff_hr' */}
                        {currentUserRole === "staff_hr" && (
                          <>
                            {/* Tombol "Publish" (DocumentArrowUpIcon) DIHAPUS */}

                            {/* Tombol "Edit" (untuk Staff HR) HANYA muncul jika status 'Open' atau 'Approved' */}
                            {(position.status === "Open" || position.status === "Approved") && (
                              <button
                                onClick={() => onEdit(position)} // <-- DIGANTI: Gunakan onEdit
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
                    {/* --- BATAS PERUBAHAN --- */}

                    {/* --- TAMBAHAN BARU: Kolom Update Status --- */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {/* Hanya tampilkan dropdown jika status BUKAN Draft atau Rejected */}
                      {position.status === "Approved" || position.status === "Open" || position.status === "Closed" ? (
                        <select
                          aria-label={`Update status for ${position.name}`}
                          value={position.status}
                          onChange={(e) => onUpdateStatus(position.id, e.target.value)}
                          disabled={isDropdownDisabled}
                          className={`block w-full pl-3 pr-8 py-1 border text-xs rounded-md focus:outline-none focus:ring-1 ${
                            isDropdownDisabled ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-300 text-gray-700 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                          }`}
                        >
                          {/* Logika Opsi:
                            - Head HR melihat semua opsi.
                            - Staff HR melihat opsi terbatas.
                            - Opsi "Open" mati jika tanggal hilang.
                          */}

                          {position.status === "Approved" && <option value="Approved">Approved</option>}

                          {/* Opsi 'Open' */}
                          {(currentUserRole === "head_hr" || position.status === "Approved" || position.status === "Open") && (
                            <option value="Open" disabled={isDateMissing} title={isDateMissing ? "Tanggal harus diisi (via Edit) sebelum di-Open" : "Publikasikan lowongan"}>
                              Open
                            </option>
                          )}

                          {/* Opsi 'Closed' */}
                          {(currentUserRole === "head_hr" || position.status === "Open" || position.status === "Closed") && <option value="Closed">Closed</option>}
                        </select>
                      ) : (
                        // Tampilkan status non-interaktif untuk 'Draft' atau 'Rejected'
                        <span className="text-xs text-gray-400 italic px-3 py-1">(Status di-lock)</span>
                      )}
                    </td>
                    {/* --- BATAS TAMBAHAN --- */}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={6} // <-- PERUBAHAN: colSpan diubah menjadi 6
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Tidak ada data lowongan yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ... (Paginasi tetap sama) ... */}
    </div>
  );
}

export default JobPositionsTable;
