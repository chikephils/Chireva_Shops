import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import SmallLoader from "../UI/SmallLoader";
import { server } from "../../server";
import { toast } from "react-toastify";
import api from "../../utils/axios";
import { useSelector } from "react-redux";
import PageTransition from "../UI/PageTransition";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loader, setLoader] = useState(false);

  const passwordChangeHandler = async (e) => {
    e.preventDefault();
    setLoader(true);

    try {
      const response = await api.put(
        `${server}/user/update-user-password`,
        { oldPassword, newPassword, confirmPassword },
        { headers: { "Content-Type": "application/json" } },
      );
      return toast.success(response.data.message);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setNewPassword("");
      setOldPassword("");
      setConfirmPassword("");
      setLoader(false);
    }
  };

  return (
    <div className=" h-full">
      <div className="fixed top-[120px] left-0 right-0 z-10">
        <div className="max-w-screen-4xl mx-auto px-1 lg:px-6">
          <div className="lg:ml-[284px]">
            <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 rounded-t-xl px-4 lg:px-6 py- shadow-sm">
              <h1 className=" flex items-center justify-center font-medium text-xl lg:text-2xl 800px:font-[600] text-black py-3">
                Change Password
              </h1>
            </div>
          </div>
        </div>
      </div>
      <PageTransition>
        <div className="max-w-4xl mx-auto min-h-0 pt-[70px] pb-8 px-2 lg:px-4 ">
          <form className="space-y-6 max-w-xl mx-auto px-2" onSubmit={passwordChangeHandler}>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="oldPassword" className="block text-[14px] md:text-[16px] font-semibold text-gray-700 mb-1">
                  Enter your old password
                </label>
                <div className="mt-1 relative">
                  <input
                    type={visible ? "text" : "password"}
                    required
                    name="oldPassword"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setVisible(!visible)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {visible ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-[14px] md:text-[16px] font-semibold text-gray-700">
                  Enter your new Password
                </label>
                <div className="mt-1 relative">
                  <input
                    type={visible ? "text" : "password"}
                    autoComplete="current-password"
                    name="newPassword"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setVisible(!visible)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {visible ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-[14px] md:text-[16px] font-semibold text-gray-700">
                  Confrim your new Password
                </label>
                <div className="mt-1 relative">
                  <input
                    type={visible ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setVisible(!visible)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {visible ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <button
                className={`px-10 py-3 text-white font-semibold rounded-xl transition shadow-lg ${
                  loader ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                }
  `}
              >
                {" "}
                {loader ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </div>
      </PageTransition>
    </div>
  );
};

export default ChangePassword;
