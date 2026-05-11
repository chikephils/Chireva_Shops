import React from "react";
import styles from "../../../styles/styles";
import ProductCard from "../ProductCard/ProductCard";
import { selectProductsLoading } from "../../../features/product/productSlice";
import { useSelector } from "react-redux";
import NoProduct from "../../../Assests/img/NotFound.svg";
import Loader from "../../UI/Loader";

const FeaturedProduct = () => {
  const allProducts = useSelector((state) => state?.products.products);
  const productsLoading = useSelector(selectProductsLoading);

  const products = allProducts.slice(0, 8);

  return (
    <div className={`${styles.section} py-4 border-b mb-10`}>
      <div className={`${styles.heading}`}>
        <h1>Featured Products</h1>
      </div>
      {productsLoading ? (
        <div className="flex items-center justify-center h-[70vh]">
          <Loader />
        </div>
      ) : (
        <>
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-[20px] md:grid-cols-3 md:gap-[30px] xl:grid-cols-4 lg:gap-[40px] xl:gap-[50px] 3xl:grid-cols-5 justify-items-center">
              {products.map((product) => (
                <ProductCard product={product} key={product._id} />
              ))}
            </div>
          ) : (
            <div className="w-full text-center pb-4">
              <div className="flex items-center justify-center">
                <img src={NoProduct} alt="Not Found" className="max-h-[250px]" />
              </div>
              <p className="text-[16px] 800px:text-[20px] font-semibold">No Featured Deals</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FeaturedProduct;
