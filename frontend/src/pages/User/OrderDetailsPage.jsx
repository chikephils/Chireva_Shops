import React from "react";
import OrderDetails from "../../components/Profile/OrderDetails";

const OrderDetailsPage = () => {
  return (
    <>
      <div className="max-w-screen-4xl mx-auto pt-[120px] px-4 lg:px-8">
        <div className="w-full fixed  left-0 right-0 mx-auto rounded-xl shadow-lg h-[calc(100vh-130px)]">
          <OrderDetails />
        </div>
      </div>
    </>
  );
};

export default OrderDetailsPage;
