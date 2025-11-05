import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import coolBackgroundImage from "../images/telkom-bg-3.png";
import loginVisualElement from "../images/telkom-bg-1.png";

// Import ikon mata dari Heroicons
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import { useAuth } from "../context/AuthContext";
import Notiflix from "notiflix"; // <-- Import Notiflix

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const REMEMBER_ME_STORAGE_KEY = "rememberMeLogin";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { login: loginContext } = useAuth();

  // (useEffect Anda untuk 'rememberMe' sudah benar, tidak diubah)
  useEffect(() => {
    const savedRememberMe = localStorage.getItem(REMEMBER_ME_STORAGE_KEY);
    if (savedRememberMe !== null) {
      setRememberMe(JSON.parse(savedRememberMe));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(REMEMBER_ME_STORAGE_KEY, JSON.stringify(rememberMe));
  }, [rememberMe]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError("Email dan password harus diisi!");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Panggil API (Ini sudah benar, menggunakan /api/auth/login)
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
        rememberMe,
      });

      if (response.status === 200) {
        // 2. Dapatkan token DAN user (Ini sudah benar)
        const { token, user } = response.data;
        
        // 3. Simpan sesi ke Context (Ini sudah benar)
        loginContext(user, token);
        console.log("Login successful:", user);

        // --- 4. PERBAIKAN UTAMA DI SINI ---
        
        // Cek 'role' (peran) dari 'user' yang dikembalikan oleh backend TS OOP Anda
        if (user.role === 'head_hr' || user.role === 'staff_hr' || user.role === 'manager') {
          // Jika ini adalah user internal, "lempar" (redirect) ke dashboard /hr
          console.log(`Role ${user.role} terdeteksi, mengarahkan ke /hr`);
          navigate("/hr"); // <-- PERBAIKAN 1: Diubah dari "/admin"
        } else {
          // Fallback jika ada role lain (misal 'pelamar' di masa depan)
          console.log(`Role ${user.role} terdeteksi, mengarahkan ke /`);
          navigate("/");
        }
        // --- BATAS PERBAIKAN ---

      } else {
        // (Logika error Anda sudah bagus)
        console.warn("Login failed with unexpected status:", response.status, response.data);
        setError(response.data.message || "Login gagal. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error during login request:", error);
      const errorMessage = error.response?.data?.message || "Login gagal. Periksa kredensial Anda.";
      
      // PERBAIKAN: Gunakan Notiflix untuk error (lebih konsisten)
      Notiflix.Report.failure("Login Gagal", errorMessage, "Okay");
      setError(errorMessage); // Tetap set error di state
      
    } finally {
      setIsLoading(false);
    }
  };

  // Handler untuk toggle password (Sudah benar)
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen w-full bg-cover bg-center" style={{ backgroundImage: `url(${coolBackgroundImage})` }}>
      <div className="flex items-center justify-center min-h-screen py-10">
        <div className="flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden bg-white max-w-2xl w-full mx-4 min-h-[600px]">
          {/* Bagian Kiri (Gambar) */}
          <div
            className="w-full md:w-1/2 bg-cover bg-center relative"
            style={{
              backgroundImage: `url(${loginVisualElement})`,
              minHeight: "300px",
            }}
          ></div>

          {/* Bagian Kanan (Form) */}
          <div className="w-full md:w-1/2 p-6 md:px-8 lg:px-10 py-8 flex flex-col justify-center">
            <div className="mb-6 text-center">
              <h1 className="font-bold text-gray-800 text-2xl md:text-3xl mb-1">Sign In</h1>
              <p className="text-gray-600 text-md">Access your account</p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              {/* Input Email */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                  Email Address
                </label>
                <input
                  id="email" name="email" type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline text-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Input Password */}
              <div className="mb-6">
                <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password" name="password"
                    type={showPassword ? "text" : "password"} // Type di-toggle
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline text-sm pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 hover:text-red-700 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <EyeIcon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me Checkbox */}
              <div className="flex justify-between items-center mb-6 text-sm">
                <div className="flex items-center">
                  <input type="checkbox" id="rememberMe" name="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="form-checkbox h-4 w-4 text-red-700 rounded focus:ring-red-700" />
                  <label htmlFor="rememberMe" className="ml-2 text-gray-700">
                    Remember me
                  </label>
                </div>
              </div>

              {/* Tombol Submit */}
              <div className="mt-6">
                <button
                  type="submit"
                  className={`flex items-center justify-center w-full px-4 py-3 rounded-lg shadow-xl text-white bg-red-700 font-bold transition ease-in-out duration-300 ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-800"}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C4.477 0 0 4.477 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2-2.647z"></path>
                    </svg>
                  ) : (
                    <span className="mr-2">Sign In</span>
                  )}
                  {!isLoading && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Footer text */}
              <div className="mt-8 text-center text-gray-600 text-sm">
                <p className="mb-2">© 2025 InfraServiceResearch. All rights reserved.</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;