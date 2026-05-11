import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  onlineUsers: [],
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    removeOnlineUser: (state, action) => {
      const userId = action.payload;
      state.onlineUsers = state.onlineUsers.filter((id) => id !== userId)
    }
  },
});

export const { setOnlineUsers, removeOnlineUser } = socketSlice.actions;

export default socketSlice.reducer;

export const selectOnlineUsers = (state) => state.socket.onlineUsers;
