import React, { useEffect, useState } from "react";
import styles from "../../styles/styles";
import ProductCard from "../Route/ProductCard/ProductCard";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { server } from "../../server";

const SuggestedProducts = ({ product }) => {
  const [products, setProducts] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (product?._id) {
      api
        .get(`${server}/product/related-products/${product._id}`)
        .then((res) => setProducts(res.data.products))
        .catch(console.error);
    }
  }, [product]);

  const handleProductClick = (product) => {
    navigate(`/product/${product._id}`);
  };

  return (
    <div className="mt-4 bg-gradient-to-r from-gray-300 to-blue-300 ...">
      {product ? (
        <div className={` ${styles.section} pt-3`}>
          <h2 className={`${styles.heading} !text-[22px] md:text-[25px] font-[500] border-b mb-5`}>Related Products</h2>
          <div className="grid grid-cols-2 gap-[20px] md:grid-cols-3 md:gap-[30px] xl:grid-cols-4 lg:gap-[40px] xl:gap-[50px] 3xl:grid-cols-5 py-10 justify-items-center">
            {products &&
              products.map((product) => (
                <ProductCard product={product} key={product._id} onClick={() => handleProductClick(product._id)} />
              ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SuggestedProducts;
