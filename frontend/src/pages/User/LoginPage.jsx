import React from "react";
import Login from "../../components/Login/Login";
import PageTransition from "../../components/UI/PageTransition";

const LoginPage = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/40 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-14">
          <Login />
        </div>

        <footer className="bg-white border-t py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Chireva. All rights reserved.
        </footer>
      </div>
    </PageTransition>
  );
};

export default LoginPage;
