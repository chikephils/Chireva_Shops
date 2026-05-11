import React, { useEffect, useState } from "react";
import { AiOutlineEye, AiOutlineEdit } from "react-icons/ai";
import SellerProductCardDetails from "../ProductCardDetails/SellerProductCardDetails";
import Ratings from "../../ProductDetails/Ratings";
import { numbersWithCommas } from "../../../utils/priceDisplay";
import { Link } from "react-router-dom";
import { FaFire } from "react-icons/fa";

const SellerProductCard = ({ product }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const editedPrice = numbersWithCommas(product?.originalPrice);
  const editedDiscountPrice = numbersWithCommas(product?.discountPrice);

  // Check if event is currently active
  const isEventActive =
    product?.isEvent &&
    product?.eventStartDate &&
    product?.eventEndDate &&
    new Date() >= new Date(product.eventStartDate) &&
    new Date() <= new Date(product.eventEndDate);

  useEffect(() => {}, [product]);

  return (
    <div
      className={`
        xs:w-full md:min-w-[185px] md:w-full
        min-h-[200px] md:min-h-[280px] 800px:w-full
        bg-gradient-to-br from-gray-50 to-blue-50 
        rounded-lg shadow-md border border-gray-200
        p-2 800px:p-2 overflow-hidden flex flex-col
        hover:shadow-lg hover:border-blue-300 transition-all duration-200
      `}
    >
      <div className="flex items-start justify-between">
        <div className="relative w-full">
          <img
            src={product.images?.[0]?.url}
            alt={product.name || "product"}
            className="
              w-full max-w-[70px] md:min-w-[100px] 800px:min-w-[150px] 
              h-[70px] md:min-h-[100px] 800px:min-h-[150px] 
              object-contain mx-auto
            "
          />

          {/* stock status*/}
          {product?.stock < 1 && (
            <span className="absolute top-1 left-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">OUT OF STOCK</span>
          )}
          {product?.stock > 0 && product?.stock <= 5 && (
            <span className="absolute top-1 left-1 bg-amber-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">LOW STOCK</span>
          )}
        </div>

        {/* quick view icon */}
        <div className="flex flex-col items-end gap-2">
          <AiOutlineEye
            size={20}
            className="cursor-pointer text-gray-700 hover:text-blue-600 transition-colors"
            onClick={() => setDetailsOpen(!detailsOpen)}
            title="Quick view / Edit preview"
          />

          {/*  edit icon hint */}
          <Link to={`/dashboard/edit-product/${product?._id}`}>
            <AiOutlineEdit
              size={20}
              className="cursor-pointer text-black hover:text-indigo-600 transition-colors opacity-70"
              title="Edit product"
            />
          </Link>

          {product?.isEvent && isEventActive && <FaFire size={22} className="text-orange-500" title="Product on Promo" />}

          {detailsOpen && <SellerProductCardDetails setDetailsOpen={setDetailsOpen} product={product} />}
        </div>
      </div>

      <div className="mt-2 flex flex-col flex-grow">
        {/* Shop name */}
        <h5 className="text-blue-700 text-[12px] 800px:text-base font-medium">{product.shop?.shopName || "Your Shop"}</h5>

        {/* Product name */}
        <h4 className="mt-1 text-gray-900 text-[14px] 800px:text-[15px] font-semibold line-clamp-1">{product.name}</h4>

        <div className="mt-1.5 flex items-center">
          <Ratings rating={product?.ratings || 0} />
        </div>

        <div className="mt-2 flex justify-between items-end flex-grow">
          {/* Price area */}
          <div>
            <div>
              {product?.isEvent && isEventActive && product?.discountPrice ? (
                <>
                  <p className="text[14px] md:text-base font-medium text-indigo-700">₦ {editedDiscountPrice}</p>
                  <p className="text-[12px] md:text-[14px] font-medium text-gray-500 line-through">₦ {editedPrice}</p>
                </>
              ) : product?.isEvent && !isEventActive && product?.discountPrice ? (
                <>
                  <p className="text-[14px] md:text-base font-medium text-black">₦ {editedPrice}</p>
                  <p className="text-[12px] md:text-[14px] font-medium text-indigo-500 line-through">₦ {editedDiscountPrice}</p>
                </>
              ) : (
                <p className="text-[14px] md:text-base font-medium text-black">₦ {editedPrice}</p>
              )}
            </div>
          </div>

          {/* Sold / stock info*/}
          <div className="text-right">
            <div className="text-sm font-semibold text-teal-700">{product?.sold_out || 0} sold</div>

            <div className={`text-xs font-medium mt-0.5 ${product?.stock < 1 ? "text-red-600" : "text-gray-700"}`}>
              Stock: {product?.stock || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProductCard;
