import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Notiflix from 'notiflix';

// ✅ IMPORT KOMPONEN TABEL & MODAL (YANG ADA EDITORNYA)
import OnboardingTable from '../../components/hr/OnboardingTable';
import OnboardingModal from '../../components/hr/OnboardingModal';
import ManagerFeedbackDetailModal from '../../components/hr/ManagerFeedbackDetailModal';

import { UserPlusIcon } from '@heroicons/react/24/outline';

// API Config
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_GET_APPLICATIONS_URL = `${API_BASE_URL}/api/hr/applications`;
const API_GET_SCHEDULES_URL = `${API_BASE_URL}/api/hr/schedules`; 
const API_TRIGGER_SCHEDULE_URL = (id) => `${API_BASE_URL}/api/hr/applications/${id}/trigger-schedule`; 
const getAuthToken = () => localStorage.getItem("token");

function OnboardingPage() {
  const { user } = useAuth();
  const [allApplications, setAllApplications] = useState([]); 
  const [allSchedules, setAllSchedules] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); 
  
  // States Modal
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // 1. Fetch Data
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
      Notiflix.Report.failure("Gagal", "Gagal memuat data.", "OK");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // 2. Filter List
  const { pendingList, completedList } = useMemo(() => {
    return {
      pendingList: allApplications.filter(app => app.status === 'HIRED'),
      completedList: allApplications.filter(app => app.status === 'ONBOARDING')
    };
  }, [allApplications]);
  
  // 3. Kalender (Biar gak bentrok)
  const masterCalendarEvents = useMemo(() => {
    const hrEvents = allSchedules.filter(e => !e.applicationId).map(e => ({
        id: `manual-${e.id}`, title: `[HR] ${e.title}`, start: e.startDate, end: e.endDate, backgroundColor: '#EF4444', overlap: false
    }));
    const appEvents = allSchedules.filter(e => e.applicationId).map(e => ({
         id: e.id, title: 'Busy', start: e.startDate, end: e.endDate, backgroundColor: '#6B7280', overlap: false
    }));
    return [...hrEvents, ...appEvents];
  }, [allSchedules]);

  // 4. Handlers
  const handleOpenSchedule = (candidate) => {
    setSelectedCandidate(candidate);
    setShowModal(true); // Buka Modal WYSIWYG
  };

  const handleViewDetail = (candidate) => {
    setSelectedCandidate(candidate);
    setShowDetailModal(true);
  };

  const handleSubmitSchedule = (formData) => {
    // 🔥 PAKET DATA LENGKAP KE BACKEND -> N8N
    const payload = { 
        ...formData, // Isinya: dateTime, endTime, notes_from_hr (HTML dari Editor), preference
        type: 'onboarding', // Trigger tipe onboarding
        newStatus: 'ONBOARDING' 
    };
    
    const token = getAuthToken();
    axios.post(API_TRIGGER_SCHEDULE_URL(selectedCandidate.id), payload, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { 
          Notiflix.Report.success("Terkirim", "Email Onboarding dengan instruksi Anda telah dikirim!", "OK"); 
          fetchAllData(); 
      })
      .catch((e) => Notiflix.Report.failure("Gagal", e.message, "OK"));
      
    setShowModal(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
          <UserPlusIcon className="h-8 w-8 mr-2 text-teal-600"/> Proses Onboarding
        </h2>
        
        {/* Tab Navigasi */}
        <div className="flex space-x-6 mt-8 border-b border-gray-200">
          <button onClick={() => setActiveTab('pending')} className={`pb-3 px-2 text-sm font-medium transition-all ${activeTab === 'pending' ? 'border-b-2 border-teal-600 text-teal-700 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>
            Perlu Diproses ({pendingList.length})
          </button>
          <button onClick={() => setActiveTab('completed')} className={`pb-3 px-2 text-sm font-medium transition-all ${activeTab === 'completed' ? 'border-b-2 border-teal-600 text-teal-700 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>
            Riwayat Onboarding ({completedList.length})
          </button>
        </div>
      </div>
      
      {loading ? <div className="text-center py-10">Loading...</div> : (
        <>
          <div className={activeTab === 'pending' ? 'block' : 'hidden'}>
            <OnboardingTable 
               data={pendingList} 
               onOpenSchedule={handleOpenSchedule} 
               onViewDetail={handleViewDetail} 
            />
          </div>
          <div className={activeTab === 'completed' ? 'block' : 'hidden'}>
            <OnboardingTable 
               data={completedList} 
               onOpenSchedule={handleOpenSchedule} 
               onViewDetail={handleViewDetail} 
            />
          </div>
        </>
      )}

      {/* 🔥 MODAL SAKTI (Mengandung Editor WYSIWYG) */}
      {showModal && (
        <OnboardingModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitSchedule}
          candidate={selectedCandidate}
          existingEvents={masterCalendarEvents}
          mode="onboarding" // 👈 KUNCINYA DISINI: Mode ini akan memicu template "Selamat Bergabung" di Editor
        />
      )}

      {/* Modal Detail History */}
      {showDetailModal && (
        <ManagerFeedbackDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          candidate={selectedCandidate}
        />
      )}
    </div>
  );
}
export default OnboardingPage;