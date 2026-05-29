import React, { useEffect, useState } from "react";
import AdminWithdrawalDetails from "../../components/Admin/AdminWithdrawalDetails";
import { useSelector } from "react-redux";
import { server } from "../../server";
import api from "../../utils/userApi";
import { useParams } from "react-router-dom";

const AdminWithdrawalDetailsPage = () => {
  const { id } = useParams();
  const [withdrawal, setWithdrawal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = useSelector((state) => state?.user?.token);

  useEffect(() => {
    const fetchWithdrawal = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await api.get(`${server}/withdraw/get-withdraw-request/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setWithdrawal(response?.data.withdrawal);
      } catch (error) {
        console.log(error?.response?.data.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWithdrawal();
  }, [id]);
  return (
    <>
      <div className="max-w-screen-4xl mx-auto pt-[65px] h-[calc(100vh-65px)]">
        <AdminWithdrawalDetails withdrawal={withdrawal} isLoading={isLoading} />
      </div>
    </>
  );
};

export default AdminWithdrawalDetailsPage;
