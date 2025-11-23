import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Notiflix from 'notiflix';

// ✅ GUNAKAN KOMPONEN BARU
import ManagerScheduleTable from '../../components/hr/ManagerScheduleTable'; 
import InterviewManagerModal from '../../components/hr/InterviewManagerModal';
import InterviewFeedbackModal from '../../components/hr/InterviewFeedbackModal';
import { UserGroupIcon } from '@heroicons/react/24/outline';

// API & Map
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_GET_APPLICATIONS_URL = `${API_BASE_URL}/api/hr/applications`;
const API_GET_SCHEDULES_URL = `${API_BASE_URL}/api/hr/schedules`; 
const API_UPDATE_STATUS_URL = (id) => `${API_BASE_URL}/api/hr/applications/${id}/status`;
const API_TRIGGER_SCHEDULE_URL = (id) => `${API_BASE_URL}/api/hr/applications/${id}/trigger-schedule`; 
const getAuthToken = () => localStorage.getItem("token");

export const STATUS_DISPLAY_MAP = {
  "INTERVIEW_QUEUED":    { label: "In Queue", color: "bg-yellow-100 text-yellow-800" },
  "INTERVIEW_SCHEDULED": { label: "Scheduled", color: "bg-purple-100 text-purple-800" },
  "STAFF_REJECTED":      { label: "Rejected", color: "bg-red-100 text-red-800" },
  "PENDING_FINAL_DECISION": { label: "Done (Pending Final)", color: "bg-indigo-100 text-indigo-800" }, 
  "default":             { label: "Unknown", color: "bg-gray-100 text-gray-800" }
};
const defaultStatusDisplay = STATUS_DISPLAY_MAP["default"];

function InterviewSchedulePage() {
  const { user } = useAuth();
  const [allApplications, setAllApplications] = useState([]); 
  const [allSchedules, setAllSchedules] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
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
      setAllSchedules(Array.isArray(schedRes.data) ? schedRes.data : []); 
    } catch (err) {
      Notiflix.Notify.failure("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // Filter Tahap Manajer
  const managerQueue = useMemo(() => {
    return allApplications.filter(app => 
      ["INTERVIEW_QUEUED", "INTERVIEW_SCHEDULED"].includes(app.status)
    );
  }, [allApplications]);
  
  const masterCalendarEvents = useMemo(() => {
    const hrEvents = allSchedules.filter(e => !e.applicationId).map(e => ({
        id: `manual-${e.id}`, title: `[HR] ${e.title}`, start: e.startDate, end: e.endDate, backgroundColor: '#EF4444'
    }));
    const candidateEvents = allSchedules.filter(e => e.applicationId).map(e => {
        const app = allApplications.find(a => a.id === e.applicationId);
        if (!app) return null;
        const type = e.interviewType || 'manager';
        return {
          id: e.id, title: `${app.fullName.split(' ')[0]} (${type})`, 
          start: e.startDate, end: e.endDate, backgroundColor: type === 'manager' ? '#7C3AED' : '#6B7280'
        };
    }).filter(Boolean);
    return [...hrEvents, ...candidateEvents];
  }, [allSchedules, allApplications]);

  const handleOpenSchedule = (candidate) => {
    setSelectedCandidate(candidate);
    setShowScheduleModal(true);
  };
  const handleOpenFeedback = (candidate) => {
    setSelectedCandidate(candidate);
    setShowFeedbackModal(true);
  };

  const handleSubmitSchedule = (formData) => {
    const payload = { ...formData, type: 'manager', newStatus: 'INTERVIEW_SCHEDULED' };
    const token = getAuthToken();
    axios.post(API_TRIGGER_SCHEDULE_URL(selectedCandidate.id), payload, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { Notiflix.Report.success("Sukses", "Jadwal Manajer Tersimpan", "OK"); fetchAllData(); })
      .catch((e) => Notiflix.Report.failure("Gagal", e.message, "OK"));
    setShowScheduleModal(false);
  };

  const handleSubmitFeedback = (formData) => {
    const newStatus = formData.decision === 'Hire' ? 'PENDING_FINAL_DECISION' : 'STAFF_REJECTED';
    const payload = { 
        status: newStatus, 
        interview_notes: { ...(selectedCandidate.interview_notes || {}), manager_decision: formData.decision, manager_feedback: formData.feedback } 
    };
    const token = getAuthToken();
    axios.put(API_UPDATE_STATUS_URL(selectedCandidate.id), payload, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { Notiflix.Report.success("Sukses", "Feedback Tersimpan", "OK"); fetchAllData(); })
      .catch((e) => Notiflix.Report.failure("Gagal", e.message, "OK"));
    setShowFeedbackModal(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <UserGroupIcon className="h-8 w-8 mr-2 text-blue-600"/> Wawancara Teknis (Manajer)
      </h2>
      
      {loading ? <div>Loading...</div> : (
        
        // ✅ GUNAKAN KOMPONEN INI
        <ManagerScheduleTable
          data={managerQueue}
          user={user}
          statusMap={STATUS_DISPLAY_MAP}
          onOpenSchedule={handleOpenSchedule}
          onOpenFeedback={handleOpenFeedback}
        />
      )}

      {showScheduleModal && (
        <InterviewManagerModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onSubmit={handleSubmitSchedule}
          candidate={selectedCandidate}
          existingEvents={masterCalendarEvents}
        />
      )}

      {showFeedbackModal && (
        <InterviewFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={handleSubmitFeedback}
          candidate={selectedCandidate}
        />
      )}

    </div>
  );
}
export default InterviewSchedulePage;