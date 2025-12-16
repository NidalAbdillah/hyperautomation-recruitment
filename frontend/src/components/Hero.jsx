import React from "react";
import { Link } from "react-router-dom";
import NavBar from "./Navbar/NavBar";
import heroImg from "../images/web-dev.svg";

const Hero = () => {
  return (
    <>
      <div className="hero min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100" id="hero">
        <div>
          <NavBar />
        </div>

        <div className="m-auto overflow-hidden mx-4 mt-8 lg:mt-4 p-2 md:p-12 flex flex-col flex-grow" data-aos="zoom-in">
          <div id="hero" className="flex flex-col lg:flex-row py-8 justify-between text-center lg:text-left flex-grow">
            <div className="lg:w-1/2 flex flex-col justify-center" data-aos="zoom-in" data-aos-delay="200">
              {/* Judul dengan warna biru gelap */}
              <h1 className="mb-5 md:text-5xl text-3xl font-bold text-blue-900">
                Selamat Datang di PT Tech XYZ
              </h1>
              {/* Deskripsi singkat */}
              <div className="text-xl font-semibold tracking-tight mb-5 text-gray-700">
                Perusahaan yang bergerak di bidang konstruksi dan sedang bertransformasi menuju solusi berbasis teknologi IT untuk mendukung efisiensi dan inovasi proyek modern.
              </div>
              <div className="mb-4 space-x-0 md:space-x-2 md:mb-8">
                {/* Tombol dengan warna biru gelap */}
                <Link 
                  to="/contact" 
                  className="text-white bg-blue-900 hover:bg-blue-800 inline-flex items-center justify-center w-full px-6 py-3 my-4 text-lg shadow-xl rounded-2xl sm:w-auto sm:mb-0 transition-colors duration-300"
                >
                  Hubungi Kami
                  <svg className="w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </Link>
              </div>
            </div>
            <div className="flex lg:justify-end w-full lg:w-1/2" data-aos="fade-up" data-aos-delay="700">
              <img alt="Ilustrasi Hero" className="rounded-t float-right duration-1000 w-full" src={heroImg} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;