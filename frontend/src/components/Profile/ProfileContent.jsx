import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LoadUser, selectUserLoading, updateUserInformation } from "../../features/user/userSlice";
import { AiOutlineCamera } from "react-icons/ai";
import { FcPortraitMode } from "react-icons/fc";
import api from "../../utils/axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import CreateLoader from "../UI/createLoader";

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
    <div className="h-full pb-20 lg:pb-5">
      <>
        {(isLoading || userLoading) && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-xl">
            <CreateLoader />
          </div>
        )}
      </>
      <div className="flex items-center justify-center sticky h-14">
        <h1 className="text-xl md:text-2xl font-bold flex items-center justify-center gap-3 py-2 mt-3">
          <FcPortraitMode size={32} />
          My Profile
        </h1>
      </div>

      {/* Profile Page */}
      <div className=" h-full overflow-y-scroll scrollbar-hide pt-3 pb-12">
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
