import { motion } from "framer-motion";

function LoadingSpinner({ size = "lg", color = "sky", fullPage = false }) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  };

  const colorClasses = {
    sky: "text-sky-600",
    purple: "text-purple-600",
    emerald: "text-emerald-600",
    orange: "text-orange-600",
  };

  const spinnerVariants = {
    spin: {
      rotate: 360,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.5, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
      },
    },
  };

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-12">
          <motion.div
            className={`${sizeClasses[size]} ${colorClasses[color]} mx-auto`}
            variants={spinnerVariants}
            animate="spin"
          >
            <svg
              className="w-full h-full"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                opacity={0.2}
              />
              <path d="M12 2A10 10 0 0 1 12 22" strokeLinecap="round" />
            </svg>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className={`${sizeClasses[size]} ${colorClasses[color]}`}
        variants={spinnerVariants}
        animate="spin"
      >
        <svg
          className="w-full h-full"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" opacity={0.2} />
          <path d="M12 2A10 10 0 0 1 12 22" strokeLinecap="round" />
        </svg>
      </motion.div>
      <motion.p
        className="text-slate-600 text-sm font-medium"
        variants={pulseVariants}
        animate="pulse"
      >
        Loading...
      </motion.p>
    </div>
  );
}

export default LoadingSpinner;
