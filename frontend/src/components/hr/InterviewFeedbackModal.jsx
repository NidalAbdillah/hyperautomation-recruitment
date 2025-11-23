import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Editor from 'react-simple-wysiwyg';
import parse from 'html-react-parser';

function InterviewFeedbackModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  candidate,
  title = "Feedback Wawancara Teknis",
  decisionOptions = { hire: "Hire", reject: "Reject" }, // Default untuk Manajer
  showPreview = true // Toggle preview HTML
}) {
  const [decision, setDecision] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showHTMLPreview, setShowHTMLPreview] = useState(false);

  // ✅ Reset form saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setDecision('');
      setFeedback('');
      setShowHTMLPreview(false);
    }
  }, [isOpen]);

  if (!isOpen || !candidate) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!decision) {
      alert('Silakan pilih keputusan terlebih dahulu');
      return;
    }
    
    if (!feedback.trim()) {
      alert('Catatan penilaian wajib diisi');
      return;
    }

    // ✅ DEBUG: Log data yang dikirim
    console.log('📤 [InterviewFeedback] Submitting:', {
      decision,
      feedback: feedback.substring(0, 100) + '...'
    });
    
    onSubmit({
      decision, // Sesuai dengan decisionOptions (Hire/Reject atau HIRED/NOT_HIRED)
      feedback  // HTML format
    });
    
    // Reset setelah submit
    setDecision('');
    setFeedback('');
  };

  const handleDecisionClick = (selectedDecision) => {
    console.log('✅ Decision selected:', selectedDecision);
    setDecision(selectedDecision);
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600">
              Kandidat: <span className="font-semibold">{candidate.fullName}</span> 
              {' • '}
              <span className="text-gray-500">{candidate.qualification}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="hover:bg-gray-200 rounded-full p-1 transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-red-500"/>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* Keputusan */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Keputusan Anda <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                
                {/* Button Hire/Accept */}
                <button
                  type="button"
                  onClick={() => handleDecisionClick(decisionOptions.hire)}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200
                    ${decision === decisionOptions.hire
                      ? 'border-green-500 bg-green-50 shadow-lg scale-105' 
                      : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                    }
                  `}
                >
                  <CheckCircleIcon className={`h-12 w-12 mx-auto mb-2 ${
                    decision === decisionOptions.hire ? 'text-green-600' : 'text-gray-400'
                  }`}/>
                  <p className={`font-bold text-lg ${
                    decision === decisionOptions.hire ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {decisionOptions.hire.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {decisionOptions.hire === 'HIRED' ? 'Kandidat Diterima' : 'Lanjut ke Tahap Selanjutnya'}
                  </p>
                </button>

                {/* Button Reject */}
                <button
                  type="button"
                  onClick={() => handleDecisionClick(decisionOptions.reject)}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200
                    ${decision === decisionOptions.reject
                      ? 'border-red-500 bg-red-50 shadow-lg scale-105' 
                      : 'border-gray-300 hover:border-red-300 hover:bg-red-50'
                    }
                  `}
                >
                  <XCircleIcon className={`h-12 w-12 mx-auto mb-2 ${
                    decision === decisionOptions.reject ? 'text-red-600' : 'text-gray-400'
                  }`}/>
                  <p className={`font-bold text-lg ${
                    decision === decisionOptions.reject ? 'text-red-700' : 'text-gray-600'
                  }`}>
                    {decisionOptions.reject.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Kandidat Ditolak</p>
                </button>
              </div>

              {/* Decision Indicator */}
              {decision && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                  <span className="font-semibold text-blue-800">Keputusan Terpilih:</span>{' '}
                  <span className={`font-bold ${
                    decision === decisionOptions.hire ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {decision === decisionOptions.hire ? '✓ ' : '✗ '}
                    {decision}
                  </span>
                </div>
              )}
            </div>

            {/* Feedback Editor */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">
                  Catatan Penilaian <span className="text-red-500">*</span>
                </label>
                {showPreview && (
                  <button
                    type="button"
                    onClick={() => setShowHTMLPreview(!showHTMLPreview)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {showHTMLPreview ? '📝 Edit Mode' : '👁️ Preview Mode'}
                  </button>
                )}
              </div>

              {!showHTMLPreview ? (
                <>
                  <Editor
                    value={feedback}
                    onChange={handleFeedbackChange}
                    containerProps={{ 
                      style: { 
                        minHeight: "280px",
                        border: "1px solid #D1D5DB",
                        borderRadius: "0.375rem"
                      } 
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Tips: Gunakan toolbar untuk <strong>bold</strong>, <em>italic</em>, bullet points, dll.
                  </p>
                </>
              ) : (
                <div className="border border-blue-300 rounded-lg p-4 bg-blue-50 min-h-[280px]">
                  <div className="prose prose-sm max-w-none">
                    {feedback ? parse(feedback) : <em className="text-gray-400">Belum ada konten...</em>}
                  </div>
                </div>
              )}
            </div>

            {/* Character Count */}
            <div className="text-right text-xs text-gray-500">
              {feedback.length} karakter
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            >
              Batal
            </button>
            
            <button
              type="submit"
              disabled={!decision || !feedback.trim()}
              className={`
                px-6 py-2 rounded font-semibold transition-all shadow-md
                ${!decision || !feedback.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : decision === decisionOptions.hire
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
                }
              `}
            >
              {!decision 
                ? '⚠️ Pilih Keputusan Dulu' 
                : decision === decisionOptions.hire 
                ? '✓ Kirim & Approve' 
                : '✗ Kirim & Reject'
              }
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
}

export default InterviewFeedbackModal;