import React, { useEffect, useState } from "react";
import { BiSolidPackage } from "react-icons/bi";
import { RxCross1 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getShopProducts, selectSeller } from "../../features/shop/shopSlice";
import Ratings from "../ProductDetails/Ratings";
import { categoriesData } from "../../static/data";
import { toast } from "react-toastify";
import api from "../../utils/axios";
import { server } from "../../server";
import { getAllProducts } from "../../features/product/productSlice";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EditProduct = ({ product, averageRating, totalReviewsLength }) => {
  const dispatch = useDispatch();
  const seller = useSelector(selectSeller);
  const navigate = useNavigate();
  const [selectedImg, setSelectedImg] = useState(0);

  // Form statets
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    category: product?.category || "",
    originalPrice: product?.originalPrice ?? "",
    discountPrice: product?.discountPrice ?? "",
    stock: product?.stock ?? "",
    isEvent: product?.isEvent ?? false,
    eventStartDate: product?.eventStartDate ?? null,
    eventEndDate: product?.eventEndDate ?? null,
    eventTag: product?.eventTag ?? "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentDate = new Date();
  const minEndDate = formData.eventStartDate instanceof Date ? new Date(formData.eventStartDate.getTime() + 2 * 24 * 60 * 60 * 1000) : null;

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category: product.category || "",
        originalPrice: product.originalPrice ?? "",
        discountPrice: product.discountPrice ?? "",
        stock: product.stock ?? "",
        isEvent: product?.isEvent ?? false,
        eventStartDate: product?.eventStartDate ? new Date(product.eventStartDate) : null,
        eventEndDate: product?.eventEndDate ? new Date(product.eventEndDate) : null,
        eventTag: product?.eventTag ?? "",
      });
    }
  }, [product]);

  // Handle all input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: name === "stock" || name === "originalPrice" || name === "discountPrice" ? Number(value) || "" : newValue,
      };

      // If event is turned OFF reset event fields
      if (name === "isEvent" && !checked) {
        updated.discountPrice = "";
        updated.eventStartDate = null;
        updated.eventEndDate = null;
        updated.eventTag = "";
      }

      return updated;
    });

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle date changes
  const handleDateChange = (name, date) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.originalPrice || Number(formData.originalPrice) <= 0) {
      newErrors.originalPrice = "Price must be greater than 0";
    }
    if (Number(formData.stock) < 0) newErrors.stock = "Stock cannot be negative";

    // Event-validation
    if (formData.isEvent) {
      if (formData.isEvent) {
        if (!formData.discountPrice || Number(formData.discountPrice) <= 0) {
          newErrors.discountPrice = "Discount price must be greater than 0";
        }
      }
      if (Number(formData.discountPrice) >= Number(formData.originalPrice)) {
        newErrors.discountPrice = "Discount price must be less than original price";
      }
      if (!formData.eventStartDate) newErrors.eventStartDate = "Start date is required";
      if (!formData.eventEndDate) newErrors.eventEndDate = "End date is required";
      if (formData.eventStartDate && formData.eventEndDate) {
        if (formData.eventStartDate >= formData.eventEndDate) {
          newErrors.eventEndDate = "End date must be after start date";
        }
      }
    }

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
      originalPrice: Number(formData.originalPrice),
      discountPrice: formData.isEvent ? Number(formData.discountPrice) : null,
      stock: Number(formData.stock),
      isEvent: formData.isEvent,
      eventStartDate: formData.isEvent && formData.eventStartDate ? formData.eventStartDate.toISOString() : null,
      eventEndDate: formData.isEvent && formData.eventEndDate ? formData.eventEndDate.toISOString() : null,
      eventTag: formData.isEvent ? formData.eventTag.trim() || null : null,
    };

    try {
      await api.put(`${server}/product/edit-product/${product._id}`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      toast.success("Product updated successfully!");
      await Promise.all([dispatch(getShopProducts(seller._id)).unwrap(), dispatch(getAllProducts({ page: 1, limit: 8 })).unwrap()]);
      navigate(-1);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update product. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full bg-gray-50 pb-10">
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="max-w-screen-4xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BiSolidPackage className="text-red-600" size={28} />
            <h1 className="text-xl font-semibold text-gray-900">Edit Product</h1>
          </div>

          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition">
            <RxCross1 size={24} className=" cursor-pointer text-white bg-black/50 rounded-full p-1 hover:bg-black/70 transition" />
          </button>
        </div>
      </div>
      <div className="max-w-screen-4xl mx-auto px-4 lg:px-8  pt-3 h-[calc(100%-52px)] overflow-y-scroll scrollbar-hide pb-10">
        {/* mobile view */}
        <div className="800px:hidden">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center">{product?.name}</h1>
          {/* Image + Thumbnails */}
          <div className="mt-4">
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg p-4">
              <img src={product?.images?.[selectedImg]?.url} alt={product?.name} className="w-full h-auto max-h-[200px] object-contain" />
              {product?.stock < 1 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">Sold Out</span>
                </div>
              )}
            </div>

            {product?.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-4 mt-6">
                {product?.images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all flex justify-center items-center ${
                      selectedImg === i ? "border-lime-600 shadow-md" : "border-gray-200"
                    }`}
                  >
                    <img src={img?.url} alt="" className="max-h-48 object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Star Rating + Reviews + Sold */}
          <div className="flex items-center justify-center gap-4 my-6">
            <Ratings rating={averageRating} />
            <span className="text-gray-600 text-sm lg:text-base font-semibold">
              ({totalReviewsLength} reviews) • {product?.sold_out || 0} sold
            </span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 border border-gray-200 rounded-xl p-2">
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

            {/* Event Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isEvent"
                name="isEvent"
                checked={formData.isEvent}
                onChange={handleChange}
                className="h-6 w-6 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="isEvent" className="ml-2 text-sm font-medium text-gray-700">
                Make this a Promo Product(i.e Discounts, Promo Sales, Black-Friday etc.)
              </label>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Original Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  placeholder="Original price"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                    errors.originalPrice ? "border-red-500" : "border-gray-300"
                  }`}
                  min="1"
                />
                {errors.originalPrice && <p className="mt-1.5 text-sm text-red-600">{errors.originalPrice}</p>}
              </div>

              {formData.isEvent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Discount Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="discountPrice"
                    value={formData.discountPrice}
                    onChange={handleChange}
                    placeholder="Discounted price"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                      errors.discountPrice ? "border-red-500" : "border-gray-300"
                    }`}
                    min="1"
                  />
                  {errors.discountPrice && <p className="mt-1.5 text-sm text-red-600">{errors.discountPrice}</p>}
                </div>
              )}
            </div>

            {/* Event Details - only show if checked */}
            {formData.isEvent && (
              <div className="space-y-6 border-l-4 border-indigo-500 pl-5 mt-4">
                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Event Start Date <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      selected={formData.eventStartDate}
                      onChange={(date) => handleDateChange("eventStartDate", date)}
                      dateFormat="dd MMM yyyy"
                      minDate={currentDate}
                      placeholderText="Select event start date"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                        errors.eventStartDate ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.eventStartDate && <p className="mt-1.5 text-sm text-red-600">{errors.eventStartDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Event End Date <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      selected={formData.eventEndDate}
                      onChange={(date) => handleDateChange("eventEndDate", date)}
                      dateFormat="dd MMM yyyy"
                      minDate={minEndDate}
                      placeholderText="Select event end date"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                        errors.eventEndDate ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.eventEndDate && <p className="mt-1.5 text-sm text-red-600">{errors.eventEndDate}</p>}
                  </div>
                </div>

                {/* Event Tag (optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Promo Name / Badge (optional)</label>
                  <input
                    type="text"
                    name="eventTag"
                    value={formData.eventTag}
                    onChange={handleChange}
                    placeholder="e.g. Flash Sale, Black Friday, Limited Offer"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  />
                </div>
              </div>
            )}

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

        {/* Desktop view */}
        <div className="hidden 800px:grid grid-cols-2 gap-12">
          <div>
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg p-2">
              <img src={product?.images?.[selectedImg]?.url} alt={product?.name} className="w-full h-auto max-h-[350px] object-contain" />
              {product?.stock < 1 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">Sold Out</span>
                </div>
              )}
            </div>

            {product?.images?.length > 1 && (
              <div className="grid grid-cols-6 gap-4 mt-6">
                {product?.images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all flex justify-center items-center ${
                      selectedImg === i ? "border-lime-600 shadow-md" : "border-gray-200"
                    }`}
                  >
                    <img src={img?.url} alt="" className="w-full h-30 object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 mt-4">
              <h1 className="text-3xl font-bold text-gray-900">{product?.name}</h1>
              <Ratings rating={averageRating} />
              <span className="text-gray-600">
                ({totalReviewsLength} reviews) • {product?.sold_out || 0} sold
              </span>
            </div>
          </div>
          <div>
            <form onSubmit={handleSubmit} className="space-y-4 border border-gray-200 rounded-xl p-6">
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isEvent"
                  name="isEvent"
                  checked={formData.isEvent}
                  onChange={handleChange}
                  className="h-6 w-6 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="isEvent" className="ml-2 text-sm font-medium text-gray-700">
                  Make this a Promo Product(i.e Discounts, Promo Sales, Black-Friday etc.)
                </label>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Original Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    placeholder="Original price"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                      errors.originalPrice ? "border-red-500" : "border-gray-300"
                    }`}
                    min="1"
                  />
                  {errors.originalPrice && <p className="mt-1.5 text-sm text-red-600">{errors.originalPrice}</p>}
                </div>

                {formData.isEvent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Discount Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="discountPrice"
                      value={formData.discountPrice}
                      onChange={handleChange}
                      placeholder="Discounted price"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                        errors.discountPrice ? "border-red-500" : "border-gray-300"
                      }`}
                      min="1"
                    />
                    {errors.discountPrice && <p className="mt-1.5 text-sm text-red-600">{errors.discountPrice}</p>}
                  </div>
                )}
              </div>

              {/* Event Details - only show if checked */}
              {formData.isEvent && (
                <div className="space-y-6 border-l-4 border-indigo-500 pl-5 mt-4">
                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Event Start Date <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        selected={formData.eventStartDate}
                        onChange={(date) => handleDateChange("eventStartDate", date)}
                        dateFormat="dd MMM yyyy"
                        minDate={currentDate}
                        placeholderText="Select event start date"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                          errors.eventStartDate ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.eventStartDate && <p className="mt-1.5 text-sm text-red-600">{errors.eventStartDate}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Event End Date <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        selected={formData.eventEndDate}
                        onChange={(date) => handleDateChange("eventEndDate", date)}
                        dateFormat="dd MMM yyyy"
                        minDate={minEndDate}
                        placeholderText="Select event end date"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                          errors.eventEndDate ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.eventEndDate && <p className="mt-1.5 text-sm text-red-600">{errors.eventEndDate}</p>}
                    </div>
                  </div>

                  {/* Event Tag (optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Promo Name / Badge (optional)</label>
                    <input
                      type="text"
                      name="eventTag"
                      value={formData.eventTag}
                      onChange={handleChange}
                      placeholder="e.g. Flash Sale, Black Friday, Limited Offer"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                </div>
              )}

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
    </div>
  );
};

export default EditProduct;
