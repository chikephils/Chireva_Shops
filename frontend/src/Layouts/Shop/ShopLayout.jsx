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
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-[260px] shrink-0">
              <div className="sticky top-[70px] h-[calc(100vh-100px)] overflow-y-auto bg-white rounded-xl  border p-3">
                <DashBoardSideBar />
              </div>
            </aside>

            {/* Page Content */}
            <main className="flex-1 min-w-0">
              <div className="bg-white rounded-xl p-2 mb-4 min-h-[calc(100vh-100px)]">
                <Suspense
                  fallback={
                    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center">
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
          <DashBoardSideBar mobile />
        </nav>
      </div>
    </>
  );
};

export default ShopLayout;
