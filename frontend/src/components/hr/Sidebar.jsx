// src/components/hr/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Notiflix from "notiflix";

// Import Phosphor Icons
import {
  House, FileText, Star, Archive, Users, Briefcase,
  Gear, SignOut, ArrowLineLeft,
  ClipboardText, CheckSquare, CalendarCheck, Calendar, SealCheck, UserPlus
} from "@phosphor-icons/react";

import logoWhite from "../../images/logo-white.png";

const SIDEBAR_STATE_STORAGE_KEY = "isSidebarOpen";

function Sidebar() {
  const location = useLocation();
  const { user, logout, isLoading } = useAuth();

  // State sidebar standard...
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const storedState = localStorage.getItem(SIDEBAR_STATE_STORAGE_KEY);
      return storedState !== null ? JSON.parse(storedState) : window.innerWidth >= 1024;
    } catch (e) {
      return window.innerWidth >= 1024;
    }
  });

  const isCollapsed = !isOpen;

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STATE_STORAGE_KEY, JSON.stringify(isOpen));
    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { isOpen } }));
  }, [isOpen]);

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

  if (isLoading) return null; // Loading state handled globally usually

  // ==========================================
  // KONFIGURASI MENU FINAL & PROFESIONAL
  // ==========================================
  const mainMenuItems = [
    // 1. DASHBOARD
    // Head HR: Wajib lihat statistik performa tim.
    // Staff HR: Wajib lihat to-do list harian.
    { 
      path: "/hr", 
      label: "Dashboard", 
      icon: House, 
      gradient: "from-[#1e3b5c] to-[#2c5f8d]",
      hoverBg: "hover:from-[#1e3b5c]/20 hover:to-[#2c5f8d]/10",
      allowedRoles: ["head_hr", "staff_hr"] 
    },

    // 2. REQUEST & APPROVAL (Fase Perencanaan)
    // Manager: Request.
    // Head HR: Approve.
    // Staff: Gak boleh ikut campur urusan strategic planning.
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
      allowedRoles: ["head_hr"] // HANYA KEPALA
    },

    // 3. JOB OPENINGS (Lowongan)
    // Head HR: Supervisi (cek staff nulis job desc bener gak).
    // Staff HR: Eksekutor (ngetik & publish).
    { 
      path: "/hr/manage-job-openings", 
      label: "Job Openings", 
      icon: Briefcase, 
      gradient: "from-[#1e3b5c] to-[#2c5f8d]",
      hoverBg: "hover:from-[#1e3b5c]/20 hover:to-[#2c5f8d]/10",
      allowedRoles: ["head_hr", "staff_hr"] 
    },

    // 4. SCREENING (Seleksi CV)
    // Head HR: Audit (cek apakah AI ranking-nya masuk akal).
    // Staff HR: Eksekutor (filter awal).
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
      allowedRoles: ["head_hr", "staff_hr", "manager"] // Semua berhak lihat "Juara"
    },

    // 5. INTERVIEW (Wawancara)
    // Head HR: Bisa ikut interview posisi tinggi (Manager level).
    // Staff HR: Admin jadwal.
    // Manager: Interviewer teknis.
    { 
      path: "/hr/interviews", 
      label: "Interview Process", 
      icon: Users, 
      gradient: "from-[#1e3b5c] to-[#2c5f8d]",
      hoverBg: "hover:from-[#1e3b5c]/20 hover:to-[#2c5f8d]/10",
      allowedRoles: ["head_hr", "staff_hr", "manager"] 
    },
    { 
      path: "/hr/final-scheduling", 
      label: "Final Scheduling", 
      icon: CalendarCheck, 
      gradient: "from-[#1e3b5c] to-[#2c5f8d]",
      hoverBg: "hover:from-[#1e3b5c]/20 hover:to-[#2c5f8d]/10",
      allowedRoles: ["head_hr", "staff_hr"] 
    },

    // 6. DECISION (Keputusan)
    // HANYA KEPALA. Staff gak punya wewenang acc gaji/hired.
    { 
      path: "/hr/final-decision", 
      label: "Final Decision", 
      icon: SealCheck, 
      gradient: "from-[#1e3b5c] to-[#2c5f8d]",
      hoverBg: "hover:from-[#1e3b5c]/20 hover:to-[#2c5f8d]/10",
      allowedRoles: ["head_hr"] // SAKRAL
    },
    { 
      path: "/hr/onboarding", 
      label: "Onboarding", 
      icon: UserPlus, 
      gradient: "from-[#1e3b5c] to-[#2c5f8d]", 
      hoverBg: "hover:from-[#1e3b5c]/20 hover:to-[#2c5f8d]/10",
      allowedRoles: ["head_hr", "staff_hr"] 
    },

    // 7. UTILITIES
    // Calendar & Archive: Head perlu lihat sejarah/history.
    { 
      path: "/hr/event-calendar", 
      label: "HR Calendar", 
      icon: Calendar, 
      gradient: "from-[#1e3b5c] to-[#2c5f8d]",
      hoverBg: "hover:from-[#1e3b5c]/20 hover:to-[#2c5f8d]/10",
      allowedRoles: ["head_hr", "staff_hr"] 
    },
    { 
      path: "/hr/archived", 
      label: "Archives", 
      icon: Archive, 
      gradient: "from-[#1e3b5c] to-[#2c5f8d]",
      hoverBg: "hover:from-[#1e3b5c]/20 hover:to-[#2c5f8d]/10",
      allowedRoles: ["head_hr", "staff_hr"]
    },
    
    // 8. ADMIN
    // Cuma Kepala yang bisa nambah/pecat Staff HR.
    { 
      path: "/hr/manage-users", 
      label: "Staff Management", 
      icon: Gear, 
      gradient: "from-[#1e3b5c] to-[#2c5f8d]",
      hoverBg: "hover:from-[#1e3b5c]/20 hover:to-[#2c5f8d]/10",
      allowedRoles: ["head_hr"] 
    },
  ];

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

  // Filtering Logic
  const userRole = user?.role;
  const filteredMainMenuItems = mainMenuItems.filter(item => 
    item.allowedRoles.includes(userRole)
  );
  const filteredBottomMenuItems = bottomMenuItems.filter(item => 
    item.allowedRoles.includes(userRole)
  );

  // STYLING (Tetap Sama)
  const baseLinkClass = "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl mx-2 transition-all duration-300 ease-in-out group relative overflow-hidden backdrop-blur-sm";
  const getActiveLinkClass = (gradient) => `bg-gradient-to-r ${gradient} text-white shadow-xl shadow-lg`;
  const getInactiveLinkClass = (hoverBg) => `text-slate-300 bg-slate-800/20 hover:bg-gradient-to-r ${hoverBg} hover:text-white hover:shadow-lg hover:scale-105 hover:translate-x-1`;

  const toggleSidebar = () => setIsOpen(!isOpen);
  const handleLogout = () => {
    Notiflix.Confirm.show("Confirm Logout", "Are you sure you want to sign out?", "Yes, Logout", "Cancel", () => logout(), () => {});
  };

  return (
    <div className={`fixed left-0 top-0 bottom-0 z-30 bg-[#002b4e] text-slate-300 transition-all duration-300 ease-in-out border-r border-slate-700/30 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex flex-col h-full overflow-hidden mt-2">
        {/* HEADER */}
        <div className={`flex items-center justify-center flex-shrink-0 relative ${isCollapsed ? 'h-20 py-4' : 'h-20 pt-5 pb-3'} bg-gradient-to-b from-slate-900/20 to-transparent`}>
          {isCollapsed ? (
            <button onClick={toggleSidebar} className="group relative p-1 rounded-full hover:bg-slate-700/20">
              <div className="relative w-12 h-12">
                <img src={logoWhite} alt="Logo" className="w-full h-full object-contain" />
              </div>
            </button>
          ) : (
            <div className="flex flex-col items-center w-full">
               <div className="flex flex-col items-start">
                  <p className="text-[7px] font-semibold tracking-wider mb-0 text-left leading-tight mt-4" style={{ fontFamily: "'Inter', sans-serif", color: '#C72E3A', letterSpacing: '0.12em', fontWeight: 600 }}>HUMAN RESOURCE</p>
                  <h1 className="text-[26px] leading-none tracking-tight mb-0" style={{ fontFamily: "'Inter', sans-serif", background: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    <span style={{ fontWeight: 900 }}>PT TECH</span><span style={{ fontWeight: 300 }}> XYZ</span>
                  </h1>
                  <div className="self-end inline-block px-1.5 py-0.5 bg-white rounded-sm shadow-sm">
                    <p className="text-[6.5px] font-bold tracking-wider leading-tight text-slate-900">Recruitment System</p>
                  </div>
               </div>
            </div>
          )}
          {!isCollapsed && (
            <button onClick={toggleSidebar} className="absolute top-1/4 -translate-y-1/2 mr-2 -right-3 p-1.5 rounded hover:bg-slate-600 text-slate-200 hover:text-white shadow-md z-20">
              <ArrowLineLeft size={18} weight="bold" />
            </button>
          )}
        </div>

        {!isCollapsed && <div className="px-4 py-5"><div className="border-t-2 border-slate-400/50"></div></div>}

        {/* MENU */}
        <nav className={`flex-grow px-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent ${isCollapsed ? 'pt-6' : ''}`}>
          <ul className="space-y-2">
            {filteredMainMenuItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path} title={item.label} className={`${baseLinkClass} ${location.pathname === item.path ? getActiveLinkClass(item.gradient) : getInactiveLinkClass(item.hoverBg)} ${isCollapsed ? 'justify-center' : ''}`}>
                  {location.pathname === item.path && <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-20 blur-xl`}></div>}
                  {item.icon && <item.icon size={22} weight={location.pathname === item.path ? "fill" : "duotone"} className={`flex-shrink-0 ${isCollapsed ? '' : 'mr-3'} transition-all duration-300 relative z-10 ${location.pathname === item.path ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'group-hover:scale-125 group-hover:rotate-12'}`} />}
                  {!isCollapsed && <span className={`relative z-10 ${location.pathname === item.path ? 'font-bold' : 'font-medium'}`}>{item.label}</span>}
                  {!isCollapsed && location.pathname === item.path && <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse relative z-10 shadow-lg"></div>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* BOTTOM */}
        <div className="mt-auto flex-shrink-0">
          {!isCollapsed && <div className="px-4 py-5"><div className="border-t-2 border-slate-400/50"></div></div>}
          <div className={`px-2 ${isCollapsed ? 'pb-4 pt-4' : 'pb-4'}`}>
            <ul className="space-y-2">
              {filteredBottomMenuItems.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} title={item.label} className={`${baseLinkClass} ${location.pathname === item.path ? getActiveLinkClass(item.gradient) : getInactiveLinkClass(item.hoverBg)} ${isCollapsed ? 'justify-center' : ''}`}>
                    {item.icon && <item.icon size={22} weight={location.pathname === item.path ? "fill" : "duotone"} className={`flex-shrink-0 ${isCollapsed ? '' : 'mr-3'} relative z-10`} />}
                    {!isCollapsed && <span className="relative z-10 font-medium">{item.label}</span>}
                  </Link>
                </li>
              ))}
              <li>
                <button onClick={handleLogout} className={`${baseLinkClass} ${getInactiveLinkClass("hover:from-red-700/10 hover:to-red-600/10")} text-red-400 hover:text-red-300 ${isCollapsed ? 'justify-center' : ''}`}>
                  <SignOut size={22} weight="duotone" className={`flex-shrink-0 ${isCollapsed ? '' : 'mr-3'} transition-all duration-300 group-hover:scale-110`} />
                  {!isCollapsed && <span className="font-medium tracking-wide">Logout</span>}
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