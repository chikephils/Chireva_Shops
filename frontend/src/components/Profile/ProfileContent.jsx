import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LoadUser, selectUserLoading, updateUserInformation } from "../../features/user/userSlice";
import { AiOutlineCamera } from "react-icons/ai";
import { FcPortraitMode } from "react-icons/fc";
import api from "../../utils/userApi";
import { server } from "../../server";
import { toast } from "react-toastify";
import CreateLoader from "../UI/createLoader";
import Loader from "../UI/Loader";

const ProfileContent = () => {
  const { user, token } = useSelector((state) => state.user);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const userLoading = useSelector(selectUserLoading);

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(
        updateUserInformation({
          firstName,
          lastName,
          email,
          phoneNumber,
          password,
        }),
      ).unwrap();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const reader = new FileReader();
    setIsLoading(true);

    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatar(reader.result);

        axios
          .put(
            `${server}/user/update-avatar`,
            { avatar: reader.result },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          )
          .then((response) => {
            dispatch(LoadUser());
            toast.success("Avatar updated successfully");
          })
          .catch((error) => {
            toast.error(error.message);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else return;
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  return (
    <div className="h-full">
      <>
        {(isLoading || userLoading) && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-xl">
            <Loader />
          </div>
        )}
      </>
      <div className="fixed top-[120px] left-0 right-0 z-10">
        <div className="max-w-screen-4xl mx-auto px-1 lg:px-6">
          <div className="lg:ml-[284px]">
            <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 rounded-t-xl px-4 lg:px-6 py- shadow-sm">
              <h1 className=" flex items-center justify-center font-medium text-xl lg:text-2xl 800px:font-[600] text-black py-3">
                <FcPortraitMode size={32} />
                My Profile
              </h1>
            </div>
          </div>
        </div>
      </div>
      {/* Profile Page */}
      <div className="max-w-4xl mx-auto min-h-0 pt-[70px] pb-8 px-2 lg:px-4 ">
        {/* Avatar */}
        <div className="flex justify-center mb-10 w-full">
          <div className="relative">
            <img
              src={`${user?.avatar?.url}` || avatar}
              alt="Profile"
              className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-red-500 shadow-lg"
            />
            <label className="absolute bottom-2 right-2 w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-700 transition">
              <AiOutlineCamera size={20} className="text-white" />
              <input type="file" className="hidden" onChange={handleImageChange} id="image" />
            </label>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className={`px-10 py-3 text-white font-semibold rounded-xl transition shadow-lg ${
                loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
              }
  `}
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileContent;
