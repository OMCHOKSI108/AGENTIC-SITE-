import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CpuChipIcon,
  StarIcon,
  UserGroupIcon,
  BoltIcon,
  LockClosedIcon,
  CodeBracketIcon,
  CloudIcon,
  ServerIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CogIcon,
  GlobeAltIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import AgentRunPanel from '../agents/AgentRunPanel';
import Button from '../components/ui/Button.jsx';
import Loader from '../components/ui/Loader.jsx';
import { useAgent, useRunAgent } from '../hooks/useAgentApi';
import { useAuth } from '../context/AuthContext';

const AgentDetails = () => {
  const { slug } = useParams();
  const { agent, loading: agentLoading, error: agentError } = useAgent(slug);
  const { runAgent, running, result, error: runError } = useRunAgent();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleRun = async (data) => {
    return await runAgent(slug, data);
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryDisplay = (category) => {
    const categories = {
      content: 'Content Creation',
      data: 'Data & Analytics',
      productivity: 'Productivity',
      devtools: 'Developer Tools',
      marketing: 'Marketing',
      creative: 'Creative',
      finance: 'Finance',
      enterprise: 'Enterprise',
      automation: 'Automation',
      career: 'Career',
      design: 'Design',
      assistant: 'Assistant'
    };
    return categories[category] || category;
  };

  if (agentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Loader size="lg" text="Loading agent details..." />
      </div>
    );
  }

  if (agentError || !agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <CpuChipIcon className="w-24 h-24 mx-auto mb-4 text-primary" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
            Agent Not Found
          </h2>
          <p className="text-[var(--text)] mb-6">
            The agent you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/agents">
            <Button>Back to Agents</Button>
          </Link>
        </div>
      </div>
    );
  }

  // If not authenticated, show preview page
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <motion.nav
            className="mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              to="/agents"
              className="text-primary hover:text-orange-600 transition-colors"
            >
              ← Back to Agents
            </Link>
          </motion.nav>

          {/* Agent Preview Header */}
          <motion.div
            className="bg-[var(--surface)] rounded-xl shadow-lg p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-4xl">
                  {agent.name.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-4xl font-bold text-[var(--text)]">
                    {agent.name}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(agent.notes?.complexity_estimate)}`}>
                    {agent.notes?.complexity_estimate?.toUpperCase() || 'MEDIUM'}
                  </span>
                </div>
                <p className="text-[var(--text)] text-lg mb-6">
                  {agent.description}
                </p>

                {/* Category & Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {getCategoryDisplay(agent.category)}
                  </span>
                  {agent.tags?.map((tag, index) => (
                    <motion.span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-[var(--text)] rounded-full text-sm font-medium"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex gap-6 text-sm text-[var(--text)]">
                  <span className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4" aria-hidden="true" />
                    {agent.rating || '4.8'} rating
                  </span>
                  <span className="flex items-center gap-1">
                    <UserGroupIcon className="w-4 h-4" aria-hidden="true" />
                    {agent.usageCount || '1.2k'} uses
                  </span>
                  <span className="flex items-center gap-1">
                    <BoltIcon className="w-4 h-4" aria-hidden="true" />
                    {agent.responseTime || '< 2s'} response
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Documentation Tabs */}
          <motion.div
            className="bg-[var(--surface)] rounded-xl shadow-lg mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="border-b border-[var(--muted)]">
              <nav className="flex">
                {['overview', 'specifications', 'examples'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-primary text-primary'
                        : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-8">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text)] mb-4">What This Agent Does</h3>
                    <p className="text-[var(--text)] leading-relaxed">
                      {agent.ui_card?.short || agent.description}
                    </p>
                  </div>

                  {agent.ui_card?.inputs && agent.ui_card.inputs.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-[var(--text)] mb-3">Inputs Required</h4>
                      <div className="grid gap-3">
                        {agent.ui_card.inputs.map((input, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-lg">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-[var(--text)]">
                              <strong>{input.name}</strong> ({input.type})
                              {input.required && <span className="text-red-500 ml-1">*</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {agent.ui_card?.outputs && agent.ui_card.outputs.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-[var(--text)] mb-3">Outputs Provided</h4>
                      <div className="grid gap-3">
                        {agent.ui_card.outputs.map((output, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-[var(--text)]">
                              <strong>{output.type.toUpperCase()}</strong>
                              {output.preview && <span className="text-primary ml-2">Preview Available</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
                        <WrenchScrewdriverIcon className="w-5 h-5" />
                        Tooling Requirements
                      </h4>
                      <div className="space-y-2">
                        {agent.tooling?.tools_required?.llm && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            <span>LLM: {agent.tooling.tools_required.llm.join(', ')}</span>
                          </div>
                        )}
                        {agent.tooling?.tools_required?.storage && (
                          <div className="flex items-center gap-2 text-sm">
                            <CloudIcon className="w-4 h-4 text-blue-500" />
                            <span>Storage: {agent.tooling.tools_required.storage.join(', ')}</span>
                          </div>
                        )}
                        {agent.tooling?.tools_required?.external_api && (
                          <div className="flex items-center gap-2 text-sm">
                            <GlobeAltIcon className="w-4 h-4 text-purple-500" />
                            <span>APIs: {agent.tooling.tools_required.external_api.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
                        <ShieldCheckIcon className="w-5 h-5" />
                        Security & Permissions
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <KeyIcon className="w-4 h-4 text-orange-500" />
                          <span>Authentication: {agent.security?.auth_required ? 'Required' : 'Not Required'}</span>
                        </div>
                        {agent.security?.rate_limit_per_min && (
                          <div className="flex items-center gap-2 text-sm">
                            <ClockIcon className="w-4 h-4 text-yellow-500" />
                            <span>Rate Limit: {agent.security.rate_limit_per_min} requests/min</span>
                          </div>
                        )}
                        {agent.persistence?.save_results && (
                          <div className="flex items-center gap-2 text-sm">
                            <ServerIcon className="w-4 h-4 text-green-500" />
                            <span>Results Saved: {agent.persistence.retention_days} days</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {agent.notes?.extra_steps && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-start gap-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Additional Requirements</h5>
                          <p className="text-yellow-700 dark:text-yellow-300 text-sm">{agent.notes.extra_steps}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'examples' && (
                <div className="space-y-6">
                  {agent.sample_prompt ? (
                    <div>
                      <h4 className="text-lg font-semibold text-[var(--text)] mb-3">Sample Prompt</h4>
                      <div className="bg-[var(--bg)] p-4 rounded-lg border border-[var(--muted)]">
                        <pre className="text-sm text-[var(--text)] whitespace-pre-wrap font-mono">
                          {agent.sample_prompt}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-[var(--muted)]" />
                      <p className="text-[var(--muted)]">Sample prompts and examples coming soon.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* SaaS Style Preview */}
          <motion.div
            className="bg-[var(--surface)] rounded-xl shadow-lg p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary to-orange-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-6xl">
                  {agent.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
                Ready to Use {agent.name}?
              </h2>
              <p className="text-[var(--text)] mb-8 max-w-2xl mx-auto">
                Sign in to access this powerful AI agent and start automating your workflow.
                Join thousands of users who are already benefiting from our AI platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/signup')}
                  className="hover:scale-105 transition-transform"
                >
                  <LockClosedIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                  Sign Up Free
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </div>
              <p className="text-sm text-[var(--muted)] mt-6">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Authenticated user view
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.nav
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            to="/agents"
            className="text-primary hover:text-orange-600 transition-colors"
          >
            ← Back to Agents
          </Link>
        </motion.nav>

        {/* Agent Header */}
        <motion.div
          className="bg-[var(--surface)] rounded-xl shadow-lg p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-2xl">
                {agent.name.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-[var(--text)]">
                  {agent.name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(agent.notes?.complexity_estimate)}`}>
                  {agent.notes?.complexity_estimate?.toUpperCase() || 'MEDIUM'}
                </span>
              </div>
              <p className="text-[var(--text)] text-lg mb-4">
                {agent.description}
              </p>

              {/* Category & Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {getCategoryDisplay(agent.category)}
                </span>
                {agent.tags?.map((tag, index) => (
                  <motion.span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-[var(--text)] rounded-full text-sm font-medium"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex gap-6 text-sm text-[var(--text)]">
                <span className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4" aria-hidden="true" />
                  {agent.rating || '4.8'} rating
                </span>
                <span className="flex items-center gap-1">
                  <UserGroupIcon className="w-4 h-4" aria-hidden="true" />
                  {agent.usageCount || '1.2k'} uses
                </span>
                <span className="flex items-center gap-1">
                  <BoltIcon className="w-4 h-4" aria-hidden="true" />
                  {agent.responseTime || '< 2s'} response
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Documentation Tabs */}
        <motion.div
          className="bg-[var(--surface)] rounded-xl shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="border-b border-[var(--muted)]">
            <nav className="flex">
              {['overview', 'specifications', 'examples', 'run'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[var(--text)] mb-4">What This Agent Does</h3>
                  <p className="text-[var(--text)] leading-relaxed">
                    {agent.ui_card?.short || agent.description}
                  </p>
                </div>

                {agent.ui_card?.inputs && agent.ui_card.inputs.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--text)] mb-3">Inputs Required</h4>
                    <div className="grid gap-3">
                      {agent.ui_card.inputs.map((input, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-lg">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-[var(--text)]">
                            <strong>{input.name}</strong> ({input.type})
                            {input.required && <span className="text-red-500 ml-1">*</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {agent.ui_card?.outputs && agent.ui_card.outputs.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--text)] mb-3">Outputs Provided</h4>
                    <div className="grid gap-3">
                      {agent.ui_card.outputs.map((output, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-[var(--text)]">
                            <strong>{output.type.toUpperCase()}</strong>
                            {output.preview && <span className="text-primary ml-2">Preview Available</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
                      <WrenchScrewdriverIcon className="w-5 h-5" />
                      Tooling Requirements
                    </h4>
                    <div className="space-y-2">
                      {agent.tooling?.tools_required?.llm && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          <span>LLM: {agent.tooling.tools_required.llm.join(', ')}</span>
                        </div>
                      )}
                      {agent.tooling?.tools_required?.storage && (
                        <div className="flex items-center gap-2 text-sm">
                          <CloudIcon className="w-4 h-4 text-blue-500" />
                          <span>Storage: {agent.tooling.tools_required.storage.join(', ')}</span>
                        </div>
                      )}
                      {agent.tooling?.tools_required?.external_api && (
                        <div className="flex items-center gap-2 text-sm">
                          <GlobeAltIcon className="w-4 h-4 text-purple-500" />
                          <span>APIs: {agent.tooling.tools_required.external_api.join(', ')}</span>
                        </div>
                      )}
                      {agent.tooling?.async_workers && (
                        <div className="flex items-center gap-2 text-sm">
                          <ArrowPathIcon className="w-4 h-4 text-orange-500" />
                          <span>Async Workers: Enabled</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
                      <ShieldCheckIcon className="w-5 h-5" />
                      Security & Permissions
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <KeyIcon className="w-4 h-4 text-orange-500" />
                        <span>Authentication: {agent.security?.auth_required ? 'Required' : 'Not Required'}</span>
                      </div>
                      {agent.security?.rate_limit_per_min && (
                        <div className="flex items-center gap-2 text-sm">
                          <ClockIcon className="w-4 h-4 text-yellow-500" />
                          <span>Rate Limit: {agent.security.rate_limit_per_min} requests/min</span>
                        </div>
                      )}
                      {agent.persistence?.save_results && (
                        <div className="flex items-center gap-2 text-sm">
                          <ServerIcon className="w-4 h-4 text-green-500" />
                          <span>Results Saved: {agent.persistence.retention_days} days</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {agent.endpoints?.api && agent.endpoints.api.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
                      <CodeBracketIcon className="w-5 h-5" />
                      API Endpoints
                    </h4>
                    <div className="space-y-2">
                      {agent.endpoints.api.map((endpoint, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-lg">
                          <span className={`px-2 py-1 text-xs font-mono rounded ${endpoint.method === 'POST' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {endpoint.method}
                          </span>
                          <code className="text-sm text-[var(--text)]">{endpoint.route}</code>
                          <span className="text-xs text-[var(--muted)]">({endpoint.auth})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {agent.notes?.extra_steps && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-3">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Additional Requirements</h5>
                        <p className="text-yellow-700 dark:text-yellow-300 text-sm">{agent.notes.extra_steps}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'examples' && (
              <div className="space-y-6">
                {agent.sample_prompt ? (
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--text)] mb-3">Sample Prompt</h4>
                    <div className="bg-[var(--bg)] p-4 rounded-lg border border-[var(--muted)]">
                      <pre className="text-sm text-[var(--text)] whitespace-pre-wrap font-mono">
                        {agent.sample_prompt}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-[var(--muted)]" />
                    <p className="text-[var(--muted)]">Sample prompts and examples coming soon.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'run' && (
              <div>
                <AgentRunPanel
                  agent={agent}
                  onRun={handleRun}
                  running={running}
                  result={result}
                  error={runError}
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AgentDetails;