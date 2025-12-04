import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineFileText, AiOutlineSearch, AiOutlineUpload, AiOutlineQuestionCircle, AiOutlineBook, AiOutlineDatabase } from 'react-icons/ai';
import { FiFile, FiUpload, FiSearch, FiMessageSquare } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const KnowledgeBaseInterface = ({ agent, onRun }) => {
  const [query, setQuery] = useState('');
  const [documents, setDocuments] = useState([]);
  const [searchType, setSearchType] = useState('semantic');
  const [includeSources, setIncludeSources] = useState(true);
  const [maxResults, setMaxResults] = useState(5);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const searchTypes = [
    { value: 'semantic', label: 'Semantic Search', icon: '🧠', description: 'AI-powered understanding of meaning' },
    { value: 'keyword', label: 'Keyword Search', icon: '🔍', description: 'Exact word matching' },
    { value: 'hybrid', label: 'Hybrid Search', icon: '⚡', description: 'Best of both approaches' },
  ];

  const supportedFormats = [
    { ext: '.pdf', label: 'PDF', icon: '📄' },
    { ext: '.txt', label: 'Text', icon: '📝' },
    { ext: '.docx', label: 'Word', icon: '📋' },
    { ext: '.md', label: 'Markdown', icon: '📖' },
    { ext: '.html', label: 'HTML', icon: '🌐' },
    { ext: '.json', label: 'JSON', icon: '📊' },
  ];

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      return supportedFormats.some(format => format.ext === ext);
    });

    if (validFiles.length !== files.length) {
      setError('Some files have unsupported formats. Only PDF, TXT, DOCX, MD, HTML, and JSON files are supported.');
      return;
    }

    const newDocuments = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploaded: false,
      processing: false,
      error: null
    }));

    setDocuments(prev => [...prev, ...newDocuments]);
    setError(null);
  };

  const removeDocument = (id) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleRun = async () => {
    if (!query.trim() && documents.length === 0) {
      setError('Please enter a query or upload documents');
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('query', query);
      formData.append('search_type', searchType);
      formData.append('include_sources', includeSources);
      formData.append('max_results', maxResults);

      documents.forEach(doc => {
        formData.append('documents', doc.file);
      });

      const response = await onRun(formData);
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const formatKBResult = (result) => {
    if (!result || !result.output) return null;

    const data = result.output;
    if (!data.success) {
      return (
        <div className="text-center text-red-500">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Knowledge Base Query Failed</h3>
          <p className="text-[var(--text)]">{data.error || result.output.error}</p>
        </div>
      );
    }

    // Handle ingestion results
    if (data.operation === 'ingestion') {
      return (
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
              <AiOutlineDatabase className="w-4 h-4" />
              <span className="font-semibold">Documents Ingested Successfully</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400">
              Processed {data.total_documents} documents, {data.successful_ingestions} successful
            </p>
          </div>

          {data.documents && data.documents.length > 0 && (
            <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
              <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                <AiOutlineFileText className="w-5 h-5 text-blue-500" />
                Processing Results ({data.documents.length})
              </h3>
              <div className="space-y-3">
                {data.documents.map((doc, index) => (
                  <motion.div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      doc.status === 'ingested' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                      'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-[var(--text)]">{doc.filename || doc.doc_path}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        doc.status === 'ingested' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                    {doc.status === 'ingested' ? (
                      <div className="text-sm text-[var(--text)]">
                        {doc.chunks_count} chunks, {doc.total_tokens} tokens
                      </div>
                    ) : (
                      <div className="text-sm text-red-600 dark:text-red-400">
                        Error: {doc.error}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Answer Section */}
        {data.answer && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineQuestionCircle className="w-5 h-5 text-blue-500" />
              Answer
            </h3>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="text-[var(--text)] leading-relaxed whitespace-pre-wrap">
                {data.answer}
              </div>
            </div>
            {data.confidence && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-[var(--muted)]">Confidence:</span>
                <div className="flex-1 bg-[var(--bg)] rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${data.confidence}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-[var(--text)]">{data.confidence}%</span>
              </div>
            )}
          </div>
        )}

        {/* Key Points */}
        {data.key_points && data.key_points.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBook className="w-5 h-5 text-green-500" />
              Key Points ({data.key_points.length})
            </h3>
            <div className="space-y-3">
              {data.key_points.map((point, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="text-[var(--text)]">{point}</div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Related Questions */}
        {data.related_questions && data.related_questions.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineQuestionCircle className="w-5 h-5 text-purple-500" />
              Related Questions ({data.related_questions.length})
            </h3>
            <div className="space-y-2">
              {data.related_questions.map((question, index) => (
                <motion.button
                  key={index}
                  onClick={() => setQuery(question)}
                  className="w-full text-left p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600 dark:text-purple-400">💡</span>
                    <span className="text-[var(--text)]">{question}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Source Documents */}
        {data.sources && data.sources.length > 0 && includeSources && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineFileText className="w-5 h-5 text-orange-500" />
              Source Documents ({data.sources.length})
            </h3>
            <div className="space-y-3">
              {data.sources.map((source, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FiFile className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      <span className="font-medium text-[var(--text)]">{source.filename}</span>
                    </div>
                    <div className="text-sm text-[var(--muted)]">
                      Relevance: {source.relevance_score}%
                    </div>
                  </div>
                  {source.excerpt && (
                    <div className="text-sm text-[var(--text)] mb-2 italic">
                      "{source.excerpt}"
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
                    <span>Page: {source.page || 'N/A'}</span>
                    <span>Chunk: {source.chunk_id || 'N/A'}</span>
                    {source.timestamp && <span>Last updated: {new Date(source.timestamp).toLocaleDateString()}</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Document Processing Status */}
        {data.document_status && data.document_status.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineDatabase className="w-5 h-5 text-indigo-500" />
              Document Processing ({data.document_status.length})
            </h3>
            <div className="space-y-3">
              {data.document_status.map((status, index) => (
                <motion.div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    status.status === 'processed' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                    status.status === 'processing' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                    'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[var(--text)]">{status.filename}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      status.status === 'processed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      status.status === 'processing' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {status.status}
                    </span>
                  </div>
                  <div className="text-sm text-[var(--text)]">
                    {status.message || `${status.chunks_processed || 0} chunks processed`}
                  </div>
                  {status.error && (
                    <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Error: {status.error}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Search Metadata */}
        {data.metadata && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineSearch className="w-5 h-5 text-gray-500" />
              Search Metadata
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.metadata).map(([key, value]) => (
                <div key={key} className="text-center p-3 bg-[var(--bg)] rounded border">
                  <div className="text-lg font-bold text-[var(--text)] mb-1">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </div>
                  <div className="text-sm text-[var(--muted)] capitalize">
                    {key.replace('_', ' ')}
                  </div>
                </div>
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
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <AiOutlineDatabase className="w-7 h-7 text-blue-500" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Search and query your knowledge base with AI-powered document understanding
          </p>
        </div>

        {/* Query Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Query *
          </label>
          <div className="relative">
            <AiOutlineSearch className="absolute left-3 top-3 text-[var(--muted)] w-5 h-5" />
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your documents..."
              rows={3}
              className="w-full pl-10 pr-4 py-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          <p className="text-xs text-[var(--muted)]">
            Enter your question in natural language. The AI will search through your documents to find relevant answers.
          </p>
        </div>

        {/* Document Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Upload Documents
          </label>
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.docx,.md,.html,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 border-2 border-dashed border-[var(--muted)] rounded-lg hover:border-blue-400 transition-colors bg-[var(--surface)] hover:bg-blue-50 dark:hover:bg-blue-900/10"
            >
              <div className="flex flex-col items-center gap-2">
                <AiOutlineUpload className="w-8 h-8 text-[var(--muted)]" />
                <span className="text-[var(--text)] font-medium">Click to upload documents</span>
                <span className="text-sm text-[var(--muted)]">
                  PDF, TXT, DOCX, MD, HTML, JSON supported
                </span>
              </div>
            </button>
          </div>

          {/* Uploaded Documents */}
          {documents.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {documents.map((doc) => (
                <motion.div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-[var(--bg)] rounded-lg border"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex items-center gap-3">
                    <FiFile className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium text-[var(--text)]">{doc.name}</div>
                      <div className="text-xs text-[var(--muted)]">
                        {(doc.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Search Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Search Type
          </label>
          <div className="grid grid-cols-1 gap-2">
            {searchTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSearchType(type.value)}
                className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                  searchType === type.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-[var(--muted)] bg-[var(--surface)] text-[var(--text)] hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{type.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs opacity-70">{type.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--text)]">Include Source References</label>
            <button
              onClick={() => setIncludeSources(!includeSources)}
              className={`w-12 h-6 rounded-full transition-colors ${
                includeSources ? 'bg-blue-500' : 'bg-[var(--muted)]'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  includeSources ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              Max Results: {maxResults}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={maxResults}
              onChange={(e) => setMaxResults(parseInt(e.target.value))}
              className="w-full h-2 bg-[var(--muted)] rounded-lg appearance-none cursor-pointer"
            />
          </div>
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
            disabled={(!query.trim() && documents.length === 0) || running}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {running ? (
              <div className="flex items-center gap-3">
                <AiOutlineSearch className="w-5 h-5 animate-spin" />
                <span>Searching knowledge base...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <AiOutlineSearch className="w-5 h-5" />
                <span>Search Knowledge Base</span>
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
            <AiOutlineBook className="w-7 h-7 text-blue-500" />
            Knowledge Base Results
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
                  link.download = 'kb-results.json';
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
                <AiOutlineDatabase className="w-16 h-16 text-blue-500" />
              </motion.div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[var(--text)] mb-2">
                  Searching knowledge base...
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
                  AI is processing your query, searching through documents, and generating comprehensive answers
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Knowledge Base Query Failed</h3>
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
                  <AiOutlineSearch className="w-4 h-4" />
                  <span className="font-semibold">Query Processed Successfully</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Found relevant information from {result.output.sources?.length || 0} document sources
                </p>
              </div>
              {formatKBResult(result)}
            </motion.div>
          ) : (
            <div className="text-center text-[var(--muted)] flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <AiOutlineDatabase className="w-20 h-20 text-blue-500/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                Ready for Knowledge Base Queries
              </h3>
              <p className="text-lg mb-4 max-w-sm">
                Ask questions about your documents and get AI-powered answers with source references and related insights
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  🧠 Semantic Search
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  📄 Multi-format Support
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  🎯 Source Citations
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  💡 Related Questions
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default KnowledgeBaseInterface;