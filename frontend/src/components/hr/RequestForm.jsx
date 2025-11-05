// src/components/hr/RequestForm.jsx
import React, { useState, useEffect } from 'react';
import { PlusIcon } from "@heroicons/react/24/outline";
import Notiflix from 'notiflix';
// Pastikan Anda sudah menjalankan: npm install react-simple-wysiwyg
import Editor from "react-simple-wysiwyg";

/**
 * Komponen Modal Formulir untuk 'Request New Position'.
 * Menggunakan WYSIWYG Editor untuk 'specificRequirements'.
 */
function RequestForm({ onSubmitRequest }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State untuk data formulir "mentah"
  const [name, setName] = useState("");
  const [location, setLocation] = useState("Remote");
  const [availableSlots, setAvailableSlots] = useState(1);
  const [specificRequirementsHtml, setSpecificRequirementsHtml] = useState(""); // State untuk WYSIWYG

  const openModal = () => setIsOpen(true);
  
  // Fungsi untuk mereset dan menutup
  const resetAndClose = () => {
    setName("");
    setLocation("Remote");
    setAvailableSlots(1);
    setSpecificRequirementsHtml(""); // Reset WYSIWYG
    setIsOpen(false);
  };
  
  const closeModal = () => {
    if (isLoading) return; 
    resetAndClose();
  };

  // Handler untuk WYSIWYG
  const handleSpecificRequirementsChange = (e) => {
    setSpecificRequirementsHtml(e.target.value); // Simpan sebagai string HTML
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !specificRequirementsHtml || availableSlots < 1) {
      Notiflix.Report.warning("Form Belum Lengkap", "Mohon isi Nama Posisi, Jumlah Slot (min. 1), dan Persyaratan Spesifik.", "Okay");
      return;
    }
    
    setIsLoading(true);
    
    // Kirim data ke parent (RequestPositionPage)
    await onSubmitRequest(
      { 
        name, 
        location, 
        availableSlots, 
        specificRequirements: specificRequirementsHtml // Kirim data HTML
      }, 
      (success) => {
        setIsLoading(false);
        if (success) {
          resetAndClose();
        }
      }
    );
  };

  // Efek untuk mereset form saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setName("");
      setLocation("Remote");
      setAvailableSlots(1);
      setSpecificRequirementsHtml("");
    }
  }, [isOpen]);

  return (
    <>
      {/* Tombol Pemicu di Halaman */}
      <div className="flex justify-start">
        <button
          onClick={openModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center shadow-lg"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Buat Permintaan Lowongan Baru
        </button>
      </div>

      {/* --- Modal (Pop-up) Formulir --- */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" style={{ backdropFilter: 'blur(2px)' }}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-auto h-5/6 flex flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              {/* Header Modal */}
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">Formulir Permintaan Lowongan</h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  disabled={isLoading}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {/* Isi Form (dibuat bisa scroll) */}
              <div className="space-y-4 overflow-y-auto pr-2">
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Posisi*</label>
                  <input
                    type="text" name="name" id="name"
                    value={name} onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required disabled={isLoading}
                    placeholder="Contoh: Senior DevOps Engineer"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Lokasi*</label>
                    <select
                      name="location" id="location"
                      value={location} onChange={(e) => setLocation(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      disabled={isLoading}
                    >
                      <option value="Remote">Remote</option>
                      <option value="Onsite (Bandung)">Onsite (Bandung)</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="availableSlots" className="block text-sm font-medium text-gray-700">Jumlah Orang (Slot)*</label>
                    <input
                      type="number" name="availableSlots" id="availableSlots"
                      value={availableSlots}
                      onChange={(e) => setAvailableSlots(parseInt(e.target.value, 10) || 1)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required min="1" disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="specificRequirements" className="block text-sm font-medium text-gray-700">
                    Persyaratan Spesifik (Kebutuhan Teknis)*
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Gunakan bold, italic, atau bullet points untuk memperjelas kebutuhan teknis Anda.</p>
                  <div className="border border-gray-300 rounded-md">
                    <Editor 
                      id="specificRequirements"
                      value={specificRequirementsHtml} 
                      onChange={handleSpecificRequirementsChange}
                      containerProps={{ style: { minHeight: "250px", resize: "vertical" } }}
                    />
                  </div>
                </div>
                
              </div>

              {/* Tombol Aksi Modal */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 flex-shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm ${
                    isLoading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? "Mengirim..." : "Kirim Permintaan (Draft)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default RequestForm;