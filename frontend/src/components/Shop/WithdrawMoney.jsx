import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/axios";
import { server } from "../../server";
import { LoadSeller, selectSeller } from "../../features/shop/shopSlice";
import { numbersWithCommas } from "../../utils/priceDisplay";
import { FcMoneyTransfer } from "react-icons/fc";
import { RxCross1 } from "react-icons/rx";
import { MdDeleteForever } from "react-icons/md";

const WithdrawMoney = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const seller = useSelector(selectSeller);
  const sellerToken = useSelector((state) => state.shop.sellerToken);

  const [banks, setBanks] = useState([]);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [formMode, setFormMode] = useState("select");

  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch banks list once
  useEffect(() => {
    axios
      .get(`${server}/payment/banks/flutterwave`)
      .then((res) => setBanks(res.data.banks || []))
      .catch((err) => console.error("Failed to load banks:", err));
  }, []);

  useEffect(() => {
    dispatch(LoadSeller());
  }, [dispatch]);

  const withdrawMethods = useMemo(() => {
    return seller?.withdrawMethods || [];
  }, [seller?.withdrawMethods]);

  const isNewMethod = useMemo(() => {
    return !withdrawMethods.some((m) => m.accountNumber === accountNumber && m.bankName === bankName);
  }, [withdrawMethods, accountNumber, bankName]);

  // Bank search/filter
  const handleBankSearch = (input) => {
    const term = input.toLowerCase();
    const filtered = banks.filter((bank) => bank.name.toLowerCase().includes(term) || bank.code.includes(term));
    setFilteredBanks(filtered);
  };

  const selectBank = (bank) => {
    setBankName(bank.name);
    setFilteredBanks([]);
  };

  // Submit new withdrawal method + amount
  const handleWithdraw = async (e) => {
    e.preventDefault();

    if (withdrawAmount < 1000) {
      return toast.error("Minimum withdrawal is ₦1,000");
    }
    if (withdrawAmount > seller?.availableBalance) {
      return toast.error("Insufficient balance!");
    }

    if (!bankName || !accountNumber) {
      return toast.error("Please select or enter bank details");
    }

    setIsSubmitting(true);

    const payload = {
      bankName,
      accountNumber,
      amount: withdrawAmount,
    };

    try {
      // Submit withdrawal request
      await api.post(`${server}/withdraw/create-withdraw-request`, payload, {
        headers: {
          "Content-Type": "application/json",
          role: "shop",
        },
        withCredentials: true,
      });

      //  Save only if truly new
      if (isNewMethod) {
        await api.put(
          `${server}/shop/update-payment-methods`,
          { withdrawMethod: { bankName, accountNumber } },
          {
            headers: {
              "Content-Type": "application/json",
              role: "shop",
            },
            withCredentials: true,
          },
        );
      }

      // Success
      toast.success("Withdrawal request submitted successfully!");
      dispatch(LoadSeller());

      // Reset form
      setBankName("");
      setAccountNumber("");
      setWithdrawAmount(0);
      setFormMode("select");
    } catch (error) {
      console.error("Withdrawal failed:", error);

      const errMsg = error.response?.data?.message || error.message || "Withdrawal failed. Please try again.";

      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete saved bank method
  const deleteWithdrawMethod = async (method) => {
    if (!window.confirm(`Remove ${method.bankName} - ${method.accountNumber}?`)) {
      return;
    }

    try {
      await api.delete(`${server}/shop/delete-withdraw-method`, {
        withCredentials: true,
        headers: {
          role: "shop",
        },
        data: { bankName: method.bankName },
      });

      toast.success("Bank account removed");
      dispatch(LoadSeller());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove bank");
    }
  };

  return (
    <div className="h-full bg-gray-50 pb-10">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="max-w-screen-4xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FcMoneyTransfer className="text-indigo-600" size={28} />
            <h1 className="text-xl font-semibold text-gray-900">Withdraw Money</h1>
          </div>

          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition">
            <RxCross1 size={24} className=" cursor-pointer text-white bg-black/50 rounded-full p-1 hover:bg-black/70 transition" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 lg:px-8 pt-6 space-y-6 h- h-[calc(100%-52px)] overflow-y-scroll scrollbar-hide pb-10">
        {/* Balance Display */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-600 mb-2">Available Balance</h3>
          <p className="text-3xl font-bold text-gray-900">₦{numbersWithCommas(seller?.availableBalance || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">Minimum withdrawal: ₦1,000</p>
        </div>

        {/* Main Form / Selection Area */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">
              {formMode === "add-new" ? "Add New Withdrawal Method" : "Withdraw Funds"}
            </h2>
          </div>

          {formMode === "select" ? (
            <div className="p-6 space-y-6">
              {/* Saved Banks Dropdown */}
              {withdrawMethods && withdrawMethods.length > 0 ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Withdraw to</label>
                  <div className="space-y-3">
                    {withdrawMethods.map((method, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                        <div>
                          <p className="font-medium text-gray-900">{method.bankName}</p>
                          <p className="text-sm text-gray-600">{method.accountNumber}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              setBankName(method.bankName);
                              setAccountNumber(method.accountNumber);
                              setFormMode("withdraw");
                            }}
                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            Select
                          </button>

                          <button onClick={() => deleteWithdrawMethod(method)} className="text-red-600 hover:text-red-800">
                            <MdDeleteForever size={22} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No withdrawal methods added yet</p>
              )}

              {/* Buttons */}
              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <button
                  onClick={() => setFormMode("add-new")}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
                >
                  Add New Bank Account
                </button>

                {withdrawMethods.length > 0 && (
                  <button
                    onClick={() => {
                      if (withdrawMethods.length === 1) {
                        setBankName(withdrawMethods[0].bankName);
                        setAccountNumber(withdrawMethods[0].accountNumber);
                        setFormMode("withdraw");
                      }
                    }}
                    disabled={withdrawMethods.length === 0}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Add New Bank Form */
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => {
                    setBankName(e.target.value);
                    handleBankSearch(e.target.value);
                  }}
                  placeholder="Search or type bank name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />

                {filteredBanks.length > 0 && (
                  <div className="mt-1 border rounded-lg max-h-60 overflow-y-auto bg-white shadow-lg">
                    {filteredBanks.map((bank) => (
                      <div
                        key={bank.id}
                        onClick={() => selectBank(bank)}
                        className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b last:border-none"
                      >
                        {bank.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter account number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Withdraw (₦)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  min="1000"
                  max={seller?.availableBalance || 0}
                />
                <p className="mt-1 text-sm text-gray-600">Max available: ₦{numbersWithCommas(seller?.availableBalance || 0)}</p>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setFormMode("select");
                    setBankName("");
                    setAccountNumber("");
                    setWithdrawAmount(0);
                  }}
                  className="flex-1 py-3 px-6 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                >
                  Cancel
                </button>

                <button
                  onClick={handleWithdraw}
                  disabled={isSubmitting || withdrawAmount < 1000 || !bankName || !accountNumber}
                  className={`
                    flex-1 py-3 px-6 rounded-lg font-medium text-white transition
                    flex items-center justify-center gap-2
                    ${
                      isSubmitting || withdrawAmount < 1000 || !bankName || !accountNumber
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }
                  `}
                >
                  {isSubmitting ? "Wait..." : "Withdraw"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawMoney;
