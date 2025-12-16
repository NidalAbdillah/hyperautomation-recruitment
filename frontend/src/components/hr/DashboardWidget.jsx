// src/components/hr/DashboardWidget.jsx
import React from "react";
import {
  DocumentTextIcon,       // Total CV
  ClockIcon,              // 24 Jam Terakhir
  BriefcaseIcon,          // Lowongan Aktif
  ExclamationCircleIcon,  // Perlu Review (AI sudah nilai)
  CheckBadgeIcon,         // Staff Approved (Qualified)
  XCircleIcon,            // Rejected
  UserGroupIcon,          // Interview Phase
  CheckIcon,              // Hired (Success)
  ChartBarIcon,           // Active Pipeline
  UserIcon,               // Onboarding
  ClipboardDocumentCheckIcon // Reviewed
} from "@heroicons/react/24/outline";

// ==========================================
// MAPPING 'TYPE' WIDGET KE IKON (EXTENDED)
// ==========================================
const iconMap = {
  totalCv: DocumentTextIcon,
  newCv: ClockIcon,
  activePositions: BriefcaseIcon,
  needReview: ExclamationCircleIcon,      // Status: REVIEWED (Menunggu Staff)
  staffApproved: CheckBadgeIcon,          // Status: STAFF_APPROVED (Lolos Seleksi Awal)
  interview: UserGroupIcon,               // Status: INTERVIEW_SCHEDULED
  hired: CheckIcon,                       // Status: HIRED
  rejected: XCircleIcon,                  // Status: STAFF_REJECTED / NOT_HIRED
  reviewed: ClipboardDocumentCheckIcon,   // AI Reviewed (Active Pipeline)
  onboarding: UserIcon                    // Onboarding Phase
};

// ==========================================
// MAPPING WARNA BACKGROUND IKON (EXTENDED)
// ==========================================
const colorMap = {
  totalCv: "bg-blue-100 text-blue-600",
  newCv: "bg-indigo-100 text-indigo-600",
  activePositions: "bg-purple-100 text-purple-600",
  needReview: "bg-amber-100 text-amber-600",        // Orange/Yellow untuk urgent
  staffApproved: "bg-teal-100 text-teal-600",
  interview: "bg-violet-100 text-violet-600",       // Purple untuk interview
  hired: "bg-emerald-100 text-emerald-600",         // Green untuk success
  rejected: "bg-red-100 text-red-600",
  reviewed: "bg-sky-100 text-sky-600",              // Light blue untuk reviewed
  onboarding: "bg-lime-100 text-lime-600"           // Lime untuk onboarding
};

// ==========================================
// COMPONENT: DASHBOARD WIDGET (ENHANCED)
// ==========================================
function DashboardWidget({
  title,
  value,
  type,
  trendText,
  trendColor = "gray",
  subtitle = null // ✅ NEW: Support subtitle
}) {
  const IconComponent = iconMap[type] || DocumentTextIcon;
  const iconColorClass = colorMap[type] || "bg-gray-100 text-gray-600";

  // Kelas warna untuk teks trend (extended)
  const trendColorClass = {
    green: "text-green-600",
    red: "text-red-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    gray: "text-slate-500",
  }[trendColor] || "text-slate-500";

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between min-w-[200px] flex-grow transition-all duration-300 hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 group">
      <div className="flex-grow">
        {/* Title */}
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          {title}
        </p>
        
        {/* Value dengan Trend */}
        <div className="flex items-end gap-2 mb-1">
          <p className="text-3xl font-bold text-slate-800 leading-none group-hover:text-slate-900 transition-colors">
            {value}
          </p>
          {trendText && (
            <p className={`text-xs font-semibold mb-1 ${trendColorClass} transition-colors`}>
              {trendText}
            </p>
          )}
        </div>

        {/* ✅ NEW: Subtitle (Description) */}
        {subtitle && (
          <p className="text-xs text-slate-400 font-medium mt-1">
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Icon Section */}
      <div className="ml-4 flex-shrink-0">
        <span className={`inline-flex items-center justify-center h-14 w-14 rounded-xl ${iconColorClass} transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
          <IconComponent className="h-7 w-7" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

export default DashboardWidget;