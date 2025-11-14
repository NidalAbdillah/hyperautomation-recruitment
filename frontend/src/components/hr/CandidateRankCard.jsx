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
  ClockIcon,
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

const STATUS_DISPLAY_MAP = {
  "SUBMITTED":    { label: "Submitted", color: "bg-gray-100 text-gray-700 border border-gray-300" },
  "REVIEWED":     { label: "Reviewed (AI)", color: "bg-blue-50 text-blue-700 border border-blue-200" },
  "STAFF_APPROVED": { label: "Approved (Staff)", color: "bg-cyan-50 text-cyan-700 border border-cyan-200" },
  "STAFF_REJECTED": { label: "Rejected (Staff)", color: "bg-red-50 text-red-700 border border-red-200" },
  "INTERVIEW_QUEUED":    { label: "In Queue (Manager)", color: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
  "INTERVIEW_SCHEDULED": { label: "Scheduled (Manager)", color: "bg-purple-50 text-purple-700 border border-purple-200" },
  "PENDING_FINAL_DECISION": { label: "Final Review (HR)", color: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  "HIRED":      { label: "Hired", color: "bg-green-50 text-green-700 border border-green-200" },
  "NOT_HIRED":  { label: "Not Hired", color: "bg-red-50 text-red-700 border border-red-200" },
  "ONBOARDING": { label: "Onboarding", color: "bg-green-50 text-green-700 border border-green-200" },
};
const defaultStatusDisplay = { label: "N/A", color: "bg-gray-50 text-gray-600 border border-gray-200" };

function CandidateRankCard({
  cv,
  rank,
  onViewDetail,
  userRole,
  onSelectForInterview,
  onClearInterviewChoice,
}) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState(null);

  const assessment = cv.qualitative_assessment;

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
      <div className="space-y-1.5">
        <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{title}</h5>
        <ul className="space-y-1 pl-0">
          {items.map((item, index) => (
            <li key={index} className="text-xs text-gray-700 leading-relaxed flex items-start">
              <span className="text-gray-400 mr-2 mt-0.5">•</span>
              <span className="flex-1">{item}</span>
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

  const isActionableStatus = [
    "STAFF_APPROVED",
    "INTERVIEW_QUEUED",
    "INTERVIEW_SCHEDULED",
    "PENDING_FINAL_DECISION",
  ].includes(cv.status);

  const isWaitingHR = cv.status === "REVIEWED";
  
  const isFinalStatus = [
    "STAFF_REJECTED", 
    "HIRED", 
    "NOT_HIRED", 
    "ONBOARDING"
  ].includes(cv.status);

  const managerPreference = cv.interview_notes?.preference;
  
  const showManagerActions = userRole === "manager" && !isFinalStatus;

  const choiceButtonColor = managerPreference
    ? "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500"
    : "bg-green-600 hover:bg-green-700 focus:ring-green-500";

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:border-gray-300">
      {/* Header Card */}
      <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Rank & Name */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <TrophyIcon
              className={`h-7 w-7 flex-shrink-0 ${RANK_COLOR_MAP[rank] || "text-gray-400"}`}
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 text-base truncate" title={cv.fullName}>
                <span className="text-gray-400 font-normal mr-1.5">#{rank}</span>
                {cv.fullName}
              </h3>
              <p className="text-xs text-gray-600 truncate mt-0.5" title={cv.qualification}>
                {cv.qualification}
              </p>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Details Button (Always visible) */}
            <button
              onClick={handleViewDetails}
              title="Open Full Details"
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-medium py-2 px-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-all whitespace-nowrap"
            >
              <DocumentTextIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Details</span>
            </button>

            {/* Manager Actions */}
            {showManagerActions && isActionableStatus && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSelectClick}
                  title={managerPreference ? `Change Choice (Current: ${managerPreference})` : "Select Interview Type"}
                  className={`inline-flex items-center gap-1.5 text-white text-xs font-medium py-2 px-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all whitespace-nowrap ${choiceButtonColor}`}
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  <span className="hidden md:inline">{managerPreference ? "Change" : "Choice"}</span>
                </button>

                {managerPreference && (
                  <button
                    onClick={handleClearClick}
                    title="Clear Selection (Undo)"
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 active:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 transition-all"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-grow flex flex-col lg:flex-row min-h-0">
        {/* PDF Preview Section */}
        <div className="w-full lg:w-2/5 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col bg-gray-50">
          <div
            className="flex-grow overflow-hidden flex justify-center items-center relative"
            style={{ minHeight: "380px" }}
          >
            {isLoadingPreview && (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="text-xs text-gray-500">Loading Preview...</p>
              </div>
            )}
            {previewError && (
              <div className="text-center p-6 max-w-xs">
                <InformationCircleIcon className="h-12 w-12 mx-auto mb-3 text-red-400" />
                <p className="text-sm text-red-600 font-medium">{previewError}</p>
              </div>
            )}
            {pdfPreviewUrl && !previewError && !isLoadingPreview && (
              <Document
                file={pdfPreviewUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<div className="text-xs text-gray-500">Rendering PDF...</div>}
                className="flex justify-center items-center h-full"
              >
                <Page
                  pageNumber={pageNumber}
                  width={280}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  className="shadow-lg"
                />
              </Document>
            )}
          </div>
          {numPages > 1 && !previewError && (
            <div className="flex justify-between items-center px-4 py-2.5 border-t border-gray-200 bg-white">
              <button
                onClick={handlePreviousPage}
                disabled={pageNumber <= 1}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
              </button>
              <span className="text-xs font-medium text-gray-600">
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={pageNumber >= numPages}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>

        {/* Analysis Panel */}
        <div className="w-full lg:w-3/5 p-5 overflow-y-auto space-y-5">
          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Similarity
              </label>
              <p className="text-2xl font-bold text-gray-900">
                {typeof cv.similarity_score === "number"
                  ? cv.similarity_score.toFixed(4)
                  : "N/A"}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Recommendation
              </label>
              <p className={`text-sm font-bold ${RECOMMENDATION_COLOR_MAP[assessment?.final_recommendation || "N/A"]}`}>
                {assessment?.final_recommendation?.replace(/_/g, " ") || "N/A"}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Mandatory Gate
              </label>
              <div className="flex items-center justify-center mt-0.5">
                {cv.passed_hard_gate === true ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                ) : cv.passed_hard_gate === false ? (
                  <XCircleIcon className="h-6 w-6 text-red-600" />
                ) : (
                  <span className="text-sm text-gray-400 font-medium">—</span>
                )}
              </div>
            </div>
          </div>

          {/* Status Block */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Application Status
              </label>
              {(() => {
                const statusInfo = STATUS_DISPLAY_MAP[cv.status] || defaultStatusDisplay;
                return (
                  <span className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                );
              })()}
            </div>
            
            {isWaitingHR && userRole === 'manager' && (
              <div className="pt-2 border-t border-gray-200">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Manager Action
                </label>
                <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  Waiting for Staff HR Review
                </p>
              </div>
            )}
            
            {managerPreference && (
              <div className="pt-2 border-t border-gray-200">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Manager Request to HR
                </label>
                <p className="text-sm font-semibold text-gray-900 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-lg">
                  {managerPreference}
                </p>
              </div>
            )}
          </div>

          {/* AI Assessment Block */}
          {assessment ? (
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  AI Assessment
                </label>
                <p className="text-sm text-gray-700 leading-relaxed italic bg-gray-50 p-3 rounded-lg border border-gray-200">
                  "{assessment.overall_assessment || "—"}"
                </p>
              </div>
              {renderList(assessment.key_strengths, "Key Strengths")}
              {renderList(assessment.key_weaknesses_or_gaps, "Key Weaknesses / Gaps")}
            </div>
          ) : (
            <div className="text-center py-8">
              <InformationCircleIcon className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="text-xs text-gray-500 italic">No qualitative assessment available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CandidateRankCard;