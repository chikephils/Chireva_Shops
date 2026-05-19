import React, { useState } from "react";
import SmallLoader from "../UI/SmallLoader";
import styles from "../../styles/styles";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { server } from "../../server";
import Logo from "../../Assests/img/logo.png";
import axios from "axios";

const ShopForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loader, setloader] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setloader(true);

    axios
      .post(`${server}/shop/forgot-shop-password`, {
        email,
      })
      .then((res) => {
        toast.success(res.data.message);
        setEmail("");
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      })
      .finally(() => {
        setloader(false);
      });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-10">
        <Link to="/">
          <img src={Logo} alt="Your Shop Logo" className="h-14 w-auto object-contain mx-auto" />
        </Link>
      </div>
      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-900 text-center mb-2">Forgot Shop Password?</h1>
          <p className="text-center text-sm text-gray-600 mb-8">Enter your shop email and we'll send you a reset link</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`
                  w-full px-4 py-3 border border-gray-300 rounded-lg 
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  outline-none transition-all duration-200
                  placeholder-gray-400 text-gray-900
                `}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loader || !email.trim()}
              className={`
                w-full py-3.5 px-4 rounded-lg font-medium text-gray-700
                transition-all duration-200 shadow-md
                ${loader || !email.trim() ? "bg-gray-400 cursor-not-allowed" : "bg-blue-400 hover:bg-blue-500 active:bg-blue-600"}
              `}
            >
              {loader ? (
                <div className="flex items-center justify-center gap-2">
                  <SmallLoader />
                  <span>Sending...</span>
                </div>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Remember your password?{" "}
            <Link to="/shop-login" className="font-medium text-blue-600 hover:text-blue-700 transition">
              Sign in
            </Link>
          </div>

          {/* Register link */}
          <div className="mt-2 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/create-shop" className="font-medium text-blue-600 hover:text-blue-700 transition">
              Create one
            </Link>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-8 text-sm text-gray-500">© {new Date().getFullYear()} Chireva. All rights reserved.</p>
    </div>
  );
};

export default ShopForgotPassword;
