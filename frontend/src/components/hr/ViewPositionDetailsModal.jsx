// src/components/hr/ViewPositionDetailsModal.jsx
import React from 'react';
import parse from 'html-react-parser';

function ViewPositionDetailsModal({ isOpen, onClose, position }) {
  if (!isOpen || !position) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" style={{ backdropFilter: 'blur(2px)' }}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-auto h-5/6 flex flex-col">
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-4 flex-shrink-0 border-b pb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Detail Permintaan: {position.name}
            </h3>
            <p className="text-sm text-gray-600">
              Diminta oleh: {position.requestor?.name || 'N/A'} ({position.requestor?.department || 'N/A'})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Konten (Read-Only) */}
        <div className="overflow-y-auto pr-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Lokasi</p>
              <p className="text-md font-semibold text-gray-900">{position.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Jumlah Slot</p>
              <p className="text-md font-semibold text-gray-900">{position.availableSlots} orang</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status Saat Ini</p>
              <p className="text-md font-semibold text-yellow-600">{position.status}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Persyaratan Spesifik (dari Manager):</p>
            {/* Ini adalah "Defense" (Pertahanan) TA Anda: Menampilkan HTML WYSIWYG */}
            <div className="text-sm text-gray-900 mt-2 p-4 border border-gray-300 rounded-md bg-gray-50 min-h-[300px] prose">
              {parse(position.specificRequirements || '<i>Tidak ada detail persyaratan yang diisi.</i>')}
            </div>
          </div>
        </div>

        {/* Tombol Aksi Modal */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewPositionDetailsModal;