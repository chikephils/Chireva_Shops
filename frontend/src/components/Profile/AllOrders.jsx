import { Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../UI/Loader";
import { getAllOrders } from "../../features/user/userSlice";
import { numbersWithCommas } from "../../utils/priceDisplay";
import StatusBadge from "../UI/StatusBadge";

const AllOrders = () => {
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state) => state?.user?.user);
  const [myOrders, setMyOrders] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("All");

  const dispatch = useDispatch();

  const getDisplayStatus = useCallback((order) => {
    return order?.refund?.status && order.refund.status !== "None" && order?.status !== "Cancelled" ? order.refund.status : order?.status;
  }, []);

  useEffect(() => {
    setIsLoading(true);
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

  const filteredOrders = groupedOrders.filter((group) => {
    if (selectedStatus === "All") return true;

    // check if any child order matches
    const hasMatch = group.orders.some((order) => {
      const displayStatus = getDisplayStatus(order);
      return displayStatus === selectedStatus;
    });

    return hasMatch;
  });

  const columns = [
    {
      field: "id",
      headerName: "Order ID",
      minWidth: 130,
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
      minWidth: 100,
      flex: 0.6,
      sortable: false,
      align: "center",
      headerAlign: "center",
    },

    {
      field: "total",
      headerName: "Total",
      type: "string",
      minWidth: 100,
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
            <AiOutlineArrowRight size={18} />
          </Button>
        </Link>
      ),
      align: "center",
      headerAlign: "center",
    },
  ];

  const rows = [];

  filteredOrders.forEach((group) => {
    const totalItems = group.orders.reduce((acc, order) => acc + order.cart.length, 0);

    rows.push({
      id: group.parentOrderId,
      itemsQty: totalItems,
      total: `₦${numbersWithCommas(group.total)}`,
      status: group.status,
      orders: group.orders,
    });
  });

  return (
    <div className="h-full pb-10">
      <div className="w-full flex items-center justify-between sticky h-[35px]">
        <h1 className="text-base md:text-2xl font-bold flex items-center justify-center gap-2 pb-2">
          <HiOutlineShoppingBag size={32} /> My Orders
        </h1>

        {/*Filter dropdown */}
        <div className="w-full pb-2  max-w-[160px]">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-2 py-1 text-base font-semibold border border-gray-600 rounded-xl bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">All Orders</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Refund Requested">Refund Request</option>
            <option value="Refunded">Refunded</option>
            <option value="Rejected">Refund Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      <>
        {isLoading ? (
          <div className="flex items-center justify-center h-[68vh] md:h-[71vh]">
            <Loader />
          </div>
        ) : (
          <div className=" h-[calc(100%-38px)] overflow-x-auto scrollbar-hide ">
            <DataGrid rows={rows} columns={columns} disableRowSelectionOnClick autoPageSize disableColumnMenu />
          </div>
        )}
      </>
    </div>
  );
};

export default AllOrders;
