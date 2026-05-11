import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import styles from "../../styles/styles";
import SmallLoader from "../UI/SmallLoader";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Loader from "../UI/Loader";
import { toast } from "react-toastify";
import { server } from "../../server";
import api from "../../utils/axios";
import Logo from "../../Assests/img/logo.png";

const ShopPasswordReset = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const reset_token = queryParams.get("reset_token");
  const id = queryParams.get("id");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!reset_token) {
      setTokenValid(false);
      return;
    }

    const validateToken = async () => {
      try {
        const res = await api.post(`${server}/shop/verify-token-shop`, {
          reset_token,
        });

        if (res.data.success) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        setTokenValid(false);
      }
    };

    validateToken();
  }, [reset_token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    setLoading(true);
    try {
      const res = await api.post(`${server}/shop/new-shop-password/${id}`, {
        password,
        confirmPassword,
      });

      toast.success(res.data.message || "Password reset successful!");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-4 ">
      {/* Logo */}
      <div className="mb-10 mt-20">
        <Link to="/">
          <img src={Logo} alt="Your Shop Logo" className="h-14 w-auto object-contain mx-auto" />
        </Link>
      </div>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-4">
          {tokenValid === null ? (
            // Loading state
            <div className="flex flex-col items-center justify-center py-12">
              <Loader />
              <p className="mt-4 text-gray-600 font-medium">Verifying reset link...</p>
            </div>
          ) : tokenValid ? (
            <>
              <h1 className="text-xl font-bold text-gray-900 text-center mb-2">Reset Your Password</h1>
              <p className="text-center text-sm text-gray-600 mb-8">Choose a strong password for your Shop account</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={visible ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="At least 6 characters"
                      className={`
                        w-full px-4 py-3 border border-gray-300 rounded-lg 
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                        outline-none transition-all duration-200
                        placeholder-gray-400
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => setVisible(!visible)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {visible ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={visible ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Re-enter password"
                      className={`
                        w-full px-4 py-3 border border-gray-300 rounded-lg 
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                        outline-none transition-all duration-200
                        placeholder-gray-400
                      `}
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className={`
                    w-full py-3.5 px-3 rounded-lg font-semibold text-white
                    transition-all duration-200 shadow-md
                    ${
                      loading || !password || !confirmPassword
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                    }
                  `}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <SmallLoader />
                      <span>Resetting...</span>
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-4 text-center text-sm text-gray-600">
                Remember your password?{" "}
                <Link to="/shop-login" className="font-medium text-blue-600 hover:text-blue-700 transition">
                  Sign in
                </Link>
              </div>
            </>
          ) : (
            // Invalid/expired token
            <div className="text-center py-10">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AiOutlineEyeInvisible size={32} className="text-red-600" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-3">Link Expired or Invalid</h2>

              <p className="text-gray-600 mb-8">This password reset link has expired or is no longer valid.</p>

              <Link
                to="/shop/forgot-password"
                className="inline-flex px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-md"
              >
                Request New Reset Link
              </Link>

              <div className="mt-6 text-sm text-gray-600">
                Back to{" "}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                  Sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-8 text-sm text-gray-500">© {new Date().getFullYear()} Chireva. All rights reserved.</p>
    </div>
  );
};

export default ShopPasswordReset;
