import React from 'react';
import moment from 'moment';
import { CalendarDaysIcon, HandThumbUpIcon, ClockIcon } from '@heroicons/react/24/outline';

function FinalScheduleTable({ data, user, statusMap, onOpenSchedule }) {
  
  const formatDisplayDateTime = (isoString) => {
    if (!isoString) return "N/A";
    return moment(isoString).format("DD MMM, HH:mm");
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-purple-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase">Kandidat</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase">Posisi</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase">Review Manajer</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase">Jadwal & Link</th>
            <th className="px-6 py-3 text-right text-xs font-bold text-purple-800 uppercase">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-8 text-center text-gray-500 italic">
                Belum ada kandidat yang lolos ke tahap final.
              </td>
            </tr>
          ) : (
            data.map((cv) => {
              const notes = cv.interview_notes || {};
              const isScheduled = cv.status === 'FINAL_INTERVIEW_SCHEDULED';
              const statusInfo = statusMap[cv.status] || { label: cv.status, color: "bg-gray-100 text-gray-800" };

              return (
                <tr key={cv.id} className="hover:bg-gray-50 transition-colors">
                  {/* Kolom 1: Kandidat */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{cv.fullName}</div>
                    <div className="text-xs text-gray-500">{cv.email}</div>
                  </td>

                  {/* Kolom 2: Posisi */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {cv.qualification}
                  </td>

                  {/* Kolom 3: Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  
                  {/* Kolom 4: Review Manajer (Penting untuk Konteks) */}
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <HandThumbUpIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-green-700 uppercase">HIRED</span>
                        {notes.manager_feedback ? (
                          <p className="text-xs text-gray-500 mt-1 italic line-clamp-2 max-w-[150px]" title={notes.manager_feedback}>
                            "{notes.manager_feedback}"
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400 mt-1 italic">No feedback</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Kolom 5: Jadwal Final & Link (Logika Cerdas) */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {(() => {
                      // 1. Jika masih pending (belum dijadwalkan final), sembunyikan info lama
                      if (cv.status === 'PENDING_FINAL_DECISION') {
                        return <span className="text-xs italic text-gray-400 flex items-center"><ClockIcon className="h-3 w-3 mr-1"/> Menunggu Jadwal...</span>;
                      }

                      // 2. Jika sudah dijadwalkan final
                      if (isScheduled) {
                        return (
                          <div>
                            <div className="font-bold text-purple-700 mb-1">
                              {formatDisplayDateTime(notes.scheduled_time)}
                            </div>
                            
                            {notes.preference === 'Offline' ? (
                                <span className="text-xs font-medium text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                  📍 Kantor
                                </span>
                              ) : (
                                notes.schedule_link ? (
                                  <a 
                                    href={notes.schedule_link} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center hover:underline"
                                  >
                                    📹 Link Google Meet
                                  </a>
                                ) : (
                                  <span className="text-xs italic text-gray-400 animate-pulse">Link generating...</span>
                                )
                              )}
                          </div>
                        );
                      }
                      
                      return "-";
                    })()}
                  </td>

                  {/* Kolom 6: Aksi */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => onOpenSchedule(cv, 'final')} 
                      className="bg-white border border-purple-300 text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-md shadow-sm flex items-center justify-center ml-auto text-xs transition-colors font-medium"
                    >
                      <CalendarDaysIcon className="h-4 w-4 mr-1.5" /> 
                      {isScheduled ? 'Reschedule' : 'Buat Jadwal'}
                    </button>
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

export default FinalScheduleTable;