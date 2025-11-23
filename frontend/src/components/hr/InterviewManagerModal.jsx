import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import moment from 'moment';
import Notiflix from 'notiflix';
import Editor from 'react-simple-wysiwyg'; 

// FullCalendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import idLocale from '@fullcalendar/core/locales/id';

function InterviewManagerModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  candidate, 
  existingEvents = [] 
}) {
  
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [notes, setNotes] = useState("");
  const [meetingType, setMeetingType] = useState('Online');
  const calendarRef = useRef(null);

  // --- LOGIKA KHUSUS MANAJER: AUTO-FILL ---
  useEffect(() => {
    if (isOpen && candidate) {
      
      // 1. Ambil Usulan Manajer
      const proposedStart = candidate.interview_notes?.manager_proposed_start;
      const proposedEnd = candidate.interview_notes?.manager_proposed_end;
      
      let startVal, endVal;

      if (proposedStart && proposedEnd) {
        startVal = new Date(proposedStart);
        endVal = new Date(proposedEnd);
        console.log("✅ [Manager Modal] Auto-fill jadwal dari Manajer");
      } else {
        // Fallback (Jaga-jaga kalau kosong)
        startVal = moment().add(1, 'hour').minute(0).second(0).toDate();
        endVal = moment(startVal).add(1, 'hour').toDate();
      }

      setStartTime(startVal);
      setEndTime(endVal);
      setMeetingType(candidate.interview_notes?.preference || 'Online');

      // 2. Pindah Kalender
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.gotoDate(startVal);
        setTimeout(() => calendarApi.select(startVal, endVal), 300);
      }

      // 3. Template Email Teknis
      const catatanManajer = candidate.interview_notes?.manager_notes_for_candidate || "";
      const templateHTML = `
        <p>Halo <strong>${candidate.fullName}</strong>,</p>
        <p>Anda diundang untuk <strong>Wawancara Teknis</strong> dengan User.</p>
        ${catatanManajer ? `<p><strong>Pesan dari User:</strong><br/>${catatanManajer}</p>` : ''}
        <p>Mohon siapkan portofolio dan pastikan koneksi internet stabil.</p>
      `;
      setNotes(templateHTML.trim()); 
    }
  }, [isOpen, candidate]);

  const calendarEvents = useMemo(() => {
    if (!existingEvents || !Array.isArray(existingEvents)) return [];
    return existingEvents.map(event => ({
        id: event.id,
        title: event.title || 'Booked',
        start: event.start,
        end: event.end,
        backgroundColor: '#6B7280', 
        borderColor: '#6B7280',
        overlap: false
    }));
  }, [existingEvents]);

  const handleDateSelect = (info) => {
    setStartTime(info.start);
    setEndTime(info.end);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startTime || !endTime) return Notiflix.Report.warning("Waktu Kosong", "Pilih slot di kalender.", "OK");
    
    onSubmit({
      dateTime: startTime,
      endTime: endTime,
      notes_from_hr: notes,
      preference: meetingType
    });
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-auto flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b bg-blue-50">
          <h3 className="text-lg font-bold text-blue-800">Jadwalkan Wawancara Teknis (Manajer)</h3>
          <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-400 hover:text-red-500"/></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row overflow-hidden h-full">
          <div className="w-full md:w-1/3 p-6 space-y-4 overflow-y-auto border-r flex-shrink-0 bg-white">
            <div className="bg-blue-50 p-3 rounded border border-blue-200 shadow-sm space-y-1">
               <p className="text-sm font-bold text-gray-900">{candidate?.fullName}</p>
               <p className="text-xs text-gray-500">{candidate?.qualification}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Pertemuan</label>
              <select value={meetingType} onChange={(e)=>setMeetingType(e.target.value)} className="w-full p-2 border rounded bg-white">
                 <option value="Online">📹 Online (Google Meet)</option>
                 <option value="Offline">📍 Offline (Kantor)</option>
              </select>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Terpilih</label>
               <input type="text" readOnly value={startTime ? `${moment(startTime).format("DD MMM, HH:mm")} - ${moment(endTime).format("HH:mm")}` : "Pilih di Kalender ->"} className="w-full p-2 border rounded bg-gray-100 font-bold" />
            </div>

            <div className="flex-grow">
               <label className="block text-sm font-medium text-gray-700 mb-1">Isi Email Undangan</label>
               <Editor value={notes} onChange={(e)=>setNotes(e.target.value)} containerProps={{ style: { height: '250px' } }} />
            </div>
          </div>

          <div className="w-full md:w-2/3 p-4 flex-grow overflow-y-auto">
             <FullCalendar 
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                locale={idLocale}
                events={calendarEvents}
                selectOverlap={false}
                selectable={true}
                selectMirror={true}
                select={handleDateSelect}
                allDaySlot={false}
                slotMinTime="08:00:00"
                slotMaxTime="18:00:00"
                height="100%"
                headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
             />
          </div>
        </form>

        <div className="p-4 border-t bg-white flex justify-end gap-3">
           <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">Batal</button>
           <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow">Kirim Undangan Teknis</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
export default InterviewManagerModal;