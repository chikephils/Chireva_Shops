import React from "react";
import { useNavigate } from "react-router-dom";
import { MdErrorOutline } from "react-icons/md";
import PageTransition from "../../components/UI/PageTransition";

const PaymentErrorPage = ({ orderId }) => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="text-center space-y-6 py-8">
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <MdErrorOutline size={48} className="text-red-600" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Failed</h1>
          <p className="text-gray-600 mt-2">We couldn't process your payment. Please try again.</p>
        </div>

        {orderId && (
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-mono font-medium text-gray-900 mt-1">{orderId}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/checkout")}
            className="flex-1 p-2 text-sm md:text-base bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition"
          >
            Try Again
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex-1 p-2 text-sm md:text-base bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-xl transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default PaymentErrorPage;
