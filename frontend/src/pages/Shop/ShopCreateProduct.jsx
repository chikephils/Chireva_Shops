import React from "react";
import CreateProduct from "../../components/Shop/CreateProduct";

const ShopCreateProduct = () => {
  return (
    <>
      <div className="w-full fixed lg:w-[70%] xl:w-[75%] left-0 right-0 mx-auto lg:left-auto lg:right-auto ml-0 lg:ml-[26%] xl:ml-[21%] bg-gray-50 rounded-xl shadow-lg  h-[calc(100%-80px)] ">
        <CreateProduct />
      </div>
    </>
  );
};

export default ShopCreateProduct;
