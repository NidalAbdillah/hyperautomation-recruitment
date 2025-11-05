// src/components/Admins/CandidateRankCard.jsx
import React, { useState, useEffect } from "react"; // Hapus useCallback, kita tidak pakai lagi
import axios from "axios";
import { Document, Page } from "react-pdf"; // 'pdfjs' tidak perlu di-import di sini
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import {
  CheckCircleIcon, XCircleIcon, InformationCircleIcon,
  ChevronLeftIcon, ChevronRightIcon, TrophyIcon
} from "@heroicons/react/24/outline";

// Konfigurasi worker HANYA ada di main.jsx.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_VIEW_URL = (id) => `${API_BASE_URL}/api/hr/applications/${id}/view-cv`;
const getAuthToken = () => localStorage.getItem("token");

const RECOMMENDATION_COLOR_MAP = {
  "HIGHLY RECOMMENDED": "text-green-600 font-semibold",
  "CONSIDER": "text-yellow-600 font-semibold",
  "REJECT": "text-red-600 font-semibold",
  "N/A": "text-gray-500",
};

const RANK_COLOR_MAP = {
  1: "text-amber-400", // Emas
  2: "text-slate-400", // Perak
  3: "text-amber-600", // Perunggu
};

function CandidateRankCard({ cv, rank, onViewDetail }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState(null);

  const assessment = cv.qualitative_assessment;

  // --- MODIFIKASI DIMULAI DI SINI (LOGIKA BARU) ---

  // Hook 1: HANYA untuk mengambil PDF saat CV berubah
  useEffect(() => {
    // 1. Set state loading
    setIsLoadingPreview(true);
    setPreviewError(null);
    setNumPages(null);
    setPageNumber(1);
    // JANGAN setPdfPreviewUrl(null) di sini, biarkan Hook 2 yg urus

    if (!cv.cvFileObjectKey) {
      setPreviewError("No CV file available.");
      setIsLoadingPreview(false);
      return; 
    }

    let isMounted = true; // Flag untuk mencegah memory leak

    const fetchAndSetPdf = async () => {
      try {
        const token = getAuthToken();
        if (!token) throw new Error("Missing token");

        const response = await axios.get(API_VIEW_URL(cv.id), {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` }
        });

        // Buat blob URL baru
        const newBlobUrl = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
        
        if (isMounted) {
          setPdfPreviewUrl(newBlobUrl); // 2. Set URL baru, ini akan memicu Hook 2
        }
        
      } catch (error) {
        console.error(`Error fetching preview for CV ID ${cv.id}:`, error);
        if (isMounted) {
          setPreviewError("Could not load preview.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingPreview(false);
        }
      }
    };

    fetchAndSetPdf();

    return () => {
      isMounted = false; // Cleanup untuk async
    };

  }, [cv.id, cv.cvFileObjectKey]); // <-- Hanya fetch saat CV berubah

  // Hook 2: HANYA untuk membersihkan (revoke) blob URL
  // Ini adalah perbaikan untuk race condition
  useEffect(() => {
    // 'pdfPreviewUrl' di sini adalah nilai DARI RENDER SEBELUMNYA (closure)
    // 'return' ini akan dijalankan TEPAT SEBELUM effect baru (di bawah) dijalankan
    return () => {
      if (pdfPreviewUrl) {
        // Hapus URL blob LAMA dari memori
        window.URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]); // <-- Jalankan cleanup ini SETIAP KALI pdfPreviewUrl berubah

  // --- BATAS MODIFIKASI ---

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
    setNumPages(nextNumPages);
    setPageNumber(1);
  };

  const onDocumentLoadError = (err) => {
    console.error("PDF Preview Error (onDocumentLoadError):", err);
    setPreviewError("Failed to render PDF. File might be corrupted.");
    setIsLoadingPreview(false);
  }

  const handlePreviousPage = (e) => {
    e.stopPropagation();
    setPageNumber(prev => Math.max(prev - 1, 1));
  };
  const handleNextPage = (e) => {
    e.stopPropagation();
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  const renderList = (items, title) => {
    if (!items || !Array.isArray(items) || items.length === 0) return null;
    return (
      <div>
        <h5 className="text-xs font-semibold text-gray-500 mb-1">{title}</h5>
        <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 pl-1">
          {items.map((item, index) => <li key={index} className="break-words">{item}</li>)}
        </ul>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-xl">
      {/* Card Header */}
      <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <TrophyIcon className={`h-6 w-6 flex-shrink-0 ${RANK_COLOR_MAP[rank] || 'text-gray-400'}`} />
          <div>
            <h3 className="font-bold text-gray-800 text-md truncate" title={cv.fullName}>
              <span className="text-gray-400 font-normal mr-1">#{rank}</span> {cv.fullName}
            </h3>
            <p className="text-xs text-gray-500 truncate" title={cv.qualification}>{cv.qualification}</p>
          </div>
        </div>
        <button
          onClick={() => onViewDetail(cv)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1.5 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
        >
          Open Details
        </button>
      </div>

      {/* Card Body (Split View) */}
      <div className="flex-grow flex flex-col md:flex-row min-h-0">
        {/* Left Side: Interactive PDF Preview */}
        <div className="w-full md:w-2/5 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col bg-gray-100">
          <div className="flex-grow overflow-hidden flex justify-center items-center relative" style={{ minHeight: '350px' }}>
            {isLoadingPreview && <div className="text-xs text-gray-500">Loading Preview...</div>}
            
            {previewError && (
              <div className="text-xs text-red-500 p-4 text-center">
                <InformationCircleIcon className="h-6 w-6 mx-auto mb-1" />
                {previewError}
              </div>
            )}
            
            {/* Hanya render Document jika URL ada DAN tidak error */}
            {pdfPreviewUrl && !previewError && !isLoadingPreview && (
              <Document
                file={pdfPreviewUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<div className="text-xs text-gray-500">Rendering...</div>}
                className="flex justify-center items-center h-full"
              >
                <Page pageNumber={pageNumber} width={250} renderAnnotationLayer={false} renderTextLayer={false} />
              </Document>
            )}
          </div>
          {numPages > 1 && !previewError && (
            <div className="flex justify-between items-center p-1.5 border-t border-gray-200 bg-white text-xs">
              <button onClick={handlePreviousPage} disabled={pageNumber <= 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"> <ChevronLeftIcon className="h-4 w-4" /> </button>
              <span>{pageNumber} / {numPages}</span>
              <button onClick={handleNextPage} disabled={pageNumber >= numPages} className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"> <ChevronRightIcon className="h-4 w-4" /> </button>
            </div>
          )}
        </div>

        {/* Right Side: Analysis Data */}
        <div className="w-full md:w-3/5 p-4 overflow-y-auto space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <label className="block text-xs font-medium text-gray-500">Similarity</label>
              <p className="text-xl font-bold text-gray-800">
                {typeof cv.similarity_score === 'number' ? cv.similarity_score.toFixed(4) : "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Recommendation</label>
              <p className={`text-sm ${RECOMMENDATION_COLOR_MAP[assessment?.final_recommendation || 'N/A']}`}>
                {assessment?.final_recommendation?.replace(/_/g, ' ') || 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Mandatory Gate</label>
              <div className="flex items-center justify-center mt-1">
                {cv.passed_hard_gate === true ? (<CheckCircleIcon className="h-5 w-5 text-green-500" />)
                  : cv.passed_hard_gate === false ? (<XCircleIcon className="h-5 w-5 text-red-500" />)
                    : (<span className="text-sm text-gray-500">-</span>)}
              </div>
            </div>
          </div>

          {assessment ? (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500">AI Assessment</label>
                <p className="text-xs text-gray-700 italic mt-1 break-words">
                  "{assessment.overall_assessment || '-'}"
                </p>
              </div>
              {renderList(assessment.key_strengths, "Key Strengths")}
              {renderList(assessment.key_weaknesses_or_gaps, "Key Weaknesses / Gaps")}
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic text-center py-4">No qualitative assessment available.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CandidateRankCard;