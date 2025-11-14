// src/pages/hr/InterviewSchedulePage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Notiflix from 'notiflix';
import InterviewScheduleTable from '../../components/hr/InterviewScheduleTable';
import ScheduleInterviewModal from '../../components/hr/ScheduleInterviewModal';
import InterviewFeedbackModal from '../../components/hr/InterviewFeedbackModal';

import { UserGroupIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

// --- (API Endpoints & Konstanta tetap sama) ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_GET_APPLICATIONS_URL = `${API_BASE_URL}/api/hr/applications`; 
const API_UPDATE_STATUS_URL = (id) => `${API_BASE_URL}/api/hr/applications/${id}/status`;
const API_TRIGGER_SCHEDULE_URL = (id) => `${API_BASE_URL}/api/hr/applications/${id}/trigger-schedule`; // (Endpoint N8N)
const getAuthToken = () => localStorage.getItem("token");

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
  // 'allApplications' adalah "Kalender Kebenaran" kita
  const [allApplications, setAllApplications] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('manager');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // (fetchAllApplications, useMemo, handleUpdateApplication... tetap sama)
  const fetchAllApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Missing auth token");
      const response = await axios.get(API_GET_APPLICATIONS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllApplications(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching interview data:", err);
      setError(err.message || "Gagal memuat data");
      Notiflix.Report.failure("Load Data Gagal", err.response?.data?.message || err.message, "Okay");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllApplications();
  }, [fetchAllApplications]);

  const { managerQueue, finalQueue } = useMemo(() => {
    const managerQueue = allApplications.filter(app => 
      ["INTERVIEW_QUEUED", "INTERVIEW_SCHEDULED"].includes(app.status)
    );
    const finalQueue = allApplications.filter(app => 
      ["PENDING_FINAL_DECISION", "HIRED", "ONBOARDING"].includes(app.status)
    );
    return { managerQueue, finalQueue };
  }, [allApplications]);

  const handleUpdateApplication = useCallback(async (applicationId, payload, successMessage) => {
    // ... (fungsi ini sudah benar, tidak perlu diubah)
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
      fetchAllApplications();
    } catch (error) {
      Notiflix.Loading.remove();
      console.error("Error updating application status:", error);
      Notiflix.Report.failure("Update Gagal", error.response?.data?.message, "Okay");
    }
  }, [fetchAllApplications]); // <-- tambahkan fetchAllApplications
  
  // --- Handler untuk memicu Otomatisasi N8N ---
  const handleTriggerSchedule = useCallback(async (applicationId, scheduleData, interviewType) => {
    Notiflix.Loading.standard("Memicu otomatisasi penjadwalan...");
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Missing auth token");
      
      const payload = { ...scheduleData, type: interviewType };

      // --- PANGGIL ENDPOINT BARU DI BACKEND ---
      // (Saat ini kita simulasi, tapi nanti ganti ke endpoint trigger n8n)
      // await axios.post(
      //   API_TRIGGER_SCHEDULE_URL(applicationId),
      //   payload, 
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      
      // --- SIMULASI (Hapus ini nanti) ---
      const newStatus = (interviewType === 'manager') ? 'INTERVIEW_SCHEDULED' : 'ONBOARDING'; // (Contoh)
      await handleUpdateApplication(
        applicationId,
        { 
          status: newStatus, 
          interview_notes: {
            ...(selectedCandidate.interview_notes || {}),
            scheduled_time: scheduleData.dateTime,
            scheduled_end_time: scheduleData.endTime, // (Sudah benar dari sebelumnya)
            scheduled_by: user.name,
            // --- ✅ PERBAIKAN LOGIKA PENYIMPANAN ---
            // 'notes_from_hr' adalah versi final (mungkin sudah diedit HR)
            // Kita timpa 'manager_notes_for_candidate' dengan versi baru ini.
            manager_notes_for_candidate: scheduleData.notes_from_hr
          }
        },
        `Simulasi Penjadwalan Berhasil! (Status diubah ke ${newStatus})`
      );
      // --- BATAS SIMULASI ---

      // Notiflix.Loading.remove(); // (Sudah dipanggil oleh handleUpdateApplication)
      // Notiflix.Report.success("Berhasil", "Otomatisasi penjadwalan berhasil dipicu!", "Okay");
      // fetchAllApplications(); // (Sudah dipanggil oleh handleUpdateApplication)

    } catch (error) {
      Notiflix.Loading.remove();
      console.error("Error triggering schedule:", error);
      Notiflix.Report.failure("Otomatisasi Gagal", error.response?.data?.message, "Okay");
    }
  }, [user, selectedCandidate, handleUpdateApplication]); // <-- Tambahkan dependensi

  // --- (Handler Modal... tetap sama) ---
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
  
  // --- (Handler Aksi Modals... tetap sama) ---
  const handleSubmitSchedule = (formData) => {
    // Tentukan tipe wawancara berdasarkan status kandidat
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

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Manage Interview Schedule
      </h2>
      
      {/* --- (Tombol Tab... tetap sama) --- */}
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
      
      {/* --- (Konten Tab... tetap sama) --- */}
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
      
      {/* --- ✅ PERBAIKAN: Modal ScheduleInterviewModal sekarang menerima 'allApplications' --- */}
      {showScheduleModal && (
        <ScheduleInterviewModal
          isOpen={showScheduleModal}
          onClose={closeModal}
          onSubmit={handleSubmitSchedule}
          candidate={selectedCandidate}
          user={user}
          allApplications={allApplications} // <-- KIRIM "KALENDER KEBENARAN"
        />
      )}
      
      {showFeedbackModal && (
        <InterviewFeedbackModal
          isOpen={showFeedbackModal}
          onClose={closeModal}
          onSubmit={handleSubmitManagerFeedback}
          candidate={selectedCandidate}
          title="Manager Feedback"
          decisionOptions={{ hire: "Hire", reject: "Not Hire" }} // (Hire/Not Hire)
        />
      )}

      {showFinalModal && (
        <InterviewFeedbackModal
          isOpen={showFinalModal}
          onClose={closeModal}
          onSubmit={handleSubmitFinalDecision}
          candidate={selectedCandidate}
          title="Final Decision (Head HR)"
          decisionOptions={{ hire: "HIRED", reject: "NOT_HIRED" }} // (HIRED/NOT_HIRED)
        />
      )}

    </div>
  );
}

export default InterviewSchedulePage;