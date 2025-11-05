// src/components/Admins/JobPositionFormModal.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom"; // Diperlukan untuk ReactDOM.createPortal

// --- START: Import komponen WYSIWYG dari react-simple-wysiwyg ---
// Pastikan Anda sudah menginstal library ini: npm install react-simple-wysiwyg
import Editor from "react-simple-wysiwyg";
// Catatan: react-simple-wysiwyg tidak memerlukan file CSS terpisah seperti react-draft-wysiwyg
// --- END: Import komponen WYSIWYG ---

// Import ikon ChevronDownIcon dari Heroicons
import { ChevronDownIcon } from "@heroicons/react/24/outline"; // <-- Import ikon ini jika belum

// Asumsikan Anda punya daftar status posisi yang valid
const POSITION_STATUS_OPTIONS = ["Draft", "Open", "Closed"];

/**
 * Komponen Modal Form untuk Menambah atau Mengedit Posisi Magang.
 * Komponen ini sekarang menyertakan struktur modal dasar di dalamnya dengan layout dua kolom.
 * Saat menambah baru, status default adalah 'Draft' dan tidak bisa diubah.
 * Saat mengedit, status bisa diubah.
 * @param {Object} props - Props komponen.
 * @param {boolean} props.isOpen - State boolean untuk mengontrol apakah modal terbuka.
 * @param {function} props.onClose - Fungsi yang dipanggil saat modal ditutup.
 * @param {function} props.onSubmit - Fungsi yang dipanggil saat form disubmit (menerima data posisi).
 * @param {Object|null} props.initialData - Data posisi yang akan diisi ke form jika dalam mode edit. Null jika mode tambah.
 */
const JobPositionFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  // --- START: Deklarasi State dan Hooks (Harus di bagian paling atas) ---
  // State untuk menyimpan data form standar (selain specificRequirements yang dihandle WYSIWYG)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    registrationStartDate: "", // Format string-MM-DD untuk input type="date"
    registrationEndDate: "", // Format string-MM-DD untuk input type="date"
    availableSlots: 0,
    // --- START: Status Default 'Draft' untuk Mode Tambah ---
    // Status akan diinisialisasi di useEffect berdasarkan initialData
    status: POSITION_STATUS_OPTIONS[0], // Default sementara, akan di-override di useEffect
    // --- END: Status Default 'Draft' untuk Mode Tambah ---
  });

  // State terpisah untuk nilai WYSIWYG editor (react-simple-wysiwyg menggunakan string HTML)
  // Nilai ini akan disalin ke formData.specificRequirements saat onChange
  const [specificRequirementsHtml, setSpecificRequirementsHtml] = useState("");

  // Efek untuk mengisi form saat initialData berubah (mode edit) atau saat modal dibuka/ditutup
  useEffect(() => {
    console.log("useEffect in Modal triggered", { initialData, isOpen }); // Log untuk debugging

    // Jika modal dibuka atau initialData berubah saat modal terbuka
    if (isOpen) {
      if (initialData) {
        // --- Mode Edit: Isi form dengan data yang ada ---
        setFormData({
          name: initialData.name || "",
          location: initialData.location || "",
          duration: initialData.duration || "",
          // Format tanggal dari objek Date ke string-MM-DD
          registrationStartDate: initialData.registrationStartDate ? new Date(initialData.registrationStartDate).toISOString().split("T")[0] : "",
          registrationEndDate: initialData.registrationEndDate ? new Date(initialData.registrationEndDate).toISOString().split("T")[0] : "",
          availableSlots: initialData.availableSlots || 0,
          // --- START: Gunakan Status dari initialData di Mode Edit ---
          status: initialData.status || POSITION_STATUS_OPTIONS[0], // Gunakan status dari data
          // --- END: Gunakan Status dari initialData di Mode Edit ---
        });

        // Inisialisasi state WYSIWYG editor dari initialData
        setSpecificRequirementsHtml(initialData.specificRequirements || "");
      } else {
        // --- Mode Tambah: Reset form dan set status default 'Draft' ---
        setFormData({
          name: "",
          location: "",
          duration: "",
          registrationStartDate: "",
          registrationEndDate: "",
          availableSlots: 0,
          // --- START: Set Status Default 'Draft' di Mode Tambah ---
          status: "Draft", // Status default saat menambah baru
          // --- END: Set Status Default 'Draft' di Mode Tambah ---
        });
        // Reset state WYSIWYG
        setSpecificRequirementsHtml("");
      }
    } else {
      // Opsional: Reset form saat modal ditutup (isOpen menjadi false)
      setFormData({
        name: "",
        location: "",
        duration: "",
        registrationStartDate: "",
        registrationEndDate: "",
        availableSlots: 0,
        status: POSITION_STATUS_OPTIONS[0], // Reset ke default awal
      });
      setSpecificRequirementsHtml("");
    }
  }, [initialData, isOpen]); // <-- Tambahkan 'isOpen' ke dependency array
  // --- END: Deklarasi State dan Hooks ---

  // Jika modal tidak terbuka, jangan render apapun.
  if (!isOpen) {
    console.log("Modal is not open, returning null."); // Log untuk debugging
    return null;
  }

  // Tentukan apakah ini mode edit atau tambah
  const isEditing = !!initialData;

  // Handler untuk perubahan input standar (teks, date, number)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handler untuk perubahan input angka (misal: availableSlots)
  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    // Konversi nilai ke angka, gunakan 0 jika input kosong atau tidak valid
    const numberValue = parseInt(value, 10) || 0;
    setFormData((prevData) => ({
      ...prevData,
      [name]: numberValue >= 0 ? numberValue : 0, // Pastikan tidak negatif
    }));
  };

  // Handler untuk perubahan WYSIWYG editor (react-simple-wysiwyg)
  const handleSpecificRequirementsChange = (e) => {
    const htmlContent = e.target.value;
    setSpecificRequirementsHtml(htmlContent); // Update state lokal WYSIWYG
    // Update juga di formData agar semua data form terpusat
    setFormData((prevData) => ({
      ...prevData,
      specificRequirements: htmlContent, // Simpan HTML string ke formData
    }));
  };

  // Handler saat form disubmit
  const handleSubmit = (e) => {
    e.preventDefault();
    // Panggil fungsi onSubmit yang diterima dari parent
    // Data yang dikirim sudah termasuk output HTML dari WYSIWYG dan status yang benar (Draft di add, editable di edit)
    onSubmit(formData);
  };

  // Render modal menggunakan Portal
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay gelap */}
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>

      {/* Konten Modal - Menggunakan layout flex 2 kolom */}
      <div className="relative z-50 bg-white rounded-lg shadow-xl w-full max-w-4xl h-5/6 flex flex-col overflow-hidden">
        {/* Header Modal dengan Tombol Tutup */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-800">{isEditing ? "Edit Position" : "Add New Position"}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none" aria-label="Close modal">
            &times;
          </button>
        </div>

        {/* Konten Utama Modal (Kolom Kiri: Form Standar, Kolom Kanan: Requirements) */}
        <div className="flex flex-grow overflow-hidden">
          {/* Kolom Kiri: Form Standar */}
          <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-200">
            <form onSubmit={handleSubmit}>
              {" "}
              {/* Form di dalam kolom kiri */}
              {/* Input: Name */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                  Position Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              {/* Input: Location */}
              <div className="mb-4">
                <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              {/* Input: Registration Start Date */}
              <div className="mb-4">
                <label htmlFor="registrationStartDate" className="block text-gray-700 text-sm font-bold mb-2">
                  Registration Start Date
                </label>
                <input
                  type="date"
                  id="registrationStartDate"
                  name="registrationStartDate"
                  value={formData.registrationStartDate}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              {/* Input: Registration End Date */}
              <div className="mb-4">
                <label htmlFor="registrationEndDate" className="block text-gray-700 text-sm font-bold mb-2">
                  Registration End Date
                </label>
                <input
                  type="date"
                  id="registrationEndDate"
                  name="registrationEndDate"
                  value={formData.registrationEndDate}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              {/* Input: Available Slots */}
              <div className="mb-4">
                <label htmlFor="availableSlots" className="block text-gray-700 text-sm font-bold mb-2">
                  Available Slots
                </label>
                <input
                  type="number"
                  id="availableSlots"
                  name="availableSlots"
                  value={formData.availableSlots}
                  onChange={handleNumberInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  min="0"
                />
              </div>
              {/* Input: Status (Dropdown di Edit Mode, Teks di Add Mode) */}
              <div className="mb-4">
                <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">
                  Status
                </label>
                {/* --- START: Kondisional Render Input Status --- */}
                {isEditing ? (
                  // Render Dropdown di Mode Edit
                  <div className="relative w-full">
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-8"
                      required
                    >
                      {POSITION_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
                    </div>
                  </div>
                ) : (
                  // Tampilkan Teks 'Draft' di Mode Tambah (Tidak Bisa Diedit)
                  <div className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-100 cursor-not-allowed">
                    {formData.status} {/* Akan menampilkan 'Draft' */}
                  </div>
                )}
                {/* --- END: Kondisional Render Input Status --- */}
              </div>
            </form>
          </div>

          {/* Kolom Kanan: Specific Requirements (WYSIWYG Editor) */}
          <div className="w-1/2 p-6 flex flex-col flex-grow overflow-y-auto">
            <div className="mb-4 flex-shrink-0">
              <label htmlFor="specificRequirements" className="block text-gray-700 text-sm font-bold mb-2">
                Specific Requirements
              </label>
            </div>
            <Editor value={specificRequirementsHtml} onChange={handleSpecificRequirementsChange} containerProps={{ style: { minHeight: "450px", width: "100%" } }} />
          </div>
        </div>

        {/* Footer Modal dengan Tombol Submit/Cancel */}
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-4 flex-shrink-0">
          <button type="button" onClick={onClose} className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
            Cancel
          </button>
          <button type="submit" onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            {isEditing ? "Update Position" : "Add Position"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default JobPositionFormModal;
