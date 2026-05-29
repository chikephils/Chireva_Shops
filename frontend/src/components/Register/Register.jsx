import React, { useState } from "react";
import { AiOutlineCamera, AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { server } from "../../server";
import { toast } from "react-toastify";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (avatarPreview === null) {
      toast.error("Upload Avatar");
      return;
    }
    setIsLoading(true);

    const payload = {
      firstName,
      lastName,
      email,
      password,
      avatar: avatarPreview,
    };

    try {
      const res = await api.post(`${server}/user/create-user`, payload);
      toast.success(res.data.message);

      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setAvatarPreview(null);
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Logo + Header */}
      <div className="px-4 md:px-6 py-4 md:py-6 bg-gradient-to-r from-lime-50 to-cyan-50 border-b">
        <h1 className="text-base md:text-xl font-bold text-gray-900 text-center">Create Your Account</h1>
        <p className="mt-2 text-gray-600 text-center text-sm">Join thousands of happy shoppers today</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-3 md:px-10 py-4 space-y-3">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-lime-200 shadow-md">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <RxAvatar size={80} className="text-gray-400" />
                </div>
              )}
            </div>

            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-lime-600 text-white p-2 rounded-full cursor-pointer shadow-lg opacity-90 hover:opacity-100 transition group-hover:scale-110"
            >
              <AiOutlineCamera size={20} />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isLoading}
              />
            </label>
          </div>
          <p className="mt-3 text-sm text-gray-500">Upload profile picture</p>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={visible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition pr-10"
                required
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
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full py-3.5 px-6 rounded-xl font-medium text-white transition-all
              flex items-center justify-center gap-2 shadow-md
              ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-lime-600 hover:bg-lime-700 active:bg-lime-800"}
            `}
          >
            {isLoading ? (
              <>
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </div>

        {/* Login Link */}
        <div className="text-center pt-1 text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="text-lime-600 hover:text-lime-800 font-medium">
            Login here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
