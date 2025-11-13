// src/components/Admins/DashboardWidget.jsx
import React from "react";
import {
  DocumentTextIcon, // Ikon untuk Total CV Masuk
  ClockIcon, // Ikon untuk CV Baru 24 Jam Terakhir
  BriefcaseIcon, // Ikon untuk Lowongan Aktif
  ExclamationCircleIcon, // Ikon untuk CV Perlu Ditinjau
  // StarIcon, // Ikon untuk Shortlisted (tidak dipakai lagi di widget)
  CheckCircleIcon, // Ikon baru untuk Total STAFF_APPROVED
  XCircleIcon, // Ikon baru untuk Total STAFF_Rejected
} from "@heroicons/react/24/outline";

// Mapping sederhana dari 'type' ke ikon Heroicons
const iconMap = {
  totalCv: DocumentTextIcon, // Mapping untuk Total CV Masuk
  newCv: ClockIcon, // Mapping untuk CV Baru 24 Jam Terakhir
  activePositions: BriefcaseIcon, // Mapping untuk Lowongan Aktif
  needReview: ExclamationCircleIcon, // Mapping untuk CV Perlu Ditinjau
  // shortlisted: StarIcon, // Mapping Shortlisted dihapus
  totalSTAFF_APPROVED: CheckCircleIcon, // Mapping baru untuk Total STAFF_APPROVED
  totalSTAFF_REJECTED: XCircleIcon, // Mapping baru untuk Total STAFF_Rejected
  // Tambahkan mapping ikon lain jika perlu untuk type widget lainnya
};

function DashboardWidget({
  title,
  value,
  type,
  trendText,
  trendColor = "gray",
}) {
  // Dapatkan komponen ikon berdasarkan 'type'
  const IconComponent = iconMap[type];

  // Kelas warna untuk trend (menggunakan Tailwind CSS)
  const trendColorClass = {
    green: "text-green-600",
    red: "text-red-600",
    gray: "text-gray-500",
    // Tambahkan warna lain jika perlu
  }[trendColor];

  return (
    <div className="bg-white p-5 rounded-lg shadow flex items-center justify-between min-w-[200px] flex-grow">
      <div className="flex-grow">
        {/* Judul Widget */}
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <div className="flex items-baseline">
          {/* Nilai Widget */}
          <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
          {/* Teks Trend (jika ada) */}
          {trendText && (
            <p className={`ml-2 text-sm font-medium ${trendColorClass}`}>
              {trendText}
            </p>
          )}
        </div>
      </div>
      {/* Area Ikon */}
      {IconComponent && (
        <div className="ml-4 flex-shrink-0">
          {/* Ikon dengan background lingkaran dan warna merah Telkom */}
          <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <IconComponent
              className="h-6 w-6 text-blue-600" // Warna ikon merah Telkom
              aria-hidden="true"
            />
          </span>
        </div>
      )}
    </div>
  );
}

export default DashboardWidget;
