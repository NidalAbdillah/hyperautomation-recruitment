import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import Notiflix from "notiflix";
import CVsTable from "../../components/hr/CVsTable";
import PdfViewerModal from "../../components/PdfViewerModal";
import {
  ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon,
  ArchiveBoxIcon, TrashIcon, ArrowDownTrayIcon,
  CheckCircleIcon, XCircleIcon, ArrowPathIcon // Untuk tombol Select Mode
} from "@heroicons/react/24/outline";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';

// --- API Endpoints ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_GET_CVS_URL = `${API_BASE_URL}/api/hr/applications`;
const API_UPDATE_STATUS_URL = (id) => `${API_BASE_URL}/api/hr/applications/${id}/status`;
const API_DELETE_URL = (id) => `${API_BASE_URL}/api/hr/applications/${id}`;
const API_VIEW_URL = (id) => `${API_BASE_URL}/api/hr/applications/${id}/view-cv`;
const API_DOWNLOAD_URL = (id) => `${API_BASE_URL}/api/hr/applications/${id}/download-cv`;
const API_ARCHIVE_URL = `${API_BASE_URL}/api/hr/applications/archive`;
const API_BULK_DELETE_ACTIVE_URL = `${API_BASE_URL}/api/hr/applications/bulk-delete-active`;

// --- Helper ---
const getAuthToken = () => localStorage.getItem("token");

// --- Constants ---
const ITEMS_PER_PAGE = 10;

function ManageCVsPage() {
  const navigate = useNavigate();
  const [allCvData, setAllCvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrlToView, setPdfUrlToView] = useState(null);
  const [viewingCv, setViewingCv] = useState(null);
  const [selectedCVs, setSelectedCVs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [qualificationFilter, setQualificationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(null);
  const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSelectMode, setIsSelectMode] = useState(false); // State baru

  // --- Data Fetching ---
  const fetchAllCvData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Missing auth token");
      const response = await axios.get(API_GET_CVS_URL, { headers: { Authorization: `Bearer ${token}` } });
      setAllCvData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching CV data:", err);
      setError(err);
      Notiflix.Report.failure("Load Data Failed", err.response?.data?.message || err.message || "An error occurred.", "Okay");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllCvData();
  }, [fetchAllCvData]);

  // --- Dynamic Filter Options ---
  const availableQualifications = useMemo(() => {
    const qualifications = (allCvData || []).map(item => item.qualification).filter(Boolean);
    return ["", ...new Set(qualifications)];
  }, [allCvData]);

  const availableStatuses = useMemo(() => {
    const statuses = (allCvData || []).map(item => item.status).filter(Boolean);
    return ["", ...new Set(statuses)];
  }, [allCvData]);

  // --- Client-Side Data Processing ---
  const processedCvData = useMemo(() => {
    let filtered = Array.isArray(allCvData) ? [...allCvData] : [];
    
    // 1. Filtering
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(cv =>
        (cv.fullName?.toLowerCase().includes(lower)) ||
        (cv.qualification?.toLowerCase().includes(lower)) ||
        (cv.email?.toLowerCase().includes(lower))
      );
    }
    if (statusFilter) filtered = filtered.filter(cv => cv.status === statusFilter);
    if (qualificationFilter) filtered = filtered.filter(cv => cv.qualification === qualificationFilter);
    if (dateFilter instanceof Date && !isNaN(dateFilter.getTime())) {
      const filterDayStart = new Date(dateFilter).setHours(0, 0, 0, 0);
      filtered = filtered.filter(cv => {
        try {
          const cvDayStart = new Date(cv.createdAt).setHours(0, 0, 0, 0);
          return !isNaN(cvDayStart) && cvDayStart === filterDayStart;
        } catch { return false; }
      });
    }

    // 2. Sorting
    const filteredAndSortedData = [...filtered];
    if (sortColumn) {
      filteredAndSortedData.sort((a, b) => {
        let aValue = a[sortColumn];
        let bValue = b[sortColumn];
        if (sortColumn === 'final_recommendation') {
          aValue = a.qualitative_assessment?.final_recommendation || null;
          bValue = b.qualitative_assessment?.final_recommendation || null;
        }
        const isAsc = sortDirection === "asc";
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return isAsc ? -1 : 1;
        if (bValue == null) return isAsc ? 1 : -1;

        if (sortColumn === "createdAt") {
          const dateA = new Date(aValue).getTime();
          const dateB = new Date(bValue).getTime();
          if (isNaN(dateA) && isNaN(dateB)) return 0;
          if (isNaN(dateA)) return isAsc ? -1 : 1;
          if (isNaN(dateB)) return isAsc ? 1 : -1;
          return isAsc ? dateA - dateB : dateB - dateA;
        } else if (sortColumn === 'similarity_score') {
          const numA = Number(aValue);
          const numB = Number(bValue);
          if (isNaN(numA) && isNaN(numB)) return 0;
          if (isNaN(numA)) return isAsc ? 1 : -1;
          if (isNaN(numB)) return isAsc ? -1 : 1;
          return isAsc ? numA - numB : numB - numA;
        } else if (sortColumn === 'passed_hard_gate') {
          const valA = aValue === true ? 1 : 0;
          const valB = bValue === true ? 1 : 0;
          return isAsc ? valA - valB : valB - valA;
        } else if (typeof aValue === "string" && typeof bValue === "string") {
          return isAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        } else {
          return isAsc ? (aValue < bValue ? -1 : aValue > bValue ? 1 : 0)
                       : (bValue < aValue ? -1 : bValue > aValue ? 1 : 0);
        }
      });
    }

    // 3. Paginasi
    const totalItems = filteredAndSortedData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    const validPage = Math.max(1, Math.min(currentPage, totalPages > 0 ? totalPages : 1));
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return {
      data: paginatedData,
      filteredAndSortedData,
      totalItems,
      totalPages,
      currentPage: validPage,
      firstItemIndex: totalItems > 0 ? startIndex + 1 : 0,
      lastItemIndex: Math.min(startIndex + ITEMS_PER_PAGE, totalItems)
    };
  }, [allCvData, searchTerm, statusFilter, qualificationFilter, dateFilter, sortColumn, sortDirection, currentPage]);

  // --- Effects ---
  useEffect(() => {
    setCurrentPage(1);
    if (!isSelectMode) { // Hanya reset selection jika mode select dimatikan
      setSelectedCVs([]);
    }
  }, [searchTerm, statusFilter, qualificationFilter, dateFilter, sortColumn, sortDirection, isSelectMode]);

  useEffect(() => {
    const { totalPages, currentPage } = processedCvData;
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [processedCvData.totalItems, processedCvData.totalPages, currentPage]);

  // --- Handlers ---
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);
  const handleQualificationFilterChange = (e) => setQualificationFilter(e.target.value);
  const handleDateFilterChange = (date) => setDateFilter(date);
  const handleSort = (column) => {
    setSortDirection(prev => (sortColumn === column && prev === 'asc' ? 'desc' : 'asc'));
    setSortColumn(column);
  };
  const handlePageChange = (page) => {
    if (page >= 1 && page <= processedCvData.totalPages) {
      setCurrentPage(page);
    }
  };

  // --- HANDLER BARU UNTUK REFRESH ---
  const handleRefresh = () => {
    console.log("Refreshing CV data manually...");
    Notiflix.Notify.info('Refreshing list...'); // Opsional: Feedback
    fetchAllCvData(false); // Panggil fetch tanpa loading utama
  };
  // --- BATAS HANDLER BARU ---

  const performStatusUpdate = useCallback(async (cv, newStatus) => {
    const updateApiUrl = API_UPDATE_STATUS_URL(cv.id);
    try {
      Notiflix.Loading.standard(`Updating status...`);
      const token = getAuthToken();
      if (!token) throw new Error("Missing auth token");
      const response = await axios.put(updateApiUrl, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      Notiflix.Loading.remove();
      Notiflix.Report.success("Status Updated", `Status for ${cv.fullName} changed to ${newStatus}.`, "Okay");
      // Update state lokal dengan data baru dari backend
      setAllCvData(prevData =>
        prevData.map(item =>
          item.id === cv.id ? { ...item, ...response.data.application } : item
        )
      );
      return true;
    } catch (error) {
      Notiflix.Loading.remove();
      console.error(`Error updating status for CV ID ${cv.id}:`, error);
      Notiflix.Report.failure("Status Update Failed", error.response?.data?.message || "An error occurred.", "Okay");
      return false;
    }
  }, []); // Dependency array kosong sudah benar

  const handleViewDetail = useCallback(async (cv) => {
    if (!cv.cvFileObjectKey) { Notiflix.Report.warning("File Not Available", "CV file not found.", "Okay"); return; }
    const pdfApiUrl = API_VIEW_URL(cv.id);
    try {
      Notiflix.Loading.standard("Loading CV...");
      const token = getAuthToken();
      if (!token) throw new Error("Missing auth token");
      const response = await axios.get(pdfApiUrl, { responseType: "blob", headers: { Authorization: `Bearer ${token}` } });
      Notiflix.Loading.remove();
      const pdfBlobUrl = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      setPdfUrlToView(pdfBlobUrl);
      setViewingCv(cv);
      setShowPdfModal(true);
      if (cv.status === "Submitted") {
        performStatusUpdate(cv, "Reviewed").catch(err => console.error("Auto-update failed:", err));
      }
    } catch (error) {
      Notiflix.Loading.remove();
      console.error(`Error viewing CV ID ${cv.id}:`, error);
      Notiflix.Report.failure("Failed to Load CV", error.response?.data?.message || "An error occurred.", "Okay");
    }
  }, [performStatusUpdate]); // <-- Dependency yang benar

  const handleClosePdfModal = useCallback(() => {
    setShowPdfModal(false);
    if (pdfUrlToView) { window.URL.revokeObjectURL(pdfUrlToView); setPdfUrlToView(null); }
    setViewingCv(null);
    fetchAllCvData(); // Selalu refresh data setelah menutup modal
  }, [pdfUrlToView, fetchAllCvData]); // <-- Dependency yang benar

  const handleStatusChangeDirectly = useCallback((cv, newStatus) => {
    if (cv.status === newStatus) return;
    const isDisabled = cv.status === "Submitted" || !cv.qualitative_assessment;
    if (isDisabled) {
        Notiflix.Report.info("Info", "Please wait for AI analysis before changing status.", "Okay");
        return;
    }
    Notiflix.Confirm.show("Confirm Status Change", `Change status for ${cv.fullName} to "${newStatus}"?`, "Change", "Cancel",
      async () => { await performStatusUpdate(cv, newStatus); },
      () => { console.log("Status change cancelled."); }
    );
  }, [performStatusUpdate]); // <-- Dependency yang benar

  const handleDeleteCV = useCallback((cv) => {
    Notiflix.Confirm.show("Confirm Delete", `Delete application from ${cv.fullName}? This cannot be undone.`, "Delete", "Cancel",
      async () => {
        const deleteApiUrl = API_DELETE_URL(cv.id);
        try {
          Notiflix.Loading.standard("Deleting...");
          const token = getAuthToken();
          if (!token) throw new Error("Missing auth token");
          await axios.delete(deleteApiUrl, { headers: { Authorization: `Bearer ${token}` } });
          Notiflix.Loading.remove();
          Notiflix.Report.success("Deleted", `Application from ${cv.fullName} deleted.`, "Okay");
          fetchAllCvData(); // Refresh data
        } catch (error) {
          Notiflix.Loading.remove();
          console.error(`Error deleting CV ID ${cv.id}:`, error);
          Notiflix.Report.failure("Delete Failed", error.response?.data?.message || "An error occurred.", "Okay");
        }
      }, () => {}
    );
  }, [fetchAllCvData]); // <-- Dependency yang benar

  const handleDownloadCV = useCallback(async (cv) => {
    if (!cv.cvFileObjectKey) { Notiflix.Report.warning("File Not Available", "CV file not found.", "Okay"); return; }
    const downloadUrl = API_DOWNLOAD_URL(cv.id);
    try {
      Notiflix.Loading.standard("Downloading CV...");
      const token = getAuthToken();
      if (!token) throw new Error("Missing auth token");
      const response = await axios.get(downloadUrl, { responseType: "blob", headers: { Authorization: `Bearer ${token}` } });
      Notiflix.Loading.remove();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", cv.cvFileName || "cv.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      Notiflix.Loading.remove();
      console.error(`Error downloading CV ID ${cv.id}:`, error);
      Notiflix.Report.failure("Download Failed", error.response?.data?.message || "An error occurred.", "Okay");
    }
  }, []); // <-- Dependency [] sudah benar

  // Handler Toggle Select Mode
  const handleToggleSelectMode = useCallback(() => {
      setIsSelectMode(prev => !prev);
      setSelectedCVs([]); // Selalu reset selection saat ganti mode
  }, []);

  // Auto Selection Handlers
  const handleSelectAll = useCallback(() => setSelectedCVs(processedCvData.filteredAndSortedData.map(cv => cv.id)), [processedCvData.filteredAndSortedData]);
  const handleSelectNone = useCallback(() => setSelectedCVs([]), []);
  const handleSelectAccepted = useCallback(() => setSelectedCVs(processedCvData.filteredAndSortedData.filter(cv => cv.status === 'Accepted').map(cv => cv.id)), [processedCvData.filteredAndSortedData]);
  const handleSelectRejected = useCallback(() => setSelectedCVs(processedCvData.filteredAndSortedData.filter(cv => cv.status === 'Rejected').map(cv => cv.id)), [processedCvData.filteredAndSortedData]);

  // Bulk Action Handlers
  const handleArchiveSelected = useCallback(async () => {
    const idsToArchive = selectedCVs.filter(id => { const cv = allCvData.find(item => item.id === id); return cv && (cv.status === 'Accepted' || cv.status === 'Rejected'); });
    if (idsToArchive.length === 0) { Notiflix.Report.info("Info", "Only applications with status 'Accepted' or 'Rejected' can be archived.", "Okay"); return; }
    Notiflix.Confirm.show('Confirm Archive', `Archive ${idsToArchive.length} selected applications?`, 'Archive', 'Cancel', async () => {
      try {
        Notiflix.Loading.standard('Archiving...'); const token = getAuthToken(); if (!token) throw new Error("Missing token");
        await axios.put(API_ARCHIVE_URL, { ids: idsToArchive }, { headers: { Authorization: `Bearer ${token}` } });
        Notiflix.Loading.remove(); Notiflix.Report.success('Archived', `${idsToArchive.length} applications archived.`, 'Okay');
        await fetchAllCvData(); setSelectedCVs([]); setIsSelectMode(false);
      } catch (error) { Notiflix.Loading.remove(); console.error('Error archiving:', error); Notiflix.Report.failure('Archive Failed', error.response?.data?.message || "Error", 'Okay'); }
    }, () => {});
  }, [selectedCVs, allCvData, fetchAllCvData]);

  const handleBulkDeleteSelected = useCallback(async () => {
    if (selectedCVs.length === 0) { Notiflix.Report.warning("No Items Selected", "Select items to delete.", "Okay"); return; }
    Notiflix.Confirm.show('Confirm Permanent Delete', `PERMANENTLY DELETE ${selectedCVs.length} selected applications?`, 'DELETE', 'Cancel', async () => {
      try {
        Notiflix.Loading.standard('Deleting...'); const token = getAuthToken(); if (!token) throw new Error("Missing token");
        await axios.post(API_BULK_DELETE_ACTIVE_URL, { ids: selectedCVs }, { headers: { Authorization: `Bearer ${token}` } });
        Notiflix.Loading.remove(); Notiflix.Report.success('Deleted', `${selectedCVs.length} applications deleted.`, 'Okay');
        await fetchAllCvData(); setSelectedCVs([]); setIsSelectMode(false);
      } catch (error) { Notiflix.Loading.remove(); console.error('Error bulk deleting active:', error); Notiflix.Report.failure('Delete Failed', error.response?.data?.message || "Error", 'Okay'); }
    }, () => {}, { okButtonBackground: '#EF4444', titleColor: '#DC2626' });
  }, [selectedCVs, fetchAllCvData]);

  const handleBulkDownloadSelected = useCallback(async () => {
    if (selectedCVs.length === 0) { Notiflix.Report.warning("No Items Selected", "Select items to download.", "Okay"); return; }
    Notiflix.Loading.standard(`Preparing ${selectedCVs.length} CVs...`); const token = getAuthToken(); if (!token) { Notiflix.Loading.remove(); Notiflix.Report.warning("Auth Error", "Please log in.", "Okay"); return; }
    const zip = new JSZip(); let filesAdded = 0;
    try {
      const downloadPromises = selectedCVs.map(async (cvId) => {
        const cv = allCvData.find(item => item.id === cvId);
        if (cv?.cvFileObjectKey) {
          try {
            const response = await axios.get(API_DOWNLOAD_URL(cv.id), { responseType: "blob", headers: { Authorization: `Bearer ${token}` } });
            const safeFullName = (cv.fullName || `app_${cv.id}`).replace(/[^a-z0-9]/gi, '_'); const safeQual = (cv.qualification || 'pos').replace(/[^a-z0-9]/gi, '_');
            const extension = cv.cvFileName?.split('.').pop()?.toLowerCase() || 'pdf';
            zip.file(`${cv.id}_${safeFullName}_${safeQual}.${extension}`, response.data); filesAdded++;
          } catch (downloadError) { console.error(`Failed download for ID ${cvId}:`, downloadError); }
        }
      });
      await Promise.allSettled(downloadPromises);
      if (filesAdded > 0) {
        Notiflix.Loading.change(`Generating ZIP...`);
        zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } })
          .then(content => { saveAs(content, `selected_cvs_${new Date().toISOString().split('T')[0]}.zip`); Notiflix.Loading.remove(); })
          .catch(zipError => { Notiflix.Loading.remove(); Notiflix.Report.failure('ZIP Error', 'Failed to generate ZIP.', 'Okay'); });
      } else { Notiflix.Loading.remove(); Notiflix.Report.warning('Download Failed', 'Could not download files.', 'Okay'); }
    } catch (error) { Notiflix.Loading.remove(); Notiflix.Report.failure("Download Error", "An unexpected error occurred.", "Okay"); }
  }, [selectedCVs, allCvData]);

  // --- Render ---
  if (loading && allCvData.length === 0) return <div className="text-center p-8 text-gray-600">Memuat data aplikasi...</div>;
  if (error && allCvData.length === 0) return <div className="text-center p-8 text-red-600">Error: {error.message || "Gagal memuat data."}</div>;

  return (
    <div className="manage-cv-page-container p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-16">CV Applications</h2>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input type="text" placeholder="Search Name/Email/Qual..." value={searchTerm} onChange={handleSearchChange} className="shadow-sm border border-gray-300 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600 flex-grow md:flex-grow-0 md:w-48"/>
          <div className="relative w-full sm:w-auto">
            <select value={statusFilter} onChange={handleStatusFilterChange} className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600 pr-8 appearance-none">
              <option value="">All Status</option>
              {availableStatuses.filter(s=>s).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDownIcon className="h-4 w-4 pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"/>
          </div>
          <div className="relative w-full sm:w-auto">
             <select value={qualificationFilter} onChange={handleQualificationFilterChange} className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600 pr-8 appearance-none">
               <option value="">All Qualifications</option>
               {availableQualifications.filter(q=>q).map(q => <option key={q} value={q}>{q}</option>)}
             </select>
             <ChevronDownIcon className="h-4 w-4 pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"/>
           </div>
          <div className="relative w-full sm:w-auto min-w-[150px]">
            <DatePicker selected={dateFilter} onChange={handleDateFilterChange} dateFormat="dd/MM/yyyy" placeholderText="dd/mm/yyyy" isClearable className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600 pr-8"/>
            {!dateFilter && <CalendarDaysIcon className="h-5 w-5 text-gray-400 absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"/>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">

          <button
            onClick={handleToggleSelectMode}
            className={`flex items-center px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 text-sm whitespace-nowrap transition-colors duration-150 ${
              isSelectMode
                ? "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-white"
                : "bg-gray-500 hover:bg-gray-700 focus:ring-gray-500 text-white"
            }`}
          >
            {isSelectMode ? (
              <> <XCircleIcon className="mr-1.5 h-4 w-4" /> Cancel Selection </>
            ) : (
              <> <CheckCircleIcon className="mr-1.5 h-4 w-4" /> Select for Bulk Actions </>
            )}
          </button>
                    {/* --- TOMBOL REFRESH DITAMBAHKAN DI SINI --- */}
         <button
           onClick={handleRefresh}
           // Styling: Mirip tombol lain tapi warna netral (misal: abu-abu)
           className="flex items-center px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 bg-gray-500 hover:bg-gray-600 focus:ring-gray-400 text-white text-sm whitespace-nowrap transition-colors duration-150"
           title="Refresh CV List"
         >
           <ArrowPathIcon className="h-4 w-4 mr-1.5" /> {/* Ikon */}
           Refresh CV {/* Tulisan */}
         </button>
         {/* --- BATAS TOMBOL REFRESH --- */}
          <button onClick={() => navigate('/admin/archived-cvs')} className="flex items-center px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 bg-gray-500 hover:bg-gray-600 focus:ring-gray-400 text-white text-sm whitespace-nowrap">
            <ArchiveBoxIcon className="mr-1.5 h-4 w-4" /> View Archived
         </button>
        </div>
      </div>

      {isSelectMode && (
        <div className="mb-4 p-3 bg-gray-100 rounded border flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600 mr-2">Quick Select:</span>
            <button onClick={handleSelectAll} className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-600">All ({processedCvData.filteredAndSortedData.length})</button>
            <button onClick={handleSelectNone} disabled={selectedCVs.length === 0} className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-gray-600">None</button>
            <button onClick={handleSelectAccepted} className="px-2 py-1 text-xs border rounded bg-white hover:bg-green-50 focus:outline-none focus:ring-1 focus:ring-green-500 text-green-700">Accepted</button>
            <button onClick={handleSelectRejected} className="px-2 py-1 text-xs border rounded bg-white hover:bg-red-50 focus:outline-none focus:ring-1 focus:ring-red-500 text-red-700">Rejected</button>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {selectedCVs.length > 0 ? (
              <>
                <button onClick={handleArchiveSelected} title="Archive selected (only Accepted/Rejected)" className="flex items-center px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400 text-white text-xs whitespace-nowrap">
                  <ArchiveBoxIcon className="mr-1 h-4 w-4" /> Archive ({selectedCVs.length})
                </button>
                <button onClick={handleBulkDeleteSelected} title="Delete selected permanently" className="flex items-center px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white text-xs whitespace-nowrap">
                  <TrashIcon className="mr-1 h-4 w-4" /> Delete ({selectedCVs.length})
                </button>
                <button onClick={handleBulkDownloadSelected} title="Download selected CVs as ZIP" className="flex items-center px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 bg-blue-900 hover:bg-blue-700 focus:ring-blue-900 text-white text-xs whitespace-nowrap">
                  <ArrowDownTrayIcon className="mr-1 h-4 w-4" /> Download ({selectedCVs.length})
                </button>
              </>
            ) : (
                 <span className="text-sm text-gray-500 italic">Select CVs to perform bulk actions.</span>
            )}
          </div>
        </div>
      )}

      {loading && allCvData.length > 0 && ( <div className="text-center text-gray-600 mb-4 py-4">Updating list...</div> )}
      {!loading && processedCvData.data.length === 0 && allCvData.length > 0 && ( <div className="text-center text-gray-500 my-8 py-4">No CVs match the current filters.</div> )}
      {!loading && allCvData.length === 0 && !error && ( <div className="text-center text-gray-500 my-8 py-4">No active applications found.</div> )}
      {!loading && error && !loading && ( <div className="text-center text-red-500 my-8 py-4">Failed to load data. Please try again.</div>)}

      {(processedCvData.data.length > 0 || (loading && allCvData.length > 0)) && (
        <CVsTable
          data={processedCvData.data}
          isSelectMode={isSelectMode}
          onViewDetail={handleViewDetail}
          onDeleteCV={handleDeleteCV}
          onDownloadCV={handleDownloadCV}
          onStatusChangeDirectly={handleStatusChangeDirectly}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          selectedCVs={selectedCVs}
          setSelectedCVs={setSelectedCVs}
          firstItemIndex={processedCvData.firstItemIndex}
        />
      )}

      {!loading && processedCvData.totalItems > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-0 -mt-px rounded-b-lg shadow-md">
          <div className="flex flex-1 justify-between sm:hidden">
            <button onClick={() => handlePageChange(processedCvData.currentPage - 1)} disabled={processedCvData.currentPage <= 1} className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"> Prev </button>
             <span className="text-sm text-gray-700">Page {processedCvData.currentPage}/{processedCvData.totalPages}</span>
            <button onClick={() => handlePageChange(processedCvData.currentPage + 1)} disabled={processedCvData.currentPage >= processedCvData.totalPages} className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"> Next </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div> <p className="text-sm text-gray-700"> Showing <span className="font-medium">{processedCvData.firstItemIndex}</span> to <span className="font-medium">{processedCvData.lastItemIndex}</span> of <span className="font-medium">{processedCvData.totalItems}</span> results </p> </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button onClick={() => handlePageChange(processedCvData.currentPage - 1)} disabled={processedCvData.currentPage <= 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"> <ChevronLeftIcon className="h-5 w-5" /> </button>
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"> Page {processedCvData.currentPage} of {processedCvData.totalPages} </span>
                <button onClick={() => handlePageChange(processedCvData.currentPage + 1)} disabled={processedCvData.currentPage >= processedCvData.totalPages} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"> <ChevronRightIcon className="h-5 w-5" /> </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      <PdfViewerModal
        isOpen={showPdfModal}
        onClose={handleClosePdfModal}
        pdfUrl={pdfUrlToView}
        viewingCv={viewingCv}
      />
    </div>
  );
}

export default ManageCVsPage;