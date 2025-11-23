import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import moment from 'moment';
import Notiflix from 'notiflix';
import Editor from 'react-simple-wysiwyg'; 

// FullCalendar Imports
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
  existingEvents = [], // 🔥 INI HARUS BERISI SEMUA JADWAL DARI DB
  interviewStage = "manager" 
}) {
  
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [notes, setNotes] = useState("");
  const [meetingType, setMeetingType] = useState('Online');
  const calendarRef = useRef(null);

  // --- LOGIKA UTAMA: PRE-FILL vs CLEAN SLATE ---
  useEffect(() => {
    if (isOpen && candidate) {
      
      let defaultStart = null;
      let defaultEnd = null;
      let isPreFilled = false;

      // ✅ 1. SET DEFAULT TIPE MEETING
      // Kalau tahap Manager: Ikut preferensi awal kandidat
      // Kalau tahap Final: Default Online (tapi bisa diubah)
      const defaultPref = candidate.interview_notes?.preference || 'Online';
      setMeetingType(defaultPref);

      // ✅ 2. LOGIKA TANGGAL (INTI PERMINTAAN ANDA)
      
      // KONDISI A: TAHAP MANAGER (Ikuti Request Manajer)
      if (interviewStage === 'manager') {
        const proposedStart = candidate.interview_notes?.manager_proposed_start;
        const proposedEnd = candidate.interview_notes?.manager_proposed_end;

        if (proposedStart && proposedEnd) {
          defaultStart = new Date(proposedStart);
          defaultEnd = new Date(proposedEnd);
          isPreFilled = true; // Tandai sudah diisi
          console.log("✅ [Manager Mode] Mengisi form sesuai request Manajer");
        }
      } 
      
      // KONDISI B: TAHAP HR / FINAL (Bersih / Reset)
      // Jika tahap Final, variabel isPreFilled pasti false (karena blok if di atas di-skip)
      if (!isPreFilled) {
         // Default: 1 jam dari sekarang (Hanya placeholder)
         // Staff HR harus klik tanggal sendiri nanti
         defaultStart = moment().add(1, 'hour').minute(0).second(0).toDate();
         defaultEnd = moment(defaultStart).add(1, 'hour').toDate();
         console.log(`🧹 [${interviewStage} Mode] Form di-reset bersih. Silakan pilih slot manual.`);
      }
      
      // Set State
      setStartTime(defaultStart);
      setEndTime(defaultEnd);
      
      // Pindahkan view kalender ke tanggal tersebut
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.gotoDate(defaultStart);
        
        // Highlight visual (hanya jika pre-filled)
        // Kalau HR (bersih), highlightnya opsional biar ga bingung
        setTimeout(() => {
          calendarApi.select(defaultStart, defaultEnd);
        }, 300);
      }
      
      // ✅ 3. LOGIKA TEMPLATE EMAIL (WYSIWYG)
      let templateHTML = "";
      const catatanManajer = candidate.interview_notes?.manager_notes_for_candidate || "";

      if (interviewStage === 'manager') {
        templateHTML = `
          <p>Halo <strong>${candidate.fullName}</strong>,</p>
          <p>Anda diundang untuk <strong>Wawancara Teknis</strong>.</p>
          ${catatanManajer ? `<p><strong>Pesan dari User:</strong><br/>${catatanManajer}</p>` : ''}
          <p>Siapkan portofolio Anda.</p>
        `;
      } else {
        // Template Final (Polos/Formal)
        templateHTML = `
          <p>Halo <strong>${candidate.fullName}</strong>,</p>
          <p>Selamat! Anda lolos ke tahap <strong>Final Interview & Administrasi</strong>.</p>
          <p>Mohon menyiapkan dokumen berikut:</p>
          <ul>
            <li>KTP Asli</li>
            <li>Ijazah & Transkrip Asli</li>
          </ul>
        `;
      }
      
      setNotes(templateHTML); 
    }
  }, [isOpen, candidate, interviewStage]);

  // --- LOGIKA VISUAL KALENDER ---
  const calendarEvents = useMemo(() => {
    if (!existingEvents || !Array.isArray(existingEvents)) return [];
    return existingEvents.map(event => ({
        ...event,
        // Pastikan event lain warnanya abu-abu biar HR tau itu "Taken"
        backgroundColor: event.extendedProps?.type === 'manual' ? '#EF4444' : '#6B7280',
        borderColor: event.extendedProps?.type === 'manual' ? '#EF4444' : '#6B7280',
        // Pastikan judulnya jelas
        title: event.title || 'Booked'
    }));
  }, [existingEvents]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startTime || !endTime) return Notiflix.Report.warning("Waktu Kosong", "Pilih slot di kalender.", "OK");
    
    onSubmit({
      dateTime: startTime,
      endTime: endTime,
      notes_from_hr: notes,
      preference: meetingType // Kirim preferensi baru
    });
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">
            {interviewStage === 'manager' ? 'Jadwalkan: Wawancara Teknis' : 'Jadwalkan: Wawancara Final (HR)'}
          </h3>
          <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-400 hover:text-red-500"/></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row overflow-hidden h-full">
          
          {/* KIRI: Form Input */}
          <div className="w-full md:w-1/3 p-6 space-y-4 overflow-y-auto border-r flex-shrink-0 bg-gray-50">
            <div className="bg-white p-3 rounded border shadow-sm space-y-1">
               <p className="text-sm font-bold text-gray-900">{candidate?.fullName}</p>
               <p className="text-xs text-gray-500">{candidate?.qualification}</p>
            </div>

            {/* Dropdown Tipe Meeting */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Pertemuan</label>
              <select 
                value={meetingType} 
                onChange={(e)=>setMeetingType(e.target.value)} 
                className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500"
              >
                 <option value="Online">📹 Online (Google Meet)</option>
                 <option value="Offline">📍 Offline (Kantor)</option>
              </select>
            </div>

            {/* Input Waktu Read-Only (Hasil Klik Kalender) */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Terpilih</label>
               <input 
                 type="text" 
                 readOnly 
                 value={startTime ? `${moment(startTime).format("DD MMM, HH:mm")} - ${moment(endTime).format("HH:mm")}` : "Pilih di Kalender ->"}
                 className="w-full p-2 border rounded bg-gray-100 text-gray-700 font-bold"
               />
            </div>

            {/* WYSIWYG */}
            <div className="flex-grow">
               <label className="block text-sm font-medium text-gray-700 mb-1">Isi Email</label>
               <Editor value={notes} onChange={(e)=>setNotes(e.target.value)} containerProps={{ style: { height: '200px' } }} />
            </div>
          </div>

          {/* KANAN: Kalender Besar */}
          <div className="w-full md:w-2/3 p-4 flex-grow overflow-y-auto">
             <FullCalendar 
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                locale={idLocale}
                events={calendarEvents}
                
                // 🔥 FITUR KUNCI: Gak bisa nabrak jadwal lain
                selectOverlap={false} 
                
                // Handler
                selectable={true}
                select={(info) => { setStartTime(info.start); setEndTime(info.end); }}
                
                // Tampilan
                allDaySlot={false}
                slotMinTime="08:00:00"
                slotMaxTime="18:00:00"
                height="100%"
                headerToolbar={{ left: 'prev,next today', center: 'title', right: 'timeGridWeek,timeGridDay' }}
             />
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex justify-end gap-3">
           <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">Batal</button>
           <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow">Simpan Jadwal</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ScheduleInterviewModal;