import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AiOutlineCloud, AiOutlineLock, AiOutlineWarning } from 'react-icons/ai';
import AgentCard from './AgentCard';
import Loader from '../components/ui/Loader.jsx';
import Button from '../components/ui/Button.jsx';
import { AGENT_CATEGORIES } from '../utils/constants';

const AgentList = ({ agents, loading, error, isAuthenticated = false }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Filter agents based on category and search
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesCategory = selectedCategory === 'All' || agent.category === selectedCategory;
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [agents, selectedCategory, searchTerm]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Loader size="lg" text="Loading agents..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AiOutlineWarning className="w-16 h-16 mx-auto mb-4 text-red-500" aria-hidden="true" />
        <div className="text-red-500 text-lg mb-4">Error loading agents</div>
        <p className="text-dark-gray dark:text-light-gray">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search */}
      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <input
          type="text"
          placeholder="Search agents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-[var(--muted)] rounded-lg bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </motion.div>

      {/* Category Filter */}
      <motion.div
        className="flex flex-wrap justify-center gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {AGENT_CATEGORIES.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === category.value
                ? 'bg-primary text-white shadow-lg transform scale-105'
                : 'bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--muted)]/20 border border-[var(--muted)]'
            }`}
          >
            {category.label}
          </button>
        ))}
      </motion.div>

      {/* Results Count */}
      <motion.div
        className="text-center text-[var(--text)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} available
      </motion.div>

      {/* Agent Grid */}
      {filteredAgents.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {filteredAgents.map((agent, index) => (
            <AgentCard key={agent.id} agent={agent} index={index} isAuthenticated={isAuthenticated} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <AiOutlineCloud className="w-16 h-16 mx-auto mb-4 text-primary" aria-hidden="true" />
          <h3 className="text-xl font-bold text-[var(--text)] mb-2">
            No agents found
          </h3>
          <p className="text-[var(--text)]">
            Try adjusting your search or category filter.
          </p>
        </motion.div>
      )}

      {/* SaaS-Style Sign up CTA */}
      {!isAuthenticated && filteredAgents.length > 0 && (
        <motion.div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-orange-500/5 to-primary/10 border border-primary/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
          <div className="relative p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-6">
              <AiOutlineLock className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--text)] mb-4">
              Unlock the Full Power of AI Agents
            </h3>
            <p className="text-lg text-[var(--text)] mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of users who are already leveraging our AI agents for content creation,
              data analysis, automation, and more. Sign up now to run agents, save your work,
              and access premium features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/signup')}
                className="px-8 py-3 text-lg font-semibold hover:scale-105 transition-transform"
              >
                Sign up for free 
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
                className="px-8 py-3 text-lg"
              >
                Sign In
              </Button>
            </div>
            <p className="text-sm text-[var(--muted)] mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AgentList;