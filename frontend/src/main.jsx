// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom"; // Menggunakan alias Router
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";

// --- KONFIGURASI PDF WORKER YANG BENAR ---
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// HAPUS 'import workerSrc from ...?url' JIKA MASIH ADA

// Langsung tunjuk ke file yang ada di folder /public Anda
// Nama file ini ('/pdf.worker.min.mjs') harus sama persis
// dengan file di screenshot Anda.
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
// --- BATAS KONFIGURASI ---


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>
);