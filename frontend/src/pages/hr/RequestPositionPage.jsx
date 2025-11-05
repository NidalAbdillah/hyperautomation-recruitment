// src/pages/hr/RequestPositionPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Notiflix from 'notiflix';
import RequestForm from '../../components/hr/RequestForm'; 
import RequestStatusTable from '../../components/hr/RequestStatusTable';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_GET_POSITIONS_URL = `${API_BASE_URL}/api/hr/job-positions`;
const API_CREATE_POSITION_URL = `${API_BASE_URL}/api/hr/job-positions`;

// "Tiru Gaya" ManageUsersPage.jsx
const getAuthToken = () => {
  return localStorage.getItem("token");
};

function RequestPositionPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching job positions for Manager...");
      
      // "Tiru Gaya" ManageUsersPage.jsx (Manual Token)
      const token = getAuthToken();
      if (!token) {
        const authError = new Error("User not authenticated. Token missing.");
        authError.response = { status: 401, data: { message: "Silakan login kembali." } };
        throw authError;
      }

      const response = await axios.get(API_GET_POSITIONS_URL, {
        headers: { Authorization: `Bearer ${token}` }, 
      });
      
      // Di arsitektur "anti-challenge", backend akan (seharusnya)
      // sudah memfilter ini HANYA untuk 'requestedById' milik user ini.
      setRequests(response.data);
      
    } catch (err) {
      console.error("Error fetching job positions:", err);
      const errMsg = err.response?.data?.message || "Gagal memuat data permintaan.";
      setError(errMsg);
      
      if (err.response?.status === 401) {
         Notiflix.Report.warning("Sesi Habis", "Token Anda tidak valid atau kedaluwarsa. Silakan login kembali.", "Okay");
      } else {
         Notiflix.Report.failure("Error", errMsg, "Okay");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // useEffect (Sudah benar)
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  /**
   * Handler untuk submit form dari komponen RequestForm.
   * Ini adalah implementasi use case 'Request New Position'.
   */
  const handleCreateRequest = async (formData, callback) => {
    try {
      Notiflix.Loading.standard("Mengirim permintaan...");
      
      const dataToSubmit = {
        ...formData,
        status: "Draft", // <- "Anti-Challenge": Manager HANYA bisa buat "Draft"
      };

      // "Tiru Gaya" ManageUsersPage.jsx (Manual Token)
      const token = getAuthToken();
      if (!token) {
        const authError = new Error("User not authenticated. Token missing.");
        authError.response = { status: 401, data: { message: "Silakan login kembali." } };
        throw authError;
      }

      await axios.post(API_CREATE_POSITION_URL, dataToSubmit, {
        headers: { Authorization: `Bearer ${token}` }, // <-- Tambahkan header
      });

      Notiflix.Loading.remove();
      Notiflix.Report.success(
        "Permintaan Terkirim",
        `Permintaan untuk posisi "${formData.name}" telah berhasil dikirim ke Head HR untuk persetujuan (status 'Draft').`,
        "Okay"
      );
      
      fetchRequests(); // Muat ulang data tabel
      callback(true); // Tutup modal

    } catch (error) {
      Notiflix.Loading.remove();
      console.error("Error creating position request:", error);
      // Tangani error 401
      if (error.response && error.response.status === 401) {
          Notiflix.Report.warning("Sesi Habis", "Sesi Anda telah berakhir. Silakan login kembali.", "Okay");
      } else {
          Notiflix.Report.failure("Gagal Mengirim", error.response?.data?.message || "Terjadi kesalahan.", "Okay");
      }
      callback(false); // Jangan tutup modal
    }
  };

  // Tampilan Loading
  if (isLoading && requests.length === 0) {
     return <div className="text-center p-8 text-gray-600">Memuat data permintaan...</div>;
  }

  return (
    <div className="request-position-page-container p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Permintaan Lowongan (Request Position)</h2>

      {/* 1. Form (Tombol + Modal) */}
      <RequestForm onSubmitRequest={handleCreateRequest} />

      <div className="my-8 border-t border-gray-200"></div>

      {/* 2. Tabel Status */}
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Status Permintaan Anda</h3>
      <p className="text-sm text-gray-600 mb-4">
        Lacak status permintaan lowongan yang telah Anda ajukan. Status akan berubah dari "Draft" (Menunggu Persetujuan HR) 
        menjadi "Approved" (Disetujui), "Open" (Dipublikasikan oleh Staff HR), atau "Rejected" (Ditolak).
      </p>
      
      <RequestStatusTable
        data={requests}
        isLoading={isLoading} // Kirim status loading untuk refresh
        error={error}
      />
    </div>
  );
}

export default RequestPositionPage;