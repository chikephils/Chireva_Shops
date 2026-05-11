import React from "react";
import ShopLogin from "../../components/Shop/ShopLogin"; 

const ShopLoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-2 md:px-4 py-12">
        <ShopLogin />
      </div>

      {/* Optional thin footer */}
      <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Chireva. All rights reserved.
      </footer>
    </div>
  );
};

export default ShopLoginPage;
