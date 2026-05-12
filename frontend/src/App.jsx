import React, { useEffect, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import ScrollToTop from "./ScrollToTop";
import { getAllProducts, getPromoProducts } from "./features/product/productSlice";
import NotFoundPage from "./pages/NotFoundPage";
import { socket } from "./utils/socket";
import { setOnlineUsers } from "./features/socket/socketSlice";
import UserLayout from "./Layouts/User/UserLayout";
import AuthLayout from "./Layouts/Auth/AuthLayout";
import ShopLayout from "./Layouts/Shop/ShopLayout";
import AdminLayout from "./Layouts/Admin/AdminLayout";
import ShopDetailsLayout from "./Layouts/Shop/ShopDetailsLayout";
import UserProfileLayout from "./Layouts/User/UserProfileLayout";
import AdminDetailsLayout from "./Layouts/Admin/AdminDetailsLayout";
import { jwtDecode } from "jwt-decode";

//user Pages
const LoginPage = lazy(() => import("./pages/User/LoginPage"));
const RegisterPage = lazy(() => import("./pages/User/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/User/ForgotPasswordPage"));
const ActivationPage = lazy(() => import("./pages/User/ActivationPage"));
const HomePage = lazy(() => import("./pages/User/HomePage"));
const ProductsPage = lazy(() => import("./pages/User/ProductsPage"));
const BestSellingPage = lazy(() => import("./pages/User/BestSellingPage"));
const PromoSalesPage = lazy(() => import("./pages/User/PromoSalesPage"));
const FAQPage = lazy(() => import("./pages/User/FAQPage"));
const ProductDetailsPage = lazy(() => import("./pages/User/ProductDetailsPage"));
const ProfilePage = lazy(() => import("./pages/User/ProfilePage"));
const DashboardPage = lazy(() => import("./pages/User/DashboardPage"));
const OrderPage = lazy(() => import("./pages/User/OrderPage"));
const InboxPage = lazy(() => import("./pages/User/InboxPage"));
const UserTransactionPage = lazy(() => import("./pages/User/UserTransactionPage"));
const InboxDetails = lazy(() => import("./pages/User/InboxDetails"));
const ChangePasswordPage = lazy(() => import("./pages/User/ChangePasswordPage"));
const AddressPage = lazy(() => import("./pages/User/AddressPage"));
const CheckoutPage = lazy(() => import("./pages/User/CheckoutPage"));
const OrderDetailsPage = lazy(() => import("./pages/User/OrderDetailsPage"));
const UserWithdrawalPage = lazy(() => import("./pages/User/UserWithdrawalPage"));
const PaymentRedirectPage = lazy(() => import("./pages/User/PaymentRedirectPage"));
const PasswordResetPage = lazy(() => import("./pages/User/PasswordResetPage"));

//SHop Pages
const CreateShopPage = lazy(() => import("./pages/Shop/CreateShopPage"));
const SellerActivationPage = lazy(() => import("./pages/Shop/SellerActivationPage"));
const ShopLoginPage = lazy(() => import("./pages/Shop/ShopLoginPage"));
const ShopForgotPasswordPage = lazy(() => import("./pages/Shop/ShopForgotPasswordPage"));
const ShopPasswordResetPage = lazy(() => import("./pages/Shop/ShopPasswordResetPage"));
const ShopHomePage = lazy(() => import("./pages/Shop/ShopHomePage"));
const ShopDashboardPage = lazy(() => import("./pages/Shop/ShopDashboardPage"));
const ShopCreateProduct = lazy(() => import("./pages/Shop/ShopCreateProduct"));
const ShopAllProducts = lazy(() => import("./pages/Shop/ShopAllProducts"));
const ShopPromoSales = lazy(() => import("./pages/Shop/ShopPromoSales"));
const ShopAllOrders = lazy(() => import("./pages/Shop/ShopAllOrders"));
const ShopInboxPage = lazy(() => import("./pages/Shop/ShopInboxPage"));
const ShopInboxDetails = lazy(() => import("./pages/Shop/ShopInboxDetails"));
const ShopWithdrawalPage = lazy(() => import("./pages/Shop/ShopWithdrawalPage"));
const ShopSettingsPage = lazy(() => import("./pages/Shop/ShopSettingsPage"));
const ShopPreviewPage = lazy(() => import("./pages/Shop/ShopPreviewPage"));
const ShopOrderDetails = lazy(() => import("./pages/Shop/ShopOrderDetails"));
const ShopTransactionsPage = lazy(() => import("./pages/Shop/ShopTransactionsPage"));
const ShopEditProduct = lazy(() => import("./pages/Shop/ShopEditProduct"));

//Admin Pages
const AdminDashboardPage = lazy(() => import("./pages/Admin/AdminDashboardPage"));
const AdminDashboardUsers = lazy(() => import("./pages/Admin/AdminDashboardUsers"));
const AdminDashboardSellers = lazy(() => import("./pages/Admin/AdminDashboardSellers"));
const AdminDashboardOrders = lazy(() => import("./pages/Admin/AdminDashboardOrders"));
const AdminDashboardProducts = lazy(() => import("./pages/Admin/AdminDashboardProducts"));
const AdminOrderDetails = lazy(() => import("./pages/Admin/AdminOrderDetails"));
const AdminDashboardPromoSales = lazy(() => import("./pages/Admin/AdminDashboardPromoSales"));
const AdminWithdrawalRequest = lazy(() => import("./pages/Admin/AdminWithdrawalRequest"));
const AdminWithdrawalDetailsPage = lazy(() => import("./pages/Admin/AdminWithdrawalDetailsPage"));

const theme = createTheme({
  palette: {
    primary: {
      main: "#84cc16",
      light: "#a3e635",
      dark: "#65a30d",
    },
    secondary: {
      main: "#f43f5e",
    },
    background: {
      default: "#f9fafb",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Protected Route wrapper
const ProtectedRoute = ({ children, isAllowed, redirectTo = "/login" }) => {
  return isAllowed ? children : <Navigate to={redirectTo} replace />;
};

function App() {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);
  const seller = useSelector((state) => state.shop.seller);

  const isUserAuth = !!user;
  const isSellerAuth = !!seller;
  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    dispatch(getAllProducts({ page: 1, limit: 8 }));
    dispatch(getPromoProducts({ page: 1, limit: 8 }));
  }, [dispatch]);

  // Global socket connect
  useEffect(() => {
    const currentUser = user || seller;

    if (!currentUser?._id) return;

    const connectSocket = () => {
      if (!socket.connected) {
        socket.connect();
      }
      socket.emit("addUser", currentUser._id.toString());
    };

    connectSocket();

    socket.on("connect", connectSocket);
    socket.on("reconnect", connectSocket);
    socket.on("getUsers", (users) => {
      dispatch(setOnlineUsers(users));
    });

    return () => {
      socket.off("connect", connectSocket);
      socket.off("reconnect", connectSocket);
      socket.off("getUsers");
      // socket.disconnect();
    };
  }, [dispatch, user?._id, seller?._id]);

  return (
    <ThemeProvider theme={theme}>
      <ScrollToTop />
      <div className="max-w-screen- min-h-screen mx-auto bg-gray-50">
        <Routes location={location} key={location.pathname}>
          {/* USER LAYOUT */}
          <Route element={<UserLayout />}>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/best-selling" element={<BestSellingPage />} />
            <Route path="/promo-sales" element={<PromoSalesPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/shop/preview/:id" element={<ShopPreviewPage />} />

            {/* Protected User Routes */}
            <Route
              path="/user/order/details/:id"
              element={
                <ProtectedRoute isAllowed={isUserAuth}>
                  <OrderDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/withdraw"
              element={
                <ProtectedRoute isAllowed={isUserAuth}>
                  <UserWithdrawalPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* USER PROFILE LAYOUT / PROTECTED USER ROUTES */}
          <Route element={<UserProfileLayout />}>
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute isAllowed={isUserAuth} redirectTo="/login">
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute isAllowed={isUserAuth} redirectTo="/login">
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/orders"
              element={
                <ProtectedRoute isAllowed={isUserAuth}>
                  <OrderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/inbox"
              element={
                <ProtectedRoute isAllowed={isUserAuth}>
                  <InboxPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/transactions"
              element={
                <ProtectedRoute isAllowed={isUserAuth}>
                  <UserTransactionPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/change-password"
              element={
                <ProtectedRoute isAllowed={isUserAuth}>
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/address"
              element={
                <ProtectedRoute isAllowed={isUserAuth}>
                  <AddressPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* AUTH/PAYMENT/CHECKOUT LAYOUT (NO HEADER) */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={isUserAuth ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route path="/register" element={isUserAuth ? <Navigate to="/" replace /> : <RegisterPage />} />
            <Route path="/forgot-Password" element={isUserAuth ? <Navigate to="/" replace /> : <ForgotPasswordPage />} />
            <Route path="/activation" element={<ActivationPage />} />
            <Route path="/password-reset/:id/:reset_isUserAuth" element={<PasswordResetPage />} />

            <Route
              path="/pay"
              element={
                <ProtectedRoute isAllowed={isUserAuth}>
                  <PaymentRedirectPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute isAllowed={isUserAuth}>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/inbox/:id"
              element={
                <ProtectedRoute isAllowed={isUserAuth}>
                  <InboxDetails />
                </ProtectedRoute>
              }
            />
            <Route path="/seller/activation" element={<SellerActivationPage />} />

            <Route path="/create-shop" element={isSellerAuth ? <Navigate to="/dashboard" replace /> : <CreateShopPage />} />

            <Route path="/shop-login" element={isSellerAuth ? <Navigate to="/dashboard" replace /> : <ShopLoginPage />} />

            <Route
              path="/shop/forgot-password"
              element={isSellerAuth ? <Navigate to="/dashboard" replace /> : <ShopForgotPasswordPage />}
            />

            <Route path="/shop-password-reset" element={<ShopPasswordResetPage />} />
            <Route
              path="/dashboard/messages/:id"
              element={
                <ProtectedRoute isAllowed={isSellerAuth} redirectTo="/shop-login">
                  <ShopInboxDetails />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* SHOP DETAILS LAYOUT & ROUTES WITH no SIDEBAR*/}
          <Route element={<ShopDetailsLayout />}>
            <Route
              path="/shop/:id"
              element={
                <ProtectedRoute isAllowed={isSellerAuth} redirectTo="/shop-login">
                  <ShopHomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/withdraw-money"
              element={
                <ProtectedRoute isAllowed={isSellerAuth} redirectTo="/shop-login">
                  <ShopWithdrawalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/orders/:id"
              element={
                <ProtectedRoute isAllowed={isSellerAuth} redirectTo="/shop-login">
                  <ShopOrderDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/edit-product/:id"
              element={
                <ProtectedRoute isAllowed={isSellerAuth} redirectTo="/shop-login">
                  <ShopEditProduct />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* SHOP LAYOUT & ROUTES*/}
          <Route element={<ShopLayout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute isAllowed={isSellerAuth} redirectTo="/shop-login">
                  <ShopDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/create-product"
              element={
                <ProtectedRoute isAllowed={isSellerAuth} redirectTo="/shop-login">
                  <ShopCreateProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/products"
              element={
                <ProtectedRoute isAllowed={isSellerAuth} redirectTo="/shop-login">
                  <ShopAllProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/promo-sales"
              element={
                <ProtectedRoute isAllowed={isSellerAuth} redirectTo="/shop-login">
                  <ShopPromoSales />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/orders"
              element={
                <ProtectedRoute isAllowed={isSellerAuth} redirectTo="/shop-login">
                  <ShopAllOrders />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/messages"
              element={
                <ProtectedRoute isAllowed={isSellerAuth} redirectTo="/shop-login">
                  <ShopInboxPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/transactions"
              element={
                <ProtectedRoute isAllowed={isSellerAuth} redirectTo="/shop-login">
                  <ShopTransactionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute isAllowed={isSellerAuth} redirectTo="/shop-login">
                  <ShopSettingsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* ADMIN DETAILS LAYOUT & ROUTES WITH no SIDEBAR*/}
          <Route element={<AdminDetailsLayout />}>
            <Route
              path="/admin/order-details/:id"
              element={
                <ProtectedRoute isAllowed={isAdmin} redirectTo="/login">
                  <AdminOrderDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/withdrawal-details/:id"
              element={
                <ProtectedRoute isAllowed={isAdmin} redirectTo="/login">
                  <AdminWithdrawalDetailsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/*  {/* ADMIN PROFILE LAYOUT/ROUTES */}
          <Route element={<AdminLayout />}>
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute isAllowed={isAdmin} redirectTo="/login">
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute isAllowed={isAdmin} redirectTo="/login">
                  <AdminDashboardUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sellers"
              element={
                <ProtectedRoute isAllowed={isAdmin} redirectTo="/login">
                  <AdminDashboardSellers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute isAllowed={isAdmin} redirectTo="/login">
                  <AdminDashboardOrders />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/products"
              element={
                <ProtectedRoute isAllowed={isAdmin} redirectTo="/login">
                  <AdminDashboardProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/promo-sales"
              element={
                <ProtectedRoute isAllowed={isAdmin} redirectTo="/login">
                  <AdminDashboardPromoSales />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/withdraw-request"
              element={
                <ProtectedRoute isAllowed={isAdmin} redirectTo="/login">
                  <AdminWithdrawalRequest />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <ToastContainer
          position="top-left"
          autoClose={1500}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover={false}
          theme="colored"
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
