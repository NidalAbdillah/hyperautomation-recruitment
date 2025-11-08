// src/components/Admins/JobPositionFormModal.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Editor from "react-simple-wysiwyg";
import parse from "html-react-parser";
import Notiflix from "notiflix";
import { LockClosedIcon } from "@heroicons/react/24/solid";

const JobPositionFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  // (State, useEffect, dan handlers... semua tetap sama)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    registrationStartDate: "",
    registrationEndDate: "",
    availableSlots: 0,
    announcement: "",
    specificRequirements: "",
  });
  const [specificRequirementsHtml, setSpecificRequirementsHtml] = useState("");
  const [announcementHtml, setAnnouncementHtml] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Mode Edit
        setFormData({
          name: initialData.name || "",
          location: initialData.location || "",
          availableSlots: initialData.availableSlots || 0,
          specificRequirements: initialData.specificRequirements || "",
          registrationStartDate: initialData.registrationStartDate
            ? new Date(initialData.registrationStartDate)
                .toISOString()
                .split("T")[0]
            : "",
          registrationEndDate: initialData.registrationEndDate
            ? new Date(initialData.registrationEndDate)
                .toISOString()
                .split("T")[0]
            : "",
          announcement: initialData.announcement || "",
        });
        setSpecificRequirementsHtml(initialData.specificRequirements || "");
        setAnnouncementHtml(initialData.announcement || "");
      } else {
        // Mode Tambah
        setFormData({
          name: "",
          location: "",
          registrationStartDate: "",
          registrationEndDate: "",
          availableSlots: 0,
          announcement: "",
          specificRequirements: "",
        });
        setSpecificRequirementsHtml("");
        setAnnouncementHtml("");
      }
    }
  }, [initialData, isOpen]);

  if (!isOpen) {
    return null;
  }

  const isEditing = !!initialData;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    const numberValue = parseInt(value, 10) || 0;
    setFormData((prevData) => ({
      ...prevData,
      [name]: numberValue >= 0 ? numberValue : 0,
    }));
  };
  const handleSpecificRequirementsChange = (e) => {
    const htmlContent = e.target.value;
    setSpecificRequirementsHtml(htmlContent);
    setFormData((prevData) => ({
      ...prevData,
      specificRequirements: htmlContent,
    }));
  };
  const handleAnnouncementChange = (e) => {
    const htmlContent = e.target.value;
    setAnnouncementHtml(htmlContent); // <-- State WYSIWYG
    setFormData((prevData) => ({ ...prevData, announcement: htmlContent })); // <-- State Form
  };

  // --- 1. PERUBAHAN: handleSubmit DENGAN VALIDASI 50 KATA ---
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditing) {
      // Validasi 1: Tanggal (Sudah ada)
      if (!formData.registrationStartDate || !formData.registrationEndDate) {
        Notiflix.Report.warning(
          "Tanggal Wajib Diisi",
          "Mohon isi 'Registration Start Date' dan 'Registration End Date' sebelum menyimpan.",
          "Okay"
        );
        return;
      }

      // Validasi 2: Konten Publik (Permintaan Anda)
      // Kita gunakan 'announcementHtml' (state WYSIWYG) untuk validasi
      const plainText = announcementHtml.replace(/<[^>]+>/g, "").trim();
      const minWords = 50;
      const wordCount = plainText
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

      if (!plainText) {
        Notiflix.Report.warning(
          "Konten Publik Wajib Diisi",
          "Mohon isi 'Deskripsi Lowongan (Akan Tampil di Publik)'.",
          "Okay"
        );
        return;
      }

      if (wordCount < minWords) {
        Notiflix.Report.warning(
          "Konten Publik Kurang",
          `Deskripsi lowongan harus memiliki minimal ${minWords} kata. (Saat ini: ${wordCount} kata)`,
          "Okay"
        );
        return;
      }
      // --- BATAS PERUBAHAN ---

      // Jika lolos validasi:
      const dataPublikasi = {
        registrationStartDate: formData.registrationStartDate,
        registrationEndDate: formData.registrationEndDate,
        announcement: formData.announcement, // Kirim HTML ke backend
      };
      onSubmit(dataPublikasi);
    } else {
      // Validasi mode Tambah (pastikan requirements diisi)
      const plainRequirements = specificRequirementsHtml
        .replace(/<[^>]+>/g, "")
        .trim();

      if (!formData.name || !formData.location || !plainRequirements) {
        Notiflix.Report.warning(
          "Form Belum Lengkap",
          "Mohon isi Position Name, Location, dan Specific Requirements.",
          "Okay"
        );
        return;
      }
      onSubmit(formData);
    }
  };

  const readOnlyInputStyle =
    "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 cursor-not-allowed";
  const editableInputStyle =
    "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline";

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative z-50 bg-white rounded-lg shadow-xl w-full max-w-4xl h-5/6 flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEditing
              ? "Lengkapi Data Publikasi"
              : "Buat Permintaan Lowongan Baru"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-grow overflow-hidden"
        >
          <div className="flex-grow overflow-y-auto p-6">
            {isEditing ? (
              /* =========================================== */
              /* =========================================== */

              <div className="space-y-6">
                {/* --- BAGIAN 1: DATA TANGGAL (EDITABLE) --- */}
                <fieldset className="bg-white p-4 rounded-lg border border-blue-300">
                  <legend className="text-md font-semibold text-blue-800 px-2">
                    Data Publikasi
                  </legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="registrationStartDate"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Registration Start Date{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="registrationStartDate"
                        name="registrationStartDate"
                        value={formData.registrationStartDate}
                        onChange={handleInputChange}
                        className={editableInputStyle}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="registrationEndDate"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Registration End Date{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="registrationEndDate"
                        name="registrationEndDate"
                        value={formData.registrationEndDate}
                        onChange={handleInputChange}
                        className={editableInputStyle}
                        required
                      />
                    </div>
                  </div>
                </fieldset>

                {/* --- BAGIAN 2: KONTEN PUBLIK (EDITABLE) --- */}
                <fieldset className="bg-white p-4 rounded-lg border border-blue-300">
                  {/* --- 2. PERUBAHAN: Tambah Bintang (*) di Legend --- */}
                  <legend className="text-md font-semibold text-blue-800 px-2">
                    Konten Publik (Announcement)
                    <span className="text-red-500">*</span>
                  </legend>
                  <label
                    htmlFor="announcement"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Deskripsi Lowongan (Akan Tampil di Publik)
                  </label>
                  <Editor
                    id="announcement"
                    value={announcementHtml}
                    onChange={handleAnnouncementChange}
                    containerProps={{
                      style: { minHeight: "200px", width: "100%" },
                    }}
                  />
                  {/* --- 3. PERUBAHAN: Tambah Helper Teks --- */}
                  <p className="text-xs text-gray-500 mt-2">
                    Wajib diisi, minimal 50 kata.
                  </p>
                </fieldset>

                {/* --- BAGIAN 3: DATA PERMINTAAN (READ-ONLY) --- */}
                <fieldset className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <legend className="text-md font-semibold text-gray-800 px-2 flex items-center">
                    3. Referensi Permintaan
                    <LockClosedIcon
                      className="h-4 w-4 text-gray-500 ml-2"
                      title="Read-Only"
                    />
                  </legend>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Position Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        className={readOnlyInputStyle}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        className={readOnlyInputStyle}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Available Slots
                      </label>
                      <input
                        type="number"
                        value={formData.availableSlots}
                        className={readOnlyInputStyle}
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Specific Requirements (Internal)
                    </label>
                    <div className="text-sm text-gray-900 mt-1 p-3 border border-gray-300 rounded-md bg-gray-100 min-h-[100px] prose max-w-none">
                      {parse(
                        specificRequirementsHtml || "<i>Tidak ada detail</i>"
                      )}
                    </div>
                  </div>
                </fieldset>
              </div>
            ) : (
              /* =========================================== */
              /* TAMPILAN MODE TAMBAH (2 KOLOM LAMA)     */
              /* =========================================== */
              <div className="flex flex-grow overflow-hidden -m-6 h-full">
                {/* Kolom Kiri: Form Standar */}
                <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-200 space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Position Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={editableInputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="location"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={editableInputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="availableSlots"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Available Slots <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="availableSlots"
                      name="availableSlots"
                      value={formData.availableSlots}
                      onChange={handleNumberInputChange}
                      className={editableInputStyle}
                      required
                      min="0"
                    />
                  </div>
                </div>

                {/* Kolom Kanan: Specific Requirements (WYSIWYG) */}
                <div className="w-1/2 p-6 flex flex-col flex-grow overflow-y-auto">
                  <label
                    htmlFor="specificRequirements"
                    className="block text-gray-700 text-sm font-bold mb-2 flex-shrink-0"
                  >
                    Specific Requirements (Kebutuhan Internal){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Editor
                    id="specificRequirements"
                    value={specificRequirementsHtml}
                    onChange={handleSpecificRequirementsChange}
                    containerProps={{
                      style: { minHeight: "450px", width: "100%" },
                    }}
                  />
                  {/* --- 4. PERUBAHAN: Tambah Helper Teks --- */}
                  <p className="text-xs text-gray-500 mt-2">Wajib diisi.</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Modal (Tombol Submit/Cancel) */}
          <div className="p-4 border-t border-gray-200 flex justify-end space-x-4 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-block align-baseline font-bold text-sm text-gray-700 hover:text-gray-900"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {isEditing ? "Update Data Publikasi" : "Buat Permintaan (Draft)"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default JobPositionFormModal;
