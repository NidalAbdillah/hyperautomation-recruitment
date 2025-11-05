import React from "react";
// Menghapus komentar import gambar
// Menggunakan path dan nama file sesuai info terbaru dari user
import gedungISR1 from "../images/buildings/telkom1.png";
import gedungISR2 from "../images/buildings/telkom2.png";
import gedungISR3 from "../images/buildings/telkom3.png";

// Menghapus objek style clientImage dan komentar
// const clientImage = { ... }

const Gallery = () => {
  // Menghapus komentar nama komponen
  return (
    <div id="gallery" className="mt-8 bg-gray-100 py-12">
      <section data-aos="fade-up">
        <div className="my-4 py-4">
          {/* Judul utama */}
          <h2 className="my-2 text-center text-3xl text-red-700 uppercase font-bold">
            Gedung ISR Lab Bandung
          </h2>
          <div className="flex justify-center">
            {/* Garis bawah */}
            <div className="w-24 border-b-4 border-red-700"></div>
          </div>
          {/* Sub-judul */}
          <h2 className="mt-4 mx-12 text-center text-xl lg:text-2xl font-semibold text-red-700">
            Lihat fasilitas tempat riset kami dilakukan.
          </h2>
        </div>

        {/* Padding section */}
        <div className="p-16" data-aos="fade-in" data-aos-delay="600">
          {/* Struktur grid responsif dengan gap */}
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Menghapus baris {" "} dan komentar gap */}

            {/* Mengubah Item 1: Foto Gedung */}
            {/* Menghapus komentar styling */}
            <div className="overflow-hidden rounded-lg shadow-xl flex justify-center transition-all ease-in-out hover:scale-105 p-3">
              {/* Menggunakan gambar gedung */}
              <img
                src={gedungISR1}
                alt="Foto Gedung ISR Lab 1"
                className="block w-full h-auto object-cover"
              />
            </div>
            {/* Mengubah Item 2: Foto Gedung */}
            {/* Menghapus komentar styling */}
            <div className="overflow-hidden rounded-lg shadow-xl flex justify-center transition-all ease-in-out hover:scale-105 p-3">
              {/* Menggunakan gambar gedung */}
              <img
                src={gedungISR2}
                alt="Foto Gedung ISR Lab 2"
                className="block w-full h-auto object-cover"
              />
            </div>
            {/* Mengubah Item 3: Foto Gedung */}
            {/* Menghapus komentar styling */}
            <div className="overflow-hidden rounded-lg shadow-xl flex justify-center transition-all ease-in-out hover:scale-105 p-3">
              {/* Menggunakan gambar gedung */}
              <img
                src={gedungISR3}
                alt="Foto Gedung ISR Lab 3"
                className="block w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
