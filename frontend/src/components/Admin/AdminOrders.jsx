import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllAdminOrders, selectAdminOrders, selectAdminOrdersLoading } from "../../features/admin/adminSlice";
import { FiPackage } from "react-icons/fi";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { AiOutlineArrowRight, AiOutlineEye } from "react-icons/ai";
import { Link } from "react-router-dom";
import Loader from "../UI/Loader";
import { numbersWithCommas } from "../../utils/priceDisplay";
import StatusBadge from "../UI/StatusBadge";
import { useCallback } from "react";

const AdminOrders = () => {
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [adminOrders, setAdminOrders] = useState(null);

  const dispatch = useDispatch();

  const getDisplayStatus = useCallback((order) => {
    return order?.refund?.status && order.refund.status !== "None" && order?.status !== "Cancelled" ? order.refund.status : order?.status;
  }, []);

  useEffect(() => {
    setIsLoading(true);
    dispatch(getAllAdminOrders())
      .unwrap()
      .then((response) => {
        setAdminOrders(response);
      })
      .catch((error) => {
        console.error("Error fetching Admin Orders", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  const filteredAdminOrders = adminOrders?.filter((order) => {
    if (selectedStatus === "All") return true;
    const displayStatus = getDisplayStatus(order);
    return displayStatus === selectedStatus;
  });

  const columns = [
    { field: "id", headerName: "Order ID", minWidth: 200, flex: 0.9, sortable: false },
    {
      field: "status",
      headerName: "Status",
      minWidth: 170,
      flex: 0.7,
      renderCell: (params) => <StatusBadge status={params.value} />,
      sortable: false,
    },
    {
      field: "itemsQty",
      headerName: "Items Qty",
      type: "number",
      minWidth: 100,
      flex: 0.5,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "total",
      headerName: "Total",
      type: "number",
      minWidth: 100,
      flex: 0.7,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "createdAt",
      flex: 0.8,
      minWidth: 130,
      headerName: "Order Date",
      type: "",
      sortable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "",
      minWidth: 70,
      headerName: "",
      type: "number",
      sortable: false,
      flex: 0.7,
      renderCell: (params) => (
        <Link to={`/admin/order-details/${params.id}`}>
          <Button
            size="small"
            sx={{
              borderRadius: "50%",
              color: "white",
              "&:hover": { bgcolor: "primary.50" },
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

  filteredAdminOrders?.forEach((item) => {
    rows.push({
      id: item._id,
      itemsQty: item.cart.length,
      createdAt: item?.createdAt.slice(0, 10),
      total: `₦${numbersWithCommas(item?.totalPrice)}`,
      status: getDisplayStatus(item),
    });
  });

  return (
    <div className="h-full pb-16">
      <div className="w-full flex items-center justify-between sticky h-[35px] mb-3">
        <h1 className=" flex font-medium 800px:text-[22px] 800px:font-[600] text-white items-center py-3 gap-3">
          <FiPackage size={32} /> ORDERS
        </h1>

        {/*Filter dropdown */}
        <div className="w-full pb-2 max-w-[160px]">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-2 py-1 text-base font-semibold border border-white rounded-xl bg-gray-900 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
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
        <div className="flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 h-[74vh] md:h-[75vh] ">
          <Loader />
        </div>
      ) : (
        <div className=" h-full pb-16 lg:pb-6 overflow-x-auto scrollbar-hide ">
          <DataGrid
            rows={rows}
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
                color: "rgba(255, 255, 255, 0.3) !important",
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
