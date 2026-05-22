import React from "react";
import AdminOrders from "../../components/Admin/AdminOrders.jsx";

const AdminDashboardOrders = () => {
  return (
    <>
      {/* Main Content */}
      <div className="flex flex-col h-full ">
        <AdminOrders />
      </div>
    </>
  );
};

export default AdminDashboardOrders;
