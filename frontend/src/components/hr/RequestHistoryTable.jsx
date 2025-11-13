// src/components/hr/RequestHistoryTable.jsx
import React from "react";
import moment from "moment";

// Helper Lencana Status (dicopy dari JobPositionsTable)
const StatusBadge = ({ status }) => {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-800";
  let label = status;

  switch (status) {
    case "DRAFT":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      label = "Draft (Waiting Approval)";
      break;
    case "APPROVED":
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      label = "Approved (Ready to Open)";
      break;
    case "OPEN":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      label = "Published (Open)";
      break;
    case "CLOSED":
      bgColor = "bg-gray-200";
      textColor = "text-gray-800";
      label = "Closed";
      break;
    case "REJECTED":
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      label = "REJECTED";
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

// Helper untuk memformat tanggal
const formatDate = (dateString) => {
  if (!dateString) return <span className="text-gray-400">N/A</span>;
  return moment(dateString).format("DD MMM YYYY");
};

/**
 * Tabel Read-Only untuk Kepala Department melacak riwayat permintaannya.
 */
function RequestHistoryTable({ data }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posisi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal Publikasi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slot
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data && data.length > 0 ? (
              data.map((position) => (
                <tr key={position.id} className="hover:bg-gray-50">
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
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4} // Sesuaikan colSpan
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Tidak ada data permintaan lowongan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RequestHistoryTable;
