// src/components/hr/JobPositionsTable.jsx
import React from "react";
import moment from "moment";
import {
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArchiveBoxIcon, // <-- 1. IMPORT IKON ARSIP
} from "@heroicons/react/24/outline";

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
      label = "Approved (Ready to Open)";
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
  return (
    <span
      className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${bgColor} ${textColor}`}
    >
      {label}
    </span>
  );
};

function JobPositionsTable({
  data,
  currentUserRole,
  onEdit,
  onDelete,
  onUpdateStatus,
  onArchive, // <-- 2. TAMBAH PROPS BARU
  sortColumn,
  sortDirection,
  onSort,
  totalPages,
  onPageChange,
  totalItems,
  firstItemIndex,
  // --- 3. TAMBAH PROPS BARU (Tiru CVsTable) ---
  isSelectMode,
  selectedPositions,
  setSelectedPositions,
}) {
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

  const formatDate = (dateString) => {
    if (!dateString) return <span className="text-gray-400">N/A</span>;
    return moment(dateString).format("DD MMM YYYY");
  };

  // --- 4. HANDLER CHECKBOX (Tiru CVsTable) ---
  const handleCheckboxChange = (positionId, isChecked) => {
    if (!setSelectedPositions) return;
    setSelectedPositions((prevSelected) => {
      if (isChecked) {
        return [...new Set([...prevSelected, positionId])];
      } else {
        return prevSelected.filter((id) => id !== positionId);
      }
    });
  };

  const handleCheckAllChange = (event) => {
    if (!setSelectedPositions) return;
    const idsOnPage = data.map((pos) => pos.id);
    if (event.target.checked) {
      setSelectedPositions((prevSelected) => [
        ...new Set([...prevSelected, ...idsOnPage]),
      ]);
    } else {
      setSelectedPositions((prevSelected) =>
        prevSelected.filter((id) => !idsOnPage.includes(id))
      );
    }
  };

  const isCheckAllChecked =
    data.length > 0 && data.every((pos) => selectedPositions.includes(pos.id));
  const isIndeterminate =
    !isCheckAllChecked &&
    data.some((pos) => selectedPositions.includes(pos.id));
  // --- BATAS HANDLER CHECKBOX ---

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* --- 5. TAMBAH KOLOM HEADER CHECKBOX (Tiru CVsTable) --- */}
              {isSelectMode && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                    checked={isCheckAllChecked}
                    onChange={handleCheckAllChange}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    disabled={data.length === 0}
                    aria-label="Select all positions on this page"
                  />
                </th>
              )}
              {/* --- BATAS KOLOM HEADER --- */}

              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => onSort("name")}
              >
                Posisi
                {renderSortIcon("name")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => onSort("status")}
              >
                Status
                {renderSortIcon("status")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => onSort("registrationStartDate")}
              >
                Tanggal Publikasi
                {renderSortIcon("registrationStartDate")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => onSort("availableSlots")}
              >
                Slot
                {renderSortIcon("availableSlots")}
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Update Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data && data.length > 0 ? (
              data.map((position) => {
                const isDateMissing =
                  !position.registrationStartDate ||
                  !position.registrationEndDate;

                const isDropdownDisabled =
                  (currentUserRole === "staff_hr" &&
                    position.status === "Closed") ||
                  position.status === "Draft" ||
                  position.status === "Rejected";

                return (
                  <tr
                    key={position.id}
                    className={`hover:bg-gray-50 ${
                      selectedPositions.includes(position.id)
                        ? "bg-indigo-50"
                        : ""
                    }`}
                  >
                    {/* --- 6. TAMBAH KOLOM BARIS CHECKBOX (Tiru CVsTable) --- */}
                    {isSelectMode && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                          checked={selectedPositions.includes(position.id)}
                          onChange={(e) =>
                            handleCheckboxChange(position.id, e.target.checked)
                          }
                          aria-label={`Select position ${position.id}`}
                        />
                      </td>
                    )}
                    {/* --- BATAS KOLOM BARIS --- */}

                    {/* (Kolom Posisi, Status, Tanggal, Slot tetap sama) */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {position.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {position.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <StatusBadge status={position.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(position.registrationStartDate)} -{" "}
                      {formatDate(position.registrationEndDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {position.availableSlots}
                    </td>

                    {/* --- 7. PERUBAHAN: Kolom Aksi (Tambah Tombol Arsip) --- */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-3">
                        {/* Aksi untuk Head HR */}
                        {currentUserRole === "head_hr" && (
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

                            {/* --- Tombol Arsip Individual (Hanya Head HR & Status Closed) --- */}
                            {position.status === "Closed" && (
                              <button
                                onClick={() => onArchive([position.id])} // Kirim sebagai array
                                className="text-gray-500 hover:text-yellow-600"
                                title="Arsipkan Lowongan Ini"
                              >
                                <ArchiveBoxIcon className="h-6 w-6" />
                              </button>
                            )}
                          </>
                        )}

                        {/* Aksi untuk Staff HR */}
                        {currentUserRole === "staff_hr" && (
                          <>
                            {(position.status === "Open" ||
                              position.status === "Approved") && (
                              <button
                                onClick={() => onEdit(position)}
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
                    {/* --- BATAS PERUBAHAN AKSI --- */}

                    {/* (Kolom Update Status tetap sama) */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {position.status === "Approved" ||
                      position.status === "Open" ||
                      position.status === "Closed" ? (
                        <select
                          aria-label={`Update status for ${position.name}`}
                          value={position.status}
                          onChange={(e) =>
                            onUpdateStatus(position.id, e.target.value)
                          }
                          disabled={isDropdownDisabled}
                          className={`block w-full pl-3 pr-8 py-1 border text-xs rounded-md focus:outline-none focus:ring-1 ${
                            isDropdownDisabled
                              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-white border-gray-300 text-gray-700 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                          }`}
                        >
                          {position.status === "Approved" && (
                            <option value="Approved">Approved</option>
                          )}
                          {(currentUserRole === "head_hr" ||
                            position.status === "Approved" ||
                            position.status === "Open") && (
                            <option
                              value="Open"
                              disabled={isDateMissing}
                              title={
                                isDateMissing
                                  ? "Tanggal harus diisi (via Edit) sebelum di-Open"
                                  : "Publikasikan lowongan"
                              }
                            >
                              Open
                            </option>
                          )}
                          {(currentUserRole === "head_hr" ||
                            position.status === "Open" ||
                            position.status === "Closed") && (
                            <option value="Closed">Closed</option>
                          )}
                        </select>
                      ) : (
                        <span className="text-xs text-gray-400 italic px-3 py-1">
                          (Status di-lock)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={isSelectMode ? 7 : 6} // <-- 8. SESUAIKAN COLSPAN
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
