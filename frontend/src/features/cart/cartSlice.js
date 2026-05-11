import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const initialState = {
  cartItems: localStorage.getItem("cartItems")
    ? JSON.parse(localStorage.getItem("cartItems"))
    : [],
  isOpen: false,
  totalQuantity: localStorage.getItem("cartQuantity")
    ? parseInt(localStorage.getItem("cartQuantity"))
    : 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    addToCart(state, action) {
      const { item } = action.payload;
      const existingItem = state.cartItems.find(
        (cartItem) => cartItem._id === item._id
      );

      if (!existingItem) {
        if (item.stock > 0) {
          state.cartItems.push({ ...item, quantity: 1 });
          state.totalQuantity += 1;
          toast.success("Item added to cart");
          localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
          localStorage.setItem("cartQuantity", state.totalQuantity.toString());
        } else {
          toast.info("Item is out of stock");
        }
      } else {
        toast.info("Item already in Cart");
      }
      return state;
    },

    removeFromCart(state, action) {
      const { item } = action.payload;
      const itemIndex = state.cartItems.findIndex(
        (cartItem) => cartItem._id === item._id
      );

      if (itemIndex !== -1) {
        state.totalQuantity -= state.cartItems[itemIndex].quantity;

        state.cartItems.splice(itemIndex, 1);
        toast.success("Item removed from cart");

        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        localStorage.setItem("cartQuantity", state.totalQuantity.toString());
      }
    },

    clearCart(state, action) {
      state.cartItems = [];
      state.totalQuantity = 0;
      localStorage.removeItem("cartItems");
      localStorage.removeItem("cartQuantity");
    },

    reduceItemQuantity(state, action) {
      const { item } = action.payload;
      const existingItem = state.cartItems.find(
        (cartItem) => cartItem._id === item._id
      );

      if (existingItem && existingItem.quantity > 1) {
        existingItem.quantity -= 1;
      } else if (existingItem && existingItem.quantity === 1) {
        state.cartItems = state.cartItems.filter(
          (cartItem) => cartItem._id !== item._id
        );
      }
      state.totalQuantity -= 1;
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      localStorage.setItem("cartQuantity", state.totalQuantity.toString());
    },

    increaseItemQuantity(state, action) {
      const { item } = action.payload;
      const existingItem = state.cartItems.find(
        (cartItem) => cartItem._id === item._id
      );

      if (existingItem) {
        if (existingItem.quantity < item.stock) {
          existingItem.quantity += 1;
          state.totalQuantity += 1;
          localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
          localStorage.setItem("cartQuantity", state.totalQuantity.toString());
        } else {
          toast.info("Cannot increase quantity, Item is out of stock.");
        }
      }
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  clearCart,
  increaseItemQuantity,
  reduceItemQuantity,
} = cartSlice.actions;
export const itemsInCart = (state) => state.cart.cartItems;
export const totalCartQuantity = (state) => state.cart.totalQuantity;
export default cartSlice.reducer;
