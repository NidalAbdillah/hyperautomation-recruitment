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
import multiMonthPlugin from '@fullcalendar/multimonth';
import idLocale from '@fullcalendar/core/locales/id';

function ScheduleInterviewModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  candidate, 
  user,
  existingEvents // 🔥 GANTI NAMA: allApplications → existingEvents (lebih jelas)
}) {
  
  // --- State (Default KOSONG) ---
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [notes, setNotes] = useState("");
  const calendarRef = useRef(null);

  // --- Mengisi Form saat Modal Dibuka ---
  useEffect(() => {
    if (isOpen && candidate) {
      // Reset waktu
      setStartTime(null);
      setEndTime(null);

      // --- LOGIKA TEMPLATE DEFAULT ---
      const preferensi = candidate.interview_notes?.preference || 'N/A';
      const catatanManajer = candidate.interview_notes?.manager_notes_for_candidate || "";

      let templateDefault = `
Halo ${candidate.fullName},

Anda diundang untuk wawancara (Preferensi: ${preferensi}).

Detail Wawancara:
(Detil waktu dan link/lokasi akan ditambahkan secara otomatis oleh sistem di bawah pesan ini.)
---
`;

      if (catatanManajer) {
        templateDefault += `
Catatan/Instruksi dari Manajer:
${catatanManajer}
`;
      }
      
      setNotes(templateDefault.trim()); 
    }
  }, [isOpen, candidate]);

  // --- 🔥 ROMBAKAN UTAMA: Kalender Langsung Menerima Data dari Parent ---
  const calendarEvents = useMemo(() => {
    if (!existingEvents || !Array.isArray(existingEvents)) return [];
    
    // 🎯 TIDAK PERLU FILTER LAGI!
    // Data sudah diformat dengan benar dari InterviewSchedulePage.jsx
    // Tinggal tampilkan saja, TAPI exclude kandidat yang sedang dijadwalkan
    
    return existingEvents
      .filter(event => {
        // Jangan tampilkan event kandidat ini sendiri (jika ada)
        // Cek berdasarkan title (karena format dari parent: "Interview: NamaKandidat")
        const candidateFirstName = candidate.fullName.split(' ')[0];
        const isCurrentCandidate = event.title.toLowerCase().includes(candidateFirstName.toLowerCase());
        
        return !isCurrentCandidate; // Exclude kandidat ini
      })
      .map(event => ({
        // Gunakan data yang sudah diformat dari parent
        id: event.id,
        title: event.title, // Sudah format yang benar dari parent
        start: event.start, // Sudah Date object atau ISO string
        end: event.end,
        allDay: event.allDay || false,
        backgroundColor: event.backgroundColor || '#6B7280',
        borderColor: event.borderColor || '#6B7280',
        overlap: false, // Event tidak bisa ditimpa
        extendedProps: event.extendedProps || {}
      }));
  }, [existingEvents, candidate]);

  if (!isOpen) return null;

  // --- Handler Saat Menandai Waktu (Klik & Geser) ---
  const handleDateSelect = (selectionInfo) => {
    setStartTime(selectionInfo.start);
    setEndTime(selectionInfo.end);
  };
  
  // --- Handler Saat Klik Kotak Kosong ---
  const handleDateClick = (clickInfo) => {
    const viewType = clickInfo.view.type;
    
    if (viewType === 'timeGridWeek' || viewType === 'timeGridDay') {
      setStartTime(clickInfo.date);
      setEndTime(moment(clickInfo.date).add(30, 'minutes').toDate());
    } 
    else if (viewType === 'dayGridMonth' || viewType === 'multiMonthYear') {
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.changeView('timeGridDay', clickInfo.dateStr); 
      }
    }
  };

  // --- Handler Saat Klik Nama Bulan ---
  const handleMonthLinkClick = (clickInfo) => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView('dayGridMonth', clickInfo.date);
    }
  };
  
  // --- Handler Tombol Submit ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!startTime || !endTime) {
      Notiflix.Report.warning(
        "Waktu Belum Dipilih", 
        "Silakan tandai (klik dan geser) slot waktu yang diinginkan di kalender.", 
        "Okay"
      );
      return;
    }
    
    onSubmit({
      dateTime: startTime,
      endTime: endTime,
      notes_from_hr: notes,
    });
  };
  
  // --- Format Tampilan Waktu ---
  const formatSelectedTime = () => {
    if (!startTime || !endTime) {
      return "Silakan pilih (klik & geser) slot di kalender...";
    }
    if (moment(startTime).isSame(endTime, 'day')) {
      return `${moment(startTime).format("dddd, DD MMM YYYY (HH:mm")} - ${moment(endTime).format("HH:mm)")}`;
    }
    return `${moment(startTime).format("DD MMM (HH:mm)")} - ${moment(endTime).format("DD MMM (HH:mm)")}`;
  };

  // --- Logika Tombol Nonaktif ---
  const isSubmitDisabled = !startTime || !endTime;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" style={{ backdropFilter: 'blur(2px)' }}>
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
              <input 
                type="text" 
                value={candidate.fullName} 
                readOnly 
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Posisi</label>
              <input 
                type="text" 
                value={candidate.qualification} 
                readOnly 
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Preferensi Manajer</label>
              <input 
                type="text" 
                value={candidate.interview_notes?.preference || 'N/A'} 
                readOnly 
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Waktu Terpilih (Klik & Geser di Kalender)
              </label>
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
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Pesan kustom dari Manajer akan muncul di sini (jika ada)..."
              />
            </div>
          </div>

          {/* --- KOLOM KANAN: KALENDER BESAR --- */}
          <div className="w-full md:w-2/3 p-4 flex-grow overflow-y-auto">
            <FullCalendar
              ref={calendarRef} 
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, multiMonthPlugin]} 
              locale={idLocale}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={calendarEvents} // 🔥 Data sudah bersih dari parent
              selectOverlap={false} // 🎯 PENTING: Tidak bisa select di atas event
              select={handleDateSelect}
              dateClick={handleDateClick}
              navLinks={true}
              navLinkMonthClick={handleMonthLinkClick}
              editable={false}
              selectable={true}
              selectMirror={true}
              allDaySlot={false}
              slotMinTime="08:00:00"
              slotMaxTime="18:00:00"
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

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 flex-shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            Batal
          </button>
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm ${
              isSubmitDisabled 
                ? 'bg-gray-400 cursor-not-allowed'
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