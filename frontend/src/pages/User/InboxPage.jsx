import React from "react";
import UserInbox from "../../components/Profile/UserInbox";

const InboxPage = () => {
  return (
    <>
      {/* Main Content */}
      <div className="flex flex-col h-full">
        <UserInbox />
      </div>
    </>
  );
};

export default InboxPage;
