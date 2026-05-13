import axios from "axios";
import { server } from "../server";
import { getNavigate } from "./navigation";

axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: server,
  withCredentials: true,
});

export const setupInterceptors = (store) => {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const role = error.config?.headers?.role;
      const nav = getNavigate();

      if (status === 401) {
        const state = store.getState();

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
