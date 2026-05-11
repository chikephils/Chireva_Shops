import React from "react";
import ChangePassword from "../../components/Profile/ChangePassword";
const ChangePasswordPage = () => {
  return (
    <>
      {/* Main Content */}
      <div className="w-full fixed lg:w-[70%] xl:w-[75%] left-0 right-0 mx-auto lg:left-auto lg:right-auto ml-0 lg:ml-[26%] xl:ml-[21%] bg-white rounded-xl shadow-lg p-4 h-[calc(100%-120px)]">
        <ChangePassword />
      </div>
    </>
  );
};

export default ChangePasswordPage;
