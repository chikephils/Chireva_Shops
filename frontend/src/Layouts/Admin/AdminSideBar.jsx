import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { HiMiniShoppingBag } from "react-icons/hi2";
import { HiUserGroup } from "react-icons/hi2";
import { GiMoneyStack, GiSellCard } from "react-icons/gi";
import { BiSolidCalendarEvent, BiSolidPackage } from "react-icons/bi";

const navItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: MdDashboard, id: 1 },
  {
    path: "/admin/orders",
    label: "All Orders",
    icon: HiMiniShoppingBag,
    id: 2,
  },
  { path: "/admin/sellers", label: "All Sellers", icon: GiSellCard, id: 3 },
  { path: "/admin/users", label: "All Users", icon: HiUserGroup, id: 4 },
  {
    path: "/admin/products",
    label: "All Products",
    icon: BiSolidPackage,
    id: 5,
  },
  {
    path: "/admin/promo-sales",
    label: "All Promo-Sales",
    icon: BiSolidCalendarEvent,
    id: 6,
  },
  {
    path: "/admin/withdraw-request",
    label: "Withdraw Requests",
    icon: GiMoneyStack,
    id: 7,
  },
];

const mobileLabels = {
  "/admin/orders": "Orders",
  "/admin/sellers": "Sellers",
  "/admin/users": "Users",
  "/admin/products": "Products",
  "/admin/promo-sales": "Promo-Sales",
  "/admin/withdraw-request": "Withdrawals",
};

const AdminSideBar = ({ mobile = false }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path) => currentPath === path;

  // Desktop vertical bottom nav
  if (!mobile) {
    return (
      <div className="w-full overflow-y-auto scrollbar-hide h-full px-2 py-4 bg-gray-900">
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                className={` flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200l ${
                  active
                    ? "bg-teal-600/20 text-teal-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <item.icon size={26} />
                <span className="text-base font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // mobile horizontal sidebar
  return (
    <div className="w-full overflow-x-auto scrollbar-hide bg-gray-900 text-white">
      <div className="flex items-center justify-start gap-5 px-4 py-3 min-w-max">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const label = mobileLabels[item.path] || item.label;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col  items-center gap-1 min-w-[68px] py-1 ${
                active
                  ? "bg-teal-600/30 text-teal-400 font-medium"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon size={26} className="flex-shrink-0" />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AdminSideBar;
