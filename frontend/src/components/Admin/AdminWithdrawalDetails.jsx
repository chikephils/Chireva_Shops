import api from "../../utils/axios";
import { CiMoneyBill } from "react-icons/ci";
import { RxCross1, RxAvatar } from "react-icons/rx";
import { server } from "../../server";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../UI/Loader";
import { numbersWithCommas } from "../../utils/priceDisplay";

const AdminWithdrawalDetails = ({ withdrawal, isLoading }) => {
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const isSeller = withdrawal?.withdrawalType === "seller";
  const isUser = withdrawal?.withdrawalType === "user";

  useEffect(() => {
    if (withdrawal?.status) {
      setSelectedStatus(withdrawal.status);
    }
  }, [withdrawal]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();

    if (!withdrawal || selectedStatus === withdrawal.status) return;
    if (selectedStatus === "Rejected" && !failureReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    setUpdating(true);
    try {
      const response = await api.put(
        `${server}/withdraw/update-withdraw-request/${withdrawal._id}`,
        {
          status: selectedStatus,
          failureReason: selectedStatus === "Rejected" ? failureReason : undefined,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (response.status === 200 || response.status === 201) {
        toast.success(`Withdrawal ${selectedStatus}`);
        navigate("/admin/withdraw-request");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "An error occurred";
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  const isDisabled =
    updating || selectedStatus === withdrawal?.status || !selectedStatus || (selectedStatus === "Rejected" && !failureReason.trim());

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-73px)] w-full bg-gray-950 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const isCompleted = withdrawal.status === "Successful" || withdrawal.status === "Rejected";

  return (
    <div className="min-h-screen max-w-screen-4xl mx-auto lg:px-2  bg-gray-950 text-gray-100">
      <div className=" flex flex-col h-full">
        {/* Sticky Header */}
        <div className="fixed w-full left-0 right-0 z-10 bg-gray-900 border-b border-gray-800 shadow-sm">
          <div className="max-w-screen-4xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CiMoneyBill className="text-red-500" size={24} />
              <h1 className="text-lg font-semibold text-white">Withdrawal Details</h1>
            </div>
            <button onClick={() => navigate(-1)} className="rounded-full hover:bg-gray-800 p-2 transition" aria-label="Close">
              <RxCross1 size={24} className="text-gray-300 hover:text-white transition" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="max-w-screen-4xl px-2 lg:px-6 pt-24 space-y-6 pb-16">
          {/* Transaction Info Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-900 p-4 rounded-lg border border-gray-800">
            <div className="text-sm text-gray-400">
              Transaction ID: <span className="text-gray-200 font-medium">#{withdrawal._id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="text-sm text-gray-400">
              Date:{" "}
              <span className="text-gray-200">
                {new Date(withdrawal.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              Type: <span className="capitalize text-gray-200 font-medium">{withdrawal.withdrawalType}</span>
            </div>
          </div>

          {/* Seller / Shop Info */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-5 md:p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-white mb-5">{isSeller ? "Seller Information" : "User Information"}</h2>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                {(isSeller ? withdrawal.seller?.avatar?.url : withdrawal.user?.avatar?.url) ? (
                  <img
                    src={isSeller ? withdrawal.seller.avatar.url : withdrawal.user.avatar.url}
                    alt="avatar"
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-gray-700"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-800 flex items-center justify-center border-2 border-gray-700">
                    <RxAvatar size={48} className="text-gray-500" />
                  </div>
                )}
              </div>

              <div className="space-y-3 text-gray-300 text-sm md:text-base">
                {isSeller ? (
                  <>
                    <p>
                      <strong className="text-gray-200">Shop Name:</strong> {withdrawal.seller?.shopName || "—"}
                    </p>
                    <p>
                      <strong className="text-gray-200">Address:</strong> {withdrawal.seller?.address || "—"}
                    </p>
                    <p>
                      <strong className="text-gray-200">Phone:</strong> {withdrawal.seller?.phoneNumber || "—"}
                    </p>
                    <p>
                      <strong className="text-gray-200">Email:</strong> {withdrawal.seller?.email || "—"}
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong className="text-gray-200">Name:</strong>
                      <strong> {withdrawal.user ? `${withdrawal.user.firstName} ${withdrawal.user.lastName}` : "—"}</strong>
                    </p>
                    <p>
                      <strong className="text-gray-200">Email:</strong> {withdrawal.user?.email || "—"}
                    </p>
                    <p>
                      <strong className="text-gray-200">Phone:</strong> {withdrawal.user?.phoneNumber || "—"}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Withdrawal Details + Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Withdrawal Info */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-5 md:p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-white mb-5">Withdrawal Details</h2>
              <div className="space-y-4 text-gray-300">
                <div className="flex justify-between text-base">
                  <span className="font-medium text-gray-200">Amount:</span>
                  <span className="text-green-400 font-semibold">₦{numbersWithCommas(withdrawal.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-200">Bank:</span>
                  <span>{withdrawal?.bank || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-200">Account Number:</span>
                  <span className="font-mono">{withdrawal?.accountNumber || "—"}</span>
                </div>
              </div>
            </div>

            {/* Status & Action */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-5 md:p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-white mb-5">Status & Action</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-300 gap-4 flex items-center">
                    Current Status:
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium bg-gray-800 capitalize ${
                        withdrawal.status === "Successful"
                          ? "text-green-400"
                          : withdrawal.status === "Rejected"
                            ? "text-red-400"
                            : "text-yellow-400"
                      }`}
                    >
                      {withdrawal.status}
                    </span>
                  </p>

                  {withdrawal.status === "Rejected" && withdrawal.failureReason && (
                    <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-md">
                      <p className="text-sm text-red-300">
                        <strong>Reason:</strong> {withdrawal.failureReason}
                      </p>
                    </div>
                  )}
                </div>

                {!isCompleted && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Update Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full max-w-xs bg-gray-800 border border-gray-700 text-gray-200 rounded-md px-4 py-2.5"
                    >
                      <option>{withdrawal?.status}</option>
                      <option value="Successful">Successful</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                )}

                {selectedStatus === "Rejected" && withdrawal.status === "Processing" && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rejection Reason</label>
                    <textarea
                      value={failureReason}
                      onChange={(e) => setFailureReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-md px-4 py-2.5 min-h-[100px]"
                    />
                  </div>
                )}

                {!isCompleted && (
                  <button
                    onClick={handleUpdateStatus}
                    disabled={isDisabled}
                    className={`px-6 py-3 rounded-lg font-medium transition ${isDisabled ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white shadow-sm"} `}
                  >
                    {updating ? "Updating..." : "Update Status"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWithdrawalDetails;
