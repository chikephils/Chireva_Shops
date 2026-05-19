import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../utils/axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const initialState = {
  seller: null,
  token: null,
  shopProducts: [],
  shopOrders: [],
  loading: true,
  error: null,

  //Promo Products
  shopPromoProducts: [],
  shopPromoProductsLoading: false,
  shopPromoProductsError: null,
};

export const LoadSeller = createAsyncThunk("shop/LoadSeller", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get(`${server}/shop/getSeller`, {
      authType: "shop",
    });
    return response.data.seller;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response.data);
  }
});

//get All Products from a shop
export const getShopProducts = createAsyncThunk("shop/getShopProducts", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`${server}/product/get-all-products-shop/${id}`, {
      authType: "shop",
    });
    return response.data.products;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response.data);
  }
});

export const getShopPromoProducts = createAsyncThunk("shop/getShopPromoProducts", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`${server}/product/get-shop-promo-products/${id}`, {
      authType: "shop",
    });
    return response.data.promoProducts;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response.data);
  }
});

//delete product of shop
export const deleteShopProduct = createAsyncThunk("shop/deleteShopProduct", async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete(`${server}/product/delete-shop-product/${id}`, {
      authType: "shop",
    });
    toast.success(response?.data?.message);
    return response.data.product;
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete product. Please try again.";
    toast.error(errorMessage);
    return rejectWithValue(error.response.data);
  }
});

export const getAllShopOrders = createAsyncThunk("shop/getAllShopOrders", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`${server}/order/get-seller-all-orders/${id}`, {
      authType: "shop",
    });
    return response.data.orders;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response.data);
  }
});

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    setShopLogin: (state, action) => {
      state.seller = action.payload.seller;
      state.token = action.payload.token;
    },
    logoutSeller: (state) => {
      state.seller = null;
      state.token = null;
      state.shopProducts = [];
      state.shopOrders = [];
      state.loading = false;
      state.error = null;

      state.shopPromoProducts = [];
      state.shopPromoProductsLoading = false;
      state.shopPromoProductsError = null;
    },
  },

  extraReducers(builder) {
    builder
      .addCase(LoadSeller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(LoadSeller.fulfilled, (state, action) => {
        state.seller = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(LoadSeller.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(getShopProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShopProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.shopProducts = action.payload;
      })
      .addCase(getShopProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getShopPromoProducts.pending, (state) => {
        state.shopPromoProductsLoading = true;
        state.error = null;
      })
      .addCase(getShopPromoProducts.fulfilled, (state, action) => {
        state.shopPromoProductsLoading = false;
        state.shopPromoProducts = action.payload;
      })
      .addCase(getShopPromoProducts.rejected, (state, action) => {
        state.shopPromoProductsLoading = false;
        state.shopPromoProductsError = action.payload;
      })
      .addCase(deleteShopProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteShopProduct.fulfilled, (state, action) => {
        state.loading = false;
        const currentProducts = state.shopProducts.filter((product) => product._id !== action.payload._id);
        state.shopProducts = currentProducts;
      })
      .addCase(deleteShopProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllShopOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllShopOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.shopOrders = action.payload;
        state.error = null;
      })
      .addCase(getAllShopOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setShopLogin, logoutSeller } = shopSlice.actions;
export const selectSeller = (state) => state.shop.seller;
export const selectSellerLoading = (state) => state.shop.loading;
export const selectSellerError = (state) => state.shop.error;
export const selectAllShopProducts = (state) => state.shop.shopProducts;
export const selectAllProductsLoading = (state) => state.shop.loading;
export const selectAllShopOrders = (state) => state.shop.shopOrders;
export const selectShopOrderLoading = (state) => state.shop.loading;
export const selectAllShopPromoProducts = (state) => state.shop.shopPromoProducts;
export const selectAllShopPromoProductsLoading = (state) => state.shop.shopPromoProductsLoading;
export const selectAllShopPromoProductsError = (state) => state.shop.shopPromoProductsError;

export default shopSlice.reducer;
