import { logoutSeller } from "../features/shop/shopSlice";
import { setLogout } from "../features/user/userSlice";


export const tokenExpires = (dispatch) => {
  const timeoutDuration = 24 * 60 * 60 * 1000;
  setTimeout(() => {
    dispatch(setLogout());
  }, timeoutDuration);
};

export const shopTokenExpires = (dispatch) => {
  const timeoutDuration = 24 * 60 * 60 * 1000;
  setTimeout(() => {
    dispatch(logoutSeller());
  }, timeoutDuration);
};
