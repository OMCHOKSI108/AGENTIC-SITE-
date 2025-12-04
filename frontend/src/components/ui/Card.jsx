import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = true,
  onClick,
  ...props
}) => {
  const baseClasses = 'bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--muted)] overflow-hidden';

  const hoverClasses = hover
    ? 'hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer'
    : '';

  return (
    <motion.div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      whileHover={hover ? { y: -4 } : {}}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;