import React from "react";
import AllOrders from "../../components/Profile/AllOrders";

const OrderPage = () => {
  return (
    <>
      <div className="w-full fixed lg:w-[70%] xl:w-[75%] left-0 right-0 mx-auto lg:left-auto lg:right-auto ml-0 lg:ml-[26%] xl:ml-[21%] bg-white rounded-xl shadow-lg p-2 pt-6 lg:pt-3 lg-p-4 h-[calc(100vh-130px)]">
        <AllOrders />
      </div>
    </>
  );
};

export default OrderPage;
