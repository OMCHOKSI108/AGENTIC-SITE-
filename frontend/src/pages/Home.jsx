import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Target, Shield } from 'lucide-react';
import Button from '../components/ui/Button.jsx';

const Home = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Hero Section */}
      <section className="relative pt-28 pb-20" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold text-[var(--text)] mb-6"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            >
              Welcome to <span className="text-primary">Agentic</span>
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-[var(--muted)] mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Discover and run powerful AI agents that transform your workflow.
              From content creation to data analysis, find the perfect agent for your needs.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link to="/agents">
                <Button size="lg" className="px-8 py-4 w-full sm:w-auto">
                  Explore Agents
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-4 w-full sm:w-auto">
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Subtle Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-16 h-16 bg-primary/3 rounded-full blur-2xl"
          animate={{
            y: [0, -10, 0],
            x: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-24 h-24 bg-gray-600/5 rounded-full blur-2xl"
          animate={{
            y: [0, 10, 0],
            x: [0, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </section>

      {/* Features Section */}
      <section className="py-20" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-[var(--text)] mb-4">
              Powerful AI Agents at Your Fingertips
            </h2>
            <p className="text-xl text-[var(--muted)] max-w-2xl mx-auto">
              Choose from our curated collection of AI agents designed to handle complex tasks efficiently.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Fast & Efficient',
                description: 'Optimized agents that deliver results quickly without compromising quality.',
              },
              {
                icon: Target,
                title: 'Task-Specific',
                description: 'Each agent is specialized for specific use cases, ensuring optimal performance.',
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Your data is processed securely with enterprise-grade privacy protection.',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="text-center p-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-orange-500/20 min-h-[180px] flex flex-col justify-between"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -5, scale: 1.05 }}
              >
                <div>
                  <feature.icon className="w-16 h-16 mx-auto mb-4 text-[var(--text)]" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-[var(--text)] mb-2">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-[var(--muted)]">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-primary mb-4">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl text-[var(--text)] mb-8">
              Join thousands of users who are already leveraging AI agents to boost productivity.
            </p>
            <Link to="/agents">
              <Button
                variant="primary"
                size="lg"
                className="px-8 py-4 hover:scale-105 transition-transform"
              >
                Get Started Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;