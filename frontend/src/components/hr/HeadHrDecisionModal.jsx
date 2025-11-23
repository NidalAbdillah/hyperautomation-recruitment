// ========================================
// 1. HeadHrDecisionModal.jsx (MODAL BARU UNTUK EKSEKUSI)
// ========================================
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Editor from 'react-simple-wysiwyg';

export function HeadHrDecisionModal({ isOpen, onClose, onSubmit, candidate }) {
  const [decision, setDecision] = useState(''); // 'HIRED' atau 'NOT_HIRED'
  const [feedback, setFeedback] = useState('');

  if (!isOpen || !candidate) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!decision) {
      alert('Silakan pilih keputusan (Hire/Not Hire)');
      return;
    }
    if (!feedback.trim()) {
      alert('Catatan keputusan wajib diisi');
      return;
    }

    // ✅ PASTIKAN value yang dikirim benar
    console.log('🔍 [HEAD HR] Decision:', decision);
    console.log('🔍 [HEAD HR] Feedback:', feedback);
    
    onSubmit({
      decision, // 'HIRED' atau 'NOT_HIRED'
      feedback
    });
    
    // Reset
    setDecision('');
    setFeedback('');
  };

  const handleDecisionClick = (selectedDecision) => {
    console.log('✅ [HEAD HR] Decision selected:', selectedDecision);
    setDecision(selectedDecision);
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Keputusan Final Head HR</h3>
            <p className="text-sm text-gray-600">Kandidat: <span className="font-semibold">{candidate.fullName}</span></p>
          </div>
          <button 
            onClick={onClose}
            className="hover:bg-gray-200 rounded-full p-1 transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-red-500"/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* Keputusan */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Keputusan Akhir <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                
                {/* ✅ BUTTON HIRED */}
                <button
                  type="button"
                  onClick={() => handleDecisionClick('HIRED')}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200
                    ${decision === 'HIRED' 
                      ? 'border-green-500 bg-green-50 shadow-lg scale-105' 
                      : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                    }
                  `}
                >
                  <CheckCircleIcon className={`h-12 w-12 mx-auto mb-2 ${
                    decision === 'HIRED' ? 'text-green-600' : 'text-gray-400'
                  }`}/>
                  <p className={`font-bold text-lg ${
                    decision === 'HIRED' ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    HIRED
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Kandidat Diterima</p>
                </button>

                {/* ✅ BUTTON NOT_HIRED */}
                <button
                  type="button"
                  onClick={() => handleDecisionClick('NOT_HIRED')}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200
                    ${decision === 'NOT_HIRED' 
                      ? 'border-red-500 bg-red-50 shadow-lg scale-105' 
                      : 'border-gray-300 hover:border-red-300 hover:bg-red-50'
                    }
                  `}
                >
                  <XCircleIcon className={`h-12 w-12 mx-auto mb-2 ${
                    decision === 'NOT_HIRED' ? 'text-red-600' : 'text-gray-400'
                  }`}/>
                  <p className={`font-bold text-lg ${
                    decision === 'NOT_HIRED' ? 'text-red-700' : 'text-gray-600'
                  }`}>
                    NOT HIRED
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Kandidat Ditolak</p>
                </button>
              </div>

              {decision && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                  <span className="font-semibold text-blue-800">Keputusan Terpilih:</span>{' '}
                  <span className={`font-bold ${
                    decision === 'HIRED' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {decision === 'HIRED' ? '✓ HIRED' : '✗ NOT HIRED'}
                  </span>
                </div>
              )}
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Catatan Keputusan Final <span className="text-red-500">*</span>
              </label>
              <Editor
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                containerProps={{ 
                  style: { 
                    minHeight: "250px",
                    border: "1px solid #D1D5DB",
                    borderRadius: "0.375rem"
                  } 
                }}
              />
              <p className="text-xs text-gray-500 mt-2">
                Tulis alasan keputusan, pertimbangan akhir, dan catatan lainnya.
              </p>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100"
            >
              Batal
            </button>
            
            <button
              type="submit"
              disabled={!decision || !feedback.trim()}
              className={`
                px-6 py-2 rounded font-semibold transition-all
                ${!decision || !feedback.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : decision === 'HIRED'
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                  : 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
                }
              `}
            >
              {decision === 'HIRED' ? '✓ Simpan & HIRE' : decision === 'NOT_HIRED' ? '✗ Simpan & NOT HIRE' : 'Pilih Keputusan'}
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
}

// ========================================
// 2. ManagerFeedbackDetailModal.jsx (FIX DISPLAY HTML)
// ========================================
import parse from 'html-react-parser'; // npm install html-react-parser

export function ManagerFeedbackDetailModal({ isOpen, onClose, candidate }) {
  if (!isOpen || !candidate) return null;

  const notes = candidate.interview_notes || {};
  
  // ✅ AMBIL SEMUA KEMUNGKINAN FIELD
  const managerFeedback = 
    notes.manager_feedback || 
    notes.manager_notes || 
    notes.manager_notes_for_candidate || 
    "<i class='text-gray-400'>Tidak ada catatan dari manajer.</i>";
  
  const finalFeedback = 
    notes.final_feedback || 
    notes.hr_feedback || 
    "<i class='text-gray-400'>Tidak ada catatan final.</i>";

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <h3 className="text-lg font-bold text-gray-800">📋 Detail Penilaian Kandidat</h3>
          <button onClick={onClose} className="hover:bg-gray-200 rounded-full p-1">
            <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-red-500"/>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Profil */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-blue-600 uppercase font-bold">Nama Kandidat</p>
                <p className="text-lg font-bold text-gray-900">{candidate.fullName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-600 uppercase font-bold">Posisi</p>
                <p className="text-md font-semibold text-gray-900">{candidate.qualification}</p>
              </div>
            </div>
          </div>

          {/* 1. Feedback Manajer */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3 pb-2 border-b">
              <h4 className="text-sm font-bold text-gray-700 uppercase">
                🎯 Laporan Wawancara Teknis (Manajer)
              </h4>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                notes.manager_decision === 'Hire' 
                  ? 'bg-green-100 text-green-800' 
                  : notes.manager_decision === 'Reject'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {notes.manager_decision || 'Belum Ada'}
              </span>
            </div>
            
            {/* ✅ PARSE HTML - Bukan tampilkan raw text */}
            <div className="prose prose-sm max-w-none text-gray-700">
               {parse(managerFeedback)}
            </div>
          </div>

          {/* 2. Catatan Final */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 pb-2 border-b">
              ✅ Catatan Keputusan Final (Head HR)
            </h4>
            
            {/* ✅ PARSE HTML */}
            <div className="prose prose-sm max-w-none text-gray-700">
               {parse(finalFeedback)}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
           <button 
             onClick={onClose} 
             className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 shadow-md transition-colors"
           >
             Tutup
           </button>
        </div>
      </div>
    </div>,
    document.body
  );
}