import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AiFillHeart, AiOutlineEye, AiOutlineHeart } from "react-icons/ai";
import ProductCardDetails from "../ProductCardDetails/ProductCardDetails";
import { useDispatch, useSelector } from "react-redux";
import { MdOutlineShoppingCart, MdShoppingCart } from "react-icons/md";
import Ratings from "../../ProductDetails/Ratings";
import { addToCart, removeFromCart, itemsInCart } from "../../../features/cart/cartSlice";
import { addToWishList, removeFromWishList, selectWishListItems } from "../../../features/wishlist/wishlistSlice";
import { numbersWithCommas } from "../../../utils/priceDisplay";
import { toast } from "react-toastify";
import { FaFire } from "react-icons/fa";

const ProductCard = ({ product, isEvent }) => {
  const [click, setClick] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const wishlist = useSelector(selectWishListItems);
  const [inCart, setInCart] = useState(false);
  const cart = useSelector(itemsInCart);
  const dispatch = useDispatch();

  const editedPrice = numbersWithCommas(product?.originalPrice);
  const editedDiscountPrice = numbersWithCommas(product?.discountPrice);

  // Check if event is currently active
  const isEventActive =
    product?.isEvent &&
    product?.eventStartDate &&
    product?.eventEndDate &&
    new Date() >= new Date(product.eventStartDate) &&
    new Date() <= new Date(product.eventEndDate);

  useEffect(() => {
    if (wishlist && wishlist.find((listItem) => listItem._id === product._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [wishlist, product._id]);

  useEffect(() => {
    if (cart && cart.find((item) => item._id === product._id)) {
      setInCart(true);
    } else {
      setInCart(false);
    }
  }, [product._id, cart]);

  const removeFromWishListHandler = () => {
    setClick(!click);
    dispatch(removeFromWishList({ item: product }));
  };

  const addToWishListHandler = () => {
    setClick(!click);
    dispatch(addToWishList({ item: product }));
  };

  const add = () => {
    if (product.stock < 1) return toast.info("item out of stock");
    setInCart(!inCart);
    dispatch(addToCart({ item: product }));
  };

  const remove = () => {
    setInCart(!inCart);
    dispatch(removeFromCart({ item: product }));
  };

  return (
    <div className=" xs:w-full md:min-w-[185px] min-h-[200px] md:w-full md:min-h-[280px] bg-slate-100 rounded-lg  p-2 md:p-2 overflow-hidden flex flex-col  border border-gray-300 hover:border-lime-200 hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] ">
      <div className="flex items-start justify-between">
        <Link to={`${isEvent === true ? `/product/${product?._id}?isEvent=true` : `/product/${product?._id}`}`}>
          <img
            src={`${product.images && product.images[0]?.url}`}
            alt="img"
            className="w-full max-w-[70px] md:min-w-[150px]  h-[70px] md:min-h-[150px] object-contain"
          />
        </Link>
        {/* side options */}
        <div>
          {click ? (
            <AiFillHeart
              size={22}
              className=" cursor-pointer relative mt-1"
              onClick={removeFromWishListHandler}
              color={click ? "red" : "#333"}
              title="Remove from wishlist"
            />
          ) : (
            <AiOutlineHeart
              size={22}
              className="cursor-pointer relative mt-1"
              onClick={addToWishListHandler}
              color={click ? "red" : "#333"}
              title="Add to wishlist"
            />
          )}
          <AiOutlineEye
            size={22}
            className="cursor-pointer relative mt-1"
            onClick={() => setDetailsOpen(!detailsOpen)}
            color="#333"
            title="Quick view"
          />
          {inCart ? (
            <MdShoppingCart
              size={22}
              className="cursor-pointer relative mt-1"
              onClick={remove}
              color={inCart ? "red" : "#333"}
              title="Remove from cart"
            />
          ) : (
            <MdOutlineShoppingCart
              size={22}
              className="cursor-pointer relative mt-1"
              onClick={add}
              color={inCart ? "red" : "#333"}
              title="Add to cart"
            />
          )}

          {detailsOpen && (
            <ProductCardDetails
              setDetailsOpen={setDetailsOpen}
              product={product}
              addToCart={add}
              remove={remove}
              inCart={inCart}
              setInCart={setInCart}
            />
          )}
        </div>
      </div>

      <div>
        <Link to={`/shop/preview/${product?.shop?._id}`}>
          <h4 className="text-lime-600 text-xs font-semi mt-1 hover:text-lime-500">{product?.shop?.shopName}</h4>
        </Link>
        <Link to={`${isEvent === true ? `/product/${product._id}?isEvent=true` : `/product/${product._id}`}`}>
          <h4 className="py-1 text-sm font-medium hover:font-bold line-clamp-1">
            { product?.name}
          </h4>
        </Link>
        <div className="flex items-center justify-between w-full">
          <Ratings rating={product?.ratings} />

          {product?.isEvent && isEventActive && <FaFire size={20} className="text-amber-600" title="Limited-time event product" />}
        </div>
        <div className="py-1 flex justify-between items-end">
          <div className="flex flex-col gap-1">
            {/* Show discount only if event is active */}
            {product?.isEvent && isEventActive && product?.discountPrice ? (
              <>
                <p className="text-[14px] md:text-base font-medium text-red-600">₦ {editedDiscountPrice}</p>
                <p className="text-[12px] md:text-[14px] font-medium text-gray-500 line-through">₦ {editedPrice}</p>
              </>
            ) : (
              <p className="text-[14px] md:text-base font-medium">₦ {editedPrice}</p>
            )}
          </div>
          <div className="flex flex-col text-right">
            <p className="text-[12px] md:text-[14px] font-semibold text-lime-600 mt-1">{product?.sold_out} sold</p>
            {product?.stock < 1 && <p className="text-[12px] md:text-[14px] font-semibold text-red-600 mt-1">Sold Out</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
