import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/user/userSlice";
import Logo from "../../Assests/img/logo.png";
import { FiPackage } from "react-icons/fi";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { BsHandbag } from "react-icons/bs";

const navItems = [
  {
    path: "/admin/promo-sales",
    icon: MdOutlineCalendarMonth,
    label: "Promo-Sales",
    id: 6,
  },
  { path: "/admin/products", icon: FiPackage, label: "Products", id: 5 },
  {
    path: "/admin/orders",
    icon: BsHandbag,
    label: "Orders",
    id: 2,
  },
];

const AdminHeader = ({ active }) => {
  const user = useSelector(selectUser);
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path) => currentPath === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 shadow-sm">
      <div className="max-w-screen-4xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="Logo" className="w-14 h-14 rounded-full" />
            <span className="text-xl font-bold text-gray-900 hidden sm:block">Admin</span>
          </Link>

          {/* Navigation Icons */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const activeItem = isActive(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={` relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                    activeItem ? "bg-teal-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100 hover:text-teal-700"
                  }`}
                  title={item.label}
                >
                  <Icon size={22} />
                  {activeItem && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-teal-800 rounded-full" />}
                </Link>
              );
            })}
          </nav>

          {/* Profile Avatar */}
          <Link to="/profile" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src={user?.avatar?.url || "/default-avatar.png"}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-teal-500 group-hover:border-teal-600 transition-all"
              />
              <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900 group-hover:text-teal-700 transition-colors">{user?.name || "Admin"}</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
