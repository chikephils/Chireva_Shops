import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/api";
import { server } from "../../server";
import Loader from "../../components/UI/Loader";
import ShopInfo from "../../components/Shop/ShopInfo";
import ShopProfileDataUser from "../../components/Shop/shopProfileDataUser";

const ShopPreviewPage = () => {
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;
    setLoading(true);

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
      <div className="max-w-screen-4xl mx-auto min-h-screen mt-14 flex items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
        <div className="text-center p-6">
          <h2 className="text-2xl font-semibold">Shop not found</h2>
          <p className="mt-3">This shop may have been removed or is unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[120px] md:pt-[105px] bg-gray-50">
      <div className="h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-600" />

      <div className="mx-auto max-w-screen-4xl px-2 lg:px-6">
        <div className="py-2 lg:flex lg:gap-8 lg:pb-12">
          <aside
            className={`
              lg:w-80 lg:shrink-0 lg:h-full
              lg:sticky lg:top-[122px] lg:self-start
              bg-white rounded-xl shadow-sm border border-gray-200
              p-2 lg:p-3 mb-6 lg:mb-0
            `}
          >
            <ShopInfo isOwner={false} shop={shop} />
          </aside>

          <main className="flex-1 min-w-0 ">
            <ShopProfileDataUser isOwner={false} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default ShopPreviewPage;
