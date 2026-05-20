import React from "react";
import UserTransactions from "../../components/Profile/UserTransactions";

const UserTransactionPage = () => {
  return (
    <>
      <div className="flex flex-col h-full">
        <UserTransactions />
      </div>
    </>
  );
};

export default UserTransactionPage;
