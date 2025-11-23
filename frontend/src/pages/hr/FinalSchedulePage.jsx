import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Notiflix from 'notiflix';
import FinalScheduleTable from '../../components/hr/FinalScheduleTable'; // Pastikan pakai Table Final
import FinalScheduleModal from '../../components/hr/FinalScheduleModal';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_GET_APPLICATIONS_URL = `${API_BASE_URL}/api/hr/applications`;
const API_GET_SCHEDULES_URL = `${API_BASE_URL}/api/hr/schedules`; 
const API_TRIGGER_SCHEDULE_URL = (id) => `${API_BASE_URL}/api/hr/applications/${id}/trigger-schedule`; 
const getAuthToken = () => localStorage.getItem("token");

export const STATUS_DISPLAY_MAP = {
  "PENDING_FINAL_DECISION": { label: "Perlu Jadwal Final", color: "bg-yellow-100 text-yellow-800" },
  "FINAL_INTERVIEW_SCHEDULED": { label: "Final Scheduled", color: "bg-green-100 text-green-800" },
  "default": { label: "Unknown", color: "bg-gray-100 text-gray-800" }
};

function FinalSchedulePage() {
  const { user } = useAuth();
  const [allApplications, setAllApplications] = useState([]); 
  const [allSchedules, setAllSchedules] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };
      const [appRes, schedRes] = await Promise.all([
        axios.get(API_GET_APPLICATIONS_URL, { headers }),
        axios.get(API_GET_SCHEDULES_URL, { headers })
      ]);
      
      setAllApplications(Array.isArray(appRes.data) ? appRes.data : []);
      
      // ✅ Pastikan schedule ditarik semua
      const schedules = Array.isArray(schedRes.data) ? schedRes.data : [];
      console.log("🗓️ Loaded Schedules:", schedules.length); 
      setAllSchedules(schedules); 

    } catch (err) {
      Notiflix.Report.failure("Gagal", "Gagal memuat data.", "OK");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // --- 2. FILTER LIST KANDIDAT (Khusus Tahap Final) ---
  const finalQueue = useMemo(() => {
    return allApplications.filter(app => 
      ["PENDING_FINAL_DECISION", "FINAL_INTERVIEW_SCHEDULED"].includes(app.status)
    );
  }, [allApplications]);
  
  // --- 3. LOGIKA KALENDER (TAMPILKAN SEMUA EVENT DARI DB) ---
  const masterCalendarEvents = useMemo(() => {
    if (!allSchedules.length) return [];

    // A. Event Manual HR (Rapat, Libur, dll)
    const hrEvents = allSchedules.filter(e => !e.applicationId).map(e => ({
        id: `manual-${e.id}`, 
        title: `[HR] ${e.title}`, 
        start: e.startDate, 
        end: e.endDate, 
        backgroundColor: '#EF4444', 
        overlap: false
    }));

    // B. Event Wawancara (Manajer & HR)
    const candidateEvents = allSchedules.filter(e => e.applicationId).map(e => {
        const app = allApplications.find(a => a.id === e.applicationId);
        
        // Walaupun app-nya null (mungkin dihapus), event jadwal TETAP dimunculkan sebagai "Busy"
        const title = app ? app.fullName.split(' ')[0] : 'Busy Slot';
        const type = e.interviewType || 'manager';
        
        // Warna: Abu-abu (History Manajer), Hijau (Final)
        const color = type === 'final_hr' ? '#059669' : '#6B7280';

        return {
          id: e.id, 
          title: `${title} (${type === 'manager' ? 'Teknis' : 'Final'})`, 
          start: e.startDate, 
          end: e.endDate, 
          backgroundColor: color,
          overlap: false // 🔒 Pastikan gak bisa ditumpuk
        };
    });

    return [...hrEvents, ...candidateEvents];
  }, [allSchedules, allApplications]);

  const handleOpenSchedule = (candidate) => {
    setSelectedCandidate(candidate);
    setShowModal(true);
  };

  // --- 4. SUBMIT KE BACKEND (WAJIB KIRIM TYPE: FINAL_HR) ---
  const handleSubmitSchedule = (formData) => {
    if (!selectedCandidate) return;

    // 🔥 FIX UTAMA: Pastikan type dikirim 'final_hr'
    // Supaya backend tau ini untuk Kepala HR dan statusnya jadi FINAL_INTERVIEW_SCHEDULED
    const payload = { 
        ...formData, 
        type: 'final_hr', // ✅ Pastikan ini tidak typo
        newStatus: 'FINAL_INTERVIEW_SCHEDULED' // (Ini jadi cadangan aja)
    };
    
    const token = getAuthToken();
    axios.post(API_TRIGGER_SCHEDULE_URL(selectedCandidate.id), payload, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { 
          Notiflix.Report.success("Sukses", "Jadwal Final Tersimpan & Email Terkirim", "OK"); 
      })
      .catch((e) => Notiflix.Report.failure("Gagal", e.message, "OK"));
      
    setShowModal(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <CalendarDaysIcon className="h-8 w-8 mr-2 text-green-600"/> Penjadwalan Final (HR)
      </h2>
      
      {loading ? <div>Loading...</div> : (
        <FinalScheduleTable
          data={finalQueue}
          user={user}
          statusMap={STATUS_DISPLAY_MAP}
          onOpenSchedule={handleOpenSchedule}
        />
      )}

      {showModal && (
        <FinalScheduleModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitSchedule}
          candidate={selectedCandidate}
          existingEvents={masterCalendarEvents} // ✅ Kirim semua event biar gak kosong
        />
      )}
    </div>
  );
}
export default FinalSchedulePage;