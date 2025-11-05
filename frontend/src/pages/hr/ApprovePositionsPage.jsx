// src/pages/hr/ApprovePositionsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Notiflix from 'notiflix';
import ApproveTable from '../../components/hr/ApproveTable'; // <-- Impor tabel baru
import ViewPositionDetailsModal from '../../components/hr/ViewPositionDetailsModal'; // <-- Impor modal "View Details" (Lihat Detail)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_GET_POSITIONS_URL = `${API_BASE_URL}/api/hr/job-positions`;
const API_UPDATE_POSITION_URL = (id) => `${API_BASE_URL}/api/hr/job-positions/${id}`;

// Helper "Anti-Challenge" (Anti-Bantah) (Meniru gaya ManageUsersPage)
const getAuthToken = () => {
  return localStorage.getItem("token");
};

/**
 * Halaman untuk 'Approve Positions' (Persetujuan Lowongan).
 * Digunakan oleh 'head_hr' untuk meninjau lowongan berstatus 'Draft'.
 */
function ApprovePositionsPage() {
  const [draftPositions, setDraftPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State (Status) untuk modal (pop-up) "View Details" (Lihat Detail)
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);

  /**
   * Mengambil semua lowongan dan memfilternya untuk 'Draft'.
   */
  const fetchDraftPositions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        const authError = new Error("User not authenticated. Token missing.");
        authError.response = { status: 401, data: { message: "Silakan login kembali." } };
        throw authError;
      }

      const response = await axios.get(API_GET_POSITIONS_URL, {
        headers: { Authorization: `Bearer ${token}` }, 
      });
      
      // Ini adalah "Defense" (Pertahanan) TA Anda: Filter di Frontend
      // Kita HANYA menampilkan yang statusnya "Draft"
      const drafts = response.data.filter(pos => pos.status === 'Draft');
      
      setDraftPositions(drafts);
      
    } catch (err) {
      console.error("Error fetching draft positions:", err);
      const errMsg = err.response?.data?.message || "Gagal memuat data persetujuan.";
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

  // Panggil fetchDraftPositions saat komponen dimuat
  useEffect(() => {
    fetchDraftPositions();
  }, [fetchDraftPositions]);

  /**
   * Handler (Penangan) untuk memproses persetujuan (Approve/Reject)
   */
  const handleApprovalAction = async (position, newStatus) => {
    const actionText = newStatus === 'Approved' ? 'Menyetujui' : 'Menolak';
    const actionSuccessText = newStatus === 'Approved' ? 'disetujui' : 'ditolak';

    Notiflix.Confirm.show(
      `Konfirmasi ${actionText} Lowongan`,
      `Anda yakin ingin ${actionText.toLowerCase()} lowongan "${position.name}"?`,
      actionText,
      "Batal",
      async () => {
        Notiflix.Loading.standard(`${actionText} lowongan...`);
        try {
          const token = getAuthToken();
          if (!token) throw new Error("Token not found");

          // Panggil API untuk UPDATE status
          await axios.put(
            API_UPDATE_POSITION_URL(position.id), 
            { status: newStatus }, // Body: kirim status baru
            { headers: { Authorization: `Bearer ${token}` } }
          );

          Notiflix.Loading.remove();
          Notiflix.Report.success(
            "Berhasil",
            `Lowongan "${position.name}" telah ${actionSuccessText}.`,
            "Okay"
          );
          
          fetchDraftPositions(); // Muat ulang data

        } catch (error) {
          Notiflix.Loading.remove();
          console.error(`Error processing ${actionText}:`, error);
          if (error.response && error.response.status === 401) {
            Notiflix.Report.warning("Sesi Habis", "Sesi Anda telah berakhir. Silakan login kembali.", "Okay");
          } else {
            Notiflix.Report.failure("Gagal", error.response?.data?.message || `Gagal ${actionText.toLowerCase()} lowongan.`, "Okay");
          }
        }
      },
      () => { /* Batal */ }
    );
  };
  
  const handleApprove = (position) => {
    handleApprovalAction(position, 'Approved');
  };

  const handleReject = (position) => {
    handleApprovalAction(position, 'Rejected');
  };
  
  // Handler (Penangan) untuk "View Details" (Lihat Detail) (sesuai permintaan Anda)
  const handleViewDetails = (position) => {
    setSelectedPosition(position);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedPosition(null);
  };

  return (
    <div className="approve-positions-page-container p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Persetujuan Lowongan (Approval Queue)</h2>
      <p className="text-sm text-gray-600 mb-6">
        Tinjau permintaan lowongan baru yang diajukan oleh Manajer Departemen (status "Draft").
      </p>
      
      <ApproveTable
        data={draftPositions}
        isLoading={isLoading}
        error={error}
        onApprove={handleApprove}
        onReject={handleReject}
        onViewDetails={handleViewDetails}
      />
      
      <ViewPositionDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        position={selectedPosition}
      />
    </div>
  );
}

export default ApprovePositionsPage;