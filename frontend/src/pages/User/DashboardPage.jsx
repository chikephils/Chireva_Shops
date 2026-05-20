import React from "react";
import UserDashboard from "../../components/Profile/UserDashboard";

const DashboardPage = () => {
  return (
    <>
      {/* Main Content */}
      <div className="flex flex-col h-full ">
        <UserDashboard />
      </div>
    </>
  );
};

export default DashboardPage;
