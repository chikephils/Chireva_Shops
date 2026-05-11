import React, { Suspense } from "react";
import DashBoardHeader from "./DashBoardHeader";
import Loader from "../../components/UI/Loader";
import { Outlet } from "react-router-dom";

const ShopDetailsLayout = () => {
  return (
    <>
      <DashBoardHeader />
      <Suspense
        fallback={
          <div className="min-h-screen mx-auto max-w-screen-4xl flex items-center justify-center bg-gray-50 pt-[70px]">
            {" "}
            <Loader />
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </>
  );
};

export default ShopDetailsLayout;
