import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineBarChart, AiOutlineDownload, AiOutlineCopy, AiOutlineCheckCircle } from 'react-icons/ai';
import { FiBarChart, FiDownload, FiCopy } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const TradingBacktesterInterface = ({ agent, onRun }) => {
  const [strategyDescription, setStrategyDescription] = useState('');
  const [historicalData, setHistoricalData] = useState(null);
  const [initialCapital, setInitialCapital] = useState('10000');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setHistoricalData(file);
      setError(null);
    } else {
      setError('Please select a valid CSV file with historical price data');
      setHistoricalData(null);
    }
  };

  const handleRun = async () => {
    if (!strategyDescription.trim()) {
      setError('Please describe your trading strategy');
      return;
    }
    if (!historicalData) {
      setError('Please upload historical price data (CSV)');
      return;
    }

    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('strategy_description', strategyDescription);
      formData.append('historical_data', historicalData);
      formData.append('initial_capital', initialCapital);

      const response = await onRun(formData);
      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to backtest strategy');
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
          <AiOutlineBarChart className="text-green-500" />
          Trading Strategy Backtester
        </h2>
        <p className="text-[var(--muted)] text-lg">
          Upload historical price data and describe your trading strategy to get performance metrics, ROI, and risk analysis
        </p>
      </div>

      <div className="space-y-6">
        {/* Strategy Description */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
          <label className="block text-lg font-medium text-[var(--text)] mb-3">
            Trading Strategy Description
          </label>
          <textarea
            value={strategyDescription}
            onChange={(e) => setStrategyDescription(e.target.value)}
            placeholder="Describe your trading strategy (e.g., 'Buy when RSI < 30 and MACD crosses above signal line, sell when RSI > 70 or stop loss at 2%')"
            className="w-full h-32 p-4 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Historical Data Upload */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border-2 border-dashed border-[var(--border)]">
          <div className="text-center">
            <FiBarChart className="mx-auto h-12 w-12 text-[var(--muted)] mb-4" />
            <label className="block">
              <span className="text-lg font-medium text-[var(--text)] mb-2 block">
                Historical Price Data (CSV)
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="historical-data"
              />
              <Button
                variant="outline"
                className="mb-2"
                onClick={() => document.getElementById('historical-data').click()}
              >
                Choose CSV File
              </Button>
              {historicalData && (
                <p className="text-sm text-green-600 mt-2">
                  Selected: {historicalData.name}
                </p>
              )}
            </label>
            <p className="text-sm text-[var(--muted)] mt-2">
              CSV should contain columns: date, open, high, low, close, volume
            </p>
          </div>
        </div>

        {/* Initial Capital */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
          <label className="block text-lg font-medium text-[var(--text)] mb-3">
            Initial Capital ($)
          </label>
          <input
            type="number"
            value={initialCapital}
            onChange={(e) => setInitialCapital(e.target.value)}
            placeholder="10000"
            min="100"
            className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Run Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleRun}
            disabled={!strategyDescription.trim() || !historicalData || running}
            className="px-8 py-3 text-lg"
          >
            {running ? 'Running Backtest...' : 'Run Backtest'}
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
              <h3 className="text-lg font-semibold text-green-800">Backtest Results</h3>
            </div>

            <div className="space-y-4">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded border text-center">
                  <h4 className="font-medium text-gray-900 mb-2">Total Return</h4>
                  <p className={`text-2xl font-bold ${result.total_return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.total_return}%
                  </p>
                </div>
                <div className="bg-white p-4 rounded border text-center">
                  <h4 className="font-medium text-gray-900 mb-2">Win Rate</h4>
                  <p className="text-2xl font-bold text-blue-600">{result.win_rate}%</p>
                </div>
                <div className="bg-white p-4 rounded border text-center">
                  <h4 className="font-medium text-gray-900 mb-2">Max Drawdown</h4>
                  <p className="text-2xl font-bold text-red-600">{result.max_drawdown}%</p>
                </div>
                <div className="bg-white p-4 rounded border text-center">
                  <h4 className="font-medium text-gray-900 mb-2">Sharpe Ratio</h4>
                  <p className="text-2xl font-bold text-purple-600">{result.sharpe_ratio}</p>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="bg-white p-4 rounded border">
                <h4 className="font-medium text-gray-900 mb-2">Performance Summary</h4>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{result.summary}</pre>
              </div>

              {/* Trade Log */}
              {result.trade_log && (
                <div className="bg-white p-4 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Trade Log</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.trade_log)}
                      className="flex items-center gap-2"
                    >
                      {copied ? <AiOutlineCheckCircle className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <pre className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap max-h-64 overflow-y-auto">{result.trade_log}</pre>
                </div>
              )}

              {/* Risk Analysis */}
              {result.risk_analysis && (
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-medium text-gray-900 mb-2">Risk Analysis</h4>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">{result.risk_analysis}</pre>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => downloadFile(
                    `Performance Summary:\n${result.summary}\n\nTrade Log:\n${result.trade_log || 'N/A'}\n\nRisk Analysis:\n${result.risk_analysis || 'N/A'}`,
                    'backtest-report.txt'
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

export default TradingBacktesterInterface;