/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 35px 120px rgba(15, 23, 42, 0.08)",
        glow: "0 0 30px rgba(59, 130, 246, 0.2)",
        "glow-lg": "0 0 50px rgba(59, 130, 246, 0.3)",
        card: "0 10px 30px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 20px 50px rgba(0, 0, 0, 0.12)",
      },
      animation: {
        "bounce-slow": "bounce 2s infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s infinite",
        "fade-in-up": "fadeInUp 0.6s ease-out",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
