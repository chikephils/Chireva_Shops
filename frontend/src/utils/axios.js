import axios from "axios";
import { server } from "../server";
import { getNavigate } from "./navigation";

const api = axios.create({
  baseURL: server,
});

let requestInterceptor;
let responseInterceptor;

// Prevent multiple redirects/logouts
let isRedirecting = false;

export const setupInterceptors = (store) => {
  // Eject old interceptors if they already exist
  if (requestInterceptor !== undefined) {
    api.interceptors.request.eject(requestInterceptor);
  }

  if (responseInterceptor !== undefined) {
    api.interceptors.response.eject(responseInterceptor);
  }

  // REQUEST INTERCEPTOR
  requestInterceptor = api.interceptors.request.use(
    (config) => {
      const token = config.authType === "shop" ? store.getState().shop?.token : store.getState().user?.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  // RESPONSE INTERCEPTOR
  responseInterceptor = api.interceptors.response.use(
    (response) => response,

    async (error) => {
      const status = error.response?.status;
      const authType = error.config?.authType;
      const nav = getNavigate();

      // Prevent multiple simultaneous redirects
      if (status === 401 && !isRedirecting) {
        isRedirecting = true;

        if (authType === "shop") {
          store.dispatch({
            type: "shop/logoutSeller",
          });

          nav?.("/shop-login");
        } else {
          store.dispatch({
            type: "user/setLogout",
          });

          nav?.("/login");
        }

        setTimeout(() => {
          isRedirecting = false;
        }, 1000);
      }

      return Promise.reject(error);
    },
  );
};

export default api;
