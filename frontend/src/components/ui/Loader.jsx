import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({
  size = 'md',
  color = 'primary',
  className = '',
  text = 'Loading...'
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colors = {
    primary: 'border-primary',
    white: 'border-white',
    dark: 'border-dark-gray',
  };

  return (
    <motion.div
      className={`flex flex-col items-center justify-center space-y-3 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`${sizes[size]} border-2 ${colors[color]} border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {text && (
        <motion.p
          className="text-sm text-dark-gray dark:text-light-gray"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
};

export default Loader;