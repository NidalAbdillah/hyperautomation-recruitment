import React from "react";
// Placeholder icons still used, can be replaced later
// Anda bisa tambahkan icon spesifik untuk setiap teknologi jika diperlukan
// import { FaBrain, FaCloud, FaBoxes, FaServer, FaNetworkWired, FaShieldAlt, FaRobot, FaChartLine, FaTools, FaLinux, FaWindows } from 'react-icons/fa';

const TechStack = () => {
  // Data teknologi dan tools dengan judul, deskripsi singkat, dan placeholder SVG
  const techItems = [
    {
      title: "Artificial Intelligence / ML",
      description:
        "Eksplorasi dan implementasi algoritma AI/ML untuk analisis data, prediktif, dan solusi cerdas pada infrastruktur.",
      iconSvg: (
        /* Reused AI SVG */ <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2a10 10 0 0 0-2.002 19.59c.001 0 .001 0 0 0l-.002-.001a1 1 0 0 0 .707-1.706 8 8 0 1 1 8.618-10.613 9.92 9.92 0 0 0-4.387 1.176A4.982 4.982 0 0 0 12 10c-2.757 0-5-2.243-5-5 0-.495.08-.975.22-1.428A9.974 9.974 0 0 0 2 12c0 5.514 4.486 10 10 10s10-4.486 10-10A9.987 9.987 0 0 0 12 2zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"></path>
        </svg>
      ),
    },
    {
      title: "Cloud Services",
      description:
        "Merancang, migrasi, implementasi, dan manajemen solusi berbasis cloud (Public/Private/Hybrid).",
      iconSvg: (
        /* Reused Cloud SVG */ <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M18.985 11h-2.761a.5.5 0 0 0-.472.336l-.284.853a.5.5 0 0 1-.472.336h-3.906a.5.5 0 0 1-.472-.336l-.284-.853A.5.5 0 0 0 7.776 11H5.015a.99.99 0 0 0-.774 1.611l4.44 5.291A1 1 0 0 0 9.422 18h5.156a1 1 0 0 0 .741-.389l4.44-5.291A.99.99 0 0 0 18.985 11zm-8.325 4.972-.24-.723a.5.5 0 0 0-.471-.336H7.49l-2.012 2.397a.5.5 0 0 0 .389.8H17.12a.5.5 0 0 0 .389-.8L15.33 15.913H11.42a.5.5 0 0 0-.472.336l-.24.723zm8.58-6.736L16.04 4.941A.99.99 0 0 0 15.266 4H8.734a.99.99 0 0 0-.774.389L5.74 9.236a.99.99 0 0 0-.015.764h13.062a.99.99 0 0 0-.015-.764z"></path>
        </svg>
      ),
    },
    {
      title: "Docker",
      description:
        "Pemanfaatan teknologi kontainer untuk deployment aplikasi yang cepat dan konsisten.",
      iconSvg: (
        /* Container/Box SVG - Reused from previous idea */ <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM8 18H4V6h4v12zm6 0h-4V6h4v12zm6 0h-4V6h4v12z"></path>
        </svg>
      ),
    },
    {
      title: "Kubernetes",
      description:
        "Orkestrasi kontainer untuk manajemen, penskalaan, dan deployment aplikasi yang kompleks.",
      iconSvg: (
        /* Orchestration SVG - Reused infinity/loop concept */ <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 4.012c-4.179 0-7.743 2.695-9.117 6.445L0 11.138V16h4.862l.682-2.045C6.079 11.653 8.781 10 12 10c4.411 0 8 3.589 8 8s-3.589 8-8 8c-3.219 0-5.921-1.653-7.277-4.045L4.18 19.91H0V25l2.883-.683C4.257 28.054 7.821 30.75 12 30.75c6.617 0 12-5.383 12-12s-5.383-12-12-12zm0 14c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"></path>
        </svg>
      ),
    },
    {
      title: "XCP-ng",
      description:
        "Manajemen dan operasional platform virtualisasi server open-source.",
      iconSvg: (
        /* Reused Server SVG */ <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M20 17H4V7h16v10zm0-12H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2z"></path>
          <path d="M18 15h-4v-2h4v2zM6 9h8v2H6z"></path>
        </svg>
      ),
    },
    {
      title: "VMware",
      description:
        "Pengelolaan dan penggunaan solusi virtualisasi server dari VMware.",
      iconSvg: (
        /* Reused Server SVG - or find a different one if needed */ <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M20 17H4V7h16v10zm0-12H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2z"></path>
          <path d="M18 15h-4v-2h4v2zM6 9h8v2H6z"></path>
        </svg>
      ),
    },
    {
      title: "Linux Servers",
      description:
        "Administrasi, konfigurasi, dan pemeliharaan server dengan sistem operasi Linux.",
      iconSvg: (
        /* Reused Server SVG */ <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M20 17H4V7h16v10zm0-12H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2z"></path>
          <path d="M18 15h-4v-2h4v2zM6 9h8v2H6z"></path>
        </svg>
      ),
    },
    {
      title: "Mikrotik",
      description:
        "Konfigurasi, manajemen, dan optimasi perangkat jaringan Mikrotik.",
      iconSvg: (
        /* Reused Network SVG */ <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19 6a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V6zm-5 11h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"></path>
        </svg>
      ),
    },
    {
      title: "Winbox",
      description:
        "Tool GUI untuk administrasi dan konfigurasi perangkat Mikrotik secara mudah.",
      iconSvg: (
        /* Reused Network Tool SVG or Gear SVG */ <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19.479 10.092C19.272 10.034 19.054 10 18.828 10c-.796 0-1.539.179-2.212.49a5.966 5.966 0 0 0-1.116-1.89 5.96 5.96 0 0 0-2.147-1.614C12.842 6.954 12.442 6.9 12 6.9c-.442 0-.842.054-1.353.186a5.96 5.96 0 0 0-2.147 1.614 5.966 5.966 0 0 0-1.116 1.89c-.673-.311-1.416-.49-2.212-.49-.226 0-.444.034-.651.092C2.087 10.693 1 12.594 1 14.728V19h22v-4.272c0-2.134-1.087-4.035-3.521-4.636zM12 17.9c-1.813 0-3.301-1.308-3.667-3h7.334c-.366 1.692-1.854 3-3.667 3zm8-5.172V14h-2v-1.272c0-.347-.028-.689-.08-.1024l-.349-2.102 1.525-.88a1 1 0 0 0 .504-1.368l-1-1.732a1 1 0 0 0-1.368-.504l-1.525.88-.88-1.526a1 1 0 0 0-1.368-.504l-1.732 1a1 1 0 0 0-.504 1.368l.88 1.525-2.102.349c-.335.052-.677.08-.1024.08h-1.272V12H6v2h-.008c-.028 0-.057-.002-.085-.004l-2.102-.349.88-1.525a1 1 0 0 0-.504-1.368l-1.732-1a1 1 0 0 0-1.368.504l-.88 1.526-1.525-.88a1 1 0 0 0-1.368.504l-1 1.732a1 1 0 0 0 .504 1.368l1.525.88-.349 2.102c-.052.335-.08.677-.08 1.024V14H4v-1.272c0-1.841.97-3.464 2.969-4.13C7.614 8.186 8.47 7.9 9.172 7.9c.226 0 .444.034.651.092a4.01 4.01 0 0 1 3.752-2.576 4.01 4.01 0 0 1 3.752 2.576c.207-.058.425-.092.651-.092.702 0 1.558.286 2.203.698C19.03 9.264 20 10.887 20 12.728z"></path>
        </svg>
      ),
    },
    {
      title: "Cyber Security Tools",
      description:
        "Penerapan tool dan praktik untuk analisis kerentanan, proteksi, dan keamanan infrastruktur.",
      iconSvg: (
        /* Reused Shield SVG */ <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.486 2 2 6.486 2 12v4c0 3.86 3.14 7 7 7h6c3.86 0 7-3.14 7-7v-4c0-5.514-4.486-10-10-10zm5 15H7c-2.757 0-5-2.243-5-5v-4c0-4.411 3.589-8 8-8s8 3.589 8 8v4c0 2.757-2.243 5-5 5z"></path>
          <path d="M12 6c-2.206 0-4 1.794-4 4v4h8v-4c0-2.206-1.794-4-4-4z"></path>
        </svg>
      ),
    },
    {
      title: "N8n (Automation)",
      description:
        "Pengembangan dan implementasi workflow otomatisasi untuk berbagai tugas infrastruktur.",
      iconSvg: (
        /* Reused Automation Gear SVG */ <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19.479 10.092C19.272 10.034 19.054 10 18.828 10c-.796 0-1.539.179-2.212.49a5.966 5.966 0 0 0-1.116-1.89 5.96 5.96 0 0 0-2.147-1.614C12.842 6.954 12.442 6.9 12 6.9c-.442 0-.842.054-1.353.186a5.96 5.96 0 0 0-2.147 1.614 5.966 5.966 0 0 0-1.116 1.89c-.673-.311-1.416-.49-2.212-.49-.226 0-.444.034-.651.092C2.087 10.693 1 12.594 1 14.728V19h22v-4.272c0-2.134-1.087-4.035-3.521-4.636zM12 17.9c-1.813 0-3.301-1.308-3.667-3h7.334c-.366 1.692-1.854 3-3.667 3zm8-5.172V14h-2v-1.272c0-.347-.028-.689-.08-.1024l-.349-2.102 1.525-.88a1 1 0 0 0 .504-1.368l-1-1.732a1 1 0 0 0-1.368-.504l-1.525.88-.88-1.526a1 1 0 0 0-1.368-.504l-1.732 1a1 1 0 0 0-.504 1.368l.88 1.525-2.102.349c-.335.052-.677.08-.1024.08h-1.272V12H6v2h-.008c-.028 0-.057-.002-.085-.004l-2.102-.349.88-1.525a1 1 0 0 0-.504-1.368l-1.732-1a1 1 0 0 0-1.368.504l-.88 1.526-1.525-.88a1 1 0 0 0-1.368.504l-1 1.732a1 1 0 0 0 .504 1.368l1.525.88-.349 2.102c-.052.335-.08.677-.08 1.024V14H4v-1.272c0-1.841.97-3.464 2.969-4.13C7.614 8.186 8.47 7.9 9.172 7.9c.226 0 .444.034.651.092a4.01 4.01 0 0 1 3.752-2.576 4.01 4.01 0 0 1 3.752 2.576c.207-.058.425-.092.651-.092.702 0 1.558.286 2.203.698C19.03 9.264 20 10.887 20 12.728z"></path>
        </svg>
      ),
    },
    {
      title: "Grafana",
      description:
        "Visualisasi data monitoring infrastruktur dan pembuatan dashboard informatif.",
      iconSvg: (
        /* Dashboard/Chart SVG - Reused */ <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
          <path d="M13 12h-2V7h2v5z"></path>
          <path d="M15.936 16.941 13 15.205V13h-2v2.795l-2.936 1.736.999 1.73L12 17.205l2.937 1.732z"></path>
        </svg>
      ),
    },
    {
      title: "Prometheus",
      description:
        "Sistem monitoring open-source untuk pengumpulan metrik dan alerting.",
      iconSvg: (
        /* Monitoring/Alert SVG - Can reuse dashboard or shield if no specific icon */ <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
          <path d="M13 12h-2V7h2v5z"></path>
          <path d="M15.936 16.941 13 15.205V13h-2v2.795l-2.936 1.736.999 1.73L12 17.205l2.937 1.732z"></path>
        </svg>
      ),
    },
    // Anda bisa tambahkan item lain di sini
    // {
    //   title: "Nama Tool Lain",
    //   description: "Deskripsi singkat tool tersebut.",
    //   iconSvg: (/* SVG Icon */)
    // },
  ];

  return (
    // Menggunakan gaya kontainer yang mirip dengan sebelumnya
    <div className="bg-gray-100 py-12" id="techstack">
      <section data-aos="zoom-in-down">
        {/* Judul utama */}
        <div className="my-4 py-4">
          <h2 className="my-2 text-center text-3xl text-red-700 uppercase font-bold">
            Teknologi dan Tools Lab Kami
          </h2>
          <div className="flex justify-center">
            {/* Garis bawah */}
            <div className="w-24 border-b-4 border-red-700"></div>
          </div>
          {/* Sub-judul atau deskripsi singkat bagian */}
          <h2 className="mt-4 mx-12 text-center text-xl lg:text-2xl font-semibold text-red-700">
            Eksplorasi dan Implementasi Teknologi Terbaru dalam Infrastruktur
            TI.
          </h2>
        </div>

        {/* Grid kartu teknologi */}
        {/* Padding disesuaikan agar tidak terlalu mepet ke samping */}
        <div
          className="px-4 md:px-8 lg:px-12"
          data-aos="fade-down"
          data-aos-delay="600"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {techItems.map((item, index) => (
              <div
                key={index}
                className="bg-white transition-all ease-in-out duration-400 overflow-hidden text-gray-700 hover:bg-red-700 hover:text-white rounded-lg shadow-2xl p-3 group flex flex-col"
              >
                {/* Menambahkan flex-col dan flex-grow agar deskripsi mengisi ruang dan tombol di bawah */}
                <div className="m-2 text-justify text-sm flex flex-col flex-grow">
                  {/* Icon */}
                  <div className="h-16 flex items-center justify-center text-red-600 group-hover:text-white mb-2">
                    {item.iconSvg}
                  </div>
                  {/* Judul Kartu */}
                  <h3 className="font-semibold my-2 text-xl text-center">
                    {item.title}
                  </h3>
                  {/* Deskripsi */}
                  <p className="text-md font-medium flex-grow">
                    {item.description}
                  </p>
                </div>
                {/* Bagian ini bisa ditambahkan jika ada tombol per kartu */}
                {/* <div className="flex justify-center my-4 mt-auto">
                  <Link to="#" className="text-white bg-red-700 hover:bg-red-600 inline-flex items-center justify-center w-full px-6 py-3 text-lg shadow-xl rounded-xl transition duration-300">
                    Detail
                  </Link>
                </div> */}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TechStack;
