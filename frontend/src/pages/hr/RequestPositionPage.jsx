// src/pages/hr/RequestPositionPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import RequestForm from "../../components/hr/RequestForm"; //
import RequestHistoryTable from "../../components/hr/RequestHistoryTable"; // <-- Impor tabel baru
import Notiflix from "notiflix";

// --- (Definisi URL API & Token Helper) ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ADMIN_POSITIONS_URL = `${API_BASE_URL}/api/hr/job-positions`;
const getAuthToken = () => {
  return localStorage.getItem("token");
};

function RequestPositionPage() {
  const { user } = useAuth(); // <-- Ambil user yang login
  const [myPositions, setMyPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. Fungsi untuk mengambil data ---
  const fetchMyPositions = useCallback(async () => {
    if (!user) return; // Tunggu sampai info user tersedia

    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Token tidak ditemukan");

      const response = await axios.get(API_ADMIN_POSITIONS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // --- 2. FILTER PENTING (Hanya tampilkan milik Manajer) ---
      const allUserPositions = response.data.filter(
        (pos) => pos.requestor && pos.requestor.id === user.id
      );

      setMyPositions(
        allUserPositions.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
      setError(null);
    } catch (err) {
      setError(err.message || "Gagal mengambil data riwayat.");
      Notiflix.Report.failure(
        "Error",
        err.message || "Gagal mengambil data riwayat.",
        "Okay"
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]); // Dependensi pada 'user'

  // --- 3. Ambil data saat halaman dimuat ---
  useEffect(() => {
    fetchMyPositions();
  }, [fetchMyPositions]);

  // --- 4. Logika untuk memecah data jadi 2 tabel ---
  const { inProgressPositions, completedPositions } = useMemo(() => {
    const inProgress = myPositions.filter((pos) =>
      ["Draft", "Approved", "Open"].includes(pos.status)
    );
    const completed = myPositions.filter((pos) =>
      ["Closed", "Rejected"].includes(pos.status)
    );
    return { inProgressPositions: inProgress, completedPositions: completed };
  }, [myPositions]);

  // --- 5. Handler untuk submit modal RequestForm ---
  const handleRequestSubmitted = async (formData, callback) => {
    Notiflix.Loading.standard("Mengirim Permintaan...");
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Token tidak ditemukan");

      // Panggil endpoint POST dari jobPosition.controller.ts
      await axios.post(
        API_ADMIN_POSITIONS_URL,
        formData, // formData sudah berisi (name, location, dll)
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Notiflix.Loading.remove();
      Notiflix.Report.success(
        "Berhasil",
        "Permintaan lowongan (Draft) berhasil dikirim.",
        "Okay"
      );

      fetchMyPositions(); // <-- REFRESH tabel setelah sukses
      callback(true); // Memberitahu modal RequestForm untuk menutup
    } catch (err) {
      Notiflix.Loading.remove();
      Notiflix.Report.failure(
        "Gagal",
        err.response?.data?.message || "Terjadi kesalahan.",
        "Okay"
      );
      callback(false); // Gagal, modal jangan ditutup
    }
  };

  return (
    <div className="request-position-page-container p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Request New Position
      </h2>

      {/* --- Tombol Pemicu Modal --- */}
      <div className="mb-6">
        <RequestForm onSubmitRequest={handleRequestSubmitted} />
      </div>

      {/* --- Tabel 1: Sedang Progress --- */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Permintaan Sedang Progress
        </h3>
        {isLoading && <p className="text-center text-gray-500">Memuat...</p>}
        {!isLoading && !error && (
          <RequestHistoryTable data={inProgressPositions} />
        )}
        {!isLoading && error && (
          <p className="text-center text-red-500">{error}</p>
        )}
      </div>

      {/* --- Tabel 2: Riwayat Selesai --- */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Riwayat Selesai (Closed / Rejected)
        </h3>
        {!isLoading && !error && (
          <RequestHistoryTable data={completedPositions} />
        )}
      </div>
    </div>
  );
}

export default RequestPositionPage;
