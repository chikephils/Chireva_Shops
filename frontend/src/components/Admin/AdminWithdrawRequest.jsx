import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { AiOutlineEye } from "react-icons/ai";
import { Link } from "react-router-dom";
import Loader from "../UI/Loader";
import { DataGrid } from "@mui/x-data-grid";
import { CiMoneyBill } from "react-icons/ci";
import { useDispatch } from "react-redux";
import { numbersWithCommas } from "../../utils/priceDisplay";
import StatusBadge from "../UI/StatusBadge";
import { getAllAdminTransactions } from "../../features/admin/adminSlice";

const AdminWithdrawRequest = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllAdminTransactions())
      .unwrap()
      .then((response) => {
        setWithdrawals(response);
      })
      .catch((error) => {
        console.error("Error fetching Withdrawals:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  const columns = [
    { field: "id", headerName: "Transaction ID", minWidth: 180, flex: 1 },
    {
      field: "status",
      headerName: "Status",
      minWidth: 170,
      flex: 0.7,
      renderCell: (params) => <StatusBadge status={params.value} />,
    },
    {
      field: "owner",
      headerName: "Requested By",
      type: "",
      minWidth: 130,
      flex: 0.5,
    },
    {
      field: "type",
      headerName: "Type",
      minWidth: 100,
      flex: 0.5,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => <span className="capitalize">{params.value}</span>,
    },
    {
      field: "amount",
      headerName: "Withdraw Amount",
      type: "",
      minWidth: 170,
      flex: 0.7,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "createdAt",
      flex: 0.7,
      minWidth: 150,
      headerName: "Withdrawal Date",
      type: "",
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const createdAt = params.row.createdAt;
        const date = new Date(createdAt);
        return (
          <>
            <span className="font-medium">
              {date.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </>
        );
      },
    },
    {
      field: "",
      minWidth: 70,
      headerName: "View",
      type: "number",
      sortable: false,
      flex: 0.5,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        return (
          <>
            <Link to={`/admin/withdrawal-details/${params.id}`}>
              <Button
                sx={{
                  color: "white",
                  "&:hover": { bgcolor: "primary.100" },
                }}
              >
                <AiOutlineEye size={18} />
              </Button>
            </Link>
          </>
        );
      },
    },
  ];

  const rows = [];

  withdrawals &&
    withdrawals.forEach((item) => {
      rows.push({
        id: item._id,
        status: item.status,
        type: item.withdrawalType,
        owner: item.withdrawalType === "seller" ? item.seller?.shopName : item.user?.firstName || item.user?.email,
        amount: "\u20A6" + numbersWithCommas(item?.amount),
        createdAt: item?.createdAt,
      });
    });
  return (
    <div className="flex flex-col h-full">
      <div className="fixed top-[60px] left-0 right-0 z-10">
        <div className="max-w-screen-4xl mx-auto px-1 lg:px-6 py-1">
          <div className="lg:ml-[284px]">
            <div className="  bg-gray-900 backdrop-blur-sm border-b border-gray-200 rounded-t-xl px-4 lg:px-6 py-3 shadow-sm">
              <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
                <h1 className="flex items-center gap-2 font-medium text-[20px] lg:text-[22px] text-white">
                  <CiMoneyBill size={32} /> Withdrawal Request
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 pt-[70px] pb-8">
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
            sx={{
              border: "1px solid #374151",
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
        )}
      </div>
    </div>
  );
};

export default AdminWithdrawRequest;
