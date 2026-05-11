import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import NoProduct from "../../Assests/img/NotFound.svg";
import Loader from "../../components/UI/Loader";
import PageTransition from "../../components/UI/PageTransition";
import { getPromoProducts, selectPromoHasMore, selectPromoLoading, selectPromoProducts } from "../../features/product/productSlice";
import ProductCard from "../../components/Route/ProductCard/ProductCard";
import styles from "../../styles/styles";

const PromoSalesPage = () => {
  const promoProducts = useSelector(selectPromoProducts);
  const loading = useSelector(selectPromoLoading);
  const hasMore = useSelector(selectPromoHasMore);
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
    dispatch(
      getPromoProducts({
        page: 1,
        limit: 8,
      }),
    );
  }, [dispatch]);

  const loadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    dispatch(getPromoProducts({ page: nextPage, limit: 8 }));
  };

  return (
    <PageTransition>
      <div className="flex flex-col  min-h-screen pt-[120px] md:pt-[100px]">
        {loading && page === 1 ? (
          <div className="flex items-center justify-center h-[85vh]">
            <Loader />
          </div>
        ) : (
          <div className={`${styles.section} pb-10`}>
            {promoProducts?.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-[20px] md:grid-cols-3 md:gap-[30px] xl:grid-cols-4 lg:gap-[40px] xl:gap-[50px] 3xl:grid-cols-5 py-10 justify-items-center">
                  {promoProducts.map((product) => (
                    <ProductCard product={product} key={product._id} />
                  ))}
                </div>
                {hasMore && (
                  <div className="text-center pb-5">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className={`
                          px-10 py-3 bg-blue-600 text-white font-medium rounded-lg transition
                          ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}
                        `}
                    >
                      {loading ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className=" flex flex-col items-center justify-center py-20">
                <img src={NoProduct} className="h-80 md:h-340" alt="Not found" />
                <p className="text-sm md:text-xl text-black font-semibold my-2">Promo-Sales not Available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default PromoSalesPage;
