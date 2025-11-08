// src/components/Admins/JobPositionFormModal.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Editor from "react-simple-wysiwyg";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

// --- PERUBAHAN: Hapus "POSITION_STATUS_OPTIONS" ---

const JobPositionFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    registrationStartDate: "",
    registrationEndDate: "",
    availableSlots: 0,
    // --- PERUBAHAN: "status" DIHAPUS DARI STATE ---
  });

  const [specificRequirementsHtml, setSpecificRequirementsHtml] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // --- Mode Edit ---
        setFormData({
          name: initialData.name || "",
          location: initialData.location || "",
          registrationStartDate: initialData.registrationStartDate ? new Date(initialData.registrationStartDate).toISOString().split("T")[0] : "",
          registrationEndDate: initialData.registrationEndDate ? new Date(initialData.registrationEndDate).toISOString().split("T")[0] : "",
          availableSlots: initialData.availableSlots || 0,
          // --- PERUBAHAN: "status" DIHAPUS DARI SINI ---
        });
        setSpecificRequirementsHtml(initialData.specificRequirements || "");
      } else {
        // --- Mode Tambah ---
        setFormData({
          name: "",
          location: "",
          registrationStartDate: "",
          registrationEndDate: "",
          availableSlots: 0,
          // --- PERUBAHAN: "status" (Draft) DIHAPUS DARI SINI ---
          // (Backend akan otomatis set "Draft" saat create)
        });
        setSpecificRequirementsHtml("");
      }
    } else {
      // (Reset form saat ditutup)
      setFormData({
        name: "",
        location: "",
        registrationStartDate: "",
        registrationEndDate: "",
        availableSlots: 0,
      });
      setSpecificRequirementsHtml("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) {
    return null;
  }

  const isEditing = !!initialData;

  // (Handler handleInputChange, handleNumberInputChange, handleSpecificRequirementsChange... tetap sama)
  // ... (Handler tidak berubah) ...

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
    setFormData((prevData) => ({
      ...prevData,
      specificRequirements: htmlContent, // Simpan HTML string ke formData
    }));
  };

  // Handler saat form disubmit
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="relative z-50 bg-white rounded-lg shadow-xl w-full max-w-4xl h-5/6 flex flex-col overflow-hidden">
        {/* ... (Header Modal tetap sama) ... */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-800">{isEditing ? "Edit Position" : "Add New Position"}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none" aria-label="Close modal">
            &times;
          </button>
        </div>

        <div className="flex flex-grow overflow-hidden">
          {/* Kolom Kiri: Form Standar */}
          <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-200">
            <form onSubmit={handleSubmit}>
              {/* ... (Input Name, Location, StartDate, EndDate, Slots... tetap sama) ... */}
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

              {/* --- PERUBAHAN: Input Status DIHAPUS DARI SINI --- */}
            </form>
          </div>

          {/* ... (Kolom Kanan WYSIWYG & Footer Modal tetap sama) ... */}
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
