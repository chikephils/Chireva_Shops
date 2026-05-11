import { Circles } from "react-loader-spinner";
import Logo from "../../Assests/img/logo.png";

const Loader = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-20 h-20">
        {/* Multiple layered blue glows */}
        <div className="absolute inset-0 bg-blue-500 rounded-3xl blur-2xl opacity-30 animate-pulse" />
        <div className="absolute inset-1 bg-indigo-500 rounded-3xl blur-xl opacity-40 animate-pulse" />

        {/* Gentle rotating subtle ring */}
        <div className="absolute inset-0 border border-blue-400/40 rounded-3xl animate-spin" style={{ animationDuration: "4s" }} />

        {/* Logo with breathing effect */}
        <div
          className="relative flex items-center p-1.5 justify-center w-full h-full 
                      transition-transform duration-700 hover:scale-110"
        >
          <img
            src={Logo}
            alt="Logo"
            className="object-contain rounded-full 
                       drop-shadow-[0_10px_30px_rgb(59,130,246)] 
                       animate-[pulse_2.5s_ease-in-out_infinite]"
          />
        </div>
      </div>

      <p className="text-sm ml-3 font-medium text-indigo-600 animate-pulse tracking-widest">Loading...</p>
    </div>
  );
};

export default Loader;
