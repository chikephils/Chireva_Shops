import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHome, FiSearch } from "react-icons/fi";
import Logo from "../Assests/img/logo.png";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-10">
        <Link to="/">
          <img
            src={Logo}
            alt="Your Shop Logo"
            className="h-14 w-auto object-contain mx-auto"
          />
        </Link>
      </div>

      {/* Main 404 Content */}
      <div className="text-center max-w-lg">
        {/* Big 404 */}
        <h1 className="text-6xl md:text-8xl font-bold text-lime-600 mb-4 tracking-tight">
          404
        </h1>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
          Page Not Found
        </h2>

        <p className="text-lg text-gray-600 mb-10">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-lime-600 hover:bg-lime-700 text-white font-medium rounded-xl transition shadow-lg"
          >
            <FiHome size={20} />
            Back to Home
          </button>
        </div>
      </div>

      {/* Footer note */}
      <footer className="mt-16 text-sm text-gray-500">
        © {new Date().getFullYear()} Chireva. All rights reserved.
      </footer>
    </div>
  );
};

export default NotFoundPage;
