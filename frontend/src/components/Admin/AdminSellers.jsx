import React from "react";
import { Link } from "react-router-dom";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { Button } from "@mui/material";
import { GrWorkshop } from "react-icons/gr";
import { DataGrid } from "@mui/x-data-grid";
import Loader from "../UI/Loader";

const AdminSellers = ({ sellers, isLoading, showLoader, handleDeleteRequest }) => {
  const columns = [
    {
      field: "id",
      headerName: "Seller ID",
      minWidth: 130,
      flex: 0.7,
      sortable: false,
    },

    {
      field: "name",
      headerName: "Shop Name",
      minWidth: 130,
      flex: 0.7,
    },

    {
      field: "email",
      headerName: "Email",
      type: "text",
      minWidth: 150,
      flex: 1,
      sortable: false,
    },
    {
      field: "address",
      headerName: "Address",
      type: "text",
      minWidth: 150,
      flex: 1,
      sortable: false,
      headerAlign: "center",
    },
    {
      field: "joinedAt",
      minWidth: 130,
      headerName: "Joined",
      type: "text",
      sortable: false,
      flex: 0.8,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "  ",
      flex: 0.7,
      minWidth: 100,
      headerName: "Preview Shop",
      type: "number",
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => {
        return (
          <>
            <Link to={`/shop/preview/${params.id}`}>
              <Button
                sx={{
                  color: "white",
                  "&:hover": { bgcolor: "primary.100" },
                }}
              >
                <AiOutlineEye size={20} />
              </Button>
            </Link>
          </>
        );
      },
    },

    {
      field: " ",
      flex: 0.7,
      minWidth: 100,
      headerName: "Delete Shop",
      type: "number",
      sortable: false,
      renderCell: (params) => (
        <Button
          onClick={() => handleDeleteRequest(params.id)}
          sx={{
            minWidth: "auto",
            p: 1,
            color: "error.main",
            "&:hover": { bgcolor: "error.50" },
          }}
          disabled={showLoader[params.id]}
        >
          {showLoader[params.id] ? <SmallLoader /> : <AiOutlineDelete size={20} />}
        </Button>
      ),
      align: "center",
      headerAlign: "center",
    },
  ];

  const rows =
    sellers?.map((seller) => ({
      id: seller._id,
      name: seller.shopName,
      email: seller.email,
      joinedAt: seller?.createdAt.slice(0, 10),
      address: seller.address,
    })) || [];

  return (
    <div className="h-full pb-24 lg:pb-20">
      <div className="flex items-center justify-center sticky h-[35px] mb-3">
        <h1 className=" flex font-medium 800px:text-[22px] 800px:font-[600] text-white py-3 gap-3">
          <GrWorkshop size={32} /> SELLERS
        </h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 h-[74vh] md:h-[75vh] ">
          <Loader />
        </div>
      ) : (
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
              color: "rgba(255, 255, 255, 0.3) !important", // disabled arrows
            },
          }}
        />
      )}
    </div>
  );
};

export default AdminSellers;
