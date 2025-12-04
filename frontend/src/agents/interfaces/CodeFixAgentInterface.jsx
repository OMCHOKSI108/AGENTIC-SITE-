import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineCode, AiOutlineBug, AiOutlineCheckCircle, AiOutlineWarning, AiOutlineBulb, AiOutlineFileText } from 'react-icons/ai';
import { FiCode, FiAlertTriangle, FiCheck, FiLightbulb } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const CodeFixAgentInterface = ({ agent, onRun }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'typescript', label: 'TypeScript', icon: '🔷' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'cpp', label: 'C++', icon: '⚡' },
    { value: 'csharp', label: 'C#', icon: '🔷' },
    { value: 'php', label: 'PHP', icon: '🐘' },
    { value: 'ruby', label: 'Ruby', icon: '💎' },
    { value: 'go', label: 'Go', icon: '🐹' },
    { value: 'rust', label: 'Rust', icon: '🦀' },
    { value: 'html', label: 'HTML', icon: '🌐' },
    { value: 'css', label: 'CSS', icon: '🎨' },
    { value: 'sql', label: 'SQL', icon: '🗄️' },
    { value: 'bash', label: 'Bash', icon: '💻' },
  ];

  const handleRun = async () => {
    if (!code.trim()) {
      setError('Please enter some code to analyze');
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const response = await onRun({
        code: code,
        language: language
      });

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
          <h3 className="text-xl font-bold mb-2">Analysis Failed</h3>
          <p className="text-[var(--text)]">{data.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Issues Found */}
        {data.issues && data.issues.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBug className="w-5 h-5 text-red-500" />
              Issues Found ({data.issues.length})
            </h3>
            <div className="space-y-4">
              {data.issues.map((issue, index) => (
                <motion.div
                  key={index}
                  className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {issue.severity === 'error' && <AiOutlineWarning className="w-5 h-5 text-red-500" />}
                      {issue.severity === 'warning' && <AiOutlineWarning className="w-5 h-5 text-yellow-500" />}
                      {issue.severity === 'info' && <AiOutlineBulb className="w-5 h-5 text-blue-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-[var(--text)]">{issue.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          issue.severity === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          issue.severity === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-[var(--text)] text-sm mb-3">{issue.description}</p>
                      {issue.line && (
                        <div className="text-xs text-[var(--muted)] mb-2">
                          Line {issue.line}{issue.column && `, Column ${issue.column}`}
                        </div>
                      )}
                      {issue.suggestion && (
                        <div className="bg-[var(--bg)] rounded p-3 border-l-4 border-primary">
                          <p className="text-sm font-medium text-[var(--text)] mb-1">Suggestion:</p>
                          <p className="text-sm text-[var(--text)]">{issue.suggestion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Fixed Code */}
        {data.fixed_code && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineCheckCircle className="w-5 h-5 text-green-500" />
              Fixed Code
            </h3>
            <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--muted)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[var(--text)]">Corrected Version</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(data.fixed_code);
                  }}
                >
                  Copy Code
                </Button>
              </div>
              <pre className="text-sm text-[var(--text)] overflow-x-auto whitespace-pre-wrap font-mono bg-[var(--surface)] p-3 rounded border">
                <code>{data.fixed_code}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Code Quality Metrics */}
        {data.metrics && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBulb className="w-5 h-5 text-blue-500" />
              Code Quality Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(data.metrics).map(([key, value]) => (
                <div key={key} className="text-center p-4 bg-[var(--bg)] rounded-lg border border-[var(--muted)]">
                  <div className="text-2xl font-bold text-[var(--text)] mb-1">
                    {typeof value === 'number' ? value : value}
                  </div>
                  <div className="text-sm text-[var(--muted)] capitalize">
                    {key.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Practices */}
        {data.best_practices && data.best_practices.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBulb className="w-5 h-5 text-green-500" />
              Best Practices ({data.best_practices.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.best_practices.map((practice, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-[var(--bg)] rounded-lg border border-[var(--muted)]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--text)] mb-1">{practice.title}</h4>
                    <p className="text-sm text-[var(--muted)]">{practice.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Suggestions */}
        {data.performance_suggestions && data.performance_suggestions.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBulb className="w-5 h-5 text-orange-500" />
              Performance Suggestions ({data.performance_suggestions.length})
            </h3>
            <div className="space-y-3">
              {data.performance_suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AiOutlineBulb className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-[var(--text)] mb-1">{suggestion.title}</h4>
                    <p className="text-sm text-[var(--text)] mb-2">{suggestion.description}</p>
                    {suggestion.impact && (
                      <div className="text-xs text-orange-600 dark:text-orange-400">
                        Impact: {suggestion.impact}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Security Issues */}
        {data.security_issues && data.security_issues.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineWarning className="w-5 h-5 text-red-500" />
              Security Issues ({data.security_issues.length})
            </h3>
            <div className="space-y-3">
              {data.security_issues.map((issue, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AiOutlineWarning className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-[var(--text)] mb-1">{issue.title}</h4>
                    <p className="text-sm text-[var(--text)] mb-2">{issue.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600 dark:text-red-400">
                        Severity: {issue.severity}
                      </span>
                      {issue.cwe && (
                        <span className="text-xs text-[var(--muted)]">
                          CWE: {issue.cwe}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {data.summary && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineFileText className="w-5 h-5 text-primary" />
              Analysis Summary
            </h3>
            <div className="bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-lg p-4 border border-primary/20">
              <p className="text-[var(--text)] leading-relaxed">{data.summary}</p>
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
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-primary to-orange-500 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <AiOutlineCode className="w-7 h-7 text-primary" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Analyze and fix code issues, improve quality, and get AI-powered suggestions
          </p>
        </div>

        {/* Language Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[var(--text)]">
            Programming Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.icon} {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Code Input */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[var(--text)]">
            Code to Analyze
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`Paste your ${languages.find(l => l.value === language)?.label} code here...`}
            className="w-full h-80 p-4 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            spellCheck={false}
          />
          <div className="flex justify-between items-center text-xs text-[var(--muted)]">
            <span>{code.split('\n').length} lines</span>
            <span>{code.length} characters</span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Analysis Features */}
        <div className="bg-[var(--surface)] rounded-lg p-4 border border-[var(--muted)]">
          <h3 className="font-semibold text-[var(--text)] mb-3">What We Analyze</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-[var(--text)]">Syntax Errors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-[var(--text)]">Code Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-[var(--text)]">Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <span className="text-[var(--text)]">Security Issues</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[var(--text)]">Best Practices</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-[var(--text)]">AI Suggestions</span>
            </div>
          </div>
        </div>

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
            disabled={!code.trim() || running}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {running ? (
              <div className="flex items-center gap-3">
                <AiOutlineCode className="w-5 h-5 animate-spin" />
                <span>Analyzing code...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <AiOutlineCode className="w-5 h-5" />
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
            <AiOutlineBug className="w-7 h-7 text-primary" />
            Analysis Results
          </h2>
          {result && result.output?.success && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const dataStr = JSON.stringify(result.output, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'code-analysis.json';
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export JSON
              </Button>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] rounded-xl p-6 min-h-96 border border-primary/10 shadow-lg overflow-y-auto">
          {running ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <AiOutlineCode className="w-16 h-16 text-primary" />
              </motion.div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[var(--text)] mb-2">
                  Analyzing your code...
                </div>
                <div className="flex justify-center gap-1 mb-4">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-primary rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-primary rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-primary rounded-full"
                  />
                </div>
                <p className="text-sm text-[var(--muted)] text-center">
                  AI is checking for bugs, performance issues, and best practices
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Analysis Failed</h3>
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
                  <span className="font-semibold">Code Analysis Complete</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Found {result.output.issues?.length || 0} issues and provided {result.output.best_practices?.length || 0} best practice suggestions
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
                <AiOutlineCode className="w-20 h-20 text-primary/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                Ready for Code Analysis
              </h3>
              <p className="text-lg mb-4 max-w-sm">
                Paste any code snippet and get comprehensive analysis with fixes, performance tips, and security recommendations
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  🐛 Bug Detection
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  ⚡ Performance
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  🔒 Security
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  ✨ Best Practices
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CodeFixAgentInterface;