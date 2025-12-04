import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineFileText, AiOutlineBarChart, AiOutlineDollar, AiOutlineRise, AiOutlineUpload, AiOutlineCheckCircle } from 'react-icons/ai';
import { FiFileText, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const FinancialReportInterface = ({ agent, onRun }) => {
  const [inputType, setInputType] = useState('text');
  const [reportContent, setReportContent] = useState('');
  const [reportType, setReportType] = useState('earnings');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const reportTypes = [
    { value: 'earnings', label: 'Earnings Call', icon: '📈', description: 'Quarterly/Annual earnings reports' },
    { value: '10k', label: '10-K Filing', icon: '📊', description: 'Annual report to SEC' },
    { value: '10q', label: '10-Q Filing', icon: '📋', description: 'Quarterly report to SEC' },
    { value: '8k', label: '8-K Filing', icon: '📰', description: 'Material event disclosures' },
    { value: 'other', label: 'Other Report', icon: '📄', description: 'Financial statements, presentations' },
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReportContent(e.target.result);
        setError(null);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReportContent(e.target.result);
        setError(null);
      };
      reader.readAsText(file);
    } else {
      setError('Please select a valid text file (.txt)');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleRun = async () => {
    if (!reportContent.trim()) {
      setError('Please provide financial report content');
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const response = await onRun({
        pdf_content: reportContent,
        report_type: reportType
      });

      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const formatFinancialResult = (result) => {
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
        {/* Executive Summary */}
        {data.executive_summary && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineFileText className="w-5 h-5 text-blue-500" />
              Executive Summary
            </h3>
            <div className="prose prose-lg max-w-none">
              <div className="text-[var(--text)] leading-relaxed whitespace-pre-wrap">
                {data.executive_summary}
              </div>
            </div>
          </div>
        )}

        {/* Key Financial Metrics */}
        {data.key_metrics && data.key_metrics.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBarChart className="w-5 h-5 text-green-500" />
              Key Financial Metrics ({data.key_metrics.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.key_metrics.map((metric, index) => (
                <motion.div
                  key={index}
                  className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--muted)]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AiOutlineDollar className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-[var(--text)]">{metric.metric}</span>
                  </div>
                  <div className="text-2xl font-bold text-[var(--text)] mb-1">
                    {metric.value}
                  </div>
                  {metric.change && (
                    <div className={`text-sm flex items-center gap-1 ${
                      metric.change.startsWith('+') ? 'text-green-500' :
                      metric.change.startsWith('-') ? 'text-red-500' : 'text-[var(--muted)]'
                    }`}>
                      <AiOutlineRise className="w-3 h-3" />
                      {metric.change}
                    </div>
                  )}
                  {metric.context && (
                    <div className="text-xs text-[var(--muted)] mt-1">
                      {metric.context}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Business Highlights */}
        {data.business_highlights && data.business_highlights.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineRise className="w-5 h-5 text-purple-500" />
              Business Highlights ({data.business_highlights.length})
            </h3>
            <div className="space-y-3">
              {data.business_highlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-[var(--text)] font-medium">{highlight.title}</p>
                    <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                      {highlight.description}
                    </p>
                    {highlight.impact && (
                      <div className="text-xs text-[var(--muted)] mt-2 px-2 py-1 bg-purple-100 dark:bg-purple-800/50 rounded">
                        Impact: {highlight.impact}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Factors */}
        {data.risk_factors && data.risk_factors.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBarChart className="w-5 h-5 text-orange-500" />
              Risk Factors ({data.risk_factors.length})
            </h3>
            <div className="space-y-3">
              {data.risk_factors.map((risk, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    ⚠️
                  </div>
                  <div>
                    <p className="text-[var(--text)] font-medium">{risk.risk}</p>
                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                      {risk.description}
                    </p>
                    {risk.severity && (
                      <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                        risk.severity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        risk.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {risk.severity} risk
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Future Outlook */}
        {data.future_outlook && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineRise className="w-5 h-5 text-indigo-500" />
              Future Outlook
            </h3>
            <div className="prose prose-lg max-w-none">
              <div className="text-[var(--text)] leading-relaxed whitespace-pre-wrap">
                {data.future_outlook}
              </div>
            </div>
          </div>
        )}

        {/* Simplified Summary */}
        {data.simplified_summary && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <FiFileText className="w-5 h-5 text-teal-500" />
              Simplified Summary (Plain Language)
            </h3>
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 border border-teal-200 dark:border-teal-800">
              <div className="text-[var(--text)] leading-relaxed whitespace-pre-wrap text-sm">
                {data.simplified_summary}
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
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <AiOutlineBarChart className="w-7 h-7 text-green-500" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Extract key insights from complex financial reports and simplify them
          </p>
        </div>

        {/* Input Type Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-[var(--text)]">
            Input Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'text', label: 'Paste Text', icon: AiOutlineFileText },
              { value: 'file', label: 'Upload File', icon: AiOutlineUpload },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setInputType(type.value)}
                className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                  inputType === type.value
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-[var(--muted)] bg-[var(--surface)] text-[var(--text)] hover:border-green-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <type.icon className="w-5 h-5" />
                  <span>{type.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Report Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {reportTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          {inputType === 'file' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text)]">
                Financial Report File
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                  reportContent
                    ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                    : 'border-[var(--muted)] hover:border-green-500 hover:bg-green-500/5'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {reportContent ? (
                  <div className="space-y-3">
                    <AiOutlineFileText className="w-12 h-12 text-green-500 mx-auto" />
                    <div>
                      <p className="text-lg font-semibold text-[var(--text)]">File Loaded</p>
                      <p className="text-sm text-[var(--muted)]">
                        {reportContent.length} characters ready for analysis
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AiOutlineFileText className="w-12 h-12 text-[var(--muted)] mx-auto" />
                    <div>
                      <p className="text-lg font-semibold text-[var(--text)]">Drop financial report here</p>
                      <p className="text-sm text-[var(--muted)]">
                        or click to browse • Supports TXT, MD files up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {inputType === 'text' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text)]">
                Financial Report Content
              </label>
              <textarea
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                placeholder="Paste your financial report content here (earnings call transcript, 10-K filing, etc.)..."
                className="w-full h-64 p-4 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-between text-xs text-[var(--muted)]">
                <span>{reportContent.split(/\s+/).filter(word => word.length > 0).length} words</span>
                <span>{reportContent.length} characters</span>
              </div>
            </div>
          )}
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
            disabled={!reportContent.trim() || running}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {running ? (
              <div className="flex items-center gap-3">
                <AiOutlineBarChart className="w-5 h-5 animate-spin" />
                <span>Analyzing Report...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <AiOutlineBarChart className="w-5 h-5" />
                <span>Analyze Financial Report</span>
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
            <AiOutlineFileText className="w-7 h-7 text-green-500" />
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
                  link.download = 'financial-analysis.json';
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export JSON
              </Button>
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
                <AiOutlineBarChart className="w-16 h-16 text-green-500" />
              </motion.div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[var(--text)] mb-2">
                  Analyzing financial report...
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
                  AI is extracting key metrics, business highlights, and simplifying complex financial data
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
                  <span className="font-semibold">Financial Analysis Complete</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Extracted key insights and simplified complex financial information
                </p>
              </div>
              {formatFinancialResult(result)}
            </motion.div>
          ) : (
            <div className="text-center text-[var(--muted)] flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <AiOutlineBarChart className="w-20 h-20 text-green-500/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                Ready for Financial Analysis
              </h3>
              <p className="text-lg mb-4 max-w-sm">
                Upload or paste financial reports to get AI-powered insights, simplified summaries, and key metric extraction
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm">
                  📊 Key Metrics
                </span>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm">
                  💡 Business Insights
                </span>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm">
                  ⚠️ Risk Analysis
                </span>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm">
                  📈 Plain Language
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FinancialReportInterface;