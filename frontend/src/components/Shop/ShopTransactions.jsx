import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LoadSeller, selectSeller } from "../../features/shop/shopSlice";
import Loader from "../UI/Loader";
import { FcMoneyTransfer } from "react-icons/fc";
import { numbersWithCommas } from "../../utils/priceDisplay";
import { format } from "date-fns";
import StatusBadge from "../UI/StatusBadge";

const ShopTransactions = () => {
  const dispatch = useDispatch();
  const seller = useSelector(selectSeller);
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (seller?._id) {
      setIsLoading(true);
      dispatch(LoadSeller(seller._id)).finally(() => setIsLoading(false));
    }
  }, [dispatch, seller?._id]);

  // Sort transactions newest first
  const sortedTransactions = seller?.transactions
    ? [...seller.transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  // Filtered transactions
  const filteredTransactions = sortedTransactions.filter((transaction) => {
    if (selectedStatus === "All") return true;
    return transaction.status === selectedStatus;
  });
  return (
    <div className=" flex flex-col h-full">
      {/* Sticky Header */}
      <div className="fixed top-[60px] left-0 right-0 z-10">
        <div className="max-w-screen-4xl mx-auto px-1 lg:px-6 py-1">
          <div className="lg:ml-[284px]">
            <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 rounded-t-xl px-4 lg:px-6 py-3 shadow-lg">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h1 className="flex items-center gap-2 font-medium text-[20px] lg:text-[22px] text-black">
                  <FcMoneyTransfer size={28} />
                  Transactions{" "}
                </h1>
                <div className="sm:w-[160px]">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-2 py-1 text-base font-semibold border border-lime-600 rounded-xl bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="All">All</option>
                    <option value="Processing" className="text-amber-600 font-medium">
                      Processing
                    </option>
                    <option value="Successful" className="text-green-600 font-medium">
                      Successful
                    </option>
                    <option value="Rejected" className="text-red-600 font-medium">
                      Rejected
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-4xl flex-1 min-h-0 pt-[50px] pb-4 px-2 lg:px-4">
        {/* Transactions List */}
        {isLoading ? (
          <div className="min-h-[calc(100vh-245px)] flex items-center justify-center">
            <Loader />
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="grid gap-6 grid-cols-1">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* Card Header */}
                <div className="p-3 border-b bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-600">Transaction ID</h3>
                    <span className="text-xs font-mono text-gray-500">{transaction._id.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <h3 className="text-sm font-medium text-gray-600">Transaction Type</h3>
                    <span className="text-xs font-mono text-black font-medium">{transaction?.type?.toUpperCase()}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium text-gray-500">
                      {transaction?.createdAt && !isNaN(new Date(transaction?.createdAt).getTime())
                        ? format(new Date(transaction.createdAt), "MMM dd, yyyy • hh:mm a")
                        : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className={`font-bold ${transaction?.type === "Refund" ? "text-red-600" : "text-green-600"}`}>
                      ₦{numbersWithCommas(transaction.amount)}
                    </span>
                  </div>

                  {transaction?.type === "Withdrawal" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank</span>
                        <span className="font-medium">{transaction.bank || "—"}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Account No</span>
                        <span className="font-medium">{transaction.accountNumber || "—"}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span>
                      <StatusBadge status={transaction?.status} />
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Updated</span>
                    <span className="font-medium text-gray-500">
                      {(() => {
                        const dateToUse = transaction?.type === "Withdrawal" ? transaction?.updatedAt : transaction?.createdAt;

                        return dateToUse && !isNaN(new Date(dateToUse).getTime())
                          ? format(new Date(dateToUse), "MMM dd, yyyy • hh:mm a ")
                          : "—";
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <FcMoneyTransfer size={64} className="text-gray-300 mb-4" />
            <p className="text-lg font-medium">No transactions found</p>
            <p className="text-sm mt-2">
              {selectedStatus !== "all" ? `No ${selectedStatus} transactions yet` : "Your transaction history will appear here"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopTransactions;
