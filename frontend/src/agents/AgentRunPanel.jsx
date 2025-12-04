import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AiOutlineCloud, AiOutlineFire, AiOutlineThunderbolt, AiOutlineFileText, AiOutlineCaretRight, AiOutlineSetting, AiOutlineCloudUpload } from 'react-icons/ai';
import { AiFillCloud, AiFillFire } from 'react-icons/ai';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import Loader from '../components/ui/Loader.jsx';

const AgentRunPanel = ({ agent, onRun, running, result, error }) => {
  const [formData, setFormData] = useState({});
  const [settings, setSettings] = useState({
    temperature: 0.7,
    maxTokens: 1000,
    model: 'gpt-4',
    limit: 24,
    sortBy: 'relevance',
    duration: 'any',
    minViews: ''
  });
  const [showSettings, setShowSettings] = useState(false);
  const [history, setHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Copy to clipboard function
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  // Download result function
  const downloadResult = () => {
    if (!result) return;

    const resultText = getResultTextForCopy(result);
    const blob = new Blob([resultText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agent.name}_result_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Initialize form data based on agent inputs
  useEffect(() => {
    if (agent?.ui_card?.inputs) {
      const initialData = {};
      agent.ui_card.inputs.forEach(input => {
        initialData[input.name] = '';
      });
      setFormData(initialData);
    }
  }, [agent]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (name, file) => {
    setFormData(prev => ({
      ...prev,
      [name]: file
    }));
  };

  const renderInput = (input) => {
    const { name, type, required } = input;
    const value = formData[name] || '';
    const label = name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    switch (type) {
      case 'text':
        return (
          <div key={name} className="space-y-2">
            <Input
              label={`${label}${required ? ' *' : ''}`}
              placeholder={`Enter ${label.toLowerCase()}...`}
              value={value}
              onChange={(e) => handleInputChange(name, e.target.value)}
              className={name.includes('description') || name.includes('content') ? 'min-h-32' : ''}
              as={name.includes('description') || name.includes('content') ? 'textarea' : 'input'}
            />
            {name.includes('description') || name.includes('content') && (
              <div className="text-xs text-[var(--muted)] text-right">
                {value.length}/2000
              </div>
            )}
          </div>
        );

      case 'file':
      case 'file-upload':
        return (
          <div key={name} className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              {label}{required ? ' *' : ''}
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer ${
                value?.name
                  ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                  : 'border-[var(--muted)] hover:border-primary hover:bg-primary/5'
              }`}
              onClick={() => document.getElementById(`file-${name}`).click()}
            >
              <input
                id={`file-${name}`}
                type="file"
                accept={type === 'file-upload' ? '.csv,.pdf,.docx,.txt' : '*'}
                onChange={(e) => handleFileChange(name, e.target.files[0])}
                className="hidden"
              />
              {value?.name ? (
                <div className="space-y-2">
                  <AiOutlineFileText className="w-8 h-8 text-green-500 mx-auto" />
                  <div>
                    <p className="font-semibold text-[var(--text)]">{value.name}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {(value.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <AiOutlineCloudUpload className="w-8 h-8 text-[var(--muted)] mx-auto" />
                  <div>
                    <p className="font-semibold text-[var(--text)]">Click to upload {label.toLowerCase()}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {type === 'file-upload' ? 'Supports CSV, PDF, DOCX, TXT files' : 'Select a file'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'number':
        return (
          <div key={name} className="space-y-2">
            <Input
              label={`${label}${required ? ' *' : ''}`}
              type="number"
              placeholder={`Enter ${label.toLowerCase()}...`}
              value={value}
              onChange={(e) => handleInputChange(name, e.target.value)}
            />
          </div>
        );

      case 'url':
        return (
          <div key={name} className="space-y-2">
            <Input
              label={`${label}${required ? ' *' : ''}`}
              type="url"
              placeholder={`Enter ${label.toLowerCase()} URL...`}
              value={value}
              onChange={(e) => handleInputChange(name, e.target.value)}
            />
          </div>
        );

      case 'select':
        return (
          <div key={name} className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              {label}{required ? ' *' : ''}
            </label>
            <select
              value={value}
              onChange={(e) => handleInputChange(name, e.target.value)}
              className="w-full p-3 bg-[var(--bg)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select {label.toLowerCase()}...</option>
              {/* Add options based on the input name */}
              {name === 'tone' && (
                <>
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                </>
              )}
              {name === 'skill_level' && (
                <>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </>
              )}
              {name === 'depth' && (
                <>
                  <option value="basic">Basic</option>
                  <option value="detailed">Detailed</option>
                  <option value="comprehensive">Comprehensive</option>
                </>
              )}
              {name === 'diagram_type' && (
                <>
                  <option value="class">Class Diagram</option>
                  <option value="flowchart">Flowchart</option>
                  <option value="sequence">Sequence Diagram</option>
                  <option value="architecture">Architecture Diagram</option>
                </>
              )}
            </select>
          </div>
        );

      default:
        return (
          <div key={name} className="space-y-2">
            <Input
              label={`${label}${required ? ' *' : ''}`}
              placeholder={`Enter ${label.toLowerCase()}...`}
              value={value}
              onChange={(e) => handleInputChange(name, e.target.value)}
            />
          </div>
        );
    }
  };

  const handleRun = async () => {
    // Check required fields
    const requiredInputs = agent?.ui_card?.inputs?.filter(input => input.required) || [];
    const missingFields = requiredInputs.filter(input => {
      const value = formData[input.name];
      return !value || (input.type === 'file' && !value.name);
    });

    if (missingFields.length > 0) {
      alert(`Please fill in required fields: ${missingFields.map(f => f.name).join(', ')}`);
      return;
    }

    // Check if we have file inputs
    const hasFiles = agent?.ui_card?.inputs?.some(input =>
      (input.type === 'file' || input.type === 'file-upload') && formData[input.name]
    );

    let runData;
    if (hasFiles) {
      // Use FormData for file uploads
      runData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          runData.append(key, value);
        } else if (value) {
          runData.append(key, value);
        }
      });
      // Add settings
      runData.append('settings', JSON.stringify({
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        limit: settings.limit,
        sortBy: settings.sortBy,
        duration: settings.duration,
        minViews: settings.minViews ? parseInt(settings.minViews) : undefined
      }));
    } else {
      // Use regular object for non-file data
      runData = {
        ...formData,
        settings: {
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          limit: settings.limit,
          sortBy: settings.sortBy,
          duration: settings.duration,
          minViews: settings.minViews ? parseInt(settings.minViews) : undefined
        }
      };
    }

    setIsTyping(true);
    try {
      const response = await onRun(runData);
      setHistory(prev => [...prev, {
        inputs: formData,
        response: getResultTextForCopy({ output: response.output }),
        timestamp: new Date(),
        success: response.status === 'completed'
      }]);
      // Clear form after successful run
      const clearedData = {};
      Object.keys(formData).forEach(key => {
        clearedData[key] = '';
      });
      setFormData(clearedData);
    } catch (err) {
      console.error('Error running agent:', err);
      setHistory(prev => [...prev, {
        inputs: formData,
        response: 'Failed to generate response. Please try again.',
        timestamp: new Date(),
        success: false
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const getInputDisplayName = (inputs) => {
    if (inputs.prompt) return inputs.prompt;
    const firstValue = Object.values(inputs)[0];
    if (firstValue instanceof File) return firstValue.name;
    if (Array.isArray(firstValue)) {
      if (firstValue.length > 0 && firstValue[0] instanceof File) {
        return firstValue.map(f => f.name).join(', ');
      }
      return firstValue.join(', ');
    }
    return firstValue || 'Agent run';
  };

  const getResultTextForCopy = (result) => {
    if (!result) return '';

    // If result.output is a string, return it directly
    if (typeof result.output === 'string') {
      return result.output;
    }

    // If result.output is an object, format it as text
    if (typeof result.output === 'object') {
      // Check for error responses first
      if (result.output.success === false) {
        let text = `Search Failed\n`;
        text += `Error: ${result.output.error}\n`;
        if (result.output.videos && result.output.videos.length === 0) {
          text += `No videos found.`;
        }
        return text;
      }

      // Special handling for single YouTube video
      if (result.output.video) {
        const video = result.output.video;
        let text = `Video Details\n`;
        text += `Title: ${video.title}\n`;
        text += `Channel: ${video.channel}\n`;
        text += `URL: ${video.url}\n`;
        text += `Description: ${video.description}\n`;
        text += `Views: ${video.viewCount.toLocaleString()}\n`;
        text += `Likes: ${video.likeCount.toLocaleString()}\n`;
        text += `Published: ${new Date(video.publishedAt).toLocaleDateString()}\n`;
        text += `Duration: ${video.duration !== 'Unknown' ? video.duration.replace('PT', '').toLowerCase() : 'N/A'}\n`;

        if (video.tags && video.tags.length > 0) {
          text += `Tags: ${video.tags.slice(0, 10).join(', ')}\n`;
        }

        if (video.transcript) {
          text += `\nTranscript ${video.transcript.available ? '(Available)' : '(Not Available)'}:\n`;
          if (video.transcript.available) {
            text += `${video.transcript.text}\n`;
            if (video.transcript.language) {
              text += `Language: ${video.transcript.language}\n`;
            }
          } else {
            text += `${video.transcript.text}\n`;
            if (video.transcript.note) {
              text += `Note: ${video.transcript.note}\n`;
            }
          }
        }

        return text;
      }

      // Special handling for YouTube results
      if (result.output.videos && Array.isArray(result.output.videos)) {
        let text = `Found ${result.output.totalResults} videos for "${result.output.query}":\n\n`;
        result.output.videos.forEach((video, index) => {
          text += `${index + 1}. ${video.title}\n`;
          text += `   Channel: ${video.channel}\n`;
          text += `   URL: ${video.url}\n`;
          text += `   Duration: ${video.duration}\n`;
          text += `   Views: ${video.viewCount.toLocaleString()}\n`;
          text += `   Likes: ${video.likeCount.toLocaleString()}\n`;
          text += `   Published: ${new Date(video.publishedAt).toLocaleDateString()}\n\n`;
        });

        if (result.output.filters) {
          text += `Search Filters Applied:\n`;
          text += `Sort: ${result.output.filters.sortBy}\n`;
          text += `Duration: ${result.output.filters.duration}\n`;
          if (result.output.filters.minViews > 0) {
            text += `Min Views: ${result.output.filters.minViews.toLocaleString()}\n`;
          }
        }

        return text;
      }

      // For other objects, pretty print JSON
      return JSON.stringify(result.output, null, 2);
    }

    // For other types, convert to string
    return String(result.output);
  };

  const formatResult = (result) => {
    if (!result) return '';

    // If result.output is a string, return it directly
    if (typeof result.output === 'string') {
      return result.output;
    }

    // If result.output is an object, format it nicely
    if (typeof result.output === 'object') {
      // Check for error responses first
      if (result.output.success === false) {
        return (
          <div className="text-center text-red-500">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2">Search Failed</h3>
            <p className="text-[var(--text)] mb-4">{result.output.error}</p>
            {result.output.videos && result.output.videos.length === 0 && (
              <p className="text-sm text-[var(--muted)]">No videos found.</p>
            )}
          </div>
        );
      }

      // Special handling for single YouTube video
      if (result.output.video) {
        const video = result.output.video;
        return (
          <div className="space-y-6">
            <div className="text-lg font-semibold text-[var(--text)]">
              Video Details
            </div>
            <motion.div
              className="bg-[var(--surface)] rounded-xl overflow-hidden border border-[var(--muted)] hover:border-primary/50 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => window.open(video.url, '_blank')}
            >
              <div className="relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/640x360?text=No+Thumbnail';
                  }}
                />
                <div className="absolute bottom-4 right-4 bg-black/80 text-white text-sm px-3 py-1 rounded">
                  {video.duration !== 'Unknown' ? video.duration.replace('PT', '').toLowerCase() : 'N/A'}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[var(--text)] mb-2">
                  {video.title}
                </h3>
                <p className="text-[var(--muted)] mb-4">
                  by {video.channel}
                </p>
                <p className="text-[var(--text)] mb-4 line-clamp-3">
                  {video.description}
                </p>
                <div className="flex items-center gap-6 text-sm text-[var(--muted)] mb-4">
                  <span>👁 {video.viewCount.toLocaleString()} views</span>
                  <span>👍 {video.likeCount.toLocaleString()} likes</span>
                  <span>📅 {new Date(video.publishedAt).toLocaleDateString()}</span>
                </div>

                {/* Tags */}
                {video.tags && video.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {video.tags.slice(0, 10).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transcript Section */}
                {video.transcript && (
                  <div className="border-t border-[var(--muted)] pt-4">
                    <h4 className="font-semibold text-[var(--text)] mb-2 flex items-center gap-2">
                      <AiOutlineFileText className="w-4 h-4" />
                      Transcript {video.transcript.available ? '(Available)' : '(Not Available)'}
                    </h4>
                    {video.transcript.available ? (
                      <div className="bg-[var(--bg)] p-4 rounded-lg max-h-64 overflow-y-auto">
                        <p className="text-sm text-[var(--text)] whitespace-pre-wrap">
                          {video.transcript.text}
                        </p>
                        {video.transcript.language && (
                          <p className="text-xs text-[var(--muted)] mt-2">
                            Language: {video.transcript.language}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--muted)]">
                        {video.transcript.text}
                        {video.transcript.note && (
                          <span className="block mt-1 text-xs">{video.transcript.note}</span>
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        );
      }

      // Special handling for YouTube results
      if (result.output.videos && Array.isArray(result.output.videos)) {
        return (
          <div className="space-y-6">
            <div className="text-lg font-semibold text-[var(--text)]">
              Found {result.output.totalResults} videos for "{result.output.query}"
            </div>
            <div className="space-y-4">
              {result.output.videos.map((video, index) => (
                <motion.div
                  key={index}
                  className="bg-[var(--surface)] rounded-xl overflow-hidden border border-[var(--muted)] hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => window.open(video.url, '_blank')}
                >
                  <div className="flex">
                    <div className="relative w-48 flex-shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/640x360?text=No+Thumbnail';
                        }}
                      />
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {video.duration !== 'Unknown' ? video.duration.replace('PT', '').toLowerCase() : 'N/A'}
                      </div>
                      <div className="absolute top-2 left-2 bg-primary/90 text-white text-xs px-2 py-1 rounded">
                        #{index + 1}
                      </div>
                    </div>
                    <div className="flex-1 p-4">
                      <h3 className="text-lg font-bold text-[var(--text)] mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                        {video.title}
                      </h3>
                      <p className="text-[var(--muted)] text-sm mb-3">
                        by {video.channel}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-[var(--muted)] mb-3">
                        <span>👁 {video.viewCount.toLocaleString()} views</span>
                        <span>👍 {video.likeCount.toLocaleString()} likes</span>
                        <span>📅 {new Date(video.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(video.url, '_blank');
                          }}
                          className="text-xs px-4 py-2"
                        >
                          Click to Visit
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {result.output.filters && (
              <div className="mt-6 p-4 bg-[var(--bg)] rounded-lg border border-[var(--muted)]">
                <h4 className="font-semibold text-[var(--text)] mb-2">Search Filters Applied:</h4>
                <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                  <span>Sort: {result.output.filters.sortBy}</span>
                  <span>Duration: {result.output.filters.duration}</span>
                  {result.output.filters.minViews > 0 && (
                    <span>Min Views: {result.output.filters.minViews.toLocaleString()}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }

      // For other objects, pretty print JSON
      return JSON.stringify(result.output, null, 2);
    }

    // For other types, convert to string
    return String(result.output);
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
            <AiFillFire className="w-7 h-7 text-primary" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Experience the power of AI automation
          </p>
        </div>

        {/* Agent Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-4 rounded-xl border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AiOutlineThunderbolt className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium text-blue-600">Speed</span>
            </div>
            <div className="text-lg font-bold text-[var(--text)]">&lt; 2s</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 p-4 rounded-xl border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AiFillCloud className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-green-600">Accuracy</span>
            </div>
            <div className="text-lg font-bold text-[var(--text)]">99%</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-4 rounded-xl border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AiFillFire className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-medium text-purple-600">Quality</span>
            </div>
            <div className="text-lg font-bold text-[var(--text)]">A+</div>
          </div>
        </div>

        {/* Dynamic Input Fields */}
        <div className="space-y-4">
          {agent?.ui_card?.inputs?.map(input => renderInput(input)) || (
            <div className="relative">
              <Input
                label="Your Request"
                placeholder={`Tell ${agent.name} what you need...`}
                value={formData.prompt || ''}
                onChange={(e) => handleInputChange('prompt', e.target.value)}
                className="min-h-32 text-lg"
                as="textarea"
              />
              <div className="absolute bottom-3 right-3 text-xs text-[var(--muted)]">
                {(formData.prompt || '').length}/2000
              </div>
            </div>
          )}

          {/* Advanced Settings Toggle */}
          <motion.button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-sm text-primary hover:text-orange-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <AiOutlineSetting className="w-4 h-4" />
            {showSettings ? 'Hide' : 'Show'} Advanced Settings
          </motion.button>

          {/* Advanced Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                className="space-y-4 p-6 bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] rounded-xl border border-primary/20 shadow-lg"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="font-semibold text-[var(--text)] flex items-center gap-2">
                  <AiOutlineFire className="w-4 h-4" />
                  AI Parameters
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                      Creativity Level
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={settings.temperature}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        temperature: parseFloat(e.target.value)
                      }))}
                      className="w-full h-2 bg-[var(--muted)] rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-[var(--muted)] mt-1">
                      <span>Focused</span>
                      <span className="font-medium text-primary">{settings.temperature}</span>
                      <span>Creative</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                      Response Length
                    </label>
                    <select
                      value={settings.maxTokens}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        maxTokens: parseInt(e.target.value)
                      }))}
                      className="w-full p-2 bg-[var(--bg)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-primary"
                    >
                      <option value={500}>Short (500)</option>
                      <option value={1000}>Medium (1000)</option>
                      <option value={2000}>Long (2000)</option>
                      <option value={4000}>Extended (4000)</option>
                    </select>
                  </div>
                </div>

                {/* YouTube-specific filters */}
                {agent.slug === 'youtube-finder' && (
                  <>
                    <h3 className="font-semibold text-[var(--text)] flex items-center gap-2 mt-6">
                      <AiOutlineCloud className="w-4 h-4" />
                      YouTube Search Filters
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text)] mb-2">
                          Number of Videos
                        </label>
                        <select
                          value={settings.limit}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            limit: parseInt(e.target.value)
                          }))}
                          className="w-full p-2 bg-[var(--bg)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-primary"
                        >
                          <option value={12}>12 videos</option>
                          <option value={24}>24 videos</option>
                          <option value={36}>36 videos</option>
                          <option value={50}>50 videos</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text)] mb-2">
                          Sort By
                        </label>
                        <select
                          value={settings.sortBy}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            sortBy: e.target.value
                          }))}
                          className="w-full p-2 bg-[var(--bg)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-primary"
                        >
                          <option value="relevance">Relevance</option>
                          <option value="viewCount">Most Viewed</option>
                          <option value="rating">Highest Rated</option>
                          <option value="date">Most Recent</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text)] mb-2">
                          Duration
                        </label>
                        <select
                          value={settings.duration}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            duration: e.target.value
                          }))}
                          className="w-full p-2 bg-[var(--bg)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-primary"
                        >
                          <option value="any">Any Duration</option>
                          <option value="short">Short (&lt; 4 min)</option>
                          <option value="medium">Medium (4-20 min)</option>
                          <option value="long">Long (&gt; 20 min)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text)] mb-2">
                          Minimum Views
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 1000"
                          value={settings.minViews}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            minViews: e.target.value
                          }))}
                          className="w-full p-2 bg-[var(--bg)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Run Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={handleRun}
              loading={running || isTyping}
              disabled={running || isTyping}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {running ? (
                <div className="flex items-center gap-3">
                  <Loader size="sm" />
                  <span>AI is working magic...</span>
                </div>
              ) : isTyping ? (
                <div className="flex items-center gap-3">
                  <AiOutlineFire className="w-5 h-5 animate-spin" />
                  <span>Generating response...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <AiOutlineCaretRight className="w-5 h-5" />
                  <span>Run {agent.name} AI</span>
                </div>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Recent Activity */}
        {history.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineFileText className="w-5 h-5" />
              Recent Activity
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {history.slice(-3).reverse().map((item, index) => (
                <motion.div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    item.success
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => copyToClipboard(item.response)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {item.success ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                    <p className="text-sm font-medium text-[var(--text)] truncate">
                      {getInputDisplayName(item.inputs)}
                    </p>
                  </div>
                  <p className="text-xs text-[var(--muted)]">
                    {item.timestamp.toLocaleTimeString()}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
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
            <AiFillFire className="w-7 h-7 text-primary" />
            AI Response
          </h2>
          {result && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(getResultTextForCopy(result))}
                className="hover:bg-primary/10"
              >
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadResult}
                className="hover:bg-primary/10"
              >
                Download
              </Button>
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-xl p-6 min-h-96 border border-gray-700 shadow-lg font-mono text-green-400 overflow-hidden">
          {running ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <AiFillCloud className="w-16 h-16 text-green-400" />
              </motion.div>
              <Loader size="lg" text="AI is processing your request..." />
              <p className="text-sm text-green-300 mt-4 text-center max-w-xs">
                Our advanced AI is analyzing your input and generating a powerful response
              </p>
            </div>
          ) : isTyping ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mb-4"
              >
                <AiFillFire className="w-16 h-16 text-green-400" />
              </motion.div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-400 mb-2">
                  Crafting your response...
                </div>
                <div className="flex justify-center gap-1">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-green-400 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-green-400 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-green-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-400 h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Oops! Something went wrong</h3>
              <p className="text-red-300 mb-4">{error}</p>
              <Button onClick={handleRun} variant="outline">
                Try Again
              </Button>
            </div>
          ) : result ? (
            <motion.div
              className="h-full overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-green-900/20 border border-green-700 rounded p-4 mb-4">
                <div className="flex items-center gap-2 text-green-300 mb-2">
                  <AiFillFire className="w-4 h-4" />
                  <span className="font-semibold">[AI Generated Response]</span>
                </div>
              </div>
              <div className="text-green-400 leading-relaxed whitespace-pre-wrap text-sm">
                {formatResult(result)}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs text-green-600">
                  <span>Generated by {agent.name} AI</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center text-green-600 flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <AiOutlineCloud className="w-20 h-20 text-green-400/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-green-400">
                Ready for AI Magic
              </h3>
              <p className="text-sm mb-4 max-w-sm">
                Enter your request above and watch as our advanced AI transforms your input into something extraordinary
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-green-900/50 text-green-300 rounded text-xs border border-green-700">
                  ⚡ Lightning Fast
                </span>
                <span className="px-3 py-1 bg-green-900/50 text-green-300 rounded text-xs border border-green-700">
                  🎯 Highly Accurate
                </span>
                <span className="px-3 py-1 bg-green-900/50 text-green-300 rounded text-xs border border-green-700">
                  ✨ Impressively Smart
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AgentRunPanel;