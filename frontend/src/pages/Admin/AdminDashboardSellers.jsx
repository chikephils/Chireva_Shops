import React, { useEffect, useState } from "react";
import AdminSellers from "../../components/Admin/AdminSellers";
import { useDispatch } from "react-redux";
import { deleteSeller, getAllSellers } from "../../features/admin/adminSlice";
import DeleteConfirmationModal from "../../components/UI/DeleteConfirmationModal";

const AdminDashboardSellers = () => {
  const [isLoading, setIsLoading] = useState(true);

  const [showLoader, setShowLoader] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sellerToDelete, setSellerToDelete] = useState(null);
  const [sellers, setSellers] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    setIsLoading(true);
    dispatch(getAllSellers())
      .unwrap()
      .then((response) => {
        setSellers(response);
      })
      .catch((error) => {
        console.error("Error fetching Seller", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  const handleDeleteRequest = (sellerId) => {
    const seller = sellers?.find((item) => item._id === sellerId);
    setSellerToDelete(seller);
    setShowDeleteModal(true);
  };

  const confirmDeleteAction = async () => {
    if (!sellerToDelete?._id) return;

    const sellerId = sellerToDelete._id;
    setShowLoader((prev) => ({ ...prev, [sellerId]: true }));
    setShowDeleteModal(false);
    try {
      await dispatch(deleteSeller(sellerId)).unwrap();
    } catch (error) {
      console.error("Delete Failed:", error);
    } finally {
      setShowLoader((prev) => ({ ...prev, [sellerId]: false }));
      setSellerToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSellerToDelete(null);
  };

  return (
    <>
      {/* Main Content */}
      <main className="w-full fixed lg:w-[70%] xl:w-[77%] left-0 right-0 mx-auto lg:left-auto lg:right-auto ml-0 lg:ml-[26%] xl:ml-[21%]  rounded-xl shadow-lg p-3 h-[calc(100%-70px)]">
        <AdminSellers sellers={sellers} isLoading={isLoading} showLoader={showLoader} handleDeleteRequest={handleDeleteRequest} />
      </main>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDeleteAction}
        title={`Delete ${sellerToDelete?.shopName} Shop`}
        message={
          sellerToDelete
            ? `Are you sure you want to delete ${sellerToDelete?.shopName} Shop? This action can not be undone.`
            : "Are you sure you want to delete this User?"
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default AdminDashboardSellers;
