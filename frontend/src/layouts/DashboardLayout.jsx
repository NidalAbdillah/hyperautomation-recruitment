import React, { useLayoutEffect, useState, useEffect } from "react";
import Sidebar from "../components/hr/Sidebar";
import Footer from "../components/hr/Footer";
import { Outlet, useLocation } from "react-router-dom";

function DashboardLayout() {
  const location = useLocation();
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    // Baca dari localStorage untuk initial state
    try {
      const storedState = localStorage.getItem("isSidebarOpen");
      const isOpen = storedState !== null ? JSON.parse(storedState) : window.innerWidth >= 1024;
      return isOpen ? 'ml-64' : 'ml-20';
    } catch (e) {
      return 'ml-64';
    }
  });

  useLayoutEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Listen untuk perubahan sidebar
  useEffect(() => {
    const handleSidebarToggle = (e) => {
      setSidebarWidth(e.detail.isOpen ? 'ml-64' : 'ml-20');
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle);
  }, []);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar - Fixed Full Height */}
      <Sidebar />

      {/* Main Content Area - dengan margin left dinamis untuk sidebar */}
      <div className={`flex-1 flex flex-col min-h-screen ${sidebarWidth} transition-all duration-300`}>
        {/* Content dengan scroll - Background Putih Penuh */}
        <main className="flex-1 p-6 bg-white">
          <Outlet />
        </main>

        {/* Footer - Hanya di area content */}
        <Footer />
      </div>
    </div>
  );
}

export default DashboardLayout;