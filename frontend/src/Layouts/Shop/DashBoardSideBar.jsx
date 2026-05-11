import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FcOrganization, FcPaid, FcPackage, FcSms, FcMoneyTransfer, FcAutomatic } from "react-icons/fc";
import { RiCalendarEventFill } from "react-icons/ri";
import { MdCreateNewFolder } from "react-icons/md";

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: FcOrganization, id: 1 },
  { path: "/dashboard/orders", label: "All Orders", icon: FcPaid, id: 2 },
  {
    path: "/dashboard/products",
    label: "All Products",
    icon: FcPackage,
    id: 3,
  },
  {
    path: "/dashboard/create-product",
    label: "Add Product",
    icon: MdCreateNewFolder,
    color: "#10b981",
    id: 4,
  },
  {
    path: "/dashboard/promo-sales",
    label: "Promo Sales",
    icon: RiCalendarEventFill,
    color: "#10b981",
    id: 5,
  },
  { path: "/dashboard/messages", label: "Shop Inbox", icon: FcSms, id: 6 },
  {
    path: "/dashboard/transactions",
    label: "Transactions",
    icon: FcMoneyTransfer,
    id: 7,
  },
  { path: "/dashboard/settings", label: "Settings", icon: FcAutomatic, id: 8 },
];

const mobileLabels = {
  "/dashboard/create-product": "Add Product",
  "/dashboard/messages": "Messages",
};

const DashBoardSideBar = ({ mobile = false }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path) => currentPath === path;

  if (!mobile) {
    return (
      <div className="w-full h-full overflow-y-auto scrollbar-hide py-4 px-2">
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const activeItem = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    activeItem
                      ? "bg-indigo-50 text-indigo-700 shadow-sm font-medium"
                      : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
                  }
                `}
              >
                <Icon size={26} color={activeItem ? "#4f46e5" : item.color || "#6b7280"} />
                <span className="text-[15px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // Mobile Horizontal Scrollable Bottom Bar
  return (
    <div className="w-full overflow-x-auto scrollbar-hide bg-white border-t border-gray-200">
      <div className="flex items-center justify-start gap-5 px-4 py-3 min-w-max">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const activeItem = isActive(item.path);
          const label = mobileLabels[item.path] || item.label;

          return (
            <Link key={item.path} to={item.path} className="flex flex-col items-center gap-1 min-w-[68px] py-1">
              <Icon size={28} color={activeItem ? "#ef4444" : item.color || "#6b7280"} />
              <span className={`text-xs font-medium whitespace-nowrap ${activeItem ? "text-red-600" : "text-gray-600"}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default DashBoardSideBar;
