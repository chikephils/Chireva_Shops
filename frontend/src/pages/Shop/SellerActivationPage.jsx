import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import api from "../../utils/axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import Logo from "../../Assests/img/logo.png";
import { FiCheckCircle, FiLoader, FiXCircle } from "react-icons/fi";

const SellerActivationPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activation_token = queryParams.get("token");
  // const { activation_token } = useParams();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!activation_token) {
      setStatus("error");
      setMessage("Invalid or missing activation link.");
      return;
    }

    const activateAccount = async () => {
      try {
        const res = await api.post(`${server}/shop/shop-activation`, {
          activation_token,
        });

        setMessage(res.data.message || "Account activated successfully!");
        setStatus("success");
        toast.success("Account activated! You can now log in.");
      } catch (error) {
        const errMsg = error.response?.data?.message || "Activation failed. Token may be invalid or expired.";
        setMessage(errMsg);
        setStatus("error");
        toast.error(errMsg);
      }
    };

    activateAccount();
  }, [activation_token]);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-10">
        <Link to="/">
          <img src={Logo} alt="Your Shop Logo" className="h-12 w-auto object-contain mx-auto" />
        </Link>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-4 md:p-8 text-center">
          {status === "loading" && <FiLoader className="mx-auto h-16 w-16 text-red-500 animate-spin" />}

          {status === "success" && <FiCheckCircle className="mx-auto h-16 w-16 text-green-500" />}

          {status === "error" && <FiXCircle className="mx-auto h-16 w-16 text-red-500" />}

          <h1 className="mt-4 text-xl lg:text-2xl font-bold text-gray-900">
            {status === "loading" ? "Activating your account..." : status === "success" ? "Account Activated!" : "Activation Failed"}
          </h1>

          <p className="mt-4 text-gray-600">{status === "loading" ? "Please wait while we verify your email..." : message}</p>

          <div className="mt-4 space-y-4">
            {status === "success" ? (
              <Link
                to="/shop-login"
                className="inline-flex w-full justify-center items-center px-3 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition shadow-md"
              >
                Go to Login
              </Link>
            ) : status === "error" ? (
              <>
                <Link
                  to="/create-shop"
                  className="inline-flex w-full justify-center items-center px-3 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition shadow-md"
                >
                  Register Again
                </Link>

                <Link
                  to="/"
                  className="inline-flex w-full justify-center items-center px-3 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition"
                >
                  Back to Home
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-gray-500">© {new Date().getFullYear()} Chireva. All rights reserved.</p>
    </div>
  );
};

export default SellerActivationPage;
