// src/components/hr/ManagerSelectModal.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Notiflix from 'notiflix';

function ManagerSelectModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  candidate 
}) {
  // State internal untuk form
  const [preference, setPreference] = useState("Online"); // Default "Online"
  const [managerNotes, setManagerNotes] = useState("");

  // Reset form setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setPreference("Online");
      setManagerNotes("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!preference) {
        Notiflix.Report.warning("Preferensi Dibutuhkan", "Silakan pilih preferensi wawancara (Online/Offline).", "Okay");
        return;
    }
    // Kirim data (state) kembali ke halaman induk
    onSubmit({
      preference,
      manager_notes_for_candidate: managerNotes
    });
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" style={{ backdropFilter: 'blur(2px)' }}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-auto flex flex-col">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pilih Kandidat untuk Wawancara</h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Isi Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Kandidat</label>
              <input type="text" value={candidate.fullName} readOnly className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" />
            </div>
            
            <div>
              <label htmlFor="preference" className="block text-sm font-medium text-gray-700">Preferensi Wawancara*</label>
              <select
                id="preference"
                value={preference}
                onChange={(e) => setPreference(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>

            <div>
              <label htmlFor="managerNotes" className="block text-sm font-medium text-gray-700">Instruksi / Pesan Kustom (Opsional)</label>
              <textarea
                id="managerNotes"
                value={managerNotes}
                onChange={(e) => setManagerNotes(e.target.value)}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Contoh: Mohon siapkan presentasi 5 menit mengenai portofolio Anda..."
              />
              <p className="text-xs text-gray-500 mt-1">Pesan ini akan dimasukkan ke dalam email undangan untuk kandidat.</p>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
              Kirim ke Antrian HR
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default ManagerSelectModal;