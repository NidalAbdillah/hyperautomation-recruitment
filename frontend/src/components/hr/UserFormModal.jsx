// src/components/Users/UserFormModal.jsx
import React, { useState, useEffect } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";

// PERBAIKAN 1: Nama komponen diubah
function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) {
  console.log(
    "UserFormModal component rendering. isOpen:",
    isOpen,
    "initialData:",
    initialData
  );

  // State untuk menyimpan nilai input form
  const [formData, setFormData] = useState({
    name: "", // State internal form sudah benar menggunakan 'name'
    email: "",
    password: "",
    photo: null, 
    photoPreview: null,
    role: "staff_hr",
    department: "",
  });

  useEffect(() => {
    console.log(
      "UserFormModal useEffect triggered. isOpen:",
      isOpen,
      "initialData:",
      initialData
    );
    if (isOpen) {
      console.log("UserFormModal: Initializing form...");
      if (initialData) {
        console.log(
          "UserFormModal: Edit mode, initializing with data:",
          initialData
        );
        setFormData({
          // PERBAIKAN 3: Membaca 'name' dari initialData (bukan 'nama')
          name: initialData.name || "", 
          email: initialData.email || "",
          password: "", // Password tidak diisi otomatis saat edit
          photo: null,
          photoPreview: initialData.photoUrl || null,
          // PERBAIKAN 4: Default role (peran) diubah ke 'staff_hr'
          role: initialData.role || "staff_hr",
          department: initialData.department || "",
        });
      } else {
        console.log("UserFormModal: Add mode, resetting form.");
        // Reset form jika mode Tambah
        setFormData({
          name: "",
          email: "",
          password: "",
          photo: null,
          photoPreview: null,
          role: "staff_hr", // <-- Default role (peran)
          department: "",
        });
      }
    } else {
      // Reset form saat modal ditutup
      setFormData({
        name: "", email: "", password: "",
        photo: null, photoPreview: null, role: "staff_hr",
        department: "",
      });
    }

    // Cleanup function untuk me-revoke URL objek (Tidak berubah)
    return () => {
      if (
        formData.photoPreview &&
        typeof formData.photoPreview === "string" &&
        formData.photo instanceof File
      ) {
        URL.revokeObjectURL(formData.photoPreview);
      }
    };
  }, [isOpen, initialData]); // <-- Dependensi sudah benar

  // Handler untuk perubahan input teks (nama, email, password, role)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handler untuk perubahan input file (foto)
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    
    // Revoke URL lama jika ada
    if (
      formData.photoPreview &&
      typeof formData.photoPreview === "string" &&
      formData.photo instanceof File
    ) {
      URL.revokeObjectURL(formData.photoPreview);
    }

    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        photo: file, // Simpan objek File
        photoPreview: URL.createObjectURL(file), // Buat URL sementara
      }));
    } else {
      // Jika file dihapus
      setFormData((prevData) => ({
        ...prevData,
        photo: null,
        photoPreview: initialData?.photoUrl || null, // Kembalikan ke foto lama (jika edit)
      }));
    }
  };

  // Handler untuk submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("UserFormModal: Form submitted.");
    
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      (!initialData && !formData.password) || // Password wajib saat tambah
      !formData.role
    ) {
      Notiflix.Report.warning("Validasi Gagal", "Mohon isi semua field yang wajib diisi (Nama, Email, Role, dan Password (jika user baru)).", "Okay");
      return;
    }

    // PERBAIKAN 5: Key (kunci) diubah dari 'nama' menjadi 'name' agar cocok dengan backend
    const dataToSubmit = {
      name: formData.name.trim(), // <-- DIUBAH (sebelumnya 'nama')
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role,
      photo: formData.photo,
      department: formData.role === 'manager' ? formData.department.trim() : null,
    };
    
    if (
      initialData &&
      initialData.photoUrl &&
      formData.photo === null &&
      formData.photoPreview === null
    ) {
      dataToSubmit.removePhoto = true;
      console.log("UserFormModal: Adding removePhoto flag to dataToSubmit.");
    }

    console.log(
      "UserFormModal: Submitting form data to parent:",
      dataToSubmit
    );
    onSubmit(initialData ? initialData.id : null, dataToSubmit);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-4">
          {/* PERBAIKAN 6: Teks diubah */}
          <h3 className="text-lg font-semibold text-gray-900">
            {initialData ? "Edit Staf" : "Tambah Staf"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            disabled={isLoading}
          >
            <svg
              className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Input Nama */}
          <div className="mb-4">
            <label
              htmlFor="name" // Sudah benar
              className="block text-sm font-medium text-gray-700"
            >
              Nama
            </label>
            <input
              type="text"
              name="name" // Sudah benar
              id="name"
              value={formData.name} // Sudah benar
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              required
              disabled={isLoading}
            />
          </div>

          {/* Input Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              required
              disabled={isLoading}
            />
          </div>

          {/* Input Password (Hanya muncul saat mode Tambah) */}
          {!initialData && (
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                required={!initialData}
                disabled={isLoading}
              />
            </div>
          )}
          {/* Input Password (Untuk mode Edit) */}
          {initialData && (
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password (Kosongkan jika tidak ingin mengubah)
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                disabled={isLoading}
              />
            </div>
          )}

          {/* Input Foto */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Foto
            </label>
            <div className="mt-1 flex items-center">
              <span className="inline-block h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                {formData.photoPreview ? (
                  <img
                    src={formData.photoPreview}
                    alt="Foto Profil"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/48x48/E5E7EB/4B5563?text=No+Photo";
                      e.target.alt = "No Photo Available";
                    }}
                  />
                ) : (
                  <PhotoIcon
                    className="h-full w-full text-gray-300"
                    aria-hidden="true"
                  />
                )}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="ml-5 rounded-md border border-gray-300 bg-white py-1.5 px-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              />
            </div>
            {initialData?.photoUrl &&
              !formData.photo && ( 
                <div className="mt-2 flex items-center">
                  <input
                    type="checkbox"
                    id="removePhoto"
                    checked={formData.photoPreview === null}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData((prevData) => ({
                          ...prevData,
                          photo: null,
                          photoPreview: null,
                        }));
                      } else {
                        setFormData((prevData) => ({
                          ...prevData,
                          photoPreview: initialData.photoUrl,
                        }));
                      }
                    }}
                    className="form-checkbox h-4 w-4 text-red-600 rounded mr-1"
                    disabled={isLoading}
                  />
                  <label htmlFor="removePhoto" className="text-sm text-red-600">
                    Hapus Foto Lama
                  </label>
                </div>
              )}
          </div>

          {/* PERBAIKAN 7: Input Role (Peran) Diubah */}
          <div className="mb-4">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <select
              name="role"
              id="role"
              value={formData.role}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              required
              disabled={isLoading}
            >
              {/* Opsi disesuaikan dengan role (peran) backend */}
              <option value="staff_hr">Staff HR</option>
              <option value="manager">Manager</option>
              <option value="head_hr">Head HR</option>
            </select>
          </div>
          {formData.role === 'manager' && (
            <div className="mb-4 transition-all duration-300 ease-in-out">
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department* <span className="text-xs text-gray-500">(Wajib untuk Role Manager)</span>
              </label>
              <input
                type="text"
                name="department"
                id="department"
                value={formData.department}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required={formData.role === 'manager'} // Wajib diisi jika rolenya 'manager'
                disabled={isLoading}
                placeholder="Contoh: IT, Finance, Marketing"
              />
            </div>
          )}


          {/* Tombol Submit dan Cancel */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isLoading
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
              }`}
              disabled={isLoading}
            >
              {/* PERBAIKAN 8: Teks diubah */}
              {isLoading
                ? initialData
                  ? "Menyimpan..."
                  : "Menambah..."
                : initialData
                ? "Simpan Perubahan"
                : "Tambah Staf"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default UserFormModal;