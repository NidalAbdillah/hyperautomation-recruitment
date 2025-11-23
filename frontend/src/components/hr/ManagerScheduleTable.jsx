import React from 'react';
import moment from 'moment';
import { CalendarDaysIcon, PencilIcon, ClockIcon } from '@heroicons/react/24/outline';

function ManagerScheduleTable({ data, user, statusMap, onOpenSchedule, onOpenFeedback }) {
  
  const formatDisplayDateTime = (isoString) => {
    if (!isoString) return "N/A";
    return moment(isoString).format("DD MMM YYYY, HH:mm");
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Kandidat</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Posisi</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Lokasi / Link</th>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">
                Tidak ada antrian untuk wawancara manajer.
              </td>
            </tr>
          ) : (
            data.map((cv) => {
              const notes = cv.interview_notes || {};
              const statusInfo = statusMap[cv.status] || { label: cv.status, color: "bg-gray-100" };

              return (
                <tr key={cv.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{cv.fullName}</div>
                    <div className="text-xs text-gray-500">{cv.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{cv.qualification}</td>
                  
                  {/* Kolom Status & Tanggal */}
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    {/* Hanya tampilkan tanggal jika sudah terjadwal */}
                    {cv.status === 'INTERVIEW_SCHEDULED' && (
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDisplayDateTime(notes.scheduled_time)}
                      </div>
                    )}
                  </td>

                  {/* Kolom Lokasi / Link (Logika Cerdas) */}
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {(() => {
                      // 1. Jika masih antrian, sembunyikan info lama
                      if (cv.status === 'INTERVIEW_QUEUED') {
                        return <span className="text-xs italic text-gray-500">Menunggu Jadwal Manajer...</span>;
                      }

                      // 2. Jika Offline
                      if (notes.preference === 'Offline') {
                        return <span className="font-medium text-gray-800">📍 Kantor PT. Tech XYZ</span>;
                      }

                      // 3. Jika Online & Ada Link
                      if (notes.preference === 'Online' && notes.schedule_link) {
                        return (
                          <a 
                            href={notes.schedule_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            📹 Google Meet Link
                          </a>
                        );
                      }

                      return <span className="text-xs italic text-gray-400">Menunggu Link...</span>;
                    })()}
                  </td>

                  {/* Kolom Aksi */}
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    {/* Staff HR: Jadwalkan */}
                    {cv.status === 'INTERVIEW_QUEUED' && user.role === 'staff_hr' && (
                      <button 
                        onClick={() => onOpenSchedule(cv)} 
                        className="text-blue-600 hover:text-blue-900 flex items-center justify-end ml-auto"
                      >
                        <CalendarDaysIcon className="h-5 w-5 mr-1" /> Jadwalkan
                      </button>
                    )}
                    
                    {/* Manager: Feedback */}
                    {cv.status === 'INTERVIEW_SCHEDULED' && user.role === 'manager' && (
                      <button 
                        onClick={() => onOpenFeedback(cv)} 
                        className="text-green-600 hover:text-green-900 flex items-center justify-end ml-auto"
                      >
                        <PencilIcon className="h-5 w-5 mr-1" /> Isi Feedback
                      </button>
                    )}
                    
                    {/* Menunggu */}
                    {cv.status === 'INTERVIEW_SCHEDULED' && user.role === 'staff_hr' && (
                      <span className="text-gray-400 flex items-center justify-end gap-1 cursor-default">
                        <ClockIcon className="h-5 w-5" /> Menunggu Manajer
                      </span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ManagerScheduleTable;