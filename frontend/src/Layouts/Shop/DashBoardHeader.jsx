import React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import Logo from "../../Assests/img/logo.png";
import { AiOutlineShopping, AiOutlineMessage } from "react-icons/ai";
import { FiPackage } from "react-icons/fi";
import { FaFire } from "react-icons/fa6";

const navItems = [
  {
    path: "/dashboard/promo-sales",
    icon: FaFire,
    label: "Promo-Sales",
    id: 5,
  },
  { path: "/dashboard/products", icon: FiPackage, label: "Products", id: 3 },
  {
    path: "/dashboard/orders",
    icon: AiOutlineShopping,
    label: "Orders",
    id: 2,
  },
  {
    path: "/dashboard/messages",
    icon: AiOutlineMessage,
    label: "Messages",
    id: 6,
  },
];

const DashBoardHeader = ({}) => {
  const seller = useSelector((state) => state.shop.seller);
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path) => currentPath === path;

  const shopDisplay = seller?.shopName ? (seller.shopName.length > 22 ? seller.shopName.slice(0, 19) + "..." : seller.shopName) : "My Shop";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-screen-4xl mx-auto px-4 md:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Logo + Shop Name */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
                <img src={Logo} alt="Logo" className="w-10 h-10 rounded-full object-contain" />
              </div>
            </Link>
            <Link to="/dashboard">
              <div className="flex">
                <span className="text-lg font-semibold text-gray-900 hover:text-indigo-700 transition-colorstruncate max-w-[180px]">
                  {shopDisplay}
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation + Avatar */}
          <div className="flex items-center gap-2 md:gap-4">
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => {
                const activeItem = isActive(item.path);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      relative flex items-center justify-center w-10 h-10 rounded-lg
                      transition-all duration-200
                      ${activeItem ? "text-indigo-600 bg-indigo-50" : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/70"}
                    `}
                    title={item.label}
                  >
                    <Icon size={22} />
                    {activeItem && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-indigo-600 rounded-full" />}
                  </Link>
                );
              })}
            </nav>

            {/* Shop Preview  */}
            <Link
              to={`/shop/${seller?._id}`}
              className="flex items-center gap-1 pl-4 border-l border-gray-200"
              title="View your shop as a customer"
            >
              <div className="relative">
                <img src={seller?.avatar?.url} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">View Shop</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashBoardHeader;
