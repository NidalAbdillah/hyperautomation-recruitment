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
            <h3 className="text-3xl text-red-700 font-bold">
              Infrastructure Service Research Laboratory
            </h3>
            <div>
              <p className="my-4 text-0.7xl text-gray-600 font-semibold text-justify">
                Infrastructure Service Research Laboratory (ISR Lab) Telkom
                berfokus pada riset dan analisis mendalam terhadap layanan
                infrastruktur TI. Kami menyusun studi dan laporan komprehensif
                untuk mendorong inovasi dan pengambilan keputusan strategis di
                bidang infrastruktur digital.
              </p>
            </div>
            <div>
              <p className="my-3 text-0.7xl text-gray-600 font-semibold text-justify">
                Aktivitas inti kami mencakup pengelolaan dan pemeliharaan sistem
                jaringan, administrasi dan pemantauan kinerja server,
                implementasi solusi cloud computing canggih, serta mengembangkan
                otomatisasi proses untuk meningkatkan efisiensi dan keandalan
                operasional infrastruktur Telkom.
              </p>
            </div>
            <Link
              to="/contact"
              className="text-white bg-red-700 hover:bg-red-600 inline-flex items-center justify-center w-full px-6 py-2 my-4 text-lg shadow-xl rounded-2xl sm:w-auto sm:mb-0 group"
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
