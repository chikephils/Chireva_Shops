import React, { Suspense } from "react";
import Loader from "../../components/UI/Loader";
import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";

const AdminDetailsLayout = () => {
  return (
    <>
      <AdminHeader />
      <Suspense
        fallback={
          <div className="min-h-screen mx-auto max-w-screen-4xl flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 pt-[70px]">
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

export default AdminDetailsLayout;
