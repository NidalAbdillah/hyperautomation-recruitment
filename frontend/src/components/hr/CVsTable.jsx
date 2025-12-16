import React from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

// Helper Component for Tooltip
const Tooltip = ({ text, children }) => {
  return (
    <div className="relative group flex items-center">
      {children}
      <span className="absolute bottom-full mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none whitespace-normal break-words">
        {text}
      </span>
    </div>
  );
};

// Color mappings
const STATUS_DISPLAY_MAP = {
  "SUBMITTED":    { label: "Submitted", color: "bg-gray-100 text-gray-800" },
  "REVIEWED":     { label: "Reviewed (AI)", color: "bg-blue-100 text-blue-800" },
  "STAFF_APPROVED": { label: "Approved (Staff)", color: "bg-cyan-100 text-cyan-800" },
  "STAFF_REJECTED": { label: "Rejected (Staff)", color: "bg-red-100 text-red-800" },
  "INTERVIEW_QUEUED":    { label: "In Queue (Manager)", color: "bg-yellow-100 text-yellow-800" },
  "INTERVIEW_SCHEDULED": { label: "Scheduled (Manager)", color: "bg-purple-100 text-purple-800" },
  "PENDING_FINAL_DECISION": { label: "Final Review (HR)", color: "bg-indigo-100 text-indigo-800" },
  "FINAL_INTERVIEW_SCHEDULED": { label: "Final Scheduled (HR)", color: "bg-green-100 text-green-800" }, // ✅ TAMBAH INI
  "HIRED":      { label: "Hired", color: "bg-green-100 text-green-800" },
  "NOT_HIRED":  { label: "Not Hired", color: "bg-red-100 text-red-800" },
  "ONBOARDING": { label: "Onboarding", color: "bg-green-100 text-green-800" },
};
const defaultStatusDisplay = { label: "Unknown", color: "bg-gray-100 text-gray-800" };

const RECOMMENDATION_COLOR_MAP = {
  "HIGHLY RECOMMENDED": "text-green-700 font-semibold",
  "CONSIDER": "text-yellow-700 font-semibold",
  "REJECT": "text-red-700 font-semibold",
  "N/A": "text-gray-500",
};

function CVsTable({
  data = [],
  onViewDetail,
  onDeleteCV,
  onDownloadCV,
  onStatusChangeDirectly,
  sortColumn,
  sortDirection,
  onSort,
  isSelectMode, // Menggunakan isSelectMode
  selectedCVs = [],
  setSelectedCVs,
  firstItemIndex = 0,
}) {

  // Format date function
  const formatDisplayDateTime = (isoString) => {
    if (!isoString) return "N/A";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "Invalid Date";
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${hours}:${minutes} ${day}/${month}/${year}`;
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Error";
    }
  };

  // Handler for status dropdown change
  const handleDropdownStatusChange = (cv, event) => {
    const newStatus = event.target.value;
    const isDisabled = cv.status !== "REVIEWED";
    if (!isDisabled && (newStatus === "STAFF_APPROVED" || newStatus === "STAFF_REJECTED") && onStatusChangeDirectly) {
      onStatusChangeDirectly(cv, newStatus);
    } else {
      console.warn("Dropdown change ignored. Status:", newStatus, "IsDisabled:", isDisabled);
    }
  };

  // Handler for individual checkbox change
  const handleCheckboxChange = (cvId, isChecked) => {
    if (!setSelectedCVs) return;
    setSelectedCVs((prevSelected) => {
      if (isChecked) {
        return [...new Set([...prevSelected, cvId])];
      } else {
        return prevSelected.filter((id) => id !== cvId);
      }
    });
  };

  // Handler for "Check All" checkbox change
  const handleCheckAllChange = (event) => {
    if (!setSelectedCVs) return;
    const idsOnPage = data.map((cv) => cv.id); // Pilih semua di halaman ini
    if (event.target.checked) {
      setSelectedCVs((prevSelected) => [...new Set([...prevSelected, ...idsOnPage])]);
    } else {
      setSelectedCVs((prevSelected) => prevSelected.filter((id) => !idsOnPage.includes(id)));
    }
  };

  // Determine state for "Check All" checkbox
  const isCheckAllChecked =
    data.length > 0 &&
    data.every((cv) => selectedCVs.includes(cv.id));
  const isIndeterminate =
    !isCheckAllChecked &&
    data.some((cv) => selectedCVs.includes(cv.id));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Checkbox Header (conditional based on isSelectMode) */}
              {isSelectMode && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500" // Ganti warna jadi indigo
                    checked={isCheckAllChecked}
                    onChange={handleCheckAllChange}
                    ref={(input) => { if (input) input.indeterminate = isIndeterminate; }}
                    disabled={data.length === 0}
                    aria-label="Select all applications on this page"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => onSort && onSort("fullName")}>
                Nama & Email
                {sortColumn === "fullName" && (sortDirection === "asc" ? <ArrowUpIcon className="h-3 w-3 inline ml-1" /> : <ArrowDownIcon className="h-3 w-3 inline ml-1" />)}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => onSort && onSort("qualification")}>
                Kualifikasi Pelamar
                {sortColumn === "qualification" && (sortDirection === "asc" ? <ArrowUpIcon className="h-3 w-3 inline ml-1" /> : <ArrowDownIcon className="h-3 w-3 inline ml-1" />)}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => onSort && onSort("createdAt")}>
                Tanggal Apply
                {sortColumn === "createdAt" && (sortDirection === "asc" ? <ArrowUpIcon className="h-3 w-3 inline ml-1" /> : <ArrowDownIcon className="h-3 w-3 inline ml-1" />)}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => onSort && onSort("similarity_score")}>
                Similarity Score
                {sortColumn === "similarity_score" && (sortDirection === "asc" ? <ArrowUpIcon className="h-3 w-3 inline ml-1" /> : <ArrowDownIcon className="h-3 w-3 inline ml-1" />)}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => onSort && onSort("passed_hard_gate")}>
                Pass Gate?
                 {sortColumn === "passed_hard_gate" && (sortDirection === "asc" ? <ArrowUpIcon className="h-3 w-3 inline ml-1" /> : <ArrowDownIcon className="h-3 w-3 inline ml-1" />)}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => onSort && onSort("final_recommendation")}>
                AI Recommendation
                 {sortColumn === "final_recommendation" && (sortDirection === "asc" ? <ArrowUpIcon className="h-3 w-3 inline ml-1" /> : <ArrowDownIcon className="h-3 w-3 inline ml-1" />)}
              </th>
              <th className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {/* Kolom Aksi & Update selalu ada di halaman aktif */}
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"> Aksi </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Update Lamaran </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data && data.length > 0 ? (
              data.map((cv, index) => {
                const isStatusDropdownDisabled = cv.status !== "REVIEWED";
                const rowNumber = firstItemIndex + index;
                const assessment = cv.qualitative_assessment;
                const recommendation = assessment?.final_recommendation || "N/A";
                const assessmentText = assessment?.overall_assessment || (assessment ? "Assessment details missing." : "No AI assessment available yet.");

                return (
                  <tr key={cv.id} className={`transition duration-150 ease-in-out ${selectedCVs.includes(cv.id) ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                    {/* Checkbox Cell (conditional based on isSelectMode) */}
                    {isSelectMode && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500" // Warna indigo
                          checked={selectedCVs.includes(cv.id)}
                          onChange={(e) => handleCheckboxChange(cv.id, e.target.checked)}
                          aria-label={`Select application ${cv.id}`}
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rowNumber}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900 max-w-[200px] truncate">
                      <div title={cv.fullName}>{cv.fullName}</div>
                      <div className="text-xs text-gray-500" title={cv.email}>{cv.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[200px] truncate" title={cv.qualification}>
                      {cv.qualification}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDisplayDateTime(cv.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                      {typeof cv.similarity_score === 'number' ? cv.similarity_score.toFixed(4) : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {cv.passed_hard_gate === true ? (
                        <CheckCircleIcon className="h-6 w-6 text-green-500 inline" title="Passed"/>
                      ) : cv.passed_hard_gate === false ? (
                        <XCircleIcon className="h-6 w-6 text-red-500 inline" title="Failed"/>
                      ) : (
                        <span className="text-gray-400" title="Not Processed">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-1">
                        <span className={RECOMMENDATION_COLOR_MAP[recommendation] || "text-gray-500"}>
                          {recommendation.replace(/_/g, ' ')}
                        </span>
                        {assessment && (
                          <Tooltip text={assessmentText}>
                            <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-help"/>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const statusInfo = STATUS_DISPLAY_MAP[cv.status] || defaultStatusDisplay;
                        return (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-3">
                        {cv.cvFileObjectKey && onViewDetail && (
                          <button onClick={() => onViewDetail(cv)} className="text-gray-600 hover:text-indigo-600 inline-flex items-center p-1 rounded hover:bg-indigo-50" title="Open CV">
                            <DocumentTextIcon className="h-5 w-5 mr-1" />
                            <span className="text-xs">Open</span>
                          </button>
                        )}
                        {cv.cvFileObjectKey && onDownloadCV && (
                          <button onClick={() => onDownloadCV(cv)} className="text-gray-500 hover:text-blue-600 p-1 rounded hover:bg-blue-50" title={`Download CV ${cv.fullName}`}>
                            <ArrowDownTrayIcon className="h-5 w-5" />
                          </button>
                        )}
                        {onDeleteCV && (
                           <button onClick={() => onDeleteCV(cv)} className="text-gray-500 hover:text-red-600 p-1 rounded hover:bg-red-50" title="Hapus CV">
                             <TrashIcon className="h-5 w-5" />
                           </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select
                        aria-label={`Update status for ${cv.fullName}`}
                        value={(cv.status === "STAFF_APPROVED" || cv.status === "STAFF_REJECTED") ? cv.status : ""}
                        onChange={(e) => handleDropdownStatusChange(cv, e)}
                        disabled={isStatusDropdownDisabled}
                        className={`block w-full pl-3 pr-8 py-1 border text-xs rounded-md focus:outline-none focus:ring-1 ${
                          isStatusDropdownDisabled
                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white border-gray-300 text-gray-700 focus:ring-red-500 focus:border-red-500 hover:border-gray-400"
                        }`}
                      >
                        {!(cv.status === "STAFF_APPROVED" || cv.status === "STAFF_REJECTED") && (
                          <option value="" disabled>
                            Pilih Status...
                          </option>
                        )}
                        <option value="STAFF_APPROVED">Approved (staff)</option>
                        <option value="STAFF_REJECTED">Rejected (staff)</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={isSelectMode ? 12 : 11} className="px-6 py-8 whitespace-nowrap text-center text-sm text-gray-500">
                  Tidak ada aplikasi CV yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CVsTable;