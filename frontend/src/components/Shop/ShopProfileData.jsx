import React, { useEffect, useMemo, useState } from "react";
import SellerProductCard from "../Route/ProductCard/SellerProductCard";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getShopProducts, getShopPromoProducts, selectAllProductsLoading } from "../../features/shop/shopSlice";
import { toast } from "react-toastify";
import Ratings from "../ProductDetails/Ratings";
import Loader from "../UI/Loader";

const ShopProfileData = ({ isOwner }) => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const isProductsLoading = useSelector(selectAllProductsLoading);

  const [products, setProducts] = useState(null);
  const [activeTab, setActiveTab] = useState(1);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    dispatch(getShopProducts(id))
      .unwrap()
      .then(setProducts)
      .catch((err) => {
        console.error("Products fetch failed:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch, id]);

  const tabs = useMemo(
    () => [
      { id: 1, label: "Products", count: products?.length || 0 },
      { id: 2, label: "Promo-Sales" },
      { id: 3, label: "Reviews" },
    ],
    [products?.length],
  );

  return (
    <div className="w-full bg-white h-full rounded-lg">
      <div
        className="
               sticky top-[64px] left-0 z-10 bg-gray-300 border-b border-gray-200
               shadow-lg px-2 lg:px-8 rounded-lg
             "
      >
        <div className="max-w-screen-4xl mx-auto flex items-center justify-between h-14">
          <div className="w-full flex items-center gap-6 md:gap-10 overflow-x-scroll py-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                       relative pb-3 font-medium text-sm md:text-base whitespace-nowrap transition-colors
                       ${
                         activeTab === tab.id
                           ? "text-red-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-600"
                           : "text-gray-600 hover:text-gray-900"
                       }
                     `}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1.5 text-xs font-normal text-gray-500">({tab.count})</span>
                )}
              </button>
            ))}
            <div className="w-full flex justify-end">
              {isOwner && (
                <Link
                  to="/dashboard"
                  className="
                     inline-flex items-center px-4 py-3
                     bg-indigo-600 hover:bg-indigo-700 text-white
                     text-sm font-medium rounded-lg shadow-sm transition-colors
                   "
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="max-w-screen-4xl mx-auto px-2 lg:px-6 py-4">
        {activeTab === 1 && <ProductsTab products={products} loading={loading} />}
        {activeTab === 2 && <PromoTab shopId={id} />}
        {activeTab === 3 && <ReviewsTab products={products} isLoading={isProductsLoading} />}
      </div>
    </div>
  );
};

const ProductsTab = ({ products, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 h-[60vh]">
        <Loader />
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-center py-10 text-gray-500 text-lg font-medium">
        No products available yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-[20px] md:grid-cols-3 md:gap-[30px] lg:grid-col-3 xl:grid-cols-4 lg:gap-[30px] xl:gap-[30px] 4xl:grid-cols-5 py-1 pb justify-items-center">
      {products.map((product) => (
        <SellerProductCard product={product} key={product._id} />
      ))}
    </div>
  );
};

const PromoTab = ({ shopId }) => {
  const dispatch = useDispatch();
  const [promo, setPromo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!shopId) return;
    setLoading(true);
    dispatch(getShopPromoProducts(shopId))
      .unwrap()
      .then(setPromo)
      .catch((err) => {
        toast.error("Failed to Promo-Sales");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [dispatch, shopId]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-10 h-[60vh]">
        <Loader />
      </div>
    );

  if (!promo?.length) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-center py-16 text-gray-500 text-lg font-medium">
        You are not Running any Promo-Sales.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-[20px] md:grid-cols-3 md:gap-[30px] lg:grid-col-3 xl:grid-cols-4 lg:gap-[30px] xl:gap-[30px] 4xl:grid-cols-5 py-1 pb-10 justify-items-center">
      {promo.map((product) => (
        <SellerProductCard product={product} key={product._id} />
      ))}
    </div>
  );
};

const ReviewsTab = ({ products, isLoading }) => {
  const allReviews = useMemo(() => {
    return products?.flatMap((p) => p.reviews || []) ?? [];
  }, [products]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-10 h-[60vh]">
        <Loader />
      </div>
    );

  if (!allReviews.length) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-center py-16 text-gray-500 text-lg font-medium">No reviews yet.</div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {allReviews.map((review, idx) => (
        <div
          key={idx}
          className="
            flex gap-4 p-4 rounded-xl
            bg-gray-50 border border-gray-200
            hover:bg-gray-100 transition-colors
          "
        >
          <img
            src={review.user?.avatar?.url}
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
            onError={(e) => (e.target.src = "/default-avatar.png")}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900">{review.user?.firstName || "User"}</span>
              <Ratings rating={review.rating} />
            </div>

            <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>

            <p className="mt-2 text-xs text-gray-500">
              <span className="font-medium">
                {new Date(review.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShopProfileData;
