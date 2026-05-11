import React from "react";
import UserTransactions from "../../components/Profile/UserTransactions";

const UserTransactionPage = () => {
  return (
    <>
      <div className="w-full fixed lg:w-[70%] xl:w-[75%] left-0 right-0 mx-auto lg:left-auto lg:right-auto ml-0 lg:ml-[26%] xl:ml-[21%] bg-white rounded-xl shadow-lg p-2 pt-6 lg:pt-3 lg-p-4 h-[calc(100%-130px)]">
        <UserTransactions />
      </div>
    </>
  );
};

export default UserTransactionPage;
