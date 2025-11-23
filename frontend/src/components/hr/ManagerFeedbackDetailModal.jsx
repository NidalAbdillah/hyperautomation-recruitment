import React from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import parse from 'html-react-parser'; // Pastikan install: npm install html-react-parser

function ManagerFeedbackDetailModal({ isOpen, onClose, candidate }) {
  if (!isOpen || !candidate) return null;

  const notes = candidate.interview_notes || {};
  const managerFeedback = notes.manager_feedback || "<i>Tidak ada catatan dari manajer.</i>";
  const finalFeedback = notes.final_feedback || "<i>Tidak ada catatan final.</i>";

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-lg">
          <h3 className="text-lg font-bold text-gray-800">Detail Laporan Kandidat</h3>
          <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-400 hover:text-red-500"/></button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Profil Singkat */}
          <div className="flex items-center space-x-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex-1">
               <p className="text-xs text-blue-600 uppercase font-bold tracking-wider">Nama Kandidat</p>
               <p className="text-lg font-bold text-gray-900">{candidate.fullName}</p>
            </div>
            <div className="text-right">
               <p className="text-xs text-blue-600 uppercase font-bold tracking-wider">Posisi</p>
               <p className="text-md font-medium text-gray-900">{candidate.qualification}</p>
            </div>
          </div>

          {/* 1. Feedback Manajer (Teknis) */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 uppercase mb-2 border-b pb-1">
              Laporan Wawancara Teknis (Manajer)
            </h4>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm text-gray-700 prose max-w-none">
               {parse(managerFeedback)}
            </div>
            <div className="mt-2 flex items-center">
               <span className="text-xs text-gray-500 mr-2">Rekomendasi Manajer:</span>
               <span className={`text-xs font-bold px-2 py-0.5 rounded ${notes.manager_decision === 'Hire' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                 {notes.manager_decision || '-'}
               </span>
            </div>
          </div>

          {/* 2. Catatan Final (HR) */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 uppercase mb-2 border-b pb-1">
              Catatan Keputusan Final (Head HR)
            </h4>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm text-gray-700 prose max-w-none">
               {parse(finalFeedback)}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex justify-end rounded-b-lg">
           <button onClick={onClose} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 shadow-sm">Tutup</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ManagerFeedbackDetailModal;