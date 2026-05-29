import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/userApi";
import { server } from "../../server";
import { toast } from "react-toastify";

const initialState = {
  user: null,
  token: null,
  orders: [],
  loading: false,
  error: null,
};

export const LoadUser = createAsyncThunk("user/LoadUser", async (_, { rejectWithValue, getState }) => {
  const token = getState().user?.token;
  try {
    const response = await api.get("/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const updateUserInformation = createAsyncThunk(
  "user/updateUserInformation",
  async ({ firstName, lastName, email, phoneNumber, password }, { rejectWithValue, getState }) => {
    const token = getState().user?.token;
    try {
      const response = await api.put(
        "/user/update-user-info",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        {
          firstName,
          lastName,
          email,
          phoneNumber,
          password,
        },
      );

      toast.success("User information updated successfully");
      return response.data.user;
    } catch (error) {
      toast.error(error.response.data.message);
      return rejectWithValue(error.response.data.message);
    }
  },
);

export const updateUserAddress = createAsyncThunk(
  "user/updateUserAddress",
  async ({ country, state, city, address1, zipCode, addressType }, { rejectWithValue, getState }) => {
    const token = getState().user?.token;
    try {
      const response = await api.put(
        "/user/update-user-addresses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        {
          country,
          state,
          city,
          address1,
          zipCode,
          addressType,
        },
      );
      toast.success("Address Updated Successfully");
      return response.data.user;
    } catch (error) {
      toast.error(error.response.data.message);
      return rejectWithValue(error.response.data.message);
    }
  },
);

export const deleteUserAddress = createAsyncThunk("user/deleteUserAddress", async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/user/delete-user-address/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    toast.success("Address Deleted Successfully");
    return response.data.user;
  } catch (error) {
    toast.error(error.response.data.message);
    return rejectWithValue(error.response.data.message);
  }
});

export const getAllOrders = createAsyncThunk("orders/getAllOrders", async (id, { rejectWithValue, getState }) => {
  const token = getState().user?.token;
  try {
    const response = await api.get(`/order/get-all-orders/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.orders;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response.data);
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
      state.orders = [];
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers(builder) {
    builder
      .addCase(LoadUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(LoadUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(LoadUser.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(updateUserInformation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserInformation.fulfilled, (state, action) => {
        state.user = action.payload;
        state.successMessage = action.payload.successMessage;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateUserInformation.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(updateUserAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserAddress.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateUserAddress.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(deleteUserAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserAddress.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteUserAddress.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setLogout, setLogin } = userSlice.actions;

export const selectUser = (state) => state.user.user;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
export const selectAllOrders = (state) => state.user.orders;
export const selectOrderLoading = (state) => state.user.loading;

export default userSlice.reducer;
