import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllSellers,
  getAllAdminOrders,
  selectAdminOrders,
  selectAdminOrdersLoading,
  selectEscrowBalance,
  selectProfitBalance,
  getAdminBalance,
} from "../../features/admin/adminSlice";
import { TbCurrencyNaira } from "react-icons/tb";
import { MdBorderClear } from "react-icons/md";
import { DataGrid } from "@mui/x-data-grid";
import Loader from "../UI/Loader";
import { numbersWithCommas } from "../../utils/priceDisplay";
import { Link } from "react-router-dom";
import StatusBadge from "../UI/StatusBadge";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useCallback } from "react";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const adminOrders = useSelector(selectAdminOrders);
  const isLoading = useSelector(selectAdminOrdersLoading);
  const escrowBalance = useSelector(selectEscrowBalance);
  const profitBalance = useSelector(selectProfitBalance);
  const [showEscrowBalance, setShowEscrowBalance] = useState(false);
  const [showProfitBalance, setShowProfitBalance] = useState(false);

  const getDisplayStatus = useCallback((order) => {
    return order?.refund?.status && order.refund.status !== "None" && order?.status !== "Cancelled" ? order.refund.status : order?.status;
  }, []);

  useEffect(() => {
    dispatch(getAllAdminOrders());
    dispatch(getAdminBalance());
    dispatch(getAllSellers());
  }, [dispatch]);

  const displayedOrders = adminOrders?.filter((order) => {
    const displayStatus = getDisplayStatus(order);
    return displayStatus;
  });

  const editedEscrowBalance = numbersWithCommas(escrowBalance);
  const editedProfitBalance = numbersWithCommas(profitBalance);

  const maskedEscrowBalance = "*****";
  const maskedProfitBalance = "*****";

  const columns = [
    { field: "id", headerName: "Order ID", minWidth: 170, flex: 0.8 },
    {
      field: "status",
      headerName: "Status",
      minWidth: 170,
      flex: 0.7,
      renderCell: (params) => <StatusBadge status={params.value} />,
      headerAlign: "left",
      // align: "center",
    },
    {
      field: "itemsQty",
      headerName: "Items Qty",
      type: "number",
      minWidth: 90,
      flex: 0.5,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "total",
      headerName: "Total",
      type: "string",
      minWidth: 100,
      flex: 0.7,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "createdAt",
      headerName: "Order Date",
      minWidth: 130,
      flex: 0.7,
      align: "center",
      headerAlign: "center",
    },
  ];

  const row =
    displayedOrders?.map((item) => ({
      id: item._id,
      status: getDisplayStatus(item),
      itemsQty: item?.cart?.length,
      total: `₦${numbersWithCommas(item?.totalPrice)}`,
      createdAt: item?.createdAt?.slice(0, 10),
    })) || [];

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Overview Header */}
      <div className="fixed top-[60px] left-0 right-0 z-10">
        <div className="max-w-screen-4xl mx-auto px-1 lg:px-6 py-1">
          <div className="lg:ml-[284px]">
            <div className="  bg-gray-900 backdrop-blur-sm border-b border-gray-200 rounded-t-xl px-4 lg:px-6 py-3 shadow-sm">
              <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
                <h1 className="flex items-center gap-2 font-medium text-[20px] lg:text-[22px] text-white">Overview</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-4xl flex-1 min-h-0 pt-[70px] pb-4 px-2 lg:px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Earnings */}
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-900/50 rounded-full">
                <TbCurrencyNaira size={28} className="text-green-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-400">Escrow Balance</h3>
            </div>
            <div className="flex justify-between">
              <h4 className="text-2xl lg:text-3xl font-bold text-white">
                ₦{showEscrowBalance ? editedEscrowBalance : maskedEscrowBalance}
              </h4>
              <button
                onClick={() => setShowEscrowBalance(!showEscrowBalance)}
                className="text-gray-200"
                title={showEscrowBalance ? "Hide balance" : "Show balance"}
              >
                {showEscrowBalance ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
              </button>
            </div>
          </div>

          {/* All Sellers */}
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-900/50 rounded-full">
                <TbCurrencyNaira size={28} className="text-green-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-400">Total Earnings</h3>
            </div>
            <div className="flex justify-between">
              <h4 className="text-2xl lg:text-3xl font-bold text-white">
                ₦{showProfitBalance ? editedProfitBalance : maskedProfitBalance}
              </h4>
              <button
                onClick={() => setShowProfitBalance(!showProfitBalance)}
                className="text-gray-200"
                title={showProfitBalance ? "Hide balance" : "Show balance"}
              >
                {showProfitBalance ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
              </button>
            </div>
          </div>

          {/* All Orders */}
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-900/50 rounded-full">
                <MdBorderClear size={28} className="text-purple-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-400">All Orders</h3>
            </div>
            <h4 className="text-2xl lg:text-3xl font-bold text-white">{adminOrders?.length || 0}</h4>
            <Link to="/admin/orders" className="mt-4 inline-block text-teal-400 hover:text-teal-300 font-medium text-sm">
              View Orders →
            </Link>
          </div>
        </div>

        {/* Latest Orders Table */}

        <div className="p-2 border-b border-gray-700">
          <h3 className="text-lg lg:text-xl font-semibold text-white">Latest Orders</h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader />
          </div>
        ) : (
          <div className="h-[50vh] pb-8">
            <DataGrid
              rows={row}
              columns={columns}
              disableRowSelectionOnClick
              autoPageSize
              disableColumnMenu
              sx={{
                border: "none",
                color: "white",
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#1f2937",
                  borderBottom: "1px solid #374151",
                  color: "white",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #374151",
                  color: "white",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#374151",
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: "#1f2937",
                  borderTop: "1px solid #374151",
                  color: "white",
                },
                "& .MuiTablePagination-root": {
                  color: "white !important",
                },
                "& .MuiTablePagination-select": {
                  color: "white !important",
                },
                "& .MuiIconButton-root.Mui-disabled": {
                  color: "rgba(255, 255, 255, 0.3) !important", // disabled arrows
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
