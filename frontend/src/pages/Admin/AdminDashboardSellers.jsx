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
      <div className="flex flex-col h-full ">
        <AdminSellers sellers={sellers} isLoading={isLoading} showLoader={showLoader} handleDeleteRequest={handleDeleteRequest} />
      </div>

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
