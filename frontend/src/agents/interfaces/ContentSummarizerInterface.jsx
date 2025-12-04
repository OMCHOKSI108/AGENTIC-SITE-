import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineFileText, AiOutlineLink, AiOutlineBulb, AiOutlineFilePdf, AiOutlineGlobal } from 'react-icons/ai';
import { FiFileText, FiLink, FiUpload } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const ContentSummarizerInterface = ({ agent, onRun }) => {
  const [inputType, setInputType] = useState('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [summaryLength, setSummaryLength] = useState('medium');
  const [includeKeyPoints, setIncludeKeyPoints] = useState(true);
  const [includeQuotes, setIncludeQuotes] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const lengthOptions = [
    { value: 'short', label: 'Short (1-2 paragraphs)', description: 'Quick overview' },
    { value: 'medium', label: 'Medium (3-5 paragraphs)', description: 'Balanced summary' },
    { value: 'long', label: 'Long (detailed)', description: 'Comprehensive coverage' },
  ];

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleRun = async () => {
    let inputData = {};

    if (inputType === 'url' && !url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    if (inputType === 'text' && !text.trim()) {
      setError('Please enter some text to summarize');
      return;
    }

    if (inputType === 'file' && !file) {
      setError('Please select a file to summarize');
      return;
    }

    setRunning(true);
    setError(null);

    try {
      if (inputType === 'url') {
        inputData = {
          url: url,
          summary_length: summaryLength,
          include_key_points: includeKeyPoints,
          include_quotes: includeQuotes
        };
      } else if (inputType === 'text') {
        inputData = {
          text: text,
          summary_length: summaryLength,
          include_key_points: includeKeyPoints,
          include_quotes: includeQuotes
        };
      } else if (inputType === 'file') {
        inputData = {
          file_path: file.path || file.name,
          summary_length: summaryLength,
          include_key_points: includeKeyPoints,
          include_quotes: includeQuotes
        };
      }

      const response = await onRun(inputData);
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const formatSummaryResult = (result) => {
    if (!result || !result.output) return null;

    const data = result.output;
    if (!data.success) {
      return (
        <div className="text-center text-red-500">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Summarization Failed</h3>
          <p className="text-[var(--text)]">{data.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Summary */}
        {data.summary && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineFileText className="w-5 h-5 text-primary" />
              Summary
            </h3>
            <div className="prose prose-lg max-w-none">
              <div className="text-[var(--text)] leading-relaxed whitespace-pre-wrap">
                {data.summary}
              </div>
            </div>
          </div>
        )}

        {/* Key Points */}
        {data.key_points && data.key_points.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBulb className="w-5 h-5 text-blue-500" />
              Key Points ({data.key_points.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.key_points.map((point, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-[var(--bg)] rounded border border-[var(--muted)]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-[var(--text)] text-sm">{point}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Key Quotes */}
        {data.key_quotes && data.key_quotes.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineFileText className="w-5 h-5 text-green-500" />
              Key Quotes ({data.key_quotes.length})
            </h3>
            <div className="space-y-3">
              {data.key_quotes.map((quote, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-[var(--bg)] rounded-lg border-l-4 border-green-500"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <blockquote className="text-[var(--text)] italic text-lg mb-2">
                    "{quote.text}"
                  </blockquote>
                  {quote.context && (
                    <p className="text-sm text-[var(--muted)]">
                      Context: {quote.context}
                    </p>
                  )}
                  {quote.page && (
                    <p className="text-xs text-[var(--muted)] mt-1">
                      Page {quote.page}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Topics */}
        {data.topics && data.topics.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBulb className="w-5 h-5 text-purple-500" />
              Main Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm rounded-full border border-purple-200 dark:border-purple-800"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sentiment */}
        {data.sentiment && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBulb className="w-5 h-5 text-orange-500" />
              Content Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.sentiment.score && (
                <div className="text-center p-3 bg-[var(--bg)] rounded border">
                  <div className="text-xl font-bold text-[var(--text)] mb-1">
                    {data.sentiment.score}/10
                  </div>
                  <div className="text-sm text-[var(--muted)]">Sentiment Score</div>
                </div>
              )}
              {data.sentiment.label && (
                <div className="text-center p-3 bg-[var(--bg)] rounded border">
                  <div className="text-xl font-bold text-[var(--text)] mb-1 capitalize">
                    {data.sentiment.label}
                  </div>
                  <div className="text-sm text-[var(--muted)]">Overall Tone</div>
                </div>
              )}
              {data.word_count && (
                <div className="text-center p-3 bg-[var(--bg)] rounded border">
                  <div className="text-xl font-bold text-[var(--text)] mb-1">
                    {data.word_count.toLocaleString()}
                  </div>
                  <div className="text-sm text-[var(--muted)]">Word Count</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reading Time */}
        {data.reading_time && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineFileText className="w-5 h-5 text-indigo-500" />
              Reading Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-[var(--bg)] rounded border">
                <div className="text-lg font-bold text-[var(--text)] mb-1">
                  {data.reading_time.original} min
                </div>
                <div className="text-sm text-[var(--muted)]">Original reading time</div>
              </div>
              <div className="p-3 bg-[var(--bg)] rounded border">
                <div className="text-lg font-bold text-[var(--text)] mb-1">
                  {data.reading_time.summary} min
                </div>
                <div className="text-sm text-[var(--muted)]">Summary reading time</div>
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
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-primary to-orange-500 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <AiOutlineFileText className="w-7 h-7 text-primary" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Summarize articles, documents, and web content with AI-powered insights
          </p>
        </div>

        {/* Input Type Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-[var(--text)]">
            Content Source
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'url', label: 'URL', icon: AiOutlineLink },
              { value: 'text', label: 'Text', icon: AiOutlineFileText },
              { value: 'file', label: 'File', icon: AiOutlineFilePdf },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setInputType(type.value)}
                className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                  inputType === type.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-[var(--muted)] bg-[var(--surface)] text-[var(--text)] hover:border-primary/50'
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

        {/* Input Fields */}
        <div className="space-y-4">
          {inputType === 'url' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text)]">
                Article URL
              </label>
              <div className="relative">
                <AiOutlineLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted)] w-5 h-5" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full pl-10 pr-4 py-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}

          {inputType === 'text' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text)]">
                Text Content
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text content here..."
                className="w-full h-40 p-4 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
              <div className="flex justify-between text-xs text-[var(--muted)]">
                <span>{text.split(/\s+/).filter(word => word.length > 0).length} words</span>
                <span>{text.length} characters</span>
              </div>
            </div>
          )}

          {inputType === 'file' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text)]">
                Document File
              </label>
              <div className="border-2 border-dashed border-[var(--muted)] rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? (
                    <div className="space-y-2">
                      <AiOutlineFilePdf className="w-8 h-8 text-primary mx-auto" />
                      <div>
                        <p className="font-semibold text-[var(--text)]">{file.name}</p>
                        <p className="text-sm text-[var(--muted)]">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <AiOutlineFilePdf className="w-8 h-8 text-[var(--muted)] mx-auto" />
                      <div>
                        <p className="font-semibold text-[var(--text)]">Click to upload file</p>
                        <p className="text-sm text-[var(--muted)]">
                          PDF, TXT, DOC, DOCX up to 10MB
                        </p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Summary Options */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              Summary Length
            </label>
            <div className="space-y-2">
              {lengthOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSummaryLength(option.value)}
                  className={`w-full p-3 border rounded-lg text-left transition-all ${
                    summaryLength === option.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-[var(--muted)] bg-[var(--surface)] text-[var(--text)] hover:border-primary/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm opacity-70">{option.description}</div>
                    </div>
                    {summaryLength === option.value && (
                      <div className="w-4 h-4 bg-primary rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--text)]">Include Key Points</label>
              <button
                onClick={() => setIncludeKeyPoints(!includeKeyPoints)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  includeKeyPoints ? 'bg-primary' : 'bg-[var(--muted)]'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    includeKeyPoints ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--text)]">Include Key Quotes</label>
              <button
                onClick={() => setIncludeQuotes(!includeQuotes)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  includeQuotes ? 'bg-primary' : 'bg-[var(--muted)]'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    includeQuotes ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
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
            disabled={running || (inputType === 'url' && !url.trim()) || (inputType === 'text' && !text.trim()) || (inputType === 'file' && !file)}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {running ? (
              <div className="flex items-center gap-3">
                <AiOutlineFileText className="w-5 h-5 animate-spin" />
                <span>Summarizing content...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <AiOutlineFileText className="w-5 h-5" />
                <span>Generate Summary</span>
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
            <AiOutlineFileText className="w-7 h-7 text-primary" />
            Summary Results
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
                  link.download = 'content-summary.json';
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
                <AiOutlineFileText className="w-16 h-16 text-primary" />
              </motion.div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[var(--text)] mb-2">
                  Analyzing content...
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
                  AI is extracting key information and generating insights
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Summarization Failed</h3>
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
                  <AiOutlineFileText className="w-4 h-4" />
                  <span className="font-semibold">Content Summarized Successfully</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Generated comprehensive summary with key insights and analysis
                </p>
              </div>
              {formatSummaryResult(result)}
            </motion.div>
          ) : (
            <div className="text-center text-[var(--muted)] flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <AiOutlineFileText className="w-20 h-20 text-primary/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                Ready for Content Summarization
              </h3>
              <p className="text-lg mb-4 max-w-sm">
                Upload documents, paste text, or provide URLs to get AI-powered summaries with key points, quotes, and insights
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  📄 Multi-format Support
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  🎯 Key Points Extraction
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  💡 AI Insights
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  📊 Content Analysis
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ContentSummarizerInterface;