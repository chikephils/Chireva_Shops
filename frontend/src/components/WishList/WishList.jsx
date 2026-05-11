import React, { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { AiOutlineHeart } from "react-icons/ai";
import { MdDeleteForever } from "react-icons/md";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { useSelector, useDispatch } from "react-redux";
import EmptyCart from "../../Assests/img/emptyCart.svg";
import { removeFromWishList, selectWishListItems, clearWishList } from "../../features/wishlist/wishlistSlice";
import { addToCart } from "../../features/cart/cartSlice";
import { numbersWithCommas } from "../../utils/priceDisplay";
import { FaCartPlus } from "react-icons/fa";

const WishList = ({ setOpenWishList }) => {
  const wishList = useSelector(selectWishListItems);
  const dispatch = useDispatch();
  const [total, setTotal] = useState(0);
  const editedTotal = numbersWithCommas(Number(total).toFixed(2));

  useEffect(() => {
    const totalPrice = wishList.reduce((acc, item) => {
      const isEventActive =
        item?.isEvent &&
        item?.eventStartDate &&
        item?.eventEndDate &&
        new Date() >= new Date(item.eventStartDate) &&
        new Date() <= new Date(item.eventEndDate);

      const price = isEventActive ? item.discountPrice : item.originalPrice;

      return acc + price;
    }, 0);

    setTotal(totalPrice);
  }, [wishList]);

  const emptyWishListHandler = () => {
    dispatch(clearWishList());
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex justify-end" onClick={() => setOpenWishList(false)}>
      <div className="w-full max-w-lg h-full bg-white shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpenWishList(false)} className="p-2 rounded-full hover:bg-gray-100 transition">
              <RxCross1 size={22} />
            </button>
            <h2 className="text-base font-semibold flex items-center gap-2">
              <AiOutlineHeart size={24} className="text-red-500" />
              My Wishlist
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-600 font-medium">
              {wishList.length} {wishList.length === 1 ? "item" : "items"}
            </span>
            {wishList.length > 0 && (
              <button
                onClick={emptyWishListHandler}
                className="p-2 rounded-full hover:bg-red-50 text-red-600 transition"
                title="Clear wishlist"
              >
                <MdDeleteForever size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Wishlist Items or Empty State */}
        {wishList.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto py-2 px-2 lg:px-3 custom-scrollbar">
              <div className="space-y-4">
                {wishList.map((item) => (
                  <WishlistItem key={item._id} item={item} />
                ))}
              </div>
            </div>

            {/* Optional Total Footer */}
            <div className="border-t border-gray-200 bg-gray-50 p-3 lg:p-5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-base font-medium">Total Wishlist Value</span>
                <span className="text-xl font-bold text-red-600">₦ {editedTotal}</span>
              </div>
              <button
                onClick={() => setOpenWishList(false)}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition"
              >
                Continue Shopping
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <img src={EmptyCart} alt="Empty wishlist" className="w-64 mb-8 opacity-80" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-8">Save items you love and come back to them anytime.</p>
            <button
              onClick={() => setOpenWishList(false)}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition shadow-lg"
            >
              Start Browsing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const WishlistItem = ({ item }) => {
  const dispatch = useDispatch();

  const editedPrice = numbersWithCommas(item.originalPrice);
  const editedDiscountPrice = numbersWithCommas(item?.discountPrice);

  const isEventActive =
    item?.isEvent &&
    item?.eventStartDate &&
    item?.eventEndDate &&
    new Date() >= new Date(item?.eventStartDate) &&
    new Date() <= new Date(item?.eventEndDate);

  const removeFromWishListHandler = () => {
    dispatch(removeFromWishList({ item }));
  };

  const addToCartHandler = () => {
    dispatch(addToCart({ item }));
    dispatch(removeFromWishList({ item }));
  };

  return (
    <div className="flex items-center gap-2 lg:gap-4 bg-white p-2 lg:p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
      {/* Image */}
      <img src={item.images?.[0]?.url} alt={item.name} className="max-h-20 w-20 object-cover rounded-lg flex-shrink-0" />

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm text-gray-900 line-clamp-2">{item.name}</h3>
        <p className={`text-base mt-2 ${isEventActive ? "text-indigo-600" : "text-gray-600"}`}>
          ₦ {isEventActive ? editedDiscountPrice : editedPrice}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 items-end">
        <button onClick={addToCartHandler} className=" p-1 transition" title="Add to Cart">
          <FaCartPlus size={24} className="cursor-pointer text-gray-900  transition" />
        </button>

        <button onClick={removeFromWishListHandler} className=" p-0.5 transition" title="Remove from wishlist">
          <RiDeleteBin2Fill size={24} className="cursor-pointer text-red-500  transition" />
        </button>
      </div>
    </div>
  );
};

export default WishList;
