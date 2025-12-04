import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineFilePdf, AiOutlineFileText, AiOutlineTable, AiOutlineBulb, AiOutlineUpload } from 'react-icons/ai';
import Button from '../../components/ui/Button';

const PDFExtractorInterface = ({ agent, onRun }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPdfFile(file);
      setError(null);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      setPdfFile(file);
      setError(null);
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleRun = async () => {
    if (!pdfFile) {
      setError('Please select a PDF file first');
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pdf_file', pdfFile);

      const response = await onRun({
        pdf_file: pdfFile.path || pdfFile.name
      });

      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const formatExtractionResult = (result) => {
    if (!result || !result.output) return null;

    const data = result.output;
    if (!data.success) {
      return (
        <div className="text-center text-red-500">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Extraction Failed</h3>
          <p className="text-[var(--text)]">{data.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Metadata */}
        {data.extracted_data?.metadata && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineFileText className="w-5 h-5" />
              Document Metadata
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(data.extracted_data.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-3 bg-[var(--bg)] rounded border">
                  <span className="font-medium text-[var(--text)] capitalize">{key.replace('_', ' ')}:</span>
                  <span className="text-[var(--muted)]">{value || 'N/A'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sections */}
        {data.extracted_data?.sections && data.extracted_data.sections.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineFileText className="w-5 h-5" />
              Document Sections ({data.extracted_data.sections.length})
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {data.extracted_data.sections.map((section, index) => (
                <motion.div
                  key={index}
                  className="border border-[var(--muted)] rounded-lg p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-[var(--text)]">{section.title}</h4>
                    <span className="text-xs text-[var(--muted)]">Page {section.page_number}</span>
                  </div>
                  <p className="text-[var(--text)] text-sm leading-relaxed">{section.content}</p>
                  {section.subsections && section.subsections.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-primary/20">
                      <h5 className="text-sm font-medium text-[var(--text)] mb-2">Subsections:</h5>
                      <ul className="space-y-1">
                        {section.subsections.map((sub, subIndex) => (
                          <li key={subIndex} className="text-sm text-[var(--muted)]">
                            • {sub.title}: {sub.content.substring(0, 100)}...
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Tables */}
        {data.extracted_data?.tables && data.extracted_data.tables.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineTable className="w-5 h-5" />
              Extracted Tables ({data.extracted_data.tables.length})
            </h3>
            <div className="space-y-4">
              {data.extracted_data.tables.map((table, index) => (
                <div key={index} className="border border-[var(--muted)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-[var(--text)]">{table.title}</h4>
                    <span className="text-xs text-[var(--muted)]">Page {table.page_number}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-[var(--muted)] text-sm">
                      <thead>
                        <tr className="bg-[var(--bg)]">
                          {table.headers.map((header, headerIndex) => (
                            <th key={headerIndex} className="border border-[var(--muted)] p-2 text-left font-medium text-[var(--text)]">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows.slice(0, 5).map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-[var(--bg)]">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="border border-[var(--muted)] p-2 text-[var(--text)]">
                                {String(cell).length > 30 ? String(cell).substring(0, 30) + '...' : String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {table.rows.length > 5 && (
                      <p className="text-xs text-[var(--muted)] mt-2">
                        Showing first 5 rows of {table.rows.length} total rows
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Points */}
        {data.extracted_data?.key_points && data.extracted_data.key_points.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBulb className="w-5 h-5" />
              Key Points ({data.extracted_data.key_points.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.extracted_data.key_points.map((point, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-[var(--bg)] rounded border border-[var(--muted)]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-[var(--text)] text-sm">{point}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {data.extracted_data?.summary && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineFileText className="w-5 h-5" />
              Document Summary
            </h3>
            <p className="text-[var(--text)] leading-relaxed">{data.extracted_data.summary}</p>
          </div>
        )}

        {/* Entities */}
        {data.extracted_data?.entities && data.extracted_data.entities.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBulb className="w-5 h-5" />
              Named Entities
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.extracted_data.entities.map((entity, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20"
                >
                  {entity}
                </span>
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
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-primary to-orange-500 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <AiOutlineFilePdf className="w-7 h-7 text-primary" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Extract structured data, text, and insights from PDF documents
          </p>
        </div>

        {/* File Upload Area */}
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
              pdfFile
                ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                : 'border-[var(--muted)] hover:border-primary hover:bg-primary/5'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {pdfFile ? (
              <div className="space-y-3">
                <AiOutlineFilePdf className="w-12 h-12 text-red-500 mx-auto" />
                <div>
                  <p className="text-lg font-semibold text-[var(--text)]">{pdfFile.name}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB • Ready for extraction
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <AiOutlineFilePdf className="w-12 h-12 text-[var(--muted)] mx-auto" />
                <div>
                  <p className="text-lg font-semibold text-[var(--text)]">Drop your PDF file here</p>
                  <p className="text-sm text-[var(--muted)]">
                    or click to browse • Supports .pdf files up to 50MB
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

          {/* Extraction Features */}
          <div className="bg-[var(--surface)] rounded-lg p-4 border border-[var(--muted)]">
            <h3 className="font-semibold text-[var(--text)] mb-3">What We Extract</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-[var(--text)]">Text Content</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-[var(--text)]">Document Structure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-[var(--text)]">Tables & Data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-[var(--text)]">Key Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="text-[var(--text)]">Named Entities</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-[var(--text)]">AI Summary</span>
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
              disabled={!pdfFile || running}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {running ? (
                <div className="flex items-center gap-3">
                  <AiOutlineFilePdf className="w-5 h-5 animate-spin" />
                  <span>Extracting document data...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <AiOutlineFilePdf className="w-5 h-5" />
                  <span>Extract Document Data</span>
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
            <AiOutlineFileText className="w-7 h-7 text-primary" />
            Extracted Content
          </h2>
          {result && result.output?.success && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const dataStr = JSON.stringify(result.output.extracted_data, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'extracted-data.json';
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
                <AiOutlineFilePdf className="w-16 h-16 text-primary" />
              </motion.div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[var(--text)] mb-2">
                  Analyzing your document...
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
                  AI is extracting text, tables, and insights from your PDF
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Extraction Failed</h3>
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
                  <AiOutlineFilePdf className="w-4 h-4" />
                  <span className="font-semibold">Document Processed Successfully</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Extracted {result.output.total_pages} pages with structured data and AI insights
                </p>
              </div>
              {formatExtractionResult(result)}
            </motion.div>
          ) : (
            <div className="text-center text-[var(--muted)] flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <AiOutlineFilePdf className="w-20 h-20 text-primary/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                Ready for Document Analysis
              </h3>
              <p className="text-lg mb-4 max-w-sm">
                Upload any PDF document and get comprehensive text extraction, table parsing, and AI-powered insights
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  📄 Text Extraction
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  📊 Table Parsing
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  🤖 AI Insights
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PDFExtractorInterface;