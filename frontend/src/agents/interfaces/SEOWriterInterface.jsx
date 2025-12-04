import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineFileText, AiOutlineSearch, AiOutlineBulb, AiOutlineTag, AiOutlineBarChart, AiOutlineGlobal } from 'react-icons/ai';
import { FiFileText, FiSearch, FiTrendingUp, FiHash } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const SEOWriterInterface = ({ agent, onRun }) => {
  const [keyword, setKeyword] = useState('');
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [contentType, setContentType] = useState('blog_post');
  const [wordCount, setWordCount] = useState(1500);
  const [tone, setTone] = useState('professional');
  const [includeImages, setIncludeImages] = useState(true);
  const [includeMeta, setIncludeMeta] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const contentTypes = [
    { value: 'blog_post', label: 'Blog Post', icon: '📝', description: 'Informative articles and guides' },
    { value: 'landing_page', label: 'Landing Page', icon: '🎯', description: 'Conversion-focused pages' },
    { value: 'product_description', label: 'Product Description', icon: '🛍️', description: 'E-commerce product pages' },
    { value: 'service_page', label: 'Service Page', icon: '🔧', description: 'Service offering pages' },
    { value: 'news_article', label: 'News Article', icon: '📰', description: 'News and announcements' },
    { value: 'how_to_guide', label: 'How-to Guide', icon: '📋', description: 'Tutorial and instructional content' },
  ];

  const toneOptions = [
    { value: 'professional', label: 'Professional', color: 'blue' },
    { value: 'conversational', label: 'Conversational', color: 'green' },
    { value: 'authoritative', label: 'Authoritative', color: 'purple' },
    { value: 'friendly', label: 'Friendly', color: 'orange' },
    { value: 'educational', label: 'Educational', color: 'teal' },
  ];

  const handleRun = async () => {
    if (!keyword.trim()) {
      setError('Please enter a target keyword');
      return;
    }

    if (!topic.trim()) {
      setError('Please specify the content topic');
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const response = await onRun({
        keyword: keyword,
        topic: topic,
        target_audience: targetAudience,
        content_type: contentType,
        word_count: wordCount,
        tone: tone,
        include_images: includeImages,
        include_meta: includeMeta
      });

      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const formatSEOContentResult = (result) => {
    if (!result || !result.output) return null;

    const data = result.output;
    if (!data.success) {
      return (
        <div className="text-center text-red-500">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Content Generation Failed</h3>
          <p className="text-[var(--text)]">{data.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* SEO Meta Information */}
        {data.meta && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineSearch className="w-5 h-5 text-green-500" />
              SEO Meta Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text)]">Title Tag</label>
                <div className="p-3 bg-[var(--bg)] rounded border text-sm text-[var(--text)]">
                  {data.meta.title}
                </div>
                <div className="text-xs text-[var(--muted)]">
                  Length: {data.meta.title.length} characters
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text)]">Meta Description</label>
                <div className="p-3 bg-[var(--bg)] rounded border text-sm text-[var(--text)]">
                  {data.meta.description}
                </div>
                <div className="text-xs text-[var(--muted)]">
                  Length: {data.meta.description.length} characters
                </div>
              </div>
            </div>
            {data.meta.keywords && (
              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-[var(--text)]">Target Keywords</label>
                <div className="flex flex-wrap gap-2">
                  {data.meta.keywords.map((kw, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm rounded-full border border-green-200 dark:border-green-800"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generated Content */}
        {data.content && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineFileText className="w-5 h-5 text-primary" />
              Generated Content
            </h3>
            <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--muted)]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-[var(--text)]">Article Content</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(data.content);
                  }}
                >
                  Copy Content
                </Button>
              </div>
              <div className="prose prose-lg max-w-none">
                <div className="text-[var(--text)] leading-relaxed whitespace-pre-wrap">
                  {data.content}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEO Analysis */}
        {data.seo_analysis && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBarChart className="w-5 h-5 text-blue-500" />
              SEO Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.seo_analysis.keyword_density && (
                <div className="text-center p-3 bg-[var(--bg)] rounded border">
                  <div className="text-lg font-bold text-[var(--text)]">{data.seo_analysis.keyword_density}%</div>
                  <div className="text-sm text-[var(--muted)]">Keyword Density</div>
                </div>
              )}
              {data.seo_analysis.readability_score && (
                <div className="text-center p-3 bg-[var(--bg)] rounded border">
                  <div className="text-lg font-bold text-[var(--text)]">{data.seo_analysis.readability_score}/100</div>
                  <div className="text-sm text-[var(--muted)]">Readability</div>
                </div>
              )}
              {data.seo_analysis.word_count && (
                <div className="text-center p-3 bg-[var(--bg)] rounded border">
                  <div className="text-lg font-bold text-[var(--text)]">{data.seo_analysis.word_count}</div>
                  <div className="text-sm text-[var(--muted)]">Word Count</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Headings Structure */}
        {data.headings && data.headings.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineTag className="w-5 h-5 text-purple-500" />
              Content Structure ({data.headings.length} headings)
            </h3>
            <div className="space-y-2">
              {data.headings.map((heading, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded border border-[var(--muted)]">
                  <span className={`text-sm font-bold px-2 py-1 rounded ${
                    heading.level === 'H1' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                    heading.level === 'H2' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                    heading.level === 'H3' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                  }`}>
                    {heading.level}
                  </span>
                  <span className="text-[var(--text)] flex-1">{heading.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Suggestions */}
        {data.image_suggestions && data.image_suggestions.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineGlobal className="w-5 h-5 text-orange-500" />
              Image Suggestions ({data.image_suggestions.length})
            </h3>
            <div className="space-y-3">
              {data.image_suggestions.map((image, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-[var(--text)] font-medium">{image.alt_text}</p>
                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                      Placement: {image.placement} • Type: {image.type}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Internal Links */}
        {data.internal_links && data.internal_links.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBulb className="w-5 h-5 text-indigo-500" />
              Internal Linking Suggestions ({data.internal_links.length})
            </h3>
            <div className="space-y-2">
              {data.internal_links.map((link, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded border border-[var(--muted)]">
                  <AiOutlineGlobal className="w-4 h-4 text-indigo-500" />
                  <div className="flex-1">
                    <div className="text-[var(--text)] font-medium">{link.anchor_text}</div>
                    <div className="text-sm text-[var(--muted)]">{link.target_url}</div>
                  </div>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400">
                    {link.purpose}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Performance Predictions */}
        {data.performance_predictions && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBarChart className="w-5 h-5 text-teal-500" />
              Performance Predictions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(data.performance_predictions).map(([key, value]) => (
                <div key={key} className="p-3 bg-[var(--bg)] rounded border">
                  <div className="text-lg font-bold text-[var(--text)] mb-1">
                    {typeof value === 'number' ? (value > 1 ? value.toFixed(1) : `${(value * 100).toFixed(1)}%`) : value}
                  </div>
                  <div className="text-sm text-[var(--muted)] capitalize">
                    {key.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optimization Tips */}
        {data.optimization_tips && data.optimization_tips.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBulb className="w-5 h-5 text-pink-500" />
              SEO Optimization Tips ({data.optimization_tips.length})
            </h3>
            <div className="space-y-3">
              {data.optimization_tips.map((tip, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AiOutlineBulb className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-[var(--text)] mb-1">{tip.title}</h4>
                    <p className="text-sm text-[var(--text)]">{tip.description}</p>
                    {tip.impact && (
                      <div className="text-xs text-pink-600 dark:text-pink-400 mt-1">
                        Impact: {tip.impact}
                      </div>
                    )}
                  </div>
                </motion.div>
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
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <AiOutlineFileText className="w-7 h-7 text-green-500" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Generate SEO-optimized content with meta tags, keywords, and performance predictions
          </p>
        </div>

        {/* Target Keyword */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Target Keyword *
          </label>
          <div className="relative">
            <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted)] w-5 h-5" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., best productivity tools 2024"
              className="w-full pl-10 pr-4 py-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content Topic */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Content Topic *
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Describe what the content should cover..."
            className="w-full h-24 p-4 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Target Audience
          </label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g., small business owners, developers, students"
            className="w-full p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Content Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Content Type
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {contentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Word Count */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              Target Word Count
            </label>
            <select
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="w-full p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value={500}>500 words</option>
              <option value={1000}>1,000 words</option>
              <option value={1500}>1,500 words</option>
              <option value={2000}>2,000 words</option>
              <option value={2500}>2,500 words</option>
            </select>
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              Writing Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {toneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--text)]">Include Image Suggestions</label>
            <button
              onClick={() => setIncludeImages(!includeImages)}
              className={`w-12 h-6 rounded-full transition-colors ${
                includeImages ? 'bg-green-500' : 'bg-[var(--muted)]'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  includeImages ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--text)]">Include Meta Tags</label>
            <button
              onClick={() => setIncludeMeta(!includeMeta)}
              className={`w-12 h-6 rounded-full transition-colors ${
                includeMeta ? 'bg-green-500' : 'bg-[var(--muted)]'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  includeMeta ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
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
            disabled={!keyword.trim() || !topic.trim() || running}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {running ? (
              <div className="flex items-center gap-3">
                <AiOutlineFileText className="w-5 h-5 animate-spin" />
                <span>Generating SEO content...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <AiOutlineFileText className="w-5 h-5" />
                <span>Generate SEO Content</span>
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
            <AiOutlineSearch className="w-7 h-7 text-green-500" />
            SEO Content Results
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
                  link.download = 'seo-content.json';
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
                <AiOutlineFileText className="w-16 h-16 text-green-500" />
              </motion.div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[var(--text)] mb-2">
                  Crafting SEO content...
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
                  AI is generating optimized content with SEO best practices and performance predictions
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Content Generation Failed</h3>
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
                  <span className="font-semibold">SEO Content Generated Successfully</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Created optimized content with meta tags, keyword integration, and SEO analysis
                </p>
              </div>
              {formatSEOContentResult(result)}
            </motion.div>
          ) : (
            <div className="text-center text-[var(--muted)] flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <AiOutlineFileText className="w-20 h-20 text-green-500/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                Ready for SEO Content Generation
              </h3>
              <p className="text-lg mb-4 max-w-sm">
                Enter a keyword and topic to generate SEO-optimized content with meta tags, keyword integration, and performance predictions
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm">
                  🎯 Keyword Optimization
                </span>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm">
                  📊 SEO Analysis
                </span>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm">
                  🏷️ Meta Tags
                </span>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm">
                  📈 Performance Predictions
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SEOWriterInterface;