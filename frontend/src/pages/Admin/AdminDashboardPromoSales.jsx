import React from "react";
import AdminPromoSales from "../../components/Admin/AdminPromoSales.jsx";


const AdminDashboardPromoSales = () => {
  return (
    <>
      {/* Main Content */}
      <main className="w-full fixed lg:w-[70%] xl:w-[77%] left-0 right-0 mx-auto lg:left-auto lg:right-auto ml-0 lg:ml-[26%] xl:ml-[21%] rounded-xl shadow-lg p-3 h-[calc(100%-70px)]">
        <AdminPromoSales />
      </main>
    </>
  );
};

export default AdminDashboardPromoSales;
