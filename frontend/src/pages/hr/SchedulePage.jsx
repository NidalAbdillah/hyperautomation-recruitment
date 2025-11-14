// src/pages/hr/SchedulePage.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Notiflix from "notiflix";
import { PlusIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

// Impor komponen "anak"
import ScheduleCalendar from "../../components/hr/ScheduleCalendar.jsx";
import ScheduleEventModal from "../../components/hr/ScheduleEventModal";

// Konfigurasi API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_SCHEDULES_URL = `${API_BASE_URL}/api/hr/schedules`;
const API_SCHEDULES_URL_WITH_ID = (id) => `${API_BASE_URL}/api/hr/schedules/${id}`;

// Helper untuk mengambil token
const getAuthToken = () => {
  return localStorage.getItem("token");
};

function SchedulePage() {
  console.log("SchedulePage rendering...");

  // State untuk data, loading, dan error
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk Modal
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalMode, setModalMode] = useState("create"); 
  const [selectedEventData, setSelectedEventData] = useState(null); 

  // Fetch data dari backend
  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching schedules from: ${API_SCHEDULES_URL}`);
      const token = getAuthToken();
      if (!token) {
        throw new Error("User not authenticated. Token missing.");
      }
      
      const response = await axios.get(API_SCHEDULES_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Format data untuk FullCalendar
      const formattedEvents = response.data.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.startDate,
        end: event.endDate,
        description: event.description,
        allDay: false,
      }));

      setAllEvents(formattedEvents);
      console.log("Data fetched successfully:", formattedEvents.length, "events");

    } catch (err) {
      setError(err);
      console.error("Error fetching data:", err);
      Notiflix.Report.failure(
        "Gagal Memuat Data", 
        err.response?.data?.message || "Terjadi kesalahan saat memuat jadwal.", 
        "Okay"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data saat komponen mount
  useEffect(() => {
    console.log("useEffect triggered, fetching schedules...");
    fetchSchedules();
  }, [fetchSchedules]);

  // --- Handlers untuk Kalender ---

  // Handler untuk klik tanggal / drag-select (CREATE event)
  const handleDateSelect = (selectionInfo) => {
    console.log("🔵 SchedulePage: handleDateSelect called:", selectionInfo);
    setModalMode("create");
    setSelectedEventData({
      start: selectionInfo.start,
      end: selectionInfo.end,
    });
    setShowModal(true);
    console.log("🔵 Modal set to open, showModal:", true);
  };

  // Handler untuk klik event yang sudah ada (EDIT event)
  const handleEventClick = (clickInfo) => {
    console.log("Event clicked:", clickInfo.event.id);
    setModalMode("edit");
    setSelectedEventData({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
      description: clickInfo.event.extendedProps.description || "",
    });
    setShowModal(true);
  };
  
  // Handler untuk drag-drop event
  const handleEventDrop = async (dropInfo) => {
    console.log("Event dropped:", dropInfo.event.id);
    const eventId = dropInfo.event.id;
    const newStart = dropInfo.event.start;
    const newEnd = dropInfo.event.end;

    Notiflix.Confirm.show(
      "Konfirmasi Perubahan",
      `Anda yakin ingin memindahkan event "${dropInfo.event.title}"?`,
      "Ya, Pindahkan",
      "Batal",
      async () => {
        Notiflix.Loading.standard("Menyimpan perubahan...");
        try {
          const token = getAuthToken();
          if (!token) throw new Error("Token not found");

          const dataToUpdate = {
            title: dropInfo.event.title,
            startDate: newStart,
            endDate: newEnd,
            description: dropInfo.event.extendedProps.description,
          };
          
          await axios.put(API_SCHEDULES_URL_WITH_ID(eventId), dataToUpdate, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          Notiflix.Loading.remove();
          Notiflix.Report.success("Berhasil", "Jadwal berhasil diperbarui.", "Okay");
          fetchSchedules();

        } catch (error) {
          Notiflix.Loading.remove();
          Notiflix.Report.failure(
            "Gagal Update", 
            error.response?.data?.message || "Gagal memindahkan event.", 
            "Okay"
          );
          dropInfo.revert();
        }
      },
      () => {
        console.log("Drag reverted");
        dropInfo.revert();
      }
    );
  };

  // --- Handlers untuk Modal ---

  const handleCloseModal = () => {
    console.log("Closing modal...");
    setShowModal(false);
    setSelectedEventData(null);
  };

  // Handler submit form (CREATE atau EDIT)
  const handleSubmitModal = async (formData) => {
    console.log("Submitting form:", formData);
    setIsSubmitting(true);
    Notiflix.Loading.standard("Menyimpan...");
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Token not found");
      
      const headers = { Authorization: `Bearer ${token}` };

      const dataToSubmit = {
        title: formData.title,
        startDate: formData.start,
        endDate: formData.end,
        description: formData.description,
      };

      if (modalMode === "create") {
        await axios.post(API_SCHEDULES_URL, dataToSubmit, { headers });
        Notiflix.Report.success("Berhasil Ditambah", "Event baru berhasil disimpan.", "Okay");
      } else {
        const eventId = selectedEventData.id;
        await axios.put(API_SCHEDULES_URL_WITH_ID(eventId), dataToSubmit, { headers });
        Notiflix.Report.success("Berhasil Diubah", "Perubahan event berhasil disimpan.", "Okay");
      }
      
      Notiflix.Loading.remove();
      fetchSchedules();
      handleCloseModal();

    } catch (error) {
      Notiflix.Loading.remove();
      Notiflix.Report.failure(
        "Gagal Menyimpan", 
        error.response?.data?.message || "Terjadi kesalahan.", 
        "Okay"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler DELETE event
  const handleDeleteEvent = async (eventId) => {
    console.log("Deleting event:", eventId);
    setIsSubmitting(true);
    Notiflix.Loading.standard("Menghapus...");
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Token not found");

      await axios.delete(API_SCHEDULES_URL_WITH_ID(eventId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      Notiflix.Loading.remove();
      Notiflix.Report.success("Berhasil Dihapus", "Event telah dihapus.", "Okay");
      fetchSchedules();
      handleCloseModal();

    } catch (error) {
      Notiflix.Loading.remove();
      Notiflix.Report.failure(
        "Gagal Menghapus", 
        error.response?.data?.message || "Terjadi kesalahan.", 
        "Okay"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="schedule-page-container p-4 md:p-8">
      {/* Header Halaman */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Kalender Event</h2>
        <button
          onClick={() => handleDateSelect({ start: new Date(), end: new Date() })}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md inline-flex items-center transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Tambah Event Manual
        </button>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="text-center p-8 text-gray-600">
          <CalendarDaysIcon className="h-12 w-12 mx-auto mb-3 text-gray-400 animate-pulse" />
          <p className="text-lg">Memuat data kalender...</p>
        </div>
      )}
      
      {/* Error State */}
      {error && !loading && (
        <div className="text-center p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 font-medium">
              Gagal memuat data jadwal. Silakan coba lagi.
            </p>
            <button
              onClick={fetchSchedules}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* Kalender */}
      {!loading && !error && (
        <ScheduleCalendar
          events={allEvents}
          onEventClick={handleEventClick}
          onDateSelect={handleDateSelect}
          onEventDrop={handleEventDrop}
        />
      )}

      {/* Modal */}
      <ScheduleEventModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
        onDelete={handleDeleteEvent}
        isLoading={isSubmitting}
        initialData={selectedEventData}
        mode={modalMode}
      />
    </div>
  );
}

export default SchedulePage;