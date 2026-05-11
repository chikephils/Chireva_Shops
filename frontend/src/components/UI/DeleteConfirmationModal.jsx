import React from "react";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
  danger = true, 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        </div>

        {/* Message */}
        <div className="px-6 py-6">
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>

        {/* Buttons */}
        <div className="px-6 py-5 border-t border-gray-200 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={`
              px-5 py-2.5 rounded-lg font-medium transition-colors
              ${
                isLoading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }
            `}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`
              px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2
              ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : danger
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }
            `}
          >
            {isLoading && (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
