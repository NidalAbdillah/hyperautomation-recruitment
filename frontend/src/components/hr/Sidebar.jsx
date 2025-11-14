// src/components/hr/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Notiflix from "notiflix";

// Import Phosphor Icons (lebih keren!)
import {
  House, FileText, Star, Archive, Users, Briefcase,
  Gear, SignOut, CaretLeft, CaretRight, ArrowLineLeft,
  ClipboardText, CheckSquare, CalendarCheck, Calendar
} from "@phosphor-icons/react";

import logoWhite from "../../images/logo-white.png";

const SIDEBAR_STATE_STORAGE_KEY = "isSidebarOpen";

function Sidebar() {
  const location = useLocation();
  const { user, logout, isLoading } = useAuth();

  // State sidebar dengan localStorage
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const storedState = localStorage.getItem(SIDEBAR_STATE_STORAGE_KEY);
      if (storedState !== null) {
        return JSON.parse(storedState);
      }
      return window.innerWidth >= 1024;
    } catch (e) {
      console.error("Failed to get sidebar state:", e);
      return window.innerWidth >= 1024;
    }
  });

  const isCollapsed = !isOpen;

  // Simpan state ke localStorage dan emit event
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STATE_STORAGE_KEY, JSON.stringify(isOpen));
      window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { isOpen } }));
    } catch (e) {
      console.error("Failed to save sidebar state:", e);
    }
  }, [isOpen]);

  // Handle resize window
  useEffect(() => {
    const handleResize = () => {
      setIsOpen((currentState) => {
        const shouldBeOpen = window.innerWidth >= 1024;
        return currentState !== shouldBeOpen ? shouldBeOpen : currentState;
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    Notiflix.Confirm.init({
      className: "notiflix-confirm",
      width: "320px",
      zindex: 4003,
      backgroundColor: "#0f172a",
      borderRadius: "12px",
      titleColor: "#60a5fa",
      messageColor: "#e2e8f0",
      okButtonBackground: "#3b82f6",
      okButtonColor: "#fff",
      cancelButtonBackground: "#475569",
      cancelButtonColor: "#e2e8f0",
    });
  }, []);

  if (isLoading) {
    return (
      <div className={`relative h-full bg-[#0b1437] text-slate-300 flex-shrink-0 z-10 ${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300`}>
        <div className="h-full flex flex-col justify-center items-center text-blue-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

const mainMenuItems = [
    // --- GRUP 1: HOME ---
    { 
      path: "/hr", 
      label: "Dashboard", 
      icon: House, 
      gradient: "from-[#1e3b5c] to-[#2c5f8d]",
      hoverBg: "hover:from-[#1e3b5c]/20 hover:to-[#2c5f8d]/10",
      allowedRoles: ["head_hr", "staff_hr", "manager"] 
    },
    // --- GRUP 2: MANAJEMEN KANDIDAT ---
    { 
      path: "/hr/manage-cv", 
      label: "CV Applications", 
      icon: FileText, 
      gradient: "from-[#1e3b5c] to-[#2c5f8d]",
      hoverBg: "hover:from-[#1e3b5c]/20 hover:to-[#2c5f8d]/10",
      allowedRoles: ["head_hr", "staff_hr"]
    },
    { 
      path: "/hr/top-ranking", 
      label: "Top Candidates", 
      icon: Star, 
      gradient: "from-[#1e3b5c] to-[#2c5f8d]",
      hoverBg: "hover:from-[#1e3b5c]/20 hover:to-[#2c5f8d]/10",
      allowedRoles: ["head_hr", "staff_hr", "manager"]
    },
    { 
      path: "/hr/schedule-interview", 
      label: "Interview Schedule", 
      icon: CalendarCheck, 
      gradient: "from-[#1e3b5c] to-[#2c5f8d]",
      hoverBg: "hover:from-[#1e3b5c]/20 hover:to-[#2c5f8d]/10",
      allowedRoles: ["head_hr", "staff_hr", "manager"]
    },
        { 
      path: "/hr/event-calendar", // <-- Path yang kita daftarkan di App.jsx
      label: "Event Calendar", 
      icon: Calendar, // <-- Icon baru
      gradient: "from-[#1e3b5c] to-[#2c5f8d]",
      hoverBg: "hover:from-[#1e3b5c]/20 hover:to-[#2c5f8d]/10",
      allowedRoles: ["head_hr", "staff_hr"] // (Kita set untuk HR saja)
    },
    { 
      path: "/hr/archived", 
      label: "Archived Center", 
      icon: Archive, 
      gradient: "from-[#1e3b5c] to-[#2c5f8d]",
      hoverBg: "hover:from-[#1e3b5c]/20 hover:to-[#2c5f8d]/10",
      allowedRoles: ["head_hr", "staff_hr"]
    },
    // --- GRUP 3: MANAJEMEN LOWONGAN (Alur Request-to-Hire) ---
    { 
      path: "/hr/request-position", 
      label: "Request Position", 
      icon: ClipboardText, 
      gradient: "from-[#1e3b5c] to-[#2c5f8d]",
      hoverBg: "hover:from-[#1e3b5c]/20 hover:to-[#2c5f8d]/10",
      allowedRoles: ["manager"]
    },
    { 
      path: "/hr/approve-positions", 
      label: "Approve Positions", 
      icon: CheckSquare, 
      gradient: "from-[#1e3b5c] to-[#2c5f8d]",
      hoverBg: "hover:from-[#1e3b5c]/20 hover:to-[#2c5f8d]/10",
      allowedRoles: ["head_hr"]
    },
    { 
      path: "/hr/manage-job-openings", 
      label: "Manage Job Openings", 
      icon: Briefcase, 
      gradient: "from-[#1e3b5c] to-[#2c5f8d]",
      hoverBg: "hover:from-[#1e3b5c]/20 hover:to-[#2c5f8d]/10",
      allowedRoles: ["head_hr", "staff_hr"]
    },
    // --- GRUP 4: ADMINISTRASI SISTEM ---
    { 
      path: "/hr/manage-users", 
      label: "Staff Management", 
      icon: Users, 
      gradient: "from-[#1e3b5c] to-[#2c5f8d]",
      hoverBg: "hover:from-[#1e3b5c]/20 hover:to-[#2c5f8d]/10",
      allowedRoles: ["head_hr"]
    },
  ];

  // Menu Bawah (Settings)
  const bottomMenuItems = [
    { 
      path: "/hr/settings", 
      label: "Settings", 
      icon: Gear, 
      gradient: "from-[#1e3b5c] to-[#2c5f8d]",
      hoverBg: "hover:from-[#1e3b5c]/20 hover:to-[#2c5f8d]/10",
      allowedRoles: ["head_hr", "staff_hr", "manager"] 
    }
  ];

  const userRole = user?.role;
   const filteredMainMenuItems = mainMenuItems.filter(item => 
     item.allowedRoles.includes(userRole)
   );
   const filteredBottomMenuItems = bottomMenuItems.filter(item => 
     item.allowedRoles.includes(userRole)
   );
  // STYLING CLASSES - HIDUP & BERWARNA!
  const baseLinkClass = "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl mx-2 transition-all duration-300 ease-in-out group relative overflow-hidden backdrop-blur-sm";
  
  const getActiveLinkClass = (gradient) => `bg-gradient-to-r ${gradient} text-white shadow-xl shadow-lg`;
  const getInactiveLinkClass = (hoverBg) => `text-slate-300 bg-slate-800/20 hover:bg-gradient-to-r ${hoverBg} hover:text-white hover:shadow-lg hover:scale-105 hover:translate-x-1`;

  // Handler Functions
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    Notiflix.Confirm.show(
      "Confirm Logout",
      "Are you sure you want to sign out?",
      "Yes, Logout",
      "Cancel",
      () => logout(),
      () => {}
    );
  };

  return (
    <div
      className={`
        fixed left-0 top-0 bottom-0 z-30
        bg-[#002b4e]
        text-slate-300
        transition-all duration-300 ease-in-out
        border-r border-slate-700/30
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      <div className="flex flex-col h-full overflow-hidden mt-2">
        
        {/* HEADER dengan Text Brand + Tombol Expand saat collapsed */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center'} flex-shrink-0 relative ${isCollapsed ? 'h-20 py-4' : 'h-20 pt-5 pb-3'} bg-gradient-to-b from-slate-900/20 to-transparent`}>
          {isCollapsed ? (
            <div className="mt-2 flex items-center justify-center w-full">
              <button 
                onClick={toggleSidebar}
                className="group relative p-1 rounded-full transition-all duration-300 cursor-pointer hover:bg-slate-700/20 active:bg-slate-600/30"
              >
                <div className="relative w-12 h-12"> {/* Sesuaikan ukuran w-10 h-10 jika perlu */}
                <img
                  src={logoWhite} 
                  alt="Logo"
                  className="w-full h-full object-contain"
                  // style={{ filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.3))' }} // Glow putih
                />
                </div>
                {/* Ring merah saat hover */}
                <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-white group-active:border-white/80 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-white/30"></div>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              {/* Container untuk semua elemen - centered */}
              <div className="flex flex-col items-start">
                {/* Human Resource - kecil di atas, aligned dengan T */}
                <p className="text-[7px] font-semibold tracking-wider mb-0 text-left leading-tight mt-4" style={{ 
                  fontFamily: "'Inter', sans-serif",
                  color: '#C72E3A',
                  letterSpacing: '0.12em',
                  fontWeight: 600
                }}>
                  HUMAN RESOURCE
                </p>
                
                {/* TECH XYZ - besar di tengah dengan gradient */}
                <h1 className="text-[26px] leading-none tracking-tight mb-0" style={{ 
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif", 
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                  letterSpacing: '0.02em'
                }}>
                  <span style={{ fontWeight: 900 }}>PT TECH</span>
                  <span style={{ fontWeight: 300 }}> XYZ</span>
                </h1>
                
                {/* Recruitment System - background putih, ujung pas dengan Z */}
                <div className="self-end inline-block px-1.5 py-0.5 bg-white rounded-sm" style={{
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                }}>
                  <p className="text-[6.5px] font-bold tracking-wider leading-tight" style={{ 
                    fontFamily: "'Inter', sans-serif", 
                    letterSpacing: '0.08em', 
                    fontWeight: 700,
                    color: '#0f172a'
                  }}>
                    Recruitment System
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Tombol Toggle - Hanya muncul saat expanded, mirip MinIO */}
          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="mt-0 absolute top-1/4 -translate-y-1/2 mr-2 -right-3 p-1.5 rounded hover:bg-slate-600 text-slate-200 hover:text-white shadow-md transition-all duration-200 z-20"
              aria-label="Collapse sidebar"
            >
              <ArrowLineLeft size={18} weight="bold" />
            </button>
          )}
        </div>
        
        {/* GARIS PEMISAH - Hanya muncul saat expanded */}
        {!isCollapsed && (
          <div className="px-4 py-5">
            <div className="border-t-2 border-slate-400/50"></div>
          </div>
        )}

        {/* NAVIGASI UTAMA - BERWARNA & HIDUP! */}
        <nav className={`flex-grow px-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent ${isCollapsed ? 'pt-6' : ''}`}>
          <ul className="space-y-2">
            {filteredMainMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const IconComponent = item.icon;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`${baseLinkClass} ${
                      isActive 
                        ? getActiveLinkClass(item.gradient)
                        : getInactiveLinkClass(item.hoverBg)
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    title={item.label}
                  >
                    {/* Glow effect background untuk active */}
                    {isActive && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-20 blur-xl`}></div>
                    )}
                    
                    {IconComponent && (
                      <IconComponent
                        size={22}
                        weight={isActive ? "fill" : "duotone"}
                        className={`flex-shrink-0 ${isCollapsed ? '' : 'mr-3'} transition-all duration-300 relative z-10 ${
                          isActive 
                            ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' 
                            : 'group-hover:scale-125 group-hover:rotate-12'
                        }`}
                      />
                    )}
                    {!isCollapsed && (
                      <span className={`relative z-10 ${isActive ? 'font-bold' : 'font-medium'}`}>
                        {item.label}
                      </span>
                    )}
                    {!isCollapsed && isActive && (
                      <div className={`ml-auto w-2 h-2 rounded-full bg-white animate-pulse relative z-10 shadow-lg`}></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* MENU BAWAH - Settings & Logout dengan spacing yang sama */}
        <div className="mt-auto flex-shrink-0">
          {/* GARIS PEMISAH ATAS - Hanya muncul saat expanded */}
          {!isCollapsed && (
            <div className="px-4 py-5">
              <div className="border-t-2 border-slate-400/50"></div>
            </div>
          )}
          
          <div className={`px-2 ${isCollapsed ? 'pb-4 pt-4' : 'pb-4'}`}>
            <ul className="space-y-2">
            {filteredBottomMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const IconComponent = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`${baseLinkClass} ${
                      isActive 
                        ? getActiveLinkClass(item.gradient)
                        : getInactiveLinkClass(item.hoverBg)
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    title={item.label}
                  >
                    {isActive && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-20 blur-xl`}></div>
                    )}
                    {IconComponent && (
                      <IconComponent
                        size={22}
                        weight={isActive ? "fill" : "duotone"}
                        className={`flex-shrink-0 ${isCollapsed ? '' : 'mr-3'} transition-all duration-300 relative z-10 ${
                          isActive 
                            ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' 
                            : 'group-hover:scale-125 group-hover:rotate-12'
                        }`}
                      />
                    )}
                    {!isCollapsed && (
                      <span className={`relative z-10 ${isActive ? 'font-bold' : 'font-medium'}`}>
                        {item.label}
                      </span>
                    )}
                    {!isCollapsed && isActive && (
                      <div className={`ml-auto w-2 h-2 rounded-full bg-white animate-pulse relative z-10`}></div>
                    )}
                  </Link>
                </li>
              );
            })}

<li>
  <button
    onClick={handleLogout}
    className={`${baseLinkClass} ${getInactiveLinkClass("hover:from-red-700/10 hover:to-red-600/10")} 
                text-red-400 hover:text-red-300 active:text-red-200
                ${isCollapsed ? 'justify-center' : ''}`}
  >
    <SignOut
      size={22}
      weight="duotone"
      className={`flex-shrink-0 ${isCollapsed ? '' : 'mr-3'} transition-all duration-300 
                  group-hover:scale-110 group-hover:rotate-6`}
    />
    {!isCollapsed && (
      <span className="font-medium tracking-wide">Logout</span>
    )}
  </button>
</li>



          </ul>
        </div>
      </div>

      </div>
    </div>
  );
}

export default Sidebar;