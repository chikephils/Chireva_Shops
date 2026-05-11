import React from "react";
import Logo from "../../Assests/img/logo.png";
import { AiFillFacebook, AiFillInstagram, AiFillYoutube, AiOutlineTwitter } from "react-icons/ai";
import { footerProductLinks, footerSupportLinks, footercompanyLinks } from "../../static/data";
import { Link } from "react-router-dom";
import FlutterwaveLogo from "../../Assests/img/Flutterwave-Logo-1.png"

const Footer = () => {
  return (
    <div className=" text-white w-full bg-black">
      <div className=" md:flex md:justify-between md:items-center px-8  md:px-4 bg-lime-600 py-3">
        <h1 className="xl:text-xl text-lg sm:text-xl md:mb-0 mb-6 800px:leading-normal font-semibold md:w-2/5 text-black">
          <span className=" text-white text-xl ">Subscribe</span> <br />
          with us to get news <br />
          events and offers
        </h1>

        <div>
          <input
            type="text"
            required
            placeholder="Enter your Email"
            className="text-gray-800  w-full sm:mr-1 800px:mb-0 py-2.5 rounded px-2 focus:outline-none"
          />
          <button className="bg-blue-700 hover:bg-blue-800 duration-300 px-5 py-2.5 rounded-md text-white  w-full mt-3">Submit</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 px-5 py-4 md:text-center">
        <ul className="px-5 text-center md:text-start flex md:block flex-col items-center">
          <img src={Logo} alt="logo" className=" brightness-0 filter-none invert-1 w-18 h-16" />
          <p>The home of beautiful products</p>
          <div className=" flex items-center mt-[15px]">
            <AiFillFacebook size={25} className=" cursor-pointer" />
            <AiOutlineTwitter size={25} className="ml-[15px] cursor-pointer" />
            <AiFillInstagram size={25} className="ml-[15px] cursor-pointer" />
            <AiFillYoutube size={25} className="ml-[15px] cursor-pointer" />
          </div>
        </ul>

        <ul className="text-center md:text-start">
          <h1 className="mb-1 font-semibold"> Company </h1>
          {footerProductLinks.map((link) => (
            <li key={link.name}>
              <Link to={link.link} className="text-gray-400 hover:text-teal-400 duration-300 text-sm cursor-pointer leading-6">
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="text-center md:text-start">
          <h1 className="mb-1 font-semibold"> Shop </h1>
          {footercompanyLinks.map((link) => (
            <li key={link.name}>
              <Link to={link.link} className="text-gray-400 hover:text-teal-400 duration-300 text-sm cursor-pointer leading-6">
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="text-center md:text-start">
          <h1 className="mb-1 font-semibold"> Support </h1>
          {footerSupportLinks.map((link) => (
            <li key={link.name}>
              <Link to={link.link} className="text-gray-400 hover:text-teal-400 duration-300 text-sm cursor-pointer leading-6">
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-full px-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-16 text-center pt-2 text-gray-400 text-sm pb-8">
        © {new Date().getFullYear()} Chireva. All rights reserved.
        <span>Terms Privacy Policy</span>
        <span>
          <img className="w-[200px]" src={FlutterwaveLogo} alt="img" />
        </span>
      </div>
    </div>
  );
};

export default Footer;
