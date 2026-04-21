import { motion } from "framer-motion";
import { FaSearch, FaFilter } from "react-icons/fa";

function SearchBar({
  placeholder = "Search...",
  onSearch,
  onFilter,
  showFilter = true,
  loading = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="relative flex items-center gap-3">
        <div className="flex-1 relative group">
          <FaSearch className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-sky-500 transition-colors w-4 h-4" />
          <input
            type="text"
            placeholder={placeholder}
            onChange={(e) => onSearch?.(e.target.value)}
            disabled={loading}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 transition-all duration-300 focus:outline-none focus:border-sky-500 focus:shadow-lg focus:shadow-sky-100 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        {showFilter && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onFilter}
            disabled={loading}
            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-sky-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Filters"
          >
            <FaFilter className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default SearchBar;
