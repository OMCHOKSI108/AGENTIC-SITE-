import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AiOutlineSun, AiOutlineMoon, AiOutlineUser, AiOutlineSetting, AiOutlineCreditCard, AiOutlineLogout, AiOutlineCaretDown } from 'react-icons/ai';
import Button from '../ui/Button.jsx';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  // Close profile menu on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [profileMenuOpen]);

  return (
    <motion.header
      className="bg-[var(--surface)] shadow-lg border-b border-[var(--muted)]"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-[var(--text)]">
                Agentic
              </span>
            </Link>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-[var(--text)] hover:text-primary transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/agents"
              className="text-[var(--text)] hover:text-primary transition-colors duration-200"
            >
              Agents
            </Link>
          </nav>

          {/* Theme Toggle & Auth */}
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[var(--muted)] text-[var(--text)] hover:bg-[var(--primary)] hover:bg-opacity-20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-pressed={theme === 'dark'}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <AiOutlineSun className="w-5 h-5" aria-hidden="true" />
              ) : (
                <AiOutlineMoon className="w-5 h-5" aria-hidden="true" />
              )}
            </motion.button>

            {isAuthenticated() ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[var(--muted)] hover:bg-opacity-20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="true"
                >
                  <AiOutlineUser className="w-6 h-6 text-[var(--text)]" aria-hidden="true" />
                  <span className="text-[var(--text)] font-medium">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <AiOutlineCaretDown className="w-4 h-4 text-[var(--text)]" aria-hidden="true" />
                </button>

                {/* Profile Dropdown */}
                {profileMenuOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-48 bg-[var(--surface)] rounded-lg shadow-lg border border-[var(--muted)] py-1 z-50"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--muted)] hover:bg-opacity-20"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <AiOutlineUser className="w-4 h-4 mr-3" aria-hidden="true" />
                      Profile
                    </Link>
                    <Link
                      to="/api-keys"
                      className="flex items-center px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--muted)] hover:bg-opacity-20"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <AiOutlineSetting className="w-4 h-4 mr-3" aria-hidden="true" />
                      API Keys
                    </Link>
                    <Link
                      to="/billing"
                      className="flex items-center px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--muted)] hover:bg-opacity-20"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <AiOutlineCreditCard className="w-4 h-4 mr-3" aria-hidden="true" />
                      Billing
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--muted)] hover:bg-opacity-20"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <AiOutlineSetting className="w-4 h-4 mr-3" aria-hidden="true" />
                      Settings
                    </Link>
                    <hr className="my-1 border-[var(--muted)]" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setProfileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--muted)] hover:bg-opacity-20"
                    >
                      <AiOutlineLogout className="w-4 h-4 mr-3" aria-hidden="true" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;