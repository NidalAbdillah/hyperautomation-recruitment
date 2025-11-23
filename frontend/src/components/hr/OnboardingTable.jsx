import React from 'react';
import { 
  PaperAirplaneIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  EyeIcon 
} from '@heroicons/react/24/outline';

function OnboardingTable({ data, onOpenSchedule, onViewDetail }) {
  
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg shadow border border-gray-200 text-center">
        <p className="text-gray-500 italic">Tidak ada data untuk ditampilkan.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-teal-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">Karyawan Baru</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">Posisi</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">Tanggal Diterima</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">Riwayat Seleksi</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">Status Onboarding</th>
            <th className="px-6 py-3 text-right text-xs font-bold text-teal-800 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map(app => {
             const notes = app.interview_notes || {};
             const hiredDate = notes.decision_date ? new Date(notes.decision_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
             
             return (
              <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                {/* Nama & Email */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-bold text-gray-900">{app.fullName}</div>
                  <div className="text-xs text-gray-500">{app.email}</div>
                </td>

                {/* Posisi */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span className="bg-gray-100 text-gray-800 py-1 px-2 rounded-md font-medium">
                    {app.qualification}
                  </span>
                </td>

                {/* Tanggal Diterima (Decision Date) */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {hiredDate}
                </td>
                
                {/* 🔥 FITUR BARU: Lihat Detail Riwayat */}
                <td className="px-6 py-4 whitespace-nowrap">
                   <button 
                     onClick={() => onViewDetail(app)}
                     className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center transition-colors"
                   >
                     <EyeIcon className="h-4 w-4 mr-1" /> Lihat Hasil Tes
                   </button>
                </td>

                {/* Status Onboarding */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {app.status === 'ONBOARDING' ? (
                     <div>
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
                         <CheckCircleIcon className="h-3 w-3 mr-1"/> Undangan Terkirim
                       </span>
                       <div className="text-xs text-gray-500 mt-1 ml-1">
                         Jadwal: {notes.scheduled_time ? new Date(notes.scheduled_time).toLocaleDateString('id-ID') : '-'}
                       </div>
                     </div>
                  ) : (
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                       <ClockIcon className="h-3 w-3 mr-1"/> Menunggu Proses
                     </span>
                  )}
                </td>

                {/* Tombol Aksi */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {app.status === 'HIRED' && (
                    <button 
                      onClick={() => onOpenSchedule(app)} 
                      className="bg-teal-600 text-white px-3 py-1.5 rounded-md hover:bg-teal-700 shadow-sm flex items-center justify-center ml-auto text-xs transition-colors font-medium"
                    >
                      <PaperAirplaneIcon className="h-4 w-4 mr-1.5" /> 
                      Kirim Onboarding
                    </button>
                  )}
                  {app.status === 'ONBOARDING' && (
                     <button 
                      onClick={() => onOpenSchedule(app)} 
                      className="text-gray-500 hover:text-teal-600 text-xs underline ml-auto block transition-colors"
                     >
                      Reschedule Orientasi
                     </button>
                  )}
                </td>
              </tr>
             );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default OnboardingTable;