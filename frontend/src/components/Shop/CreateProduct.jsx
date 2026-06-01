import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { MdDeleteForever } from "react-icons/md";
import { categoriesData } from "../../static/data";
import { createProduct, getAllProducts } from "../../features/product/productSlice";
import { selectSeller } from "../../features/shop/shopSlice";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreateProduct = () => {
  const dispatch = useDispatch();
  const seller = useSelector(selectSeller);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    originalPrice: "",
    discountPrice: "",
    stock: "",
    isEvent: false,
    eventStartDate: null,
    eventEndDate: null,
    eventTag: "",
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentDate = new Date();
  const minEndDate = formData.eventStartDate ? new Date(formData.eventStartDate.getTime() + 2 * 24 * 60 * 60 * 1000) : null;

  // Handle text/number/checkbox input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "stock" || name === "originalPrice" || name === "discountPrice" ? Number(value) || "" : newValue,
    }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle date changes
  const handleDateChange = (name, date) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ file, preview: reader.result });
          reader.readAsDataURL(file);
        }),
    );

    Promise.all(readers).then((results) => {
      setImagePreviews((prev) => [...prev, ...results.map((r) => r.preview)]);

      setImages((prev) => [...prev, ...results.map((r) => r.file)]);

      setErrors((prev) => ({ ...prev, images: "" }));
    });

    e.target.value = null;
  };

  // Drag and drop reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedPreviews = Array.from(imagePreviews);
    const [movedPreview] = reorderedPreviews.splice(result.source.index, 1);
    reorderedPreviews.splice(result.destination.index, 0, movedPreview);
    setImagePreviews(reorderedPreviews);

    const reorderedFiles = Array.from(images);
    const [movedFile] = reorderedFiles.splice(result.source.index, 1);
    reorderedFiles.splice(result.destination.index, 0, movedFile);
    setImages(reorderedFiles);
  };

  // Remove image
  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.originalPrice || Number(formData.originalPrice) <= 0) {
      newErrors.originalPrice = "Original price must be greater than 0";
    }
    if (!formData.stock || Number(formData.stock) < 0) {
      newErrors.stock = "Valid stock quantity is required";
    }
    if (images.length === 0) newErrors.images = "At least one image is required";

    // Event-validation
    if (formData.isEvent) {
      if (!formData.discountPrice || Number(formData.discountPrice) <= 0) {
        newErrors.discountPrice = "Discount price is required and must be > 0 for events";
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
      toast.warn("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    // Convert files to base64 for backend
    const base64Images = await Promise.all(
      images.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          }),
      ),
    );

    const payload = {
      shopId: seller._id,
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      originalPrice: Number(formData.originalPrice),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
      stock: Number(formData.stock),
      images: base64Images,
      isEvent: formData.isEvent,
      eventStartDate: formData.eventStartDate ? formData.eventStartDate.toISOString() : null,
      eventEndDate: formData.eventEndDate ? formData.eventEndDate.toISOString() : null,
      eventTag: formData.eventTag.trim() || null,
    };
    try {
      await dispatch(createProduct(payload)).unwrap();
      toast.success("Product created successfully!");

      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        originalPrice: "",
        discountPrice: "",
        stock: "",
        isEvent: false,
        eventStartDate: null,
        eventEndDate: null,
        eventTag: "",
      });
      setImages([]);
      setImagePreviews([]);
      setErrors({});

      dispatch(getAllProducts());
    } catch (error) {
      toast.error(error.message || "Failed to create product");
      console.error("Create product error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full ">
      <div className="fixed top-[60px] left-0 right-0 z-10">
        <div className="max-w-screen-4xl mx-auto px-1 lg:px-6 py-1">
          <div className="lg:ml-[284px]">
            <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 rounded-t-xl px-4 lg:px-6 pt-2">
              <h1 className=" flex items-center justify-center font-medium text-xl lg:text-2xl 800px:font-[600] text-black py-3">
                Create Product
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto min-h-0 pt-[70px] pb-8 px-2 lg:px-4 ">
        <form onSubmit={handleSubmit} className="space-y-8 bg-white">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe your product in detail..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.description && <p className="mt-1.5 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
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
            {errors.category && <p className="mt-1.5 text-sm text-red-600">{errors.category}</p>}
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Available stock"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                errors.stock ? "border-red-500" : "border-gray-300"
              }`}
              min="0"
            />
            {errors.stock && <p className="mt-1.5 text-sm text-red-600">{errors.stock}</p>}
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Product Images <span className="text-red-500">*</span>
            </label>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="images" direction="horizontal">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-wrap gap-4 mt-3">
                    {imagePreviews.map((preview, index) => (
                      <Draggable key={index} draggableId={`img-${index}`} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm group"
                          >
                            <img src={preview} alt={`preview-${index}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full opacity-100 group-hover:opacity-200 transition"
                            >
                              <MdDeleteForever size={20} />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}

                    <label className="w-24 h-24 sm:w-32 sm:h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50/30 transition cursor-pointer">
                      <AiOutlinePlusCircle size={32} className="text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Add Images</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                    </label>

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {errors.images && <p className="mt-2 text-sm text-red-600">{errors.images}</p>}
          </div>

          {/* Submit */}
          <div className="pt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full py-3.5 px-6 rounded-xl font-medium text-white transition-all
                flex items-center justify-center gap-2
                ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md hover:shadow-lg"}
              `}
            >
              {isSubmitting ? "Creating Product..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
