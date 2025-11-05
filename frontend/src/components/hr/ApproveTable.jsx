// src/components/hr/ApproveTable.jsx
import React from 'react';
import moment from 'moment';
import { CheckCircleIcon, XCircleIcon, EyeIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
// Jalankan: npm install html-react-parser
import parse from 'html-react-parser';

function ApproveTable({ data, isLoading, error, onApprove, onReject, onViewDetails }) {
  
  if (isLoading) {
    return <div className="text-center p-4 text-gray-600">Memuat antrian persetujuan...</div>;
  }
  
  if (error) {
    return <div className="text-center p-4 text-red-600">{error}</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 border-2 border-dashed rounded-lg">
        <CheckBadgeIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">Antrian Kosong</h3>
        <p className="text-gray-600 mt-1">
          Tidak ada permintaan lowongan (Draft) baru yang menunggu persetujuan Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Peminta (Requestor)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Posisi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kebutuhan Teknis (Singkat)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal Diajukan
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {request.requestor?.name || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Dept: {request.requestor?.department || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {request.name}
                  <p className="text-xs text-gray-500">{request.location} | {request.availableSlots} Slot</p>
                </td>
                <td className="px-6 py-4">
                  <div 
                    className="text-sm text-gray-600 max-w-xs truncate"
                    title={request.specificRequirements?.replace(/<[^>]+>/g, '') || ''}
                  >
                    {parse(request.specificRequirements || '<i>Tidak ada detail</i>')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {moment(request.createdAt).format('DD MMM YYYY, HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={() => onReject(request)}
                      className="text-red-600 hover:text-red-900"
                      title="Tolak Permintaan"
                    >
                      <XCircleIcon className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => onApprove(request)}
                      className="text-green-600 hover:text-green-900"
                      title="Setujui Permintaan"
                    >
                      <CheckCircleIcon className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => onViewDetails(request)}
                      className="text-gray-400 hover:text-gray-700"
                      title="Lihat Detail Kebutuhan"
                    >
                      <EyeIcon className="h-6 w-6" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ApproveTable;