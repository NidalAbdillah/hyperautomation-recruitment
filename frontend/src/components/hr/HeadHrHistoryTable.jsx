import React from 'react';
import { HandThumbUpIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';

function HeadHrHistoryTable({ data, onViewDetail }) {
  
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow border border-gray-200 text-center">
        <p className="text-gray-500 italic">Belum ada riwayat keputusan.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Kandidat</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Keputusan Anda</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Detail Feedback</th>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Tanggal</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map(app => (
            <tr key={app.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-bold text-gray-900">{app.fullName}</div>
                <div className="text-xs text-gray-500">{app.qualification}</div>
              </td>
              
              <td className="px-6 py-4">
                {app.status === 'HIRED' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    <HandThumbUpIcon className="h-3 w-3 mr-1"/> DITERIMA
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                    <XCircleIcon className="h-3 w-3 mr-1"/> DITOLAK
                  </span>
                )}
              </td>
              
              <td className="px-6 py-4">
                 <button 
                   onClick={() => onViewDetail(app)}
                   className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center transition-colors"
                 >
                   <EyeIcon className="h-4 w-4 mr-1" /> Lihat Detail
                 </button>
              </td>

              <td className="px-6 py-4 text-right text-sm text-gray-500">
                {app.interview_notes?.decision_date ? new Date(app.interview_notes.decision_date).toLocaleDateString('id-ID') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HeadHrHistoryTable;