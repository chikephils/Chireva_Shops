import axios from "axios";
import { server } from "../server";

const api = axios.create({
  baseURL: server,
  withCredentials: true,
});

export const setupInterceptors = (store) => {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;

      if (status === 403) {
        const state = store.getState();

        if (state?.user?.user) {
          store.dispatch({ type: "user/setLogout" });
          localStorage.removeItem("persist:user");
          window.location.href = "/";
        } else if (state?.shop?.seller) {
          store.dispatch({ type: "shop/logoutSeller" });
          localStorage.removeItem("persist:shop");
          window.location.href = "/shop-login";
        }
      }

      return Promise.reject(error);
    },
  );
};

export default api;
