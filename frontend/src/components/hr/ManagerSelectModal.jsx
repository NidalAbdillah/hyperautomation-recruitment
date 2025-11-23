// src/components/hr/ManagerSelectModal.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Notiflix from 'notiflix';
import axios from 'axios';
import moment from 'moment';
import Editor from 'react-simple-wysiwyg'; // ✅ TAMBAH IMPORT

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import idLocale from '@fullcalendar/core/locales/id';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_GET_SCHEDULES_URL = `${API_BASE_URL}/api/hr/schedules`;
const getAuthToken = () => localStorage.getItem("token");

function ManagerSelectModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  candidate 
}) {
  const [preference, setPreference] = useState("Online"); 
  const [managerNotes, setManagerNotes] = useState(""); // ✅ Ini akan jadi HTML
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [allSchedules, setAllSchedules] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const calendarRef = useRef(null);

  const fetchSchedules = useCallback(async () => {
    setLoadingCalendar(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Missing auth token");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(API_GET_SCHEDULES_URL, { headers });
      setAllSchedules(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching schedules:", err);
      Notiflix.Notify.failure("Gagal memuat data kalender.");
    } finally {
      setLoadingCalendar(false);
    }
  }, []);

  // ✅ PERBAIKAN: FORM SELALU KOSONG UNTUK MANAJER
  useEffect(() => {
    if (isOpen && candidate) {
      setPreference("Online");
      
      // ✅ DEFAULT KOSONG - Biar Manajer isi sendiri dari awal
      setManagerNotes("");
      console.log("⚠️ Form dikosongkan untuk input baru Manajer.");
      
      setStartTime(null);
      setEndTime(null);
      fetchSchedules(); 
    }
  }, [isOpen, candidate, fetchSchedules]);

  const calendarEvents = useMemo(() => {
    return allSchedules.map(event => {
      const isInterviewEvent = !!event.applicationId;
      return {
        id: event.id,
        title: isInterviewEvent ? `Booked (Interview)` : event.title,
        start: event.startDate,
        end: event.endDate,
        backgroundColor: isInterviewEvent ? '#6B7280' : '#DC2626',
        borderColor: isInterviewEvent ? '#6B7280' : '#DC2626',
        overlap: false,
      };
    });
  }, [allSchedules]);

  if (!isOpen) return null;

  const handleDateSelect = (selectionInfo) => {
    setStartTime(selectionInfo.start);
    setEndTime(selectionInfo.end);
  };
  
  const handleDateClick = (clickInfo) => {
    const viewType = clickInfo.view.type;
    if (viewType === 'timeGridWeek' || viewType === 'timeGridDay') {
      setStartTime(clickInfo.date);
      setEndTime(moment(clickInfo.date).add(1, 'hour').toDate());
    } else if (calendarRef.current) {
      calendarRef.current.getApi().changeView('timeGridDay', clickInfo.dateStr); 
    }
  };

  // ✅ HANDLER UNTUK WYSIWYG EDITOR
  const handleNotesChange = (e) => {
    const htmlContent = e.target.value;
    setManagerNotes(htmlContent);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startTime || !endTime) {
      Notiflix.Report.warning(
        "Usulan Waktu Belum Dipilih", 
        "Silakan tandai (klik dan geser) slot waktu di kalender.", 
        "Okay"
      );
      return;
    }
    
    // ✅ Kirim data dengan notes sebagai HTML
    onSubmit({
      preference,
      manager_notes_for_candidate: managerNotes, // HTML format
      proposedStart: startTime,
      proposedEnd: endTime
    });
  };
  
  const formatSelectedTime = () => {
    if (!startTime || !endTime) return "Silakan pilih slot di kalender...";
    return `${moment(startTime).format("dddd, DD MMM YYYY (HH:mm")} - ${moment(endTime).format("HH:mm)")}`;
  };

  const isSubmitDisabled = !startTime || !endTime || loadingCalendar;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" style={{ backdropFilter: 'blur(2px)' }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">Request Jadwal Wawancara</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body: Form + Calendar (Side by Side) */}
        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
          
          {/* LEFT: Form Column */}
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
              <label htmlFor="preference" className="block text-sm font-medium text-gray-700">
                Preferensi Wawancara*
              </label>
              <select 
                id="preference" 
                value={preference} 
                onChange={(e) => setPreference(e.target.value)} 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                required 
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Usulan Waktu (Pilih di Kalender)
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

            {/* ✅ GANTI TEXTAREA JADI WYSIWYG EDITOR */}
            <div>
              <label htmlFor="managerNotes" className="block text-sm font-medium text-gray-700 mb-2">
                Instruksi / Pesan Kustom (Opsional)
              </label>
              <Editor
                id="managerNotes"
                value={managerNotes}
                onChange={handleNotesChange}
                containerProps={{ 
                  style: { 
                    minHeight: "200px", 
                    width: "100%",
                    border: "1px solid #D1D5DB",
                    borderRadius: "0.375rem"
                  } 
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format HTML didukung. Pesan ini akan dikirim ke kandidat bersama undangan.
              </p>
            </div>
          </div>

          {/* RIGHT: Calendar Column */}
          <div className="w-full md:w-2/3 p-4 flex-grow overflow-y-auto">
            {loadingCalendar ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Memuat Kalender Perusahaan...
              </div>
            ) : (
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, multiMonthPlugin]}
                locale={idLocale}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={calendarEvents}
                selectOverlap={false}
                select={handleDateSelect}
                dateClick={handleDateClick}
                navLinks={true}
                editable={false}
                selectable={true}
                selectMirror={true}
                allDaySlot={false}
                slotMinTime="08:00:00"
                slotMaxTime="18:00:00"
                height="auto"
                slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
              />
            )}
          </div>
        </div>
        
        {/* Footer: Buttons */}
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
            Kirim Request ke HR
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ManagerSelectModal;