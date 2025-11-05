// src/components/CareerSection.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { EyeIcon, ChevronRightIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import "dayjs/locale/id";
import JobDetailModal from "./JobDetailModal";

dayjs.locale("id");

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_PUBLIC_POSITIONS_URL = `${API_BASE_URL}/api/public/job-positions`;

// ... (getRequirementSnippet dan formatDisplayDate tetap sama) ...
const getRequirementSnippet = (htmlString, maxLength = 100) => {
  if (!htmlString || typeof htmlString !== 'string') return null;
  const plainText = htmlString.replace(/<[^>]*>/g, ' ');
  const cleanedText = plainText.replace(/\s+/g, ' ').trim();
  if (cleanedText.length <= maxLength) return cleanedText;
  const truncatedText = cleanedText.substring(0, maxLength);
  const lastSpaceIndex = truncatedText.lastIndexOf(' ');
  return truncatedText.substring(0, lastSpaceIndex > 0 ? lastSpaceIndex : maxLength) + "...";
};

const formatDisplayDate = (isoString) => {
    if (!isoString) return "-";
    try {
      return dayjs(isoString).format("D MMM YYYY");
    } catch (e) {
      console.error("Error formatting date:", isoString, e);
      return "Invalid Date";
    }
  };


const CareerSection = () => {
  const [jobOpenings, setJobOpenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  useEffect(() => {
    // ... (fetchJobOpenings tetap sama) ...
     const fetchJobOpenings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(API_PUBLIC_POSITIONS_URL);
        setJobOpenings(response.data);
      } catch (err) {
        setError(err);
        console.error("Error fetching job openings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobOpenings();
  }, []);


  return (
    <div className="min-h-screen flex flex-col items-center justify-center max-w-6xl mx-auto p-4 md:p-12" id="career">
      {/* ... (Judul tetap sama) ... */}
       <div className="w-full text-center mb-6 py-12">
        <h2 className="text-3xl font-bold text-red-700" data-aos="fade-down">
          Career Opportunities at XYZ Tech
        </h2>
        <p className="mt-2 text-lg text-gray-600" data-aos="fade-down" data-aos-delay="100">
          Find your next challenge and grow with our innovative team.
        </p>
      </div>

      {loading && <div className="w-full text-center p-8 text-gray-600 mb-12">Loading job openings...</div>}
      {error && <div className="w-full text-center p-8 text-red-600 mb-12">Failed to load job openings. Please try again later.</div>}

      {!loading && !error && (
        jobOpenings.length > 0 ? (
          // --- KEMBALI GUNAKAN FLEXBOX DENGAN JUSTIFY-CENTER ---
          <div className="w-full flex flex-wrap justify-center gap-6 mb-12">
            {jobOpenings.map((job, index) => {
              const snippet = getRequirementSnippet(job.specificRequirements);

              return (
              // --- KARTU DENGAN LEBAR YANG DIATUR DAN FLEX INTERNAL ---
              // Hapus h-full dari sini
              <div
                key={job.id}
                className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.33%-1rem)] xl:w-[calc(25%-1.125rem)]
                           bg-white rounded-lg shadow-md p-5 flex flex-col border border-gray-200" // Hapus h-full
                data-aos="fade-up"
                data-aos-delay={100 + index * 50}
              >
                {/* Bagian Konten Atas (Judul, Info, Snippet) */}
                <div className="flex-grow"> {/* Biarkan bagian ini tumbuh */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2 h-14">
                     {job.name}
                   </h3>
                  <div className="text-sm text-gray-600 space-y-1.5 mb-4">
                    <p><strong>Lokasi:</strong> {job.location}</p>
                    <p><strong>Pendaftaran Dibuka:</strong> {formatDisplayDate(job.registrationStartDate)} - {formatDisplayDate(job.registrationEndDate)}</p>
                    <p><strong>Slot:</strong> {job.availableSlots ? `${job.availableSlots} Available` : 'N/A'}</p>
                  </div>
                  {snippet && (
                    <div className="text-sm text-gray-500 mb-5 "> {/* Hapus flex-grow dari sini */}
                      <p className="line-clamp-3">
                        {snippet}
                      </p>
                    </div>
                  )}
                  {/* Fallback jika tidak ada snippet, TIDAK PERLU DIV KOSONG lagi */}
                </div>

                {/* Tombol (mt-auto akan mendorongnya ke bawah relatif terhadap parent flex-col) */}
                <div className="mt-auto pt-4 flex flex-col space-y-2 flex-shrink-0"> {/* Tambah flex-shrink-0 */}
                  <Link
                    to={`/applycv?posisi=${encodeURIComponent(job.name)}`}
                    className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
                    Apply Now
                  </Link>
                  <button
                    onClick={() => handleViewDetails(job)}
                    className="inline-flex items-center justify-center w-full px-4 py-2 border border-red-600 text-sm font-medium rounded-md shadow-sm text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                     <EyeIcon className="h-4 w-4 mr-2" />
                     Lihat Detail
                  </button>
                </div>
              </div>
              // --- BATAS KARTU ---
              );
            })}
          </div>
          // --- BATAS FLEXBOX CONTAINER ---
        ) : (
          <div className="w-full text-center p-8 bg-white rounded-lg shadow-md text-gray-600 mb-12">Currently, there are no open positions available. Please check back later!</div>
        )
      )}

      {/* ... (Why Work at XYZ Tech?) ... */}
       <div className="w-full border-t border-gray-200 pt-8 mt-8 text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">Why Work at XYZ Tech?</h3>
        <p className="text-md text-gray-600 max-w-3xl mx-auto">
          At XYZ Tech, we foster a culture of innovation and continuous learning.
          You'll work on challenging projects using cutting-edge technologies, collaborate with talented engineers,
          and contribute directly to solutions that impact millions.
          Join us to accelerate your career growth in a dynamic and supportive environment.
        </p>
      </div>

      {/* Render Modal */}
      <JobDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        jobData={selectedJob}
      />
    </div>
  );
};

export default CareerSection;