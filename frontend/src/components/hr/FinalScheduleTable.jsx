import React, { useState } from 'react';
import moment from 'moment';
import parse from 'html-react-parser'; // ✅ Wajib pakai ini biar Modal rapi (bebas tag HTML)
import { 
  CalendarDaysIcon, 
  HandThumbUpIcon, 
  ClockIcon, 
  XMarkIcon,
  EyeIcon 
} from '@heroicons/react/24/outline';

// Modal untuk view full review (Dengan Formatting HTML yang Benar)
const ReviewModal = ({ isOpen, onClose, feedback, candidateName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 bg-gray-50 rounded-t-lg">
          <div>
            <h3 className="text-lg font-bold text-gray-900">📋 Review Manajer</h3>
            <p className="text-sm text-gray-500 mt-1">Kandidat: <span className="font-semibold text-gray-700">{candidateName}</span></p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition p-1 hover:bg-red-50 rounded-full"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content: Render HTML Disini */}
        <div className="px-6 py-6 overflow-y-auto">
          {/* Class 'prose' membuat list (<ul>/<ol>) dan bold (<b>) tampil benar */}
          <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded border border-gray-200">
             {feedback ? parse(feedback) : <i className="text-gray-400">Tidak ada catatan.</i>}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end bg-white rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-md font-medium transition shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

function FinalScheduleTable({ data, user, statusMap, onOpenSchedule }) {
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    feedback: '',
    candidateName: ''
  });

  const formatDisplayDateTime = (isoString) => {
    if (!isoString) return "N/A";
    return moment(isoString).format("DD MMM, HH:mm");
  };

  const handleViewReview = (feedback, candidateName) => {
    setReviewModal({
      isOpen: true,
      feedback, // Kirim HTML mentah ke modal
      candidateName
    });
  };

  return (
    <>
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
                const rawFeedback = notes.manager_feedback || '';

                return (
                  <tr key={cv.id} className="hover:bg-gray-50 transition-colors">
                    {/* 1. Kandidat */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cv.fullName}</div>
                      <div className="text-xs text-gray-500">{cv.email}</div>
                    </td>

                    {/* 2. Posisi */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {cv.qualification}
                    </td>

                    {/* 3. Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    
                    {/* 4. Review Manajer (TAMPILAN BARU: 2 BARIS) */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1.5">
                        {/* Baris 1: Status Icon */}
                        <div className="flex items-center gap-1.5">
                            <HandThumbUpIcon className="h-5 w-5 text-green-500" />
                            <span className="text-xs font-bold text-green-700 uppercase tracking-wide">HIRED</span>
                        </div>
                        
                        {/* Baris 2: Tombol View (Langsung dibawah) */}
                        {rawFeedback && (
                            <button
                              onClick={() => handleViewReview(rawFeedback, cv.fullName)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center transition-colors"
                            >
                              <EyeIcon className="h-3 w-3 mr-1"/>
                              Lihat Detail Assessment
                            </button>
                        )}
                      </div>
                    </td>

                    {/* 5. Jadwal Final */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {(() => {
                        if (cv.status === 'PENDING_FINAL_DECISION') {
                          return <span className="text-xs italic text-gray-400 flex items-center"><ClockIcon className="h-3 w-3 mr-1"/> Menunggu Jadwal...</span>;
                        }

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

                    {/* 6. Aksi */}
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

      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ isOpen: false, feedback: '', candidateName: '' })}
        feedback={reviewModal.feedback}
        candidateName={reviewModal.candidateName}
      />
    </>
  );
}

export default FinalScheduleTable;