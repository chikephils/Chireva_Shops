import React, { useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { FaArrowLeft, FaArrowRight, FaEdit } from "react-icons/fa";
import { numbersWithCommas } from "../../../utils/priceDisplay";
import { useSelector } from "react-redux";
import { selectAllShopProducts } from "../../../features/shop/shopSlice";
import { Link } from "react-router-dom";
import CountDown from "../../Events/CountDown";
import { FaFire } from "react-icons/fa6";

const SellerProductCardDetails = ({ setDetailsOpen, product }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const shopProducts = useSelector(selectAllShopProducts);

  const editedPrice = numbersWithCommas(product?.originalPrice);
  const editedDiscountPrice = numbersWithCommas(product?.discountPrice);

  const isEventActive =
    product?.isEvent &&
    product?.eventStartDate &&
    product?.eventEndDate &&
    new Date() >= new Date(product.eventStartDate) &&
    new Date() <= new Date(product.eventEndDate);

  const upComingEvent =
    product?.isEvent && product?.eventStartDate && product?.eventEndDate && new Date() < new Date(product.eventStartDate);

  const goToPrevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + product?.images?.length) % product?.images?.length);
  };

  const goToNextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % product?.images?.length);
  };

  // Shop-wide rating calculation
  const totalReviews = shopProducts?.reduce((acc, p) => acc + (p.reviews?.length || 0), 0) || 0;
  const totalRatingSum = shopProducts?.reduce((acc, p) => acc + (p.reviews?.reduce((sum, r) => sum + (r.rating || 0), 0) || 0), 0) || 0;
  const shopAvgRating = totalReviews > 0 ? (totalRatingSum / totalReviews).toFixed(2) : "0.00";

  return (
    <div className="fixed inset-0 isolate z-[999] bg-black/60 backdrop-blur-sm  flex items-center justify-center p-6 lg:p-4">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] lg:max-h-[80vh] flex flex-col md:flex-row md:py-5 pb-4 ">
        {/* Close button */}
        <button
          onClick={() => setDetailsOpen(false)}
          className="absolute top-2 right-2 z-10 p-1 bg-gray-800/70 hover:bg-gray-900 text-white rounded-full transition"
        >
          <RxCross1 size={22} />
        </button>

        {/* Left: Images */}
        <div className="w-full md:w-5/12 bg-gray-50 p-4 flex flex-col items-center">
          {/* Main image carousel */}
          <div className="relative w-full max-h-[250px] md:max-h-full max-w-sm aspect-square mb-2 lg:mb-6 rounded-xl overflow-hidden shadow-md">
            <img src={product.images?.[currentIndex]?.url} alt={product.name} className="w-full h-full object-contain bg-white" />

            {/* Navigation arrows */}
            {product.images?.length > 1 && (
              <>
                <button
                  onClick={goToPrevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-800 transition"
                >
                  <FaArrowLeft size={20} />
                </button>
                <button
                  onClick={goToNextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-800 transition"
                >
                  <FaArrowRight size={20} />
                </button>
              </>
            )}

            {/* Stock overlay */}
            {product.stock < 1 && (
              <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center">
                <span className="text-white text-2xl font-bold tracking-wide">OUT OF STOCK</span>
              </div>
            )}
          </div>

          {/* Thumbnail strip (optional - only if > 1 image) */}
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition ${
                    idx === currentIndex ? "border-indigo-600" : "border-transparent"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {product?.isEvent && (
            <div className="mt-3 hidden md:block">
              <div className="inline-flex items-center gap-1 px-2 py-1.5 bg-amber-50 rounded-full border border-amber-200">
                <FaFire size={18} className="text-amber-600" title="Limited-time event product" />
                <CountDown product={product} />
              </div>
            </div>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="w-full md:w-7/12 p-4 lg:p-6 overflow-y-auto scrollbar-hide bg-white">
          <div className="flex items-start justify-between">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 pr-10">{product.name}</h1>
            {/* Edit button hint */}
            <Link to={`/dashboard/edit-product/${product?._id}`}>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-sm">
                <FaEdit size={18} />
                Edit
              </button>
            </Link>
          </div>
          <div className="flex justify-center">
            {product?.isEvent && (
              <div className="mt-3 md:hidden block">
                <div className="inline-flex items-center gap-1 px-2 py-1.5 bg-amber-50 rounded-full border border-amber-200">
                  <FaFire size={18} className="text-amber-600" title="Limited-time event product" />
                  <CountDown product={product} />
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 md:mt-6 space-y-4 md:space-y-6">
            {/* Description */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Description</h4>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {product.description || "No description provided."}
              </p>
            </div>

            {/* Pricing */}
            <div className="flex items-end gap-4">
              {product?.isEvent && isEventActive && product?.discountPrice ? (
                <>
                  <p className="text-xl md:text-2xl font-medium text-indigo-600">₦ {editedDiscountPrice}</p>
                  <p className="text-base md:text-xl font-medium text-gray-500 line-through">₦ {editedPrice}</p>
                </>
              ) : product?.isEvent && !isEventActive ? (
                <>
                  <p className="text-xl md:text-2xl font-medium text-black">₦ {editedPrice}</p>
                  <p className="text-base md:text-xl font-medium text-indigo-500 line-through">₦ {editedDiscountPrice}</p>
                </>
              ) : (
                <p className="text-xl md:text-2xl font-medium">₦ {editedPrice}</p>
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <StatBox label="Stock" value={product.stock || 0} color={product.stock < 1 ? "text-red-600" : "text-teal-600"} />
              <StatBox label="Sold" value={product.sold_out || 0} color="text-teal-600" />
              <StatBox label="Reviews" value={product.reviews?.length || 0} color="text-purple-600" />
              <StatBox label="Rating" value={`${product.ratings?.toFixed(1) || "—"} ★`} color="text-amber-600" />
            </div>

            {/* Shop info */}
            <div className="mt-6 flex items-center gap-4 w-full max-w-md">
              <img
                src={product.shop?.avatar?.url}
                alt={product.shop?.shopName}
                className="w-14 h-14 rounded-full object-cover border-2 border-indigo-200"
              />
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{product.shop?.shopName}</h3>
                <p className="text-sm text-gray-600 mt-0.5">{shopAvgRating} ★</p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold mb-3">Product Details</h4>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-600 ">Product ID</dt>
                  <dd className="font-medium text-sm">{product._id}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Created</dt>
                  <dd className="font-medium text-sm">{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Last Updated</dt>
                  <dd className="font-medium text-sm">{product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Category</dt>
                  <dd className="font-medium text-sm">{product.category || "—"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, color = "text-gray-900" }) => (
  <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
    <p className="text-sm text-gray-600">{label}</p>
    <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
  </div>
);

export default SellerProductCardDetails;
