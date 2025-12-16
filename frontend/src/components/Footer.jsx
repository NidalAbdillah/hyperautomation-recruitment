import React from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

// 1. IMPORT GAMBAR DI SINI
// path: keluar dari components (..), masuk images, ambil footer.svg
import footerImg from "../images/footer.svg"; 

const Footer = () => {
  return (
    <>
      <footer>
        <div 
          className="footer max-w-full mx-auto px-4 sm:px-6 bg-gray-100 border-t border-b py-30"
          // 2. TAMBAHKAN STYLE INI
          style={{
             backgroundImage: `url(${footerImg})`,
             backgroundRepeat: 'no-repeat',
             backgroundSize: 'cover', // atau 'contain' tergantung kebutuhan
             backgroundPosition: 'center'
          }}
        >
          <div className="grid sm:grid-cols-12 gap-5 py-8 md:py-12 border-t border-gray-200 lg:ml-11">
            
            {/* ... (Sisa kode kamu ke bawah tetap sama, tidak perlu diubah) ... */}
            
            <div className="col-span-12 lg:col-span-4">
              <div className="box-border border-b-4 border-blue-900 p-8 bg-white text-gray-600 text-center rounded-lg xl:w-80 mx-auto">
                <h3 className="font-bold text-2xl mb-4 text-blue-900">PT Tech XYZ</h3>
                <div className="text-md font-medium text-gray-600 text-left">
                  <h5>PT Tech XYZ</h5>
                  <p>Jl. Cimahi no 123</p>
                  <p>Kecamatan Cimahi,</p>
                  <p>Kota Cimahi, Jawa Barat,</p>
                  <p>Indonesia.</p>
                </div>
              </div>
            </div>

            {/* Bagian Links */}
            <div className="col-span-6 md:col-span-6 lg:col-span-1 ml-7 mx-auto">
              <h6 className="text-blue-900 text-xl font-bold mb-4">LINKS</h6>
              <ul className="text-md">
                <li className="mb-2">
                  <HashLink smooth to="/#about" className="text-gray-600 hover:text-blue-900 hover:tracking-wider transition duration-250 ease-in-out">
                    Tentang Kami
                  </HashLink>
                </li>
                <li className="mb-2">
                  <HashLink smooth to="/#services" className="text-gray-600 hover:text-blue-900 hover:tracking-wider transition duration-250 ease-in-out">
                    Layanan
                  </HashLink>
                </li>
                <li className="mb-2">
                  <HashLink smooth to="/#techstack" className="text-gray-600 hover:text-blue-900 hover:tracking-wider transition duration-250 ease-in-out">
                    Teknologi
                  </HashLink>
                </li>
                <li className="mb-2">
                  <Link to="/contact" className="text-gray-600 hover:text-blue-900 hover:tracking-wider transition duration-250 ease-in-out">
                    Kontak
                  </Link>
                </li>
              </ul>
            </div>

            {/* Bagian Layanan Kami */}
            <div className="col-span-6 md:col-span-6 lg:col-span-4 mx-auto">
              <h6 className="text-blue-900 text-xl font-bold mb-4">LAYANAN KAMI</h6>
              <ul className="text-md">
                <li className="mb-2">
                  <HashLink smooth to="/#services" className="text-gray-600 hover:text-blue-900 hover:tracking-wider transition duration-250 ease-in-out">
                    Konsultasi IT & Digitalisasi
                  </HashLink>
                </li>
                <li className="mb-2">
                  <HashLink smooth to="/#services" className="text-gray-600 hover:text-blue-900 hover:tracking-wider transition duration-250 ease-in-out">
                    Pengembangan Aplikasi
                  </HashLink>
                </li>
                <li className="mb-2">
                  <HashLink smooth to="/#services" className="text-gray-600 hover:text-blue-900 hover:tracking-wider transition duration-250 ease-in-out">
                    Cloud Infrastructure
                  </HashLink>
                </li>
                <li className="mb-2">
                  <HashLink smooth to="/#services" className="text-gray-600 hover:text-blue-900 hover:tracking-wider transition duration-250 ease-in-out">
                    Konstruksi Gedung & Infrastruktur
                  </HashLink>
                </li>
              </ul>
            </div>

            {/* Bagian Social Media Links */}
            <div className="col-span-12 text-center mx-auto lg:col-span-3 font-bold uppercase text-blue-900">
              <div className="text-xl mb-6 text-blue-900">Media Sosial Kami</div>

              <div className="text-md font-medium mb-6">Ikuti kami di media sosial.</div>
              <div className="mx-auto text-center mt-2">
                <ul className="flex justify-center mb-4 md:mb-0">
                  <li>
                    <Link to="#" className="flex justify-center items-center text-blue-900 hover:text-gray-500 bg-white hover:bg-white-100 rounded-full shadow transition duration-150 ease-in-out" aria-label="Twitter">
                      <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 11.5c-.6.3-1.2.4-1.9.5.7-.4 1.2-1 1.4-1.8-.6.4-1.3.6-2.1.8-.6-.6-1.5-1-2.4-1-1.7 0-3.2 1.5-3.2 3.3 0 .3 0 .5.1.7-2.7-.1-5.2-1.4-6.8-3.4-.3.5-.4 1-.4 1.7 0 1.1.6 2.1 1.5 2.7-.5 0-1-.2-1.5-.4 0 1.6 1.1 2.9 2.6 3.2-.3.1-.6.1-.9.1-.2 0-.4 0-.6-.1.4 1.3 1.6 2.3 3.1 2.3-1.1.9-2.5 1.4-4.1 1.4H8c1.5.9 3.2 1.5 5 1.5 6 0 9.3-5 9.3-9.3v-.4c.7-.5 1.3-1.1 1.7-1.8z" />
                      </svg>
                    </Link>
                  </li>
                  <li className="ml-4">
                    <Link to="#" className="flex justify-center items-center text-blue-900 hover:text-gray-500 bg-white hover:bg-white-100 rounded-full shadow transition duration-150 ease-in-out" aria-label="Facebook">
                      <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.023 24L14 17h-3v-3h3v-2c0-2.7 1.672-4 4.08-4 1.153 0 2.144.086 2.433.124v2.821h-1.67c-1.31 0-1.563.623-1.563 1.536V14H21l-1 3h-2.72v7h-3.257z" />
                      </svg>
                    </Link>
                  </li>
                  <li className="ml-4">
                    <Link to="#" className="flex justify-center items-center text-blue-900 hover:text-gray-500 bg-white hover:bg-white-100 rounded-full shadow transition duration-150 ease-in-out" aria-label="Instagram">
                      <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20.145" cy="11.892" r="1" />
                        <path d="M16 20c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4zm0-6c-1.103 0-2 .897-2 2s.897 2 2 2 2-.897 2-2-.897-2-2-2z" />
                        <path d="M20 24h-8c-2.056 0-4-1.944-4-4v-8c0-2.056 1.944-4 4-4h8c2.056 0 4 1.944 4 4v8c0 2.056-1.944 4-4 4zm-8-14c-.935 0-2 1.065-2 2v8c0 .953 1.047 2 2 2h8c.935 0 2-1.065 2-2v-8c0-.935-1.065-2-2-2h-8z" />
                      </svg>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Copyright area */}
          <div className="flex flex-wrap items-center md:justify-between justify-center mx-auto px-4">
            <div className="w-full md:w-4/12 px-4 mx-auto text-center py-2">
              <div className="text-sm text-gray-700 font-semibold py-1">
                Copyright &copy; {new Date().getFullYear()}{" "}
                <HashLink smooth to="/#hero" className="hover:text-blue-900">
                  PT Tech XYZ
                </HashLink>
                . All Rights Reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
export default Footer;