import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Notiflix from 'notiflix';
import InterviewScheduleTable from '../../components/hr/InterviewScheduleTable';
import ScheduleInterviewModal from '../../components/hr/ScheduleInterviewModal';
import InterviewFeedbackModal from '../../components/hr/InterviewFeedbackModal';

import { UserGroupIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

// --- (API Endpoints) ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_GET_APPLICATIONS_URL = `${API_BASE_URL}/api/hr/applications`;
const API_GET_SCHEDULES_URL = `${API_BASE_URL}/api/hr/schedules`; 
const API_UPDATE_STATUS_URL = (id) => `${API_BASE_URL}/api/hr/applications/${id}/status`;
const API_TRIGGER_SCHEDULE_URL = (id) => `${API_BASE_URL}/api/hr/applications/${id}/trigger-schedule`; 
const getAuthToken = () => localStorage.getItem("token");

// (Map Status... tidak berubah)
export const STATUS_DISPLAY_MAP = {
  "SUBMITTED":    { label: "Submitted", color: "bg-gray-100 text-gray-800" },
  "REVIEWED":     { label: "Reviewed (AI)", color: "bg-blue-100 text-blue-800" },
  "STAFF_APPROVED": { label: "Approved (Staff)", color: "bg-cyan-100 text-cyan-800" },
  "STAFF_REJECTED": { label: "Rejected (Staff)", color: "bg-red-100 text-red-800" },
  "INTERVIEW_QUEUED":    { label: "In Queue", color: "bg-yellow-100 text-yellow-800" },
  "INTERVIEW_SCHEDULED": { label: "Scheduled", color: "bg-purple-100 text-purple-800" },
  "PENDING_FINAL_DECISION": { label: "Final Review", color: "bg-indigo-100 text-indigo-800" },
  "HIRED":      { label: "Hired", color: "bg-green-100 text-green-800" },
  "NOT_HIRED":  { label: "Not Hired", color: "bg-red-100 text-red-800" },
  "ONBOARDING": { label: "Onboarding", color: "bg-green-100 text-green-800" },
  "default":    { label: "Unknown", color: "bg-gray-100 text-gray-800" }
};
const defaultStatusDisplay = STATUS_DISPLAY_MAP["default"];

function InterviewSchedulePage() {
  const { user } = useAuth();
  const [allApplications, setAllApplications] = useState([]); 
  const [allSchedules, setAllSchedules] = useState([]); // Ganti nama: manualEvents → allSchedules
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('manager');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // --- ✅ FETCH DATA (Tidak Berubah, Sudah Benar) ---
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Missing auth token");
      const headers = { Authorization: `Bearer ${token}` };

      // Ambil kedua data secara paralel
      const [appResponse, scheduleResponse] = await Promise.all([
        axios.get(API_GET_APPLICATIONS_URL, { headers }),
        axios.get(API_GET_SCHEDULES_URL, { headers })
      ]);

      setAllApplications(Array.isArray(appResponse.data) ? appResponse.data : []);
      setAllSchedules(Array.isArray(scheduleResponse.data) ? scheduleResponse.data : []); // Update state
      
    } catch (err) {
      console.error("Error fetching all calendar data:", err);
      setError(err.message || "Gagal memuat data");
      Notiflix.Report.failure("Load Data Gagal", err.response?.data?.message || err.message, "Okay");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- ✅ MEMO UNTUK TABEL (Tidak Berubah) ---
  const { managerQueue, finalQueue } = useMemo(() => {
    const managerQueue = allApplications.filter(app => 
      ["INTERVIEW_QUEUED", "INTERVIEW_SCHEDULED"].includes(app.status)
    );
    const finalQueue = allApplications.filter(app => 
      ["PENDING_FINAL_DECISION", "HIRED", "ONBOARDING"].includes(app.status)
    );
    return { managerQueue, finalQueue };
  }, [allApplications]);
  
  // --- 🔥 ROMBAKAN UTAMA: KALENDER SEKARANG 100% DARI "schedules" ---
  const masterCalendarEvents = useMemo(() => {
    // HANYA ambil dari "schedules" (Single Source of Truth)
    // Format untuk FullCalendar
    return allSchedules.map(event => {
      // Deteksi tipe event berdasarkan title atau description
      const isInterviewEvent = event.title.toLowerCase().includes('interview');
      
      return {
        id: event.id, // Gunakan ID asli dari database
        title: event.title, // Misal: "Interview: Nidal" atau "Libur Nasional"
        start: event.startDate, // String ISO atau Date object
        end: event.endDate,
        description: event.description || '',
        allDay: false,
        backgroundColor: isInterviewEvent ? '#6B7280' : '#DC2626', // Abu-abu untuk interview, Merah untuk libur
        borderColor: isInterviewEvent ? '#6B7280' : '#DC2626',
        overlap: false, // Cegah tumpang tindih
        extendedProps: {
          type: isInterviewEvent ? 'interview' : 'manual',
          source: 'schedules' // Penanda: semua dari "schedules"
        }
      };
    });

  }, [allSchedules]); // Hanya bergantung pada allSchedules

  // --- ✅ UPDATE APPLICATION (Tidak Berubah) ---
  const handleUpdateApplication = useCallback(async (applicationId, payload, successMessage) => {
    Notiflix.Loading.standard("Updating status...");
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Missing auth token");
      await axios.put(
        API_UPDATE_STATUS_URL(applicationId),
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Notiflix.Loading.remove();
      Notiflix.Report.success("Berhasil", successMessage, "Okay");
      fetchAllData();
    } catch (error) {
      Notiflix.Loading.remove();
      console.error("Error updating application status:", error);
      Notiflix.Report.failure("Update Gagal", error.response?.data?.message, "Okay");
    }
  }, [fetchAllData]);
  
  // --- ✅ TRIGGER SCHEDULE (Tidak Berubah, Sudah Benar) ---
  const handleTriggerSchedule = useCallback(async (applicationId, scheduleData, interviewType) => {
    Notiflix.Loading.standard("Memicu otomatisasi penjadwalan...");
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Missing auth token");
      
      const payload = { ...scheduleData, type: interviewType };

      // Panggil backend yang akan trigger N8N
      await axios.post(
        API_TRIGGER_SCHEDULE_URL(applicationId),
        payload, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Notiflix.Loading.remove();
      Notiflix.Report.success("Berhasil", "Otomatisasi penjadwalan berhasil dipicu! Email akan dikirim ke kandidat.", "Okay");
      
      // Refresh data (termasuk kalender dari schedules)
      fetchAllData(); 

    } catch (error) {
      Notiflix.Loading.remove();
      console.error("Error triggering schedule:", error);
      Notiflix.Report.failure("Otomatisasi Gagal", error.response?.data?.message || "Terjadi kesalahan.", "Okay");
    }
  }, [fetchAllData]);

  // --- ✅ HANDLER MODAL (Tidak Berubah) ---
  const openScheduleModal = (candidate) => {
    setSelectedCandidate(candidate);
    setShowScheduleModal(true);
  };
  const openFeedbackModal = (candidate) => {
    setSelectedCandidate(candidate);
    setShowFeedbackModal(true);
  };
  const openFinalModal = (candidate) => {
    setSelectedCandidate(candidate);
    setShowFinalModal(true);
  };
  const closeModal = () => {
    setShowScheduleModal(false);
    setShowFeedbackModal(false);
    setShowFinalModal(false);
    setSelectedCandidate(null);
  };
  
  // --- ✅ HANDLER SUBMIT (Tidak Berubah) ---
  const handleSubmitSchedule = (formData) => {
    const type = ['INTERVIEW_QUEUED'].includes(selectedCandidate.status) ? 'manager' : 'final_onboarding';
    handleTriggerSchedule(selectedCandidate.id, formData, type);
    closeModal();
  };
  const handleSubmitManagerFeedback = (formData) => {
    const newStatus = formData.decision === 'Hire' ? 'PENDING_FINAL_DECISION' : 'STAFF_REJECTED'; 
    const payload = {
      status: newStatus,
      interview_notes: {
        ...(selectedCandidate.interview_notes || {}),
        manager_decision: formData.decision,
        manager_feedback: formData.feedback
      }
    };
    handleUpdateApplication(selectedCandidate.id, payload, `Feedback dari Manajer telah disimpan.`);
    closeModal();
  };
  const handleSubmitFinalDecision = (formData) => {
    const newStatus = formData.decision === 'Hire' ? 'HIRED' : 'NOT_HIRED';
    const payload = {
      status: newStatus,
      interview_notes: {
        ...(selectedCandidate.interview_notes || {}),
        final_decision: formData.decision,
        final_feedback: formData.feedback
      }
    };
    handleUpdateApplication(selectedCandidate.id, payload, `Keputusan final telah disimpan.`);
    closeModal();
  };

  // --- ✅ RENDER JSX (Tidak Berubah) ---
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Manage Interview Schedule
      </h2>
      
      {/* Tombol Tab */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('manager')}
          className={`flex items-center px-4 py-3 text-sm font-medium ${
            activeTab === 'manager' 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserGroupIcon className="h-5 w-5 mr-2" />
          Wawancara Manajer ({managerQueue.length})
        </button>
        <button
          onClick={() => setActiveTab('final')}
          className={`flex items-center px-4 py-3 text-sm font-medium ${
            activeTab === 'final' 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckBadgeIcon className="h-5 w-5 mr-2" />
          Keputusan Final HR ({finalQueue.length})
        </button>
      </div>
      
      {/* Konten Tab */}
      {loading ? (
        <div className="text-center text-gray-600 my-8 py-4">Memuat data wawancara...</div>
      ) : error ? (
        <div className="text-center text-red-600 my-8 py-4">Error: {error}</div>
      ) : (
        <>
          <div className={activeTab === 'manager' ? 'block' : 'hidden'}>
            <InterviewScheduleTable
              data={managerQueue}
              user={user}
              statusMap={STATUS_DISPLAY_MAP}
              defaultStatusDisplay={defaultStatusDisplay}
              onOpenSchedule={openScheduleModal}
              onOpenFeedback={openFeedbackModal}
              tableType="manager"
            />
          </div>
          
          <div className={activeTab === 'final' ? 'block' : 'hidden'}>
            <InterviewScheduleTable
              data={finalQueue}
              user={user}
              statusMap={STATUS_DISPLAY_MAP}
              defaultStatusDisplay={defaultStatusDisplay}
              onOpenSchedule={openScheduleModal} 
              onOpenFeedback={openFinalModal}
              tableType="final"
            />
          </div>
        </>
      )}
      
      {/* 🔥 MODAL SCHEDULE: Kirim kalender yang sudah 100% dari "schedules" */}
      {showScheduleModal && (
        <ScheduleInterviewModal
          isOpen={showScheduleModal}
          onClose={closeModal}
          onSubmit={handleSubmitSchedule}
          candidate={selectedCandidate}
          user={user}
          existingEvents={masterCalendarEvents} // Prop name disesuaikan dengan modal
        />
      )}
      
      {/* Modal Feedback */}
      {showFeedbackModal && (
        <InterviewFeedbackModal
          isOpen={showFeedbackModal}
          onClose={closeModal}
          onSubmit={handleSubmitManagerFeedback}
          candidate={selectedCandidate}
          title="Manager Feedback"
          decisionOptions={{ hire: "Hire", reject: "Not Hire" }}
        />
      )}

      {showFinalModal && (
        <InterviewFeedbackModal
          isOpen={showFinalModal}
          onClose={closeModal}
          onSubmit={handleSubmitFinalDecision}
          candidate={selectedCandidate}
          title="Final Decision (Head HR)"
          decisionOptions={{ hire: "HIRED", reject: "NOT_HIRED" }}
        />
      )}

    </div>
  );
}

export default InterviewSchedulePage;