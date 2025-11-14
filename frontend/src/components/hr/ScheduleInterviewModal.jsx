import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import moment from 'moment';
import Notiflix from 'notiflix';

// --- 1. IMPORT FULLCALENDAR & SEMUA PLUGINS ---
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth'; // <-- Plugin Tahunan
import idLocale from '@fullcalendar/core/locales/id'; // <-- Plugin Bahasa Indonesia (24-Jam)

function ScheduleInterviewModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  candidate, 
  user,
  allApplications // <-- "Kalender Kebenaran" kita
}) {
  
  // --- State (Default KOSONG) ---
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [notes, setNotes] = useState("");
  const calendarRef = useRef(null); // Ref untuk mengontrol API kalender

  // --- Mengisi Form saat Modal Dibuka ---
// --- 2. PERBAIKAN: Gunakan useEffect untuk mengisi form ---
  useEffect(() => {
    if (isOpen && candidate) {
      // Set waktu default (null)
      setStartTime(null);
      setEndTime(null);

      // --- LOGIKA TEMPLATE DEFAULT ---
      const preferensi = candidate.interview_notes?.preference || 'N/A';
      const catatanManajer = candidate.interview_notes?.manager_notes_for_candidate || "";

      // 1. Buat template awal
      let templateDefault = `
          Halo ${candidate.fullName},

          Anda diundang untuk wawancara (Preferensi: ${preferensi}).

          Detail Wawancara:
          (Detil waktu dan link/lokasi akan ditambahkan secara otomatis oleh sistem di bawah pesan ini.)
          ---
          `;

                // 2. Tambahkan catatan manajer (jika ada)
                if (catatanManajer) {
                  templateDefault += `
          Catatan/Instruksi dari Manajer:
          ${catatanManajer}
          `;
      }
      
      // 3. Set state 'notes' dengan template yang sudah jadi
      setNotes(templateDefault.trim()); 
      // --- BATAS LOGIKA TEMPLATE ---
    }
  }, [isOpen, candidate]); // Jalankan saat modal dibuka

  // --- Logika "Kalender Kebenaran" (Mengubah data DB menjadi Event) ---
  const calendarEvents = useMemo(() => {
    if (!allApplications) return [];
    
    return allApplications
      .filter(app => 
        ["INTERVIEW_SCHEDULED", "PENDING_FINAL_DECISION", "HIRED", "ONBOARDING"].includes(app.status) &&
        app.interview_notes?.scheduled_time &&
        app.id !== candidate.id // <-- Tambahan: Jangan blok jadwal kandidat ini sendiri
      )
      .map(app => ({
        title: `Booked: ${app.fullName.split(' ')[0]}`, 
        start: new Date(app.interview_notes.scheduled_time),
        end: app.interview_notes.scheduled_end_time 
             ? new Date(app.interview_notes.scheduled_end_time) 
             : moment(app.interview_notes.scheduled_time).add(1, 'hour').toDate(), 
        allDay: false,
        backgroundColor: '#6B7280', 
        borderColor: '#6B7280',
        overlap: false, // <-- Event ini tidak boleh ditimpa
      }));
  }, [allApplications, candidate]); // <-- Tambahkan candidate di dependency

  if (!isOpen) return null;

  // --- Handler Saat Menandai Waktu (Klik & Geser) ---
  const handleDateSelect = (selectionInfo) => {
    // 'selectionInfo' berisi 'start' dan 'end' dari blok yang Anda tandai
    setStartTime(selectionInfo.start);
    setEndTime(selectionInfo.end);
  };
  
  // --- Handler Saat Klik Kotak Kosong (di view Bulan/Tahun) ---
  const handleDateClick = (clickInfo) => {
    const viewType = clickInfo.view.type;
    
    // Jika diklik di view Waktu (Week/Day), set waktunya
    if (viewType === 'timeGridWeek' || viewType === 'timeGridDay') {
      setStartTime(clickInfo.date);
      // Set endTime 30 menit setelahnya (default)
      setEndTime(moment(clickInfo.date).add(30, 'minutes').toDate());
    } 
    // Jika diklik di view Tanggal (Month/Year)
    else if (viewType === 'dayGridMonth' || viewType === 'multiMonthYear') {
      // Pindahkan view ke harian (Day)
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.changeView('timeGridDay', clickInfo.dateStr); 
      }
    }
  };

  // --- Handler Saat Klik Nama Bulan (di view Tahun) ---
  const handleMonthLinkClick = (clickInfo) => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      // Pindah ke view bulanan (Month)
      calendarApi.changeView('dayGridMonth', clickInfo.date);
    }
  };
  
  // --- Handler Tombol Submit ---
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validasi: Pastikan waktu sudah dipilih
    if (!startTime || !endTime) {
      Notiflix.Report.warning(
        "Waktu Belum Dipilih", 
        "Silakan tandai (klik dan geser) slot waktu yang diinginkan di kalender.", 
        "Okay"
      );
      return;
    }
    onSubmit({
      dateTime: startTime,  // (Nama variabel di 'onSubmit' tetap 'dateTime' agar konsisten)
      endTime: endTime,   // Kirim endTime
      notes_from_hr: notes, // Kirim pesan (yang mungkin sudah diedit HR)
    });
  };
  
  // --- Format Tampilan Waktu (Sudah Benar) ---
  const formatSelectedTime = () => {
    if (!startTime || !endTime) {
      return "Silakan pilih (klik & geser) slot di kalender...";
    }
    if (moment(startTime).isSame(endTime, 'day')) {
      return `${moment(startTime).format("dddd, DD MMM YYYY (HH:mm")} - ${moment(endTime).format("HH:mm)")}`;
    }
    return `${moment(startTime).format("DD MMM (HH:mm)")} - ${moment(endTime).format("DD MMM (HH:mm)")}`;
  };

  // --- Logika Tombol Nonaktif (Disabled) ---
  const isSubmitDisabled = !startTime || !endTime;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" style={{ backdropFilter: 'blur(2px)' }}>
      {/* Modal Gede (max-w-6xl) */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-auto flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Jadwalkan Wawancara</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form (Layout 2 Kolom) */}
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row overflow-hidden h-full">
          
          {/* --- KOLOM KIRI: FORMULIR --- */}
          <div className="w-full md:w-1/3 p-6 space-y-4 overflow-y-auto border-r flex-shrink-0">
            <div>
              <label className="block text-sm font-medium text-gray-700">Kandidat</label>
              <input type="text" value={candidate.fullName} readOnly className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Posisi</label>
              <input type="text" value={candidate.qualification} readOnly className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Preferensi Manajer</label>
              <input type="text" value={candidate.interview_notes?.preference || 'N/A'} readOnly className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Waktu Terpilih (Klik & Geser di Kalender)</label>
              <input 
                type="text" 
                value={formatSelectedTime()} 
                readOnly 
                className={`mt-1 block w-full p-2 border rounded-md font-semibold ${
                  !startTime ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-800 border-blue-500'
                }`}
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Pesan Kustom / Catatan
              </label>
              <textarea
                id="notes"
                value={notes} // <-- Nilai defaultnya dari 'useEffect'
                onChange={(e) => setNotes(e.target.value)} // <-- Staff HR bisa mengedit
                rows={5}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Pesan kustom dari Manajer akan muncul di sini (jika ada)..."
              />
            </div>
          </div>

          {/* --- KOLOM KANAN: KALENDER BESAR (FULLCALENDAR) --- */}
          <div className="w-full md:w-2/3 p-4 flex-grow overflow-y-auto">
            <FullCalendar
              ref={calendarRef} 
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, multiMonthPlugin]} 
              locale={idLocale} // <-- Paksa 24-jam & Bahasa Indonesia
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay' // <-- Ada 'Year'
              }}
              events={calendarEvents} // <-- Data dari DB
              
              // --- INI PERUBAHANNYA ---
              selectOverlap={false} // <-- INI YANG PALING PENTING
              // --- BATAS PERUBAHAN ---
              
              select={handleDateSelect} // <-- Handler untuk "Menandai"
              dateClick={handleDateClick} // <-- Handler untuk "Klik" (di Month/Year)
              navLinks={true} // <-- Angka hari bisa diklik
              navLinkMonthClick={handleMonthLinkClick} // <-- Nama bulan (di Year) bisa diklik
              editable={false}
              selectable={true}
              selectMirror={true}
              allDaySlot={false}
              slotMinTime="08:00:00"
              slotMaxTime="18:00:00" // (Menampilkan slot 17:00 - 18:00)
              height="auto"
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
            />
          </div>
          
        </form>

        {/* Tombol Aksi di Footer */}
        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 flex-shrink-0">
          <button type="button" onClick={onClose} className="text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
            Batal
          </button>
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={isSubmitDisabled} // <-- Logika Tombol Nonaktif
            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm ${
              isSubmitDisabled 
                ? 'bg-gray-400 cursor-not-allowed' // <-- Tampilan Nonaktif
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Jadwalkan & Kirim Undangan
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ScheduleInterviewModal;