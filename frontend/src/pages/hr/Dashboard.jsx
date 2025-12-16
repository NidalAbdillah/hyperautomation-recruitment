// src/pages/Admins/DashboardAdmin.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import moment from "moment";

// Import Widget Component
import DashboardWidget from "../../components/hr/DashboardWidget";

// Import Chart.js
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Filler,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

// Register Chart Elements
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Filler
);

// --- API CONFIGURATION ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_DASHBOARD_SUMMARY = `${API_BASE_URL}/api/hr/dashboard/summary`;
const API_DASHBOARD_RECENT_APPLICATIONS = `${API_BASE_URL}/api/hr/dashboard/recent-applications?limit=5`;
const API_DASHBOARD_CHARTS = `${API_BASE_URL}/api/hr/dashboard/charts`;

// ==========================================
// 1. MAPPING STATUS: JOB POSITION (LENGKAP)
// ==========================================
const JOB_STATUS_MAP = {
  "DRAFT":    { label: "Draft", shortLabel: "Draft", color: "bg-yellow-100 text-yellow-800 border border-yellow-200" },
  "APPROVED": { label: "Approved", shortLabel: "Approved", color: "bg-blue-100 text-blue-800 border border-blue-200" },
  "OPEN":     { label: "Open (Published)", shortLabel: "Open", color: "bg-green-100 text-green-800 border border-green-200" },
  "CLOSED":   { label: "Closed", shortLabel: "Closed", color: "bg-gray-200 text-gray-800 border border-gray-300" },
  "REJECTED": { label: "Rejected", shortLabel: "Rejected", color: "bg-red-100 text-red-800 border border-red-200" },
  "default":  { label: "Unknown", shortLabel: "Unknown", color: "bg-gray-50 text-gray-600" }
};

// ==========================================
// 2. MAPPING STATUS: APPLICATIONS (LENGKAP)
// ==========================================
const APP_STATUS_MAP = {
  // Stage 1: Incoming
  "SUBMITTED":                { label: "Submitted", shortLabel: "Submitted", color: "bg-slate-100 text-slate-700 border border-slate-200" },
  "REVIEWED":                 { label: "AI Reviewed", shortLabel: "Reviewed", color: "bg-amber-50 text-amber-700 border border-amber-200" },
  
  // Stage 2: Admin Screening
  "STAFF_APPROVED":           { label: "Admin Qualified", shortLabel: "Qualified", color: "bg-teal-50 text-teal-700 border border-teal-200" },
  "STAFF_REJECTED":           { label: "Admin Rejected", shortLabel: "Rejected", color: "bg-red-50 text-red-700 border border-red-200" },

  // Stage 3: Technical/Manager Interview
  "INTERVIEW_QUEUED":         { label: "Interview Queue", shortLabel: "Queue", color: "bg-sky-50 text-sky-700 border border-sky-200" },
  "INTERVIEW_SCHEDULED":      { label: "Interview Scheduled", shortLabel: "Scheduled", color: "bg-blue-50 text-blue-700 border border-blue-200" },

  // Stage 4: Final Interview (Head HR)
  "FINAL_INTERVIEW_QUEUED":   { label: "Final Queue", shortLabel: "Final Queue", color: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  "FINAL_INTERVIEW_SCHEDULED":{ label: "Final Scheduled", shortLabel: "Final", color: "bg-violet-50 text-violet-700 border border-violet-200" },
  "PENDING_FINAL_DECISION":   { label: "Decision Pending", shortLabel: "Pending", color: "bg-purple-50 text-purple-700 border border-purple-200" },

  // Stage 5: Outcome
  "HIRED":                    { label: "Hired", shortLabel: "Hired", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  "ONBOARDING":               { label: "Onboarding", shortLabel: "Onboarding", color: "bg-lime-50 text-lime-700 border border-lime-200" },
  "NOT_HIRED":                { label: "Not Hired", shortLabel: "Not Hired", color: "bg-rose-50 text-rose-700 border border-rose-200" },

  "default":                  { label: "Unknown", shortLabel: "Unknown", color: "bg-gray-100 text-gray-800" }
};

const formatDisplayDate = (isoString) => isoString ? moment(isoString).format("DD MMM YYYY") : "-";
const getAuthToken = () => localStorage.getItem("token");

function DashboardAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. PAGE PROTECTION ---
  useEffect(() => {
    if (user && user.role === 'manager') {
      navigate("/hr/request-position");
    }
  }, [user, navigate]);

  // --- 2. FETCH DATA ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user?.role === 'manager') return;
      setLoading(true);
      try {
        const token = getAuthToken();
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, recentRes, chartsRes] = await Promise.all([
          axios.get(API_DASHBOARD_SUMMARY, { headers }),
          axios.get(API_DASHBOARD_RECENT_APPLICATIONS, { headers }),
          axios.get(API_DASHBOARD_CHARTS, { headers })
        ]);

        setDashboardData({
          stats: statsRes.data,
          recentApplications: recentRes.data || [],
          chartsData: {
            jobDistribution: chartsRes.data.jobDistribution || {},
            statusDistribution: chartsRes.data.statusDistribution || {},
            weeklySubmissionTrend: chartsRes.data.weeklySubmissionTrend || [],
          },
        });
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role !== 'manager') fetchDashboardData();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading Analytics...</div>;
  if (user?.role === 'manager') return null;

  const currentData = dashboardData || { stats: {}, recentApplications: [], chartsData: {} };
  const charts = currentData.chartsData.statusDistribution || {};
  const jobCharts = currentData.chartsData.jobDistribution || {};

  // ==========================================
  // 3. WIDGET CALCULATION (COMPLETE & ACCURATE)
  // ==========================================

  // --- JOB POSITION STATS ---
  const draftJobs = jobCharts.DRAFT || 0;
  const approvedJobs = jobCharts.APPROVED || 0;
  const openJobs = jobCharts.OPEN || 0;
  const closedJobs = jobCharts.CLOSED || 0;
  const rejectedJobs = jobCharts.REJECTED || 0;
  
  const totalJobs = draftJobs + approvedJobs + openJobs + closedJobs + rejectedJobs;
  const pendingJobs = draftJobs + approvedJobs; // Jobs yang belum dipublish

  // --- APPLICATION STATS (LENGKAP SESUAI SERVICE) ---
  const submittedApps = charts.SUBMITTED || 0;
  const reviewedApps = charts.REVIEWED || 0;
  const staffApprovedApps = charts.STAFF_APPROVED || 0;
  const staffRejectedApps = charts.STAFF_REJECTED || 0;
  
  const interviewQueuedApps = charts.INTERVIEW_QUEUED || 0;
  const interviewScheduledApps = charts.INTERVIEW_SCHEDULED || 0;
  
  const finalQueuedApps = charts.FINAL_INTERVIEW_QUEUED || 0;
  const finalScheduledApps = charts.FINAL_INTERVIEW_SCHEDULED || 0;
  const pendingFinalApps = charts.PENDING_FINAL_DECISION || 0;
  
  const hiredApps = charts.HIRED || 0;
  const onboardingApps = charts.ONBOARDING || 0;
  const notHiredApps = charts.NOT_HIRED || 0;

  // Grouping untuk widget
  const needReview = submittedApps + reviewedApps; // Perlu action dari HR
  const inInterview = interviewQueuedApps + interviewScheduledApps + finalQueuedApps + finalScheduledApps + pendingFinalApps;
  const totalAccepted = hiredApps + onboardingApps; // Total sukses
  const totalRejected = staffRejectedApps + notHiredApps; // Total ditolak (admin + akhir)
  const totalActive = needReview + staffApprovedApps + inInterview; // Yang masih dalam proses

  // Widget List: JOB POSITION SECTION
  const jobWidgets = [
    { 
      id: "j_total", 
      title: "TOTAL POSITIONS", 
      value: totalJobs, 
      type: "totalCv",
      subtitle: "All registered jobs"
    },
    { 
      id: "j_open", 
      title: "ACTIVE (OPEN)", 
      value: openJobs, 
      type: "activePositions", 
      trendColor: "green", 
      trendText: "Accepting applicants",
      subtitle: "Published positions"
    },
    { 
      id: "j_pending", 
      title: "PENDING APPROVAL", 
      value: pendingJobs, 
      type: "needReview", 
      trendColor: "blue", 
      trendText: "Awaiting approval",
      subtitle: "Draft + Approved"
    },
    { 
      id: "j_closed", 
      title: "CLOSED / REJECTED", 
      value: closedJobs + rejectedJobs, 
      type: "rejected", 
      trendColor: "gray", 
      trendText: "No longer active",
      subtitle: "Archived positions"
    },
  ];

  // Widget List: APPLICATION SECTION (LENGKAP)
  const appWidgets = [
    { 
      id: "a_total", 
      title: "TOTAL APPLICATIONS", 
      value: currentData.stats.totalCvCount || 0, 
      type: "totalCv",
      subtitle: "All time submissions"
    },
    { 
      id: "a_active", 
      title: "ACTIVE PIPELINE", 
      value: totalActive, 
      type: "reviewed", 
      trendColor: "blue", 
      trendText: "In process",
      subtitle: "Currently processing"
    },
    { 
      id: "a_interview", 
      title: "IN INTERVIEW", 
      value: inInterview, 
      type: "interview", 
      trendColor: "purple", 
      trendText: "Assessment phase",
      subtitle: "All interview stages"
    },
    { 
      id: "a_hired", 
      title: "HIRED & ONBOARDING", 
      value: totalAccepted, 
      type: "hired", 
      trendColor: "green", 
      trendText: "Success rate",
      subtitle: "Accepted candidates"
    },
    { 
      id: "a_rejected", 
      title: "REJECTED", 
      value: totalRejected, 
      type: "rejected", 
      trendColor: "red", 
      trendText: "Not qualified",
      subtitle: "All rejection stages"
    },
    { 
      id: "a_need_review", 
      title: "NEEDS REVIEW", 
      value: needReview, 
      type: "needReview", 
      trendColor: "orange", 
      trendText: "Action required",
      subtitle: "Submitted + Reviewed"
    },
  ];

  // ==========================================
  // 4. CHART CONFIG: PROFESSIONAL DOUGHNUT
  // ==========================================
  const commonDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'right',
        labels: { 
          usePointStyle: true, 
          font: { size: 12, family: "'Inter', sans-serif" }, 
          boxWidth: 10,
          boxHeight: 10,
          padding: 12,
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return {
                  text: `${label}: ${value} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '65%',
    layout: {
      padding: 20
    }
  };

  // ==========================================
  // 5. CHART DATA: JOB STATUS (FIXED ORDER)
  // ==========================================
  const jobDisplayOrder = ["DRAFT", "APPROVED", "OPEN", "CLOSED", "REJECTED"];
  const jobPalette = {
    "DRAFT": "#fbbf24",     // Amber-400
    "APPROVED": "#60a5fa",  // Blue-400
    "OPEN": "#34d399",      // Emerald-400
    "CLOSED": "#94a3b8",    // Slate-400
    "REJECTED": "#f87171"   // Red-400
  };

  const jobLabels = [];
  const jobValues = [];
  const jobColors = [];

  jobDisplayOrder.forEach(status => {
    const count = jobCharts[status] || 0;
    if (count > 0) { // Hanya tampilkan yang ada datanya
      jobLabels.push(JOB_STATUS_MAP[status]?.shortLabel || status);
      jobValues.push(count);
      jobColors.push(jobPalette[status] || "#e2e8f0");
    }
  });

  const jobDoughnutData = {
    labels: jobLabels,
    datasets: [{
      data: jobValues,
      backgroundColor: jobColors,
      borderWidth: 3,
      borderColor: "#ffffff",
      hoverOffset: 8,
      hoverBorderWidth: 3
    }]
  };

  // ==========================================
  // 6. CHART DATA: APPLICANT STATUS (COMPREHENSIVE)
  // ==========================================
  const appDisplayOrder = [
    "SUBMITTED", 
    "REVIEWED", 
    "STAFF_APPROVED",
    "INTERVIEW_QUEUED",
    "INTERVIEW_SCHEDULED", 
    "FINAL_INTERVIEW_QUEUED",
    "FINAL_INTERVIEW_SCHEDULED",
    "PENDING_FINAL_DECISION",
    "HIRED",
    "ONBOARDING",
    "STAFF_REJECTED", 
    "NOT_HIRED"
  ];
  
  const appPalette = {
    "SUBMITTED": "#cbd5e1",           // Slate-300
    "REVIEWED": "#fbbf24",            // Amber-400
    "STAFF_APPROVED": "#2dd4bf",      // Teal-400
    "INTERVIEW_QUEUED": "#7dd3fc",    // Sky-300
    "INTERVIEW_SCHEDULED": "#60a5fa", // Blue-400
    "FINAL_INTERVIEW_QUEUED": "#a78bfa", // Violet-400
    "FINAL_INTERVIEW_SCHEDULED": "#c084fc", // Purple-400
    "PENDING_FINAL_DECISION": "#e879f9", // Fuchsia-400
    "HIRED": "#34d399",               // Emerald-400
    "ONBOARDING": "#a3e635",          // Lime-400
    "STAFF_REJECTED": "#fb923c",      // Orange-400
    "NOT_HIRED": "#f87171"            // Red-400
  };

  const appLabels = [];
  const appValues = [];
  const appColors = [];

  appDisplayOrder.forEach(status => {
    const count = charts[status] || 0;
    if (count > 0) {
      appLabels.push(APP_STATUS_MAP[status]?.shortLabel || status);
      appValues.push(count);
      appColors.push(appPalette[status] || "#e2e8f0");
    }
  });

  const appDoughnutData = {
    labels: appLabels,
    datasets: [{
      data: appValues,
      backgroundColor: appColors,
      borderWidth: 3,
      borderColor: "#ffffff",
      hoverOffset: 8,
      hoverBorderWidth: 3
    }]
  };

  // ==========================================
  // 7. LINE CHART CONFIG (WEEKLY TREND)
  // ==========================================
  const lineData = {
    labels: (currentData.chartsData.weeklySubmissionTrend || []).map(d => moment(d.date).format("DD MMM")),
    datasets: [{
      label: "Applications",
      data: (currentData.chartsData.weeklySubmissionTrend || []).map(d => d.count),
      borderColor: "#3b82f6",
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(59, 130, 246, 0.3)");
        gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
        return gradient;
      },
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: "#3b82f6",
      pointBorderColor: "#ffffff",
      pointBorderWidth: 2,
      pointHoverBorderWidth: 3
    }]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { 
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 }
      }
    },
    scales: { 
      x: { 
        grid: { display: false },
        border: { display: false },
        ticks: { 
          font: { size: 11 },
          color: '#64748b'
        }
      }, 
      y: { 
        border: { display: false },
        grid: { 
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false
        },
        ticks: { 
          stepSize: 1,
          font: { size: 11 },
          color: '#64748b',
          padding: 8
        }
      } 
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">HR Executive Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">Recruitment & Job Position Monitoring System</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-slate-600 bg-white px-5 py-2.5 rounded-xl shadow-sm border border-slate-200">
            {moment().format("dddd, DD MMMM YYYY")}
          </div>
        </div>
      </div>

      {/* SECTION 1: JOB POSITIONS OVERVIEW */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Position Overview</h3>
          <button 
            onClick={() => navigate('/hr/positions')} 
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            View All Positions →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {jobWidgets.map(stat => (
            <DashboardWidget key={stat.id} {...stat} />
          ))}
        </div>
      </div>

      {/* SECTION 2: APPLICANT PIPELINE */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Applicant Pipeline & Metrics</h3>
          <button 
            onClick={() => navigate('/hr/manage-cv')} 
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            View All Applications →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {appWidgets.map(stat => (
            <DashboardWidget key={stat.id} {...stat} />
          ))}
        </div>
      </div>

      {/* SECTION 3: CHARTS AREA (PROFESSIONAL GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        
        {/* LEFT: LINE CHART (Weekly Trend) */}
        <div className="xl:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-800">Weekly Submission Trend</h3>
            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">Last 7 Days</span>
          </div>
          <div className="relative h-72 w-full">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* CENTER: JOB STATUS DISTRIBUTION */}
        <div className="xl:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-800">Job Status Distribution</h3>
            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">{totalJobs} Total</span>
          </div>
          <div className="relative h-72 w-full flex items-center justify-center">
            {jobLabels.length > 0 ? (
              <Doughnut data={jobDoughnutData} options={commonDoughnutOptions} />
            ) : (
              <div className="text-center text-slate-400">
                <p className="text-sm font-medium">No job data available</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: APPLICANT FUNNEL */}
        <div className="xl:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-800">Applicant Status Funnel</h3>
            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">{currentData.stats.totalCvCount || 0} Total</span>
          </div>
          <div className="relative h-72 w-full flex items-center justify-center">
            {appLabels.length > 0 ? (
              <Doughnut data={appDoughnutData} options={commonDoughnutOptions} />
            ) : (
              <div className="text-center text-slate-400">
                <p className="text-sm font-medium">No application data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4: QUICK STATS SUMMARY (GRADIENT CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">24h</span>
          </div>
          <p className="text-3xl font-bold mb-1">{currentData.stats.newCvLast24Hours || 0}</p>
          <p className="text-sm text-blue-100 font-medium">New Applications Today</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">Success</span>
          </div>
          <p className="text-3xl font-bold mb-1">{totalAccepted}</p>
          <p className="text-sm text-emerald-100 font-medium">Total Hired & Onboarding</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">Active</span>
          </div>
          <p className="text-3xl font-bold mb-1">{inInterview}</p>
          <p className="text-sm text-purple-100 font-medium">In Interview Process</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">Urgent</span>
          </div>
          <p className="text-3xl font-bold mb-1">{needReview}</p>
          <p className="text-sm text-amber-100 font-medium">Needs HR Review</p>
        </div>
      </div>

      {/* SECTION 5: RECENT APPLICATIONS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Recent Applications</h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest 5 candidate submissions</p>
          </div>
          <button 
            onClick={() => navigate('/hr/manage-cv')} 
            className="text-sm text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-all"
          >
            View All Applications →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-600 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 font-bold text-left">Candidate Name</th>
                <th className="px-6 py-3.5 font-bold text-left">Position Applied</th>
                <th className="px-6 py-3.5 font-bold text-left">Status</th>
                <th className="px-6 py-3.5 font-bold text-left">Date Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentData.recentApplications.length > 0 ? (
                currentData.recentApplications.map((app) => {
                  const statusInfo = APP_STATUS_MAP[app.status] || APP_STATUS_MAP["default"];
                  return (
                    <tr key={app.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer">
                      <td className="px-6 py-4 font-semibold text-slate-900">{app.fullName}</td>
                      <td className="px-6 py-4 text-slate-600">{app.qualification}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{formatDisplayDate(app.createdAt)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="font-medium">No recent applications found</p>
                      <p className="text-xs mt-1">Applications will appear here once submitted</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;