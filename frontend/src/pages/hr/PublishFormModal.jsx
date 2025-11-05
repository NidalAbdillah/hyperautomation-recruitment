// src/components/hr/PublishFormModal.jsx
import React, { useState, useEffect } from "react";
import Notiflix from "notiflix";
import Editor from "react-simple-wysiwyg"; // Pastikan sudah: npm install react-simple-wysiwyg
import ReactHtmlParser from "react-html-parser"; // Pastikan sudah: npm install react-html-parser

/**
 * Komponen Modal (Pop-up) ini KHUSUS untuk Staff HR.
 * Ini adalah "To-Do List" (Daftar Tugas) untuk "menambah pemanis" (sweetener) dan mem-publish (terbitkan) lowongan.
 */
function PublishFormModal({ isOpen, onClose, onSubmit, initialData, isLoading }) {
  
  // State untuk "pemanis" (sweetener) yang diisi oleh Staff HR
  const [announcement, setAnnouncement] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 'useEffect' untuk mengisi form saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Isi form dengan data yang ada (jika sedang mengedit ulang yang sudah 'Open')
        setAnnouncement(initialData.announcement || "");
        setStartDate(initialData.registrationStartDate ? new Date(initialData.registrationStartDate).toISOString().split("T")[0] : "");
        setEndDate(initialData.registrationEndDate ? new Date(initialData.registrationEndDate).toISOString().split("T")[0] : "");
      } else {
        // Reset form jika (seharusnya tidak terjadi, tapi jaga-jaga)
        setAnnouncement("");
        setStartDate("");
        setEndDate("");
      }
    }
  }, [isOpen, initialData]);

  // Handler (Penangan) untuk WYSIWYG "pemanis" (sweetener)
  const handleAnnouncementChange = (e) => {
    setAnnouncement(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!announcement || !startDate || !endDate) {
      Notiflix.Report.warning("Form Belum Lengkap", "Mohon isi Kata Pembuka (Announcement) dan Tanggal Publikasi (Mulai & Selesai).", "Okay");
      return;
    }
    
    // Kirim data "pemanis" (sweetener) DAN status "Open" ke parent (induk)
    onSubmit(initialData.id, {
      announcement,
      registrationStartDate: startDate,
      registrationEndDate: endDate,
      status: "Open", // <-- Paksa status jadi "Open"
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" style={{ backdropFilter: 'blur(2px)' }}>
      {/* Buat modal lebih besar */}
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl mx-auto h-5/6 flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header Modal */}
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900">
              Siapkan & Publikasikan Lowongan (Publish Job)
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              disabled={isLoading}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Konten Form (Bisa di-scroll) */}
          <div className="overflow-y-auto pr-2 flex-grow space-y-4">

            {/* --- BAGIAN 1: "WHAT YOU SEE" (Read-Only) --- */}
            {/* Ini adalah data "mentah" (raw data) dari Manager */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-md font-semibold text-gray-800 mb-2">Data Teknis (dari Manager - Read Only)</h4>
              
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-500">Nama Posisi:</p>
                <p className="text-md font-semibold text-gray-900">{initialData.name}</p>
              </div>
              
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-500">Lokasi / Slot:</p>
                <p className="text-md text-gray-900">{initialData.location} ({initialData.availableSlots} Slot)</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Persyaratan Spesifik (dari Manager):</p>
                <div className="text-sm text-gray-900 mt-1 p-2 border border-gray-300 rounded-md bg-white min-h-[100px]">
                  {/* Menampilkan HTML dari WYSIWYG Manager */}
                  {ReactHtmlParser(initialData.specificRequirements || '<i>Tidak ada detail</i>')}
                </div>
              </div>
            </div>
            {/* --- BATAS BAGIAN 1 --- */}


            {/* --- BAGIAN 2: "WHAT YOU GET" (Input Staff HR) --- */}
            {/* Ini adalah "pemanis" (sweetener) yang diisi Staff HR */}
            <div className="bg-white p-4 rounded-lg border border-gray-300">
              <h4 className="text-md font-semibold text-gray-800 mb-2">Data Publikasi (Diisi oleh Staff HR)</h4>

              <div className="mb-4">
                <label htmlFor="announcement" className="block text-sm font-medium text-gray-700">
                  Kata Pembuka / Pengumuman*
                </label>
                <p className="text-xs text-gray-500 mb-2">Tulis "kata pemanis" (sweetener) di sini (cth: "Bergabunglah dengan tim...")</p>
                <div className="border border-gray-300 rounded-md">
                  <Editor 
                    id="announcement"
                    value={announcement} 
                    onChange={handleAnnouncementChange}
                    containerProps={{ style: { minHeight: "150px" } }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="registrationStartDate" className="block text-sm font-medium text-gray-700">Tanggal Buka Pendaftaran*</label>
                  <input
                    type="date"
                    name="registrationStartDate"
                    id="registrationStartDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="registrationEndDate" className="block text-sm font-medium text-gray-700">Tanggal Tutup Pendaftaran*</label>
                  <input
                    type="date"
                    name="registrationEndDate"
                    id="registrationEndDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
            {/* --- BATAS BAGIAN 2 --- */}

          </div>

          {/* Tombol Aksi Modal */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm ${
                isLoading ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Memublikasikan..." : "Publish Lowongan Ini (Set 'Open')"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PublishFormModal;