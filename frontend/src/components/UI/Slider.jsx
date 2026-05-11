import React, { useEffect, useState } from "react";
import { sliderData } from "../../static/data";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import styles from "../../styles/styles";
import { Link } from "react-router-dom";

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === sliderData.length - 1 ? 0 : prevSlide + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? sliderData.length - 1 : prevSlide - 1
    );
  };

  useEffect(() => {
    const autoScroll = setInterval(nextSlide, 5000);

    return () => clearInterval(autoScroll);
  }, []);

  return (
    <div className="relative overflow-hidden bg-black w-full h-[85vh] rounded-md">
      <AiOutlineArrowLeft
        className="border-2 border-green-500 rounded-full bg-transparent text-green-400 w-10 h-10 cursor-pointer absolute top-1/2 transform -translate-y-1/2 z-20 left-2 hover:bg-slate-200"
        onClick={prevSlide}
      />
      <AiOutlineArrowRight
        className="border-2 border-green-500 rounded-full bg-transparent text-green-400 w-10 h-10 cursor-pointer absolute top-1/2 transform -translate-y-1/2 z-20 right-3 hover:bg-slate-200"
        onClick={nextSlide}
      />

      {sliderData.map((slide, index) => {
        const { image, heading, desc } = slide;
        const isCurrentSlide = index === currentSlide;

        return (
          <div
            key={index}
            className={`absolute top-0 left-0 w-full h-full transform ${
              isCurrentSlide ? "translate-x-0" : "translate-x-full"
            } transition-transform duration-500 ease-in-out`}
          >
            {isCurrentSlide && (
              <>
                <img
                  src={image}
                  alt=""
                  className="w-full h-full object-cover rounded-md"
                />
                <div className="absolute p-3 top-1/2 left-1/2 w-1/2 flex flex-col items-center text-center justify-center transform -translate-x-1/2 -translate-y-1/2 text-white bg-opacity-40 bg-black rounded-lg">
                  <h2 className="text-2xl md:text-5xl mb-4">{heading}</h2>
                  <p className=" text-sm md:text-base mb-4">{desc}</p>
                  <Link to={"/products"} className={`${styles.button} !w-max p-3`}>
                    Shop Now
                  </Link>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Slider;
