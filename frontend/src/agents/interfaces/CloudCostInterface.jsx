import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineFileText, AiOutlineDownload, AiOutlineCopy, AiOutlineCheckCircle } from 'react-icons/ai';
import { FiFile, FiDownload, FiCopy } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const CloudCostInterface = ({ agent, onRun }) => {
  const [billingFile, setBillingFile] = useState(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setBillingFile(file);
      setError(null);
    } else {
      setError('Please select a valid CSV file');
      setBillingFile(null);
    }
  };

  const handleRun = async () => {
    if (!billingFile) {
      setError('Please select a billing CSV file');
      return;
    }

    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('billing_file', billingFile);

      const response = await onRun(formData);
      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to analyze cloud costs');
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
          <AiOutlineFileText className="text-blue-500" />
          Cloud Cost Auditor
        </h2>
        <p className="text-[var(--muted)] text-lg">
          Upload your AWS/Azure billing CSV to identify cost optimization opportunities and get CLI fix commands
        </p>
      </div>

      <div className="space-y-6">
        {/* File Upload Section */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border-2 border-dashed border-[var(--border)]">
          <div className="text-center">
            <FiFile className="mx-auto h-12 w-12 text-[var(--muted)] mb-4" />
            <label className="block">
              <span className="text-lg font-medium text-[var(--text)] mb-2 block">
                Upload Billing CSV
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="billing-file"
              />
              <Button
                variant="outline"
                className="mb-2"
                onClick={() => document.getElementById('billing-file').click()}
              >
                Choose CSV File
              </Button>
              {billingFile && (
                <p className="text-sm text-green-600 mt-2">
                  Selected: {billingFile.name}
                </p>
              )}
            </label>
            <p className="text-sm text-[var(--muted)] mt-2">
              Supports AWS Cost & Usage Reports and Azure billing exports
            </p>
          </div>
        </div>

        {/* Run Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleRun}
            disabled={!billingFile || running}
            className="px-8 py-3 text-lg"
          >
            {running ? 'Analyzing Costs...' : 'Analyze Cloud Costs'}
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
              <h3 className="text-lg font-semibold text-green-800">Cost Analysis Complete</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded border">
                <h4 className="font-medium text-gray-900 mb-2">Analysis Results</h4>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{result.analysis}</pre>
              </div>

              {result.cli_commands && (
                <div className="bg-white p-4 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">CLI Fix Commands</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.cli_commands)}
                      className="flex items-center gap-2"
                    >
                      {copied ? <AiOutlineCheckCircle className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <pre className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap">{result.cli_commands}</pre>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => downloadFile(result.analysis, 'cost-analysis.txt')}
                  className="flex items-center gap-2"
                >
                  <FiDownload className="h-4 w-4" />
                  Download Analysis
                </Button>
                {result.cli_commands && (
                  <Button
                    variant="outline"
                    onClick={() => downloadFile(result.cli_commands, 'fix-commands.sh')}
                    className="flex items-center gap-2"
                  >
                    <FiDownload className="h-4 w-4" />
                    Download Commands
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default CloudCostInterface;