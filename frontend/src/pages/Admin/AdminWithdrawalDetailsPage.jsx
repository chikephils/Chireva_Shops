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
        const response = await api.get(`${server}/withdraw/get-withdraw-request/${id}`, {
          withCredentials: true,
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
      <div className="max-w-screen-4xl mx-auto mt-[68px] px-4 lg:px-8">
        <div className="w-full fixed  left-0 right-0 mx-auto rounded-xl shadow-lg h-[calc(100%-70px)]">
          <AdminWithdrawalDetails withdrawal={withdrawal} isLoading={isLoading} />
        </div>
      </div>
    </>
  );
};

export default AdminWithdrawalDetailsPage;
