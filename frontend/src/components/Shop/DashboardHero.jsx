import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getShopProducts, getAllShopOrders } from "../../features/shop/shopSlice";
import { selectSeller } from "../../features/shop/shopSlice";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { AiOutlineArrowRight, AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { TbCurrencyNaira } from "react-icons/tb";
import { MdBorderClear } from "react-icons/md";
import { FiPackage } from "react-icons/fi";
import Loader from "../UI/Loader";
import { numbersWithCommas } from "../../utils/priceDisplay";
import StatusBadge from "../UI/StatusBadge";
import api from "../../utils/axios";
import { server } from "../../server";

const DashboardHero = () => {
  const dispatch = useDispatch();
  const seller = useSelector(selectSeller);

  const [products, setProducts] = useState(null);
  const [shopOrders, setShopOrders] = useState(null);
  const [availableBalance, setAvailableBalance] = useState("0.00");
  const [isLoading, setIsLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(false);

  const getDisplayStatus = useCallback((order) => {
    return order?.refund?.status && order.refund.status !== "None" && order?.status !== "Cancelled" ? order.refund.status : order?.status;
  }, []);

  const fetchData = useCallback(async () => {
    if (!seller?._id) return;
    setIsLoading(true);
    try {
      const productsRes = await dispatch(getShopProducts(seller._id)).unwrap();
      setProducts(productsRes);

      const ordersRes = await dispatch(getAllShopOrders(seller._id)).unwrap();
      setShopOrders(ordersRes);

      const shopRes = await api.get(`${server}/shop/get-shop-info/${seller._id}`);
      setAvailableBalance(shopRes.data.shop?.availableBalance?.toFixed(2));
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, seller?._id]);

  useEffect(() => {
    fetchData();
  }, [dispatch, seller?._id]);

  const displayedOrders = shopOrders?.filter((order) => {
    const displayStatus = getDisplayStatus(order);
    return displayStatus;
  });

  const columns = [
    { field: "id", headerName: "Order ID", minWidth: 170, flex: 0.8 },
    {
      field: "status",
      headerName: "Status",
      minWidth: 170,
      flex: 0.7,
      renderCell: (params) => <StatusBadge status={params.value} />,
      // align: "center",
    },
    {
      field: "itemsQty",
      headerName: "Items",
      type: "number",
      minWidth: 90,
      flex: 0.5,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "total",
      headerName: "Total",
      minWidth: 110,
      flex: 0.7,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "action",
      headerName: "",
      minWidth: 80,
      flex: 0.4,
      sortable: false,
      renderCell: (params) => (
        <Link to={`/dashboard/orders/${params.id}`}>
          <Button
            size="small"
            sx={{
              borderRadius: "50%",
              color: "info.main",
              "&:hover": { bgcolor: "primary.100" },
            }}
          >
            <AiOutlineEye size={18} />
          </Button>
        </Link>
      ),
      headerAlign: "center",
      align: "center",
    },
  ];

  const rows =
    displayedOrders?.map((order) => {
      return {
        id: order._id,
        itemsQty: order.cart.length,
        total: `₦${numbersWithCommas(order?.totalPrice)}`,
        status: getDisplayStatus(order),
      };
    }) || [];

  const maskedBalance = "*****";

  return (
    <div className="flex flex-col h-full">
      <div className="fixed top-[70px] left-0 right-0 z-10">
        <div className="max-w-screen-4xl mx-auto px-1 lg:px-6">
          <div className="lg:ml-[284px]">
            <div className="h-[60px] bg-white/95 backdrop-blur-sm border-b border-gray-200 py-3 px-4 lg:px-6 rounded-t-xl">
              <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Overview</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="h-full  pt-[70px] lg:px-2 overflow-y-auto scrollbar-hide">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mb-8">
          {/* Balance Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <TbCurrencyNaira size={28} className="text-green-700" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Account Balance</h3>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <h4 className="text-xl  lg:text-2xl font-bold text-gray-900">
                {showBalance ? `₦${numbersWithCommas(availableBalance)}` : maskedBalance}
              </h4>
              {/* Eye toggle */}
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
                title={showBalance ? "Hide balance" : "Show balance"}
              >
                {showBalance ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
              </button>
            </div>

            <Link to="/dashboard/withdraw-money" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium text-sm">
              Withdraw Money →
            </Link>
          </div>

          {/* Orders Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <MdBorderClear size={28} className="text-blue-700" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">All Orders</h3>
            </div>
            <h4 className="text-2xl lg:text-3xl font-bold text-gray-900">{shopOrders?.length || 0}</h4>
            <Link to="/dashboard/orders" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium text-sm">
              View All Orders →
            </Link>
          </div>

          {/* Products Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <FiPackage size={28} className="text-purple-700" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">All Products</h3>
            </div>
            <h4 className="text-2xl lg:text-3xl font-bold text-gray-900">{products?.length || 0}</h4>
            <Link to="/dashboard/products" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium text-sm">
              View Products →
            </Link>
          </div>
        </div>

        <div className="p-2 border-b border-gray-200">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Latest Orders</h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No orders yet. Start selling!</div>
        ) : (
          <div className="h-[50vh]">
            <DataGrid rows={rows} columns={columns} disableRowSelectionOnClick autoPageSize disableColumnMenu />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHero;
