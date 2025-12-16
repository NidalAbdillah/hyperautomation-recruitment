import React, { useState, useEffect, useCallback, useRef } from "react";
import NavLinks from "./NavLinks";
import { HashLink } from "react-router-hash-link";

const NavBar = () => {
  const [top, setTop] = useState(!window.scrollY);
  const [isOpen, setIsOpen] = useState(false);
  const lastScrollY = useRef(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.pageYOffset;
    if (currentScrollY <= 10) {
      setTop(true);
    } else if (currentScrollY <= lastScrollY.current) {
      setTop(true);
    } else {
      setTop(false);
    }
    lastScrollY.current = currentScrollY;
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleClick = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-30 transition-all duration-300 ease-in-out ${
        !top ? "bg-white shadow-sm" : ""
      }`}
    >
      <div className="flex flex-row justify-between items-center py-2 px-4 md:px-6">
        {/* Logo & Branding */}
        <div className="flex items-center">
          <HashLink smooth to="/#hero" className="flex flex-col group">
            <h1 className="font-extrabold text-xl md:text-2xl text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">
              PT Tech <span className="text-blue-900">X</span><span className="text-red-700">YZ</span>
            </h1>
            <p className="text-[10px] md:text-xs text-gray-500 font-medium tracking-wider -mt-0.5 text-right">
              Company
            </p>
          </HashLink>
        </div>

        {/* Navigation Menu */}
        <div className="group flex flex-col items-center">
          {/* Mobile Menu Toggle */}
          <button
            className="p-1.5 rounded-lg lg:hidden text-blue-700 hover:bg-blue-50 transition-colors"
            onClick={handleClick}
            aria-label="Toggle menu"
          >
            <svg
              className="h-5 w-5 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 0 1 1.414 1.414l-4.829 4.829 4.828 4.828z"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden space-x-4 lg:inline-block p-1">
            <NavLinks />
          </div>

          {/* Mobile Navigation Dropdown */}
          <div
            className={`fixed transition-transform duration-300 ease-in-out transform flex justify-center left-0 w-full h-auto rounded-md p-4 bg-white lg:hidden shadow-sm top-12 ${
              isOpen
                ? "translate-y-0 opacity-100"
                : "-translate-y-full opacity-0"
            }`}
          >
            <div className="flex flex-col space-y-4">
              <NavLinks />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;