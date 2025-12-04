import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  className = '',
  as = 'input',
  ...props
}) => {
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (as === 'textarea' && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value, as]);

  const handleTextareaChange = (e) => {
    onChange(e);
    // Auto-resize after change
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    }, 0);
  };

  return (
    <motion.div
      className={`space-y-1 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {label && (
        <label className="block text-sm font-medium text-[var(--text)]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {as === 'textarea' ? (
        <motion.textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={value}
          onChange={handleTextareaChange}
          className={`w-full px-4 py-3 border border-[var(--muted)] rounded-lg bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none min-h-[3rem] max-h-96 overflow-y-auto ${
            error ? 'border-red-500 focus:ring-red-500' : ''
          }`}
          whileFocus={{ scale: 1.01 }}
          {...props}
        />
      ) : (
        <motion.input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-3 border border-[var(--muted)] rounded-lg bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
            error ? 'border-red-500 focus:ring-red-500' : ''
          }`}
          whileFocus={{ scale: 1.01 }}
          {...props}
        />
      )}
      {error && (
        <motion.p
          className="text-sm text-red-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default Input;