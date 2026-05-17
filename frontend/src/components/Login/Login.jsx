import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import { toast } from "react-toastify";
import { server } from "../../server";
import { useDispatch } from "react-redux";
import { setLogin } from "../../features/user/userSlice";
import LogoRounded from "../../Assests/img/logoRounded.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);

    try {
      const response = await api.post(
        `${server}/user/login-user`,
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const { user, token, message } = response.data;
      dispatch(setLogin({ user, token }));

      toast.success(message || "Login successful");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Logo + Header */}
        <div className="px-3 py-4 bg-gradient-to-r from-lime-50 to-cyan-50 border-b">
          <div className="flex justify-center mb-4">
            <Link to="/">
              <img src={LogoRounded} alt="Logo" className="w-28" />
            </Link>
          </div>
          <h1 className="text-base md:text-xl font-bold text-gray-900 text-center">Welcome Back</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 md:px-6 py-8 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition pr-10"
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
              <input type="checkbox" id="remember" className="h-4 w-4 text-lime-600 focus:ring-lime-500 border-gray-300 rounded" />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <Link to="/forgot-Password" className="text-sm text-lime-600 hover:text-lime-800 font-medium">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loader}
            className={`
              w-full py-3.5 px-6 rounded-xl font-medium text-white transition-all
              flex items-center justify-center gap-2 shadow-md
              ${loader ? "bg-gray-400 cursor-not-allowed" : "bg-lime-600 hover:bg-lime-700 active:bg-lime-800"}
            `}
          >
            {loader ? (
              <>
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Register Link */}
          <div className="text-center pt-1 text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/register" className="text-lime-600 hover:text-lime-800 font-medium">
              Create one now
            </Link>
          </div>
        </form>
      </div>

      {/* Test credentials */}
      <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
        <p>Test Email: chikeoreva@gmail.com</p>
        <p>Test Password: bellamy</p>
        <p className="text-lime-600 font-medium">This user is also an admin</p>
      </div>
    </div>
  );
};

export default Login;
