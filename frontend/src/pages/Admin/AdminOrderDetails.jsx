import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { BsFillBagFill } from "react-icons/bs";
import { RxAvatar, RxCross1 } from "react-icons/rx";
import { numbersWithCommas } from "../../utils/priceDisplay";
import StatusBadge from "../../components/UI/StatusBadge";
import api from "../../utils/axios";
import { server } from "../../server";
import Loader from "../../components/UI/Loader";
import { FaFire } from "react-icons/fa";
import { toast } from "react-toastify";

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await api.get(`${server}/order/admin-order-details/${id}`, {});
      setOrder(response.data.order);
    } catch (error) {
      console.error(error.response?.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (id, status) => {
    setIsUpdating(true);
    try {
      await api.put(`${server}/order/update-order-status/${id}`, { status });

      toast.success("Order updated");
      fetchOrder();
    } catch (err) {
      console.error(err?.response?.data?.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const acceptRefund = async (id) => {
    setAccepting(true);
    try {
      await api.put(`${server}/order/order-refund-action/${id}`, { status: "Approve" });

      toast.success("Refund processed");
      fetchOrder();
    } catch (err) {
      console.error(err?.response?.data?.message);
    } finally {
      setAccepting(false);
    }
  };

  const rejectRefund = async (id) => {
    setCancelLoading(true);
    try {
      await api.put(`${server}/order/order-refund-action/${id}`, { status: "Reject" });

      toast.success("Refund rejected");
      fetchOrder();
    } catch (err) {
      console.error(err?.response?.data?.message);
    } finally {
      setCancelLoading(false);
    }
  };

  const buyer = order?.userSnapshot;

  const totalPrice = order?.totalPrice;

  return (
    <div className="min-h-screen max-w-screen-4xl mx-auto mt-[68px] px-4 lg:px-8  bg-gray-950 text-gray-100">
      {/* Header  */}
      <div className="w-full fixed left-0 right-0  rounded-xl shadow-lg h-[calc(100%-120px)] ">
        <div className="sticky z-10 bg-gray-900 border-b border-gray-800 shadow-sm">
          <div className="max-w-screen-4xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BsFillBagFill className="text-red-500" size={24} />
              <h1 className="text-lg font-semibold text-white">Order Details</h1>
            </div>
            <button onClick={() => navigate(-1)} className="rounded-full hover:bg-gray-800 transition p-1" aria-label="Close">
              <RxCross1 size={24} className="cursor-pointer text-gray-300 hover:text-white transition" />
            </button>
          </div>
        </div>
        {loading ? (
          <div className="mx-auto max-w-screen-4xl flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 h-[73vh] md:h-[75vh]">
            {" "}
            <Loader />
          </div>
        ) : (
          <>
            {/* Main Content */}
            <div className="max-w-screen-4xl mx-auto px-4 lg:px-8 pt-6 space-y-6 h- h-[calc(100%-52px)] overflow-y-scroll scrollbar-hide  pb-10">
              {/* Order Summary Card */}
              <div className="bg-gray-900 rounded-lg shadow border border-gray-800 p-2 md:p-5">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-400">
                      Order ID: <span className="font-medium text-gray-200">#{order?._id?.toUpperCase()}</span>
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Placed on:{" "}
                      <span className="font-medium text-gray-300">
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
                    <p className="text-xl font-bold text-white">₦{numbersWithCommas(totalPrice)}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-900 rounded-lg shadow border border-gray-800 overflow-hidden">
                <div className="p-5 border-b border-gray-800 bg-gray-800/50">
                  <h2 className="text-lg font-semibold text-white">Order Items</h2>
                </div>

                <div className="divide-y divide-gray-800">
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
                      <div key={index} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-600 transition">
                        <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-gray-400 rounded-md overflow-hidden">
                          <img src={item.images?.[0]?.url} alt={item.name} className="w-full h-full object-contain" />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-base font-medium text-gray-300 line-clamp-2">{item.name}</h3>
                          <div className="mt-1 flex items-center gap-2 text-sm">
                            <span className="text-sm text-gray-300">
                              ₦{numbersWithCommas(priceAtPurchase)} × {item.quantity}
                            </span>
                            {isEventActive && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                <FaFire size={12} />
                              </span>
                            )}
                          </div>
                          {isEventActive && item.originalPrice && item.originalPrice !== item.discountPrice && (
                            <p className="mt-1 text-xs text-gray-300 line-through">Original: ₦{numbersWithCommas(item.originalPrice)}</p>
                          )}
                        </div>

                        <div className="text-right sm:min-w-[120px]">
                          <p className="font-medium text-gray-300">₦{numbersWithCommas(priceAtPurchase * item.quantity)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-5 bg-gray-800/30 text-right border-t border-gray-800">
                  <p className="text-lg font-bold text-white">Total: ₦{numbersWithCommas(totalPrice)}</p>
                </div>
              </div>

              {/* Grid of Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Buyer / Shipping Info */}
                <div className="bg-gray-900 rounded-lg shadow border border-gray-800 p-5">
                  <h2 className="text-lg font-semibold text-white mb-4">Buyer / Shipping Info</h2>
                  <div className="space-y-2 text-gray-300 text-sm">
                    <p>
                      <span className="font-medium text-gray-200">Name:</span>{" "}
                      {buyer?.firstName && buyer?.lastName ? `${buyer.firstName} ${buyer.lastName}` : buyer?.name || "—"}
                    </p>
                    <p>
                      <span className="font-medium text-gray-200">Shipping Address:</span> {order?.shippingAddress?.address1},{" "}
                      {order?.shippingAddress?.city}, {order?.shippingAddress?.country}
                    </p>
                    <p>
                      <span className="font-medium text-gray-200">Email:</span> {buyer?.email || "—"}
                    </p>
                    <p>
                      <span className="font-medium text-gray-200">Phone:</span> {buyer?.phoneNumber || "—"}
                    </p>
                  </div>
                </div>

                {/* Shop Info */}
                <div className="bg-gray-900 rounded-lg shadow border border-gray-800 p-5">
                  <h2 className="text-lg font-semibold text-white mb-4">Shop Information</h2>
                  <div className="space-y-3 text-sm text-gray-300">
                    <div className="flex items-center gap-4">
                      {order?.shopSnapshot?.shopAvatar ? (
                        <img
                          src={order?.shopSnapshot?.shopAvatar?.url}
                          alt={order.shopSnapshot?.shopName}
                          className="w-12 h-12 rounded-full object-cover border border-gray-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                          <RxAvatar size={32} className="text-gray-400" />
                        </div>
                      )}
                      <p className="font-medium text-gray-200 text-base">{order?.shopSnapshot?.shopName || "Unknown Shop"}</p>
                    </div>

                    <p className="text-gray-300">Phone: {order?.shopSnapshot?.shopPhoneNumber}</p>
                    <p className="text-gray-300">Address: {order?.shopSnapshot?.shopAddress}</p>
                  </div>
                </div>

                {/* Payment & Status */}
                <div className="bg-gray-900 rounded-lg shadow border border-gray-800 p-5">
                  <h2 className="text-lg font-semibold text-white mb-4">Payment & Status</h2>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-300">
                        Payment Status:{" "}
                        {order?.paymentInfo?.status ? (
                          <span className="text-green-400 font-semibold">Paid</span>
                        ) : (
                          <span className="text-red-400 font-semibold">Not Paid</span>
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-300">
                        Order Status: <StatusBadge status={order?.status} />
                      </p>
                    </div>

                    {/* Refund Notice */}
                    {order?.refund?.status === "Refund Requested" && (
                      <div className="p-3 bg-yellow-900/40 text-yellow-400 rounded-md font-medium">⚠️ Refund Requested</div>
                    )}

                    {order?.refund?.status === "Refunded" && (
                      <div className="p-3 bg-green-900/40 text-green-400 rounded-md font-medium">✅ Refund Completed</div>
                    )}

                    {order?.refund?.status === "Refund Rejected" && (
                      <div className="p-3 bg-red-900/40 text-red-400 rounded-md font-medium">❌ Refund Rejected</div>
                    )}

                    {/* CTA Actions */}
                    <div className="flex flex-col gap-3 pt-3">
                      {/*  ORDER FLOW */}
                      {order?.status === "Shipped" && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order?._id, "Delivered")}
                          className={`px-5 py-2 rounded-full text-sm text-white transition
                            min-w-[160px] flex items-center justify-center
                            ${isUpdating ? "bg-green-400 opacity-60 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                        >
                          {isUpdating ? "Please Wait..." : "Mark as Delivered"}
                        </button>
                      )}

                      {/*REFUND FLOW */}
                      {order?.refund?.status === "Refund Requested" && (
                        <div className="flex items-center justify-between">
                          {/* Accept Refund */}
                          <button
                            disabled={accepting}
                            onClick={() => acceptRefund(order?._id)}
                            className={`px-3 py-3 rounded-full justify-center items-center text-sm min-w-[120px] text-white transition
                             flex 
                            ${accepting ? "bg-green-400 opacity-60 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                          >
                            {accepting ? "Processing..." : "Accept Refund"}
                          </button>

                          {/* Reject Refund */}
                          <button
                            disabled={cancelLoading}
                            onClick={() => rejectRefund(order?._id)}
                            className={`px-3 py-3 rounded-full justify-center items-center text-sm min-w-[120px] text-white transition
                           flex 
                            ${cancelLoading ? "bg-red-400 opacity-60 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
                          >
                            {cancelLoading ? "Processing..." : "Reject Refund"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrderDetails;
