import React, { useState } from 'react';
import parse from 'html-react-parser';
import { 
  CheckBadgeIcon, 
  XCircleIcon, 
  HandThumbUpIcon, 
  CalendarDaysIcon,
  BriefcaseIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

// ✅ Modal untuk view full review dengan HTML parsing
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
        
        {/* Content dengan HTML Parsing */}
        <div className="px-6 py-6 overflow-y-auto">
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

function HeadHrDecisionTable({ candidates, onDecide, onViewDetail }) {
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    feedback: '',
    candidateName: ''
  });

  const handleViewReview = (feedback, candidateName) => {
    setReviewModal({
      isOpen: true,
      feedback,
      candidateName
    });
  };

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
    <>
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
              const rawFeedback = notes.manager_feedback || '';
              
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
                  
                  {/* Kolom 3: Review Manager - ✅ IMPROVED */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-2">
                      {/* Baris 1: Manager Decision Status */}
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-5 w-5 ${managerDecision === 'Hire' ? 'text-green-500' : 'text-red-500'}`}>
                          {managerDecision === 'Hire' ? <HandThumbUpIcon /> : <XCircleIcon />}
                        </div>
                        <span className={`ml-1.5 text-xs font-bold uppercase tracking-wide ${managerDecision === 'Hire' ? 'text-green-700' : 'text-red-700'}`}>
                          {managerDecision}
                        </span>
                      </div>
                      
                      {/* Baris 2: Tombol View Details */}
                      {rawFeedback && (
                        <button
                          onClick={() => handleViewReview(rawFeedback, app.fullName)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center transition-colors"
                        >
                          <EyeIcon className="h-3 w-3 mr-1"/>
                          Lihat Detail Assessment
                        </button>
                      )}
                      {!rawFeedback && (
                        <p className="text-xs text-gray-400 italic">Tidak ada catatan.</p>
                      )}
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

      {/* ✅ Modal Review */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ isOpen: false, feedback: '', candidateName: '' })}
        feedback={reviewModal.feedback}
        candidateName={reviewModal.candidateName}
      />
    </>
  );
}

export default HeadHrDecisionTable;