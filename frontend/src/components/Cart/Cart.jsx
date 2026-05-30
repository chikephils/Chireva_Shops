import React, { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { HiOutlineMinus, HiPlus, HiShoppingBag } from "react-icons/hi";
import { MdDeleteForever } from "react-icons/md";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import EmptyCart from "../../Assests/img/emptyCart.svg";
import { reduceItemQuantity, increaseItemQuantity, removeFromCart, itemsInCart, clearCart } from "../../features/cart/cartSlice";
import { numbersWithCommas } from "../../utils/priceDisplay";

const Cart = ({ setOpenCart }) => {
  const [total, setTotal] = useState(0);
  const cartItems = useSelector(itemsInCart);
  const dispatch = useDispatch();
  const editedTotal = numbersWithCommas(Number(total).toFixed(2));

  useEffect(() => {
    const totalPrice = cartItems.reduce((acc, item) => {
      const isEventActive =
        item?.isEvent &&
        item?.eventStartDate &&
        item?.eventEndDate &&
        new Date() >= new Date(item.eventStartDate) &&
        new Date() <= new Date(item.eventEndDate);

      const price = isEventActive ? item.discountPrice : item.originalPrice;

      return acc + price * item.quantity;
    }, 0);

    setTotal(totalPrice);
  }, [cartItems]);

  const emptyCart = () => {
    dispatch(clearCart());
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex justify-end" onClick={() => setOpenCart(false)}>
      <div className="w-full max-w-lg h-[100dvh] bg-white shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpenCart(false)} className="p-2 rounded-full hover:bg-gray-100 transition ">
              <RxCross1 size={24} className="cursor-pointer bg-black/50 hover:bg-black/70 rounded-full p-1 text-gray-100" />
            </button>
            <h2 className="text-xl font-semibold">Cart</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <HiShoppingBag size={22} />
              <span className="font-medium">{cartItems.length}</span>
            </div>
            {cartItems.length > 0 && (
              <button onClick={emptyCart} className="p-2 rounded-full hover:bg-red-50 text-red-600 transition" title="Clear cart">
                <MdDeleteForever size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Cart Items or Empty State */}
        {cartItems.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto py-4 px-3 md:px-5 scrollbar-hide">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItem key={item._id} item={item} />
                ))}
              </div>
            </div>

            {/* Checkout Footer */}
            <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 p-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-base font-medium">Total</span>
                <span className="text-xl font-bold text-red-600">₦ {editedTotal}</span>
              </div>
              <Link to="/checkout" className="block w-full">
                <button
                  onClick={() => setOpenCart(false)}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition shadow-lg hover:shadow-xl"
                >
                  Proceed to Checkout
                </button>
              </Link>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <img src={EmptyCart} alt="Empty cart" className="w-64 mb-8 opacity-80" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-8">Looks like you haven't added anything yet.</p>
            <button
              onClick={() => setOpenCart(false)}
              className="px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const editedPrice = numbersWithCommas(item.originalPrice);
  const editedDiscountPrice = numbersWithCommas(item?.discountPrice);

  const isEventActive =
    item?.isEvent &&
    item?.eventStartDate &&
    item?.eventEndDate &&
    new Date() >= new Date(item?.eventStartDate) &&
    new Date() <= new Date(item?.eventEndDate);

  const totalPrice = isEventActive ? item?.discountPrice * item?.quantity : item?.originalPrice * item?.quantity;

  const editedTotal = numbersWithCommas(totalPrice);

  return (
    <div className="flex items-center gap-4 bg-white p-2 lg:p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
      {/* Image */}
      <img
        src={item.images?.[0]?.url}
        alt={item.name}
        className=" max-h-16 w-16 sm:max-h-20 sm:w-20 object-cover rounded-lg flex-shrink-0"
      />

      {/* Details */}
      <div className="flex-1">
        <h3 className="font-medium text-sm lg:text-base text-gray-900">
          {item?.name.length > 20 ? item?.name.slice(0, 20) + "..." : item?.name}
        </h3>
        <p className={`text-sm xs:text-xs mt-1 ${isEventActive ? "text-indigo-600" : "text-gray-600"}`}>
          ₦ {isEventActive ? editedDiscountPrice : editedPrice} {item?.quantity > 1 && <span>x ({item?.quantity})</span>}
        </p>
        <p className="text-sm xs:text-xs lg:text-lg font-semibold text-red-600 mt-2">₦ {editedTotal}</p>
      </div>

      {/* Quantity & Remove */}
      <div className="flex flex-col items-end gap-4">
        <div className="flex items-center gap-1 lg:gap-3 bg-gray-100 rounded-full px-1 lg:px-3 py-1">
          <button
            onClick={() => dispatch(reduceItemQuantity({ item }))}
            className="w-7 h-7 rounded-full hover:bg-gray-300 transition flex items-center justify-center"
            disabled={item.quantity <= 1}
          >
            <HiOutlineMinus size={14} />
          </button>
          <span className="w-6 xs:w-3 text-center font-medium">{item.quantity}</span>
          <button
            onClick={() => dispatch(increaseItemQuantity({ item }))}
            className="w-7 h-7 rounded-full hover:bg-gray-300 transition flex items-center justify-center"
          >
            <HiPlus size={14} />
          </button>
        </div>

        <button onClick={() => dispatch(removeFromCart({ item }))} className="text-gray-400 hover:text-red-600 transition rounded-full">
          <RxCross1 size={20} className="cursor-pointer text-white bg-black/50 rounded-full p-1 hover:bg-black/70 transition" />
        </button>
      </div>
    </div>
  );
};

export default Cart;
