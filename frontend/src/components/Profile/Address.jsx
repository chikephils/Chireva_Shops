import React, { useState } from "react";
import { AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";
import { deleteUserAddress } from "../../features/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import DeleteConfirmationModal from "../UI/DeleteConfirmationModal";

const Address = ({ setOpen }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const handleDeleteRequest = (item) => {
    setAddressToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDeleteAction = () => {
    if (addressToDelete) {
      dispatch(deleteUserAddress(addressToDelete._id));
    }
    setShowDeleteModal(false);
    setAddressToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setAddressToDelete(null);
  };

  return (
    <div className="w-full h-full px-2 pb-10 pt-2 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sticky h-[35px]">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">My Addresses</h1>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <AiOutlinePlus size={20} />
          <span className="font-medium">Add New</span>
        </button>
      </div>

      {/* Address List */}
      <div className=" h-[calc(100%-37px)] overflow-y-scroll scrollbar-hide pb-10 ">
        {user && user?.addresses?.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 pb-10">
            {user?.addresses.map((item) => (
              <div
                key={item._id}
                className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                {/* Address Type Badge */}
                <span className="inline-block px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full mb-4">
                  {item?.addressType}
                </span>

                {/* Address Details */}
                <div className="space-y-2 mb-6">
                  <p className="text-lg font-medium text-gray-900">{item?.address1}</p>
                  <p className="text-gray-600">
                    {item?.city}, {item?.state}, {item?.zipCode}
                  </p>
                  <p className="text-gray-600">{item?.country}</p>
                  <p className="text-sm text-gray-500 mt-3">Phone: {user?.phoneNumber}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4">
                  <button
                    onClick={() => handleDeleteRequest(item)}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                    aria-label="Delete address"
                  >
                    <AiOutlineDelete size={22} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center h-[60vh]">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No saved addresses yet</h3>
            <p className="text-gray-600 mb-6 max-w-md">Add your first address to make checkout faster and easier next time.</p>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <AiOutlinePlus size={20} />
              Add Address
            </button>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDeleteAction}
        title="Delete Address"
        message={
          addressToDelete
            ? `Are you sure you want to delete ${addressToDelete.addressType} address? This action can't be undone`
            : "Are you sure you want to delete this address"
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Address;
