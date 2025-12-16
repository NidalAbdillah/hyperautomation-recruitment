import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Editor from "react-simple-wysiwyg";

const JobPositionFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  // 1. State Tunggal untuk Semua Field
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    availableSlots: 1,
    registrationStartDate: null,
    registrationEndDate: null,
    specificRequirements: "", // Internal (untuk AI)
    announcement: "", // Public (untuk Pelamar)
  });

  // 2. Reset / Isi Form saat Modal Dibuka
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Mode Edit: Isi data
        setFormData({
          name: initialData.name || "",
          location: initialData.location || "",
          availableSlots: initialData.availableSlots || 1,
          registrationStartDate: initialData.registrationStartDate ? new Date(initialData.registrationStartDate) : null,
          registrationEndDate: initialData.registrationEndDate ? new Date(initialData.registrationEndDate) : null,
          specificRequirements: initialData.specificRequirements || "",
          announcement: initialData.announcement || "",
        });
      } else {
        // Mode Tambah: Reset
        setFormData({
          name: "",
          location: "",
          availableSlots: 1,
          registrationStartDate: null,
          registrationEndDate: null,
          specificRequirements: "",
          announcement: "",
        });
      }
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };

  const handleEditorChange = (e) => {
    // WYSIWYG editor mengembalikan event dengan target.value sebagai HTML
    setFormData(prev => ({ ...prev, specificRequirements: e.target.value }));
  };
  
  const handleAnnouncementChange = (e) => {
    setFormData(prev => ({ ...prev, announcement: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validasi sederhana
    if (!formData.name || !formData.location) {
      alert("Nama Posisi dan Lokasi wajib diisi.");
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-bold text-gray-800">
            {initialData ? "Edit Posisi Lowongan" : "Buat Lowongan Baru"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="jobForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Baris 1: Info Dasar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Posisi</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Jakarta / Remote"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Baris 2: Kuota & Tanggal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg border">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kuota (Slot)</label>
                <input
                  type="number"
                  name="availableSlots"
                  min="1"
                  value={formData.availableSlots}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Buka</label>
                <DatePicker
                  selected={formData.registrationStartDate}
                  onChange={(date) => handleDateChange(date, "registrationStartDate")}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Pilih Tanggal"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Tutup</label>
                <DatePicker
                  selected={formData.registrationEndDate}
                  onChange={(date) => handleDateChange(date, "registrationEndDate")}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Pilih Tanggal"
                  minDate={formData.registrationStartDate}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Baris 3: Requirements (Internal) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kebutuhan Spesifik (Internal - Untuk AI Scoring)
              </label>
              <div className="border rounded-lg overflow-hidden">
                <Editor
                  value={formData.specificRequirements}
                  onChange={handleEditorChange}
                  containerProps={{ style: { height: '200px' } }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">* Tuliskan skill teknis & kualifikasi detail di sini.</p>
            </div>

            {/* Baris 4: Announcement (Public) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pengumuman Publik (Akan tampil di web pelamar)
              </label>
              <div className="border rounded-lg overflow-hidden">
                <Editor
                  value={formData.announcement}
                  onChange={handleAnnouncementChange}
                  containerProps={{ style: { height: '150px' } }}
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="jobForm"
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md transition-colors"
          >
            {initialData ? "Simpan Perubahan" : "Buat Posisi"}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default JobPositionFormModal;