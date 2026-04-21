import { motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import { useState } from "react";

function Accordion({ items, defaultOpen = 0 }) {
  const [openIndex, setOpenIndex] = useState(defaultOpen);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-2"
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="border border-slate-200 rounded-lg overflow-hidden hover:border-sky-300 transition-colors"
        >
          <motion.button
            onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-sky-50/50 transition-colors"
          >
            <span className="font-semibold text-slate-900 text-left">
              {item.title}
            </span>
            <motion.div
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <FaChevronDown className="w-5 h-5 text-slate-600" />
            </motion.div>
          </motion.button>

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: openIndex === index ? "auto" : 0,
              opacity: openIndex === index ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 bg-sky-50/30 border-t border-slate-200 text-slate-700">
              {item.content}
            </div>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default Accordion;
