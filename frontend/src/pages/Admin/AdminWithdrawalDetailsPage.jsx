import React, { useEffect, useState } from "react";
import AdminWithdrawalDetails from "../../components/Admin/AdminWithdrawalDetails";
import { useSelector } from "react-redux";
import { server } from "../../server";
import api from "../../utils/axios";
import { useParams } from "react-router-dom";

const AdminWithdrawalDetailsPage = () => {
  const { id } = useParams();
  const [withdrawal, setWithdrawal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWithdrawal = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await api.get(`${server}/withdraw/get-withdraw-request/${id}`);
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
      <div className="max-w-screen-4xl mx-auto mt-[68px]">
        <AdminWithdrawalDetails withdrawal={withdrawal} isLoading={isLoading} />
      </div>
    </>
  );
};

export default AdminWithdrawalDetailsPage;
