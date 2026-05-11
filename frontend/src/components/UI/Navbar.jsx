import React from "react";
import { navItems } from "../../static/data";
import styles from "../../styles/styles";
import { NavLink } from "react-router-dom";

const Navbar = ({ onNavigate }) => {
  return (
    <div className={`block md:${styles.normalFlex}`}>
      {navItems.map((item, index) => (
        <div className="flex" key={index}>
          <NavLink
            to={item.url}
            onClick={onNavigate}
            className={({ isActive }) => `
              ${isActive ? "text-lime-500" : "text-gray-800"}
              text-[16px] 800px:text-base font-[500]
              px-2 800px:px-4 cursor-pointer
              hover:scale-[1.05]
              ${item.title === "Best Selling" && "Promo-Sales" ? "whitespace-nowrap" : ""}
              mb-5 md:mb-0 md:px-2
            `}
          >
            {item.title}
          </NavLink>
        </div>
      ))}
    </div>
  );
};

export default Navbar;
