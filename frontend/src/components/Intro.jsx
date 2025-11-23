import React from "react";
// Menggunakan import gambar asli seperti permintaan
import img from "../images/Web-developer.svg";
import { Link } from "react-router-dom";

const Intro = () => {
  return (
    <>
      {/* Perubahan:
        1. Tambahkan 'min-h-screen', 'flex', 'items-center', 'justify-center'.
        2. Hapus 'h-5/6'.
        3. Ganti 'm-auto' menjadi 'mx-auto' agar bekerja dengan max-w-6xl 
           dan flex centering dari parent (walaupun di sini parentnya body/root).
           Atau, kita bisa biarkan 'm-auto' dan lihat hasilnya. Mari kita coba 
           tanpa 'm-auto' dan andalkan 'justify-center'. 'mx-auto' ditambahkan 
           untuk memastikan centering horizontal dengan 'max-w-6xl'.
      */}
      <div
        className="min-h-screen flex items-center justify-center max-w-6xl mx-auto p-2 md:p-12"
        id="about"
      >
        {/* Konten di dalam div ini sekarang akan dipusatkan secara vertikal dan horizontal 
           dalam area setinggi layar, dengan lebar maksimum 6xl */}
        <div
          className="flex flex-col-reverse lg:flex-row py-8 justify-between lg:text-left w-full"
          data-aos="fade-up"
        >
          {/* Menambahkan w-full di sini agar div ini menggunakan lebar yang diizinkan oleh max-w-6xl */}
          <div className="lg:w-1/2 flex flex-col lg:mx-4 justify-center">
            <img alt="Ilustrasi" className="rounded-t float-right" src={img} />
          </div>
          <div
            className="flex-col my-4 text-center lg:text-left lg:my-0 lg:justify-end w-full lg:w-1/2 px-8"
            data-aos="zoom-in"
            data-aos-delay="500"
          >
            <h3 className="text-3xl text-blue-900 font-bold">
              PT Tech XYZ
            </h3>
            <div>
              <p className="my-4 text-0.7xl text-gray-600 font-semibold text-justify">
                PT Tech XYZ adalah perusahaan teknologi end-to-end yang
                mengembangkan solusi perangkat lunak dan infrastruktur digital
                untuk membantu organisasi tumbuh lebih cepat. Kami menggabungkan
                riset, rekayasa produk, dan layanan konsultasi agar klien dapat
                mengadopsi teknologi terbaru secara aman dan terukur.
              </p>
            </div>
            <div>
              <p className="my-3 text-0.7xl text-gray-600 font-semibold text-justify">
                Fokus utama kami mencakup pembangunan aplikasi berbasis cloud,
                orkestrasi data real-time, otomatisasi proses bisnis, serta
                layanan managed service yang memastikan performa sistem tetap
                optimal. Tim multidisiplin PT Tech XYZ siap bermitra dengan Anda
                untuk memetakan kebutuhan dan menghadirkan inovasi bernilai nyata.
              </p>
            </div>
            <Link
              to="/contact"
              className="text-white bg-blue-900 hover:bg-blue-800 inline-flex items-center justify-center w-full px-6 py-2 my-4 text-lg shadow-xl rounded-2xl sm:w-auto sm:mb-0 group"
            >
              Kontak Kami
              <svg
                className="w-4 h-4 ml-1 group-hover: translate-x-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Intro;
