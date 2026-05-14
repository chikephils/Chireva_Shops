import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../Assests/img/logo.png";
import Logo3 from "../../Assests/img/logoRounded.png";
import { categoriesData } from "../../static/data";
import { AiOutlineHeart, AiOutlineShoppingCart, AiOutlineSearch } from "react-icons/ai";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { BiMenuAltLeft } from "react-icons/bi";
import { RxCross1 } from "react-icons/rx";
import DropDown from "../../components/UI/DropDown";
import Navbar from "../../components/UI/Navbar";
import Cart from "../../components/Cart/Cart";
import WishList from "../../components/WishList/WishList";
import { useSelector } from "react-redux";
import { itemsInCart } from "../../features/cart/cartSlice";
import { selectWishListItems } from "../../features/wishlist/wishlistSlice";
import api from "../../utils/axios";
import { server } from "../../server";

const Header = ({ activeHeading }) => {
  const [search, setSearch] = useState("");
  const [searchData, setSearchData] = useState(null);
  const [dropDown, setDropDown] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openWishList, setOpenWishList] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const user = useSelector((state) => state?.user.user);
  const cartItems = useSelector(itemsInCart);
  const wishList = useSelector(selectWishListItems);
  const seller = useSelector((state) => state.shop.seller);
  const navigate = useNavigate();

  const debounceRef = useRef(null);
  const searchRef = useRef(null);
  const categoryRef = useRef(null);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (!value.trim()) {
        setSearchData(null);
        return;
      }

      try {
        const { data } = await api.get(`${server}/product/search?query=${value.trim()}`);

        setSearchData(data.products);
      } catch (error) {
        console.log("Search Error:", error);
      }
    }, 400);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchData(null);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setDropDown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50 transition-all">
        <div className="max-w-screen-4xl mx-auto px-2 md:px-6 h-16 md:h-18 flex items-center justify-between">
          {/* Left: Hamburger (mobile) + Categories */}
          <div className="flex items-center gap-4 mx-2 md:mx-8 ">
            <BiMenuAltLeft size={36} className="md:hidden cursor-pointer" onClick={() => setOpenMenu(true)} />

            {/* Logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2  md:static md:translate-x">
              <img src={Logo} alt="Chireva" className="h-14 rounded-full object-contain" />
            </Link>
          </div>

          {/* Search Bar */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={handleSearch}
              className="w-full h-10 px-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:border-lime-500"
            />
            <AiOutlineSearch size={20} className="absolute right-3 top-3 text-gray-500" />
            {search && searchData?.length > 0 && (
              <div className="absolute top-12 left-0 w-full bg-slate-200 shadow-lg rounded-md max-h-96 overflow-y-auto scrollbar-hide">
                {searchData.map((p) => (
                  <Link
                    key={p._id}
                    to={`/product/${p._id}`}
                    onClick={() => {
                      setSearch("");
                      setSearchData(null);
                    }}
                  >
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50">
                      <img src={p.images[0]?.url} alt="" className="w-10 h-10 rounded" />
                      <span className="text-sm">{p.name.length > 40 ? p.name.slice(0, 40) + "..." : p.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right: Icons & Seller Button */}
          <div className="flex items-center gap-4 md:gap-6 mr-1">
            <div className="relative cursor-pointer" onClick={() => setOpenWishList(true)}>
              <AiOutlineHeart size={28} />
              {wishList?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishList.length}
                </span>
              )}
            </div>
            <div className="relative cursor-pointer" onClick={() => setOpenCart(true)}>
              <AiOutlineShoppingCart size={28} />
              {cartItems?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </div>
            {user ? (
              <Link to="/user-dashboard">
                <img src={user?.avatar?.url} alt="" className="w-8 h-8 md:w-9 md:h-9 rounded-full" />
              </Link>
            ) : (
              <CgProfile size={28} className="cursor-pointer" onClick={() => navigate("/login")} />
            )}
            <button
              onClick={() => (seller ? navigate(`/shop/${seller._id}`) : navigate("/create-shop"))}
              className="hidden md:block bg-lime-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-lime-700 shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.18)] "
            >
              {seller ? "Go to Shop" : "Become Seller"}
            </button>
          </div>
        </div>

        {/* Desktop Nav Below Header */}
        <div className="hidden md:block border-t">
          <div className="max-w-screen-4xl mx-auto flex justify-between md:px-6 py-2">
            <div
              ref={categoryRef}
              className="relative hidden md:block "
              // onMouseLeave={() => setDropDown(false)}
            >
              <button
                // onMouseEnter={() => setDropDown(true)}
                onClick={() => setDropDown((prev) => !prev)}
                className={`
                  flex items-center gap-2 
                  px-5 py-1.5               
                  text-gray-800 text-[15px] 800px:text-base font-medium
                  bg-white                  
                  rounded-full              
                  shadow-[0_4px_12px_rgba(0,0,0,0.12)]   
                  hover:shadow-[0_6px_16px_rgba(0,0,0,0.18)]  
                  hover:bg-gray-50          
                  active:scale-95           
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-lime-200 focus:ring-offset-2
                `}
              >
                {" "}
                Categories {dropDown ? <IoIosArrowDown /> : <IoIosArrowUp />}
              </button>
              {dropDown && <DropDown categoriesData={categoriesData} setDropDown={setDropDown} />}
            </div>
            <div className=" flex justify-end">
              <Navbar />
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div ref={searchRef} className="md:hidden px-4 py-2 border-t">
          <div className="relative pb-1">
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={handleSearch}
              className="w-full h-10 px-4 pr-10 rounded-full border border-gray-300"
            />
            <AiOutlineSearch size={20} className="absolute right-3 top-3 text-gray-500" />
          </div>
          {/* Mobile search results */}
          {searchData && (
            <div className="absolute left-0 w-full bg-white shadow-lg rounded-md max-h-96 overflow-y-auto">
              {searchData.map((p) => (
                <Link
                  key={p._id}
                  to={`/product/${p._id}`}
                  onClick={() => {
                    setSearch("");
                    setSearchData(null);
                  }}
                >
                  <div className="flex items-center gap-3 p-3 hover:bg-gray-50">
                    <img src={p.images[0]?.url} alt="" className="w-10 h-10 rounded" />
                    <span className="text-sm">{p.name.length > 40 ? p.name.slice(0, 40) + "..." : p.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu  */}
      {openMenu && (
        <div className="fixed inset-0 bg-black/50 z-50 mobile-menu-sidebar" onClick={() => setOpenMenu(false)}>
          <div className="w-80 bg-white h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Top section */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-semibold">Menu</h3>
                <RxCross1
                  size={24}
                  className="cursor-pointer  text-white bg-black/50 rounded-full p-1 hover:bg-black/70 transition"
                  onClick={() => setOpenMenu(false)}
                />
              </div>

              <div className="p-4">
                <Navbar active={activeHeading} isMobile onNavigate={() => setOpenMenu(false)} />

                <div ref={categoryRef} className="relative md:hidden block">
                  <button
                    onClick={() => setDropDown((prev) => !prev)}
                    className="flex items-center gap-2 px-5 py-1.5 text-gray-800 text-[15px] 800px:text-base font-medium bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.18)] hover:bg-gray-50 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-lime-200 focus:ring-offset-2"
                  >
                    Categories {dropDown ? <IoIosArrowDown /> : <IoIosArrowUp />}
                  </button>

                  {dropDown && (
                    <DropDown categoriesData={categoriesData} setDropDown={setDropDown} isMobile onNavigate={() => setOpenMenu(false)} />
                  )}
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      seller ? navigate(`/shop/${seller._id}`) : navigate("/create-shop");
                    }}
                    className="w-full bg-lime-600 text-white py-3 rounded-3xl"
                  >
                    {seller ? "Go to Shop" : "Become a Seller"}
                  </button>
                </div>

                {!user && (
                  <div className="mt-4 text-center">
                    <Link to="/login" onClick={() => setOpenMenu(false)}>
                      Login
                    </Link>{" "}
                    /
                    <Link to="/register" onClick={() => setOpenMenu(false)}>
                      {" "}
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-auto pb-2 pt-2 flex justify-center border-t bg-white">
              <img src={Logo3} className=" w-28" alt="logo" />
            </div>
          </div>
        </div>
      )}

      {/* Popups */}
      {openCart && <Cart setOpenCart={setOpenCart} />}
      {openWishList && <WishList setOpenWishList={setOpenWishList} />}
    </>
  );
};

export default Header;
