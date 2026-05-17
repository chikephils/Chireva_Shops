import axios from "axios";
import { server } from "../server";
import { getNavigate } from "./navigation";

const api = axios.create({
  baseURL: server,
});

export const setupInterceptors = (store) => {
  // REQUEST INTERCEPTOR
  api.interceptors.request.use(
    (config) => {
      const state = store.getState();

      // user token
      const userToken = state.user?.token;

      // seller token
      const sellerToken = state.shop?.token;

      // prefer seller token if exists
      const token = sellerToken || userToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  // RESPONSE INTERCEPTOR
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const role = error.config?.headers?.role;
      const nav = getNavigate();

      if (status === 401) {
        if (role === "shop") {
          store.dispatch({ type: "shop/logoutSeller" });
          localStorage.removeItem("persist:shop");

          if (nav) nav("/shop-login");
        } else {
          store.dispatch({ type: "user/setLogout" });
          localStorage.removeItem("persist:user");

          if (nav) nav("/login");
        }
      }

      return Promise.reject(error);
    },
  );
};

export default api;
