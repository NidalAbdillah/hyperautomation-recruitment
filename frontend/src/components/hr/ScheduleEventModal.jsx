import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import moment from "moment"; // Butuh moment untuk format datetime-local

function ScheduleEventModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  isLoading,
  initialData,
  mode, // 'create' or 'edit'
}) {
  // State Internal Form
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [description, setDescription] = useState("");

  // Helper untuk format tanggal ke 'datetime-local'
  const formatForInput = (date) => {
    if (!date) return "";
    // Format: YYYY-MM-DDTHH:mm
    return moment(date).format("YYYY-MM-DDTHH:mm");
  };

  // Mengisi form saat modal dibuka (saat initialData berubah)
  useEffect(() => {
    if (isOpen && initialData) {
      if (mode === "create") {
        // Mode Buat: Ambil dari klik kalender
        setTitle("");
        setStart(formatForInput(initialData.start));
        // Atur end time default, misal 1 jam setelah start
        const defaultEndDate = moment(initialData.start).add(1, 'hour').toDate();
        setEnd(formatForInput(defaultEndDate));
        setDescription("");
      } else if (mode === "edit") {
        // Mode Edit: Ambil dari data event
        setTitle(initialData.title || "");
        setStart(formatForInput(initialData.start));
        setEnd(formatForInput(initialData.end));
        setDescription(initialData.description || "");
      }
    } else {
      // Reset form saat ditutup
      setTitle("");
      setStart("");
      setEnd("");
      setDescription("");
    }
  }, [isOpen, initialData, mode]);

  // Handler untuk submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    // Kirim data (dalam format Date object) ke Page
    onSubmit({
      title,
      start: new Date(start),
      end: new Date(end),
      description,
    });
  };

  // Handler untuk tombol delete
  const handleDelete = () => {
    if (isLoading || mode !== 'edit') return;
    // Kirim ID-nya ke Page
    onDelete(initialData.id);
  };

  if (!isOpen) return null;

  // Render modal menggunakan Portal
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      style={{ backdropFilter: "blur(2px)" }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === "create" ? "Tambah Event Baru" : "Edit Event"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Judul Event */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Judul Event
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* Waktu Mulai */}
            <div>
              <label htmlFor="start" className="block text-sm font-medium text-gray-700">
                Waktu Mulai
              </label>
              <input
                type="datetime-local"
                id="start"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* Waktu Selesai */}
            <div>
              <label htmlFor="end" className="block text-sm font-medium text-gray-700">
                Waktu Selesai
              </label>
              <input
                type="datetime-local"
                id="end"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Deskripsi (Opsional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>

          {/* Footer Modal (Tombol Aksi) */}
          <div className="flex justify-between items-center gap-3 p-5 border-t bg-gray-50">
            {/* Tombol Hapus (Hanya muncul saat mode 'edit') */}
            <div>
              {mode === "edit" && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md shadow-sm hover:bg-red-50 disabled:bg-gray-100 disabled:cursor-not-allowed inline-flex items-center"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Hapus
                </button>
              )}
            </div>

            {/* Tombol Batal & Simpan */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:bg-gray-100"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default ScheduleEventModal;