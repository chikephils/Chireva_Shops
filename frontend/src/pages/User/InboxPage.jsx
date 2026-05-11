import React from "react";
import UserInbox from "../../components/Profile/UserInbox";

const InboxPage = () => {
  return (
    <>
      {/* Main Content */}
      <div className="w-full fixed lg:w-[70%] xl:w-[75%] left-0 right-0 mx-auto lg:left-auto lg:right-auto ml-0 lg:ml-[26%] xl:ml-[21%] bg-white rounded-xl shadow-lg p-3 h-[calc(100vh-130px)]">
        <UserInbox />
      </div>
    </>
  );
};

export default InboxPage;
