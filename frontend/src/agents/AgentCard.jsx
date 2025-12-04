import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AiOutlineLock } from 'react-icons/ai';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';

const AgentCard = ({ agent, index, isAuthenticated = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    window.open(`/agents/${agent.slug}/run`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card
        className="h-full p-6 relative overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex flex-col h-full">
          {/* Agent Icon */}
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">
              {agent.name.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Agent Info */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[var(--text)] mb-2">
              {agent.name}
            </h3>
            <p className="text-[var(--text)] text-sm mb-4 line-clamp-3">
              {agent.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {agent.tags?.slice(0, 3).map((tag, tagIndex) => (
                <motion.span
                  key={tag}
                  className="px-2 py-1 bg-[var(--surface)] text-[var(--text)] text-xs rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: (index * 0.1) + (tagIndex * 0.05) }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <Button
            variant="outline"
            className="w-full mt-auto"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            Run Agent
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default AgentCard;