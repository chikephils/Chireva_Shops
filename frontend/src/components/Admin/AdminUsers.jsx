import React from "react";
import { Button } from "@mui/material";
import { AiOutlineDelete } from "react-icons/ai";
import { HiOutlineUserGroup } from "react-icons/hi";
import { DataGrid } from "@mui/x-data-grid";
import Loader from "../UI/Loader";

const AdminUsers = ({ users, isLoading, showLoader, handleDeleteRequest }) => {
  const columns = [
    {
      field: "id",
      headerName: "User ID",
      minWidth: 130,
      flex: 0.7,
      sortable: false,
    },
    {
      field: "name",
      headerName: "Name",
      minWidth: 150,
      flex: 0.7,
    },
    {
      field: "email",
      headerName: "Email",
      type: "text",
      minWidth: 170,
      flex: 0.8,
      sortable: false,
    },
    {
      field: "role",
      headerName: "User Role",
      type: "text",
      minWidth: 130,
      flex: 0.8,
    },
    {
      field: "joinedAt",
      flex: 0.4,
      minWidth: 100,
      headerName: "joinedAt",
      type: "text",
      sortable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: " ",
      flex: 0.7,
      minWidth: 100,
      headerName: "Delete User",
      type: "number",
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <>
          {!params.row.role === "admin" && (
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
          )}
        </>
      ),
      align: "center",
      headerAlign: "center",
    },
  ];

  const rows =
    (users &&
      users?.map((user) => ({
        id: user._id,
        name: user.firstName + " " + user.lastName,
        email: user.email,
        role: user.role,
        joinedAt: user.createdAt.slice(0, 10),
      }))) ||
    [];

  return (
    <div className="h-full pb-16">
      <div className="flex items-center justify-center sticky h-[35px] mb-3">
        <h1 className=" flex font-medium 800px:text-[22px] 800px:font-[600] text-white py-3 gap-3">
          <HiOutlineUserGroup size={33} /> USERS
        </h1>
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
                color: "rgba(255, 255, 255, 0.3) !important", // disabled arrows
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
