import React from "react";
import styles from "../../../styles/styles";
import { brandingData, categoriesData } from "../../../static/data";
import { useNavigate } from "react-router-dom";

const Categories = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className={`${styles.section} hidden md:block`}>
        <div className={` my-12 flex justify-between w-full shadow-md p-5 rounded-md`}>
          {brandingData &&
            brandingData.map((item, index) => (
              <div className="flex items-start" key={index}>
                {item.icon}
                <div className="px-3">
                  <h3 className="font-bold text-sm md:text-base">{item.title}</h3>
                  <p className="text-xs md-text-sm">{item.Description}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="relative w-full mb-5 mt-4">
        {/* LEFT SHADOW */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent z-10" />

        {/* RIGHT SHADOW */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-10" />

        {/* SCROLL AREA */}
        <div className="overflow-x-auto scrollbar-hide px-4 snap-x snap-mandatory" id="categories">
          <div className="flex gap-4 md:gap-6 w-max p-2">
            {categoriesData &&
              categoriesData.map((category) => {
                const handleClick = () => {
                  navigate(`/products?category=${category.title}`);
                };

                return (
                  <div key={category.id} onClick={handleClick} className="cursor-pointer p-3 bg-slate-200 rounded-3xl shadow-lg snap-start w-[135px] md:w-[150px]">
                    <div className="flex flex-col items-center gap-2 md:gap-4">
                      <img src={category.image_Url} alt={category.title} className="w-[80px] md:w-[100px] md:h-[100px] h-[80px] object-cover rounded-full" />
                      <p className="text-xs md:text-sm font-medium text-center">{category.title}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Categories;
