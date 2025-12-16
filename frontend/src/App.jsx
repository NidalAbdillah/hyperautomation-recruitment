import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "./index.css";

// --- IMPORT HALAMAN PUBLIK ---
import Home from "./pages/Home.jsx";
import ApplyCv from "./pages/ApplyCv.jsx";
import Login from "./pages/Login.jsx";

// --- IMPORT HALAMAN HR (ADMIN) ---
import DashboardPage from "./pages/hr/Dashboard.jsx";
import ManageUsersPage from "./pages/hr/ManageUsersPage.jsx";
import ManageCVsPage from "./pages/hr/ManageCVsPage.jsx";
import ArchiveCenterPage from "./pages/hr/ArchiveCenterPage.jsx";
import ManageJobPositionsPage from "./pages/hr/ManageJobPositionsPage.jsx";
import TopRankingPage from "./pages/hr/TopRankingPage.jsx";
import OnboardingPage from './pages/hr/OnboardingPage';

// --- PERBAIKAN 1: Impor Halaman Baru ---
import RequestPositionPage from "./pages/hr/RequestPositionPage.jsx"; // <-- Halaman baru untuk Manager
import ApprovePositionsPage from "./pages/hr/ApprovePositionsPage.jsx"; // <-- (Kita tambahkan ini sekalian)
import SchedulePage from "./pages/hr/SchedulePage.jsx";
import InterviewSchedulePage from './pages/hr/InterviewSchedulePage'; // Tahap 1 (Manager)
import FinalSchedulePage from './pages/hr/FinalSchedulePage';         // Tahap 2 (Staff HR Jadwalin)
import HeadHrFinalDecisionPage from './pages/hr/HeadHrFinalDecisionPage'; // Tahap 3 (Head HR Putusin)
// --- BATAS PERBAIKAN 1 ---

// Layouts
import DashboardLayout from "./layouts/DashboardLayout.jsx";

// Komponen Lain
import ScrollToTop from "./components/ScrollToTop.jsx";
import { useDocTitle } from "./components/CustomHook.jsx";

// Context
import { useAuth } from "./context/AuthContext.jsx";

// Komponen ProtectedRoute (Logika Anda sudah benar)
function ProtectedRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
          <p className="mt-2">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }
  
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

// Komponen utama aplikasi React
function App() {
  useDocTitle("PT Tech XYZ | Company");

  useEffect(() => {
    // ... (Logika AOS Anda sudah benar) ...
    const aosInit = () => {
      AOS.init({ once: true, duration: 1000, easing: "ease-out-cubic" });
    };
    if (typeof window !== "undefined") {
      window.addEventListener("load", aosInit);
      return () => window.removeEventListener("load", aosInit);
    }
  }, []);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Rute Publik */}
        <Route path="/" element={<Home />} />
        <Route path="/applycv" element={<ApplyCv />} />
        <Route path="/contact" element={<ApplyCv />} />
        <Route path="/login" element={<Login />} />

        {/* Rute HR (Admin) yang Dilindungi */}
        <Route
          path="/hr" // <-- Path (Rute) Induk sudah benar
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* --- PERBAIKAN 2: Tambahkan Rute (Route) Baru --- */}
          {/* Ini adalah "Kabel Lift" yang hilang */}

          {/* Grup 1: Home */}
          <Route index element={<DashboardPage />} />
          
          {/* Grup 2: Manajemen Kandidat */}
          <Route path="manage-cv" element={<ManageCVsPage />} />
          <Route path="top-ranking" element={<TopRankingPage />} />
          <Route path="interviews" element={<InterviewSchedulePage />} />
          <Route path="archived" element={<ArchiveCenterPage />} />
          
          {/* Grup 3: Manajemen Lowongan (Sesuai Alur 3-Status) */}
          <Route path="request-position" element={<RequestPositionPage />} />
          <Route path="approve-positions" element={<ApprovePositionsPage />} />
          <Route path="event-calendar" element={<SchedulePage />} />
          <Route path="manage-job-openings" element={<ManageJobPositionsPage />} />
          <Route path="final-scheduling" element={<FinalSchedulePage />} />
          <Route path="final-decision" element={<HeadHrFinalDecisionPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          
          
          {/* Grup 4: Administrasi Sistem */}
          <Route path="manage-users" element={<ManageUsersPage />} />
          {/* <Route path="settings" element={<SettingsPage />} /> */}
          {/* --- BATAS PERBAIKAN 2 --- */}
          <Route path="final-decision" element={<HeadHrFinalDecisionPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;