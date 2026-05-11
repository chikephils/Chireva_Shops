import React from "react";
import styles from "../../../styles/styles";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div
      className={`relative min-h-[20vh] md:min-h-[30vh] 800px:min-h-[30vh] xl:min-h-[50vh] w-full bg-no-repeat bg-cover bg-center z-0 ${styles.normalFlex}`}
      style={{
        backgroundImage:
          "url(https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg)",
      }}
    >
      <div
        className={`${styles.section} w-[90%] 800px:w-[70%] mt-[70px] md:mt-0 800px:mt-0`}
      >
        <h1 className="text-[16px] md:text-[20px] leading-[1,2] 800px:text-[30px] xl:text-[40px] text-gray-800 font-[600] capitalize">
          Best Collection for <br /> Home Decorations
        </h1>
        <p className=" text-[12px] md:text-[14px] 800px:text-[16px] font-[Poppins] font-[400] text-[#000000ba]">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Beatae,
          assumenda? Quisquam itaque <br /> exercitationem labore vel, dolore
          quidem asperiores, laudantium temporibus soluta optio consequatur
          <br /> aliquam deserunt officia. Dolorum saepe nulla provident.
        </p>
        <Link to="/products" className="inline-block">
          <div className={`${styles.sm_button} mt-5`}>
            <span className="text-[#fff] font-[Poppins] text-[12px]">
              Shop Now
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Hero;
