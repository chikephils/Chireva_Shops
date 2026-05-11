import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Loader from "../../components/UI/Loader";

const AuthLayout = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader />
        </div>
      }
    >
      <Outlet />
    </Suspense>
  );
};

export default AuthLayout;
