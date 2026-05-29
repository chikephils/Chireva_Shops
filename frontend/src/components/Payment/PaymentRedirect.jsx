import api from "../../utils/api";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { server } from "../../server";
import { useDispatch } from "react-redux";
import { clearCart } from "../../features/cart/cartSlice";
import Loader from "../UI/Loader";
import OrderSuccessPage from "../../pages/User/OrderSuccessPage";
import PaymentErrorPage from "../../pages/User/PaymentErrorPage";
import NotFoundPage from "../../pages/NotFoundPage";

const PaymentRedirect = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const queryParams = new URLSearchParams(location.search);

  const status = queryParams.get("status");
  const txRef = queryParams.get("tx_ref");
  const transactionId = queryParams.get("transaction_id");
  const type = queryParams.get("type");

  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState("");

  useEffect(() => {
    if (!txRef) {
      setLoading(false);
      setPaymentStatus("failed");
      return;
    }

    // Handle balance payments
    if (type === "balance") {
      const isSuccess = status === "success";
      setPaymentStatus(isSuccess ? "success" : "failed");
      if (isSuccess) dispatch(clearCart());
      setLoading(false);
      return;
    }

    // Handle Flutterwave payments
    const isFlutterwaveCompleted = status === "completed";
    if (!transactionId || !isFlutterwaveCompleted) {
      setLoading(false);
      setPaymentStatus("failed");
      return;
    }

    api
      .get(`${server}/payment/verify-payment`, {
        params: {
          tx_ref: txRef,
          transaction_id: transactionId,
        },
      })
      .then((res) => {
        if (res.data.success && res.data.status === "success") {
          setPaymentStatus("success");
          dispatch(clearCart());
        } else {
          setPaymentStatus("failed");
        }
      })
      .catch((err) => {
        console.error("Payment verification error:", err);
        setPaymentStatus("failed");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [txRef, transactionId, status, type, dispatch]);

  if (!txRef) return <NotFoundPage />;

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 text-center">
        {loading ? (
          <div className="space-y-6">
            <Loader />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Verifying Payment</h3>
              <p className="text-gray-600 mt-2">Please hold while we confirm your payment. Do not close this window.</p>
            </div>
          </div>
        ) : paymentStatus === "success" ? (
          <OrderSuccessPage transactionId={txRef} type={type} />
        ) : (
          <PaymentErrorPage transactionId={txRef} type={type} />
        )}
      </div>
    </div>
  );
};

export default PaymentRedirect;
