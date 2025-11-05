// src/pages/Admins/DashboardAdmin.jsx
import React, { useEffect, useState } from "react";
import axios from "axios"; // Import axios untuk melakukan panggilan API
import Notiflix from "notiflix"; // Import Notiflix untuk notifikasi

// Import komponen widget
import DashboardWidget from "../../components/hr/DashboardWidget"; // Pastikan path benar

// Import komponen chart dari react-chartjs-2
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title as ChartTitle } from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

// Import moment.js untuk memformat tanggal (jika belum terinstal, jalankan npm install moment atau yarn add moment)
import moment from "moment";
// Pastikan moment.js sudah terinstal di frontend Anda

// Register elemen Chart.js yang dibutuhkan
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, ChartTitle);

// --- URL API Backend (Ganti dengan URL Asli Anda) ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_DASHBOARD_SUMMARY = `${API_BASE_URL}/api/hr/dashboard/summary`; // Endpoint untuk statistik widget
const API_DASHBOARD_RECENT_APPLICATIONS = `${API_BASE_URL}/api/hr/dashboard/recent-applications?limit=5`; // Endpoint untuk aplikasi terbaru (limit 5 data terbaru)
const API_DASHBOARD_CHARTS = `${API_BASE_URL}/api/hr/dashboard/charts`; // Endpoint untuk data chart
// --- End URL API ---

// Helper function to get JWT token from storage
const getAuthToken = () => {
  return localStorage.getItem("token"); // <-- Sesuaikan jika kunci token Anda berbeda
};

// Helper function untuk memformat tanggal agar lebih mudah dibaca (misal: DD/MM/YYYY)
const formatDisplayDate = (isoString) => {
  if (!isoString) return "-";
  // Gunakan moment.js untuk parsing dan format tanggal
  // moment() akan mengembalikan 'Invalid date' jika isoString tidak valid, jadi tidak perlu cek isNaN
  return moment(isoString).format("DD/MM/YYYY");
};

function DashboardAdmin() {
  // State untuk menampung seluruh data dashboard yang diambil dari API
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true); // State untuk indikator loading
  const [error, setError] = useState(null); // State untuk error handling

  // Effect hook untuk mengambil data saat komponen dimuat
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null); // Reset error state

      try {
        const token = getAuthToken(); // Ambil token otentikasi
        if (!token) {
          // Handle case where token is missing (user not logged in)
          const authError = new Error("User not authenticated. Token missing.");
          authError.response = {
            status: 401,
            data: {
              message: "Sesi Anda telah berakhir. Silakan login kembali.",
              redirect: "/login",
            },
          };
          throw authError;
        }

        const headers = {
          Authorization: `Bearer ${token}`, // Tambahkan token ke header
        };

        // Lakukan panggilan API secara paralel menggunakan Promise.all
        const [statsResponse, recentAppsResponse, chartsResponse] = await Promise.all([axios.get(API_DASHBOARD_SUMMARY, { headers }), axios.get(API_DASHBOARD_RECENT_APPLICATIONS, { headers }), axios.get(API_DASHBOARD_CHARTS, { headers })]);

        console.log("Dashboard Stats API Response:", statsResponse.data);
        console.log("Dashboard Recent Apps API Response:", recentAppsResponse.data);
        console.log("Dashboard Charts API Response:", chartsResponse.data);

        // Gabungkan data dari API
        // Sesuaikan struktur ini dengan format respons API backend Anda
        const fetchedData = {
          // Data statistik dari respons summary API
          // Sesuaikan key di sini ('totalCvCount', dll.) dengan key dari respons backend Anda
          stats: {
            totalCvCount: statsResponse.data.totalCvCount,
            newCvLast24Hours: statsResponse.data.newCvLast24Hours,
            activePositionsCount: statsResponse.data.activePositionsCount,
            needReviewCount: statsResponse.data.needReviewCount,
            acceptedCvCount: statsResponse.data.acceptedCvCount,
            rejectedCvCount: statsResponse.data.rejectedCvCount,
            // Metrik Shortlisted tidak dimasukkan ke widget
          },

          // Data aplikasi terbaru langsung dari respons API (asumsi respons adalah array)
          recentApplications: recentAppsResponse.data || [],

          // Data chart dari respons charts API
          // Sesuaikan key di sini ('statusDistribution', 'weeklySubmissionTrend')
          // dengan key dari respons backend Anda
          chartsData: {
            statusDistribution: chartsResponse.data.statusDistribution || {},
            weeklySubmissionTrend: chartsResponse.data.weeklySubmissionTrend || [],
          },
        };

        setDashboardData(fetchedData); // Update state dengan data dari API
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err); // Set error state
        if (err.response && err.response.status === 401) {
          Notiflix.Report.warning(
            "Sesi Habis",
            err.response.data.message || "Sesi Anda telah berakhir. Silakan login kembali.",
            "Okay"
            // TODO: Tambahkan logika redirect ke halaman login di sini jika perlu
            // () => { window.location.href = err.response.data.redirect || '/login'; }
          );
        } else {
          Notiflix.Report.failure("Gagal Memuat Data", err.response?.data?.message || "Terjadi kesalahan saat memuat data dashboard.", "Okay");
        }
      } finally {
        setLoading(false); // Set loading menjadi false setelah selesai (berhasil atau gagal)
      }
    };

    fetchDashboardData(); // Panggil fungsi fetch data saat komponen dimuat
  }, []); // Array kosong berarti efek ini hanya berjalan sekali saat mount

  // Tampilkan pesan loading saat data sedang diambil
  if (loading) {
    return <div className="text-center p-8 text-gray-600">Memuat data dashboard...</div>;
  }

  // Tampilkan pesan error jika gagal mengambil data dan tidak ada data sebelumnya
  if (error && !dashboardData) {
    return <div className="text-center p-8 text-red-600">Gagal memuat data dashboard: {error.message}</div>;
  }

  // Jika data sudah berhasil diambil atau ada data sebelumnya meskipun ada error saat update
  // Gunakan data dari state dashboardData atau fallback ke struktur kosong jika null
  const currentDashboardData = dashboardData || {
    stats: {}, // Fallback ke objek kosong
    recentApplications: [], // Fallback ke array kosong
    chartsData: {
      // Fallback untuk chart
      statusDistribution: {},
      weeklySubmissionTrend: [],
    },
  };

  // Mapping data statistik dari objek respons API ke format array untuk widget
  // Hanya sertakan widget yang diinginkan (tanpa Shortlisted)
  // Sesuaikan key di sini ('totalCvCount', dll.) dengan key dari respons backend Anda
  const formattedStats = [
    {
      id: "totalCv",
      title: "Total CV Masuk",
      value: currentDashboardData.stats.totalCvCount,
      type: "totalCv",
      trendText: "",
      trendColor: "gray",
    },
    {
      id: "newCv",
      title: "CV Baru 24 Jam Terakhir",
      value: currentDashboardData.stats.newCvLast24Hours,
      type: "newCv",
      trendText: "",
      trendColor: "gray",
    },
    {
      id: "activePositions",
      title: "Lowongan Aktif",
      value: currentDashboardData.stats.activePositionsCount,
      type: "activePositions",
      trendText: "",
      trendColor: "gray",
    },
    {
      id: "needReview",
      title: "CV Perlu Ditinjau",
      value: currentDashboardData.stats.needReviewCount,
      type: "needReview",
      trendText: "",
      trendColor: "red",
    },
    {
      id: "totalAccepted",
      title: "Total Accepted",
      value: currentDashboardData.stats.acceptedCvCount,
      type: "totalAccepted",
      trendText: "",
      trendColor: "green",
    },
    {
      id: "totalRejected",
      title: "Total Rejected",
      value: currentDashboardData.stats.rejectedCvCount,
      type: "totalRejected",
      trendText: "",
      trendColor: "red",
    },
    // Filter widget jika nilainya undefined atau null
  ].filter((stat) => stat.value !== undefined && stat.value !== null);

  // Data untuk Doughnut Chart (Distribusi Status)
  // Ambil data dari respons API chartsData.statusDistribution
  // Hanya sertakan status yang diinginkan: Submitted, Reviewed, Accepted, Rejected
  const desiredStatuses = ["Submitted", "Reviewed", "Accepted", "Rejected"];
  const filteredStatusDistribution = Object.fromEntries(
    Object.entries(currentDashboardData.chartsData.statusDistribution || {})
      // Mengubah callback filter agar hanya menerima 'status'
      .filter(([status]) => desiredStatuses.includes(status)) // Filter hanya status yang diinginkan
  );

  // Urutkan status yang difilter sesuai desiredStatuses untuk memastikan urutan warna
  const sortedFilteredStatusDistribution = Object.keys(filteredStatusDistribution)
    .sort((a, b) => desiredStatuses.indexOf(a) - desiredStatuses.indexOf(b))
    .reduce((obj, key) => {
      obj[key] = filteredStatusDistribution[key];
      return obj;
    }, {});

  const doughnutChartData = {
    labels: Object.keys(sortedFilteredStatusDistribution), // Label dari key objek yang sudah diurutkan
    datasets: [
      {
        label: "# of Applications",
        data: Object.values(sortedFilteredStatusDistribution), // Data dari value objek yang sudah diurutkan
        backgroundColor: [
          // Sesuaikan warna dengan status yang ada di backend dan urutan di desiredStatuses
          // Urutan warna: Submitted (Biru), Reviewed (Kuning), Accepted (Hijau), Rejected (Merah)
          "rgba(0, 123, 255, 0.6)", // Submitted (Biru)
          "rgba(255, 193, 7, 0.6)", // Reviewed (Kuning)
          "rgba(40, 167, 69, 0.6)", // Accepted (Hijau)
          "rgba(220, 53, 69, 0.6)", // Rejected (Merah)
        ].slice(0, Object.keys(sortedFilteredStatusDistribution).length), // Pastikan jumlah warna sesuai jumlah status yang ditampilkan
        borderColor: "#ffffff", // Border putih antar segmen
        borderWidth: 2,
      },
    ],
  };

  // Data untuk Line Chart (Tren Penerimaan CV)
  // Ambil label (tanggal) dan data (count) dari respons API chartsData.weeklySubmissionTrend
  const lineChartData = {
    labels: (currentDashboardData.chartsData.weeklySubmissionTrend || []).map((item) => formatDisplayDate(item.date)), // Label dari tanggal, format
    datasets: [
      {
        label: "CV Masuk (7 Hari Terakhir)", // Ganti label sesuai periode
        data: (currentDashboardData.chartsData.weeklySubmissionTrend || []).map((item) => item.count), // Data dari count
        borderColor: "#ef4444", // Warna garis merah Telkom
        backgroundColor: "rgba(239, 68, 68, 0.5)", // Warna area di bawah garis
        fill: true,
        tension: 0.3, // Membuat garis sedikit melengkung
      },
    ],
  };

  // Opsi untuk chart Doughnut
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false, // Penting jika ingin mengontrol ukuran dengan parent container
    plugins: {
      legend: {
        position: "bottom", // Posisikan legend di bawah chart
      },
      title: {
        display: true,
        text: "Distribusi Status Aplikasi", // Ganti judul
        font: {
          size: 16,
        },
      },
      tooltip: {
        // Opsi tooltip standar
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + "%" : "0%";
            return `${label}: ${value} (${percentage})`;
          },
        },
      },
    },
  };

  // Opsi untuk chart Line
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false, // Penting jika ingin mengontrol ukuran dengan parent container
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Tren Aplikasi Masuk (7 Hari Terakhir)", // Ganti judul
        font: {
          size: 16,
        },
      },
    },
    scales: {
      // Opsi untuk sumbu X dan Y
      x: {
        title: {
          display: false, // Sembunyikan judul sumbu X jika label sudah jelas
          text: "Tanggal", // Ganti judul sumbu X
        },
        type: "category", // Pastikan sumbu X diperlakukan sebagai kategori jika labelnya string tanggal
      },
      y: {
        title: {
          display: true,
          text: "Jumlah Aplikasi Masuk", // Ganti judul sumbu Y
        },
        beginAtZero: true, // Mulai sumbu Y dari 0
        // Pastikan nilai di sumbu Y adalah integer jika jumlah aplikasi selalu integer
        ticks: {
          stepSize: 1, // Langkah 1 unit di sumbu Y
          callback: function (value) {
            if (value % 1 === 0) {
              return value;
            }
          }, // Tampilkan hanya nilai integer
        },
      },
    },
  };

  return (
    <div className="dashboard-page-container p-4 ">
      {" "}
      {/* Tambahkan padding */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-14">Dashboard </h2> {/* Ganti judul */}
      {/* Widget Statistik */}
      {/* Sesuaikan grid jika jumlah widget berubah */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {" "}
        {/* Menggunakan grid 6 kolom untuk 6 widget */}
        {formattedStats.length > 0 ? (
          formattedStats.map((stat) => (
            <DashboardWidget
              key={stat.id}
              title={stat.title}
              value={stat.value}
              type={stat.type} // Gunakan type untuk memilih ikon
              trendText={stat.trendText}
              trendColor={stat.trendColor}
            />
          ))
        ) : (
          // Tampilkan pesan jika data statistik tidak tersedia
          <div className="col-span-full text-center text-gray-500">Data statistik tidak tersedia atau sedang dimuat.</div>
        )}
      </div>
      {/* Grafik Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Grafik Distribusi Status CV */}
        <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
          {/* Atur ukuran container chart jika maintainAspectRatio: false */}
          <div className="relative h-64 w-full md:h-80">
            {/* Render chart hanya jika data ada */}
            {doughnutChartData.datasets[0].data.length > 0 ? <Doughnut data={doughnutChartData} options={doughnutOptions} /> : <div className="text-center text-gray-500">Data chart distribusi status tidak tersedia.</div>}
          </div>
        </div>

        {/* Grafik Tren Penerimaan CV */}
        <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
          {/* Atur ukuran container chart jika maintainAspectRatio: false */}
          <div className="relative h-64 w-full md:h-80">
            {/* Render chart hanya jika data ada */}
            {lineChartData.datasets[0].data.length > 0 ? <Line data={lineChartData} options={lineOptions} /> : <div className="text-center text-gray-500">Data chart tren tidak tersedia.</div>}
          </div>
        </div>
      </div>
      {/* Daftar Aplikasi Terbaru */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Applications</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Applied</th>
                {/* Kolom Actions dihapus sesuai permintaan */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Render aplikasi terbaru menggunakan data dari API */}
              {currentDashboardData.recentApplications.length > 0 ? (
                currentDashboardData.recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    {" "}
                    {/* Pastikan data dari API memiliki ID unik */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {app.fullName} {/* Sesuaikan dengan nama field dari API */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.qualification} {/* Sesuaikan dengan nama field dari API */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {/* Badge status - Sesuaikan kelas berdasarkan app.status dari API */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          // Menggunakan warna badge yang sesuai dengan permintaan chart
                          app.status === "Submitted"
                            ? "bg-blue-100 text-blue-800" // Submitted: Biru
                            : app.status === "Reviewed"
                            ? "bg-yellow-100 text-yellow-800" // Reviewed: Kuning
                            : app.status === "Accepted"
                            ? "bg-green-100 text-green-800" // Accepted: Hijau
                            : app.status === "Rejected"
                            ? "bg-red-100 text-red-800" // Rejected: Merah
                            : // Status Shortlisted tidak ada di badge karena tidak di widget
                              "bg-gray-100 text-gray-800" // Default
                        }`}
                      >
                        {app.status} {/* Sesuaikan dengan nama field dari API */}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {/* Format tanggal dari API */}
                      {formatDisplayDate(app.createdAt)} {/* Sesuaikan dengan nama field tanggal dari API */}
                    </td>
                    {/* Kolom Actions dihapus */}
                  </tr>
                ))
              ) : (
                <tr>
                  {/* Colspan harus sesuai jumlah kolom (4) */}
                  <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    Tidak ada aplikasi terbaru.
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
