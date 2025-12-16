// src/components/JobDetailModal.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import dayjs from "dayjs";
import "dayjs/locale/id";
dayjs.locale("id");

// Helper untuk format tanggal (sama seperti di CareerSection)
const formatDisplayDate = (isoString) => {
  if (!isoString) return "-";
  try {
    return dayjs(isoString).format("DD MMMM YYYY");
  } catch (e) {
    console.error("Error formatting date:", isoString, e);
    return "Invalid Date";
  }
};

function JobDetailModal({ isOpen, onClose, jobData }) {

  // Efek untuk menutup modal dengan tombol Escape
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Jangan render apa-apa jika modal tidak terbuka atau tidak ada data
  if (!isOpen || !jobData) return null;

  return (
    // Overlay latar belakang
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 transition-opacity duration-300" 
      onClick={onClose} // Menutup modal jika area luar diklik
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="job-detail-modal-title"
    >
      {/* Konten Modal */}
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" 
        onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat konten di dalam diklik
      >
        {/* Header Modal */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h3 id="job-detail-modal-title" className="text-lg font-semibold text-gray-800 truncate" title={jobData.name}>
            {jobData.name}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 text-3xl leading-none p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400" 
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Body Modal (Scrollable) */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {/* Info Ringkas */}
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Lokasi:</strong> {jobData.location}</p>
            <p><strong>Pendaftaran:</strong> {formatDisplayDate(jobData.registrationStartDate)} - {formatDisplayDate(jobData.registrationEndDate)}</p>
            <p><strong>Slot Tersedia:</strong> {jobData.availableSlots || '-'}</p>
          </div>

          <hr className="border-gray-200"/>

          {/* Specific Requirements */}
          <div>
            <h4 className="text-base font-semibold text-gray-700 mb-2">Persyaratan Khusus:</h4>
            {jobData.specificRequirements && typeof jobData.specificRequirements === 'string' ? (
              <div
                className="prose prose-sm max-w-none text-gray-700" // `prose` dari Tailwind Typography akan memberi styling default
                dangerouslySetInnerHTML={{ __html: jobData.specificRequirements }}
              />
            ) : (
              <p className="text-sm text-gray-500 italic">Tidak ada persyaratan khusus yang tercantum.</p>
            )}
          </div>
        </div>

        {/* Footer Modal (Tombol Apply) */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50 text-right">
          <Link
            to={`/applycv?posisi=${encodeURIComponent(jobData.name)}`}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
            onClick={onClose} // Opsional: tutup modal saat klik apply
          >
            Lamar Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}

export default JobDetailModal;