import React from 'react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onHelp?: () => void;
  placeholder?: string;
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onHelp,
  placeholder = 'Search by name, category, or description...',
  isLoading = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full"
    >
      <div className="relative bg-[#2A2A2A] rounded-lg shadow-md overflow-hidden border border-[#3A3A3A] focus-within:border-[#FFC107] transition-colors">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-4 pl-12 bg-[#1E1E1E] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFC107]/30 transition-all"
          disabled={isLoading}
        />
        {/* Search Icon or Loading Spinner */}
        {isLoading ? (
          <motion.div
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <svg
              className="w-5 h-5 text-[#FFC107]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </motion.div>
        ) : (
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#FFC107]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        )}
        {/* Clear Button */}
        {value && !isLoading && (
          <button
            onClick={() => onChange('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:text-[#FFC107]"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        {onHelp && (
          <button
            onClick={onHelp}
            className="absolute right-3 text-gray-400 hover:text-[#FFC107]"
            aria-label="Help"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Search suggestions - to be implemented */}
      <div className="absolute w-full mt-2 bg-[#2A2A2A] rounded-xl border border-[#3A3A3A] shadow-xl hidden">
        {/* Add search suggestions here */}
      </div>
    </motion.div>
  );
};

export default SearchBar; 