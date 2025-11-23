import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import moment from 'moment';
import Notiflix from 'notiflix';
import Editor from 'react-simple-wysiwyg'; 

function OnboardingModal({ isOpen, onClose, onSubmit, candidate }) {
  
  // Default: Besok jam 09:00
  const defaultDate = moment().add(1, 'days').format("DDDD-MM-YYYY");
  const defaultTime = "08:00";

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [type, setType] = useState("Offline"); // Default Offline (Ke Kantor)
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen && candidate) {
       // Template Default yang Kuat & Formal
       const template = `
         <p>Halo <strong>${candidate.fullName}</strong>,</p>
         <p>Selamat bergabung! Kami menantikan kehadiran Anda di hari pertama.</p>
         <p><strong>Agenda Hari Pertama:</strong></p>
         <ul>
           <li>Penandatanganan Kontrak Kerja (PKWT/PKWTT)</li>
           <li>Serah Terima Aset (Laptop & ID Card)</li>
           <li>Sesi Pengenalan Perusahaan</li>
         </ul>
         <p><strong>Dokumen Asli yang Wajib Dibawa:</strong></p>
         <ul>
           <li>KTP & KK Asli</li>
           <li>Ijazah & Transkrip Asli (Untuk verifikasi)</li>
           <li>Buku Tabungan (Untuk Payroll)</li>
           <li>NPWP</li>
         </ul>
         <p>Berpakaian rapi dan formal.</p>
       `;
       setNotes(template);
    }
  }, [isOpen, candidate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Gabungkan Date & Time jadi format ISO string buat Backend
    // Contoh: 2025-11-27T09:00:00.000Z
    const combinedDateTime = moment(`${date}T${time}`).toDate();

    onSubmit({
      dateTime: combinedDateTime,
      // Onboarding tidak butuh endTime spesifik, kita set saja +8 jam (jam kerja) buat formalitas data
      endTime: moment(combinedDateTime).add(8, 'hours').toDate(), 
      notes_from_hr: notes,
      preference: type // 'Offline' atau 'Online'
    });
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-teal-50">
          <h3 className="text-lg font-bold text-teal-800">Jadwalkan Onboarding (Hari Pertama)</h3>
          <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-400 hover:text-red-500"/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
           
           {/* Info Kandidat */}
           <div className="bg-teal-50 p-3 rounded border border-teal-200">
              <p className="text-sm font-bold text-gray-800">{candidate?.fullName}</p>
              <p className="text-xs text-gray-600">{candidate?.qualification}</p>
           </div>

           <div className="grid grid-cols-2 gap-4">
              {/* Tanggal Masuk */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai Kerja</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-teal-500"
                  required
                />
              </div>

              {/* Jam Datang */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jam Kedatangan</label>
                <input 
                  type="time" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-teal-500"
                  required
                />
              </div>
           </div>

           {/* Tipe Onboarding */}
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metode Onboarding</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2 border rounded bg-white focus:ring-teal-500"
              >
                 <option value="Offline">📍 Offline (Datang ke Kantor - Disarankan)</option>
                 <option value="Online">💻 Online (Via Google Meet - Khusus Remote)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                *Pilih Offline untuk penandatanganan kontrak basah & serah terima aset.
              </p>
           </div>

           {/* Editor Instruksi */}
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instruksi & Dokumen</label>
              <div className="border rounded-md overflow-hidden">
                 <Editor value={notes} onChange={(e)=>setNotes(e.target.value)} containerProps={{ style: { height: '200px' } }} />
              </div>
           </div>

        </form>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex justify-end gap-3">
           <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">Batal</button>
           <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 shadow">Kirim Jadwal Onboarding</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default OnboardingModal;