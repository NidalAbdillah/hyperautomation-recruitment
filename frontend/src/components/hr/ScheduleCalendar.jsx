// src/components/hr/ScheduleCalendar.jsx
import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import idLocale from '@fullcalendar/core/locales/id';
import moment from 'moment';

/**
 * Komponen "Dumb" untuk menampilkan FullCalendar.
 * Menerima data dan handler dari 'SchedulePage.jsx'.
 */
function ScheduleCalendar({ events, onEventClick, onDateSelect, onEventDrop }) {
  const calendarRef = useRef(null);

  // Handler untuk drag-select (klik dan geser)
  const handleDragSelect = (selectionInfo) => {
    console.log("🟢 Drag-select triggered:", selectionInfo);
    console.log("   Start:", selectionInfo.start);
    console.log("   End:", selectionInfo.end);
    console.log("   AllDay:", selectionInfo.allDay);
    
    // 🚨 FILTER 1: Abaikan kalau ini klik biasa (bukan drag)
    const isDrag = selectionInfo.start.getTime() !== selectionInfo.end.getTime();
    if (!isDrag) {
      console.log("⚠️ Ignored: This is a click, not a drag");
      return; // STOP di sini
    }

    // 🚨 FILTER 2: Abaikan kalau di month/year view (allDay: true)
    if (selectionInfo.allDay) {
      console.log("⚠️ Ignored: Selection in month/year view");
      return; // STOP di sini
    }

    // ✅ Kalau sampai sini, berarti drag yang valid
    if (onDateSelect) {
      console.log("✅ Valid drag detected, calling onDateSelect...");
      console.log("   Sending start:", selectionInfo.start);
      console.log("   Sending end:", selectionInfo.end);
      onDateSelect(selectionInfo);
    } else {
      console.warn("❌ onDateSelect prop is undefined!");
    }
  };

  // Handler untuk klik tanggal (single click)
  const handleDateClick = (clickInfo) => {
    console.log("🟡 Date clicked:", clickInfo.dateStr, "View:", clickInfo.view.type);
    const viewType = clickInfo.view.type;
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;

    // Jika di view Bulan/Tahun, HANYA pindah ke view Hari
    if (viewType === 'dayGridMonth' || viewType === 'multiMonthYear') {
      console.log("📅 Month/Year view detected, switching to day view...");
      calendarApi.changeView('timeGridDay', clickInfo.dateStr);
      return; // STOP di sini
    } 
    
    // Jika sudah di view Hari/Minggu, buka modal
    if (viewType === 'timeGridDay' || viewType === 'timeGridWeek') {
      console.log("🕒 Day/Week view detected, opening modal...");
      if (onDateSelect) {
        const selectionInfo = {
          start: clickInfo.date,
          end: moment(clickInfo.date).add(1, 'hour').toDate(), 
          allDay: false
        };
        onDateSelect(selectionInfo);
      } else {
        console.warn("❌ onDateSelect prop is undefined!");
      }
    }
  };

  // Handler untuk klik event yang sudah ada
  const handleEventClick = (clickInfo) => {
    console.log("🔵 Event clicked:", clickInfo.event.title);
    if (onEventClick) {
      onEventClick(clickInfo);
    }
  };

  // Handler untuk drag-drop event
  const handleEventDrop = (dropInfo) => {
    console.log("🟣 Event dropped:", dropInfo.event.title);
    if (onEventDrop) {
      onEventDrop(dropInfo);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <FullCalendar
        ref={calendarRef}
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          multiMonthPlugin,
        ]}
        locale={idLocale}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay',
        }}
        
        events={events}

        // Interaksi
        selectable={true}
        editable={true}
        select={handleDragSelect}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        
        // Tampilan
        navLinks={true}
        height="auto"
        allDaySlot={false}
        slotMinTime="08:00:00"
        slotMaxTime="18:00:00"
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
  );
}

export default ScheduleCalendar;