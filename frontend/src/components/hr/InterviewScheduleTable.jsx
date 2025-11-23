import React from 'react';
import moment from 'moment';
import { ClockIcon, PencilIcon, CheckCircleIcon, CalendarDaysIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

function InterviewScheduleTable({ 
  data, 
  user, 
  statusMap, 
  defaultStatusDisplay,
  onOpenSchedule, 
  onOpenFeedback,
  tableType // 'manager' | 'final'
}) {

  const formatDisplayDateTime = (isoString) => {
    if (!isoString) return "N/A";
    return moment(isoString).format("DD MMM YYYY, HH:mm");
  };

  const renderActionButtons = (cv) => {
    const status = cv.status;
    const role = user?.role;

    // --- LOGIKA TAB 1: WAWANCARA MANAJER ---
    if (tableType === 'manager') {
      // Tugas Staff HR: Menjadwalkan
      if (role === 'staff_hr' && status === 'INTERVIEW_QUEUED') {
        return (
          <button 
            onClick={() => onOpenSchedule(cv, 'manager')}
            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
            title="Jadwalkan wawancara ini"
          >
            <CalendarDaysIcon className="h-5 w-5" /> Jadwalkan
          </button>
        );
      }
      // Tugas Manajer: Memberi Feedback
      if (role === 'manager' && status === 'INTERVIEW_SCHEDULED') {
        return (
          <button 
            onClick={() => onOpenFeedback(cv)}
            className="text-green-600 hover:text-green-900 flex items-center gap-1"
            title="Beri umpan balik wawancara"
          >
            <PencilIcon className="h-5 w-5" /> Feedback
          </button>
        );
      }
    }

    // --- LOGIKA TAB 2: KEPUTUSAN FINAL HR ---
    if (tableType === 'final') {
      
      // 2a. Staff/Head HR: Jadwalkan Wawancara Final
      if ((role === 'staff_hr' || role === 'head_hr') && status === 'PENDING_FINAL_DECISION') {
        return (
          <button 
            onClick={() => onOpenSchedule(cv, 'final')}
            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
            title="Jadwalkan wawancara final dengan Kepala HR"
          >
            <CalendarDaysIcon className="h-5 w-5" /> Jadwalkan (Final)
          </button>
        );
      }

      // 2b. Kepala HR: Beri Keputusan Final (setelah wawancara)
      if (role === 'head_hr' && status === 'FINAL_INTERVIEW_SCHEDULED') {
        return (
          <button 
            onClick={() => onOpenFeedback(cv)}
            className="text-green-600 hover:text-green-900 flex items-center gap-1"
            title="Beri keputusan final (Hire / Not Hire)"
          >
            <CheckCircleIcon className="h-5 w-5" /> Keputusan Final
          </button>
        );
      }

      // 2c. Staff HR: Proses Onboarding
      if (role === 'staff_hr' && status === 'HIRED') {
        return (
          <button 
            onClick={() => onOpenSchedule(cv, 'onboarding')}
            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
            title="Kirim email/undangan onboarding"
          >
            <PaperAirplaneIcon className="h-5 w-5" /> Kirim Onboarding
          </button>
        );
      }

      // 2d. Status Selesai
      if (status === 'NOT_HIRED' || status === 'ONBOARDING') {
        return (
          <span className="text-xs italic text-gray-500">
            Proses Selesai
          </span>
        );
      }
    }

    // Default (tidak ada aksi)
    return <ClockIcon className="h-5 w-5 text-gray-400" title="Menunggu..." />;
  };

  if (data.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 border-2 border-dashed rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900">Antrian Kosong</h3>
        <p className="text-gray-600 mt-1">
          Tidak ada kandidat yang menunggu di tahap ini.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kandidat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posisi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail (dari Manajer)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi / Link</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((cv) => {
              const statusInfo = statusMap[cv.status] || defaultStatusDisplay;
              const notes = cv.interview_notes || {};

              return (
                <tr key={cv.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{cv.fullName}</div>
                    <div className="text-xs text-gray-500">{cv.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cv.qualification}</td>
                  
                  {/* 🔥 PERBAIKAN KOLOM STATUS & TANGGAL */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    {/* ✅ Hanya tampilkan tanggal jika sudah SCHEDULED (bukan Queued/Pending) */}
                    {(cv.status === 'INTERVIEW_SCHEDULED' || cv.status === 'FINAL_INTERVIEW_SCHEDULED') && (
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDisplayDateTime(notes.scheduled_time)}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {notes.preference && (
                      <div className="text-xs">
                        <span className="font-semibold">Request:</span> {notes.preference}
                      </div>
                    )}
                    {notes.manager_decision && (
                       <div className="text-xs mt-1">
                        <span className="font-semibold">Rec:</span> 
                        <span className={notes.manager_decision === 'Hire' ? 'text-green-600' : 'text-red-600'}>
                          {` ${notes.manager_decision}`}
                        </span>
                      </div>
                    )}
                  </td>
                  
                  {/* 🔥 PERBAIKAN KOLOM LOKASI/LINK */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {(() => {
                      const preference = notes?.preference;
                      const link = notes?.schedule_link;
                      
                      // ✅ PERBAIKAN 1: Sembunyikan Link Lama saat masuk antrian baru
                      if (cv.status === 'INTERVIEW_QUEUED' || cv.status === 'PENDING_FINAL_DECISION') {
                        return (
                          <span className="text-xs italic text-gray-500">
                            {cv.status === 'INTERVIEW_QUEUED' 
                              ? 'Menunggu Jadwal Manajer...' 
                              : 'Menunggu Jadwal Final (HR)...'}
                          </span>
                        );
                      }
                      
                      // Logika biasa untuk status SCHEDULED
                      if (preference === 'Offline') {
                        return (
                          <span className="font-medium text-gray-800">
                            Offline (Kantor PT. Tech XYZ)
                          </span>
                        );
                      }
                      
                      if (preference === 'Online' && link) {
                        return (
                          <a 
                            href={link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            Google Meet Link
                          </a>
                        );
                      }

                      return (
                        <span className="text-xs italic text-gray-500">
                          Online (Menunggu Link...)
                        </span>
                      );
                    })()}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {renderActionButtons(cv)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InterviewScheduleTable;