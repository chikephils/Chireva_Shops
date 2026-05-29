import React, { useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "../../utils/axios";
import { server } from "../../server";
import { getShopProducts, selectSeller } from "../../features/shop/shopSlice";
import { getAllProducts } from "../../features/product/productSlice";
import { categoriesData } from "../../static/data";

const ProductEditForm = ({ setEdit, product }) => {
  const dispatch = useDispatch();
  const seller = useSelector(selectSeller);
  const sellerToken = useSelector((state) => state.shop.token);

  // Form statets
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    category: product?.category || "",
    originalPrice: product?.originalPrice ?? "",
    discountPrice: product?.discountPrice ?? "",
    stock: product?.stock ?? 0,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle all input changes in one function
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "stock" ? Number(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.discountPrice || Number(formData.discountPrice) <= 0) {
      newErrors.discountPrice = "Discount price must be greater than 0";
    }
    if (Number(formData.stock) < 0) newErrors.stock = "Stock cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.warn("Please fill all required fields correctly");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      discountPrice: Number(formData.discountPrice),
      stock: Number(formData.stock),
    };

    try {
      await api.put(
        `${server}/product/edit-product/${product._id}`,
        payload,
        {
          authType: "shop",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      toast.success("Product updated successfully!");
      // Refresh both product lists using .unwrap() for async thunk safety
      await Promise.all([dispatch(getShopProducts(seller._id)).unwrap(), dispatch(getAllProducts()).unwrap()]);

      setEdit(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update product. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 isolate z-[999] bg-black/60 backdrop-blur-sm  flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">Edit {product?.name}</h2>
          <button
            onClick={() => setEdit(false)}
            disabled={isSubmitting}
            className="p-2 rounded-full hover:bg-gray-200 transition disabled:opacity-50"
          >
            <RxCross1 size={24} className=" cursor-pointer text-white bg-black/50 rounded-full p-1 hover:bg-black/70 transition" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="p-6 overflow-y-auto scrollbar-hide flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter product name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Describe your product..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select a category</option>
                {categoriesData.map((cat) => (
                  <option key={cat.id} value={cat.title}>
                    {cat.title}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="Original price (optional)"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                    errors.discountPrice ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Selling price"
                  min="1"
                />
                {errors.discountPrice && <p className="mt-1 text-sm text-red-600">{errors.discountPrice}</p>}
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                  errors.stock ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Available stock"
                min="0"
              />
              {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  w-full py-3 px-6 rounded-lg font-medium text-white
                  transition-colors flex items-center justify-center gap-2
                  ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800"}
                `}
              >
                {isSubmitting ? (
                  <>
                    <span>Saving changes...</span>
                  </>
                ) : (
                  "Update Product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductEditForm;
