import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineCode, AiOutlineBug, AiOutlineSafety, AiOutlineCheckCircle, AiOutlineCopy, AiOutlineFileText } from 'react-icons/ai';
import { FiCode, FiAlertTriangle, FiShield, FiCopy, FiFile } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const CodeFixInterface = ({ agent, onRun }) => {
  const [codeSnippet, setCodeSnippet] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [inputType, setInputType] = useState('code'); // 'code' or 'repo'
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const inputTypes = [
    {
      value: 'code',
      label: 'Code Snippet',
      icon: '💻',
      description: 'Paste code directly for analysis and fixes',
      placeholder: 'Paste your code here...'
    },
    {
      value: 'repo',
      label: 'GitHub Repository',
      icon: '🔗',
      description: 'Analyze an entire repository for issues',
      placeholder: 'https://github.com/username/repo'
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

  const handleRun = async () => {
    if (inputType === 'code' && !codeSnippet.trim()) {
      setError('Please enter some code');
      return;
    }
    if (inputType === 'repo' && !repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const formData = new FormData();
      if (inputType === 'code') {
        formData.append('code_snippet', codeSnippet.trim());
      } else {
        formData.append('repo_url', repoUrl.trim());
      }

      const response = await onRun(formData);
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const formatCodeFixResult = (result) => {
    if (!result || !result.output) return null;

    const data = result.output;

    if (!data.success) {
      return (
        <div className="text-center text-red-500">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Code Analysis Failed</h3>
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
            <span className="font-semibold">Code Analysis Complete</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400">
            Found {data.issues?.length || 0} issues and provided fixes
          </p>
        </div>

        {/* Issues Found */}
        {data.issues && data.issues.length > 0 && (
          <div className="space-y-4">
            {data.issues.map((issue, index) => (
              <motion.div
                key={index}
                className={`bg-[var(--surface)] rounded-lg p-6 border ${
                  issue.severity === 'high' ? 'border-red-200 dark:border-red-800' :
                  issue.severity === 'medium' ? 'border-yellow-200 dark:border-yellow-800' :
                  'border-blue-200 dark:border-blue-800'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {issue.type === 'bug' ? (
                      <FiAlertTriangle className="w-5 h-5 text-red-500" />
                    ) : issue.type === 'security' ? (
                      <FiShield className="w-5 h-5 text-orange-500" />
                    ) : (
                      <AiOutlineCode className="w-5 h-5 text-blue-500" />
                    )}
                    <div>
                      <h3 className="font-semibold text-[var(--text)]">{issue.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          issue.severity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {issue.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-[var(--muted)]">{issue.type}</span>
                        {issue.line && <span className="text-xs text-[var(--muted)]">Line {issue.line}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Issue Description */}
                <div className="mb-4">
                  <p className="text-[var(--text)]">{issue.description}</p>
                </div>

                {/* Problem Code */}
                {issue.problem_code && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Problem Code:</h4>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                      <pre className="text-red-800 dark:text-red-200 text-sm whitespace-pre-wrap font-mono">
                        {issue.problem_code}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Fixed Code */}
                {issue.fixed_code && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-green-600 dark:text-green-400">Fixed Code:</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(issue.fixed_code)}
                        className="text-xs"
                      >
                        <FiCopy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                      <pre className="text-green-800 dark:text-green-200 text-sm whitespace-pre-wrap font-mono">
                        {issue.fixed_code}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {issue.explanation && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-[var(--text)] mb-2">Explanation:</h4>
                    <p className="text-sm text-[var(--muted)]">{issue.explanation}</p>
                  </div>
                )}

                {/* Security Impact */}
                {issue.security_impact && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded p-3">
                    <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">Security Impact:</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300">{issue.security_impact}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary */}
        {data.summary && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineFileText className="w-5 h-5 text-indigo-500" />
              Analysis Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {data.summary.total_issues !== undefined && (
                <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded border">
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {data.summary.total_issues}
                  </div>
                  <div className="text-sm text-indigo-700 dark:text-indigo-300">Total Issues</div>
                </div>
              )}
              {data.summary.bugs_fixed !== undefined && (
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded border">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {data.summary.bugs_fixed}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">Bugs Fixed</div>
                </div>
              )}
              {data.summary.security_issues !== undefined && (
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded border">
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {data.summary.security_issues}
                  </div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">Security Issues</div>
                </div>
              )}
            </div>
            {data.summary.overall_assessment && (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="text-[var(--text)] leading-relaxed">
                  {data.summary.overall_assessment}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {data.recommendations && data.recommendations.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineCode className="w-5 h-5 text-purple-500" />
              Recommendations ({data.recommendations.length})
            </h3>
            <div className="space-y-3">
              {data.recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="text-[var(--text)]">{rec}</div>
                </motion.div>
              ))}
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
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <FiCode className="w-7 h-7 text-green-500" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Debug code, fix bugs, and perform security vulnerability checks
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
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-[var(--muted)] bg-[var(--surface)] text-[var(--text)] hover:border-green-300'
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
            {inputType === 'code' ? 'Code Snippet *' : 'GitHub Repository URL *'}
          </label>
          {inputType === 'code' ? (
            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder={inputTypes.find(t => t.value === 'code').placeholder}
              rows={15}
              className="w-full p-4 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm resize-none"
            />
          ) : (
            <div className="relative">
              <AiOutlineCode className="absolute left-3 top-3 text-[var(--muted)] w-5 h-5" />
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder={inputTypes.find(t => t.value === 'repo').placeholder}
                className="w-full pl-10 pr-4 py-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          )}
          <p className="text-xs text-[var(--muted)]">
            {inputType === 'code'
              ? 'Paste your code snippet. The AI will analyze it for bugs, security issues, and provide fixes with explanations.'
              : 'Enter a GitHub repository URL. The AI will analyze the entire codebase for issues and vulnerabilities.'
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
            disabled={running || (inputType === 'code' ? !codeSnippet.trim() : !repoUrl.trim())}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {running ? (
              <div className="flex items-center gap-3">
                <FiAlertTriangle className="w-5 h-5 animate-spin" />
                <span>Analyzing code...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <FiAlertTriangle className="w-5 h-5" />
                <span>Analyze & Fix Code</span>
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
            <AiOutlineBug className="w-7 h-7 text-green-500" />
            Code Analysis Results
          </h2>
          {result && result.output?.success && result.output.issues && (
            <div className="text-sm text-[var(--muted)]">
              {result.output.issues.length} issues found
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] rounded-xl p-6 min-h-96 border border-green-500/10 shadow-lg overflow-y-auto">
          {running ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <FiCode className="w-16 h-16 text-green-500" />
              </motion.div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[var(--text)] mb-2">
                  Analyzing your code...
                </div>
                <div className="flex justify-center gap-1 mb-4">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-green-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-green-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-green-500 rounded-full"
                  />
                </div>
                <p className="text-sm text-[var(--muted)] text-center">
                  AI is scanning for bugs, security vulnerabilities, and code quality issues
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Code Analysis Failed</h3>
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
                  <span className="font-semibold">Analysis Complete</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Code analysis finished with detailed findings and fixes
                </p>
              </div>
              {formatCodeFixResult(result)}
            </motion.div>
          ) : (
            <div className="text-center text-[var(--muted)] flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <FiCode className="w-20 h-20 text-green-500/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                Ready for Code Analysis
              </h3>
              <p className="text-lg mb-4 max-w-sm">
                Paste your code or provide a repository URL to get comprehensive bug fixes and security analysis
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm">
                  🐛 Bug Detection
                </span>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm">
                  🔒 Security Scan
                </span>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm">
                  💡 Smart Fixes
                </span>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm">
                  📊 Quality Metrics
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CodeFixInterface;