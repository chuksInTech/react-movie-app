/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'light-100': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)',
      },
      colors: {
        primary: "#030014",
        light100: "#cecefb",
        light200: "#a8b5db",
        gray100: "#9ca4ab",
        dark100: "#0f0d23",
      },
      fontFamily: {
        dmSans: ["DM Sans", "sans-serif"],
      },
      backgroundImage: {
        "hero-pattern": "url('/hero-bg.png')",
      },
      screens: {
        xs: "480px",
      },
    },
  },
    
  plugins: [],
}

