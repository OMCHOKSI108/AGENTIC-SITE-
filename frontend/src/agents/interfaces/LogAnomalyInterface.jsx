import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineFileText, AiOutlineDownload, AiOutlineCopy, AiOutlineCheckCircle, AiOutlineAlert } from 'react-icons/ai';
import { FiFile, FiDownload, FiCopy, FiAlertTriangle } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const LogAnomalyInterface = ({ agent, onRun }) => {
  const [logFile, setLogFile] = useState(null);
  const [logText, setLogText] = useState('');
  const [inputType, setInputType] = useState('file'); // 'file' or 'text'
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const inputTypes = [
    {
      value: 'file',
      label: 'Log File Upload',
      icon: '📄',
      description: 'Upload a log file for analysis',
      placeholder: 'Select log file...'
    },
    {
      value: 'text',
      label: 'Log Text Input',
      icon: '📝',
      description: 'Paste log content directly',
      placeholder: 'Paste your log content here...'
    }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogFile(file);
      setError(null);
    }
  };

  const handleRun = async () => {
    if (inputType === 'file' && !logFile) {
      setError('Please select a log file');
      return;
    }
    if (inputType === 'text' && !logText.trim()) {
      setError('Please enter log content');
      return;
    }

    setRunning(true);
    setError(null);
    setResult(null);

    try {
      let payload;
      if (inputType === 'file') {
        const formData = new FormData();
        formData.append('log_file', logFile);
        payload = formData;
      } else {
        payload = { log_content: logText };
      }

      const response = await onRun(payload);
      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to analyze logs');
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
    const blob = new Blob([content], { type: 'text/plain' });
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
          <AiOutlineAlert className="text-orange-500" />
          Log Anomaly Detective
        </h2>
        <p className="text-[var(--muted)] text-lg">
          Upload log files or paste log content to detect anomalies, identify root causes, and get fix suggestions
        </p>
      </div>

      <div className="space-y-6">
        {/* Input Type Selection */}
        <div className="flex gap-4 mb-6">
          {inputTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setInputType(type.value)}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                inputType === type.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--text)]'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{type.icon}</div>
                <h3 className="font-medium text-[var(--text)]">{type.label}</h3>
                <p className="text-sm text-[var(--muted)] mt-1">{type.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* File Upload Section */}
        {inputType === 'file' && (
          <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border-2 border-dashed border-[var(--border)]">
            <div className="text-center">
              <FiFile className="mx-auto h-12 w-12 text-[var(--muted)] mb-4" />
              <label className="block">
                <span className="text-lg font-medium text-[var(--text)] mb-2 block">
                  Upload Log File
                </span>
                <input
                  type="file"
                  accept=".log,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="log-file"
                />
                <Button
                  variant="outline"
                  className="mb-2"
                  onClick={() => document.getElementById('log-file').click()}
                >
                  Choose Log File
                </Button>
                {logFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {logFile.name}
                  </p>
                )}
              </label>
              <p className="text-sm text-[var(--muted)] mt-2">
                Supports .log and .txt files
              </p>
            </div>
          </div>
        )}

        {/* Text Input Section */}
        {inputType === 'text' && (
          <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
            <label className="block text-lg font-medium text-[var(--text)] mb-3">
              Log Content
            </label>
            <textarea
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
              placeholder="Paste your log content here. Include timestamps, error messages, and any relevant context..."
              className="w-full h-64 p-4 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
            />
          </div>
        )}

        {/* Run Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleRun}
            disabled={
              (inputType === 'file' && !logFile) ||
              (inputType === 'text' && !logText.trim()) ||
              running
            }
            className="px-8 py-3 text-lg"
          >
            {running ? 'Analyzing Logs...' : 'Detect Anomalies'}
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
              <h3 className="text-lg font-semibold text-green-800">Log Analysis Complete</h3>
            </div>

            <div className="space-y-4">
              {/* Anomalies Detected */}
              {result.anomalies && result.anomalies.length > 0 && (
                <div className="bg-white p-4 rounded border">
                  <div className="flex items-center gap-2 mb-3">
                    <FiAlertTriangle className="text-red-500 h-5 w-5" />
                    <h4 className="font-medium text-gray-900">Anomalies Detected</h4>
                  </div>
                  <div className="space-y-2">
                    {result.anomalies.map((anomaly, index) => (
                      <div key={index} className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                        <p className="text-sm text-red-800">{anomaly}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Root Cause Analysis */}
              {result.root_causes && (
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-medium text-gray-900 mb-2">Root Cause Analysis</h4>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">{result.root_causes}</pre>
                </div>
              )}

              {/* Fix Suggestions */}
              {result.fix_suggestions && (
                <div className="bg-white p-4 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Fix Suggestions</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.fix_suggestions)}
                      className="flex items-center gap-2"
                    >
                      {copied ? <AiOutlineCheckCircle className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <pre className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap">{result.fix_suggestions}</pre>
                </div>
              )}

              {/* Summary */}
              {result.summary && (
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-medium text-gray-900 mb-2">Analysis Summary</h4>
                  <p className="text-sm text-gray-700">{result.summary}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => downloadFile(
                    `Anomalies:\n${result.anomalies?.join('\n') || 'None'}\n\nRoot Causes:\n${result.root_causes || 'N/A'}\n\nFix Suggestions:\n${result.fix_suggestions || 'N/A'}`,
                    'log-analysis-report.txt'
                  )}
                  className="flex items-center gap-2"
                >
                  <FiDownload className="h-4 w-4" />
                  Download Report
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default LogAnomalyInterface;