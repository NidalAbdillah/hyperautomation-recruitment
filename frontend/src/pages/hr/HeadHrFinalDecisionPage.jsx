import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import Notiflix from 'notiflix';
import { useAuth } from '../../context/AuthContext';

// ✅ IMPORT MODAL YANG BENAR
import { HeadHrDecisionModal } from '../../components/hr/HeadHrDecisionModal'; // Modal Eksekusi BARU
import { ManagerFeedbackDetailModal } from '../../components/hr/ManagerFeedbackDetailModal'; // Modal View (Fixed)
import HeadHrDecisionTable from '../../components/hr/HeadHrDecisionTable';
import HeadHrHistoryTable from '../../components/hr/HeadHrHistoryTable';

import { 
  CheckBadgeIcon, 
  ClockIcon, 
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

// API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_GET_APPLICATIONS = `${API_BASE_URL}/api/hr/applications`;
const API_UPDATE_STATUS = (id) => `${API_BASE_URL}/api/hr/applications/${id}/status`;
const getAuthToken = () => localStorage.getItem("token");

function HeadHrFinalDecisionPage() {
  const { user } = useAuth();
  const [allCandidates, setAllCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); 
  
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // States untuk Modal
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await axios.get(API_GET_APPLICATIONS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const relevantData = response.data.filter(app => 
        ['PENDING_FINAL_DECISION', 'HIRED', 'NOT_HIRED'].includes(app.status)
      );
      setAllCandidates(relevantData);
    } catch (error) {
      console.error('Error fetching data:', error);
      Notiflix.Notify.failure("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filter Tab
  const { pendingList, historyList } = useMemo(() => {
    return {
      pendingList: allCandidates.filter(app => app.status === 'PENDING_FINAL_DECISION'),
      historyList: allCandidates.filter(app => ['HIRED', 'NOT_HIRED'].includes(app.status))
    };
  }, [allCandidates]);

  // ✅ Handler Buka Modal Eksekusi
  const handleOpenDecision = (candidate) => {
    console.log('🔵 Opening decision modal for:', candidate.fullName);
    setSelectedCandidate(candidate);
    setShowDecisionModal(true);
  };

  // ✅ Handler Buka Modal Detail
  const handleViewDetail = (candidate) => {
    console.log('👁️ Opening detail modal for:', candidate.fullName);
    setSelectedCandidate(candidate);
    setShowDetailModal(true);
  };

  // ✅ HANDLER SUBMIT - PERBAIKAN LOGIC
  const handleSubmitDecision = async (formData) => {
    console.log('📤 Submitting decision:', formData);
    
    Notiflix.Loading.standard("Menyimpan keputusan...");
    
    try {
      const token = getAuthToken();
      
      // ✅ PASTIKAN LOGIC INI BENAR!
      // formData.decision sudah 'HIRED' atau 'NOT_HIRED' dari modal
      const newStatus = formData.decision; // Langsung pakai, sudah benar dari modal
      
      console.log('✅ Status yang akan disimpan:', newStatus);
      
      const payload = {
        status: newStatus, // 'HIRED' atau 'NOT_HIRED'
        interview_notes: {
          ...(selectedCandidate.interview_notes || {}),
          final_decision: formData.decision,
          final_feedback: formData.feedback,
          decided_by: user.email,
          decision_date: new Date().toISOString()
        }
      };
      
      console.log('📦 Payload:', payload);
      
      await axios.put(
        API_UPDATE_STATUS(selectedCandidate.id), 
        payload, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Notiflix.Loading.remove();
      Notiflix.Report.success(
        "Berhasil!", 
        `Kandidat ${selectedCandidate.fullName} telah di-${newStatus === 'HIRED' ? 'terima' : 'tolak'}.`, 
        "Okay"
      );
      
      setShowDecisionModal(false);
      fetchData(); 
      
    } catch (error) {
      console.error('❌ Error saving decision:', error);
      Notiflix.Loading.remove();
      Notiflix.Report.failure(
        "Error", 
        error.response?.data?.message || "Gagal menyimpan keputusan.", 
        "Okay"
      );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <CheckBadgeIcon className="h-8 w-8 text-blue-600 mr-2" /> 
          Persetujuan Akhir (Head HR)
        </h1>
        
        {/* TAB NAVIGATION */}
        <div className="flex space-x-4 mt-6 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('pending')} 
            className={`pb-2 px-1 flex items-center text-sm font-medium transition-colors ${
              activeTab === 'pending' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ClockIcon className="h-5 w-5 mr-2"/> 
            Perlu Keputusan ({pendingList.length})
          </button>
          
          <button 
            onClick={() => setActiveTab('history')} 
            className={`pb-2 px-1 flex items-center text-sm font-medium transition-colors ${
              activeTab === 'history' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ArchiveBoxIcon className="h-5 w-5 mr-2"/> 
            Riwayat Keputusan ({historyList.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Memuat data...</div>
        </div>
      ) : (
        <>
          <div className={activeTab === 'pending' ? 'block' : 'hidden'}>
            <HeadHrDecisionTable 
              candidates={pendingList} 
              onDecide={handleOpenDecision}
              onViewDetail={handleViewDetail} // Tambahkan ini di table component
            />
          </div>

          <div className={activeTab === 'history' ? 'block' : 'hidden'}>
            <HeadHrHistoryTable 
              data={historyList} 
              onViewDetail={handleViewDetail} 
            />
          </div>
        </>
      )}

      {/* ✅ MODAL EKSEKUSI - Pakai HeadHrDecisionModal BARU */}
      {showDecisionModal && (
        <HeadHrDecisionModal
          isOpen={showDecisionModal}
          onClose={() => {
            setShowDecisionModal(false);
            setSelectedCandidate(null);
          }}
          onSubmit={handleSubmitDecision}
          candidate={selectedCandidate}
        />
      )}

      {/* ✅ MODAL DETAIL - Pakai yang sudah di-fix */}
      {showDetailModal && (
        <ManagerFeedbackDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCandidate(null);
          }}
          candidate={selectedCandidate}
        />
      )}
    </div>
  );
}

export default HeadHrFinalDecisionPage;