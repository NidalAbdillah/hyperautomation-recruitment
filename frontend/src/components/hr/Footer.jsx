// src/components/Admins/FooterAdmins.jsx
import React, { useState, useEffect } from "react";

function FooterAdmins() {
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

  // Listen untuk perubahan sidebar
  useEffect(() => {
    const handleSidebarToggle = (e) => {
      setSidebarWidth(e.detail.isOpen ? 'ml-64' : 'ml-20');
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle);
  }, []);

  return (
<footer
  className={`
    fixed bottom-0 right-0 z-20
    bg-white text-gray-600 py-4 text-center text-sm border-t border-gray-200
    transition-all duration-300
    ${sidebarWidth === 'ml-64' ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-20 w-[calc(100%-5rem)]'}
  `}
>
  <p>
    © {new Date().getFullYear()} HR Tech - Recruitment Management System. All Rights Reserved.
  </p>
</footer>

  );
}

export default FooterAdmins;