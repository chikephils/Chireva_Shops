import React, { useState } from "react";
import CheckoutSteps from "../../components/Checkout/CheckoutSteps";
import { closePaymentModal, useFlutterwave } from "flutterwave-react-v3";
import { RxCross1 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectUser } from "../../features/user/userSlice";
import api from "../../utils/axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { numbersWithCommas } from "../../utils/priceDisplay";
import { FaFire } from "react-icons/fa6";

const PaymentPage = ({ orderData, setShowPayment }) => {
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const totalAmount = orderData?.totalAmount;
  const shipping = orderData?.shipping;
  const serviceFee = orderData?.serviceFee;
  const editedPrice = numbersWithCommas(totalAmount);
  const editedShippingPrice = numbersWithCommas(shipping);
  const [isLoading, setIsLoading] = useState(false);
  const availableBalance = user?.availableBalance;

  const formatPrice = (num) => numbersWithCommas(Math.ceil(num));

  const tx_ref = orderData?.paymentId;

  const config = {
    public_key: "FLWPUBK_TEST-4bfb059aab8ea1c5cd2cf17d7e73bd96-X",
    tx_ref: tx_ref,
    amount: totalAmount,
    currency: "NGN",
    payment_options: "card,mobilemoney,ussd",
    redirect_url: `${import.meta.env.VITE_FRONTEND_URL}/pay`,
    customer: {
      email: user?.email,
      phone_number: user?.phoneNumber,
      name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    },
    customizations: {
      title: "CHIREVA",
      description: "Payment for items in cart",
      logo: "https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg",
    },
    configurations: {
      session_duration: 10,
      max_retry_attempt: 5,
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  const handlePaymentWithFlutterwave = () => {
    setLoading(true);

    handleFlutterPayment({
      callback: (response) => {
        console.log("Flutterwave Callback Response:", response);
        toast.info("Payment process finished, please wait for verification.");
      },

      onClose: () => {
        setLoading(false);
        setShowPayment(false);
      },
    });
  };

  const handlePaymentWithBalance = async () => {
    if (!orderData?.totalAmount) return;

    if (orderData.totalAmount > availableBalance) {
      toast.warn("Insufficient Balance");
      return;
    }
    setIsLoading(true);

    try {
      // Verify payment on the backend
      const res = await api.get(`${server}/payment/verify-balance-payment`, {
        params: { tx_ref: orderData?.paymentId },
        withCredentials: true,
      });

      if (res.data.success && res.data.status === "success") {
        navigate(`/pay?status=success&type=balance&tx_ref=${orderData?.paymentId}`);
      } else {
        navigate(`/pay?status=error&type=balance&tx_ref=${orderData?.paymentId}`);
      }
    } catch (err) {
      toast.error(err);
      navigate(`/pay?status=error&type=balance&tx_ref=${orderData?.paymentId}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative bg-gray-200 text-white px-2 py-4">
          <div className="mx-auto flex items-center justify-center">
            <CheckoutSteps active={2} />

            {/* Close button */}
            <div className="absolute right-2 md:right-8 top-4 shadow-xl rounded-full p-1 bg-gray-400 hover:bg-red-800/30 transition-colors">
              <RxCross1 size={20} className="cursor-pointer text-white p-0.5" onClick={() => setShowPayment(false)} />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-2 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: Orders grouped by shop */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-8">
                {orderData?.orders?.map((order) => (
                  <div key={order._id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    {/* Shop Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">{order.shopName}</h3>

                      <span className="text-sm text-gray-500">{order.cart.length} item(s)</span>
                    </div>

                    {/* Items */}
                    <div className="space-y-4">
                      {order.cart.map((item) => {
                        const currentPrice = item.priceAtPurchase;

                        return (
                          <div key={item._id} className="flex items-center gap-4 bg-white rounded-lg p-3 border border-gray-200">
                            {/* Image */}
                            <img
                              src={item.images?.[0]?.url}
                              alt={item.name}
                              className="w-16 h-16 object-contain rounded-md border bg-white flex-shrink-0"
                            />

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 line-clamp-2 leading-tight">{item.name}</h4>

                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>

                                {item.wasEventActive && (
                                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                    <FaFire size={14} />
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Price */}
                            <div className="text-right font-semibold text-gray-900 whitespace-nowrap">
                              ₦{numbersWithCommas(currentPrice * item.quantity)}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Shop totals */}
                    <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-700 space-y-1">
                      <div className="flex justify-between">
                        <span>Items Total</span>
                        <span>₦{numbersWithCommas(order.itemsPrice)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>₦{numbersWithCommas(order.shipping)}</span>
                      </div>

                      <div className="flex justify-between font-bold text-gray-900 pt-2">
                        <span>Total {order?.shopName}</span>
                        <span>₦{numbersWithCommas(order.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Shipping + Grand Total */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 sticky top-11">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Shipping Address</h3>

                <div className="space-y-2 text-gray-700 text-sm">
                  <p>{orderData?.shippingAddress?.address1}</p>
                  <p>
                    {orderData?.shippingAddress?.city}, {orderData?.shippingAddress?.state}, {orderData?.shippingAddress?.country}
                  </p>
                  <p>Zip: {orderData?.shippingAddress?.zipCode}</p>
                </div>

                {/* Divider */}
                <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
                  {/* Number of shops */}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Orders</span>
                    <span>{orderData?.orders?.length} shop(s)</span>
                  </div>
                  <div className="flex justify-between font-medium text-sm text-gray-600">
                    <span>Shipping:</span>
                    <span>₦{editedShippingPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-gray-600">
                    <span>Service Fee:</span>
                    <span>₦{formatPrice(serviceFee)}</span>
                  </div>

                  {/* Grand total */}
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span>₦{editedPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 md:px-6 py-2 bg-white">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Flutterwave Payment Button */}
            <button
              onClick={handlePaymentWithFlutterwave}
              disabled={loading || !orderData?.totalAmount}
              className={`
        w-full flex items-center justify-center gap-2 
        bg-[#FF4500] hover:bg-[#FF5500] active:bg-[#E63E00]
        text-white font-semibold text-sm py-3 
        rounded-2xl transition-all duration-200 shadow-md
        disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none
        ${loading ? "cursor-wait" : ""}
      `}
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                  </svg>
                  Processing payment...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  Pay with Card / Transfer
                  <span className="text-xs bg-white/20 px-2.5  rounded-full font-medium">Flutterwave</span>
                </span>
              )}
            </button>

            {/* Pay with Balance Button */}
            <button
              onClick={handlePaymentWithBalance}
              disabled={isLoading || !orderData?.totalAmount || availableBalance < orderData?.totalAmount}
              className={`
        w-full flex items-center justify-center gap-2 
        bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
        text-white font-semibold text-sm py-3 
        rounded-2xl transition-all duration-200 shadow-md
        disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none
      `}
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span>
                    Pay with Balance <span className="text-sm font-medium opacity-90">(₦{availableBalance?.toLocaleString()})</span>
                  </span>{" "}
                </div>
              )}
            </button>
          </div>

          <p className="text-center text-[10px] text-gray-400 mt-2">Secured by Flutterwave • Instant processing</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
