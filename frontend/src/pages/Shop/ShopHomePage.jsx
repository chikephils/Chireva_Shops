import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/axios";
import { server } from "../../server";
import Loader from "../../components/UI/Loader";
import ShopInfo from "../../components/Shop/ShopInfo";
import ShopProfileData from "../../components/Shop/ShopProfileData";
import { useDispatch } from "react-redux";
import { LoadSeller } from "../../features/shop/shopSlice";

const ShopHomePage = () => {
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const { id } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    dispatch(LoadSeller(id));

    api
      .get(`${server}/shop/get-shop-info/${id}`)
      .then((res) => {
        setShop(res.data.shop);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load shop:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-screen-4xl mx-auto min-h-screen mt-9 flex items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Shop not found</h2>
          <p className="mt-3 text-gray-600">Please check the link or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-[68px]">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white">
        <div className="max-w-screen-4xl mx-auto px-2 lg:px-8 py-2 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold"> Shop Management</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-screen-4xl mx-auto px-2 lg:px-6">
        <div className="py-4 lg:flex lg:gap-8">
          <aside
            className="
              lg:w-80 lg:shrink-0 lg:h-full
              lg:sticky lg:top-6 lg:self-start
              bg-white rounded-xl shadow-md border border-indigo-100
              p-3 mb-6 lg:mb-7
            "
          >
            <ShopInfo isOwner={true} shop={shop} />
          </aside>

          <main className="flex-1 min-w-0 mb-6 lg:mb-7">
            <ShopProfileData isOwner={true} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default ShopHomePage;
