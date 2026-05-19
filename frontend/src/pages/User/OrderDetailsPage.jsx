import React from "react";
import OrderDetails from "../../components/Profile/OrderDetails";

const OrderDetailsPage = () => {
  return (
    <>
      <div className="max-w-screen-4xl mx-auto pt-[120px]">
        <div className="w-full rounded-xl shadow-lg ">
          <OrderDetails />
        </div>
      </div>
    </>
  );
};

export default OrderDetailsPage;
