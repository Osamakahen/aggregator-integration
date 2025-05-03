import React from 'react';
import { motion } from 'framer-motion';
import { FaGamepad, FaWallet, FaExchangeAlt, FaChartLine, FaShoppingCart, FaGlobe } from 'react-icons/fa';

interface Category {
  id: string;
  name: string;
  icon: keyof typeof categoryIcons;
}

const categoryIcons = {
  games: FaGamepad,
  defi: FaWallet,
  exchange: FaExchangeAlt,
  trading: FaChartLine,
  marketplace: FaShoppingCart,
  social: FaGlobe,
};

interface CategoryGridProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function CategoryGrid({ categories, selectedCategory, onSelectCategory }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <motion.button
        onClick={() => onSelectCategory(null)}
        className={`
          flex flex-col items-center justify-center p-4 rounded-xl
          ${selectedCategory === null
            ? 'bg-[#FFC107] text-[#1E1E1E]'
            : 'bg-[#2A2A2A] text-gray-400 hover:bg-[#3A3A3A]'
          }
          transition-colors duration-200
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <FaGlobe className="w-6 h-6 mb-2" />
        <span className="text-sm font-medium">All Apps</span>
      </motion.button>

      {categories.map((category) => {
        const Icon = categoryIcons[category.icon];
        return (
          <motion.button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`
              flex flex-col items-center justify-center p-4 rounded-xl
              ${selectedCategory === category.id
                ? 'bg-[#FFC107] text-[#1E1E1E]'
                : 'bg-[#2A2A2A] text-gray-400 hover:bg-[#3A3A3A]'
              }
              transition-colors duration-200
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">{category.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
} 