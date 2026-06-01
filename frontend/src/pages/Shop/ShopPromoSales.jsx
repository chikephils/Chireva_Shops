import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteShopProduct, getShopPromoProducts, selectAllShopPromoProducts, selectSeller } from "../../features/shop/shopSlice";
import AllPromoProducts from "../../components/Shop/AllPromoProducts";
import DeleteConfirmationModal from "../../components/UI/DeleteConfirmationModal";
import SellerProductCardDetails from "../../components/Route/ProductCardDetails/SellerProductCardDetails";

const ShopPromoSales = () => {
  const seller = useSelector(selectSeller);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const shopPromoProducts = useSelector(selectAllShopPromoProducts);

  const [showLoader, setShowLoader] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    setIsLoading(true);
    dispatch(getShopPromoProducts(seller._id)).finally(() => setIsLoading(false));
  }, [dispatch, seller._id]);

  const handleProductClick = (productId) => {
    const promoProduct = shopPromoProducts.find((item) => item._id === productId);
    setSelectedProduct(promoProduct);
    setDetailsOpen(true);
  };

  const handleDeleteRequest = (productId) => {
    const promoProduct = shopPromoProducts.find((item) => item._id === productId);
    setProductToDelete(promoProduct);
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
      <div>
        <AllPromoProducts
          handleProductClick={handleProductClick}
          shopPromoProducts={shopPromoProducts}
          seller={seller}
          isLoading={isLoading}
          handleDeleteRequest={handleDeleteRequest}
          showLoader={showLoader}
        />
      </div>

      {detailsOpen && selectedProduct && (
        <SellerProductCardDetails setDetailsOpen={() => setDetailsOpen(false)} product={selectedProduct} />
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

export default ShopPromoSales;
