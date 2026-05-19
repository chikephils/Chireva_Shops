import React, { useEffect, useState } from "react";
import { BsFillBagFill } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { server } from "../../server";
import api from "../../utils/axios";
import { toast } from "react-toastify";
import { numbersWithCommas } from "../../utils/priceDisplay";
import StatusBadge from "../UI/StatusBadge";
import Loader from "../UI/Loader";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderLoading, setOrderLoading] = useState(true);
  const [order, setOrder] = useState(null);

  const sellerToken = useSelector((state) => state.shop.sellerToken);

  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const buyer = order?.userSnapshot;

  const fetchOrder = async () => {
    if (!id) return;
    setOrderLoading(true);
    try {
      const response = await api.get(`${server}/order/get-seller-order/${id}`, {
        authType: "shop",
      });
      setOrder(response?.data.order);
    } catch (error) {
      console.error(error.response?.data.message);
    } finally {
      setOrderLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const updateStatus = async () => {
    setLoading(true);
    try {
      await api.put(
        `${server}/order/shop-update-order-status/${id}`,
        { status: "Shipped" },
        {
          authType: "shop",
        },
      );
      toast.success("Order marked as shipped");
      fetchOrder();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    setCancelLoading(true);
    try {
      await api.put(
        `${server}/order/shop-update-order-status/${id}`,
        { status: "Cancelled" },
        {
          authType: "shop",
        },
      );
      toast.success("Order has been Cancelled");
      fetchOrder();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update");
    } finally {
      setCancelLoading(false);
    }
  };

  const totalPrice = order?.totalPrice;
  const shipping = order?.shipping;

  return (
    <div className=" flex flex-col h-full">
      {/* Sticky Header */}
      <div className="fixed w-full left-0 right-0 z-20 bg-white border-b shadow-sm">
        <div className="max-w-screen-4xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BsFillBagFill className="text-red-600" size={28} />
            <h1 className="text-xl font-semibold text-gray-900">Order Details</h1>
          </div>

          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition">
            <RxCross1 size={24} className=" cursor-pointer text-white bg-black/50 rounded-full p-1 hover:bg-black/70 transition" />
          </button>
        </div>
      </div>
      {orderLoading ? (
        <div className="mx-auto max-w-screen-4xl flex items-center justify-center bg-gray-50 h-[calc(100vh-58px)]">
          {" "}
          <Loader />
        </div>
      ) : (
        <>
          <div className="max-w-screen-4xl px-2 lg:px-6 pt-20 space-y-6 pb-16">
            {/* Order Details */}
            <div className="bg-white rounded-lg shadow-sm border p-2 md:p-5 mb-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Order ID: <span className="font-medium text-sm text-gray-900">#{order?._id?.toUpperCase()}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Placed on:{" "}
                    <span className="font-medium">
                      {new Date(order?.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">₦{numbersWithCommas(totalPrice)}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
              <div className="p-5 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
              </div>

              <div className="divide-y">
                {order?.cart.map((item, index) => {
                  // Event price logic
                  const isEventActive =
                    item?.isEvent &&
                    item?.eventStartDate &&
                    item?.eventEndDate &&
                    new Date() >= new Date(item.eventStartDate) &&
                    new Date() <= new Date(item.eventEndDate);

                  const priceAtPurchase = isEventActive ? item.discountPrice : item.originalPrice;

                  return (
                    <div key={index} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50 transition">
                      <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                        <img src={item.images?.[0]?.url} alt={item.name} className="w-full h-full object-contain" />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-base font-medium text-gray-900 line-clamp-2">{item.name}</h3>
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <span className="text-sm text-gray-600">
                            ₦{numbersWithCommas(priceAtPurchase)} × {item.quantity}
                          </span>
                          {isEventActive && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                              Promo Price
                            </span>
                          )}
                        </div>
                        {isEventActive && item.originalPrice && item.originalPrice !== item.discountPrice && (
                          <p className="mt-1 text-xs text-gray-500 line-through">Original: ₦{numbersWithCommas(item.originalPrice)}</p>
                        )}
                      </div>

                      <div className="text-right sm:min-w-[120px]">
                        <p className="font-medium text-gray-900">₦{numbersWithCommas(priceAtPurchase * item.quantity)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-5 bg-gray-50 text-right border-t gap-4">
                <p className="text-lg font-semibold text-gray-800">Shipping: ₦{numbersWithCommas(shipping)}</p>
                <p className="text-lg font-semibold text-gray-800 mt-2">Total: ₦{numbersWithCommas(totalPrice)}</p>
              </div>
            </div>

            {/* Shipping & Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6 mb-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm border p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
                <div className="space-y-2 text-gray-700">
                  <p>{order?.shippingAddress?.address1}</p>
                  <p>
                    {order?.shippingAddress?.city} , {order?.shippingAddress?.country}
                  </p>
                  <p className="font-medium">Phone: {order?.userSnapshot?.phoneNumber || "—"}</p>
                </div>
              </div>

              {/* Buyer Information */}
              <div className="bg-white rounded-lg shadow-sm border p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Buyer Information</h2>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {buyer?.firstName && buyer?.lastName ? `${buyer.firstName} ${buyer.lastName}` : buyer?.name || "—"}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {buyer?.email || "—"}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {buyer?.phoneNumber || order?.user?.phoneNumber || "—"}
                  </p>
                </div>
              </div>

              {/* Payment & Status */}
              <div className="bg-white rounded-lg shadow-sm border p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment & Status</h2>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm  text-gray-600">
                      Payment Status:{" "}
                      {order?.paymentInfo?.status ? (
                        <span className="text-green-600 font-semibold">Paid</span>
                      ) : (
                        <span className="text-red-600 font-semibold">Not Paid</span>
                      )}
                    </p>
                  </div>
                  {order?.paymentInfo?.status && (
                    <div>
                      <div className=" mb-3">
                        <p className="pb-1">
                          <span className=" text-sm text-gray-600">
                            Order Status: <StatusBadge status={order?.status} />
                          </span>
                        </p>
                        {/* Seller Action */}
                        <div className="flex items-center justify-between">
                          {order?.status === "Processing" && (
                            <button
                              disabled={loading}
                              onClick={() => updateStatus(order?._id)}
                              className={`mt-3 px-3 py-3 rounded-full justify-center items-center text-sm min-w-[120px] ${loading ? "bg-indigo-400 opacity-60 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
                            >
                              {loading ? "Please Wait" : "Mark as Shipped"}
                            </button>
                          )}
                          {order?.status === "Processing" && (
                            <button
                              disabled={cancelLoading}
                              onClick={() => cancelOrder(order?._id)}
                              className={`mt-3 px-3 py-3 rounded-full justify-center items-center text-sm min-w-[120px] ${cancelLoading ? "bg-red-400 opacity-60 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700"}`}
                            >
                              {cancelLoading ? "Please Wait" : "Cancel Order"}
                            </button>
                          )}
                        </div>
                      </div>
                      {order?.refund?.status === "Refund Requested" && (
                        <div className="mb-3 p-3 bg-yellow-100 text-yellow-700 rounded-md font-medium">
                          ⚠️ Customer has requested a refund
                        </div>
                      )}

                      {order?.refund?.status === "Refunded" && (
                        <div className="mb-3 p-3 bg-green-100 text-green-700 rounded-md font-medium">✅ Refund completed</div>
                      )}

                      {order?.refund?.status === "Rejected" && (
                        <div className="mb-3 p-3 bg-red-100 text-red-700 rounded-md font-medium">❌ Refund rejected</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderDetails;
