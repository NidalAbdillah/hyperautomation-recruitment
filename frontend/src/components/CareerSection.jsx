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
       <div className="w-full text-center mb-6 py-12">
        <h2 className="text-3xl font-bold text-blue-900" data-aos="fade-down">
          Peluang Karir di PT Tech XYZ
        </h2>
        <p className="mt-2 text-lg text-gray-600" data-aos="fade-down" data-aos-delay="100">
          Temukan tantangan berikutnya dan berkembang bersama tim inovatif kami.
        </p>
      </div>

      {loading && <div className="w-full text-center p-8 text-gray-600 mb-12">Memuat lowongan pekerjaan...</div>}
      {error && <div className="w-full text-center p-8 text-red-600 mb-12">Gagal memuat lowongan pekerjaan. Silakan coba lagi nanti.</div>}

      {!loading && !error && (
        jobOpenings.length > 0 ? (
          <div className="w-full flex flex-wrap justify-center gap-6 mb-12">
            {jobOpenings.map((job, index) => {
              const snippet = getRequirementSnippet(job.specificRequirements);

              return (
              <div
                key={job.id}
                className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.33%-1rem)] xl:w-[calc(25%-1.125rem)]
                           bg-white rounded-lg shadow-md p-5 flex flex-col border border-gray-200"
                data-aos="fade-up"
                data-aos-delay={100 + index * 50}
              >
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2 h-14">
                     {job.name}
                   </h3>
                  <div className="text-sm text-gray-600 space-y-1.5 mb-4">
                    <p><strong>Lokasi:</strong> {job.location}</p>
                    <p><strong>Pendaftaran Dibuka:</strong> {formatDisplayDate(job.registrationStartDate)} - {formatDisplayDate(job.registrationEndDate)}</p>
                    <p><strong>Slot:</strong> {job.availableSlots ? `${job.availableSlots} Tersedia` : 'N/A'}</p>
                  </div>
                  {snippet && (
                    <div className="text-sm text-gray-500 mb-5">
                      <p className="line-clamp-3">
                        {snippet}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-4 flex flex-col space-y-2 flex-shrink-0">
                  <Link
                    to={`/applycv?posisi=${encodeURIComponent(job.name)}`}
                    className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
                    Lamar Sekarang
                  </Link>
                  <button
                    onClick={() => handleViewDetails(job)}
                    className="inline-flex items-center justify-center w-full px-4 py-2 border border-blue-900 text-sm font-medium rounded-md shadow-sm text-blue-900 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
                  >
                     <EyeIcon className="h-4 w-4 mr-2" />
                     Lihat Detail
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full text-center p-8 bg-white rounded-lg shadow-md text-gray-600 mb-12">Saat ini belum ada posisi yang tersedia. Silakan cek kembali nanti!</div>
        )
      )}

       <div className="w-full border-t border-gray-200 pt-8 mt-8 text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">Mengapa Bergabung dengan PT Tech XYZ?</h3>
        <p className="text-md text-gray-600 max-w-3xl mx-auto">
          Di PT Tech XYZ, kami menumbuhkan budaya inovasi dan pembelajaran berkelanjutan.
          Anda akan mengerjakan proyek menantang menggunakan teknologi terkini, berkolaborasi dengan tim profesional,
          dan berkontribusi langsung pada solusi yang berdampak nyata.
          Bergabunglah dengan kami untuk mempercepat pertumbuhan karir Anda dalam lingkungan yang dinamis dan suportif.
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