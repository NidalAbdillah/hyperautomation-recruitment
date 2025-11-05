// src/pages/hr/InterviewSchedulePage.jsx
import React from 'react';

// --- PERBAIKAN DI SINI ---
// 1. Ubah library import dari '@heroicons/react/24/outline'
// 2. Ubah nama ikon dari 'CalendarCheckIcon' menjadi 'CalendarCheck' (sesuai Phosphor)
import { CalendarCheck } from '@phosphor-icons/react';
// --- BATAS PERBAIKAN ---

/**
 * Halaman Placeholder untuk 'Interview Schedule' (Jadwal Wawancara).
 * Halaman ini akan digunakan oleh 'staff_hr', 'head_hr', dan 'manager'.
 */
function InterviewSchedulePage() {
  return (
    <div className="interview-schedule-page-container p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Jadwal Wawancara (Interview Schedule)</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
        <div className="flex items-center">
          {/* PERBAIKAN: Gunakan nama komponen yang benar */}
          <CalendarCheck className="h-8 w-8 text-green-500 mr-3" weight="duotone" />
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Halaman Dalam Pengembangan</h3>
            <p className="text-gray-600 mt-1">
              Ini adalah halaman di mana 'Staff HR' dapat menjadwalkan wawancara
              dan semua Aktor (termasuk 'Manager') dapat melihat daftar kandidat
              yang statusnya "Interview_Scheduled" (Wawancara Terjadwal).
            </p>
          </div>
        </div>
      </div>

      {/* TODO (Untuk Nanti):
        1. Buat useEffect() untuk memanggil API 'GET /api/hr/applications'.
        2. Filter data untuk HANYA menampilkan yang 'status: "Interview_Scheduled"' atau "Siap Dijadwalkan".
        3. Tampilkan dalam tabel (Kandidat, Posisi, Tanggal Wawancara, Link Meet).
        4. (Untuk 'staff_hr'): Tambahkan tombol/modal untuk memanggil 'emailService.sendChatInterviewInvite'.
      */}
    </div>
  );
}

export default InterviewSchedulePage;