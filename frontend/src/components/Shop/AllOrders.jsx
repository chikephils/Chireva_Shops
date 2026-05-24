import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getAllShopOrders } from "../../features/shop/shopSlice";
import { selectSeller } from "../../features/shop/shopSlice";
import { Link } from "react-router-dom";
import { AiOutlineArrowRight, AiOutlineEye } from "react-icons/ai";
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
            <AiOutlineEye size={18} />
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
    <div className="flex flex-col h-full">
      <div className="fixed top-[60px] left-0 right-0 z-10">
        <div className="max-w-screen-4xl mx-auto px-1 lg:px-6 py-1">
          <div className="lg:ml-[284px]">
            <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 rounded-t-xl px-4 lg:px-6 py-3 shadow-sm">
              <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
                <h1 className="flex items-center gap-2 font-medium text-[20px] lg:text-[22px] text-black">
                  <FiPackage size={28} />
                  Your Orders
                </h1>

                {/* FILTER */}
                <div className="sm:w-[160px]">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-2 py-2 text-sm font-semibold border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Orders</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Refund Requested">Refund Request</option>
                    <option value="Refunded">Refunded</option>
                    <option value="Refund Rejected">Refund Rejected</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 pt-[50px] pb-8">
        {isLoading ? (
          <div className="min-h-[calc(100vh-245px)] flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            autoHeight
            pageSizeOptions={[5, 7, 8, 10, 20]}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 7,
                },
              },
            }}
            disableRowSelectionOnClick
            disableColumnMenu
          />
        )}
      </div>
    </div>
  );
};

export default AllOrders;
