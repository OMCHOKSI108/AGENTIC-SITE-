import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineCode, AiOutlineCheckCircle, AiOutlineExperiment, AiOutlineBook, AiOutlineCopy, AiOutlinePlayCircle } from 'react-icons/ai';
import { FiCode, FiCheck, FiZap, FiBookOpen } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const RegexGeneratorInterface = ({ agent, onRun }) => {
  const [requirement, setRequirement] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [testString, setTestString] = useState('');
  const [testResult, setTestResult] = useState(null);

  const examplePrompts = [
    "Match email addresses but exclude Gmail addresses",
    "Validate phone numbers in international format",
    "Extract dates in MM/DD/YYYY format from text",
    "Find URLs starting with https://",
    "Match credit card numbers (Visa, Mastercard, Amex)",
    "Validate strong passwords (8+ chars, uppercase, lowercase, numbers, symbols)",
    "Extract hashtags from social media text",
    "Match valid IP addresses (IPv4)",
    "Find words that start and end with the same letter",
    "Validate US zip codes (5 digits or 5+4 format)"
  ];

  const handleRun = async () => {
    if (!requirement.trim()) {
      setError('Please describe the pattern you need');
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const response = await onRun({
        requirement: requirement
      });

      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const testRegex = () => {
    if (!result || !result.output || !result.output.regex || !testString.trim()) {
      return;
    }

    try {
      const pattern = result.output.regex;
      const flags = result.output.flags || '';
      const regex = new RegExp(pattern, flags);
      const matches = regex.test(testString);
      setTestResult(matches);
    } catch (error) {
      setTestResult(false);
    }
  };

  const formatRegexResult = (result) => {
    if (!result) return null;

    if (!result.success) {
      return (
        <div className="text-center text-red-500">
          <div className="text-xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Generation Failed</h3>
          <p className="text-[var(--text)]">{result.error}</p>
        </div>
      );
    }

    const data = result.output;

    return (
      <div className="space-y-6">
        {/* Generated Regex */}
        {data.regex && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineCode className="w-5 h-5 text-blue-500" />
              Generated Regular Expression
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Regex Pattern:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(data.regex)}
                  className="text-gray-400 hover:text-white"
                >
                  <AiOutlineCopy className="w-4 h-4" />
                </Button>
              </div>
              <code className="text-green-400 text-lg font-mono break-all">
                {data.regex}
              </code>
            </div>
            {data.flags && (
              <div className="text-sm text-[var(--muted)]">
                <strong>Flags:</strong> {data.flags}
              </div>
            )}
          </div>
        )}

        {/* Explanation */}
        {data.explanation && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBook className="w-5 h-5 text-purple-500" />
              Explanation
            </h3>
            <div className="prose prose-lg max-w-none">
              <div className="text-[var(--text)] leading-relaxed whitespace-pre-wrap">
                {data.explanation}
              </div>
            </div>
          </div>
        )}

        {/* Test Cases */}
        {data.test_cases && data.test_cases.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineExperiment className="w-5 h-5 text-green-500" />
              Test Cases ({data.test_cases.length})
            </h3>
            <div className="space-y-3">
              {data.test_cases.map((testCase, index) => (
                <motion.div
                  key={index}
                  className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--muted)]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {testCase.expected_match ? (
                        <FiCheck className="w-4 h-4 text-green-500" />
                      ) : (
                        <AiOutlineCode className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-medium text-[var(--text)]">
                        {testCase.expected_match ? 'Should Match' : 'Should NOT Match'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(testCase.test_string)}
                      className="text-[var(--muted)] hover:text-[var(--text)]"
                    >
                      <AiOutlineCopy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="bg-gray-900 rounded p-3 mb-2">
                    <code className="text-gray-300 text-sm break-all">
                      "{testCase.test_string}"
                    </code>
                  </div>
                  {testCase.explanation && (
                    <div className="text-sm text-[var(--muted)]">
                      {testCase.explanation}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Common Use Cases */}
        {data.common_use_cases && data.common_use_cases.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <FiBookOpen className="w-5 h-5 text-teal-500" />
              Common Use Cases ({data.common_use_cases.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.common_use_cases.map((useCase, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm text-teal-700 dark:text-teal-300">{useCase}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Notes */}
        {data.performance_notes && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <FiZap className="w-5 h-5 text-amber-500" />
              Performance Notes
            </h3>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                {data.performance_notes}
              </p>
            </div>
          </div>
        )}

        {/* Interactive Regex Tester */}
        {data.regex && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlinePlayCircle className="w-5 h-5 text-green-500" />
              Test Your Regex
            </h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter test string..."
                  className="flex-1 p-3 bg-[var(--bg)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={testString}
                  onChange={(e) => setTestString(e.target.value)}
                />
                <Button
                  onClick={testRegex}
                  variant="outline"
                  className="px-6"
                >
                  Test
                </Button>
              </div>
              {testResult !== null && (
                <div className={`p-4 rounded-lg border ${
                  testResult
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {testResult ? (
                      <FiCheck className="w-4 h-4" />
                    ) : (
                      <AiOutlineCode className="w-4 h-4" />
                    )}
                    <span className="font-medium">
                      {testResult ? 'Match Found' : 'No Match'}
                    </span>
                  </div>
                  <p className="text-sm">
                    Test string "{testString}" {testResult ? 'matches' : 'does not match'} the regex pattern.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Common Use Cases */}
        {data.common_use_cases && data.common_use_cases.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <FiBookOpen className="w-5 h-5 text-teal-500" />
              Common Use Cases ({data.common_use_cases.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.common_use_cases.map((useCase, index) => (
                <motion.div
                  key={index}
                  className="bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 px-4 py-3 rounded-lg border border-teal-200 dark:border-teal-800"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-teal-500 mt-0.5">💡</span>
                    <span className="text-sm">{useCase}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Notes */}
        {data.performance_notes && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineCheckCircle className="w-5 h-5 text-orange-500" />
              Performance & Best Practices
            </h3>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <div className="text-orange-700 dark:text-orange-300 text-sm whitespace-pre-wrap">
                {data.performance_notes}
              </div>
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
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <AiOutlineCode className="w-7 h-7 text-blue-500" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Generate regular expressions with detailed explanations and test cases
          </p>
        </div>

        {/* Requirement Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Pattern Description
          </label>
          <textarea
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder="Describe the pattern you need (e.g., 'match email addresses but exclude Gmail addresses')"
            className="w-full h-32 p-4 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex justify-between text-xs text-[var(--muted)]">
            <span>{requirement.split(/\s+/).filter(word => word.length > 0).length} words</span>
            <span>{requirement.length} characters</span>
          </div>
        </div>

        {/* Example Prompts */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Example Prompts (Click to use)
          </label>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setRequirement(prompt)}
                className="text-left p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-sm text-[var(--text)]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Features */}
        <div className="bg-[var(--surface)] rounded-lg p-4 border border-[var(--muted)]">
          <h3 className="font-semibold text-[var(--text)] mb-3">What You'll Get</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-[var(--text)]">Optimized Regex</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-[var(--text)]">Detailed Explanation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[var(--text)]">Test Cases</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span className="text-[var(--text)]">Code Examples</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              <span className="text-[var(--text)]">Use Cases</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-[var(--text)]">Best Practices</span>
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
            disabled={!requirement.trim() || running}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {running ? (
              <div className="flex items-center gap-3">
                <AiOutlineCode className="w-5 h-5 animate-spin" />
                <span>Generating Regex...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <AiOutlineCode className="w-5 h-5" />
                <span>Generate Regex</span>
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
            <AiOutlineExperiment className="w-7 h-7 text-blue-500" />
            Regex Analysis Results
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
                  link.download = 'regex-analysis.json';
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export JSON
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
                <AiOutlineCode className="w-16 h-16 text-blue-500" />
              </motion.div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[var(--text)] mb-2">
                  Generating regular expression...
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
                  AI is crafting an optimized regex pattern with comprehensive testing and examples
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Generation Failed</h3>
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
                  <span className="font-semibold">Regex Generated Successfully</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Complete regex solution with testing and implementation examples
                </p>
              </div>
              {formatRegexResult(result)}
            </motion.div>
          ) : (
            <div className="text-center text-[var(--muted)] flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <AiOutlineCode className="w-20 h-20 text-blue-500/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                Ready for Regex Generation
              </h3>
              <p className="text-lg mb-4 max-w-sm">
                Describe your pattern matching needs and get a complete regex solution with explanations, test cases, and code examples
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  🔍 Pattern Matching
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  📚 Detailed Explanations
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  ✅ Test Cases
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  💻 Code Examples
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RegexGeneratorInterface;