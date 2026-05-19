import React, { useEffect, useState } from "react";
import EditProduct from "../../components/Shop/EditProduct";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getShopProducts, selectAllShopProducts, selectSeller } from "../../features/shop/shopSlice";

const ShopEditProduct = () => {
  const { id } = useParams();
  const seller = useSelector(selectSeller);
  const shopProducts = useSelector(selectAllShopProducts);
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);

  useEffect(() => {
    dispatch(getShopProducts(seller._id));
  }, [dispatch, seller._id]);

  useEffect(() => {
    if (!id) return;
    const item = shopProducts.find((product) => product?._id === id);
    setProduct(item);
  });

  const totalReviewsLength = shopProducts.reduce((acc, p) => acc + (p.reviews?.length || 0), 0);
  const totalRatings = shopProducts.reduce((acc, p) => acc + p.reviews.reduce((sum, r) => sum + r.rating, 0), 0);
  const averageRating = totalReviewsLength ? (totalRatings / totalReviewsLength).toFixed(1) : 0;

  return (
    <>
      <div className="max-w-screen-4xl mx-auto mt-[62px]">
        <EditProduct product={product} averageRating={averageRating} totalReviewsLength={totalReviewsLength} />
      </div>
    </>
  );
};

export default ShopEditProduct;
