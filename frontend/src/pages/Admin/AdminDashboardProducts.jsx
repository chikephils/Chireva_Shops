import React from "react";
import AdminProducts from "../../components/Admin/AdminProducts.jsx";

const AdminDashboardProducts = () => {
  return (
    <>
      {/* Main Content */}
      <div className="flex flex-col h-full ">
        <AdminProducts />
      </div>
    </>
  );
};

export default AdminDashboardProducts;
