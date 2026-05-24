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
    <div className="flex flex-col h-full">
      <div className="fixed top-[60px] left-0 right-0 z-10">
        <div className="max-w-screen-4xl mx-auto px-1 lg:px-6 py-1">
          <div className="lg:ml-[284px]">
            <div className="  bg-gray-900 backdrop-blur-sm border-b border-gray-200 rounded-t-xl px-4 lg:px-6 py-3 shadow-sm">
              <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
                <h1 className="flex items-center gap-2 font-medium text-[20px] lg:text-[22px] text-white">
                  <HiOutlineUserGroup size={33} /> USERS
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

export default AdminUsers;
