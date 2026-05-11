import React, { useEffect, useState } from "react";
import AdminUsers from "../../components/Admin/AdminUsers";
import { deleteUser, getAllUsers, selectAllUsers, selectAllUsersLoading } from "../../features/admin/adminSlice";
import { useDispatch, useSelector } from "react-redux";
import DeleteConfirmationModal from "../../components/UI/DeleteConfirmationModal";
import { toast } from "react-toastify";

const AdminDashboardUsers = () => {
  const [users, setUsers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showLoader, setShowLoader] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    setIsLoading(true);
    dispatch(getAllUsers())
      .unwrap()
      .then((response) => {
        setUsers(response);
      })
      .catch((error) => {
        console.error("Error fetching users", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  const handleDeleteRequest = (userId) => {
    const user = users?.find((item) => item._id === userId);
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteAction = async () => {
    if (!userToDelete?._id) return;

    const userId = userToDelete._id;
    setShowLoader((prev) => ({ ...prev, [userId]: true }));
    setShowDeleteModal(false);
    try {
      await dispatch(deleteUser(userId)).unwrap();
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.data.message);
      console.error("Delete Failed:", error);
    } finally {
      setShowLoader((prev) => ({ ...prev, [userId]: false }));
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  return (
    <>
      {/* Main Content */}
      <main className="w-full fixed lg:w-[70%] xl:w-[77%] left-0 right-0 mx-auto lg:left-auto lg:right-auto ml-0 lg:ml-[26%] xl:ml-[21%]  rounded-xl shadow-lg p-3 h-[calc(100%-70px)]">
        <AdminUsers users={users} isLoading={isLoading} showLoader={showLoader} handleDeleteRequest={handleDeleteRequest} />
      </main>
      {/* </div> */}

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDeleteAction}
        title="Delete User"
        message={
          userToDelete
            ? `Are you sure you want to delete ${userToDelete?.name}? This action can not be undone.`
            : "Are you sure you want to delete this User?"
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default AdminDashboardUsers;
