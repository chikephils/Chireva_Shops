import React, { useCallback, useEffect, useState } from "react";
import styles from "../../styles/styles";
import ProductCard from "../../components/Route/ProductCard/ProductCard";
import NoProduct from "../../Assests/img/NotFound.svg";
import Loader from "../../components/UI/Loader";
import PageTransition from "../../components/UI/PageTransition";
import api from "../../utils/api";
import { server } from "../../server";

const BestSellingPage = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const limit = 20;

  const fetchBestSelling = useCallback(async (page) => {
    setLoading(true);
    try {
      const response = await api.get(`${server}/product/get-best-selling?page=${page}&limit=${limit}`);

      const bestSelling = response.data.products || [];

      setProducts((prev) => [...prev, ...bestSelling]);
    } catch (error) {
      console.error(error.response?.data.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBestSelling(1);
  }, [fetchBestSelling]);

  return (
    <PageTransition>
      <div className="min-h-screen pt-[120px] md:pt-[100px]">
        {loading && page === 1 ? (
          <div className="flex items-center justify-center h-[85vh]">
            <Loader />
          </div>
        ) : (
          <div className={`${styles.section} pb-10`}>
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-[20px] md:grid-cols-3 md:gap-[30px] xl:grid-cols-4 lg:gap-[40px] xl:gap-[50px] 3xl:grid-cols-5 py-10 justify-items-center">
                  {products.map((product) => (
                    <ProductCard product={product} key={product._id} />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-9">
                <img src={NoProduct} className="h-80 md:h-340" alt="Not found" />
                <p className="text-sm md:text-xl text-black font-semibold my-2">Product(s) not available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default BestSellingPage;
