// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// 1. Buat Context
const AuthContext = createContext(null);

// Hook kustom untuk memudahkan penggunaan context
export const useAuth = () => useContext(AuthContext);

// 2. Buat Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Penting: state loading

  const navigate = useNavigate();
  const location = useLocation(); // Untuk mengetahui dari mana redirect berasal

  // 3. Cek status login awal saat aplikasi dimuat (Logika Anda sudah benar)
  useEffect(() => {
    const checkAuth = async () => {
      console.log("AuthContext: Checking initial login status...");
      setIsLoading(true); 

      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData);

            // TODO (Opsional): Validasi token dengan API di sini jika perlu
            // const isValid = await validateTokenWithAPI(token);
            // if (!isValid) throw new Error("Token tidak valid");

            setUser(parsedUser);
            setIsLoggedIn(true);
            console.log("AuthContext: User found in Local Storage. Logged in:", parsedUser.email);
          } catch (error) {
            console.error("AuthContext: Error validating auth data:", error);
            // Hapus data yang rusak
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            setIsLoggedIn(false);
          }
        } else {
          console.log("AuthContext: No valid auth data found. Not logged in.");
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("AuthContext: Unexpected error during auth check:", error);
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false); // Selalu set loading ke false setelah proses selesai
      }
    };

    checkAuth();
  }, []); // <-- Dependensi kosong ini sudah benar

  // 4. Fungsi untuk proses login (INI YANG DIPERBAIKI)
  const login = (userData, token) => {
    console.log("AuthContext: User logging in:", userData.email);

    // Simpan ke localStorage (Logika Anda sudah benar)
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    // Update state (Logika Anda sudah benar)
    setUser(userData);
    setIsLoggedIn(true);

    // --- PERBAIKAN "ANTI-CHALLENGE" (ANTI-BANTAH) DI SINI ---

    // Cek 'role' (peran) dari 'userData' (yang dari backend TS OOP Anda)
    if (userData.role === 'head_hr' || userData.role === 'staff_hr' || userData.role === 'manager') {
      
      // Jika ini user internal, "lempar" (redirect) ke dashboard /hr
      console.log(`AuthContext: Role ${userData.role} terdeteksi, mengarahkan ke /hr`);
      
      // Cek apakah user mencoba mengakses halaman lain sebelum login
      const redirectPath = location.state?.from?.pathname;

      // Jika ya, lempar ke sana (misal /hr/manage-users). 
      // Jika tidak (datang langsung ke /login), lempar ke /hr.
      navigate(redirectPath || "/hr", { replace: true }); 

    } else {
      // Fallback (Jaga-jaga jika ada role 'Pelamar' di masa depan)
      console.log(`AuthContext: Role ${userData.role} terdeteksi, mengarahkan ke /`);
      navigate("/", { replace: true });
    }
    // --- BATAS PERBAIKAN ---
  };

  // 5. Fungsi untuk proses logout (Logika Anda sudah benar)
  const logout = () => {
    console.log("AuthContext: User logging out:", user?.email);

    // Hapus dari localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Update state
    setUser(null);
    setIsLoggedIn(false);

    // Redirect ke login
    navigate("/login");
  };

  // 6. Nilai yang akan disediakan oleh Context (Sudah benar)
  const contextValue = {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
  };

  // 7. Provider (Sudah benar)
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider; // (Ini 'export default', jadi 'import AuthProvider from ...' sudah benar)