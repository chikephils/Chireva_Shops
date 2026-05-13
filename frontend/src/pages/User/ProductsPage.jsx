import React, { useEffect, useState } from "react";
import styles from "../../styles/styles";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../../components/Route/ProductCard/ProductCard";
import { useDispatch, useSelector } from "react-redux";
import NoProduct from "../../Assests/img/NotFound.svg";
import Loader from "../../components/UI/Loader";
import { getAllProducts, selectAllProducts, selectHasMoreProducts, selectProductsLoading } from "../../features/product/productSlice";
import PageTransition from "../../components/UI/PageTransition";

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");

  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const loading = useSelector(selectProductsLoading);
  const hasMore = useSelector(selectHasMoreProducts);

  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
    dispatch(
      getAllProducts({
        page: 1,
        limit: 8,
        category: category || undefined,
      }),
    );
  }, [dispatch, category]);

  // Load more handler
  const loadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    dispatch(getAllProducts({ page: nextPage, limit: 8, category: category || undefined }));
  };

  return (
    <PageTransition>
      <div className="min-h-screen  pt-[110px] md:pt-[100px]">
        {loading && page === 1 ? (
          <div className="flex items-center justify-center h-[85vh] ">
            <Loader />
          </div>
        ) : (
          <div className={`${styles.section} pb-12`}>
            {products?.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-[20px] md:grid-cols-3 md:gap-[30px] xl:grid-cols-4 lg:gap-[40px] xl:gap-[50px] 3xl:grid-cols-5 pt-10 pb-5 justify-items-center">
                  {products.map((product) => (
                    <ProductCard product={product} key={product._id} />
                  ))}
                </div>
                {hasMore && (
                  <div className="text-center">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className={`
                          px-5 py-2 bg-blue-600 text-white font-medium rounded-2xl transition 
                          ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"}
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
                <p className="text-sm md:text-xl text-black font-semibold my-2">Product(s) not Available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ProductsPage;
