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
        { headers: { "Content-Type": "application/json" }, withCredentials: true },
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
    <div className="h-full pb-10 pt-2">
      <div className="flex items-center justify-center sticky h-[35px] py-6">
        <h1 className=" flex font-semibold text-lg text-black py-6">Change Password</h1>
      </div>
      <PageTransition>
        <div className=" h-[calc(100%-38px)] overflow-y-scroll scrollbar-hide pt-3 pb-10">
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
