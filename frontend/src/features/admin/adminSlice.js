import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/userApi";
import { server } from "../../server";
import { toast } from "react-toastify";

const initialState = {
  users: [],
  sellers: [],
  adminOrders: [],
  adminPromoProducts: [],
  allProducts: [],
  allTransactions: [],
  escrowBalance: 0,
  profitBalance: 0,
  loading: {
    users: false,
    sellers: false,
    orders: false,
    products: false,
    transactions: false,
    balance: false,
    promoProducts: false,
  },
  error: null,
};

export const getAdminBalance = createAsyncThunk("admin/getAdminBalance", async (_, { rejectWithValue, getState }) => {
  const token = getState().user?.token;
  try {
    const response = await api.get(`${server}/user/admin-balance`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(response.data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const getAllUsers = createAsyncThunk("admin/getAllUsers", async (_, { rejectWithValue, getState }) => {
  const token = getState().user?.token;
  try {
    const response = await api.get(`${server}/user/admin-all-users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data.users);
    return response.data.users;
  } catch (error) {
    toast.error(error.response.data);
    return rejectWithValue(error.response.data);
  }
});

export const deleteUser = createAsyncThunk("admin/deletUser", async (id, { rejectWithValue, getState }) => {
  const token = getState().user?.token;
  try {
    const response = await api.delete(`${server}/user/delete-user/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    toast.success(response.data.message);
  } catch (error) {
    toast.error(error.response.message);
    return rejectWithValue(error.response.data);
  }
});

export const getAllSellers = createAsyncThunk("admin/getAllSellers", async (_, { rejectWithValue, getState }) => {
  const token = getState().user?.token;
  try {
    const response = await api.get(`${server}/shop/admin-all-sellers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.sellers;
  } catch (error) {
    toast.error(error.response.data.message);
    return rejectWithValue(error.response.data.message);
  }
});

export const deleteSeller = createAsyncThunk("admin/deleteSeller", async (id, { rejectWithValue, getState }) => {
  const token = getState().user?.token;
  try {
    const response = await api.delete(`${server}/shop/delete-seller/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    toast.success(response.data.message);
  } catch (error) {
    toast.error(error.response.data.message);
    return rejectWithValue(error.response.data.message);
  }
});

export const getAllAdminPromoProducts = createAsyncThunk("admin/getAllAdminPromoProducts", async (_, { rejectWithValue, getState }) => {
  const token = getState().user?.token;
  try {
    const response = await api.get(`${server}/product/admin-promo-products`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.promoProducts;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const getAllAdminOrders = createAsyncThunk("admin/getAllAdminOrders", async (_, { rejectWithValue, getState }) => {
  const token = getState().user?.token;
  try {
    const response = await api.get(`${server}/order/admin-all-orders/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.orders;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.reponse.data);
  }
});

//get all products Admin
export const getAllAdminProducts = createAsyncThunk("admin/getAllAdminProducts", async (_, { rejectWithValue, getState }) => {
  const token = getState().user?.token;
  try {
    const response = await api.get(`${server}/product/admin-all-products`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.products;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response.data);
  }
});

//get all Transactions
export const getAllAdminTransactions = createAsyncThunk("admin/getAllAdminTransactions", async (_, { rejectWithValu, getStatee }) => {
  const token = getState().user?.token;
  try {
    const response = await api.get(`${server}/withdraw/admin-withdrawal-requests`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response?.data);
    return response.data.withdrawals;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response.data);
  }
});

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},

  extraReducers(builder) {
    builder
      .addCase(getAdminBalance.pending, (state) => {
        state.loading.balance = true;
      })
      .addCase(getAdminBalance.fulfilled, (state, action) => {
        state.loading.balance = false;
        state.escrowBalance = action.payload.escrowBalance;
        state.profitBalance = action.payload.profitBalance;
      })
      .addCase(getAdminBalance.rejected, (state, action) => {
        state.loading.balance = false;
        state.error = action.payload;
      })
      .addCase(getAllUsers.pending, (state) => {
        state.loading.users = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.loading.users = false;
        state.error = null;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.error = action.payload;
        state.loading.users = false;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading.users = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        const currentUsers = state.users.filter((user) => user._id !== action.payload._id);
        state.users = currentUsers;
        state.loading.users = false;
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload;
        state.loading.users = false;
      })
      .addCase(getAllSellers.pending, (state) => {
        state.loading.sellers = true;
        state.error = null;
      })
      .addCase(getAllSellers.fulfilled, (state, action) => {
        state.sellers = action.payload;
        state.error = null;
        state.loading.sellers = false;
      })
      .addCase(getAllSellers.rejected, (state, action) => {
        state.error = action.payload;
        state.loading.sellers = false;
      })
      .addCase(deleteSeller.pending, (state) => {
        state.loading.sellers = true;
        state.error = null;
      })
      .addCase(deleteSeller.fulfilled, (state, action) => {
        const currentSellers = state.sellers.filter((seller) => seller._id !== action.payload._id);
        state.sellers = currentSellers;
        state.error = null;
        state.loading.sellers = false;
      })
      .addCase(deleteSeller.rejected, (state, action) => {
        state.error = action.payload;
        state.loading.sellers = false;
      })
      .addCase(getAllAdminPromoProducts.pending, (state) => {
        state.loading.promoProducts = true;
        state.error = null;
      })
      .addCase(getAllAdminPromoProducts.fulfilled, (state, action) => {
        state.loading.promoProducts = false;
        state.adminPromoProducts = action.payload;
      })
      .addCase(getAllAdminPromoProducts.rejected, (state, action) => {
        state.loading.promoProducts = false;
        state.error = action.payload;
      })
      .addCase(getAllAdminOrders.pending, (state) => {
        state.loading.orders = true;
        state.error = null;
      })
      .addCase(getAllAdminOrders.fulfilled, (state, action) => {
        state.loading.orders = false;
        state.adminOrders = action.payload;
        state.error = null;
      })
      .addCase(getAllAdminOrders.rejected, (state, action) => {
        state.loading.orders = false;
        state.error = action.payload;
      })
      .addCase(getAllAdminProducts.pending, (state) => {
        state.loading.products = true;
        state.error = null;
      })
      .addCase(getAllAdminProducts.fulfilled, (state, action) => {
        state.loading.products = false;
        state.allProducts = action.payload;
      })
      .addCase(getAllAdminProducts.rejected, (state, action) => {
        state.loading.products = false;
        state.error = action.payload;
      })
      .addCase(getAllAdminTransactions.pending, (state) => {
        state.loading.transactions = true;
        state.error = null;
      })
      .addCase(getAllAdminTransactions.fulfilled, (state, action) => {
        state.loading.transactions = false;
        state.allTransactions = action.payload;
      })
      .addCase(getAllAdminTransactions.rejected, (state, action) => {
        state.loading.transactions = false;
        state.error = action.payload;
      });
  },
});

export const selectAllUsers = (state) => state.admin.users;
export const selectAllUsersLoading = (state) => state.admin.loading.users;
export const selectAllSellers = (state) => state.admin.sellers;
export const selectAllSellersLoading = (state) => state.admin.loading.sellers;
export const selectAllAdminPromoProducts = (state) => state.admin.adminPromoProducts;
export const selectAdminPromoProductsLoading = (state) => state.admin.loading.promoProducts;
export const selectAdminOrders = (state) => state.admin.adminOrders;
export const selectAdminOrdersLoading = (state) => state.admin.loading.orders;
export const selectAdminAllProducts = (state) => state.admin.allProducts;
export const selectAdminProductsLoading = (state) => state.admin.loading.products;
export const selectAllAdminTransactions = (state) => state.admin.allTransactions;
export const selectAdminTransactionsLoading = (state) => state.admin.loading.transactions;
export const selectEscrowBalance = (state) => state.admin.escrowBalance;
export const selectProfitBalance = (state) => state.admin.profitBalance;
export const selectAdminBalanceLoading = (state) => state.admin.loading.balance;

export default adminSlice.reducer;
