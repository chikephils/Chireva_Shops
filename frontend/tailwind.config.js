/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  mode: "jit",

  theme: {
    fontFamily: {
      roboto: ["Roboto", "sans-serif"],
      poppins: ["Poppins", "sans-serif"],
    },

    extend: {
      // Custom Breakpoints
      screens: {
        xs: "320px", // Mobile smallest
        sm: "380px",
        md: "600px",
        lg: "875px",
        xl: "1100px",
        "2xl": "1300px",
        "3xl": "1536px",
        "4xl": "2560px",
        "800px": "800px",
      },

      // Custom Animation
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },

      animation: {
        slideUp: "slideUp 0.4s ease-out forwards",
      },

      colors: {
        primary: "#ef4444",
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
