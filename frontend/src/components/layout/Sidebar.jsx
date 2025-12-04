import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AGENT_CATEGORIES } from '../../utils/constants';

const Sidebar = ({ selectedCategory, onCategoryChange, isOpen, onClose }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-dark-gray shadow-2xl z-50 border-r border-light-gray dark:border-gray-700"
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-dark-gray dark:text-light-gray">
                  Categories
                </h2>
                <button
                  onClick={onClose}
                  className="md:hidden p-2 rounded-lg hover:bg-light-gray dark:hover:bg-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                {AGENT_CATEGORIES.map((category, index) => (
                  <motion.button
                    key={category.value}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                      selectedCategory === category.value
                        ? 'bg-primary text-white shadow-lg'
                        : 'text-dark-gray dark:text-light-gray hover:bg-light-gray dark:hover:bg-gray-700'
                    }`}
                    onClick={() => {
                      onCategoryChange(category.value);
                      onClose();
                    }}
                    onHoverStart={() => setHoveredCategory(category.value)}
                    onHoverEnd={() => setHoveredCategory(null)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {category.label}
                    {hoveredCategory === category.value && (
                      <motion.div
                        className="inline-block ml-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        →
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;