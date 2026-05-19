import React from "react";
import { Button } from "@mui/material";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { DataGrid } from "@mui/x-data-grid";
import { FiPackage } from "react-icons/fi";
import Loader from "../UI/Loader";
import SmallLoader from "../UI/SmallLoader";
import { numbersWithCommas } from "../../utils/priceDisplay";
import { MdEdit } from "react-icons/md";
import { Link } from "react-router-dom";

const AllProducts = ({ handleProductClick, shopProducts, isLoading, handleDeleteRequest, showLoader }) => {
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
      headerName: "Product ID",
      minWidth: 140,
      flex: 0.7,
      sortable: false,
    },
    {
      field: "name",
      headerName: "Product Name",
      minWidth: 180,
      flex: 1.2,
      sortable: false,
    },
    {
      field: "price",
      headerName: "Price",
      minWidth: 100,
      flex: 0.6,
      sortable: false,
      headerAlign: "left",
      align: "left",
      renderCell: (params) => {
        const { isEvent, eventStartDate, eventEndDate, discountPrice, originalPrice } = params.row;

        const isEventActive =
          isEvent && eventStartDate && eventEndDate && new Date() >= new Date(eventStartDate) && new Date() <= new Date(eventEndDate);

        const price = isEventActive ? discountPrice : originalPrice;

        return <span className={`font-medium ${isEventActive ? "text-indigo-500" : "text-black"}`}>₦{numbersWithCommas(price)}</span>;
      },
    },
    {
      field: "stock",
      headerName: "Stock",
      minWidth: 100,
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
      headerName: "Sold",
      minWidth: 90,
      flex: 0.6,
      sortable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "preview",
      headerName: "View",
      minWidth: 80,
      flex: 0.4,
      sortable: false,
      renderCell: (params) => (
        <Button
          onClick={() => handleProductClick(params.id)}
          sx={{
            minWidth: "auto",
            p: 1,
            color: "info.main",
            "&:hover": { bgcolor: "primary.100" },
          }}
        >
          <AiOutlineEye size={20} />
        </Button>
      ),
      align: "center",
      headerAlign: "center",
    },
    {
      field: "edit",
      headerName: "Edit",
      minWidth: 80,
      flex: 0.4,
      sortable: false,
      renderCell: (params) => (
        <Link to={`/dashboard/edit-product/${params.id}`}>
          <Button
            size="small"
            sx={{
              minWidth: "auto",
              p: 1,
              color: "info.main",
              "&:hover": { bgcolor: "info.50" },
            }}
          >
            <MdEdit size={20} />
          </Button>
        </Link>
      ),
      align: "center",
      headerAlign: "center",
    },
    {
      field: "delete",
      headerName: "Delete",
      minWidth: 80,
      flex: 0.4,
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
    shopProducts?.map((item) => ({
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
    <>
      <div className="flex flex-col h-full ">
        <div className="fixed top-[70px] left-0 right-0 z-10">
          <div className="max-w-screen-4xl mx-auto px-1 lg:px-6">
            <div className="lg:ml-[284px]">
              <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 rounded-t-xl px-4 lg:px-6 py- shadow-sm">
                <h1 className=" flex items-center justify-center font-medium 800px:text-[22px] 800px:font-[600] text-black py-3">
                  <FiPackage size={26} className="text-indigo-600" />
                  Your Shop Products
                </h1>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0 pt-[70px]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center pb-16">
              <Loader />
            </div>
          ) : (
            <DataGrid rows={rows} columns={columns} autoPageSize disableRowSelectionOnClick disableColumnMenu />
          )}
        </div>
      </div>
    </>
  );
};

export default AllProducts;
