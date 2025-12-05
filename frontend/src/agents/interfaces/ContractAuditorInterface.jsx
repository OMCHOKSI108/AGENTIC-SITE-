import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineFileText, AiOutlineDownload, AiOutlineCopy, AiOutlineCheckCircle, AiOutlineWarning } from 'react-icons/ai';
import { FiFile, FiDownload, FiCopy, FiAlertTriangle } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const ContractAuditorInterface = ({ agent, onRun }) => {
  const [contractText, setContractText] = useState('');
  const [contractFile, setContractFile] = useState(null);
  const [inputType, setInputType] = useState('text'); // 'text' or 'file'
  const [auditType, setAuditType] = useState('comprehensive'); // 'comprehensive' or 'quick'
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const inputTypes = [
    {
      value: 'text',
      label: 'Contract Text',
      icon: '📄',
      description: 'Paste contract content directly',
      placeholder: 'Paste your contract text here...'
    },
    {
      value: 'file',
      label: 'Contract File',
      icon: '📎',
      description: 'Upload contract document',
      placeholder: 'Select contract file...'
    }
  ];

  const auditTypes = [
    {
      value: 'comprehensive',
      label: 'Comprehensive Audit',
      description: 'Detailed analysis of all clauses and terms',
      duration: '~2-3 minutes'
    },
    {
      value: 'quick',
      label: 'Quick Scan',
      description: 'Fast check for major red flags',
      duration: '~30 seconds'
    }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'text/plain' || file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.name.endsWith('.txt'))) {
      setContractFile(file);
      setError(null);
    } else {
      setError('Please select a valid text file (.txt) or PDF file');
      setContractFile(null);
    }
  };

  const handleRun = async () => {
    if (inputType === 'text' && !contractText.trim()) {
      setError('Please enter contract text');
      return;
    }
    if (inputType === 'file' && !contractFile) {
      setError('Please select a contract file');
      return;
    }

    setRunning(true);
    setError(null);
    setResult(null);

    try {
      let payload;
      if (inputType === 'file') {
        const formData = new FormData();
        formData.append('contract_file', contractFile);
        formData.append('audit_type', auditType);
        payload = formData;
      } else {
        payload = {
          contract_text: contractText,
          audit_type: auditType
        };
      }

      const response = await onRun(payload);
      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to audit contract');
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
          <AiOutlineWarning className="text-red-500" />
          Legal Contract Auditor
        </h2>
        <p className="text-[var(--muted)] text-lg">
          Audit contracts for unfair clauses, non-standard terms, and negotiation points. Get professional legal analysis and recommendations.
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

        {/* Audit Type Selection */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
          <label className="block text-lg font-medium text-[var(--text)] mb-3">
            Audit Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {auditTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setAuditType(type.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  auditType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-[var(--border)] bg-[var(--bg)] hover:border-[var(--text)]'
                }`}
              >
                <h3 className="font-medium text-[var(--text)]">{type.label}</h3>
                <p className="text-sm text-[var(--muted)] mt-1">{type.description}</p>
                <p className="text-xs text-blue-600 mt-2">Duration: {type.duration}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        {inputType === 'text' && (
          <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
            <label className="block text-lg font-medium text-[var(--text)] mb-3">
              Contract Content
            </label>
            <textarea
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              placeholder="Paste the full contract text here. Include all clauses, terms, and conditions for comprehensive analysis..."
              className="w-full h-96 p-4 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        )}

        {/* File Upload */}
        {inputType === 'file' && (
          <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border-2 border-dashed border-[var(--border)]">
            <div className="text-center">
              <FiFile className="mx-auto h-12 w-12 text-[var(--muted)] mb-4" />
              <label className="block">
                <span className="text-lg font-medium text-[var(--text)] mb-2 block">
                  Upload Contract File
                </span>
                <input
                  type="file"
                  accept=".txt,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="contract-file"
                />
                <Button
                  variant="outline"
                  className="mb-2"
                  onClick={() => document.getElementById('contract-file').click()}
                >
                  Choose Contract File
                </Button>
                {contractFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {contractFile.name}
                  </p>
                )}
              </label>
              <p className="text-sm text-[var(--muted)] mt-2">
                Supports .txt and .pdf files
              </p>
            </div>
          </div>
        )}

        {/* Run Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleRun}
            disabled={
              (inputType === 'text' && !contractText.trim()) ||
              (inputType === 'file' && !contractFile) ||
              running
            }
            className="px-8 py-3 text-lg"
          >
            {running ? 'Auditing Contract...' : 'Audit Contract'}
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
              <h3 className="text-lg font-semibold text-green-800">Contract Audit Complete</h3>
            </div>

            <div className="space-y-4">
              {/* Risk Assessment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded border text-center">
                  <h4 className="font-medium text-gray-900 mb-2">Overall Risk</h4>
                  <p className={`text-2xl font-bold ${
                    result.overall_risk === 'High' ? 'text-red-600' :
                    result.overall_risk === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {result.overall_risk}
                  </p>
                </div>
                <div className="bg-white p-4 rounded border text-center">
                  <h4 className="font-medium text-gray-900 mb-2">Red Flags Found</h4>
                  <p className="text-2xl font-bold text-red-600">{result.red_flags_count || 0}</p>
                </div>
                <div className="bg-white p-4 rounded border text-center">
                  <h4 className="font-medium text-gray-900 mb-2">Negotiation Points</h4>
                  <p className="text-2xl font-bold text-blue-600">{result.negotiation_points_count || 0}</p>
                </div>
              </div>

              {/* Red Flags */}
              {result.red_flags && result.red_flags.length > 0 && (
                <div className="bg-white p-4 rounded border">
                  <div className="flex items-center gap-2 mb-3">
                    <FiAlertTriangle className="text-red-500 h-5 w-5" />
                    <h4 className="font-medium text-gray-900">Critical Issues (Red Flags)</h4>
                  </div>
                  <div className="space-y-2">
                    {result.red_flags.map((flag, index) => (
                      <div key={index} className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                        <p className="text-sm text-red-800">{flag}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Negotiation Points */}
              {result.negotiation_points && (
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-medium text-gray-900 mb-2">Negotiation Opportunities</h4>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">{result.negotiation_points}</pre>
                </div>
              )}

              {/* Summary */}
              {result.summary && (
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-medium text-gray-900 mb-2">Audit Summary</h4>
                  <p className="text-sm text-gray-700">{result.summary}</p>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations && (
                <div className="bg-white p-4 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Recommendations</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.recommendations)}
                      className="flex items-center gap-2"
                    >
                      {copied ? <AiOutlineCheckCircle className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <pre className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap">{result.recommendations}</pre>
                </div>
              )}

              {/* Download Report */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => downloadFile(
                    `Contract Audit Report\n\nOverall Risk: ${result.overall_risk}\nRed Flags: ${result.red_flags_count || 0}\n\nRed Flags:\n${result.red_flags?.join('\n') || 'None'}\n\nNegotiation Points:\n${result.negotiation_points || 'N/A'}\n\nRecommendations:\n${result.recommendations || 'N/A'}`,
                    'contract-audit-report.txt'
                  )}
                  className="flex items-center gap-2"
                >
                  <FiDownload className="h-4 w-4" />
                  Download Audit Report
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ContractAuditorInterface;