import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import DashBoardHeader from "./DashBoardHeader";
import DashBoardSideBar from "./DashBoardSideBar";
import Loader from "../../components/UI/Loader";

const ShopLayout = () => {
  return (
    <>
      <DashBoardHeader />

      <div className="pt-[70px] bg-gray-50 min-h-screen">
        <div className="max-w-screen-4xl mx-auto px-1 lg:px-6">
          <div className="flex gap-6">
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden lg:block w-[260px] shrink-0">
              <div className="sticky top-[60px] h-[calc(100vh-100px)]">
                <div className=" h-full overflow-y-auto bg-white rounded-xl shadow border p-3">
                  <DashBoardSideBar />
                </div>
              </div>
            </aside>

            {/* PAGE CONTENT */}
            <main className="flex-1 min-w-0">
              <div className="bg-white rounded-xl shadow p-2 h-[calc(100vh-100px)] pb-14 lg:pb-10  flex flex-col overflow-hidden">
                <Suspense
                  fallback={
                    <div className="flex-1 flex items-center justify-center">
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

        {/* MOBILE BOTTOM NAV */}
        <nav
          className="
            fixed bottom-0 left-0 right-0
            bg-white border-t border-gray-200
            lg:hidden z-50
          "
        >
          <DashBoardSideBar mobile />
        </nav>
      </div>
    </>
  );
};

export default ShopLayout;
