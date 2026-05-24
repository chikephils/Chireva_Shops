import React, { useEffect, useState } from "react";
import { getAllAdminProducts } from "../../features/admin/adminSlice";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import { AiOutlineEye } from "react-icons/ai";
import { FiPackage } from "react-icons/fi";
import { DataGrid } from "@mui/x-data-grid";
import Loader from "../UI/Loader";
import { numbersWithCommas } from "../../utils/priceDisplay";

const AdminProducts = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [adminProducts, setAdminProducts] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    setIsLoading(true);
    dispatch(getAllAdminProducts())
      .unwrap()
      .then((response) => {
        setAdminProducts(response);
      })
      .catch((error) => {
        console.error("Error loading admin orders:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  const getStockStyle = (stock) => {
    if (stock === 0) {
      return {
        color: "#dc2626", // red-600
        backgroundColor: "#fee2e2", // red-100
        fontWeight: 600,
      };
    } else if (stock <= 5) {
      return {
        color: "#d97706", // amber-600
        backgroundColor: "#fef3c7", // amber-100
        fontWeight: 600,
      };
    } else {
      return {
        color: "#15803d", // green-700
        backgroundColor: "#dcfce7", // green-100
        fontWeight: 500,
      };
    }
  };

  const columns = [
    {
      field: "id",
      headerName: "Product Id",
      minWidth: 200,
      flex: 1.0,
      sortable: false,
    },

    {
      field: "name",
      headerName: "Name",
      minWidth: 150,
      flex: 0.9,
    },

    {
      field: "price",
      headerName: "Price",
      minWidth: 80,
      flex: 0.7,
      sortable: false,
      headerAlign: "left",
      align: "left",
      renderCell: (params) => {
        const { isEvent, eventStartDate, eventEndDate, discountPrice, originalPrice } = params.row;

        const isEventActive =
          isEvent && eventStartDate && eventEndDate && new Date() >= new Date(eventStartDate) && new Date() <= new Date(eventEndDate);

        const price = isEventActive ? discountPrice : originalPrice;

        return <span className="">₦{numbersWithCommas(price)}</span>;
      },
    },
    {
      field: "stock",
      headerName: "Stock",
      minWidth: 80,
      flex: 0.6,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const stock = params.value;
        const style = getStockStyle(stock);

        return (
          <div className="w-full h-full flex items-center justify-center rounded-md px-2 py-1" style={style}>
            {stock}
          </div>
        );
      },
    },
    {
      field: "sold",
      minWidth: 80,
      headerName: "Sold out",
      type: "text",
      sortable: false,
      flex: 0.7,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "Preview",
      flex: 0.7,
      minWidth: 80,
      headerName: "Preview ",
      type: "number",
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        return (
          <>
            <Link to={`/product/${params.id}`}>
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
  ];

  const rows =
    adminProducts?.map((item) => ({
      id: item._id,
      name: item.name,
      originalPrice: item.originalPrice,
      discountPrice: item.discountPrice,
      isEvent: item.isEvent,
      eventStartDate: item.eventStartDate,
      eventEndDate: item.eventEndDate,
      stock: item.stock,
      sold: item.sold_out,
    })) || [];

  return (
    <div className="flex flex-col h-full">
      <div className="fixed top-[60px] left-0 right-0 z-10">
        <div className="max-w-screen-4xl mx-auto px-1 lg:px-6 py-1">
          <div className="lg:ml-[284px]">
            <div className="  bg-gray-900 backdrop-blur-sm border-b border-gray-200 rounded-t-xl px-4 lg:px-6 py-3 shadow-sm">
              <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
                <h1 className="flex items-center gap-2 font-medium text-[20px] lg:text-[22px] text-white">
                  <FiPackage size={32} /> PRODUCTS
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

export default AdminProducts;
