import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import { toast } from "react-toastify";
import { server } from "../../server";
import { setShopLogin } from "../../features/shop/shopSlice";
import { useDispatch } from "react-redux";
import LogoRounded from "../../Assests/img/logoRounded.png";

const ShopLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post(
        `${server}/shop/shop-login`,
        { email, password },
        { headers: { "Content-Type": "application/json" }, withCredentials: true },
      );

      if (response.status >= 200 && response.status < 300) {
        const { seller, message } = response.data;
        dispatch(setShopLogin({ seller }));
        toast.success(message || "Login successful");
        navigate("/dashboard");
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Logo + Header */}
        <div className="px-2 py-4 md:py-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
          <Link to="/" className="flex justify-center mb-6">
            <img src={LogoRounded} alt="Logo" className="w-36" />
          </Link>
          <h1 className="text-base md:text-xl font-bold text-gray-900 text-center">Seller Login</h1>
          <p className="mt-2 text-gray-600 text-center text-sm">Welcome back — log in to manage your shop</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-3 md:px-5 py-6 md:py-8 space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={visible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition pr-10"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setVisible(!visible)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {visible ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <Link to="/shop/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full py-3.5 px-6 rounded-xl font-medium text-white transition-all
              flex items-center justify-center gap-2 shadow-md
              ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800"}
            `}
          >
            {isLoading ? (
              <>
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Register Link */}
          <div className="text-center text-sm pt-4">
            <span className="text-gray-600">Don't have a seller account? </span>
            <Link to="/create-shop" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Create one now
            </Link>
          </div>
        </form>
      </div>

      {/* Test credentials */}
      <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
        <p>Test Email: chikephils@gmail.com</p>
        <p>Test Password: bellamy</p>
      </div>
    </div>
  );
};

export default ShopLogin;
