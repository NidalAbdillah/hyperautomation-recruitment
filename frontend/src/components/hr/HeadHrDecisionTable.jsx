import React from 'react';
import { 
  CheckBadgeIcon, 
  XCircleIcon, 
  HandThumbUpIcon, 
  CalendarDaysIcon,
  BriefcaseIcon 
} from '@heroicons/react/24/outline';

function HeadHrDecisionTable({ candidates, onDecide }) {

  if (!candidates || candidates.length === 0) {
    return (
      <div className="bg-white p-16 rounded-lg shadow text-center border-dashed border-2 border-gray-300">
        <BriefcaseIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Tugas Selesai</h3>
        <p className="text-gray-500 mt-1">Tidak ada kandidat yang menunggu keputusan final saat ini.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Kandidat</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Posisi</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Review Teknis (Manager)</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Jadwal Final</th>
            <th className="px-6 py-3 text-right text-xs font-bold text-blue-800 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {candidates.map((app) => {
            const notes = app.interview_notes || {};
            const managerDecision = notes.manager_decision || '-';
            
            return (
              <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                {/* Kolom 1: Nama & Email */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                      {app.fullName.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900">{app.fullName}</div>
                      <div className="text-xs text-gray-500">{app.email}</div>
                    </div>
                  </div>
                </td>

                {/* Kolom 2: Posisi */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span className="bg-gray-100 text-gray-800 py-1 px-2 rounded-md font-medium">
                    {app.qualification}
                  </span>
                </td>
                
                {/* Kolom 3: Hasil Manager (Penting buat Head HR) */}
                <td className="px-6 py-4">
                  <div className="flex items-start p-2 bg-gray-50 rounded-md border border-gray-100">
                    <div className={`flex-shrink-0 h-5 w-5 mt-0.5 ${managerDecision === 'Hire' ? 'text-green-500' : 'text-red-500'}`}>
                      {managerDecision === 'Hire' ? <HandThumbUpIcon /> : <XCircleIcon />}
                    </div>
                    <div className="ml-2">
                      <span className={`text-xs font-bold uppercase ${managerDecision === 'Hire' ? 'text-green-700' : 'text-red-700'}`}>
                        {managerDecision}
                      </span>
                      {notes.manager_feedback ? (
                        <p className="text-xs text-gray-600 mt-1 italic line-clamp-2" title={notes.manager_feedback}>
                          "{notes.manager_feedback}"
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-1 italic">Tidak ada catatan.</p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Kolom 4: Info Jadwal Final */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-4 w-4 mr-1 text-gray-400"/>
                    <span className="font-medium">
                      {notes.scheduled_time ? new Date(notes.scheduled_time).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }) : '-'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 ml-5">
                    {notes.preference === 'Online' ? '📹 Online (GMeet)' : '📍 Offline (Kantor)'}
                  </div>
                </td>

                {/* Kolom 5: Tombol Aksi */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onDecide(app)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow-sm flex items-center justify-center ml-auto transition-all"
                  >
                    <CheckBadgeIcon className="h-5 w-5 mr-1" />
                    Final Decision
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default HeadHrDecisionTable;