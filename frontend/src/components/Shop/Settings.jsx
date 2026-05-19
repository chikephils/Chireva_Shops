import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LoadSeller, selectSeller, selectSellerLoading } from "../../features/shop/shopSlice";
import { server } from "../../server";
import { AiOutlineCamera } from "react-icons/ai";
import api from "../../utils/axios";
import { toast } from "react-toastify";
import CreateLoader from "../UI/createLoader";
import Loader from "../UI/Loader";

const Settings = () => {
  const dispatch = useDispatch();
  const seller = useSelector(selectSeller);
  const sellerLoading = useSelector(selectSellerLoading);
  const sellerToken = useSelector((state) => state.shop.sellerToken);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);

  const [shopName, setShopName] = useState(seller?.shopName || "");
  const [description, setDescription] = useState(seller?.description || "");
  const [address, setAddress] = useState(seller?.address || "");
  const [phoneNumber, setPhoneNumber] = useState(seller?.phoneNumber || "");
  const [zipCode, setZipCode] = useState(seller?.zipCode || "");

  const [isUpdating, setIsUpdating] = useState(false);

  // Avatar preview + upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(reader.result);

        setIsAvatarLoading(true);

        api
          .put(
            `${server}/shop/update-shop-avatar`,
            { avatar: reader.result },
            {
              authType: "shop",
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
          )
          .then((response) => {
            console.log(response);
            toast.success("Avatar updated successfully!");
            dispatch(LoadSeller());
          })
          .catch((error) => {
            toast.error(error.response?.data?.message || "Failed to update avatar");
            setAvatarPreview(null);
          })
          .finally(() => {
            setIsAvatarLoading(false);
          });
      }
    };

    reader.readAsDataURL(file);
  };

  // Update shop info
  const updateHandler = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      await api.put(
        `${server}/shop/update-seller-info`,
        {
          shopName,
          address,
          zipCode,
          phoneNumber,
          description,
        },
        {
          authType: "shop",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      toast.success("Shop information updated successfully!");
      dispatch(LoadSeller());
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="h-full">
      {/* Sticky Header */}
      <div className="fixed top-[70px] left-0 right-0 z-10">
        <div className="max-w-screen-4xl mx-auto px-1 lg:px-6">
          <div className="lg:ml-[284px]">
            <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 rounded-t-xl px-4 lg:px-6 py- shadow-sm">
              <h1 className=" flex items-center justify-center font-medium text-xl lg:text-2xl 800px:font-[600] text-black py-3">
                Shop Settings
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto h-full pt-[70px] px-2 overflow-y-scroll scrollbar-hide ">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <img
              src={avatarPreview || seller?.avatar?.url || "/default-shop-avatar.png"}
              alt="Shop Avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100 shadow-md"
            />

            <label
              htmlFor="avatar-upload"
              className="absolute bottom-2 right-2 bg-indigo-600 text-white p-3 rounded-full cursor-pointer shadow-lg opacity-90 hover:opacity-100 transition group-hover:scale-110"
            >
              <AiOutlineCamera size={20} />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={isAvatarLoading}
              />
            </label>
          </div>
        </div>

        {/* Shop Info Form */}
        <form onSubmit={updateHandler} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shop Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Shop Name</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Your shop name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                required
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Shop Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full shop address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                required
              />
            </div>

            {/* Zip Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Zip Code</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Zip/Postal code"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Shop Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell customers about your shop..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isUpdating || sellerLoading}
              className={`
                px-10 py-3 rounded-lg font-medium text-white transition
                flex items-center gap-2
                ${isUpdating || sellerLoading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}
              `}
            >
              {isUpdating || sellerLoading ? (
                <>
                  <span>Updating...</span>
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Full-screen loading overlay */}
      {(sellerLoading || isUpdating || isAvatarLoading) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default Settings;
