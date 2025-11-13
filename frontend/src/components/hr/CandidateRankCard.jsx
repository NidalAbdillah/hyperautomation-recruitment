// src/components/hr/CandidateRankCard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TrophyIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  XMarkIcon,
  ClockIcon, // <-- ✅ Impor ikon 'Jam'
} from "@heroicons/react/24/outline";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_VIEW_URL = (id) => `${API_BASE_URL}/api/hr/applications/${id}/view-cv`;
const getAuthToken = () => localStorage.getItem("token");

const RECOMMENDATION_COLOR_MAP = {
  "HIGHLY RECOMMENDED": "text-green-600 font-semibold",
  CONSIDER: "text-yellow-600 font-semibold",
  REJECT: "text-red-600 font-semibold",
  "N/A": "text-gray-500",
};

const RANK_COLOR_MAP = {
  1: "text-amber-400",
  2: "text-slate-400",
  3: "text-amber-600",
};

// Peta Status
const STATUS_DISPLAY_MAP = {
  "SUBMITTED":    { label: "Submitted", color: "bg-gray-100 text-gray-800" },
  "REVIEWED":     { label: "Reviewed (AI)", color: "bg-blue-100 text-blue-800" },
  "STAFF_APPROVED": { label: "Approved (Staff)", color: "bg-cyan-100 text-cyan-800" },
  "STAFF_REJECTED": { label: "Rejected (Staff)", color: "bg-red-100 text-red-800" },
  "INTERVIEW_QUEUED":    { label: "In Queue (Manager)", color: "bg-yellow-100 text-yellow-800" },
  "INTERVIEW_SCHEDULED": { label: "Scheduled (Manager)", color: "bg-purple-100 text-purple-800" },
  "PENDING_FINAL_DECISION": { label: "Final Review (HR)", color: "bg-indigo-100 text-indigo-800" },
  "HIRED":      { label: "Hired", color: "bg-green-100 text-green-800" },
  "NOT_HIRED":  { label: "Not Hired", color: "bg-red-100 text-red-800" },
  "ONBOARDING": { label: "Onboarding", color: "bg-green-100 text-green-800" },
};
const defaultStatusDisplay = { label: "N/A", color: "bg-gray-100 text-gray-800" };

function CandidateRankCard({
  cv,
  rank,
  onViewDetail,
  userRole,
  onSelectForInterview,
  onClearInterviewChoice, // <-- Pastikan prop ini ada
}) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState(null);

  const assessment = cv.qualitative_assessment;

  // (useEffect... tidak ada perubahan)
  useEffect(() => {
    const abortController = new AbortController();
    setIsLoadingPreview(true);
    setPreviewError(null);
    setNumPages(null);
    setPageNumber(1);

    if (!cv.cvFileObjectKey) {
      setPreviewError("No CV file available.");
      setIsLoadingPreview(false);
      return;
    }

    const fetchAndSetPdf = async () => {
      try {
        const token = getAuthToken();
        if (!token) throw new Error("Missing token");

        const response = await axios.get(API_VIEW_URL(cv.id), {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
          signal: abortController.signal,
        });

        const newBlobUrl = window.URL.createObjectURL(
          new Blob([response.data], { type: "application/pdf" })
        );

        if (!abortController.signal.aborted) {
          setPdfPreviewUrl(newBlobUrl);
        }
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.error(`Error fetching preview for CV ID ${cv.id}:`, error);
          if (!abortController.signal.aborted) {
            setPreviewError("Could not load preview.");
          }
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingPreview(false);
        }
      }
    };

    fetchAndSetPdf();

    return () => {
      abortController.abort();
    };
  }, [cv.id, cv.cvFileObjectKey]);
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        window.URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  // (Handlers... tidak ada perubahan)
  const onDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
    setNumPages(nextNumPages);
    setPageNumber(1);
  };
  const onDocumentLoadError = (err) => {
    console.error("PDF Preview Error:", err);
    setPreviewError("Failed to render PDF. File might be corrupted.");
    setIsLoadingPreview(false);
  };
  const handlePreviousPage = (e) => {
    e.stopPropagation();
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };
  const handleNextPage = (e) => {
    e.stopPropagation();
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };
  const renderList = (items, title) => {
    if (!items || !Array.isArray(items) || items.length === 0) return null;
    return (
      <div>
        <h5 className="text-xs font-semibold text-gray-500 mb-1">{title}</h5>
        <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 pl-1">
          {items.map((item, index) => (
            <li key={index} className="break-words">
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  const handleSelectClick = (e) => {
    e.stopPropagation();
    if (typeof onSelectForInterview === "function") {
      onSelectForInterview(cv);
    } else {
      console.warn("onSelectForInterview is not a function");
    }
  };
  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (typeof onViewDetail === "function") {
      onViewDetail(cv);
    } else {
      console.warn("onViewDetail is not a function");
    }
  };
  const handleClearClick = (e) => {
    e.stopPropagation();
    if (typeof onClearInterviewChoice === "function") {
      onClearInterviewChoice(cv);
    } else {
      console.warn("onClearInterviewChoice is not a function");
    }
  };
  // --- BATAS HANDLER ---


  // --- ✅ PERBAIKAN LOGIKA TOMBOL (Staff HR First) ---
  
  // 1. Status di mana Manajer bisa mengambil tindakan (memilih/undo)
const isActionableStatus = [
    "STAFF_APPROVED",
    "INTERVIEW_QUEUED", // <-- PERBAIKAN
    "INTERVIEW_SCHEDULED", // <-- PERBAIKAN
    "PENDING_FINAL_DECISION", // <-- PERBAIKAN
  ].includes(cv.status);

  // 2. Status di mana CV masih menunggu HR (Bypass dicegah)
  const isWaitingHR = cv.status === "REVIEWED"; // (Sudah benar)
  
  // 3. Status di mana proses sudah selesai
  const isFinalStatus = [
    "STAFF_REJECTED", 
    "HIRED", 
    "NOT_HIRED", 
    "ONBOARDING"
  ].includes(cv.status); // <-- PERBAIKAN (Lebih lengkap)

  // 4. Ambil preferensi Manajer
  const managerPreference = cv.interview_notes?.preference;
  
  // 5. Tampilkan grup tombol manajer jika:
  //    - User adalah 'manager'
  //    - DAN Statusnya BUKAN 'STAFF_Rejected'
  const showManagerActions = userRole === "manager" && !isFinalStatus;

  // 6. Tentukan warna tombol "Choice"
  const choiceButtonColor = managerPreference
    ? "bg-gray-500 hover:bg-gray-600 focus:ring-gray-400" // Abu-abu (Sudah diisi)
    : "bg-green-600 hover:bg-green-700 focus:ring-green-500"; // Hijau (Belum diisi)

  // --- BATAS PERBAIKAN LOGIKA ---

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-xl">
      {/* Header Kartu */}
      <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center gap-4">
        {/* Kolom Kiri: Peringkat dan Nama */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <TrophyIcon
            className={`h-6 w-6 flex-shrink-0 ${
              RANK_COLOR_MAP[rank] || "text-gray-400"
            }`}
          />
          <div className="min-w-0">
            <h3
              className="font-bold text-gray-800 text-md truncate"
              title={cv.fullName}
            >
              <span className="text-gray-400 font-normal mr-1">#{rank}</span>
              {cv.fullName}
            </h3>
            <p
              className="text-xs text-gray-500 truncate"
              title={cv.qualification}
            >
              {cv.qualification}
            </p>
          </div>
        </div>

        {/* --- ✅ PERBAIKAN RENDER TOMBOL KANAN --- */}
        <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0 ml-2">
          
          {/* Tombol 'Details' (Selalu ada untuk semua role) */}
          <button
            onClick={handleViewDetails}
            title="Open Full Details"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1.5 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap flex items-center gap-1.5"
          >
            <DocumentTextIcon className="h-4 w-4" />
            Details
          </button>

          {/* Grup Tombol Manajer */}
          {showManagerActions && (
            <div className="flex items-center gap-1">
              
              {/* Tombol "Choice" (Hanya muncul jika statusnya Actionable) */}
              {isActionableStatus && (
                <button
                  onClick={handleSelectClick}
                  title={managerPreference ? `Ubah Pilihan (Saat ini: ${managerPreference})` : "Pilih Tipe Wawancara"}
                  className={`text-white text-xs font-bold py-1.5 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${choiceButtonColor}`}
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  Choice to Interview Test
                </button>
              )}

              {/* Tombol "Clear" (Hanya muncul jika status Actionable & sudah memilih) */}
              {isActionableStatus && managerPreference && (
                 <button
                   onClick={handleClearClick}
                   title="Bersihkan Pilihan (Undo)"
                   className="p-1.5 rounded-md text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                 >
                   <XMarkIcon className="h-4 w-4" />
                 </button>
              )}
            </div>
          )}
          
        </div>
        {/* --- BATAS PERBAIKAN RENDER --- */}
      </div>

      {/* Card Body */}
      <div className="flex-grow flex flex-col md:flex-row min-h-0">
        {/* PDF Preview (Tidak ada perubahan) */}
        <div className="w-full md:w-2/5 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col bg-gray-100">
          <div
            className="flex-grow overflow-hidden flex justify-center items-center relative"
            style={{ minHeight: "350px" }}
          >
            {/* ... (Kode PDF viewer tidak berubah) ... */}
            {isLoadingPreview && (
              <div className="text-xs text-gray-500">Loading Preview...</div>
            )}
            {previewError && (
              <div className="text-xs text-red-500 p-4 text-center">
                <InformationCircleIcon className="h-6 w-6 mx-auto mb-1" />
                {previewError}
              </div>
            )}
            {pdfPreviewUrl && !previewError && !isLoadingPreview && (
              <Document
                file={pdfPreviewUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="text-xs text-gray-500">Rendering...</div>
                }
                className="flex justify-center items-center h-full"
              >
                <Page
                  pageNumber={pageNumber}
                  width={250}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                />
              </Document>
            )}
          </div>
          {numPages > 1 && !previewError && (
            <div className="flex justify-between items-center p-1.5 border-t border-gray-200 bg-white text-xs">
              {/* ... (Kode Paginasi PDF tidak berubah) ... */}
              <button
                onClick={handlePreviousPage}
                disabled={pageNumber <= 1}
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <span>
                {pageNumber} / {numPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={pageNumber >= numPages}
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Panel Analisis */}
        <div className="w-full md:w-3/5 p-4 overflow-y-auto space-y-4">
          {/* Skor & Rekomendasi (Tidak berubah) */}
          <div className="grid grid-cols-3 gap-4 text-center">
             {/* ... (Kode Similarity, Recommendation, Gate tidak berubah) ... */}
             <div>
              <label className="block text-xs font-medium text-gray-500">
                Similarity
              </label>
              <p className="text-xl font-bold text-gray-800">
                {typeof cv.similarity_score === "number"
                  ? cv.similarity_score.toFixed(4)
                  : "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Recommendation
              </label>
              <p
                className={`text-sm ${
                  RECOMMENDATION_COLOR_MAP[
                    assessment?.final_recommendation || "N/A"
                  ]
                }`}
              >
                {assessment?.final_recommendation?.replace(/_/g, " ") || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Mandatory Gate
              </label>
              <div className="flex items-center justify-center mt-1">
                {cv.passed_hard_gate === true ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : cv.passed_hard_gate === false ? (
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <span className="text-sm text-gray-500">-</span>
                )}
              </div>
            </div>
          </div>

          {/* Blok Status (Sudah benar) */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2">
             <div>
              <label className="block text-xs font-medium text-gray-500">
                Status
              </label>
              {(() => {
                const statusInfo =
                  STATUS_DISPLAY_MAP[cv.status] || defaultStatusDisplay;
                return (
                  <span
                    className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                );
              })()}
            </div>
            
            {/* --- ✅ PERBAIKAN: Tampilkan "Waiting" jika status REVIEWED --- */}
            {isWaitingHR && userRole === 'manager' && (
              <div>
                <label className="block text-xs font-medium text-gray-500">
                  Manager Action
                </label>
                <p className="text-sm font-semibold text-gray-500 flex items-center">
                   <ClockIcon className="h-4 w-4 mr-1.5" />
                   Waiting for Staff HR Review
                </p>
              </div>
            )}
            
            {/* Tampilkan Pilihan Manajer jika sudah ada */}
            {managerPreference && (
              <div>
                <label className="block text-xs font-medium text-gray-500">
                  Manager Request to HR
                </label>
                <p className="text-sm font-semibold text-gray-800">
                  {managerPreference}
                </p>
              </div>
            )}
          </div>

          {/* Blok AI Assessment (Tidak berubah) */}
          {assessment ? (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
              {/* ... (Kode AI Assessment tidak berubah) ... */}
              <div>
                <label className="block text-xs font-medium text-gray-500">
                  AI Assessment
                </label>
                <p className="text-xs text-gray-700 italic mt-1 break-words">
                  "{assessment.overall_assessment || "-"}"
                </p>
              </div>
              {renderList(assessment.key_strengths, "Key Strengths")}
              {renderList(
                assessment.key_weaknesses_or_gaps,
                "Key Weaknesses / Gaps"
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic text-center py-4">
              No qualitative assessment available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CandidateRankCard;