import axios from "axios";
import { server } from "../server";
import { store } from "../app/store";
import { setLogout } from "../features/user/userSlice";

const api = axios.create({
  baseURL: server,
});

api.interceptors.request.use(
  (config) => {
    const token = store.getState().user?.token;

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
    const status = error.response.status;

    if (status === 403) {
      store.dispatch(setLogout());
      localStorage.removeItem("persist:user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
