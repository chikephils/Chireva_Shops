import React from "react";
import WithdrawMoney from "../../components/Shop/WithdrawMoney";

const ShopWithdrawalPage = () => {
  return (
    <>
      <div className="max-w-screen-4xl mx-auto mt-[62px] px-4 lg:px-8">
        <div className="w-full fixed  left-0 right-0 mx-auto rounded-xl shadow-lg h-[calc(100%-62px)]">
          <WithdrawMoney />
        </div>
      </div>
      {/* <Footer /> */}
    </>
  );
};

export default ShopWithdrawalPage;
