import React, { Suspense } from "react";

import ProfileSideBar from "../../components/Profile/ProfileSideBar";
import Loader from "../../components/UI/Loader";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const UserProfileLayout = () => {
  return (
    <>
      <Header />
      <div className="max-w-screen-4xl mx-auto pt-[120px] px-4 lg:px-8 pb-24 lg:pb-10">
        <div className="w-full mb-10 flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block fixed w-[25%] xl:w-[20%] bg-white rounded-xl shadow-lg p-2 pt-2 h-[calc(100vh-130px)]">
            <ProfileSideBar />
          </div>
          <Suspense
            fallback={
              <div className="w-full fixed flex left-0 right-0 items-center justify-center lg:w-[70%] xl:w-[75%] mx-auto lg:left-auto lg:right-auto ml-0 lg:ml-[26%] xl:ml-[21%]  bg-white rounded-xl shadow-lg  p-2 pt-6 lg:pt-3 lg-p-4 h-[calc(100vh-130px)]">
                {" "}
                <Loader />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 lg:hidden h-[70px] rounded-lg shadow-lg z-10 px-2">
          <ProfileSideBar mobile />
        </div>
      </div>
    </>
  );
};

export default UserProfileLayout;
