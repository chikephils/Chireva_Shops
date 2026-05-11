import React, { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { AiOutlineMessage, AiFillHeart, AiOutlineHeart, AiOutlineShoppingCart } from "react-icons/ai";
import { increaseItemQuantity, reduceItemQuantity, itemsInCart } from "../../../features/cart/cartSlice";
import { selectWishListItems, addToWishList, removeFromWishList } from "../../../features/wishlist/wishlistSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectAllProducts } from "../../../features/product/productSlice";
import { numbersWithCommas } from "../../../utils/priceDisplay";
import api from "../../../utils/axios"
import { server } from "../../../server";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CountDown from "../../Events/CountDown";
import { FaFire } from "react-icons/fa6";

const ProductCardDetails = ({ setDetailsOpen, product, addToCart, remove, inCart, setInCart }) => {
  const user = useSelector((state) => state.user?.user);
  const [click, setClick] = useState(false);
  const cartItems = useSelector(itemsInCart);
  const wishlist = useSelector(selectWishListItems);
  const products = useSelector(selectAllProducts);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isEventActive =
    product?.isEvent &&
    product?.eventStartDate &&
    product?.eventEndDate &&
    new Date() >= new Date(product.eventStartDate) &&
    new Date() <= new Date(product.eventEndDate);

  const editedPrice = numbersWithCommas(product?.originalPrice);
  const editedDiscountPrice = numbersWithCommas(product?.discountPrice);

  const shopProducts = products.filter((prdt) => prdt.shop._id === product.shop._id);

  useEffect(() => {
    if (wishlist?.find((listItem) => listItem._id === product._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [wishlist, product._id]);

  useEffect(() => {
    if (cartItems?.find((item) => item._id === product._id)) {
      setInCart(true);
    } else {
      setInCart(false);
    }
  }, [cartItems, product._id, setInCart]);

  const removeFromWishListHandler = () => {
    setClick(false);
    dispatch(removeFromWishList({ item: product }));
  };

  const addToWishListHandler = () => {
    setClick(true);
    dispatch(addToWishList({ item: product }));
  };

  const handleMessageSubmit = async () => {
    if (!user) {
      toast.error("Please login to message the seller");
      return;
    }

    const userId = user._id;
    const sellerId = product.shop._id;
    const groupTitle = userId + sellerId;

    try {
      const response = await api.post(`${server}/conversation/create-new-conversation`, { groupTitle, userId, sellerId });

      navigate(`/profile/inbox/${response.data.conversation._id}`, {
        state: {
          conversation: response.data.conversation,
          seller: product.shop,
        },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error starting conversation");
    }
  };

  const decrementCount = () => dispatch(reduceItemQuantity({ item: product }));
  const incrementCount = () => dispatch(increaseItemQuantity({ item: product }));

  const totalReviewsLength = shopProducts.reduce((acc, p) => acc + (p.reviews?.length || 0), 0);
  const totalRatings = shopProducts.reduce((acc, p) => acc + p.reviews.reduce((sum, r) => sum + r.rating, 0), 0);
  const averageRating = totalReviewsLength ? (totalRatings / totalReviewsLength / 5).toFixed(2) : "0.00";

  const currentQuantity = cartItems.find((item) => item._id === product._id)?.quantity || 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-3 md:p-4">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] lg:max-h-[80vh] flex flex-col md:flex-row md:py-5 pb-4 ">
        {/* Close Button */}
        <RxCross1
          size={28}
          className="absolute top-4 right-4 z-10 cursor-pointer text-white bg-black/50 rounded-full p-1 hover:bg-black/70 transition"
          onClick={() => setDetailsOpen(false)}
        />

        {/* Left: Image + Shop Info */}
        <div className="w-full md:w-1/2 bg-gray-50 flex flex-col items-center p-3 md:p-6 relative">
          <div className="relative w-full max-w-md">
            <img
              src={product.images?.[0]?.url}
              alt={product.name}
              className="w-full h-auto max-h-[150px] md:max-h-[350px] object-contain rounded-lg"
            />
            {product.stock < 1 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                <span className="text-white text-xl font-bold">Sold Out</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mt-3">
            <img src={product.shop?.avatar?.url} alt={product.shop?.shopName} className="w-10 h-10 rounded-full border-2 border-lime-600" />
            <div>
              <h3 className="font-semibold text-sm">{product.shop?.shopName}</h3>
              <p className="text-sm text-gray-600">
                {averageRating} ★ Ratings • {product?.sold_out || 0} Sold
              </p>
            </div>
          </div>

          <button
            onClick={handleMessageSubmit}
            className="mt-3 md:mt-5 w-full max-w-xs bg-lime-600 text-white py-3 rounded-full font-medium hover:bg-lime-700 transition flex items-center justify-center gap-2"
          >
            Send Message <AiOutlineMessage size={20} />
          </button>

          {product?.isEvent && isEventActive && (
            <div className="mt-3 hidden md:block">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200">
                <FaFire size={18} className="text-amber-600" title="Limited-time event product" />
                <CountDown product={product} />
              </div>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-1/2 p-3 md:p-10 overflow-y-auto scrollbar-hide">
          <h1 className="text-xl md:text-2xl text-center font-bold text-gray-800">{product?.name}</h1>

          {product?.isEvent && isEventActive && (
            <div className="mt-3 md:hidden block">
              <div className="inline-flex items-center gap-1 px-2 py-1.5 bg-amber-50 rounded-full border border-amber-200">
                <FaFire size={18} className="text-amber-600" title="Limited-time event product" />
                <CountDown product={product} />
              </div>
            </div>
          )}
          <p className="mt-4 text-gray-700 text-sm md:text-base leading-relaxed">{product?.description}</p>

          <div className="mt-5 flex items-end gap-4">
            {/* Show discount only if event is active */}
            {product?.isEvent && isEventActive && product?.discountPrice ? (
              <>
                <p className="text-xl md:text-2xl font-medium text-red-600">₦ {editedDiscountPrice}</p>
                <p className="text-base md:text-xl font-medium text-gray-500 line-through">₦ {editedPrice}</p>
              </>
            ) : (
              <p className="text-xl md:text-2xl font-medium">₦ {editedPrice}</p>
            )}
          </div>

          <div className="mt-4 lg:mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={decrementCount}
                disabled={currentQuantity === 0}
                className="w-10 h-10 rounded-full bg-lime-600 text-white flex items-center justify-center text-2xl hover:bg-lime-700 disabled:opacity-50"
              >
                -
              </button>
              <span className="text-xl font-semibold w-16 text-center">{currentQuantity}</span>
              <button
                onClick={incrementCount}
                className="w-10 h-10 rounded-full bg-lime-600 text-white flex items-center justify-center text-2xl hover:bg-lime-700"
              >
                +
              </button>
            </div>

            <div className="cursor-pointer" onClick={click ? removeFromWishListHandler : addToWishListHandler}>
              {click ? <AiFillHeart size={34} color="red" /> : <AiOutlineHeart size={34} color="#333" />}
            </div>
          </div>

          <div className="mt-6">
            {inCart ? (
              <button
                onClick={remove}
                className="w-full bg-red-600 text-white py-4 rounded-full font-semibold hover:bg-red-700 transition flex items-center justify-center gap-3"
              >
                Remove from Cart <AiOutlineShoppingCart size={24} />
              </button>
            ) : (
              <button
                onClick={addToCart}
                disabled={product.stock < 1}
                className="w-full bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-3 disabled:opacity-50"
              >
                Add to Cart <AiOutlineShoppingCart size={24} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardDetails;
