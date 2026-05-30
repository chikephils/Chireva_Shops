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
    <div className=" md:mt-2.5 w-full  md:w-[300px] bg-gradient-to-r from-gray-100 to-lime-100 ...  absolute z-50 border px-0.5 pb-2 rounded-b-2xl">
      <div className="max-h-[70vh] w-full overflow-y-auto scrollbar-hide py-3">
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
