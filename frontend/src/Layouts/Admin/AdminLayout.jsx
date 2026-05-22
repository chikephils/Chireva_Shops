import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Loader from "../../components/UI/Loader";
import AdminSideBar from "./AdminSideBar";
import AdminHeader from "./AdminHeader";

const AdminLayout = () => {
  return (
    <>
      <AdminHeader />
      <div className=" min-h-screen pt-[70px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
        <div className="max-w-screen-4xl mx-auto px-1 lg:px-6">
          <div className="flex gap-6">
            {/* Desktop Sidebar  fixed left */}
            <aside className="hidden lg:block w-[260px] shrink-0">
              <div className="sticky top-[70px] h-[calc(100vh-100px)]">
                <div
                  className="
                h-full overflow-y-auto
                bg-gray-900 text-white rounded-xl shadow-2xl border-r border-gray-800 p-3
              "
                >
                  <AdminSideBar />
                </div>
              </div>
            </aside>

            <main className="flex-1 min-w-0">
              <div className="  bg-gray-900 text-white rounded-xl shadow-2xl border-r border-gray-800 mb-4 p-2 min-h-[calc(100vh-100px)]">
                <Suspense
                  fallback={
                    <div className="min-h-[calc(100vh-110px)] flex items-center justify-center">
                      {" "}
                      <Loader />
                    </div>
                  }
                >
                  <Outlet />
                </Suspense>
              </div>
            </main>
          </div>
        </div>

        {/* Mobile Bottom Navigation*/}
        <nav
          className="
            fixed bottom-0 left-0 right-0 
            bg-gray-900 border-t border-gray-800 
            lg:hidden z-50 
          "
        >
          <AdminSideBar mobile />
        </nav>
      </div>
    </>
  );
};

export default AdminLayout;
