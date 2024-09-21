import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'tailwindcss/tailwind.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/custom.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Replace text with an image */}
        <div className="text-gray-300 text-2xl font-bold">
          <img src="/logo.jpg" alt="Logo" className="h-16 w-auto rounded" />
        </div>
        <div className="lg:hidden" onClick={toggleMenu}>
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'} text-white text-2xl`}></i>
        </div>
        <ul className={`lg:flex lg:items-center lg:space-x-4 ${isOpen ? 'block' : 'hidden'} lg:block absolute lg:relative top-16 lg:top-auto left-0 lg:left-auto right-0 bg-gray-800 lg:bg-transparent`}>
          <li className="nav-item">
            <Link to="/" className="text-white font-bold p-2 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 transition duration-300 block lg:inline-block" onClick={toggleMenu}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/monthly-report" className="text-white font-bold p-2 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 transition duration-300 block lg:inline-block" onClick={toggleMenu}>
              Monthly Report
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/students" className="text-white font-bold p-2 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 transition duration-300 block lg:inline-block" onClick={toggleMenu}>
              Student Management
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/invoice-generator" className="text-white font-bold p-2 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 transition duration-300 block lg:inline-block" onClick={toggleMenu}>
              Invoice
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/library" className="text-white font-bold p-2 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 transition duration-300 block lg:inline-block" onClick={toggleMenu}>
              Library
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;