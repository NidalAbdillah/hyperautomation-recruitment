import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Notiflix from 'notiflix';

function InterviewFeedbackModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  candidate, 
  title = "Submit Feedback",
  decisionOptions = { hire: "Hire", reject: "Reject" } 
}) {
  const [decision, setDecision] = useState("");
  const [feedback, setFeedback] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!decision) {
      Notiflix.Report.warning("Pilihan Dibutuhkan", "Silakan pilih rekomendasi (Hire/Reject).", "Okay");
      return;
    }
    onSubmit({
      decision,
      feedback,
    });
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" style={{ backdropFilter: 'blur(2px)' }}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-auto flex flex-col">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Kandidat</label>
              <input type="text" value={candidate.fullName} readOnly className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" />
            </div>
            
            <div>
              <label htmlFor="decision" className="block text-sm font-medium text-gray-700">Rekomendasi / Keputusan*</label>
              <select
                id="decision"
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              >
                <option value="" disabled>Pilih...</option>
                <option value={decisionOptions.hire}>{decisionOptions.hire}</option>
                <option value={decisionOptions.reject}>{decisionOptions.reject}</option>
              </select>
            </div>

            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">Catatan / Alasan</label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Jelaskan alasan Anda..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default InterviewFeedbackModal;