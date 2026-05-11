import React, { Suspense } from "react";
import DashBoardHeader from "./DashBoardHeader";
import { Outlet } from "react-router-dom";
import Loader from "../../components/UI/Loader";
import DashBoardSideBar from "./DashBoardSideBar";

const ShopLayout = () => {
  return (
    <>
      <DashBoardHeader />
      <div className="max-w-screen-4xl mx-auto pt-[70px] px-4 lg:px-8 pb-24 lg:pb-10 bg-gray-50/70 ">
        <div className="w-full mb-10 flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar – fixed left */}
          <div
            className="
            hidden lg:block 
            fixed w-[25%] xl:w-[20%] 
            h-[calc(100vh-80px)] 
            bg-white rounded-xl shadow-lg border-r border-gray-200 p-2 pt-2"
          >
            <DashBoardSideBar />
          </div>

          <Suspense
            fallback={
              <div className="w-full fixed flex items-center justify-center left-0 right-0 lg:w-[70%] xl:w-[75%]  mx-auto lg:left-auto lg:right-auto ml-0 lg:ml-[26%] xl:ml-[21%]  p-2 pt-6 lg:pt-3 h-[calc(100vh-80px)] bg-gray-50 rounded-xl shadow-lg">
                {" "}
                <Loader />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
        {/* Mobile Bottom Navigation Bar */}
        <footer
          className="
          fixed bottom-0 left-0 right-0 
          bg-white border-t border-gray-200 
          lg:hidden h-[70px] z-20 px-2 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]
        "
        >
          <DashBoardSideBar mobile />
        </footer>
      </div>
    </>
  );
};

export default ShopLayout;
