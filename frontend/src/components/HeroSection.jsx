import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

function HeroSection({
  title,
  subtitle,
  backgroundImage,
  overlayOpacity = 0.6,
  buttons = [],
  stats = [],
  animated = true,
}) {
  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.2, ease: "easeOut" },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.4, ease: "easeOut" },
    },
  };

  const statVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section
      className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60"
        style={{ opacity: overlayOpacity }}
      ></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-sky-500/10 to-purple-500/10 rounded-full blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        ></motion.div>
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-full blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        ></motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        {/* Title */}
        <motion.div
          variants={titleVariants}
          initial={animated ? "hidden" : "visible"}
          animate="visible"
          className="mb-6"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight drop-shadow-lg mb-4">
            {title}
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          variants={subtitleVariants}
          initial={animated ? "hidden" : "visible"}
          animate="visible"
          className="mb-10"
        >
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            {subtitle}
          </p>
        </motion.div>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <motion.div
            variants={statVariants}
            initial={animated ? "hidden" : "visible"}
            animate="visible"
            className="flex flex-wrap justify-center gap-6 mb-12"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="glass-effect px-6 py-3 rounded-full backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
              >
                <div className="text-sm font-semibold">{stat}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Buttons */}
        <motion.div
          variants={buttonVariants}
          initial={animated ? "hidden" : "visible"}
          animate="visible"
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {buttons.map((btn, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={btn.onClick}
              className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 ${
                btn.variant === "secondary"
                  ? "bg-white/10 hover:bg-white/20 border border-white/30 text-white backdrop-blur-sm"
                  : "bg-gradient-to-r from-sky-500 to-blue-600 hover:shadow-lg hover:shadow-sky-400/50 text-white"
              }`}
            >
              {btn.label}
              {btn.icon && <btn.icon className="w-5 h-5" />}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
