import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "../../server";
import api from "../../utils/axios";

const initialState = {
  //Regular Products
  products: [],
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,
  limit: 8,
  loading: false,
  error: null,
  hasMore: true,

  //Promo Products
  promoProducts: [],
  promoCurrentPage: 1,
  promoTotalPages: 1,
  promoTotalProducts: 0,
  promoLimit: 8,
  promoHasMore: true,
  promoLoading: false,
  promoError: null,
};

export const getAllProducts = createAsyncThunk(
  "products/getAllProducts",
  async ({ page = 1, limit = 8, category }, { rejectWithValue }) => {
    try {
      const params = { page, limit };

      if (category) {
        params.category = category;
      }
      const response = await api.get(`${server}/product/get-all-products`, { params });
      return {
        products: response.data.products,
        pagination: response.data.pagination || {
          currentPage: page,
          totalPages: 1,
          totalProducts: 0,
          limit,
        },
      };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response.data);
    }
  },
);

export const getPromoProducts = createAsyncThunk("products/getPromoProducts", async ({ page = 1, limit = 8 }, { rejectWithValue }) => {
  try {
    const params = { page, limit };
    const response = await api.get(`${server}/product/get-promo-products`, { params });
    return {
      promoProducts: response.data.promoProducts,
      pagination: response.data.pagination || {
        currentPage: page,
        totalPages: 1,
        totalProducts: 0,
        limit,
      },
    };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch promo products");
  }
});

//create Products
export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (
    { name, description, category, originalPrice, discountPrice, stock, shopId, images, isEvent, eventStartDate, eventEndDate, eventTag },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post(`${server}/product/create-product`, {
        name,
        description,
        category,
        originalPrice,
        discountPrice,
        stock,
        shopId,
        images,
        isEvent,
        eventStartDate,
        eventEndDate,
        eventTag,
      });
      return response.data.product;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response.data);
    }
  },
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    updateProductStock: (state, action) => {
      const { productId, quantity } = action.payload;
      const product = state.products.find((product) => product._id === productId);
      if (product) {
        product.stock -= quantity;
        product.sold_out += quantity;
      }
    },
    updateProductAfterRefund: (state, action) => {
      const { productId, quantity } = action.payload;
      const product = state.products.find((product) => product._id === productId);
      if (product) {
        product.stock += quantity;
        product.sold_out -= quantity;
      }
    },
  },
  extraReducers(builder) {
    builder

      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        const { products, pagination } = action.payload;

        const currentArg = action.meta.arg; // access the arguments passed to thunk

        // If page === 1 (new category / initial load / refresh replace
        // Otherwise append (load more in same category)
        if (currentArg.page === 1) {
          state.products = products;
        } else {
          // Prevent duplicates in case of race conditions
          const existingIds = new Set(state.products.map((p) => p._id));
          const newUnique = products.filter((p) => !existingIds.has(p._id));
          state.products = [...state.products, ...newUnique];
        }

        state.currentPage = pagination.currentPage;
        state.totalPages = pagination.totalPages;
        state.totalProducts = pagination.totalProducts;
        state.limit = pagination.limit;
        state.hasMore = pagination.currentPage < pagination.totalPages;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.hasMore = false;
      })
      .addCase(getPromoProducts.pending, (state) => {
        state.promoLoading = true;
        state.promoError = null;
      })
      .addCase(getPromoProducts.fulfilled, (state, action) => {
        state.promoLoading = false;

        const { promoProducts, pagination } = action.payload;
        const currentArg = action.meta.arg;
        if (currentArg.page === 1) {
          state.promoProducts = promoProducts;
        } else {
          const existingIds = new Set(state.promoProducts.map((p) => p._id));
          const newUnique = promoProducts.filter((p) => !existingIds.has(p._id));
          state.promoProducts = [...state.promoProducts, ...newUnique];
        }

        state.promoCurrentPage = pagination.currentPage;
        state.promoTotalPages = pagination.totalPages;
        state.promoTotalProducts = pagination.totalPromoProducts;
        state.promoLimit = pagination.limit || currentArg.limit;
        state.promoHasMore = pagination.currentPage < pagination.totalPages;
      })
      .addCase(getPromoProducts.rejected, (state, action) => {
        state.promoLoading = false;
        state.promoError = action.payload;
        state.promoHasMore = false;
      })
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateProductStock } = productSlice.actions;
export default productSlice.reducer;
export const selectAllProducts = (state) => state.products.products;
export const selectError = (state) => state.products.error;
export const selectProductsLoading = (state) => state.products.loading;
export const selectHasMoreProducts = (state) => state.products.hasMore;
export const selectPromoProducts = (state) => state.products.promoProducts;
export const selectPromoLoading = (state) => state.products.promoLoading;
export const selectPromoError = (state) => state.products.promoError;
export const selectPromoHasMore = (state) => state.products.promoHasMore;
export const selectPromoPagination = (state) => ({
  currentPage: state.products.promoCurrentPage,
  totalPages: state.products.promoTotalPages,
  totalProducts: state.products.promoTotalProducts,
  limit: state.products.promoLimit,
});
