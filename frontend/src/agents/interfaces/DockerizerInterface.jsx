import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineCode, AiOutlineLink, AiOutlineFileText, AiOutlineDownload, AiOutlineCopy, AiOutlineCheckCircle } from 'react-icons/ai';
import { FiCode, FiLink, FiFile, FiDownload, FiCopy } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const DockerizerInterface = ({ agent, onRun }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [inputType, setInputType] = useState('repo'); // 'repo' or 'code'
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const inputTypes = [
    {
      value: 'repo',
      label: 'GitHub Repository',
      icon: '🔗',
      description: 'Analyze a GitHub repo and generate Docker config',
      placeholder: 'https://github.com/username/repo'
    },
    {
      value: 'code',
      label: 'Code Snippet',
      icon: '💻',
      description: 'Paste code and get Dockerfile + docker-compose.yml',
      placeholder: 'Paste your application code here...'
    }
  ];

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
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRun = async () => {
    if (inputType === 'repo' && !repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }
    if (inputType === 'code' && !codeSnippet.trim()) {
      setError('Please enter some code');
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const formData = new FormData();
      if (inputType === 'repo') {
        formData.append('repo_url', repoUrl.trim());
      } else {
        formData.append('code_snippet', codeSnippet.trim());
      }

      const response = await onRun(formData);
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const formatDockerResult = (result) => {
    if (!result || !result.output) return null;

    const data = result.output;

    if (!data.success) {
      return (
        <div className="text-center text-red-500">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Docker Configuration Failed</h3>
          <p className="text-[var(--text)]">{data.error || result.output.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Success Message */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
            <AiOutlineCheckCircle className="w-4 h-4" />
            <span className="font-semibold">Docker Configuration Generated Successfully</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400">
            Production-ready Docker setup created for your application
          </p>
        </div>

        {/* Dockerfile */}
        {data.dockerfile && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text)] flex items-center gap-2">
                <FiFile className="w-5 h-5 text-blue-500" />
                Dockerfile
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(data.dockerfile)}
                  className="flex items-center gap-1"
                >
                  <FiCopy className="w-3 h-3" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFile(data.dockerfile, 'Dockerfile')}
                  className="flex items-center gap-1"
                >
                  <FiDownload className="w-3 h-3" />
                  Download
                </Button>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                {data.dockerfile}
              </pre>
            </div>
          </div>
        )}

        {/* Docker Compose */}
        {data.docker_compose && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text)] flex items-center gap-2">
                <FiCode className="w-5 h-5 text-green-500" />
                docker-compose.yml
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(data.docker_compose)}
                  className="flex items-center gap-1"
                >
                  <FiCopy className="w-3 h-3" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFile(data.docker_compose, 'docker-compose.yml')}
                  className="flex items-center gap-1"
                >
                  <FiDownload className="w-3 h-3" />
                  Download
                </Button>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                {data.docker_compose}
              </pre>
            </div>
          </div>
        )}

        {/* Build Instructions */}
        {data.build_instructions && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineFileText className="w-5 h-5 text-purple-500" />
              Build & Deployment Instructions
            </h3>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="text-[var(--text)] leading-relaxed whitespace-pre-wrap">
                {data.build_instructions}
              </div>
            </div>
          </div>
        )}

        {/* Security Notes */}
        {data.security_notes && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
              <span>🔒</span>
              Security Considerations
            </h3>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap">
              {data.security_notes}
            </div>
          </div>
        )}

        {/* Analysis Summary */}
        {data.analysis && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineCode className="w-5 h-5 text-indigo-500" />
              Application Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.analysis.language && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded border">
                  <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Language</div>
                  <div className="text-[var(--text)]">{data.analysis.language}</div>
                </div>
              )}
              {data.analysis.framework && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded border">
                  <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Framework</div>
                  <div className="text-[var(--text)]">{data.analysis.framework}</div>
                </div>
              )}
              {data.analysis.dependencies && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded border">
                  <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Dependencies</div>
                  <div className="text-[var(--text)]">{data.analysis.dependencies.length}</div>
                </div>
              )}
              {data.analysis.ports && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded border">
                  <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Ports</div>
                  <div className="text-[var(--text)]">{data.analysis.ports.join(', ')}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Input Panel */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <FiCode className="w-7 h-7 text-blue-500" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Generate production-ready Docker configurations for any application
          </p>
        </div>

        {/* Input Type Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Input Type
          </label>
          <div className="grid grid-cols-1 gap-3">
            {inputTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setInputType(type.value)}
                className={`p-4 border rounded-lg text-sm font-medium transition-all ${
                  inputType === type.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-[var(--muted)] bg-[var(--surface)] text-[var(--text)] hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{type.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs opacity-70">{type.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            {inputType === 'repo' ? 'GitHub Repository URL *' : 'Code Snippet *'}
          </label>
          {inputType === 'repo' ? (
            <div className="relative">
              <FiLink className="absolute left-3 top-3 text-[var(--muted)] w-5 h-5" />
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder={inputTypes.find(t => t.value === 'repo').placeholder}
                className="w-full pl-10 pr-4 py-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ) : (
            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder={inputTypes.find(t => t.value === 'code').placeholder}
              rows={12}
              className="w-full p-4 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
            />
          )}
          <p className="text-xs text-[var(--muted)]">
            {inputType === 'repo'
              ? 'Enter a valid GitHub repository URL. The AI will analyze the codebase and generate appropriate Docker configuration.'
              : 'Paste your application code. Include package.json, requirements.txt, or other dependency files for best results.'
            }
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Run Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={handleRun}
            loading={running}
            disabled={running || (inputType === 'repo' ? !repoUrl.trim() : !codeSnippet.trim())}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {running ? (
              <div className="flex items-center gap-3">
                <FiCode className="w-5 h-5 animate-spin" />
                <span>Generating Docker config...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <FiCode className="w-5 h-5" />
                <span>Generate Docker Config</span>
              </div>
            )}
          </Button>
        </motion.div>
      </motion.div>

      {/* Output Panel */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--text)] flex items-center gap-3">
            <AiOutlineCode className="w-7 h-7 text-blue-500" />
            Docker Configuration
          </h2>
          {result && result.output?.success && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const dockerfile = result.output.dockerfile || '';
                  const compose = result.output.docker_compose || '';
                  const combined = dockerfile + '\n\n--- docker-compose.yml ---\n\n' + compose;
                  downloadFile(combined, 'docker-config.zip');
                }}
              >
                Download All
              </Button>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] rounded-xl p-6 min-h-96 border border-blue-500/10 shadow-lg overflow-y-auto">
          {running ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <FiCode className="w-16 h-16 text-blue-500" />
              </motion.div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[var(--text)] mb-2">
                  Analyzing your code...
                </div>
                <div className="flex justify-center gap-1 mb-4">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                  />
                </div>
                <p className="text-sm text-[var(--muted)] text-center">
                  AI is analyzing your application, detecting dependencies, and generating optimized Docker configuration
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Docker Generation Failed</h3>
              <p className="text-[var(--text)] mb-4">{error}</p>
              <Button onClick={handleRun} variant="outline">
                Try Again
              </Button>
            </div>
          ) : result ? (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                  <AiOutlineCheckCircle className="w-4 h-4" />
                  <span className="font-semibold">Docker Configuration Ready</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Production-ready Docker setup generated for your application
                </p>
              </div>
              {formatDockerResult(result)}
            </motion.div>
          ) : (
            <div className="text-center text-[var(--muted)] flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <FiCode className="w-20 h-20 text-blue-500/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                Ready to Dockerize
              </h3>
              <p className="text-lg mb-4 max-w-sm">
                Provide a GitHub repo URL or paste your code, and get production-ready Docker configuration instantly
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  🏗️ Multi-stage Builds
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  🔒 Security Best Practices
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  ⚡ Optimized Images
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  📦 Full Stack Support
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DockerizerInterface;