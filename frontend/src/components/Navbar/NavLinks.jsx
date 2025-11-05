import React from "react";
import { HashLink } from "react-router-hash-link";

const NavLinks = () => {
  return (
    <>
      <HashLink
        smooth
        to="/#about"
        className="font-poppins px-3 font-semibold text-gray-800 hover:text-red-900"
      >
        About
      </HashLink>
      <HashLink
        smooth
        to="/#services"
        className="font-poppins px-3 font-semibold text-gray-800 hover:text-red-900"
      >
        Services
      </HashLink>
      <HashLink
        smooth
        to="/#techstack"
        className="font-poppins px-3 font-semibold text-gray-800 hover:text-red-900"
      >
        Tech Stack
      </HashLink>
      <HashLink
        smooth
        to="/#gallery"
        className="font-poppins px-3 font-semibold text-gray-800 hover:text-red-900"
      >
        Gallery
      </HashLink>
      <HashLink
        smooth
        to="/#career"
        className="font-poppins px-3 font-semibold text-gray-800 hover:text-red-900"
      >
        Career
      </HashLink>
      <HashLink
        smooth
        to="/applycv"
        className="inline-flex items-center justify-center w-auto px-4 py-2 rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 font-semibold"
      >
        Apply Cv
      </HashLink>
    </>
  );
};

export default NavLinks;
