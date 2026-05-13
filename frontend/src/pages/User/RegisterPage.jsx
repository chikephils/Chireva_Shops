import React from "react";
import Register from "../../components/Register/Register";
import { Link } from "react-router-dom";
import LogoRounded from "../../Assests/img/logoRounded.png";
import PageTransition from "../../components/UI/PageTransition";

const RegisterPage = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 flex flex-col">
        <div className="bg-white border-b shadow-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-center">
            <Link to="/">
              <img src={LogoRounded} alt="Logo" className="w-32" />
            </Link>
          </div>
        </div>

        <div className="flex-1 h-[calc(100%-40px)] overflow-y-auto scrollbar-hide flex items-center justify-center px-2 md:px-4 py-6">
          <Register />
        </div>

        <footer className="bg-white border-t py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Chireva. All rights reserved.
        </footer>
      </div>
    </PageTransition>
  );
};

export default RegisterPage;
