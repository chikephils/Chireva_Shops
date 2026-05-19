import axios from "axios";
import { server } from "../server";
import { getNavigate } from "./navigation";

const api = axios.create({
  baseURL: server,
});

export const setupInterceptors = (store) => {
  api.interceptors.request.use(
    (config) => {
      const state = store.getState();

      let token;

      if (config.authType === "shop") {
        token = state.shop?.token;
      } else {
        token = state.user?.token;
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  api.interceptors.response.use(
    (response) => response,

    (error) => {
      const status = error.response?.status;
      const authType = error.config?.authType;
      const nav = getNavigate();

      if (status === 401) {
        if (authType === "shop") {
          store.dispatch({
            type: "shop/logoutSeller",
          });

          localStorage.removeItem("persist:shop");

          if (nav) {
            nav("/shop-login");
          }
        } else {
          store.dispatch({
            type: "user/setLogout",
          });

          localStorage.removeItem("persist:user");

          if (nav) {
            nav("/login");
          }
        }
      }

      return Promise.reject(error);
    },
  );
};

export default api;
