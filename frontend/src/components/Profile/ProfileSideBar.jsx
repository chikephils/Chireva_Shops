import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FcPortraitMode, FcPaid, FcAddressBook, FcPrivacy, FcOrganization, FcMoneyTransfer } from "react-icons/fc";
import { RiMessageFill, RiLogoutCircleLine } from "react-icons/ri";
import { MdAdminPanelSettings } from "react-icons/md";
import api from "../../utils/axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setLogout } from "../../features/user/userSlice";

const menuItems = [
  { path: "/user-dashboard", label: "Dashboard", icon: FcOrganization },
  { path: "/profile", label: "Profile", icon: FcPortraitMode },
  { path: "/profile/orders", label: "Orders", icon: FcPaid },
  {
    path: "/profile/inbox",
    label: "Inbox",
    icon: RiMessageFill,
    color: "green",
  },
  {
    path: "/profile/transactions",
    label: "Transactions",
    icon: FcMoneyTransfer,
    color: "green",
  },
  {
    path: "/profile/change-password",
    label: "Change Password",
    icon: FcPrivacy,
  },
  { path: "/profile/address", label: "Address Book", icon: FcAddressBook },
];

const mobileMenuItems = [
  { path: "/user-dashboard", label: "Dashboard", icon: FcOrganization },
  { path: "/profile", label: "Profile", icon: FcPortraitMode },
  { path: "/profile/orders", label: "Orders", icon: FcPaid },
  {
    path: "/profile/inbox",
    label: "Inbox",
    icon: RiMessageFill,
    color: "green",
  },
  {
    path: "/profile/transactions",
    label: "Transactions",
    icon: FcMoneyTransfer,
    color: "green",
  },
  {
    path: "/profile/change-password",
    label: "Password",
    icon: FcPrivacy,
  },
  { path: "/profile/address", label: "Address", icon: FcAddressBook },
];

const ProfileSideBar = ({ mobile = false }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state?.user);

  const currentPath = location.pathname;
  const isActive = (path) => currentPath === path;

  const handleLogout = async () => {
    try {
      const response = await api.get(`${server}/user/logout`, { withCredentials: true });

      dispatch(setLogout());
      localStorage.removeItem("persist:user");

      navigate("/", { replace: true });
      toast.success(response.data.message || "Logged out successfully");
    } catch (error) {
      dispatch(setLogout());
      localStorage.removeItem("persist:user");

      navigate("/", { replace: true });
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  };

  // Desktop Vertical Sidebar
  if (!mobile) {
    return (
      <div className="w-full h-full overflow-y-auto scrollbar-hide pb-10">
        <div className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                  active ? "bg-red-50 text-red-600 shadow-sm" : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <Icon size={24} color={active ? "#ef4444" : item.color} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-all"
          >
            <RiLogoutCircleLine size={24} />
            <span className="font-medium">Logout</span>
          </button>

          {user?.role === "Admin" && (
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-100 transition-all text-gray-700"
            >
              <MdAdminPanelSettings size={24} color="green" />
              <span className="font-medium">Admin Dashboard</span>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Mobile Horizontal Scrollable Bar
  return (
    <div className="w-full h-full overflow-x-auto scrollbar-hide">
      <div className="flex justify-evenly gap-4 py-2">
        {mobileMenuItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link key={index} to={item.path} className="flex flex-col items-center justify-center gap-1 min-w-[70px]">
              <Icon size={26} color={active ? "#ef4444" : item.color || "#6b7280"} />
              <span className={`text-xs font-medium ${active ? "text-red-600" : "text-gray-600"}`}>{item.label}</span>
            </Link>
          );
        })}

        <button onClick={handleLogout} className="flex flex-col items-center gap-1 min-w-[70px] py-1">
          <RiLogoutCircleLine size={26} color="#ef4444" />
          <span className="text-xs font-medium text-red-600">Logout</span>
        </button>

        {user?.role === "Admin" && (
          <Link to="/admin/dashboard" className="flex flex-col items-center gap-1 min-w-[70px] py-1">
            <MdAdminPanelSettings size={26} color="green" />
            <span className="text-xs font-medium text-gray-600">Admin</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProfileSideBar;
