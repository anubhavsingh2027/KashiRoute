import { motion } from "framer-motion";
import { FaStar, FaCheck } from "react-icons/fa";

function Card({
  title,
  description,
  image,
  price,
  rating = 4.5,
  badge,
  onAction,
  actionLabel = "View",
  delay = 0,
  variant = "default", // default, compact, featured
}) {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay,
        ease: "easeOut",
      },
    },
  };

  const imageVariants = {
    default: { scale: 1 },
    hover: { scale: 1.1 },
  };

  if (variant === "compact") {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -5 }}
        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-3"
      >
        <div className="aspect-square overflow-hidden rounded-lg mb-2">
          <motion.img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            whileHover={imageVariants.hover}
            transition={{ duration: 0.3 }}
          />
        </div>
        <h3 className="font-semibold text-sm text-slate-900 line-clamp-1">
          {title}
        </h3>
        <p className="text-xs text-slate-600 line-clamp-1 mb-2">
          {description}
        </p>
        {price && <p className="font-bold text-sky-600">₹{price}</p>}
      </motion.div>
    );
  }

  if (variant === "featured") {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -8 }}
        className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-slate-100/50 group"
      >
        {/* Image */}
        <div className="relative overflow-hidden aspect-[16/9]">
          <motion.img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.15 }}
            transition={{ duration: 0.4 }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>

          {badge && (
            <div className="absolute top-4 right-4 bg-sky-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              {badge}
            </div>
          )}

          {rating && (
            <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full">
              <FaStar className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-slate-900">
                {rating}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors">
            {title}
          </h3>
          <p className="text-slate-600 text-sm line-clamp-2 mb-4">
            {description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {price && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Price</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                  ₹{price}
                </p>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAction}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-sky-200 transition-all"
            >
              {actionLabel}
              <FaCheck className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -8 }}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 border border-slate-100/50 group"
    >
      <div className="aspect-video overflow-hidden rounded-lg mb-3 bg-slate-100">
        <motion.img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          whileHover={imageVariants.hover}
          transition={{ duration: 0.3 }}
        />
      </div>
      <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-sky-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-600 line-clamp-2 mb-3">{description}</p>
      {price && <p className="font-bold text-sky-600 mb-3">₹{price}</p>}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAction}
        className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
      >
        {actionLabel}
      </motion.button>
    </motion.div>
  );
}

export default Card;
