import React, { Suspense } from "react";

import ProfileSideBar from "../../components/Profile/ProfileSideBar";
import Loader from "../../components/UI/Loader";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const UserProfileLayout = () => {
  return (
    <>
      <Header />
      <div className="pt-[120px] min-h-screen">
        <div className="max-w-screen-4xl mx-auto px-1 lg:px-6">
          <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-[260px] shrink-0">
              <div className="sticky top-[120px] h-[calc(100vh-150px)]">
                <div className=" h-full overflow-y-auto bg-white rounded-xl shadow border p-3">
                  <ProfileSideBar />
                </div>
              </div>
            </aside>

            <main className="flex-1 min-w-0">
              <div className="bg-white rounded-xl shadow p-2 mb-4 min-h-[calc(100vh-150px)]">
                <Suspense
                  fallback={
                    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
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

        {/* Mobile Bottom Navigation */}
        <nav
          className="
            fixed bottom-0 left-0 right-0
            bg-white border-t border-gray-200
            lg:hidden z-50
          "
        >
          <ProfileSideBar mobile />
        </nav>
      </div>
    </>
  );
};

export default UserProfileLayout;
