import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Reducers
import userReducer from "../features/user/userSlice";
import shopReducer from "../features/shop/shopSlice";
import productReducer from "../features/product/productSlice";
import adminReducer from "../features/admin/adminSlice";
import cartReducer from "../features/cart/cartSlice";
import wishlistReducer from "../features/wishlist/wishlistSlice";
import socketReducers from "../features/socket/socketSlice";

// User persist
const userPersistConfig = {
  key: "user",
  version: 1,
  storage,
};

//Shop persist
const shopPersistConfig = {
  key: "shop",
  version: 1,
  storage,
};

// Persist individual reducers
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedShopReducer = persistReducer(shopPersistConfig, shopReducer);

// Final reducer
const finalReducer = combineReducers({
  user: persistedUserReducer,
  shop: persistedShopReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  products: productReducer,
  admin: adminReducer,
  socket: socketReducers,
});

export const store = configureStore({
  reducer: finalReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

