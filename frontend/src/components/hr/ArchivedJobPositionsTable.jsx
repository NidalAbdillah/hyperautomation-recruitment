// src/components/hr/ArchivedJobPositionsTable.jsx
import React from "react";
import moment from "moment";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrashIcon,
  ArrowUturnLeftIcon, // Ikon Unarchive
  EyeIcon, // <-- 1. IMPORT IKON VIEW (MATA)
} from "@heroicons/react/24/outline";

// Helper Lencana Status
const StatusBadge = ({ status }) => {
  let bgColor = "bg-gray-200";
  let textColor = "text-gray-800";
  let label = status;

  if (status === "Closed") {
    label = "Closed";
  } else if (status === "Rejected") {
    bgColor = "bg-red-100";
    textColor = "text-red-800";
    label = "Rejected";
  }
  return (
    <span
      className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${bgColor} ${textColor}`}
    >
      {label}
    </span>
  );
};

// Helper untuk memformat tanggal
const formatDate = (dateString) => {
  if (!dateString) return <span className="text-gray-400">N/A</span>;
  return moment(dateString).format("DD MMM YYYY");
};

function ArchivedJobPositionsTable({
  data = [],
  onDelete,
  onUnarchive,
  onViewDetail, // <-- 2. TAMBAH PROPS BARU UNTUK 'VIEW'
  sortColumn,
  sortDirection,
  onSort,
  isSelectMode,
  selectedPositions = [],
  setSelectedPositions,
  firstItemIndex = 0,
}) {
  // --- Handler Checkbox (Tiru CVsTable) ---
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
  // --- Batas Handler Checkbox ---

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No
              </th>
              <th
                className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort && onSort("name")}
              >
                Nama Posisi
                {sortColumn === "name" &&
                  (sortDirection === "asc" ? (
                    <ArrowUpIcon className="h-3 w-3 inline ml-1" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 inline ml-1" />
                  ))}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort && onSort("requestor")}
              >
                Requestor
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort && onSort("updatedAt")}
              >
                Tanggal Diarsip
                {sortColumn === "updatedAt" &&
                  (sortDirection === "asc" ? (
                    <ArrowUpIcon className="h-3 w-3 inline ml-1" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 inline ml-1" />
                  ))}
              </th>
              <th className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {" "}
                Aksi{" "}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data && data.length > 0 ? (
              data.map((pos, index) => {
                const rowNumber = firstItemIndex + index;
                return (
                  <tr
                    key={pos.id}
                    className={`transition duration-150 ease-in-out ${
                      selectedPositions.includes(pos.id) ? "bg-indigo-50" : "hover:bg-gray-50"
                    }`}
                  >
                    {isSelectMode && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                          checked={selectedPositions.includes(pos.id)}
                          onChange={(e) =>
                            handleCheckboxChange(pos.id, e.target.checked)
                          }
                          aria-label={`Select position ${pos.id}`}
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rowNumber}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900 max-w-[200px] truncate">
                      <div title={pos.name}>{pos.name}</div>
                      <div className="text-xs text-gray-500" title={pos.location}>
                        {pos.location}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[200px] truncate"
                      title={pos.requestor?.name}
                    >
                      {pos.requestor?.name || (
                        <span className="text-gray-400 italic">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(pos.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={pos.status} />
                    </td>
                    {/* --- 3. TAMBAHKAN TOMBOL VIEW --- */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-3">
                        {onViewDetail && (
                          <button
                            onClick={() => onViewDetail(pos)}
                            className="text-gray-500 hover:text-blue-600 p-1 rounded hover:bg-blue-50"
                            title="Lihat Detail Lowongan"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        )}
                        {onUnarchive && (
                          <button
                            onClick={() => onUnarchive([pos.id])}
                            className="text-gray-500 hover:text-green-600 p-1 rounded hover:bg-green-50"
                            title="Kembalikan (Unarchive)"
                          >
                            <ArrowUturnLeftIcon className="h-5 w-5" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(pos)}
                            className="text-gray-500 hover:text-red-600 p-1 rounded hover:bg-red-50"
                            title="Hapus Lowongan Permanen"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={isSelectMode ? 7 : 6}
                  className="px-6 py-8 whitespace-nowrap text-center text-sm text-gray-500"
                >
                  Tidak ada data arsip lowongan yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ArchivedJobPositionsTable;