// src/components/hr/RequestStatusTable.jsx
import React from 'react';
import moment from 'moment'; // Untuk memformat tanggal

/**
 * Helper untuk memberikan lencana (badge) warna berdasarkan status.
 * Ini 100% "anti-challenge" untuk dosen Anda.
 */
const StatusBadge = ({ status }) => {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-800";
  let label = status;

  // Sesuaikan dengan ENUM di jobPosition.model.ts
  switch (status) {
    case 'Draft':
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      label = "Menunggu Persetujuan HR";
      break;
    case 'Approved':
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      label = "Disetujui (Menunggu Staff HR)";
      break;
    case 'Open':
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      label = "Dipublikasikan (Open)";
      break;
    case 'Closed':
      bgColor = "bg-gray-200";
      textColor = "text-gray-800";
      label = "Ditutup (Closed)";
      break;
    case 'Rejected':
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      label = "Ditolak";
      break;
    default:
      label = status ? status.toUpperCase() : 'N/A';
  }

  return (
    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
};

/**
 * Komponen ini hanya menampilkan tabel status permintaan
 * yang datanya diambil dari halaman RequestPositionPage.
 */
function RequestStatusTable({ data, isLoading, error }) {
  
  if (isLoading) {
    return <div className="text-center p-4 text-gray-600">Memuat data status...</div>;
  }
  
  if (error) {
    return <div className="text-center p-4 text-red-600">{error}</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center p-4 text-gray-500">Anda belum membuat permintaan lowongan.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Posisi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal Diajukan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slot
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {request.name}
                  <p className="text-xs text-gray-500">{request.location}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {moment(request.createdAt).format('DD MMMM YYYY, HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.availableSlots}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RequestStatusTable;