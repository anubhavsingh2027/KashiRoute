import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";

function Toast({
  type = "info", // success, error, warning, info
  message,
  onClose,
  autoClose = true,
  duration = 4000,
}) {
  // Auto close toast
  if (autoClose && onClose) {
    setTimeout(() => onClose(), duration);
  }

  const typeConfig = {
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: <FaCheckCircle className="w-5 h-5 text-emerald-600" />,
      text: "text-emerald-800",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: <FaExclamationCircle className="w-5 h-5 text-red-600" />,
      text: "text-red-800",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: <FaExclamationCircle className="w-5 h-5 text-amber-600" />,
      text: "text-amber-800",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: <FaInfoCircle className="w-5 h-5 text-blue-600" />,
      text: "text-blue-800",
    },
  };

  const config = typeConfig[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 20 }}
      className={`${config.bg} ${config.border} border rounded-xl p-4 shadow-lg flex items-start gap-3 min-w-[300px] max-w-[400px]`}
    >
      {config.icon}
      <div className="flex-1">
        <p className={`${config.text} font-medium text-sm`}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`${config.text} opacity-50 hover:opacity-100 transition-opacity`}
        >
          <FaTimes className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

export default Toast;
