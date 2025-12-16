import React from "react";
import img from "../images/Web-developer.svg";
import { Link } from "react-router-dom";

const Intro = () => {
  return (
    <>
      <div
        className="min-h-screen flex items-center justify-center max-w-6xl mx-auto p-2 md:p-12"
        id="about"
      >
        <div
          className="flex flex-col-reverse lg:flex-row py-8 justify-between lg:text-left w-full"
          data-aos="fade-up"
        >
          <div className="lg:w-1/2 flex flex-col lg:mx-4 justify-center">
            <img alt="Ilustrasi" className="rounded-t float-right" src={img} />
          </div>
          <div
            className="flex-col my-4 text-center lg:text-left lg:my-0 lg:justify-end w-full lg:w-1/2 px-8"
            data-aos="zoom-in"
            data-aos-delay="500"
          >
            <h3 className="text-3xl text-blue-900 font-bold">
              Tentang PT Tech XYZ
            </h3>
            <div>
              <p className="my-4 text-xl text-gray-600 font-semibold text-justify">
                PT Tech XYZ adalah perusahaan yang bergerak di bidang konstruksi 
                dan sedang bertransformasi menuju solusi berbasis teknologi IT. 
                Kami menghadirkan layanan profesional dengan standar kualitas tinggi 
                dan keselamatan yang ketat.
              </p>
            </div>
            <div>
              <p className="my-3 text-xl text-gray-600 font-semibold text-justify">
                Dengan tim profesional berpengalaman dan komitmen terhadap inovasi, 
                kami siap bermitra dengan Anda untuk menghadirkan solusi terbaik 
                yang menggabungkan keahlian konstruksi dengan teknologi modern.
              </p>
            </div>
            <Link
              to="/contact"
              className="text-white bg-blue-900 hover:bg-blue-800 inline-flex items-center justify-center w-full px-6 py-2 my-4 text-lg shadow-xl rounded-2xl sm:w-auto sm:mb-0 group transition-colors duration-300"
            >
              Kontak Kami
              <svg
                className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform duration-300"
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