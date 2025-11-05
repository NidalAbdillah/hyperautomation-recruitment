// src/pages/hr/TopRankingPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import Notiflix from "notiflix";
import PdfViewerModal from "../../components/PdfViewerModal"; // Modal untuk detail
import CandidateRankCard from "../../components/hr/CandidateRankCard"; // Komponen KARTU BARU
import {
  ChevronDownIcon,
  CalendarDaysIcon,
  ArrowUturnLeftIcon, // Ikon untuk Back
  TrophyIcon, ArrowPathIcon // Ikon untuk judul
} from "@heroicons/react/24/outline";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';

// --- API Endpoints ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Endpoint baru untuk ranking
const API_GET_RANKING_URL = `${API_BASE_URL}/api/hr/applications/ranking`;
const API_VIEW_URL = (id) => `${API_BASE_URL}/api/hr/applications/${id}/view-cv`;

// --- Helper ---
const getAuthToken = () => localStorage.getItem("token");

function TopRankingPage() {
  const navigate = useNavigate();
  const [rankedData, setRankedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk modal (tetap diperlukan saat klik "Open")
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrlToView, setPdfUrlToView] = useState(null);
  const [viewingCv, setViewingCv] = useState(null);

  // State untuk filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // Default "All", tapi ranking hanya ambil yg reviewed
  const [qualificationFilter, setQualificationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(null);
  const [limit, setLimit] = useState(10); // State untuk Top N (10, 9, 5, dll)

  // --- Data Fetching ---
  const fetchRankedData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Missing auth token");

      // Bangun query params untuk filter
      const params = new URLSearchParams({
        limit: limit,
      });
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (qualificationFilter) params.append('qualification', qualificationFilter);
      if (dateFilter) params.append('date', dateFilter.toISOString().split('T')[0]); // Format YYYY-MM-DD

      const response = await axios.get(API_GET_RANKING_URL, {
        headers: { Authorization: `Bearer ${token}` },
        params: params, // Kirim filter sebagai query params
      });

      setRankedData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching ranked CV data:", err);
      setError(err);
      Notiflix.Report.failure("Load Data Failed", err.response?.data?.message || err.message || "An error occurred.", "Okay");
    } finally {
      setLoading(false);
    }
  }, [limit, searchTerm, statusFilter, qualificationFilter, dateFilter]); // Fetch ulang jika filter berubah

  // Fetch data saat filter/limit berubah
  useEffect(() => {
    fetchRankedData();
  }, [fetchRankedData]);

  // --- Filter Options (Sederhana untuk Halaman Ranking) ---
  // Kita bisa buat statis karena kita tahu ranking hanya untuk status tertentu
  const availableStatuses = useMemo(() => [
    { value: "", label: "All Processed Status" },
    { value: "Reviewed", label: "Reviewed" },
    { value: "Accepted", label: "Accepted" },
    { value: "Rejected", label: "Rejected" },
  ], []);

  // TODO: Ambil kualifikasi dari API terpisah agar filter ini tetap berfungsi
  const availableQualifications = useMemo(() => [
    { value: "", label: "All Qualifications" },
    // { value: "DevOps Engineer", label: "DevOps Engineer" },
  ], []);


  // --- Handlers ---
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);
  const handleQualificationFilterChange = (e) => setQualificationFilter(e.target.value);
  const handleDateFilterChange = (date) => setDateFilter(date);
  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    if (newLimit >= 1 && newLimit <= 50) { // Batasi limit
      setLimit(newLimit);
    }
  };
  const handlePageChange = (page) => {
    // Halaman ini tidak pakai paginasi
  };

  // --- HANDLER BARU UNTUK REFRESH ---
  const handleRefresh = () => {
    console.log("Refreshing CV data manually...");
    Notiflix.Notify.info('Refreshing list...'); // Opsional: Feedback
    fetchAllCvData(false); // Panggil fetch tanpa loading utama
  };
  // --- BATAS HANDLER BARU ---

  // Handler untuk membuka modal detail lengkap
  const handleViewDetail = useCallback(async (cv) => {
    if (!cv.cvFileObjectKey) { Notiflix.Report.warning("File Not Available", "CV file not found.", "Okay"); return; }
    const pdfApiUrl = API_VIEW_URL(cv.id);
    try {
      Notiflix.Loading.standard("Loading Full CV...");
      const token = getAuthToken();
      if (!token) throw new Error("Missing auth token");
      const response = await axios.get(pdfApiUrl, { responseType: "blob", headers: { Authorization: `Bearer ${token}` } });
      Notiflix.Loading.remove();
      const pdfBlobUrl = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      setPdfUrlToView(pdfBlobUrl);
      setViewingCv(cv);
      setShowPdfModal(true);
    } catch (error) {
      Notiflix.Loading.remove();
      console.error(`Error viewing CV ID ${cv.id}:`, error);
      Notiflix.Report.failure("Failed to Load CV", error.response?.data?.message || "An error occurred.", "Okay");
    }
  }, []);

  const handleClosePdfModal = useCallback(() => {
    setShowPdfModal(false);
    if (pdfUrlToView) { window.URL.revokeObjectURL(pdfUrlToView); setPdfUrlToView(null); }
    setViewingCv(null);
    // Tidak perlu fetchAllCvData karena tidak ada aksi di modal
  }, [pdfUrlToView]);


  // --- Render ---
  return (
     <div className="manage-cv-page-container p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-8">
          Top Candidate Ranking
        </h2>
      </div>

      {/* --- Filter Bar --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 p-3 rounded">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearchChange} className="shadow-sm border border-gray-300 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 flex-grow md:flex-grow-0 md:w-48" />
          <div className="relative w-full sm:w-auto">
            <select value={statusFilter} onChange={handleStatusFilterChange} className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 pr-8 appearance-none">
              {availableStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select> <ChevronDownIcon className="h-4 w-4 pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500" />
          </div>
          <div className="relative w-full sm:w-auto">
            <select value={qualificationFilter} onChange={handleQualificationFilterChange} className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 pr-8 appearance-none">
              {availableQualifications.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
            </select> <ChevronDownIcon className="h-4 w-4 pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500" />
          </div>
          <div className="relative w-full sm:w-auto min-w-[150px]">
            <DatePicker selected={dateFilter} onChange={handleDateFilterChange} dateFormat="dd/MM/yyyy" placeholderText="dd/mm/yyyy" isClearable className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 pr-8" />
            {!dateFilter && <CalendarDaysIcon className="h-5 w-5 text-gray-400 absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none" />}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
          <label htmlFor="limit-select" className="text-sm font-medium text-gray-700">Show Top:</label>
          <select id="limit-select" value={limit} onChange={handleLimitChange} className="shadow-sm border border-gray-300 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 pr-8 appearance-none">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
        <button
           onClick={handleRefresh}
           // Styling: Mirip tombol lain tapi warna netral (misal: abu-abu)
           className="flex items-center px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 bg-gray-500 hover:bg-gray-600 focus:ring-gray-400 text-white text-sm whitespace-nowrap transition-colors duration-150"
           title="Refresh CV List"
         >
           <ArrowPathIcon className="h-4 w-4 mr-1.5" /> {/* Ikon */}
           Refresh CV {/* Tulisan */}
         </button>
        <button onClick={() => navigate('/hr/manage-cv')} className="flex items-center px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 bg-gray-500 hover:bg-gray-600 focus:ring-gray-400 text-white text-sm whitespace-nowrap">
          <ArrowUturnLeftIcon className="mr-1.5 h-4 w-4" /> Back to Active CVs
        </button>
        </div>
      </div>

      {/* --- Loading / Empty / Error State --- */}
      {loading && (<div className="text-center text-gray-600 my-8 py-4">Loading candidate rankings...</div>)}
      {!loading && error && (<div className="text-center text-red-500 my-8 py-4">Failed to load rankings. Please try again.</div>)}
      {!loading && !error && rankedData.length === 0 && (
        <div className="text-center text-gray-500 my-8 py-4">
          No candidates found matching the current filters.
        </div>
      )}

      {/* --- MODIFIKASI: Mengganti "grid" dengan "flex flex-col" --- */}
      {/* Menggunakan 'gap-6' untuk jarak vertikal yang lebih profesional */}
      {!loading && !error && rankedData.length > 0 && (
        <div className="flex flex-col gap-6">
          {rankedData.map((cv, index) => (
            <CandidateRankCard
              key={cv.id}
              cv={cv}
              rank={index + 1} // Peringkat 1, 2, 3...
              onViewDetail={handleViewDetail}
            />
          ))}
        </div>
      )}
      {/* --- BATAS MODIFIKASI --- */}


      {/* --- Modal PDF Viewer (untuk detail) --- */}
      <PdfViewerModal
        isOpen={showPdfModal}
        onClose={handleClosePdfModal}
        pdfUrl={pdfUrlToView}
        viewingCv={viewingCv}
      />
    </div>
  );
}

export default TopRankingPage;