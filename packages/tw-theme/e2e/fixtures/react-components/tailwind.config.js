/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./App.tsx", 
    "./index.html",
    // Scan the Button component from node_modules
    "./node_modules/@ownui/button/**/*.js",
  ],
};
