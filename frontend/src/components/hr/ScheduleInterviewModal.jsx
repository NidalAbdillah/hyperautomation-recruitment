// src/components/hr/ScheduleInterviewModal.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import moment from 'moment';

// --- 1. IMPORT FULLCALENDAR & SEMUA PLUGINS ---
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth'; // <-- PLUGIN TAHUNAN (BARU)
import idLocale from '@fullcalendar/core/locales/id'; 

function ScheduleInterviewModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  candidate, 
  user,
  allApplications
}) {
  
  const getInitialTime = () => moment().add(1, 'hour').startOf('hour').toDate();
  const [dateTime, setDateTime] = useState(getInitialTime());
  const [notes, setNotes] = useState("");
  const calendarRef = useRef(null); // Ref untuk mengontrol kalender

  useEffect(() => {
    if (isOpen) {
      setDateTime(getInitialTime());
      setNotes("");
    }
  }, [isOpen]);

  // (Logika 'calendarEvents' tidak berubah, sudah benar)
  const calendarEvents = useMemo(() => {
    if (!allApplications) return [];
    
    return allApplications
      .filter(app => 
        ["INTERVIEW_SCHEDULED", "PENDING_FINAL_DECISION", "HIRED", "ONBOARDING"].includes(app.status) &&
        app.interview_notes?.scheduled_time
      )
      .map(app => ({
        title: `Booked: ${app.fullName.split(' ')[0]}`, 
        start: new Date(app.interview_notes.scheduled_time),
        end: moment(app.interview_notes.scheduled_time).add(1, 'hour').toDate(), 
        allDay: false,
        backgroundColor: '#6B7280', 
        borderColor: '#6B7280'
      }));
  }, [allApplications]);

  if (!isOpen) return null;

  // (Handler 'handleDateClick' tidak berubah, sudah benar)
  const handleDateClick = (clickInfo) => {
    const viewType = clickInfo.view.type;
    if (viewType === 'timeGridWeek' || viewType === 'timeGridDay') {
      setDateTime(clickInfo.date);
    } else if (viewType === 'dayGridMonth' || viewType === 'dayGridYear') {
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.changeView('timeGridDay', clickInfo.dateStr); 
      }
    }
  };
  
  // --- 2. HANDLER BARU (SAAT KLIK NAMA BULAN DI VIEW TAHUNAN) ---
  const handleMonthLinkClick = (clickInfo) => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      // Pindah ke view bulanan (dayGridMonth) untuk tanggal yang diklik
      calendarApi.changeView('dayGridMonth', clickInfo.date);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      dateTime,
      notes_from_hr: notes,
    });
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" style={{ backdropFilter: 'blur(2px)' }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-auto flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Jadwalkan Wawancara</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row overflow-hidden h-full">
          
          {/* --- KOLOM KIRI: FORMULIR --- */}
          <div className="w-full md:w-1/3 p-6 space-y-4 overflow-y-auto border-r flex-shrink-0">
            {/* (Semua field form kandidat, posisi, dll tidak berubah) */}
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
              <label className="block text-sm font-medium text-gray-700">Waktu Terpilih (Klik di Kalender)</label>
              <input 
                type="text" 
                value={moment(dateTime).format("dddd, DD MMMM YYYY - HH:mm")} 
                readOnly 
                className="mt-1 block w-full p-2 border border-blue-500 rounded-md bg-blue-50 text-blue-800 font-semibold" 
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
                placeholder="Contoh: Link Google Meet atau detail lokasi offline..."
              />
            </div>
          </div>

          {/* --- KOLOM KANAN: KALENDER BESAR (FULLCALENDAR) --- */}
          <div className="w-full md:w-2/3 p-4 flex-grow overflow-y-auto">
            <FullCalendar
              ref={calendarRef} 
              
              // --- 3. TAMBAHKAN PLUGIN BARU ---
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, multiMonthPlugin]} 
              
              locale={idLocale}
              initialView="timeGridWeek" // Tetap mulai di 'week'
              
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                // --- 4. TAMBAHKAN VIEW TAHUNAN ('dayGridYear') ---
                right: 'dayGridYear,dayGridMonth,timeGridWeek,timeGridDay'
              }}
              
              events={calendarEvents}
              dateClick={handleDateClick} // Untuk klik di slot hari/jam
              
              // --- 5. TAMBAHKAN HANDLER KLIK BULAN ---
              navLinks={true} // (Tetap true untuk klik angka hari)
              navLinkMonthClick={handleMonthLinkClick} // <-- HANDLER BARU ANDA
              
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

        {/* Tombol Aksi di Footer */}
        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
            Batal
          </button>
          <button 
            type="button" 
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
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