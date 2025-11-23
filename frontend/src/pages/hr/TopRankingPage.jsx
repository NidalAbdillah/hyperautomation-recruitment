// src/pages/hr/TopRankingPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import Notiflix from "notiflix";
import PdfViewerModal from "../../components/PdfViewerModal";
import CandidateRankCard from "../../components/hr/CandidateRankCard";
import { useAuth } from "../../context/AuthContext";
import ManagerSelectModal from "../../components/hr/ManagerSelectModal";

import {
  ChevronDownIcon,
  CalendarDaysIcon,
  ArrowUturnLeftIcon,
  TrophyIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

// --- API CONFIG ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_GET_RANKING_URL = `${API_BASE_URL}/api/hr/applications/ranking`;
const API_VIEW_URL = (id) => `${API_BASE_URL}/api/hr/applications/${id}/view-cv`;
const API_UPDATE_STATUS_URL = (id) =>`${API_BASE_URL}/api/hr/applications/${id}/status`;
const getAuthToken = () => localStorage.getItem("token");

function TopRankingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [rankedData, setRankedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State Modal CV Viewer
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrlToView, setPdfUrlToView] = useState(null);
  const [viewingCv, setViewingCv] = useState(null);
  
  // State Modal Manajer (Baru)
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [candidateToSelect, setCandidateToSelect] = useState(null);

  // State Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [qualificationFilter, setQualificationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(null);
  const [limit, setLimit] = useState(10);

  // Fetch Ranked Data
  const fetchRankedData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Missing auth token");
      const params = new URLSearchParams({ limit: limit });
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);
      if (qualificationFilter)
        params.append("qualification", qualificationFilter);
      if (dateFilter)
        params.append("date", dateFilter.toISOString().split("T")[0]);

      const response = await axios.get(API_GET_RANKING_URL, {
        headers: { Authorization: `Bearer ${token}` },
        params: params,
      });

      setRankedData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching ranked CV data:", err);
      setError(err);
      Notiflix.Report.failure("Load Data Failed", err.response?.data?.message || err.message, "Okay");
    } finally {
      setLoading(false);
    }
  }, [limit, searchTerm, statusFilter, qualificationFilter, dateFilter]);

  useEffect(() => {
    fetchRankedData();
  }, [fetchRankedData]);

  // Filter Options
  const availableStatuses = useMemo(
    () => [
      { value: "", label: "All Status (Ranked)" },
      { value: "REVIEWED", label: "Reviewed (AI)" },
      { value: "STAFF_APPROVED", label: "Approved (Staff)" },
      { value: "INTERVIEW_QUEUED", label: "In Queue (Manager)" },
      { value: "INTERVIEW_SCHEDULED", label: "Scheduled (Manager)" },
      { value: "PENDING_FINAL_DECISION", label: "Final Review (HR)" },
      { value: "HIRED", label: "Hired" },
      { value: "NOT_HIRED", label: "Not Hired" },
    ],
    []
  );
  
  const availableQualifications = useMemo(() => {
    const qualifications = rankedData
      .map((item) => item.qualification)
      .filter(Boolean);
    const uniqueQualifications = ["", ...new Set(qualifications)];
    return uniqueQualifications.map((q) => ({
      value: q,
      label: q || "All Qualifications",
    }));
  }, [rankedData]);

  // Filter Handlers
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);
  const handleQualificationFilterChange = (e) =>
    setQualificationFilter(e.target.value);
  const handleDateFilterChange = (date) => setDateFilter(date);
  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    if (newLimit >= 1 && newLimit <= 50) {
      setLimit(newLimit);
    }
  };

  // View CV Handler
  const handleViewDetail = useCallback(async (cv) => {
    if (!cv.cvFileObjectKey) {
      Notiflix.Report.warning("File Not Available", "CV file not found.", "Okay");
      return;
    }
    const pdfApiUrl = API_VIEW_URL(cv.id);
    try {
      Notiflix.Loading.standard("Loading Full CV...");
      const token = getAuthToken();
      if (!token) throw new Error("Missing auth token");
      const response = await axios.get(pdfApiUrl, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      Notiflix.Loading.remove();
      const pdfBlobUrl = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      setPdfUrlToView(pdfBlobUrl);
      setViewingCv(cv);
      setShowPdfModal(true);
    } catch (error) {
      Notiflix.Loading.remove();
      console.error(`Error viewing CV ID ${cv.id}:`, error);
      Notiflix.Report.failure("Failed to Load CV", error.response?.data?.message, "Okay");
    }
  }, []);

  const handleClosePdfModal = useCallback(() => {
    setShowPdfModal(false);
    if (pdfUrlToView) {
      window.URL.revokeObjectURL(pdfUrlToView);
      setPdfUrlToView(null);
    }
    setViewingCv(null);
  }, [pdfUrlToView]);

  // Generic Update Application Helper
  const handleUpdateApplication = useCallback(
    async (applicationId, payload, successMessage) => {
      Notiflix.Loading.standard("Mengupdate...");
      try {
        const token = getAuthToken();
        if (!token) throw new Error("Missing auth token");

        await axios.put(API_UPDATE_STATUS_URL(applicationId), payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        Notiflix.Loading.remove();
        Notiflix.Report.success("Berhasil", successMessage, "Okay");
        fetchRankedData(); // Refresh data
      } catch (error) {
        Notiflix.Loading.remove();
        Notiflix.Report.failure(
          "Gagal Update",
          error.response?.data?.message || "An error occurred.",
          "Okay"
        );
      }
    },
    [fetchRankedData]
  );

  // Modal Handlers
  const openSelectModal = (cv) => {
    setCandidateToSelect(cv);
    setShowSelectModal(true);
  };
  
  const closeSelectModal = () => {
    setCandidateToSelect(null);
    setShowSelectModal(false);
  };

  // --- ✅ PERBAIKAN UTAMA: FUNGSI INI SEKARANG SIMPAN USULAN TANGGAL ---
  const handleSubmitSelection = (formData) => {
    // formData dari ManagerSelectModal.jsx sekarang berisi:
    // {
    //   preference: "Online" / "Offline",
    //   manager_notes_for_candidate: "...",
    //   proposedStart: Date object,
    //   proposedEnd: Date object
    // }
    
    const payload = {
      status: "INTERVIEW_QUEUED", // Status tetap: Menunggu HR
      interview_notes: {
        // Pertahankan data lama (jika ada)
        ...(candidateToSelect.interview_notes || {}),
        
        // Data dari form modal
        preference: formData.preference,
        manager_notes_for_candidate: formData.manager_notes_for_candidate,
        
        // --- ✅ DATA BARU: USULAN TANGGAL DARI KALENDER ---
        manager_proposed_start: formData.proposedStart, // Simpan tanggal mulai
        manager_proposed_end: formData.proposedEnd       // Simpan tanggal selesai
      }
    };
    
    handleUpdateApplication(
      candidateToSelect.id, 
      payload, 
      `Usulan jadwal untuk ${candidateToSelect.fullName} telah dikirim ke Antrian HR.`
    );
    
    closeSelectModal();
  };
  // --- BATAS PERBAIKAN ---

  // Clear Interview Choice Handler
  const handleClearInterviewChoice = useCallback(
    (cv) => {
      Notiflix.Confirm.show(
        "Bersihkan Pilihan?",
        `Anda yakin ingin membersihkan preferensi wawancara untuk <strong>${cv.fullName}</strong>? Status akan kembali ke 'STAFF_APPROVED'.`,
        "Ya, Bersihkan",
        "Batal",
        () => {
          handleUpdateApplication(
            cv.id, 
            { 
              status: "STAFF_APPROVED",
              interview_notes: {
                ...(cv.interview_notes || {}),
                preference: null,
                manager_notes_for_candidate: null,
                // Hapus juga usulan tanggal (jika ada)
                manager_proposed_start: null,
                manager_proposed_end: null
              }
            },
            "Pilihan telah dibersihkan."
          );
        },
        () => {},
        { titleColor: "#EF4444", okButtonBackground: "#EF4444" }
      );
    },
    [handleUpdateApplication]
  );

  // --- RENDER ---
  return (
    <div className="manage-cv-page-container p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-8">
          <TrophyIcon className="h-8 w-8 text-yellow-500 mr-2" />
          Top Candidate Ranking
        </h2>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 p-3 rounded">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="shadow-sm border border-gray-300 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 flex-grow md:flex-grow-0 md:w-48"
          />
          
          {/* Status Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 pr-8 appearance-none"
            >
              {availableStatuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="h-4 w-4 pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500" />
          </div>
          
          {/* Qualification Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={qualificationFilter}
              onChange={handleQualificationFilterChange}
              className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 pr-8 appearance-none"
            >
              {availableQualifications.map((q) => (
                <option key={q.value} value={q.value}>
                  {q.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="h-4 w-4 pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500" />
          </div>
          
          {/* Date Picker */}
          <div className="relative w-full sm:w-auto min-w-[150px]">
            <DatePicker
              selected={dateFilter}
              onChange={handleDateFilterChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="dd/mm/yyyy"
              isClearable
              className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 pr-8"
            />
            {!dateFilter && (
              <CalendarDaysIcon className="h-5 w-5 text-gray-400 absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none" />
            )}
          </div>
          
          {/* Limit Selector */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <label
              htmlFor="limit-select"
              className="text-sm font-medium text-gray-700"
            >
              Show Top:
            </label>
            <select
              id="limit-select"
              value={limit}
              onChange={handleLimitChange}
              className="shadow-sm border border-gray-300 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 pr-8 appearance-none"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={fetchRankedData}
            className="flex items-center px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 bg-gray-500 hover:bg-gray-600 focus:ring-gray-400 text-white text-sm whitespace-nowrap transition-colors duration-150"
            title="Refresh CV List"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1.5" />
            Refresh
          </button>
          <button
            onClick={() => navigate("/hr/manage-cv")}
            className="flex items-center px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 bg-gray-500 hover:bg-gray-600 focus:ring-gray-400 text-white text-sm whitespace-nowrap"
          >
            <ArrowUturnLeftIcon className="mr-1.5 h-4 w-4" /> Back to Active CVs
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center text-gray-600 my-8 py-4">
          Loading candidate rankings...
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="text-center text-red-500 my-8 py-4">
          Failed to load rankings. Please try again.
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && rankedData.length === 0 && (
        <div className="text-center text-gray-500 my-8 py-4">
          No candidates found matching the current filters.
        </div>
      )}

      {/* Candidate Cards */}
      {!loading && !error && rankedData.length > 0 && (
        <div className="flex flex-col gap-6">
          {rankedData.map((cv, index) => (
            <CandidateRankCard
              key={cv.id}
              cv={cv}
              rank={index + 1}
              onViewDetail={handleViewDetail}
              userRole={user?.role}
              onSelectForInterview={openSelectModal}
              onClearInterviewChoice={handleClearInterviewChoice}
            />
          ))}
        </div>
      )}

      {/* PDF Viewer Modal */}
      <PdfViewerModal
        isOpen={showPdfModal}
        onClose={handleClosePdfModal}
        pdfUrl={pdfUrlToView}
        viewingCv={viewingCv}
      />
      
      {/* Manager Selection Modal (WITH CALENDAR) */}
      <ManagerSelectModal
        isOpen={showSelectModal}
        onClose={closeSelectModal}
        onSubmit={handleSubmitSelection}
        candidate={candidateToSelect}
      />
    </div>
  );
}

export default TopRankingPage;