import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getShopProducts } from "../../features/shop/shopSlice";
import SmallLoader from "../UI/SmallLoader";
import { logoutSeller } from "../../features/shop/shopSlice";
import api from "../../utils/axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const ShopInfo = ({ isOwner = false, shop }) => {
  const dispatch = useDispatch();
  const { id } = useParams();

  const [products, setProducts] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const fetchShopProducts = async () => {
    try {
      const response = await api.get(`${server}/product/get-shop-products/${id}`);
      setProducts(response?.data?.products);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchShopProducts();
  }, [dispatch, id]);

  const navigate = useNavigate();

  const handleShopLogout = async () => {
    try {
      const res = await api.get(`${server}/shop/logout`, { withCredentials: true });

      dispatch(logoutSeller());
      localStorage.removeItem("persist:shop");
      navigate("/shop-login", { replace: true });
      toast.success(res.data.message || "Logged out successfully");
    } catch (error) {
      dispatch(logoutSeller());
      localStorage.removeItem("persist:shop");
      navigate("/shop-login", { replace: true });
      toast.error(error?.response?.data?.message || "Logout failed");
      console.error(error);
    }
  };

  const totalProducts = products?.length || 0;

  const totalReviews = products?.reduce((acc, p) => acc + (p.reviews?.length || 0), 0) || 0;

  const totalRatingSum = products?.reduce((acc, p) => acc + (p.reviews?.reduce((sum, r) => sum + (r.rating || 0), 0) || 0), 0) || 0;

  const avgRating = totalReviews > 0 ? totalRatingSum / totalReviews : 0;
  const displayRating = avgRating.toFixed(1);

  const joinedDate = shop?.createdAt
    ? new Date(shop.createdAt).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="space-y-6 text-gray-800 min-h-[calc(100vh-20px)]">
      {/* Avatar + Shop Name */}
      <div className="text-center">
        <div className="inline-block relative">
          <img
            src={shop?.avatar?.url}
            alt={`${shop?.shopName || "Shop"} avatar`}
            className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-cover rounded-full border-4 border-white shadow-md mx-auto"
          />
        </div>
        <h2 className="mt-4 text-xl md:text-2xl font-bold text-gray-900">{shop?.shopName || "Unnamed Shop"}</h2>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 bg-gray-50 rounded-xl p-2 border border-gray-200">
        <div className="text-center">
          <div className="text-xl md:text-2xl font-bold text-gray-900">{loadingProducts ? "—" : totalProducts}</div>
          <div className="text-xs md:text-sm text-gray-600 mt-2">Product(s)</div>
        </div>
        <div className="text-center border-x border-gray-200 px-2">
          <div className="text-xl md:text-2xl font-bold text-gray-900 ">{loadingProducts ? "—" : displayRating}</div>
          <div className="text-xs md:text-sm text-gray-600">
            {" "}
            <span className="text-yellow-500 text-base">★</span>Rating
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl md:text-2xl font-bold text-gray-900">{loadingProducts ? "—" : joinedDate.split(" ")[2] || "—"}</div>
          <div className="text-xs md:text-sm text-gray-600 mt-2">{joinedDate.split(" ")[1] || "—"}</div>
        </div>
      </div>

      {/* Description */}
      {shop?.description && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-lg">About</h3>
          <p className="text-gray-700 leading-relaxed text-[15px] whitespace-pre-line">{shop.description}</p>
        </div>
      )}

      {/* Contact info */}
      <div className="space-y-4 text-sm md:text-base">
        {shop?.address && (
          <div>
            <h4 className="font-semibold text-gray-900">Location</h4>
            <p className="text-gray-700">{shop.address}</p>
          </div>
        )}

        {shop?.phoneNumber && (
          <div>
            <h4 className="font-semibold text-gray-900">Contact</h4>
            <p className="text-gray-700">{shop.phoneNumber}</p>
          </div>
        )}
      </div>

      {/* Owner actions */}
      {isOwner && (
        <div className="pt-4 border-t border-gray-200 space-y-3">
          <Link to="/dashboard/settings">
            <button className={` w-full h-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors`}>
              Edit Shop
            </button>
          </Link>

          <button
            onClick={handleShopLogout}
            className={` w-full h-11 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2`}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopInfo;
