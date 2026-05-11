import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Loader from "../../components/UI/Loader";
import AdminSideBar from "./AdminSideBar";
import AdminHeader from "./AdminHeader";

const AdminLayout = () => {
  return (
    <>
      <AdminHeader />
      <div className="max-w-screen-4xl min-h-screen mx-auto pt-[70px] px-4 lg:px-8 pb-24 lg:pb-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
        <div className="w-full mb-10 flex flex-col lg:flex-row gap-6 lg:gap-6">
          {/* Desktop Sidebar  fixed left */}
          <div
            className="
                hidden lg:block 
                fixed w-[25%] xl:w-[20%] 
                h-[calc(100vh-80px)] 
                bg-gray-900 text-white rounded-xl shadow-2xl border-r border-gray-800 p-2 pt-2
              "
          >
            <AdminSideBar />
          </div>
          <Suspense
            fallback={
              <div className="w-full fixed flex items-center justify-center left-0 right-0 lg:w-[70%] xl:w-[75%]  mx-auto lg:left-auto lg:right-auto ml-0 lg:ml-[26%] xl:ml-[22%] h-[calc(100vh-80px)] rounded-xl shadow-lg p-2 pt-6 lg:pt-3 ">
                {" "}
                <Loader />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>

        {/* Mobile Bottom Navigation*/}
        <footer
          className="
            fixed bottom-0 left-0 right-0 
            bg-gray-900 border-t border-gray-800 
            lg:hidden h-[70px] z-20 px-2 shadow-[0_-4px_16px_rgba(0,0,0,0.4)]
          "
        >
          <AdminSideBar mobile />
        </footer>
      </div>
    </>
  );
};

export default AdminLayout;
