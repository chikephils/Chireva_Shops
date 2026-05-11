import React from "react";
import Tooltip from "@mui/material/Tooltip";

const StatusBadge = ({ status, orders = [], className = "" }) => {
  let badgeClasses = "inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium border w-fit";

  const lower = (status || "").toLowerCase().trim();

  const getDisplayStatus = (order) => {
    if (order?.refund?.status && order.refund.status !== "None" && order?.status !== "Cancelled") {
      switch (order.refund.status) {
        case "Requested":
          return "Refund Requested";
        case "Refunded":
          return "Refunded";
        case "Refund Rejected":
          return "Refund Rejected";
        default:
          return order.refund.status;
      }
    }
    return order.status;
  };

  switch (lower) {
    case "processing":
      badgeClasses += " bg-yellow-200 text-yellow-800 border-yellow-600";
      break;

    case "shipped":
      badgeClasses += " bg-blue-200 text-blue-800 border-blue-600";
      break;

    case "in transit":
      badgeClasses += " bg-indigo-200 text-indigo-800 border-indigo-600";
      break;

    case "delivered":
    case "succeeded":
    case "successful":
      badgeClasses += " bg-green-200 text-green-800 border-green-600 font-semibold";
      break;

    case "requested":
    case "refund requested":
      badgeClasses += " bg-orange-200 text-orange-800 border-orange-600 font-semibold";
      break;

    case "processed":
    case "refunded":
    case "refund success":
      badgeClasses += " bg-teal-200 text-teal-800 border-teal-600 font-semibold";
      break;

    case "rejected":
    case "refund rejected":
      badgeClasses += " bg-red-200 text-red-800 border-red-600 font-semibold";
      break;

    case "canceled":
    case "cancelled":
    case "failed":
      badgeClasses += " bg-red-200 text-red-800 border-red-600 font-semibold";
      break;

    case "mixed":
      badgeClasses += " bg-gray-200 text-gray-800 border-gray-400 font-semibold";
      break;

    default:
      badgeClasses += " bg-gray-200 text-gray-700 border-gray-300";
  }

  const badge = <span className={`${badgeClasses} ${className}`}>{status || "—"}</span>;

  //Tool Tip for mixed Orders processing
  if (lower === "mixed" && orders.length > 0) {
    return (
      <Tooltip
        arrow
        placement="top"
        title={
          <div className="text-xs space-y-1">
            {orders.map((order, index) => (
              <div key={index} className="flex justify-between gap-3">
                <span className="font-medium">{order.shopSnapshot?.shopName || "Shop"}</span>
                <span>{getDisplayStatus(order)}</span>
              </div>
            ))}
          </div>
        }
      >
        {badge}
      </Tooltip>
    );
  }

  return badge;
};

export default StatusBadge;
