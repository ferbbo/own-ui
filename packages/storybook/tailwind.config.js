/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3366FF",
          hover: "#254EDB",
        },
        secondary: {
          DEFAULT: "#E0E0E0",
          hover: "#CCCCCC",
        },
        tertiary: {
          DEFAULT: "transparent",
          text: "#3366FF",
          hover: "#254EDB",
        },
      },
    },
  },
  plugins: [],
};
