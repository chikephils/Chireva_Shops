import React from "react";
import CheckoutSteps from "../../components/Checkout/CheckoutSteps";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import PageTransition from "../../components/UI/PageTransition";

const OrderSuccessPage = ({ transactionId }) => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="text-center space-y-6 py-8">
        <CheckoutSteps className="mb-3" active={3} />
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <IoMdCheckmarkCircle size={48} className="text-green-600" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Successful! 🎉</h1>
          <p className="text-gray-600 mt-2">Thank you for your order</p>
        </div>

        {transactionId && (
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-sm text-gray-600">Transaction ID</p>
            <p className="font-mono font-medium text-gray-900 mt-1">{transactionId}</p>
          </div>
        )}

        <button
          onClick={() => navigate("/")}
          className="w-full py-4 px-6 bg-lime-400 hover:bg-lime-500 text-white font-semibold rounded-xl transition shadow-lg"
        >
          Continue Shopping
        </button>
      </div>
    </PageTransition>
  );
};

export default OrderSuccessPage;
