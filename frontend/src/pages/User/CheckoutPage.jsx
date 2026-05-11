import React from "react";
import { useNavigate } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import CheckoutSteps from "../../components/Checkout/CheckoutSteps";
import Checkout from "../../components/Checkout/Checkout";
import PageTransition from "../../components/UI/PageTransition";

const CheckoutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 max-w-screen-3xl mx-auto">
      <header className="max-w-screen-3xl  mx-auto fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b py-2">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-center pt-1">
          <CheckoutSteps active={1} />
          {/* Close button */}
          <div className=" absolute right-2 md:right-8 top-4 shadow-xl rounded-full bg-gray-400 hover:bg-gray-100 z-30   transition-colors">
            <RxCross2 size={20} className="cursor-pointer text-white p-0.5" onClick={() => navigate("/")} />
          </div>
        </div>
      </header>
      <PageTransition>
        <main className="pt-24 pb-12 px-2 lg:px-8 max-w-screen-2xl mx-auto">
          <Checkout />
        </main>
      </PageTransition>
    </div>
  );
};

export default CheckoutPage;
