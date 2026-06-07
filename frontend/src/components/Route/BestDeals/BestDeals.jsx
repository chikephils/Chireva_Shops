import React, { useState, useEffect } from "react";
import styles from "../../../styles/styles";
import ProductCard from "../ProductCard/ProductCard";
import { useSelector } from "react-redux";
import NoProduct from "../../../Assests/img/NotFound.svg";
import Loader from "../../UI/Loader";
import { selectProductsLoading } from "../../../features/product/productSlice";
import api from "../../../utils/api";
import { useCallback } from "react";
import { server } from "../../../server";

const BestDeals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBestSelling = async () => {
      try {
        const response = await api.get(`${server}/product/get-best-selling?limit=4`);

        setProducts(response?.data?.products || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchBestSelling();
  }, []);

  return (
    <div className={`${styles.section}  border-b py-4 mb-10`}>
      <div className={`${styles.heading}`}>
        <h1>Best Deals</h1>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-[70vh]">
          <Loader />
        </div>
      ) : (
        <>
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-[20px] md:grid-cols-3 md:gap-[30px] xl:grid-cols-4 lg:gap-[40px] xl:gap-[50px] 3xl:grid-cols-5  justify-items-center">
              {products.map((product) => (
                <ProductCard product={product} key={product._id} />
              ))}
            </div>
          ) : (
            <div className="w-full text-center pb-4 flex flex-col items-center justify-center h-[50vh]">
              <img src={NoProduct} alt="Not Found" className="max-h-[250px]" />

              <p className="text-[16px] 800px:text-[20px] font-semibold">No Promo-Sales Today!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BestDeals;
