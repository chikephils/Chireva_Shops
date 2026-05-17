import React, { useEffect, useState } from "react";
import { BsFillBagFill } from "react-icons/bs";
import { RxAvatar, RxCross1 } from "react-icons/rx";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import api from "../../utils/axios";
import { server } from "../../server";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../../features/user/userSlice";
import { getAllProducts } from "../../features/product/productSlice";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import SmallLoader from "../UI/SmallLoader";
import { numbersWithCommas } from "../../utils/priceDisplay";
import StatusBadge from "../UI/StatusBadge";
import Loader from "../UI/Loader";
import { FaFire } from "react-icons/fa";

const OrderDetails = () => {
  const { id } = useParams();
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [loader, setLoader] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [updatingMap, setUpdatingMap] = useState({});
  const [requestingMap, setRequestingMap] = useState({});

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await api.get(`${server}/order/get-order/${id}`);
      setOrderData(response?.data);
    } catch (error) {
      console.error(error.response?.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const canRequestRefund = (order) => {
    if (!order?.deliveredAt) return false;

    const deliveredAt = new Date(order.deliveredAt);
    const now = new Date();

    const diffMs = now - deliveredAt;

    const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

    return diffMs <= FORTY_EIGHT_HOURS;
  };

  const handleUpdateStatus = async (orderId, status) => {
    setUpdatingMap((prev) => ({ ...prev, [orderId]: true }));
    try {
      await api.put(`${server}/order/update-order-status/${orderId}`, { status });

      toast.success("Order updated");
      fetchOrder();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update order");
    } finally {
      setUpdatingMap((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error("Please select a rating");
      return;
    }
    setLoader(true);
    try {
      await api.put(
        `${server}/product/create-new-review`,
        {
          user,
          rating,
          comment,
          productId: selectedProduct?._id,
          orderId: selectedProduct?.orderId,
        },
        { headers: { "Content-Type": "application/json" }, },
      );
      toast.success("Review submitted successfully");
      setIsReviewOpen(false);
      setComment("");
      setRating(0);
      fetchOrder();
      dispatch(getAllProducts());
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setLoader(false);
    }
  };

  const handleRequestRefund = async (childOrderId) => {
    setRequestingMap((prev) => ({ ...prev, [childOrderId]: true }));
    try {
      const res = await api.put(`${server}/order/order-refund/${childOrderId}`, null);
      toast.success(res.data.message || "Refund request submitted");
      fetchOrder();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to request refund");
    } finally {
      setRequestingMap((prev) => ({ ...prev, [childOrderId]: false }));
    }
  };

  // Grand total (kept for internal calculation only)
  const grandTotal = orderData?.orders?.reduce((acc, o) => acc + o.totalPrice, 0);

  return (
    <div className="h-full bg-gray-50 pb-10">
      {/* Header Bar */}
      <div className="sticky z-10 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-screen-4xl mx-auto px-4 lg:px-8">
          <div className="flex justify-between h-14 lg:h-12 items-center">
            <div className="flex items-center gap-3">
              <BsFillBagFill className="text-red-600" size={24} />
              <h1 className="text-lg font-semibold text-gray-900">Order Details</h1>
            </div>
            <button onClick={() => navigate(-1)} className="rounded-full hover:bg-gray-100 transition" aria-label="Close">
              <RxCross1 size={24} className="cursor-pointer text-white bg-black/50 rounded-full p-1 hover:bg-black/70 transition" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[63vh] md:h-[71vh]">
          <Loader />
        </div>
      ) : (
        <div className="max-w-screen-4xl mx-auto px-4 lg:px-8 pt-6 space-y-6 h-[calc(100%-52px)] overflow-y-scroll scrollbar-hide pb-10">
          {/* Parent Order Info */}
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-5 border border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium text-gray-900">Parent Order ID:</span> #{orderData?.parentOrderId.toUpperCase()}.
              </div>
              <div>
                <span className="font-medium text-gray-900">
                  {orderData?.orders?.[0]?.createdAt
                    ? new Date(orderData.orders[0].createdAt).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Orders per Shop */}
          <div className="space-y-6">
            {orderData?.orders?.map((childOrder) => {
              const isUpdating = updatingMap[childOrder._id];
              const isRequesting = requestingMap[childOrder._id];
              return (
                <div key={childOrder._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Shop Header with Avatar + Info */}
                  <div className="px-5 py-4 border-b bg-gray-50 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      {childOrder.shopSnapshot?.shopAvatar ? (
                        <img
                          src={childOrder.shopSnapshot?.shopAvatar?.url}
                          alt={childOrder.shopSnapshot?.shopName}
                          className="w-12 h-12 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <RxAvatar size={32} className="text-gray-500" />
                        </div>
                      )}
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{childOrder.shopSnapshot?.shopName}</h2>
                        <p className="text-sm text-gray-600">Phone: {childOrder.shopSnapshot?.shopPhoneNumber || "—"}</p>
                        {childOrder.shopSnapshot?.shopAddress && (
                          <p className="text-sm text-gray-600 line-clamp-1">Address: {childOrder.shopSnapshot?.shopAddress}</p>
                        )}
                      </div>
                    </div>

                    <StatusBadge status={childOrder.status} />
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-gray-200">
                    {childOrder.cart.map((item) => {
                      // Event price logic
                      const isEventActive =
                        item?.isEvent &&
                        item?.eventStartDate &&
                        item?.eventEndDate &&
                        new Date() >= new Date(item.eventStartDate) &&
                        new Date() <= new Date(item.eventEndDate);

                      const priceAtPurchase = isEventActive ? item.discountPrice : item.originalPrice;

                      const isReviewed = item?.isReviewed;

                      return (
                        <div key={item._id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50 transition">
                          {/* Product Image */}
                          <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                            <img src={item.images?.[0]?.url} alt={item.name} className="w-full h-full object-contain" />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-medium text-gray-900 truncate">{item.name}</h3>

                            <div className="mt-1 flex items-center gap-2 text-sm">
                              <span className="text-gray-600">
                                ₦{numbersWithCommas(priceAtPurchase)} × {item.quantity}
                              </span>

                              {isEventActive && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                  <FaFire size={12} />
                                </span>
                              )}
                            </div>

                            {/* Show original price if event is active */}
                            {isEventActive && item.originalPrice && item.originalPrice !== item.discountPrice && (
                              <p className="text-xs text-gray-500 line-through">Original: ₦{numbersWithCommas(item.originalPrice)}</p>
                            )}
                          </div>

                          {/* Write Review Button */}
                          {childOrder.status === "Delivered" && !isReviewed && (
                            <button
                              onClick={() => {
                                setSelectedProduct({ ...item, orderId: childOrder._id });
                                setIsReviewOpen(true);
                              }}
                              className="mt-2 sm:mt-0 whitespace-nowrap px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition"
                            >
                              Write Review
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Shop Total & Refund Button */}
                  <div
                    className="px-5 py-4 border-t border-gray-200 bg-gray-50 
                flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4"
                  >
                    {/* Prices Section */}
                    <div className="flex flex-col gap-1">
                      <p className="font-medium text-gray-900">Item(s) Total: ₦{numbersWithCommas(childOrder.itemsPrice)}</p>
                      <p className="font-medium text-gray-900">Shipping: ₦{numbersWithCommas(childOrder.shipping)}</p>
                      <p className="font-medium text-gray-900">Shop Total: ₦{numbersWithCommas(childOrder.totalPrice)}</p>
                    </div>

                    {/* Buyer: Mark as Delivered */}
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
                      {/* Delivered Button */}
                      {childOrder.status === "Shipped" && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(childOrder._id, "Delivered")}
                          className={`px-5 py-2 rounded-full text-sm text-white transition
                        min-w-[160px] flex items-center justify-center
                        ${isUpdating ? "bg-green-400 opacity-60 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}
                      `}
                        >
                          {isUpdating ? "Please Wait" : "Mark as Delivered"}
                        </button>
                      )}
                      {/* Refund Button only when order is delivered */}
                      {childOrder.status === "Delivered" && childOrder.refund?.status === "None" && canRequestRefund(childOrder) && (
                        <button
                          disabled={isRequesting}
                          onClick={() => handleRequestRefund(childOrder._id)}
                          className={`px-5 py-2 rounded-full text-sm text-white transition
                        min-w-[160px] font-medium flex items-center justify-center
                        ${isRequesting ? "bg-red-400 opacity-60 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}
                      `}
                        >
                          {isRequesting ? "Please Wait" : "Request Refund"}
                        </button>
                      )}
                      {childOrder.refund?.status === "None" && childOrder.status === "Delivered" && !canRequestRefund(childOrder) && (
                        <p className="text-sm text-gray-500 font-medium">Refund window has expired (48hrs)</p>
                      )}
                    </div>
                    {childOrder?.refund?.status === "Refund Requested" && (
                      <div className="mb-3 p-3 bg-yellow-100 text-yellow-700 rounded-md font-medium">⚠️ Refund requested</div>
                    )}

                    {childOrder?.refund?.status === "Refunded" && (
                      <div className="mb-3 p-3 bg-green-100 text-green-700 rounded-md font-medium">✅ Refund completed</div>
                    )}

                    {childOrder?.refund?.status === "Rejected" && (
                      <div className="mb-3 p-3 bg-red-100 text-red-700 rounded-md font-medium">❌ Refund rejected</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary & Shipping */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grand Total Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 space-y-1.5">
              <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              <div className="flex justify-between text-base">
                <span className="text-gray-700 text-sm ">Order Total:</span>
                <span className="font-medium text-green-600">₦{numbersWithCommas(grandTotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-700 text-sm ">Service fee:</span>
                <span className="font-medium text-sm text-gray-500">
                  ₦{numbersWithCommas(orderData?.orders?.[0]?.paymentInfo?.totalServiceFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 text-sm ">Amount Paid:</span>
                <span className="font-medium text-sm text-gray-500">
                  ₦{numbersWithCommas(orderData?.orders?.[0]?.paymentInfo?.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm  text-gray-600">Payment Status: </span>
                {orderData?.orders?.[0]?.paymentInfo?.status ? (
                  <span className="text-green-600 font-semibold">Paid</span>
                ) : (
                  <span className="text-red-600 font-semibold">Not Paid</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 text-sm ">Payment Type:</span>
                <span className="font-medium text-sm text-gray-500">{orderData?.orders?.[0]?.paymentInfo.type}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <p>{orderData?.shippingAddress?.address1}</p>
                <p>
                  {orderData?.shippingAddress?.city}, {orderData?.shippingAddress?.state}
                </p>
                <p>{orderData?.shippingAddress?.country}</p>
                <p className="pt-2 font-medium">Phone: {orderData?.orders?.[0]?.userSnapshot?.phoneNumber || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4 mt-20 md:mt-0">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[70vh] lg:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-5 py-2 lg:py-4 flex items-center justify-between z-10">
              {" "}
              <h2 className="text-xl font-semibold">Review Product</h2>
              <button onClick={() => setIsReviewOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                {" "}
                <RxCross1 size={24} />{" "}
              </button>
            </div>
            <div className="p-3 lg:p-5 space-y-4 lg:space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={selectedProduct?.images?.[0]?.url || "/placeholder.jpg"}
                  alt=""
                  className="w-16 h-16 object-cover rounded-md border"
                />
                <div>
                  <h3 className="font-medium">{selectedProduct?.name}</h3>{" "}
                  <p className="text-sm text-gray-600">
                    {" "}
                    ₦{numbersWithCommas(selectedProduct?.priceAtPurchase)} × {selectedProduct?.quantity}{" "}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                  {" "}
                  Rating <span className="text-red-500">*</span>{" "}
                </label>
                <div className="flex gap-1">
                  {" "}
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)}>
                      {" "}
                      {rating >= star ? (
                        <AiFillStar className="text-3xl text-yellow-400" />
                      ) : (
                        <AiOutlineStar className="text-3xl text-gray-300" />
                      )}{" "}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                {" "}
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {" "}
                  Comment <span className="text-gray-400">(optional)</span>{" "}
                </label>{" "}
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
              <button
                onClick={handleReviewSubmit}
                disabled={loader || rating < 1}
                className={`w-full py-3 px-6 font-medium rounded-md text-white translate ${rating < 1 || loader ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
              >
                {loader ? <SmallLoader /> : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
