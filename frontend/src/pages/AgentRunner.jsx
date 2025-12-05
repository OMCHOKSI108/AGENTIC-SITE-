import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { AiOutlineArrowLeft, AiOutlineCloud, AiOutlineFire } from 'react-icons/ai';
import AgentRunPanel from '../agents/AgentRunPanel';
import N8nArchitectPanel from '../agents/N8nArchitectPanel';
import EDAAgentInterface from '../agents/interfaces/EDAAgentInterface';
import KnowledgeBaseInterface from '../agents/interfaces/KnowledgeBaseInterface';
import DockerizerInterface from '../agents/interfaces/DockerizerInterface';
import YouTubeFinderInterface from '../agents/interfaces/YouTubeFinderInterface';
import SQLGeneratorInterface from '../agents/interfaces/SQLGeneratorInterface';
import CodeFixInterface from '../agents/interfaces/CodeFixInterface';
import FinancialReportInterface from '../agents/interfaces/FinancialReportInterface';
import CryptoSentimentInterface from '../agents/interfaces/CryptoSentimentInterface';
import RegexGeneratorInterface from '../agents/interfaces/RegexGeneratorInterface';
import CloudCostInterface from '../agents/interfaces/CloudCostInterface';
import CICDInterface from '../agents/interfaces/CICDInterface';
import LogAnomalyInterface from '../agents/interfaces/LogAnomalyInterface';
import TerraformInterface from '../agents/interfaces/TerraformInterface';
import TradingBacktesterInterface from '../agents/interfaces/TradingBacktesterInterface';
import APIDocsInterface from '../agents/interfaces/APIDocsInterface';
import ReadmeArchitectInterface from '../agents/interfaces/ReadmeArchitectInterface';
import ContractAuditorInterface from '../agents/interfaces/ContractAuditorInterface';
import MeetingScribeInterface from '../agents/interfaces/MeetingScribeInterface';
import ResumeOptimizerInterface from '../agents/interfaces/ResumeOptimizerInterface';
import EmailComposerInterface from '../agents/interfaces/EmailComposerInterface';
import Button from '../components/ui/Button.jsx';
import Loader from '../components/ui/Loader.jsx';
import { useAgent, useRunAgent } from '../hooks/useAgentApi';
import { useAuth } from '../context/AuthContext';

const AgentRunner = () => {
  const { slug } = useParams();
  const { agent, loading: agentLoading, error: agentError } = useAgent(slug);
  const { runAgent, running, result, error: runError } = useRunAgent();
  const { isAuthenticated } = useAuth();

  const handleRun = async (data) => {
    return await runAgent(slug, data);
  };

  const goBack = () => {
    window.close(); // Close this tab/window
  };

  if (agentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Loader size="lg" text="Loading agent..." />
      </div>
    );
  }

  if (agentError || !agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <AiOutlineCloud className="w-24 h-24 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
            Agent Not Found
          </h2>
          <p className="text-[var(--text)] mb-6">
            The agent you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={goBack}>
            Close Window
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <AiOutlineFire className="w-24 h-24 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
            Authentication Required
          </h2>
          <p className="text-[var(--text)] mb-6">
            Please sign in to run this AI agent.
          </p>
          <div className="space-y-4">
            <Button onClick={() => window.open('/login', '_blank')}>
              Sign In
            </Button>
            <br />
            <Button variant="outline" onClick={goBack}>
              Close Window
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={goBack}
              className="flex items-center gap-2"
            >
              <AiOutlineArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[var(--text)]">
                {agent.name} Runner
              </h1>
              <p className="text-[var(--text)] opacity-80">
                Dedicated AI Agent Execution Environment
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[var(--muted)]">
              Agent ID: {agent.slug}
            </div>
            <div className="text-sm text-[var(--muted)]">
              Status: {running ? 'Running' : 'Ready'}
            </div>
          </div>
        </motion.div>

        {/* Agent Runner Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {agent.slug === 'n8n_architect' ? (
            <N8nArchitectPanel
              agent={agent}
              onRun={handleRun}
              running={running}
              result={result}
              error={runError}
            />
          ) : agent.slug === 'eda_agent' ? (
            <EDAAgentInterface
              agent={agent}
              onRun={handleRun}
            />
          ) : agent.slug === 'kb_agent' ? (
            <KnowledgeBaseInterface
              agent={agent}
              onRun={handleRun}
            />
          ) : agent.slug === 'dockerizer_agent' ? (
            <DockerizerInterface
              agent={agent}
              onRun={handleRun}
            />
          ) : agent.slug === 'youtube_finder' ? (
            <YouTubeFinderInterface
              agent={agent}
              onRun={handleRun}
            />
          ) : agent.slug === 'sql_generator' ? (
            <SQLGeneratorInterface
              agent={agent}
              onRun={handleRun}
            />
          ) : agent.slug === 'code_fix_agent' ? (
            <CodeFixInterface
              agent={agent}
              onRun={handleRun}
            />
          ) : agent.slug === 'financial_report_agent' ? (
            <FinancialReportInterface
              agent={agent}
              onRun={handleRun}
            />
          ) : agent.slug === 'crypto_sentiment_agent' ? (
            <CryptoSentimentInterface
              agent={agent}
              onRun={handleRun}
            />
          ) : agent.slug === 'regex_generator' ? (
            <RegexGeneratorInterface
              agent={agent}
              onRun={handleRun}
            />
          ) : agent.slug === 'cloud_cost_agent' ? (
            <CloudCostInterface
              agent={agent}
              onRun={handleRun}
            />
          ) : agent.slug === 'cicd_agent' ? (
            <CICDInterface
              agent={agent}
              onRun={handleRun}
            />
          ) : agent.slug === 'log_anomaly_agent' ? (
            <LogAnomalyInterface
              agent={agent}
              onRun={handleRun}
            />
          ) : agent.slug === 'terraform_agent' ? (
            <TerraformInterface
              agent={agent}
              onRun={handleRun}
            />
          ) : agent.slug === 'trading_backtester' ? (
            <TradingBacktesterInterface
              agent={agent}
              onRun={handleRun}
            />
          ) : agent.slug === 'api_docs_agent' ? (
            <APIDocsInterface
              agent={agent}
              onRun={handleRun}
            />
          ) : agent.slug === 'readme_architect' ? (
            <ReadmeArchitectInterface
              agent={agent}
              onRun={handleRun}
            />
          ) : agent.slug === 'contract_auditor' ? (
            <ContractAuditorInterface
              agent={agent}
              onRun={handleRun}
            />
          ) : agent.slug === 'meet_scribe' ? (
            <MeetingScribeInterface
              agent={agent}
              onRun={handleRun}
            />
          ) : agent.slug === 'resume_opt' ? (
            <ResumeOptimizerInterface
              agent={agent}
              onRun={handleRun}
            />
          ) : agent.slug === 'cold_outreach_agent' ? (
            <EmailComposerInterface
              agent={agent}
              onRun={handleRun}
            />
          ) : (
            <AgentRunPanel
              agent={agent}
              onRun={handleRun}
              running={running}
              result={result}
              error={runError}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AgentRunner;