import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Loader from "../../components/UI/Loader";
import Header from "./Header";

const UserLayout = () => {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <div className="min-h-screen mx-auto pt-[120px] md:pt-[105px] max-w-screen-4xl flex items-center justify-center">
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

export default UserLayout;
