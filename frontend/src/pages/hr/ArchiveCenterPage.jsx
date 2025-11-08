// NAMA BARU: ArchiveCenterPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import Notiflix from "notiflix";
import ArchivedCVsTable from "../../components/hr/ArchivedCVsTable";
import ArchivedJobPositionsTable from "../../components/hr/ArchivedJobPositionsTable"; // <-- 1. IMPORT TABEL BARU
import PdfViewerModal from "../../components/PdfViewerModal";
import JobPositionFormModal from "../../components/hr/JobPositionFormModal"; // <-- 2. IMPORT MODAL LOWONGAN
import {
  ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon,
  ArchiveBoxIcon, TrashIcon, ArrowDownTrayIcon, CheckCircleIcon,
  XCircleIcon, ArrowUturnLeftIcon, InboxStackIcon, DocumentDuplicateIcon // <-- Ikon baru
} from "@heroicons/react/24/outline";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";

// --- API ENDPOINTS ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const getAuthToken = () => localStorage.getItem("token");
const ITEMS_PER_PAGE = 10;

// CV Endpoints
const API_GET_ARCHIVED_CVS_URL = `${API_BASE_URL}/api/hr/applications/archived`;
const API_UNARCHIVE_CVS_URL = `${API_BASE_URL}/api/hr/applications/unarchive`;
const API_BULK_DELETE_CVS_URL = `${API_BASE_URL}/api/hr/applications/bulk-delete`;
const API_VIEW_CV_URL = (id) => `${API_BASE_URL}/api/hr/applications/${id}/view-cv`;
const API_DOWNLOAD_CV_URL = (id) => `${API_BASE_URL}/api/hr/applications/${id}/download-cv`;
const API_DELETE_CV_URL = (id) => `${API_BASE_URL}/api/hr/applications/${id}`;

// Position Endpoints (BARU)
const API_GET_ARCHIVED_POSITIONS_URL = `${API_BASE_URL}/api/hr/job-positions/list/archived`;
const API_UNARCHIVE_POSITIONS_URL = `${API_BASE_URL}/api/hr/job-positions/unarchive`;
const API_DELETE_POSITION_URL = (id) => `${API_BASE_URL}/api/hr/job-positions/${id}`;


// --- 3. GANTI NAMA HALAMAN ---
function ArchiveCenterPage() {
  const navigate = useNavigate();
  
  // --- 4. STATE TAB BARU ---
  const [activeTab, setActiveTab] = useState('cv'); // 'cv' or 'positions'

  // State CV (Lama)
  const [allCvData, setAllCvData] = useState([]);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrlToView, setPdfUrlToView] = useState(null);
  const [viewingCv, setViewingCv] = useState(null);
  const [selectedCVs, setSelectedCVs] = useState([]);
  
  // State Lowongan (BARU)
  const [allPositionData, setAllPositionData] = useState([]);
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [positionToView, setPositionToView] = useState(null);

  // State Umum
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [qualificationFilter, setQualificationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(null);
  const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // --- 5. FUNGSI FETCH DATA (DUA FUNGSI) ---
  const fetchArchivedCvData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Missing auth token");
      const response = await axios.get(API_GET_ARCHIVED_CVS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllCvData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching archived CV data:", err);
      setError(err);
      Notiflix.Report.failure("Load CV Data Failed", err.response?.data?.message || err.message, "Okay");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchArchivedPositionData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Missing auth token");
      const response = await axios.get(API_GET_ARCHIVED_POSITIONS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllPositionData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching archived Position data:", err);
      setError(err);
      Notiflix.Report.failure("Load Position Data Failed", err.response?.data?.message || err.message, "Okay");
    } finally {
      setLoading(false);
    }
  }, []);

  // --- 6. EFEK PERGANTIAN TAB ---
  useEffect(() => {
    // Reset state umum saat ganti tab
    setLoading(true);
    setError(null);
    setSearchTerm("");
    setStatusFilter("");
    setQualificationFilter("");
    setDateFilter(null);
    setSortColumn(activeTab === 'cv' ? 'createdAt' : 'updatedAt');
    setSortDirection("desc");
    setCurrentPage(1);
    setIsSelectMode(false);
    setSelectedCVs([]);
    setSelectedPositions([]);
    
    // Fetch data sesuai tab
    if (activeTab === 'cv') {
      fetchArchivedCvData();
    } else {
      fetchArchivedPositionData();
    }
  }, [activeTab, fetchArchivedCvData, fetchArchivedPositionData]); // <-- Pemicunya ganti tab

  // --- CV: Filter Options ---
  const availableCvQualifications = useMemo(() => {
    const qualifications = (allCvData || []).map((item) => item.qualification).filter(Boolean);
    return ["", ...new Set(qualifications)];
  }, [allCvData]);
  const availableCvStatuses = useMemo(() => {
    const statuses = (allCvData || []).map((item) => item.status).filter(Boolean);
    return ["", ...new Set(statuses)];
  }, [allCvData]);

  // --- CV: Processed Data ---
  const processedCvData = useMemo(() => {
    let filtered = Array.isArray(allCvData) ? [...allCvData] : [];
    if (searchTerm) {
      const l = searchTerm.toLowerCase();
      filtered = filtered.filter((cv) => cv.fullName?.toLowerCase().includes(l) || cv.qualification?.toLowerCase().includes(l) || cv.email?.toLowerCase().includes(l));
    }
    if (statusFilter) filtered = filtered.filter((cv) => cv.status === statusFilter);
    if (qualificationFilter) filtered = filtered.filter((cv) => cv.qualification === qualificationFilter);
    if (dateFilter instanceof Date && !isNaN(dateFilter.getTime())) {
      const f = new Date(dateFilter).setHours(0, 0, 0, 0);
      filtered = filtered.filter((cv) => {
        try {
          const d = new Date(cv.createdAt).setHours(0, 0, 0, 0);
          return !isNaN(d) && d === f;
        } catch { return false; }
      });
    }
    // (Logika sort CV... tetap sama dari file Anda)
    const filteredAndSortedData = [...filtered];
    if (sortColumn) {
      filteredAndSortedData.sort((a, b) => {
        let aV = a[sortColumn];
        let bV = b[sortColumn];
        if (sortColumn === "final_recommendation") {
          aV = a.qualitative_assessment?.final_recommendation || null;
          bV = b.qualitative_assessment?.final_recommendation || null;
        }
        const isAsc = sortDirection === "asc";
        if (aV == null && bV == null) return 0;
        if (aV == null) return isAsc ? -1 : 1;
        if (bV == null) return isAsc ? 1 : -1;
        if (sortColumn === "createdAt") {
          const dA = new Date(aV).getTime();
          const dB = new Date(bV).getTime();
          if (isNaN(dA) && isNaN(dB)) return 0;
          if (isNaN(dA)) return isAsc ? -1 : 1;
          if (isNaN(dB)) return isAsc ? 1 : -1;
          return isAsc ? dA - dB : dB - dA;
        } else if (sortColumn === "similarity_score") {
          const nA = Number(aV);
          const nB = Number(bV);
          if (isNaN(nA) && isNaN(nB)) return 0;
          if (isNaN(nA)) return isAsc ? 1 : -1;
          if (isNaN(nB)) return isAsc ? -1 : 1;
          return isAsc ? nA - nB : nB - nA;
        } else if (sortColumn === "passed_hard_gate") {
          const vA = aV === true ? 1 : 0;
          const vB = bV === true ? 1 : 0;
          return isAsc ? vA - vB : vB - vA;
        } else if (typeof aV === "string" && typeof bV === "string") {
          return isAsc ? aV.localeCompare(bV) : bV.localeCompare(aV);
        } else {
          return isAsc ? (aV < bV ? -1 : aV > bV ? 1 : 0) : (bV < aV ? -1 : bV > aV ? 1 : 0);
        }
      });
    }

    const totalItems = filteredAndSortedData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    const validPage = Math.max(1, Math.min(currentPage, totalPages > 0 ? totalPages : 1));
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    return {
      data: paginatedData, filteredAndSortedData, totalItems, totalPages,
      currentPage: validPage, firstItemIndex: totalItems > 0 ? startIndex + 1 : 0,
      lastItemIndex: Math.min(startIndex + ITEMS_PER_PAGE, totalItems),
    };
  }, [allCvData, searchTerm, statusFilter, qualificationFilter, dateFilter, sortColumn, sortDirection, currentPage]);

  // --- LOWONGAN: Processed Data (BARU) ---
  const processedPositionData = useMemo(() => {
    let filtered = Array.isArray(allPositionData) ? [...allPositionData] : [];
    if (searchTerm) {
      const l = searchTerm.toLowerCase();
      filtered = filtered.filter((pos) => pos.name?.toLowerCase().includes(l) || pos.requestor?.name.toLowerCase().includes(l));
    }
    // (Filter status lowongan)
    if (statusFilter) filtered = filtered.filter((pos) => pos.status === statusFilter);
    
    if (dateFilter instanceof Date && !isNaN(dateFilter.getTime())) {
      const f = new Date(dateFilter).setHours(0, 0, 0, 0);
      filtered = filtered.filter((pos) => {
        try {
          const d = new Date(pos.updatedAt).setHours(0, 0, 0, 0); // Filter by archived date
          return !isNaN(d) && d === f;
        } catch { return false; }
      });
    }
    
    const filteredAndSortedData = [...filtered];
    if (sortColumn) {
      filteredAndSortedData.sort((a, b) => {
         let aVal = a[sortColumn];
         let bVal = b[sortColumn];
         if (sortColumn === 'requestor') {
           aVal = a.requestor?.name || null;
           bVal = b.requestor?.name || null;
         }
         // (Logika sort sisanya mirip CVsTable)
         const isAsc = sortDirection === "asc";
         if (aVal == null && bVal == null) return 0;
         if (aVal == null) return isAsc ? -1 : 1;
         if (bVal == null) return isAsc ? 1 : -1;
         if (sortColumn === 'updatedAt') {
           const dA = new Date(aVal).getTime();
           const dB = new Date(bVal).getTime();
           return isAsc ? dA - dB : dB - dA;
         }
         if (typeof aVal === 'string' && typeof bVal === 'string') {
           return isAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
         }
         return isAsc ? (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) : (bV < aVal ? -1 : bV > aVal ? 1 : 0);
      });
    }

    const totalItems = filteredAndSortedData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    const validPage = Math.max(1, Math.min(currentPage, totalPages > 0 ? totalPages : 1));
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    return {
      data: paginatedData, filteredAndSortedData, totalItems, totalPages,
      currentPage: validPage, firstItemIndex: totalItems > 0 ? startIndex + 1 : 0,
      lastItemIndex: Math.min(startIndex + ITEMS_PER_PAGE, totalItems),
    };
  }, [allPositionData, searchTerm, statusFilter, dateFilter, sortColumn, sortDirection, currentPage]);


  // (Effect reset/paginasi... tetap sama)
  useEffect(() => {
    setCurrentPage(1);
    if (!isSelectMode) {
      setSelectedCVs([]);
      setSelectedPositions([]);
    }
  }, [searchTerm, statusFilter, qualificationFilter, dateFilter, sortColumn, sortDirection, isSelectMode]);
  
  useEffect(() => {
    const dataSet = activeTab === 'cv' ? processedCvData : processedPositionData;
    const { totalPages, currentPage } = dataSet;
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [processedCvData, processedPositionData, activeTab]);


  // (Handlers: handleSearchChange, handleStatusFilterChange... tetap sama)
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);
  const handleQualificationFilterChange = (e) => setQualificationFilter(e.target.value);
  const handleDateFilterChange = (date) => setDateFilter(date);
  const handleSort = (column) => {
    setSortDirection((prev) => (sortColumn === column && prev === "asc" ? "desc" : "asc"));
    setSortColumn(column);
  };
  const handlePageChange = (page) => {
    const dataSet = activeTab === 'cv' ? processedCvData : processedPositionData;
    if (page >= 1 && page <= dataSet.totalPages) {
      setCurrentPage(page);
    }
  };

  // --- (Handlers Aksi CV: handleViewDetail, handleClosePdfModal, handleDownloadCV, handleDeleteCV... tetap sama) ---
  const handleViewDetail = useCallback(async (cv) => {
    if (!cv.cvFileObjectKey) {
      Notiflix.Report.warning("File Not Available", "CV file not found.", "Okay");
      return;
    }
    const pdfApiUrl = API_VIEW_CV_URL(cv.id);
    try {
      Notiflix.Loading.standard("Loading CV...");
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
      Notiflix.Report.failure("Failed to Load CV", error.response?.data?.message || "An error occurred.", "Okay");
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
  const handleDownloadCV = useCallback(async (cv) => {
    if (!cv.cvFileObjectKey) {
      Notiflix.Report.warning("File Not Available", "CV file not found.", "Okay");
      return;
    }
    const downloadUrl = API_DOWNLOAD_CV_URL(cv.id);
    try {
      Notiflix.Loading.standard("Downloading CV...");
      const token = getAuthToken();
      if (!token) throw new Error("Missing auth token");
      const response = await axios.get(downloadUrl, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
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
      Notiflix.Report.failure("Download Failed", error.response?.data?.message || "An error occurred.", "Okay");
    }
  }, []);
  const handleDeleteCV = useCallback((cv) => {
      Notiflix.Confirm.show(
        "Confirm Permanent Delete",
        `PERMANENTLY DELETE application from ${cv.fullName}? This cannot be undone.`,
        "DELETE", "Cancel",
        async () => {
          const deleteApiUrl = API_DELETE_CV_URL(cv.id);
          try {
            Notiflix.Loading.standard("Deleting...");
            const token = getAuthToken();
            if (!token) throw new Error("Missing auth token");
            await axios.delete(deleteApiUrl, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Notiflix.Loading.remove();
            Notiflix.Report.success("Deleted", `Application from ${cv.fullName} deleted.`, "Okay");
            fetchArchivedCvData(); // Refresh data arsip CV
          } catch (error) {
            Notiflix.Loading.remove();
            Notiflix.Report.failure("Delete Failed", error.response?.data?.message || "An error occurred.", "Okay");
          }
        },
        () => {},
        { okButtonBackground: "#EF4444", titleColor: "#DC2626" }
      );
    }, [fetchArchivedCvData]);

  // --- (Handlers Bulk CV: handleUnarchiveSelected, handleBulkDeleteArchived, handleBulkDownloadSelected... tetap sama) ---
  const handleUnarchiveSelectedCVs = useCallback(async () => {
    if (selectedCVs.length === 0) {
      Notiflix.Report.warning("No Items Selected", "Select items to unarchive.", "Okay");
      return;
    }
    Notiflix.Confirm.show(
      "Confirm Unarchive",
      `Unarchive ${selectedCVs.length} selected applications?`,
      "Unarchive", "Cancel",
      async () => {
        try {
          Notiflix.Loading.standard("Unarchiving...");
          const token = getAuthToken();
          if (!token) throw new Error("Missing token");
          await axios.put(
            API_UNARCHIVE_CVS_URL,
            { ids: selectedCVs },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          Notiflix.Loading.remove();
          Notiflix.Report.success("Unarchived", `${selectedCVs.length} applications unarchived.`, "Okay");
          await fetchArchivedCvData();
          setSelectedCVs([]);
          setIsSelectMode(false);
        } catch (error) {
          Notiflix.Loading.remove();
          Notiflix.Report.failure("Unarchive Failed", error.response?.data?.message || "Error", "Okay");
        }
      },
      () => {}
    );
  }, [selectedCVs, fetchArchivedCvData]);
  const handleBulkDeleteArchivedCVs = useCallback(async () => {
    if (selectedCVs.length === 0) {
      Notiflix.Report.warning("No Items Selected", "Select items to delete.", "Okay");
      return;
    }
    Notiflix.Confirm.show(
      "Confirm Permanent Delete",
      `PERMANENTLY DELETE ${selectedCVs.length} selected applications? This cannot be undone.`,
      "DELETE", "Cancel",
      async () => {
        try {
          Notiflix.Loading.standard("Deleting...");
          const token = getAuthToken();
          if (!token) throw new Error("Missing token");
          await axios.post(
            API_BULK_DELETE_CVS_URL,
            { ids: selectedCVs },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          Notiflix.Loading.remove();
          Notiflix.Report.success("Deleted", `${selectedCVs.length} applications deleted.`, "Okay");
          await fetchArchivedCvData();
          setSelectedCVs([]);
          setIsSelectMode(false);
        } catch (error) {
          Notiflix.Loading.remove();
          Notiflix.Report.failure("Delete Failed", error.response?.data?.message || "Error", "Okay");
        }
      },
      () => {},
      { okButtonBackground: "#EF4444", titleColor: "#DC2626" }
    );
  }, [selectedCVs, fetchArchivedCvData]);
  const handleBulkDownloadSelectedCVs = useCallback(async () => {
    if (selectedCVs.length === 0) {
      Notiflix.Report.warning("No Items Selected", "Select items to download.", "Okay");
      return;
    }
    Notiflix.Loading.standard(`Preparing ${selectedCVs.length} CVs...`);
    const token = getAuthToken();
    if (!token) {
      Notiflix.Loading.remove();
      return;
    }
    const zip = new JSZip();
    let filesAdded = 0;
    try {
      const downloadPromises = selectedCVs.map(async (cvId) => {
        const cv = allCvData.find((item) => item.id === cvId);
        if (cv?.cvFileObjectKey) {
          try {
            const response = await axios.get(API_DOWNLOAD_CV_URL(cv.id), {
              responseType: "blob",
              headers: { Authorization: `Bearer ${token}` },
            });
            const safeFullName = (cv.fullName || `app_${cv.id}`).replace(/[^a-z0-9]/gi,"_");
            const safeQual = (cv.qualification || "pos").replace(/[^a-z0-9]/gi, "_");
            const extension = cv.cvFileName?.split(".").pop()?.toLowerCase() || "pdf";
            zip.file(`${cv.id}_${safeFullName}_${safeQual}.${extension}`, response.data);
            filesAdded++;
          } catch (downloadError) {
            console.error(`Failed download for ID ${cvId}:`, downloadError);
          }
        }
      });
      await Promise.allSettled(downloadPromises);
      if (filesAdded > 0) {
        Notiflix.Loading.change(`Generating ZIP...`);
        zip.generateAsync({
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: { level: 6 },
          })
          .then((content) => {
            saveAs(content, `selected_archived_cvs_${new Date().toISOString().split("T")[0]}.zip`);
            Notiflix.Loading.remove();
          })
          .catch((zipError) => {
            Notiflix.Loading.remove();
            Notiflix.Report.failure("ZIP Error", "Failed to generate ZIP.", "Okay");
          });
      } else {
        Notiflix.Loading.remove();
        Notiflix.Report.warning("Download Failed", "Could not download files.", "Okay");
      }
    } catch (error) {
      Notiflix.Loading.remove();
      Notiflix.Report.failure("Download Error", "An unexpected error occurred.", "Okay");
    }
  }, [selectedCVs, allCvData]);

  // --- 7. HANDLER AKSI BARU UNTUK LOWONGAN ---
  const handleViewPositionDetail = useCallback((position) => {
    setPositionToView(position);
    setShowPositionModal(true);
  }, []);

  const handleClosePositionModal = useCallback(() => {
    setShowPositionModal(false);
    setPositionToView(null);
  }, []);
  
  const handleDeletePosition = useCallback((position) => {
    Notiflix.Confirm.show(
      "Confirm Permanent Delete",
      `PERMANENTLY DELETE lowongan "${position.name}"? This cannot be undone.`,
      "DELETE", "Cancel",
      async () => {
        try {
          Notiflix.Loading.standard("Deleting...");
          const token = getAuthToken();
          if (!token) throw new Error("Missing auth token");
          await axios.delete(API_DELETE_POSITION_URL(position.id), {
            headers: { Authorization: `Bearer ${token}` },
          });
          Notiflix.Loading.remove();
          Notiflix.Report.success("Deleted", `Lowongan ${position.name} deleted.`, "Okay");
          fetchArchivedPositionData(); // Refresh data lowongan
        } catch (error) {
          Notiflix.Loading.remove();
          Notiflix.Report.failure("Delete Failed", error.response?.data?.message || "Error", "Okay");
        }
      },
      () => {},
      { okButtonBackground: "#EF4444", titleColor: "#DC2626" }
    );
  }, [fetchArchivedPositionData]);

  const handleUnarchivePositions = useCallback(async (positionIds) => {
     if (positionIds.length === 0) {
       Notiflix.Report.warning("No Items Selected", "Select items to unarchive.", "Okay");
       return;
     }
     Notiflix.Confirm.show(
      "Confirm Unarchive",
      `Unarchive ${positionIds.length} selected lowongan?`,
      "Unarchive", "Cancel",
      async () => {
        try {
          Notiflix.Loading.standard("Unarchiving...");
          const token = getAuthToken();
          if (!token) throw new Error("Missing token");
          await axios.put(
            API_UNARCHIVE_POSITIONS_URL,
            { ids: positionIds },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          Notiflix.Loading.remove();
          Notiflix.Report.success("Unarchived", `${positionIds.length} lowongan unarchived.`, "Okay");
          await fetchArchivedPositionData();
          setSelectedPositions([]);
          setIsSelectMode(false);
        } catch (error) {
          Notiflix.Loading.remove();
          Notiflix.Report.failure("Unarchive Failed", error.response?.data?.message || "Error", "Okay");
        }
      },
      () => {}
    );
  }, [fetchArchivedPositionData]);
  
  // --- (Handlers Select Mode & Quick Select... di-split) ---
  const handleToggleSelectMode = useCallback(() => {
    setIsSelectMode((prev) => !prev);
    setSelectedCVs([]);
    setSelectedPositions([]);
  }, []);
  
  // CV Quick Select
  const handleSelectAllCVs = useCallback(() => setSelectedCVs(processedCvData.filteredAndSortedData.map((cv) => cv.id)), [processedCvData.filteredAndSortedData]);
  const handleSelectNoneCVs = useCallback(() => setSelectedCVs([]), []);
  const handleSelectAcceptedCVs = useCallback(() => setSelectedCVs(processedCvData.filteredAndSortedData.filter((cv) => cv.status === "Accepted").map((cv) => cv.id)), [processedCvData.filteredAndSortedData]);
  const handleSelectRejectedCVs = useCallback(() => setSelectedCVs(processedCvData.filteredAndSortedData.filter((cv) => cv.status === "Rejected").map((cv) => cv.id)), [processedCvData.filteredAndSortedData]);
  // Position Quick Select
  const handleSelectAllPositions = useCallback(() => setSelectedPositions(processedPositionData.filteredAndSortedData.map((pos) => pos.id)), [processedPositionData.filteredAndSortedData]);
  const handleSelectNonePositions = useCallback(() => setSelectedPositions([]), []);

  
  // --- 8. TAMPILAN RENDER UTAMA (DENGAN TAB) ---
  
  // Tentukan data & handler aktif berdasarkan tab
  const activeDataSet = activeTab === 'cv' ? processedCvData : processedPositionData;
  const isLoading = loading && activeDataSet.data.length === 0;

  return (
    <div className="manage-cv-page-container p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Archive Center
      </h2>
      
      {/* --- Tombol Navigasi Tab --- */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('cv')}
          className={`flex items-center px-4 py-3 text-sm font-medium ${
            activeTab === 'cv' 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
          Archived CVs ({allCvData.length})
        </button>
        <button
          onClick={() => setActiveTab('positions')}
          className={`flex items-center px-4 py-3 text-sm font-medium ${
            activeTab === 'positions' 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <InboxStackIcon className="h-5 w-5 mr-2" />
          Archived Lowongan ({allPositionData.length})
        </button>
      </div>

      {/* --- Konten Halaman (Filter & Tombol) --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder={activeTab === 'cv' ? "Search CVs (Nama, Email, Posisi)..." : "Search Lowongan (Nama, Requestor)..."}
            value={searchTerm}
            onChange={handleSearchChange}
            className="shadow-sm border border-gray-300 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 flex-grow md:flex-grow-0 md:w-48"
          />
          
          {/* Filter Khusus CV */}
          {activeTab === 'cv' && (
            <>
            <div className="relative w-full sm:w-auto">
              <select value={statusFilter} onChange={handleStatusFilterChange} className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 pr-8 appearance-none">
                <option value="">All Status</option>
                {availableCvStatuses.filter((s) => s).map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
              <ChevronDownIcon className="h-4 w-4 pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500" />
            </div>
            <div className="relative w-full sm:w-auto">
              <select value={qualificationFilter} onChange={handleQualificationFilterChange} className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 pr-8 appearance-none">
                <option value="">All Qualifications</option>
                {availableCvQualifications.filter((q) => q).map((q) => (<option key={q} value={q}>{q}</option>))}
              </select>
              <ChevronDownIcon className="h-4 w-4 pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500" />
            </div>
            </>
          )}

          {/* Filter Tanggal (Umum) */}
          <div className="relative w-full sm:w-auto min-w-[150px]">
            <DatePicker
              selected={dateFilter}
              onChange={handleDateFilterChange}
              dateFormat="dd/MM/yyyy"
              placeholderText={activeTab === 'cv' ? 'Filter Tgl Apply' : 'Filter Tgl Arsip'}
              isClearable
              className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 pr-8"
            />
            {!dateFilter && (<CalendarDaysIcon className="h-5 w-5 text-gray-400 absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none" />)}
          </div>
        </div>
        
        {/* Tombol Aksi Kanan (Umum) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleToggleSelectMode}
            className={`flex items-center px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 text-sm whitespace-nowrap transition-colors duration-150 ${ isSelectMode ? "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-white" : "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-white" }`}
          >
            {isSelectMode ? ( <XCircleIcon className="mr-1.5 h-4 w-4" /> ) : ( <CheckCircleIcon className="mr-1.5 h-4 w-4" /> )}
            {isSelectMode ? "Cancel Selection" : "Select for Bulk Actions"}
          </button>
          <button
            onClick={() => navigate("/hr/manage-cv")}
            className="flex items-center px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 bg-gray-500 hover:bg-gray-600 focus:ring-gray-400 text-white text-sm whitespace-nowrap"
          >
            <ArrowUturnLeftIcon className="mr-1.5 h-4 w-4" /> Back to Active CVs
          </button>
        </div>
      </div>

      {/* --- Panel Aksi Masal (BULK ACTION) --- */}
      {isSelectMode && activeTab === 'cv' && (
        <div className="mb-4 p-3 bg-gray-100 rounded border flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600 mr-2">CV Quick Select:</span>
            <button onClick={handleSelectAllCVs} className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-100">All ({processedCvData.filteredAndSortedData.length})</button>
            <button onClick={handleSelectNoneCVs} disabled={selectedCVs.length === 0} className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-100 disabled:opacity-50">None</button>
            <button onClick={handleSelectAcceptedCVs} className="px-2 py-1 text-xs border rounded bg-white hover:bg-green-50 text-green-700">Accepted</button>
            <button onClick={handleSelectRejectedCVs} className="px-2 py-1 text-xs border rounded bg-white hover:bg-red-50 text-red-700">Rejected</button>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {selectedCVs.length > 0 ? (
              <>
                <button onClick={handleUnarchiveSelectedCVs} title="Unarchive selected" className="flex items-center px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs">
                  <ArrowUturnLeftIcon className="mr-1 h-4 w-4" /> Unarchive ({selectedCVs.length})
                </button>
                <button onClick={handleBulkDeleteArchivedCVs} title="Delete selected permanently" className="flex items-center px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs">
                  <TrashIcon className="mr-1 h-4 w-4" /> Delete ({selectedCVs.length})
                </button>
                <button onClick={handleBulkDownloadSelectedCVs} title="Download selected CVs as ZIP" className="flex items-center px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  <ArrowDownTrayIcon className="mr-1 h-4 w-4" /> Download ({selectedCVs.length})
                </button>
              </>
            ) : (<span className="text-sm text-gray-500 italic">Select CVs...</span>)}
          </div>
        </div>
      )}
      
      {isSelectMode && activeTab === 'positions' && (
        <div className="mb-4 p-3 bg-gray-100 rounded border flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600 mr-2">Lowongan Quick Select:</span>
            <button onClick={handleSelectAllPositions} className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-100">All ({processedPositionData.filteredAndSortedData.length})</button>
            <button onClick={handleSelectNonePositions} disabled={selectedPositions.length === 0} className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-100 disabled:opacity-50">None</button>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {selectedPositions.length > 0 ? (
              <>
                <button onClick={() => handleUnarchivePositions(selectedPositions)} title="Unarchive selected" className="flex items-center px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs">
                  <ArrowUturnLeftIcon className="mr-1 h-4 w-4" /> Unarchive ({selectedPositions.length})
                </button>
                <button onClick={() => handleDeletePosition({ id: selectedPositions, name: `${selectedPositions.length} lowongan` })} title="Delete selected permanently" className="flex items-center px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs">
                  <TrashIcon className="mr-1 h-4 w-4" /> Delete ({selectedPositions.length})
                </button>
              </>
            ) : (<span className="text-sm text-gray-500 italic">Select Lowongan...</span>)}
          </div>
        </div>
      )}

      {/* --- Loading & Error States --- */}
      {isLoading && <div className="text-center p-8 text-gray-600">Memuat data arsip...</div>}
      {!isLoading && error && <div className="text-center p-8 text-red-600">Error: {error.message || "Gagal memuat data."}</div>}

      {/* --- 8. RENDER TABEL KONDISIONAL --- */}
      {!isLoading && !error && activeTab === 'cv' && (
        <>
          <ArchivedCVsTable
            data={processedCvData.data}
            isSelectMode={isSelectMode}
            onViewDetail={handleViewDetail}
            onDeleteCV={handleDeleteCV} 
            onDownloadCV={handleDownloadCV}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            selectedCVs={selectedCVs}
            setSelectedCVs={setSelectedCVs}
            firstItemIndex={processedCvData.firstItemIndex}
          />
          {/* Paginasi CV */}
          {!loading && processedCvData.totalItems > ITEMS_PER_PAGE && (
            <Pagination 
              currentPage={processedCvData.currentPage}
              totalPages={processedCvData.totalPages}
              onPageChange={handlePageChange}
              totalItems={processedCvData.totalItems}
              firstItemIndex={processedCvData.firstItemIndex}
              lastItemIndex={processedCvData.lastItemIndex}
            />
          )}
        </>
      )}

      {!isLoading && !error && activeTab === 'positions' && (
        <>
          <ArchivedJobPositionsTable
            data={processedPositionData.data}
            isSelectMode={isSelectMode}
            onViewDetail={handleViewPositionDetail} // <-- Kirim handler baru
            onDelete={handleDeletePosition}
            onUnarchive={handleUnarchivePositions}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            selectedPositions={selectedPositions}
            setSelectedPositions={setSelectedPositions}
            firstItemIndex={processedPositionData.firstItemIndex}
          />
          {/* Paginasi Lowongan */}
          {!loading && processedPositionData.totalItems > ITEMS_PER_PAGE && (
             <Pagination 
              currentPage={processedPositionData.currentPage}
              totalPages={processedPositionData.totalPages}
              onPageChange={handlePageChange}
              totalItems={processedPositionData.totalItems}
              firstItemIndex={processedPositionData.firstItemIndex}
              lastItemIndex={processedPositionData.lastItemIndex}
            />
          )}
        </>
      )}
      
      {/* --- 9. RENDER KEDUA MODAL --- */}
      <PdfViewerModal
        isOpen={showPdfModal}
        onClose={handleClosePdfModal}
        pdfUrl={pdfUrlToView}
        viewingCv={viewingCv}
      />
      
      <JobPositionFormModal
        isOpen={showPositionModal}
        onClose={handleClosePositionModal}
        onSubmit={() => {}} // Kosongkan onSubmit, karena read-only
        initialData={positionToView}
        isReadOnly={true} // <-- KIRIM PROPS READ-ONLY BARU
      />
    </div>
  );
}

// --- 10. KOMPONEN PAGINASI (HELPER) ---
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, firstItemIndex, lastItemIndex }) => (
  <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-0 -mt-px rounded-b-lg shadow-md">
    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{firstItemIndex}</span> to <span className="font-medium">{lastItemIndex}</span> of <span className="font-medium">{totalItems}</span> results
        </p>
      </div>
      <div>
        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50">
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50">
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </nav>
      </div>
    </div>
  </div>
);

export default ArchiveCenterPage;