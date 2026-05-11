import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllAdminPromoProducts, selectAdminProductsLoading, selectAllAdminPromoProducts } from "../../features/admin/adminSlice";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import { AiOutlineEye } from "react-icons/ai";
import { MdOutlineLocalOffer } from "react-icons/md";
import { DataGrid } from "@mui/x-data-grid";
import Loader from "../UI/Loader";
import { numbersWithCommas } from "../../utils/priceDisplay";

const AdminPromoSales = () => {
  const isLoading = useSelector(selectAdminProductsLoading);
  const adminPromoProducts = useSelector(selectAllAdminPromoProducts);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllAdminPromoProducts());
  }, [dispatch]);

  const columns = [
    {
      field: "name",
      headerName: "Product Name",
      minWidth: 200,
      flex: 1.3,
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

        return <span className="text-lime-600">₦{price}</span>;
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
      field: "Preview",
      headerName: "View",
      flex: 0.5,
      minWidth: 50,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        return (
          <>
            <Link to={`/product/${params?.id}`}>
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
    adminPromoProducts?.map((product) => ({
      id: product?._id,
      name: product?.name,
      eventTag: product?.eventTag || "-",
      discountPrice: product?.discountPrice || 0,
      originalPrice: product?.originalPrice || 0,
      start: product?.eventStartDate,
      finish: product?.eventEndDate,
      sold: product?.sold_out,
    })) || [];
  return (
    <div className="h-full pb-24 lg:pb-20">
      <div className="flex items-center justify-center sticky h-[35px] mb-3">
        <h1 className=" flex font-medium 800px:text-[22px] 800px:font-[600] text-white py-3 gap-3">
          <MdOutlineLocalOffer size={32} /> ALL PROMO-SALES
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

export default AdminPromoSales;
