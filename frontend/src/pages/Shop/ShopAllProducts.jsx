import React, { useEffect, useState } from "react";
import AllProducts from "../../components/Shop/AllProducts";
import { useDispatch, useSelector } from "react-redux";
import { deleteShopProduct, getShopProducts, selectAllShopProducts, selectSeller } from "../../features/shop/shopSlice";
import SellerProductCardDetails from "../../components/Route/ProductCardDetails/SellerProductCardDetails";
import DeleteConfirmationModal from "../../components/UI/DeleteConfirmationModal";


const ShopAllProducts = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const seller = useSelector(selectSeller);
  const shopProducts = useSelector(selectAllShopProducts);
  const dispatch = useDispatch();

  const [showLoader, setShowLoader] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    dispatch(getShopProducts(seller?._id)).finally(() => setIsLoading(false));
  }, [dispatch, seller?._id]);

  const handleProductClick = (productId) => {
    const product = shopProducts.find((item) => item._id === productId);
    setSelectedProduct(product);
    setDetailsOpen(true);
  };

  const handleDeleteRequest = (productId) => {
    const product = shopProducts.find((item) => item._id === productId);
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDeleteAction = async () => {
    if (!productToDelete?._id) return;

    const productId = productToDelete._id;

    setShowLoader((prev) => ({ ...prev, [productId]: true }));
    setShowDeleteModal(false);

    try {
      await dispatch(deleteShopProduct(productId)).unwrap();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setShowLoader((prev) => ({ ...prev, [productId]: false }));
      setProductToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  return (
    <>
      <div className="w-full fixed lg:w-[70%] xl:w-[75%] left-0 right-0 mx-auto lg:left-auto lg:right-auto ml-0 lg:ml-[26%] xl:ml-[21%] bg-gray-50 rounded-xl shadow-lg p-3 h-[calc(100%-80px)] ">
        <AllProducts
          handleProductClick={handleProductClick}
          shopProducts={shopProducts}
          seller={seller}
          isLoading={isLoading}
          handleDeleteRequest={handleDeleteRequest}
          showLoader={showLoader}
        />
      </div>
      
      {detailsOpen && selectedProduct && (
        <SellerProductCardDetails setDetailsOpen={() => setDetailsOpen(!detailsOpen)} product={selectedProduct} />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDeleteAction}
        title="Delete Product"
        message={
          productToDelete
            ? `Are you sure you want to delete ${productToDelete.name}? This action cannot be undone.`
            : "Are you sure you want to delete this product?"
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default ShopAllProducts;
