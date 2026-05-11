import React from "react";
import ShopTransactions from "../../components/Shop/ShopTransactions";

const ShopTransactionsPage = () => {
  return (
    <>
      <div className="w-full fixed lg:w-[70%] xl:w-[75%] left-0 right-0 mx-auto lg:left-auto lg:right-auto ml-0 lg:ml-[26%] xl:ml-[21%] bg-gray-50 rounded-xl shadow-lg  h-[calc(100vh-80px)] ">
        <ShopTransactions />
      </div>
    </>
  );
};

export default ShopTransactionsPage;
