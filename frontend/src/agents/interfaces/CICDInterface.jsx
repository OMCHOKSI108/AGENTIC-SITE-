import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineCode, AiOutlineDownload, AiOutlineCopy, AiOutlineCheckCircle } from 'react-icons/ai';
import { FiCode, FiDownload, FiCopy } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const CICDInterface = ({ agent, onRun }) => {
  const [projectDescription, setProjectDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const techStackOptions = [
    'Node.js',
    'Python',
    'Java',
    'Go',
    'Rust',
    'PHP',
    'Ruby',
    'C#',
    '.NET',
    'React',
    'Vue.js',
    'Angular',
    'Other'
  ];

  const handleRun = async () => {
    if (!projectDescription.trim()) {
      setError('Please describe your project');
      return;
    }

    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const response = await onRun({
        project_description: projectDescription,
        tech_stack: techStack
      });
      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to generate CI/CD pipeline');
    } finally {
      setRunning(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 bg-[var(--bg)] rounded-lg shadow-lg"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text)] mb-4 flex items-center gap-3">
          <AiOutlineCode className="text-green-500" />
          CI/CD Pipeline Generator
        </h2>
        <p className="text-[var(--muted)] text-lg">
          Describe your project and tech stack to generate production-ready GitHub Actions workflows
        </p>
      </div>

      <div className="space-y-6">
        {/* Project Description */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
          <label className="block text-lg font-medium text-[var(--text)] mb-3">
            Project Description
          </label>
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Describe your application, what it does, and any special requirements (e.g., 'Node.js REST API with PostgreSQL database, needs testing and deployment to AWS')"
            className="w-full h-32 p-4 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Tech Stack Selection */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
          <label className="block text-lg font-medium text-[var(--text)] mb-3">
            Primary Tech Stack
          </label>
          <select
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select tech stack (optional)</option>
            {techStackOptions.map((stack) => (
              <option key={stack} value={stack}>{stack}</option>
            ))}
          </select>
        </div>

        {/* Run Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleRun}
            disabled={!projectDescription.trim() || running}
            className="px-8 py-3 text-lg"
          >
            {running ? 'Generating Pipeline...' : 'Generate CI/CD Pipeline'}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}

        {/* Results Display */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <AiOutlineCheckCircle className="text-green-600 h-5 w-5" />
              <h3 className="text-lg font-semibold text-green-800">CI/CD Pipeline Generated</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">GitHub Actions Workflow</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.workflow_yaml)}
                    className="flex items-center gap-2"
                  >
                    {copied ? <AiOutlineCheckCircle className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <pre className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap overflow-x-auto">{result.workflow_yaml}</pre>
              </div>

              {result.explanation && (
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-medium text-gray-900 mb-2">Pipeline Explanation</h4>
                  <p className="text-sm text-gray-700">{result.explanation}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => downloadFile(result.workflow_yaml, 'ci-cd-workflow.yml')}
                  className="flex items-center gap-2"
                >
                  <FiDownload className="h-4 w-4" />
                  Download Workflow
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default CICDInterface;