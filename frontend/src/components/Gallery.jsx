import React from "react";
import gedungTechXYZ1 from "../images/buildings/telkom1.png";
import gedungTechXYZ2 from "../images/buildings/telkom2.png";
import gedungTechXYZ3 from "../images/buildings/telkom3.png";

const Gallery = () => {
  return (
    <div id="gallery" className="mt-8 bg-gray-100 py-12">
      <section data-aos="fade-up">
        <div className="my-4 py-4">
          <h2 className="my-2 text-center text-3xl text-blue-900 uppercase font-bold">
            Gedung Tech XYZ Cimahi
          </h2>
          <div className="flex justify-center">
            <div className="w-24 border-b-4 border-blue-900"></div>
          </div>
          <h2 className="mt-4 mx-12 text-center text-xl lg:text-2xl font-semibold text-blue-900">
            Lihat fasilitas kantor kami di Cimahi.
          </h2>
        </div>

        <div className="p-16" data-aos="fade-in" data-aos-delay="600">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="overflow-hidden rounded-lg shadow-xl flex justify-center transition-all ease-in-out hover:scale-105 p-3">
              <img
                src={gedungTechXYZ1}
                alt="Foto Gedung Tech XYZ 1"
                className="block w-full h-auto object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-xl flex justify-center transition-all ease-in-out hover:scale-105 p-3">
              <img
                src={gedungTechXYZ2}
                alt="Foto Gedung Tech XYZ 2"
                className="block w-full h-auto object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-xl flex justify-center transition-all ease-in-out hover:scale-105 p-3">
              <img
                src={gedungTechXYZ3}
                alt="Foto Gedung Tech XYZ 3"
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