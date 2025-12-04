import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AgentList from '../agents/AgentList';
import { useAgents } from '../hooks/useAgentApi';

const Agents = () => {
  const { agents, loading, error } = useAgents();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-light-gray dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-dark-gray dark:text-light-gray mb-4">
            AI Agent Marketplace
          </h1>
          <p className="text-xl text-dark-gray dark:text-light-gray max-w-3xl mx-auto">
            {isAuthenticated()
              ? 'Discover and run powerful AI agents for content creation, data analysis, automation, and more'
              : 'Explore our AI agents - sign in to unlock full functionality and run agents'
            }
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AgentList
            agents={agents}
            loading={loading}
            error={error}
            isAuthenticated={isAuthenticated()}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Agents;