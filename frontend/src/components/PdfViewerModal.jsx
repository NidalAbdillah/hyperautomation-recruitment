import React, { useState, useEffect } from "react";
import { Document, Page } from "react-pdf"; // `pdfjs` tidak perlu di-import di sini
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

// Konfigurasi worker HANYA ada di main.jsx, tidak perlu di sini.

const RECOMMENDATION_COLOR_MAP = {
  "HIGHLY RECOMMENDED": "text-green-700 font-semibold",
  "CONSIDER": "text-yellow-700 font-semibold",
  "REJECT": "text-red-700 font-semibold",
  "N/A": "text-gray-500",
};

// --- KOMPONEN BARU UNTUK TAB REQUIREMENT ---
// Helper untuk me-render list requirement
function renderReqList(title, items) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return null;
  }
  return (
    <div className="mb-4">
      <h5 className="text-sm font-semibold text-gray-600 mb-1">{title}:</h5>
      <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 pl-1">
        {items.map((item, index) => (
          <li key={index} className="break-words">{item}</li>
        ))}
      </ul>
    </div>
  );
}

// Komponen utama untuk Tab Requirement
function JobRequirementsTab({ reqData }) {
  if (!reqData) {
    return <div className="text-sm text-gray-500 italic p-4 text-center">No job requirements data available for this application.</div>;
  }

  // reqData di sini adalah objek: { job_title: "...", core_skills_mandatory: [...], ... }
  // Sesuai dengan JSON 'requirement_data' dari n8n
  return (
    <div className="p-4 space-y-4">
      <h4 className="text-md font-semibold text-gray-800 border-b pb-2">
        Job Requirements ({reqData.job_title || "N/A"})
      </h4>
      {renderReqList("Core Mandatory Skills", reqData.core_skills_mandatory)}
      {renderReqList("Supporting Preferred Skills", reqData.supporting_skills_preferred)}
      {renderReqList("Experience Summary", reqData.experience_summary)}
      {renderReqList("Project Summary", reqData.project_summary)}
      {renderReqList("Other Requirements", reqData.other_requirements_flexible)}
    </div>
  );
}
// --- BATAS KOMPONEN BARU ---


function PdfViewerModal({ isOpen, onClose, pdfUrl, viewingCv }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- STATE BARU UNTUK TAB ---
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis' or 'requirements'

  const fileName = viewingCv?.cvFileName;
  const similarityScore = viewingCv?.similarity_score;
  const passedGate = viewingCv?.passed_hard_gate;
  const assessment = viewingCv?.qualitative_assessment;

  // --- Ambil 'requirement_data' dari 'viewingCv' ---
  // Backend Anda sekarang seharusnya mengirimkan ini
  const requirementsData = viewingCv?.requirement_data; 

  useEffect(() => {
    if (isOpen && pdfUrl) {
      setLoading(true);
      setError(null);
      setPageNumber(1);
      setNumPages(null);
      setActiveTab('analysis'); // Selalu reset ke tab analysis saat modal dibuka
    } else if (!isOpen) {
      setLoading(false);
      setError(null);
      setNumPages(null);
      setPageNumber(1);
    }
  }, [isOpen, pdfUrl]);

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
    setNumPages(nextNumPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (loadError) => {
    console.error("Error loading PDF:", loadError);
    if (loadError?.message?.includes("Failed to fetch")) {
      setError("Gagal mengambil file PDF. Cek koneksi atau URL.");
    } else if (loadError?.message?.includes("worker failed") || loadError?.message?.includes("pdf.worker")) {
      setError("Gagal memuat PDF viewer component. (Cek main.jsx)");
    } else if (loadError?.message?.includes("Invalid PDF structure")) {
      setError("Format PDF tidak valid atau file rusak.");
    } else {
      setError("Gagal memuat dokumen PDF.");
    }
    setLoading(false);
    setNumPages(null);
  };

  const handlePreviousPage = () => {
    setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber((prevPageNumber) => Math.min(prevPageNumber + 1, numPages || 1));
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);


  if (!isOpen) return null;

  // Helper renderList untuk AI Assessment (strengths/weaknesses)
  const renderList = (items, title) => {
    if (!items || !Array.isArray(items) || items.length === 0) return null;
    return (
      <div className="mb-4">
        <h5 className="text-sm font-semibold text-gray-600 mb-1">{title}:</h5>
        <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 pl-1">
          {items.map((item, index) => (
            <li key={index} className="break-words">{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 transition-opacity duration-300" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="pdf-modal-title">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h3 id="pdf-modal-title" className="text-lg font-semibold text-gray-800 truncate" title={fileName}>{fileName || "CV Document"}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl leading-none p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400" aria-label="Close modal">
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-grow overflow-hidden">
          {/* Left Side: PDF Viewer */}
          <div className="flex flex-col w-2/3 overflow-hidden border-r border-gray-200 bg-gray-200">
            <div className="overflow-auto p-4 flex justify-center items-start flex-grow">
              {loading && <div className="text-center text-gray-600 self-center">Loading PDF...</div>}
              {error && <div className="text-center text-red-600 self-center p-4 bg-red-50 rounded border border-red-200">{error}</div>}
              {!pdfUrl && !loading && !error && <div className="text-center text-gray-600 self-center">No PDF URL provided.</div>}
              {pdfUrl && !error && (
                <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError} loading={<div className="text-center text-gray-600">Preparing PDF...</div>}>
                  <Page pageNumber={pageNumber} width={Math.min(window.innerWidth * 0.6, 800)} />
                </Document>
              )}
            </div>
            {numPages > 0 && !loading && !error && (
              <div className="flex justify-center items-center p-2 border-t border-gray-200 bg-white flex-shrink-0">
                <button onClick={handlePreviousPage} disabled={pageNumber <= 1} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded-l disabled:opacity-50 disabled:cursor-not-allowed text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                  Previous
                </button>
                <span className="text-gray-700 text-sm px-4">
                  Page {pageNumber} of {numPages}
                </span>
                <button onClick={handleNextPage} disabled={pageNumber >= numPages} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded-r disabled:opacity-50 disabled:cursor-not-allowed text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Right Side: Analysis Result (MODIFIED WITH TABS) */}
          <div className="w-1/3 flex flex-col overflow-hidden bg-gray-50">
            
            {/* --- Tab Buttons --- */}
            <div className="flex-shrink-0 border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`w-1/2 py-3 px-1 text-center text-sm font-medium border-b-2 focus:outline-none
                    ${activeTab === 'analysis'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  AI Analysis
                </button>
                <button
                  onClick={() => setActiveTab('requirements')}
                  className={`w-1/2 py-3 px-1 text-center text-sm font-medium border-b-2 focus:outline-none
                    ${activeTab === 'requirements'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Job Requirements
                </button>
              </nav>
            </div>

            {/* --- Tab Content --- */}
            <div className="flex-grow overflow-y-auto">
              
              {/* --- TAB 1: AI ANALYSIS CONTENT --- */}
              <div className={activeTab === 'analysis' ? 'block' : 'hidden'}>
                <div className="p-4 space-y-4">
                  <h4 className="text-md font-semibold text-gray-800 border-b pb-2 flex-shrink-0">Automated Analysis Result</h4>
                  {viewingCv ? (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Similarity Score</label>
                        <p className="text-2xl font-bold text-gray-800">
                          {typeof similarityScore === 'number' ? similarityScore.toFixed(4) : "N/A"}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500">Mandatory Skill Check</label>
                        <div className="flex items-center mt-1">
                          {passedGate === true ? (
                            <>
                              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                              <span className="text-sm text-green-700 font-medium">Passed</span>
                            </>
                          ) : passedGate === false ? (
                            <>
                              <XCircleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                              <span className="text-sm text-red-700 font-medium">Failed</span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">Not Processed</span>
                          )}
                        </div>
                      </div>

                      {assessment ? (
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500">Final Recommendation</label>
                            <p className={`text-md ${RECOMMENDATION_COLOR_MAP[assessment.final_recommendation || 'N/A'] || 'text-gray-500'}`}>
                              {assessment.final_recommendation?.replace(/_/g, ' ') || 'N/A'}
                            </p>
                          </div>
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
                        <div className="text-sm text-gray-500 italic text-center py-6 bg-white rounded-lg border flex items-center justify-center">
                          No qualitative assessment available yet.
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-6 flex-grow flex items-center justify-center">
                      Loading application data...
                    </div>
                  )}
                </div>
              </div>

              {/* --- TAB 2: JOB REQUIREMENTS CONTENT --- */}
              <div className={activeTab === 'requirements' ? 'block' : 'hidden'}>
                {/* Kita passing data requirement ke komponen baru */}
                {/* Pastikan backend Anda mengirim 'requirement_data' di dalam objek 'viewingCv' */}
                <JobRequirementsTab reqData={requirementsData} />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PdfViewerModal;