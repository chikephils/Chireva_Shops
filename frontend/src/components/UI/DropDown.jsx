import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/styles";

const DropDown = ({ categoriesData, setDropDown, onNavigate }) => {
  const navigate = useNavigate();

  const handleSubmit = (category) => {
    navigate(`/products?category=${encodeURIComponent(category.title)}`);
    setDropDown(false);
    onNavigate();
  };

  return (
    <div className="mt-2.5 py-3  w-[300px] bg-gradient-to-r from-gray-100 to-lime-100 ...  absolute z-50 rounded-xl shadow-2xl border">
      <div className="max-h-[40vh] md:max-h-[70vh] w-full overflow-y-auto scrollbar-hide py-1 ">
        {categoriesData &&
          categoriesData.map((category, index) => (
            <div
              key={index}
              className={`${styles.normalFlex} border-black border-[1px] rounded-md m-1 shadow-xl  p-1 cursor-pointer`}
              onClick={() => handleSubmit(category)}
            >
              <img src={category.image_Url} alt="log" className="w-[50px] h-[50px] object-contain ml-[18px] select-none rounded-full" />
              <h3 className="m-3 cursor-pointer select-none font-medium">{category.title}</h3>
            </div>
          ))}
      </div>
    </div>
  );
};

export default DropDown;
