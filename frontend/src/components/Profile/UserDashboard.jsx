import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrders, LoadUser } from "../../features/user/userSlice";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import StatusBadge from "../UI/StatusBadge";
import { TbCurrencyNaira } from "react-icons/tb";
import { AiOutlineArrowRight, AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { MdBorderClear } from "react-icons/md";
import { DataGrid } from "@mui/x-data-grid";
import Loader from "../UI/Loader";
import { numbersWithCommas } from "../../utils/priceDisplay";
import { FcMoneyTransfer } from "react-icons/fc";

const UserDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state) => state?.user?.user);
  const [myOrders, setMyOrders] = useState(null);
  const [showBalance, setShowBalance] = useState(false);

  const dispatch = useDispatch();

  const getDisplayStatus = useCallback((order) => {
    if (order?.refund?.status && order.refund.status !== "None" && order?.status !== "Cancelled") {
      switch (order.refund.status) {
        case "Requested":
          return "Refund Requested";
        case "Refunded":
          return "Refunded";
        case "Refund Rejected":
          return "Refund Rejected";
        default:
          return order.refund.status;
      }
    }
    return order.status;
  }, []);

  useEffect(() => {
    setIsLoading(true);
    dispatch(LoadUser());
    dispatch(getAllOrders(user._id))
      .unwrap()
      .then((response) => {
        setMyOrders(response);
      })
      .catch((error) => {
        console.log("Error fetching orders:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch, user._id]);

  const groupedOrders = useMemo(() => {
    return Object.values(
      (myOrders || []).reduce((acc, order) => {
        const key = order.parentOrderId;

        if (!acc[key]) {
          acc[key] = {
            parentOrderId: key,
            orders: [],
            total: 0,
            status: "Processing",
          };
        }

        acc[key].orders.push(order);
        acc[key].total += order.totalPrice;

        // Determine overall status
        const allStatuses = acc[key].orders.map((o) => getDisplayStatus(o));
        const uniqueStatuses = [...new Set(allStatuses)];

        if (uniqueStatuses.length === 1) {
          acc[key].status = uniqueStatuses[0];
        } else {
          acc[key].status = "Mixed";
        }

        return acc;
      }, {}),
    );
  }, [myOrders, getDisplayStatus]);

  const columns = [
    {
      field: "id",
      headerName: "Order ID",
      minWidth: 170,
      flex: 0.7,
      sortable: false,
    },

    {
      field: "status",
      headerName: "Status",
      minWidth: 170,
      flex: 0.7,
      sortable: false,
      renderCell: (params) => <StatusBadge status={params.value} orders={params.row.orders} />,
      // align: "center",
    },

    {
      field: "itemsQty",
      headerName: "Items Qty",
      type: "number",
      minWidth: 90,
      flex: 0.6,
      sortable: false,
      align: "left",
      headerAlign: "left",
    },

    {
      field: "total",
      headerName: "Total",
      type: "string",
      minWidth: 90,
      flex: 0.7,
      sortable: false,
      align: "left",
      headerAlign: "left",
    },

    {
      field: "action",
      headerName: "",
      minWidth: 80,
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <Link to={`/user/order/details/${params.id}`}>
          <Button
            size="small"
            sx={{
              minWidth: "auto",
              p: 1,
              borderRadius: "50%",
              color: "info.main",
              "&:hover": { bgcolor: "primary.100" },
            }}
          >
            <AiOutlineEye size={18} />
          </Button>
        </Link>
      ),
      align: "center",
      headerAlign: "center",
    },
  ];

  const rows = [];

  groupedOrders?.forEach((group) => {
    const totalItems = group.orders.reduce((acc, order) => acc + order.cart.length, 0);

    rows.push({
      id: group.parentOrderId,
      itemsQty: totalItems,
      total: `₦${numbersWithCommas(group.total)}`,
      status: group.status,
      orders: group.orders,
    });
  });

  const maskedBalance = "*****";

  return (
    <div className="flex flex-col h-full">
      <div className="fixed top-[120px] left-0 right-0 z-10">
        <div className="max-w-screen-4xl mx-auto px-1 lg:px-6">
          <div className="lg:ml-[284px]">
            <div className="h-[60px] bg-white/95 backdrop-blur-sm border-b border-gray-200 py-3 px-4 lg:px-6 rounded-t-xl">
              <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Overview</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-4xl flex-1 min-h-0 pt-[70px] pb-4 px-2 lg:px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mb-8">
          {/* Balance Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <TbCurrencyNaira size={28} className="text-green-700" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Available Balance</h3>
                  <p className="text-xs text-gray-500 mt-0.5">(from refunds)</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <h4 className="text-xl  lg:text-2xl font-bold text-gray-900">
                {showBalance ? `₦${numbersWithCommas(user?.availableBalance)}` : maskedBalance}
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

            <Link to="/user/withdraw" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium text-sm">
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
            <h4 className="text-2xl lg:text-3xl font-bold text-gray-900">{groupedOrders?.length || 0}</h4>
            <Link to="/profile/orders" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium text-sm">
              View All Orders →
            </Link>
          </div>

          {/* Transactions Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <FcMoneyTransfer size={28} className="text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">All Transactions </h3>
            </div>
            <h4 className="text-2xl lg:text-3xl font-bold text-gray-900"> {user?.transactions?.length || 0}</h4>
            <Link to="/profile/transactions" className="mt-4 inline-block text-green-600 hover:text-green-800 font-medium text-sm">
              View Transactions →
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
          <div className="text-center py-16 text-gray-500">No orders yet. Start buying!</div>
        ) : (
          <div className="h-[50vh] pb-8">
            <DataGrid rows={rows} columns={columns} disableRowSelectionOnClick autoPageSize disableColumnMenu />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
