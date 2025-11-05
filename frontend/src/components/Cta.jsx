import React from "react";
import { Link } from "react-router-dom";

const Cta = () => {
  return (
    <div className="w-full flex items-center justify-center text-white cta">
      <div className="mx-8 w-full h-96 text-center lg:text-left py-16 px-12 flex lg:justify-between items-center">
        <div className="w-full flex flex-col lg:flex-row lg:justify-around">
          <div className="mb-4">
            {/* Mengubah teks ajakan utama */}
            <p className="text-2xl md:text-4xl font-bold mb-4">
              Tertarik berkontribusi dalam inovasi infrastruktur digital Telkom?
            </p>
            {/* Mengubah teks ajakan tambahan */}
            <p className="text-lg md:text-2xl">
              Kembangkan keahlian Anda di lingkungan riset ISR Lab yang dinamis.
            </p>
          </div>

          <div className="w-full lg:w-72 pt-6 lg:mx-12 flex items-center justify-center lg:justify-start">
            {" "}
            {/* Menyesuaikan perataan tombol */}
            {/* Mengubah teks tombol dan warnanya menjadi merah */}
            <Link
              to="/applycv"
              className="bg-red-700 hover:bg-red-600 text-white justify-center text-center rounded-lg px-10 py-3 flex items-center group transition duration-300"
            >
              {" "}
              {/* Mengubah warna bg dan hover bg, menambah transition */}
              Kirim CV Anda!
              <svg
                className="w-5 h-5 ml-1 group-hover:translate-x-2 duration-500 ease-in"
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
    </div>
  );
};

export default Cta;
