import React from "react";
import AdminDashboard from "../../components/Admin/AdminDashboard";

const AdminDashboardPage = () => {
  return (
    <>
      {/* Main Content */}
      <main className="w-full fixed lg:w-[70%] xl:w-[77%] left-0 right-0 mx-auto lg:left-auto lg:right-auto ml-0 lg:ml-[26%] xl:ml-[21%]  rounded-xl shadow-lg p-3 h-[calc(100%-80px)]">
        <AdminDashboard />
      </main>
    </>
  );
};

export default AdminDashboardPage;
