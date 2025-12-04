import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineCloudUpload, AiOutlineFileText, AiOutlineBarChart, AiOutlineTable, AiOutlineBulb } from 'react-icons/ai';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const EDAAgentInterface = ({ agent, onRun }) => {
  const [csvFile, setCsvFile] = useState(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCsvFile(file);
      setError(null);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setError(null);
    } else {
      setError('Please select a valid CSV file');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleRun = async () => {
    if (!csvFile) {
      setError('Please select a CSV file first');
      return;
    }

    setRunning(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('csv_upload', csvFile);

      const response = await onRun(formData);

      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const formatAnalysisResult = (result) => {
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
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <AiOutlineTable className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-700 dark:text-blue-300">Dataset Size</span>
            </div>
            <div className="text-2xl font-bold text-[var(--text)]">{data.rowCount} rows</div>
            <div className="text-sm text-[var(--muted)]">{data.columnCount} columns</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <AiOutlineBarChart className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-700 dark:text-green-300">Analysis Status</span>
            </div>
            <div className="text-2xl font-bold text-green-600">Completed</div>
            <div className="text-sm text-[var(--muted)]">AI Insights Generated</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <AiOutlineBulb className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-700 dark:text-purple-300">Insights</span>
            </div>
            <div className="text-2xl font-bold text-[var(--text)]">{data.analysis?.insights?.length || 0}</div>
            <div className="text-sm text-[var(--muted)]">Key Findings</div>
          </div>
        </div>

        {/* Basic Statistics */}
        {data.analysis?.basic_stats && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBarChart className="w-5 h-5" />
              Basic Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(data.analysis.basic_stats).map(([column, stats]) => (
                <div key={column} className="bg-[var(--bg)] p-4 rounded border border-[var(--muted)]">
                  <h4 className="font-medium text-[var(--text)] mb-2">{column}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">Type:</span>
                      <span className="text-[var(--text)]">{stats.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">Count:</span>
                      <span className="text-[var(--text)]">{stats.count}</span>
                    </div>
                    {stats.type === 'numeric' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-[var(--muted)]">Mean:</span>
                          <span className="text-[var(--text)]">{stats.mean?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--muted)]">Range:</span>
                          <span className="text-[var(--text)]">{stats.min?.toFixed(2)} - {stats.max?.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    {stats.missing > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Missing:</span>
                        <span className="text-red-500">{stats.missing}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Insights */}
        {data.analysis?.insights && data.analysis.insights.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBulb className="w-5 h-5" />
              AI-Generated Insights
            </h3>
            <div className="space-y-3">
              {data.analysis.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-[var(--bg)] rounded border border-[var(--muted)]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-[var(--text)]">{insight}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Data Preview */}
        {data.analysis?.data_preview && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineTable className="w-5 h-5" />
              Data Preview (First 5 Rows)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-[var(--muted)]">
                <thead>
                  <tr className="bg-[var(--bg)]">
                    {Object.keys(data.analysis.data_preview[0] || {}).map((header, index) => (
                      <th key={index} className="border border-[var(--muted)] p-2 text-left text-[var(--text)] font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.analysis.data_preview.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-[var(--bg)]">
                      {Object.values(row).map((cell, cellIndex) => (
                        <td key={cellIndex} className="border border-[var(--muted)] p-2 text-[var(--text)] text-sm">
                          {String(cell).length > 50 ? String(cell).substring(0, 50) + '...' : String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {data.analysis?.recommendations && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBulb className="w-5 h-5" />
              Recommendations
            </h3>
            <ul className="space-y-2">
              {data.analysis.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-[var(--text)]">{rec}</span>
                </li>
              ))}
            </ul>
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
            <AiOutlineBarChart className="w-7 h-7 text-primary" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Upload your CSV file for comprehensive data analysis
          </p>
        </div>

        {/* File Upload Area */}
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
              csvFile
                ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                : 'border-[var(--muted)] hover:border-primary hover:bg-primary/5'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            {csvFile ? (
              <div className="space-y-3">
                <AiOutlineFileText className="w-12 h-12 text-green-500 mx-auto" />
                <div>
                  <p className="text-lg font-semibold text-[var(--text)]">{csvFile.name}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {(csvFile.size / 1024).toFixed(1)} KB • Ready for analysis
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <AiOutlineCloudUpload className="w-12 h-12 text-[var(--muted)] mx-auto" />
                <div>
                  <p className="text-lg font-semibold text-[var(--text)]">Drop your CSV file here</p>
                  <p className="text-sm text-[var(--muted)]">
                    or click to browse • Supports .csv files up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Analysis Options */}
          <div className="bg-[var(--surface)] rounded-lg p-4 border border-[var(--muted)]">
            <h3 className="font-semibold text-[var(--text)] mb-3">Analysis Features</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-[var(--text)]">Statistical Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-[var(--text)]">Data Visualization</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-[var(--text)]">AI Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-[var(--text)]">Recommendations</span>
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
              disabled={!csvFile || running}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {running ? (
                <div className="flex items-center gap-3">
                  <AiOutlineBarChart className="w-5 h-5 animate-spin" />
                  <span>Analyzing your data...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <AiOutlineBarChart className="w-5 h-5" />
                  <span>Run Data Analysis</span>
                </div>
              )}
            </Button>
          </motion.div>
        </div>
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
            <AiOutlineBarChart className="w-7 h-7 text-primary" />
            Analysis Results
          </h2>
        </div>

        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] rounded-xl p-6 min-h-96 border border-primary/10 shadow-lg overflow-y-auto">
          {running ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <AiOutlineBarChart className="w-16 h-16 text-primary" />
              </motion.div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[var(--text)] mb-2">
                  Analyzing your dataset...
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
                  Running statistical analysis and generating AI insights
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
                  <AiOutlineBarChart className="w-4 h-4" />
                  <span className="font-semibold">Analysis Complete</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Your dataset has been successfully analyzed with AI-powered insights
                </p>
              </div>
              {formatAnalysisResult(result)}
            </motion.div>
          ) : (
            <div className="text-center text-[var(--muted)] flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <AiOutlineBarChart className="w-20 h-20 text-primary/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                Ready for Data Analysis
              </h3>
              <p className="text-lg mb-4 max-w-sm">
                Upload your CSV file and get comprehensive statistical analysis with AI-generated insights and recommendations
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  📊 Statistics
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  🤖 AI Insights
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  📈 Visualizations
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EDAAgentInterface;