import React, { useState, useLayoutEffect, useEffect } from "react";
import { useLocation } from "react-router-dom";
import NavBar from "../components/Navbar/NavBar";
import Footer from "../components/Footer";
import { useDocTitle } from "../components/CustomHook";
import axios from "axios";
import Notiflix from "notiflix";

// IMPORT GAMBAR UNTUK IKON UPLOAD KECIL DI SINI
import uploadPngIcon from "../images/icons/upload-icon.png";

// IMPORT GAMBAR BACKGROUND UNTUK KOLOM KIRI
import telkomBg from "../images/telkom-bg.png";

// IMPORT HEROICONS BARU UNTUK AKSI UPLOAD
import { XCircleIcon, ArrowPathIcon, DocumentIcon } from "@heroicons/react/24/outline";

// --- URL API Backend ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_PUBLIC_OPEN_POSITIONS = `${API_BASE_URL}/api/public/job-positions`;
const API_SUBMIT_APPLICATION = `${API_BASE_URL}/api/applications`;
// --- End URL API ---

const ApplyCv = () => {
  useDocTitle("PT Tech XYZ | Apply Job");

  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  // State untuk field form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [cvFile, setCvFile] = useState(null);

  // State untuk menyimpan daftar posisi yang diambil dari API
  const [openPositions, setOpenPositions] = useState([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [errorLoadingPositions, setErrorLoadingPositions] = useState(null);

  // State untuk pilihan posisi (GUNAKAN ID, BUKAN NAMA)
  const [selectedPositionId, setSelectedPositionId] = useState("");

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});

  // Effect hook untuk mengambil daftar posisi 'Open' dari API
  useEffect(() => {
    const fetchOpenPositions = async () => {
      setLoadingPositions(true);
      setErrorLoadingPositions(null);
      try {
        const response = await axios.get(API_PUBLIC_OPEN_POSITIONS);
        setOpenPositions(response.data);
      } catch (err) {
        setErrorLoadingPositions(err);
        Notiflix.Report.failure("Gagal Memuat Posisi", err.response?.data?.message || "Terjadi kesalahan saat memuat daftar lowongan kerja.", "Okay");
      } finally {
        setLoadingPositions(false);
      }
    };

    fetchOpenPositions();
  }, []);

  // Effect untuk membaca posisi dari URL
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const positionFromUrl = searchParams.get("posisi");

    if (positionFromUrl && openPositions.length > 0) {
      // Cari posisi berdasarkan nama dari URL
      const matchedPosition = openPositions.find(
        pos => pos.name.toLowerCase() === decodeURIComponent(positionFromUrl).toLowerCase()
      );
      
      if (matchedPosition) {
        setSelectedPositionId(matchedPosition.id.toString());
      }
    }
  }, [location.search, openPositions]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      const maxFileSize = 10 * 1024 * 1024;

      if (!allowedTypes.includes(selectedFile.type)) {
        setCvFile(null);
        e.target.value = null;
        const fileTypeError = "Hanya file PDF, DOC, atau DOCX yang diizinkan.";
        setErrors((prevErrors) => ({ ...prevErrors, cv_file: fileTypeError }));
        Notiflix.Report.warning("Tipe File Tidak Valid", fileTypeError, "Okay");
        return;
      }

      if (selectedFile.size > maxFileSize) {
        setCvFile(null);
        e.target.value = null;
        const fileSizeError = `Ukuran file melebihi batas maksimum ${maxFileSize / (1024 * 1024)}MB.`;
        setErrors((prevErrors) => ({ ...prevErrors, cv_file: fileSizeError }));
        Notiflix.Report.warning("Ukuran File Terlalu Besar", fileSizeError, "Okay");
        return;
      }

      setCvFile(selectedFile);
      setErrors((prevErrors) => ({
        ...prevErrors,
        cv_file: undefined,
      }));
    } else {
      setCvFile(null);
      setErrors((prevErrors) => ({
        ...prevErrors,
        cv_file: undefined,
      }));
    }
  };

  const handleRemoveCv = () => {
    setCvFile(null);
    const fileInput = document.getElementById("cv_upload_input");
    if (fileInput) fileInput.value = "";
    setErrors((prevErrors) => ({
      ...prevErrors,
      cv_file: "CV wajib diupload.",
    }));
  };

  const clearErrors = (fieldName) => {
    setErrors((prevErrors) => ({ ...prevErrors, [fieldName]: undefined }));
  };

  const clearInput = () => {
    setFullName("");
    setEmail("");
    setCvFile(null);
    setSelectedPositionId(""); // ✅ FIXED: Gunakan setSelectedPositionId
    setAgreeTerms(false);
    setErrors({});
    const fileInput = document.getElementById("cv_upload_input");
    if (fileInput) fileInput.value = "";
  };

  function handleSubmit(e) {
    e.preventDefault();
    document.getElementById("submitBtn").disabled = true;
    document.getElementById("submitBtn").innerHTML = "Mengirim...";

    const newErrors = {};
    if (!fullName) newErrors.fullName = "Nama Lengkap wajib diisi.";
    if (!email) newErrors.email = "Email wajib diisi.";
    if (!cvFile) newErrors.cv_file = "CV wajib diupload.";
    if (!selectedPositionId) newErrors.selectedPosition = "Posisi Tersedia wajib dipilih."; // ✅ FIXED
    if (!agreeTerms) newErrors.agreeTerms = "Anda harus menyetujui Syarat dan Ketentuan.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      document.getElementById("submitBtn").disabled = false;
      document.getElementById("submitBtn").innerHTML = "Kirim Lamaran";
      Notiflix.Report.warning("Validasi", "Mohon lengkapi semua field yang wajib diisi.", "Okay");
      return;
    }

    // ✅ FIXED: Gunakan state variables yang benar
    let fData = new FormData();
    fData.append("fullName", fullName);
    fData.append("email", email);
    fData.append("cv_file", cvFile);
    fData.append("appliedPositionId", selectedPositionId); // ✅ FIXED: Kirim ID, bukan nama
    fData.append("agreeTerms", agreeTerms);

    // Debug log
    console.log("=== FORM DATA DEBUG ===");
    console.log("fullName:", fullName);
    console.log("email:", email);
    console.log("appliedPositionId:", selectedPositionId);
    console.log("agreeTerms:", agreeTerms);

    axios({
      method: "post",
      url: API_SUBMIT_APPLICATION,
      data: fData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then(function (response) {
        document.getElementById("submitBtn").disabled = false;
        document.getElementById("submitBtn").innerHTML = "Kirim Lamaran";
        clearInput();
        Notiflix.Report.success("Berhasil", response.data.message || "Lamaran kerja Anda berhasil dikirim. Tim kami akan segera meninjau.", "Okay");
      })
      .catch(function (error) {
        document.getElementById("submitBtn").disabled = false;
        document.getElementById("submitBtn").innerHTML = "Kirim Lamaran";
        const { response } = error;

        if (response && response.data) {
          if (response.data.errors) {
            const backendErrors = {};
            for (const field in response.data.errors) {
              const frontendField =
                {
                  full_name: "fullName",
                  cv_file: "cv_file",
                  appliedPositionId: "selectedPosition", // ✅ FIXED
                  agree_terms: "agreeTerms",
                }[field] || field;

              backendErrors[frontendField] = Array.isArray(response.data.errors[field]) ? response.data.errors[field][0] : response.data.errors[field];
            }
            setErrors(backendErrors);
          }
          Notiflix.Report.failure("Gagal Mengirim Lamaran", response.data.message || "Terjadi kesalahan saat memproses lamaran.", "Okay");
        } else {
          Notiflix.Report.failure("Terjadi Kesalahan", "Terjadi kesalahan jaringan atau server. Silakan coba lagi nanti.", "Okay");
        }
      });
  }

  return (
    <>
      <NavBar />
      <div id="apply-job" className="flex justify-center items-center w-full mt-8 lg:py-6 min-h-screen pt-16">
        <div className="container mx-auto my-3 px-4 lg:px-0 flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden bg-white max-w-3xl gap-6">
          <div
            className="w-full md:w-2/5 bg-blue-900 p-6 md:p-8 flex flex-col justify-end relative overflow-hidden"
            style={{
              backgroundImage: `url(${telkomBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="text-white z-10 mb-6">
              <h2 className="font-bold text-xl md:text-2xl mb-2">Career Opportunity</h2>
              <p className="text-sm md:text-base">Join PT Tech XYZ and grow your career with us.</p>
            </div>
          </div>
          <div className="w-full md:w-3/5 p-6 md:px-12 lg:px-16 py-6">
            <div className="flex flex-col mb-4">
              <h1 className="font-bold text-gray-800 uppercase text-2xl md:text-3xl mb-1">Job Application PT Tech XYZ</h1>
              <p className="text-gray-600 text-md">Complete your profile to apply</p>
            </div>
            <form onSubmit={handleSubmit} id="jobApplicationForm">
              <div className="mb-3">
                <label htmlFor="fullName" className="block text-gray-700 text-sm font-semibold mb-1">
                  Full Name*
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  className="w-full bg-gray-100 text-gray-900 p-2 rounded-lg focus:outline-none focus:shadow-outline text-sm"
                  type="text"
                  placeholder="Full Name*"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onKeyUp={() => clearErrors("fullName")}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-1">
                  Email*
                </label>
                <input
                  id="email"
                  name="email"
                  className="w-full bg-gray-100 text-gray-900 p-2 rounded-lg focus:outline-none focus:shadow-outline text-sm"
                  type="email"
                  placeholder="Email*"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyUp={() => clearErrors("email")}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-semibold mb-1">Upload CV*</label>
                <div
                  className={`w-full bg-gray-100 text-gray-900 p-4 rounded-lg border-2 border-dashed ${
                    errors.cv_file ? "border-red-500" : "border-gray-300"
                  } hover:border-gray-400 relative min-h-[100px] flex flex-col items-center justify-center`}
                >
                  <input id="cv_upload_input" name="cv_file" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />

                  {cvFile ? (
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex items-center w-full mb-2">
                        <div className="flex-shrink-0 mr-2">
                          <div className="bg-gray-200 p-1 rounded-md">
                            <DocumentIcon className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate w-full" title={cvFile.name}>
                            {cvFile.name}
                          </p>
                          <p className="text-xs text-gray-500">{(cvFile.size / 1024).toFixed(0)} KB</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 w-full justify-end text-gray-500 text-xs">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCv();
                          }}
                          className="flex items-center text-gray-500 hover:text-red-500 focus:outline-none"
                          title="Hapus File"
                        >
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          Remove
                        </button>
                        <label htmlFor="cv_upload_input" className="flex items-center cursor-pointer text-gray-500 hover:text-blue-700 underline focus:outline-none" tabIndex="0">
                          <ArrowPathIcon className="h-4 w-4 mr-1" /> Change
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <img src={uploadPngIcon} alt="Upload Icon" className="w-8 h-8 mb-1" />
                      <p className="text-sm text-gray-600 text-center">Upload a file or drag and drop</p>
                      <p className="text-xs text-gray-500 text-center">PDF, DOC, DOCX up to 10MB</p>
                    </div>
                  )}
                </div>
                {errors.cv_file && <p className="text-red-500 text-xs mt-1">{errors.cv_file}</p>}
              </div>

              <div className="mb-3">
                <label htmlFor="selectedPosition" className="block text-gray-700 text-sm font-semibold mb-1">
                  Posisi Tersedia*
                </label>
                {loadingPositions ? (
                  <div className="w-full bg-gray-100 text-gray-900 p-2 rounded-lg text-sm text-gray-500">Loading positions...</div>
                ) : errorLoadingPositions ? (
                  <div className="w-full bg-gray-100 text-gray-900 p-2 rounded-lg text-sm text-red-500">Error loading positions.</div>
                ) : (
                  <select
                    id="selectedPosition"
                    name="appliedPositionId"
                    className="w-full bg-gray-100 text-gray-900 p-2 rounded-lg focus:outline-none focus:shadow-outline appearance-none text-sm"
                    value={selectedPositionId}
                    onChange={(e) => setSelectedPositionId(e.target.value)}
                    onBlur={() => clearErrors("selectedPosition")}
                  >
                    <option value="">Pilih Posisi yang Dilamar</option>
                    {openPositions.map((position) => (
                      <option key={position.id} value={position.id}>
                        {position.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.selectedPosition && <p className="text-red-500 text-xs mt-1">{errors.selectedPosition}</p>}
              </div>

              <div className="mb-3 flex items-center">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-red-700 rounded focus:ring-red-700"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    clearErrors("agreeTerms");
                  }}
                />
                <label htmlFor="agreeTerms" className="ml-2 text-gray-700 text-sm">
                  I agree to the{" "}
                  <a href="#" className="text-red-700 hover:underline">
                    Terms and Conditions
                  </a>
                </label>
              </div>
              {errors.agreeTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeTerms}</p>}

              <div className="mt-5">
                <button
                  type="submit"
                  id="submitBtn"
                  className="uppercase text-md font-bold tracking-wide bg-blue-900 hover:bg-blue-600 text-white p-3 rounded-lg w-full focus:outline-none focus:shadow-outline transition ease-in-out duration-300"
                  disabled={loadingPositions}
                >
                  {loadingPositions ? "Loading Positions..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ApplyCv;