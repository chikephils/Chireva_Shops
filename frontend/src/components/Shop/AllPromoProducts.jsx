import React from "react";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { MdOutlineCalendarMonth } from "react-icons/md";
import Loader from "../UI/Loader";
import SmallLoader from "../UI/SmallLoader";
import { numbersWithCommas } from "../../utils/priceDisplay";

const AllPromoProducts = ({ handleProductClick, shopPromoProducts, isLoading, showLoader, handleDeleteRequest }) => {
  const getStockStyle = (stock) => {
    if (stock === 0) {
      return {
        color: "#dc2626",
        backgroundColor: "#fee2e2",
        fontWeight: 600,
      };
    } else if (stock <= 5) {
      return {
        color: "#d97706",
        backgroundColor: "#fef3c7",
        fontWeight: 600,
      };
    } else {
      return {
        color: "#15803d",
        backgroundColor: "#dcfce7",
        fontWeight: 500,
      };
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "Product Name",
      minWidth: 130,
      flex: 1.0,
      sortable: false,
    },
    {
      field: "eventTag",
      headerName: "Promo Name",
      minWidth: 120,
      flex: 0.8,
      sortable: false,
      valueGetter: (params) => params.row.eventTag || "-",
    },
    {
      field: "originalPrice",
      headerName: "Original Price",
      minWidth: 110,
      flex: 0.7,
      sortable: false,
      headerAlign: "right",
      align: "right",
      renderCell: (params) => {
        const price = numbersWithCommas(params.row.originalPrice);
        return `₦${price}`;
      },
    },
    {
      field: "discountPrice",
      headerName: "Discount Price",
      minWidth: 110,
      flex: 0.7,
      sortable: false,
      headerAlign: "right",
      align: "right",
      renderCell: (params) => {
        const price = numbersWithCommas(params.row.discountPrice || 0);

        if (!params.row.discountPrice) {
          return "-";
        }

        return <span className="text-indigo-600">₦{price}</span>;
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
      minWidth: 100,
      flex: 0.6,
      sortable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "start",
      headerName: "Start Date",
      minWidth: 110,
      flex: 0.7,
      sortable: false,
      renderCell: (params) => {
        const startDate = params.row.start;
        const endDate = params.row.finish;

        if (!startDate) return "_";

        const now = new Date();
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : null;

        // promo ended
        if (end && end < now) {
          return (
            <span className="font-medium text-red-600">
              {start.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          );
        }

        //Promo not Started
        if (start > now) {
          return (
            <span className="font-medium text-yellow-500">
              {new Date(start).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          );
        }

        //Promo active
        if (start <= now) {
          return (
            <span className="font-medium text-green-600">
              {new Date(start).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          );
        }

        return (
          <span className="font-medium">
            {new Date(start).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      field: "finish",
      headerName: "End Date",
      minWidth: 110,
      flex: 0.7,
      sortable: false,
      renderCell: (params) => {
        const endDate = params.row.finish;

        if (!endDate) return "-";

        const now = new Date();
        const end = new Date(endDate);

        if (end < now) {
          return <span className="text-red-600 font-medium">Ended</span>;
        }
        if (end > now) {
          return (
            <span className="font-medium text-green-600">
              {new Date(end).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          );
        }

        return (
          <span className="font-medium">
            {new Date(end).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      field: "preview",
      headerName: "View",
      minWidth: 80,
      flex: 0.4,
      sortable: false,
      renderCell: (params) => (
        <Button
          onClick={() => handleProductClick(params.row.id)}
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
    shopPromoProducts?.map((product) => ({
      id: product?._id,
      name: product?.name,
      eventTag: product?.eventTag || "-",
      discountPrice: product?.discountPrice || 0,
      originalPrice: product?.originalPrice || 0,
      stock: product?.stock,
      start: product?.eventStartDate,
      finish: product?.eventEndDate,
      sold: product?.sold_out,
    })) || [];

  return (
    <div className="h-full pb-20 lg:pb-16">
      <div className="flex items-center justify-center sticky h-[35px] mb-3">
        <h1 className=" flex font-medium 800px:text-[22px] 800px:font-[600] text-black py-3">
          <MdOutlineCalendarMonth size={26} className="text-indigo-600" />
          Your Promo-Sales
        </h1>
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

export default AllPromoProducts;
