import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiFillHeart, AiOutlineHeart, AiOutlineMessage, AiOutlineShoppingCart } from "react-icons/ai";
import { server } from "../../server";
import { addToCart, itemsInCart, increaseItemQuantity, reduceItemQuantity, removeFromCart } from "../../features/cart/cartSlice";
import { addToWishList, removeFromWishList, selectWishListItems } from "../../features/wishlist/wishlistSlice";
import { useDispatch, useSelector } from "react-redux";
import Ratings from "./Ratings";
import api from "../../utils/userApi";
import { toast } from "react-toastify";
import { selectAllProducts } from "../../features/product/productSlice";
import { numbersWithCommas } from "../../utils/priceDisplay";
import { FaFire } from "react-icons/fa6";
import CountDown from "../Events/CountDown";

const ProductDetails = ({ product }) => {
  const [click, setClick] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [selectedImg, setSelectedImg] = useState(0);

  const cartItems = useSelector(itemsInCart);
  const wishlist = useSelector(selectWishListItems);
  const products = useSelector(selectAllProducts);
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((state) => state?.user?.token);

  const isEventActive =
    product?.isEvent &&
    product?.eventStartDate &&
    product?.eventEndDate &&
    new Date() >= new Date(product.eventStartDate) &&
    new Date() <= new Date(product.eventEndDate);

  const currentQuantity = cartItems.find((item) => item._id === product._id)?.quantity || 0;

  const shopProducts = products.filter((p) => p.shop._id === product.shop._id);

  const totalReviewsLength = shopProducts.reduce((acc, p) => acc + (p.reviews?.length || 0), 0);
  const totalRatings = shopProducts.reduce((acc, p) => acc + p.reviews.reduce((sum, r) => sum + r.rating, 0), 0);
  const averageRating = totalReviewsLength ? (totalRatings / totalReviewsLength / 5).toFixed(2) : "0.00";

  useEffect(() => {
    setClick(!!wishlist.find((i) => i._id === product._id));
    setInCart(!!cartItems.find((i) => i._id === product._id));
  }, [wishlist, cartItems, product._id]);

  const addToWishListHandler = () => dispatch(addToWishList({ item: product }));
  const removeFromWishListHandler = () => dispatch(removeFromWishList({ item: product }));
  const addToCartHandler = () => dispatch(addToCart({ item: product }));
  const removeFromCartHandler = () => dispatch(removeFromCart({ item: product }));
  const increment = () => dispatch(increaseItemQuantity({ item: product }));
  const decrement = () => currentQuantity > 1 && dispatch(reduceItemQuantity({ item: product }));

  const handleMessageSubmit = async () => {
    if (!user) {
      toast.error("Please login to message the seller");
      return;
    }

    const userId = user._id;
    const sellerId = product.shop._id;
    const groupTitle = userId + sellerId;

    try {
      const response = await api.post(
        `${server}/conversation/create-new-conversation`,
        { groupTitle, userId, sellerId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

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

  const editedPrice = numbersWithCommas(product?.originalPrice);
  const editedDiscountPrice = numbersWithCommas(product?.discountPrice);

  return (
    <div className="max-w-screen-4xl mx-auto px-4 lg:px-8 bg-gray-50 min-h-screen py-6 lg:py-8">
      {/* Mobile Design */}
      <div className="800px:hidden">
        {/* Product Name */}
        <h1 className="text-2xl font-bold text-gray-900 text-center">{product?.name}</h1>

        {/* Image + Thumbnails */}
        <div className="mt-4">
          <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg p-4">
            <img src={product.images?.[selectedImg]?.url} alt={product.name} className="w-full h-auto max-h-[350px] object-contain" />
            {product.stock < 1 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">Sold Out</span>
              </div>
            )}
          </div>

          {product.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-4 mt-6">
              {product.images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all flex justify-center items-center ${
                    selectedImg === i ? "border-lime-600 shadow-md" : "border-gray-200"
                  }`}
                >
                  <img src={img.url} alt="" className="max-h-48 object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {product?.isEvent && isEventActive && (
          <div className="mt-3 md:hidden block">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200">
              <FaFire size={18} className="text-amber-600" title="Limited-time event product" />
              <CountDown product={product} />
            </div>
          </div>
        )}
        {/* Star Rating + Reviews + Sold */}
        <div className="flex items-center justify-start gap-4 mt-3">
          <Ratings rating={product?.ratings} />
          <span className="text-gray-600">{product.sold_out || 0} sold</span>
        </div>

        {/* Price */}
        <div className="mt-6 flex items-baseline gap-4">
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

        {/* Description */}
        <p className="text-sm md:text-base mt-6 text-gray-700  leading-relaxed">{product.description}</p>

        {/* Quantity + Add to Cart + Wishlist */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="w-full flex justify-between">
            <div className="flex items-center ">
              <button
                onClick={decrement}
                disabled={currentQuantity <= 1}
                className="w-12 h-12 rounded-full bg-lime-600 text-white flex items-center justify-center text-2xl hover:bg-lime-700 disabled:opacity-50"
              >
                -
              </button>
              <span className="text-2xl font-semibold w-16 text-center">{currentQuantity}</span>
              <button
                onClick={increment}
                className="w-12 h-12 rounded-full bg-lime-600 text-white flex items-center justify-center text-2xl hover:bg-lime-700"
              >
                +
              </button>
            </div>
            <div
              onClick={click ? removeFromWishListHandler : addToWishListHandler}
              className="cursor-pointer p-2 rounded-full border-2 border-gray-300 hover:border-red-500 transition"
            >
              {click ? <AiFillHeart size={30} color="red" /> : <AiOutlineHeart size={30} />}
            </div>
          </div>

          <div className="w-full  lg:p-4 flex flex-row items-center justify-between gap-6">
            <button
              onClick={inCart ? removeFromCartHandler : addToCartHandler}
              disabled={product.stock < 1}
              className={` px-6  py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-1 md:gap-3 text-sm  ${
                inCart ? "bg-red-600 hover:bg-red-700" : "bg-black hover:bg-gray-800"
              }`}
            >
              {inCart ? "Remove from Cart" : "Add to Cart"}
              <AiOutlineShoppingCart size={24} />
            </button>
          </div>
        </div>

        {/* Shop Info */}
        <div className="mt-10 pt-8 border-t">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="relative border-2 border-lime-600 rounded-full" style={{ flexShrink: 0 }}>
                <img src={product.shop.avatar?.url} alt="" className="w-[50px] h-[50px] rounded-full " />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{product.shop.shopName}</h3>
                <p className="text-gray-600">{averageRating} ★ Rating</p>
              </div>
            </div>
            <button
              onClick={handleMessageSubmit}
              className="w-full px-6 py-3 bg-lime-600 text-white rounded-full font-medium hover:bg-lime-700 flex items-center justify-center gap-2"
            >
              Send Message <AiOutlineMessage size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden 800px:grid grid-cols-2 gap-12">
        <div>
          <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg p-2">
            <img src={product.images?.[selectedImg]?.url} alt={product.name} className="w-full h-auto max-h-[450px] object-contain" />
            {product.stock < 1 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">Sold Out</span>
              </div>
            )}
          </div>

          {product.images?.length > 1 && (
            <div className="grid grid-cols-6 gap-4 mt-6">
              {product.images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all flex justify-center items-center ${
                    selectedImg === i ? "border-lime-600 shadow-md" : "border-gray-200"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-30 object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          {product?.isEvent && isEventActive && (
            <div className="mt-3 hidden md:block">
              <div className="inline-flex items-center gap-2 px-2 py-1.5 bg-amber-50 rounded-full border border-amber-200">
                <FaFire size={18} className="text-amber-600" title="Limited-time event product" />
                <CountDown product={product} />
              </div>
            </div>
          )}
          <div className="flex items-center gap-4 mt-4">
            <Ratings rating={product?.ratings} />
            <span className="text-gray-600">{product.sold_out || 0} sold</span>
          </div>
          <div className="mt-6 flex items-baseline gap-4">
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
          <p className="mt-6 text-gray-700 leading-relaxed ">{product.description}</p>
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between px-3 gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={decrement}
                disabled={currentQuantity <= 1}
                className="w-10 h-10 rounded-full bg-lime-600 text-white flex items-center justify-center text-2xl hover:bg-lime-700 disabled:opacity-50"
              >
                -
              </button>
              <span className="text-2xl font-semibold w-10 text-center">{currentQuantity}</span>
              <button
                onClick={increment}
                className="w-10 h-10 rounded-full bg-lime-600 text-white flex items-center justify-center text-2xl hover:bg-lime-700"
              >
                +
              </button>
            </div>
            <button
              onClick={inCart ? removeFromCartHandler : addToCartHandler}
              disabled={product.stock < 1}
              className={`w-full px-4 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2 max-w-[250px] ${
                inCart ? "bg-red-600 hover:bg-red-700" : "bg-black hover:bg-gray-800"
              }`}
            >
              {inCart ? "Remove from Cart" : "Add to Cart"}
              <AiOutlineShoppingCart size={20} />
            </button>
            <div
              onClick={click ? removeFromWishListHandler : addToWishListHandler}
              className="cursor-pointer p-2 rounded-full border border-gray-300 hover:border-red-500 transition"
            >
              {click ? <AiFillHeart size={30} color="red" /> : <AiOutlineHeart size={30} />}
            </div>
          </div>
          <div className="mt-10 flex items-center justify-between px-3">
            <div className="flex items-center gap-4">
              <div className="relative border-2 border-lime-600 rounded-full" style={{ flexShrink: 0 }}>
                <img src={product.shop.avatar?.url} alt="" className="w-[50px] h-[50px] rounded-full " />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{product.shop.shopName}</h3>
                <p className="text-gray-600">{averageRating} ★ Rating</p>
              </div>
            </div>
            <button
              onClick={handleMessageSubmit}
              className="px-6 py-3 bg-lime-600 text-white rounded-full font-medium hover:bg-lime-700 flex items-center gap-2"
            >
              Send Message <AiOutlineMessage size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <ProductDetailsInfo
        product={product}
        shopProducts={shopProducts}
        totalReviewsLength={totalReviewsLength}
        averageRating={averageRating}
      />
    </div>
  );
};

const ProductDetailsInfo = ({ product, shopProducts, totalReviewsLength, averageRating }) => {
  const [active, setActive] = useState(1);

  return (
    <div className="mt-16 bg-white rounded-2xl shadow-lg p-2 lg:p-4">
      <div className="flex flex-wrap justify-between lg:justify-normal lg:gap-10 px-1 md:px-3 border-b pb-4 mb-1 text-sm md:text-lg font-medium">
        <button onClick={() => setActive(1)} className={active === 1 ? "text-lime-600 border-b-2 border-lime-600" : "text-gray-600"}>
          Product Details
        </button>
        <button onClick={() => setActive(2)} className={active === 2 ? "text-lime-600 border-b-2 border-lime-600" : "text-gray-600"}>
          Reviews ({product.reviews?.length || 0})
        </button>
        <button onClick={() => setActive(3)} className={active === 3 ? "text-lime-600 border-b-2 border-lime-600" : "text-gray-600"}>
          Seller Info
        </button>
      </div>

      {active === 1 && (
        <div className="w-full flex min-h-[20vh]">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm md:text-base">{product.description}</p>
        </div>
      )}

      {active === 2 && (
        <div className="space-y-6">
          {product.reviews?.length ? (
            product.reviews.map((review, i) => (
              <div key={i} className="flex gap-4 pb-6 border-b last:border-0 min-h-[20vh]">
                <div className="relative" style={{ flexShrink: 0 }}>
                  <img src={`${review?.user?.avatar?.url}`} alt="" className="w-[50px] h-[50px] rounded-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{review.user.firstName}</span>
                    <Ratings rating={review.rating} />
                  </div>
                  <p className="mt-2 text-gray-700 text-sm md:text-base">{review.comment}</p>
                </div>
              </div>
            ))
          ) : (
            <p className=" w-full flex justify-center items-center text-center text-gray-500 py-8 min-h-[20vh]">No reviews yet!</p>
          )}
        </div>
      )}

      {active === 3 && (
        <div className="flex flex-col md:flex-row md:justify-between px-4 min-h-[20vh]">
          {/* Left column - Shop info */}
          <div className="w-full md:w-[50%]">
            <div className="flex items-center gap-3">
              <div className="relative border-2 border-lime-600 rounded-full" style={{ flexShrink: 0 }}>
                <img src={product.shop.avatar?.url} alt="" className="w-[50px] h-[50px] rounded-full " />
              </div>
              <div>
                <h3 className="text-md font-semibold">{product.shop.shopName}</h3>
                <p className="text-gray-600 text-sm">{averageRating} ★ Rating</p>
              </div>
            </div>
            <p className="mt-4 text-gray-700 text-sm md:text-base">{product.shop.description || "No description available."}</p>
          </div>

          {/* Right column - Stats & Button */}
          <div className="space-y-4 mt-8 md:mt-0 ">
            <p>
              <span className="font-medium text-sm">Joined:</span> {new Date(product.shop.createdAt).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium text-sm">Total Products:</span> {shopProducts.length}
            </p>
            <p>
              <span className="font-medium text-sm">Total Reviews:</span> {totalReviewsLength}
            </p>
            <div className="md:justify-end pb-2 ">
              <Link to={`/shop/preview/${product.shop._id}`}>
                <button className="mt-2 px-6 py-2.5 bg-lime-600 text-white rounded-full font-medium hover:bg-lime-700">Visit Shop</button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
