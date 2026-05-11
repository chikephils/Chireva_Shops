import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getAllShopOrders } from "../../features/shop/shopSlice";
import { selectSeller } from "../../features/shop/shopSlice";
import { Link } from "react-router-dom";
import { AiOutlineArrowRight } from "react-icons/ai";
import { FiPackage } from "react-icons/fi";
import Loader from "../UI/Loader";
import { numbersWithCommas } from "../../utils/priceDisplay";
import StatusBadge from "../UI/StatusBadge";
import { useCallback } from "react";

const AllOrders = () => {
  const [shopOrders, setShopOrders] = useState(null);
  const seller = useSelector(selectSeller);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("All");

  const dispatch = useDispatch();

  const getDisplayStatus = useCallback((order) => {
    return order?.refund?.status && order.refund.status !== "None" && order?.status !== "Cancelled" ? order.refund.status : order?.status;
  }, []);

  useEffect(() => {
    setIsLoading(true);
    dispatch(getAllShopOrders(seller._id))
      .unwrap()
      .then((response) => {
        setShopOrders(response);
      })
      .catch((error) => {
        console.error("Error fetching shop orders:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch, seller._id]);

  //Filter Orders based on selection
  const filteredOrders = shopOrders?.filter((order) => {
    if (selectedStatus === "All") return true;
    const displayStatus = getDisplayStatus(order);
    return displayStatus === selectedStatus;
  });

  const columns = [
    {
      field: "id",
      headerName: "Order ID",
      minWidth: 180,
      flex: 0.7,
      sortable: false,
    },

    {
      field: "status",
      headerName: "Status",
      minWidth: 170,
      flex: 0.7,
      sortable: false,
      renderCell: (params) => <StatusBadge status={params.value} />,
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
        <Link to={`/dashboard/orders/${params.id}`}>
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

  filteredOrders?.forEach((item) => {
    rows.push({
      id: item._id,
      itemsQty: item.cart.length,
      total: `₦${numbersWithCommas(item?.totalPrice)}`,
      status: getDisplayStatus(item),
    });
  });

  return (
    <div className="h-full pb-20 lg:pb-16">
      <div className="w-full flex items-center justify-between sticky h-[35px] mb-3">
        <h1 className=" flex font-medium 800px:text-[22px] 800px:font-[600] text-black py-3">
          <FiPackage size={32} /> Your Orders
        </h1>

        {/*Filter dropdown */}
        <div className="w-full pb-2 max-w-[160px]">
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
      {isLoading ? (
        <div className="flex items-center justify-center bg-gray-50 h-[74vh] md:h-[75vh] ">
          <Loader />
        </div>
      ) : (
        <div className=" h-[calc(100%-38px)] overflow-x-auto scrollbar-hide ">
          <DataGrid rows={rows} columns={columns} disableRowSelectionOnClick autoPageSize disableColumnMenu />
        </div>
      )}
    </div>
  );
};

export default AllOrders;
