import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineSearch, AiOutlineYoutube, AiOutlineClockCircle, AiOutlineEye, AiOutlineLike, AiOutlineCalendar, AiOutlineFilter } from 'react-icons/ai';
import { FiPlay, FiThumbsUp, FiEye, FiCalendar } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const YouTubeFinderAgentInterface = ({ agent, onRun }) => {
  const [query, setQuery] = useState('');
  const [maxResults, setMaxResults] = useState(10);
  const [sortBy, setSortBy] = useState('relevance');
  const [duration, setDuration] = useState('any');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const sortOptions = [
    { value: 'relevance', label: 'Relevance', icon: '🎯' },
    { value: 'date', label: 'Upload Date', icon: '📅' },
    { value: 'viewCount', label: 'View Count', icon: '👁️' },
    { value: 'rating', label: 'Rating', icon: '⭐' },
  ];

  const durationOptions = [
    { value: 'any', label: 'Any Duration', icon: '⏱️' },
    { value: 'short', label: 'Short (< 4 min)', icon: '⚡' },
    { value: 'medium', label: 'Medium (4-20 min)', icon: '⏳' },
    { value: 'long', label: 'Long (> 20 min)', icon: '🕐' },
  ];

  const handleRun = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const response = await onRun({
        query: query,
        max_results: maxResults,
        sort_by: sortBy,
        duration: duration
      });

      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const formatYouTubeResult = (result) => {
    if (!result || !result.output) return null;

    const data = result.output;
    if (!data.success) {
      return (
        <div className="text-center text-red-500">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Search Failed</h3>
          <p className="text-[var(--text)]">{data.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Search Summary */}
        <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
          <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
            <AiOutlineSearch className="w-5 h-5 text-red-500" />
            Search Results ({data.videos?.length || 0} videos)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-[var(--bg)] rounded border">
              <div className="text-xl font-bold text-[var(--text)]">{data.total_results || 0}</div>
              <div className="text-sm text-[var(--muted)]">Total Results</div>
            </div>
            <div className="text-center p-3 bg-[var(--bg)] rounded border">
              <div className="text-xl font-bold text-[var(--text)]">{data.videos?.length || 0}</div>
              <div className="text-sm text-[var(--muted)]">Returned</div>
            </div>
            <div className="text-center p-3 bg-[var(--bg)] rounded border">
              <div className="text-xl font-bold text-[var(--text)]">{sortBy}</div>
              <div className="text-sm text-[var(--muted)]">Sorted by</div>
            </div>
          </div>
        </div>

        {/* Video Results */}
        {data.videos && data.videos.length > 0 && (
          <div className="space-y-4">
            {data.videos.map((video, index) => (
              <motion.div
                key={video.id}
                className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)] hover:border-primary/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-40 h-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/160x90/cccccc/666666?text=No+Thumbnail';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <FiPlay className="w-8 h-8 text-white" />
                      </div>
                      {video.duration && (
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                          {video.duration}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[var(--text)] mb-2 line-clamp-2 hover:text-primary transition-colors">
                      <a
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {video.title}
                      </a>
                    </h4>

                    <p className="text-sm text-[var(--muted)] mb-3 line-clamp-2">
                      {video.description}
                    </p>

                    {/* Channel Info */}
                    <div className="flex items-center gap-2 mb-3">
                      <img
                        src={video.channel_thumbnail || 'https://via.placeholder.com/24x24/cccccc/666666?text=C'}
                        alt={video.channel_title}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/24x24/cccccc/666666?text=C';
                        }}
                      />
                      <span className="text-sm text-[var(--text)] hover:text-primary transition-colors">
                        <a
                          href={`https://www.youtube.com/channel/${video.channel_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {video.channel_title}
                        </a>
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 text-xs text-[var(--muted)]">
                      {video.view_count && (
                        <div className="flex items-center gap-1">
                          <AiOutlineEye className="w-3 h-3" />
                          <span>{video.view_count.toLocaleString()} views</span>
                        </div>
                      )}
                      {video.like_count && (
                        <div className="flex items-center gap-1">
                          <AiOutlineLike className="w-3 h-3" />
                          <span>{video.like_count.toLocaleString()} likes</span>
                        </div>
                      )}
                      {video.published_at && (
                        <div className="flex items-center gap-1">
                          <AiOutlineCalendar className="w-3 h-3" />
                          <span>{new Date(video.published_at).toLocaleDateString()}</span>
                        </div>
                      )}
                      {video.duration && (
                        <div className="flex items-center gap-1">
                          <AiOutlineClockCircle className="w-3 h-3" />
                          <span>{video.duration}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {video.tags && video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {video.tags.slice(0, 5).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                        {video.tags.length > 5 && (
                          <span className="text-xs text-[var(--muted)]">
                            +{video.tags.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
                      className="text-xs"
                    >
                      <FiPlay className="w-3 h-3 mr-1" />
                      Watch
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${video.id}`);
                      }}
                      className="text-xs"
                    >
                      Copy Link
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Results */}
        {data.videos && data.videos.length === 0 && (
          <div className="text-center py-12">
            <AiOutlineYoutube className="w-16 h-16 text-[var(--muted)] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[var(--text)] mb-2">No Videos Found</h3>
            <p className="text-[var(--muted)]">
              Try adjusting your search query or filters to find more results.
            </p>
          </div>
        )}

        {/* Search Tips */}
        {data.search_tips && data.search_tips.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBulb className="w-5 h-5 text-blue-500" />
              Search Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.search_tips.map((tip, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-[var(--bg)] rounded border border-[var(--muted)]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    💡
                  </div>
                  <p className="text-sm text-[var(--text)]">{tip}</p>
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
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <AiOutlineYoutube className="w-7 h-7 text-red-500" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Search YouTube videos with advanced filtering and sorting options
          </p>
        </div>

        {/* Search Query */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[var(--text)]">
            Search Query
          </label>
          <div className="relative">
            <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted)] w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter keywords, phrases, or video titles..."
              className="w-full pl-10 pr-4 py-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-red-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleRun()}
            />
          </div>
        </div>

        {/* Search Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Max Results */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              Max Results
            </label>
            <select
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="w-full p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value={5}>5 results</option>
              <option value={10}>10 results</option>
              <option value={25}>25 results</option>
              <option value={50}>50 results</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Duration Filter */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              Duration Filter
            </label>
            <div className="grid grid-cols-2 gap-2">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDuration(option.value)}
                  className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                    duration === option.value
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      : 'border-[var(--muted)] bg-[var(--surface)] text-[var(--text)] hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Search Features */}
        <div className="bg-[var(--surface)] rounded-lg p-4 border border-[var(--muted)]">
          <h3 className="font-semibold text-[var(--text)] mb-3">Search Features</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-[var(--text)]">Advanced Filtering</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-[var(--text)]">Multiple Sort Options</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[var(--text)]">Video Statistics</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-[var(--text)]">Channel Information</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-[var(--text)]">Duration Filtering</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span className="text-[var(--text)]">Direct Links</span>
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
            disabled={!query.trim() || running}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {running ? (
              <div className="flex items-center gap-3">
                <AiOutlineSearch className="w-5 h-5 animate-spin" />
                <span>Searching YouTube...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <AiOutlineYoutube className="w-5 h-5" />
                <span>Search YouTube</span>
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
            <AiOutlineSearch className="w-7 h-7 text-red-500" />
            Search Results
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
                  link.download = 'youtube-search.json';
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export JSON
              </Button>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] rounded-xl p-6 min-h-96 border border-red-500/10 shadow-lg overflow-y-auto">
          {running ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <AiOutlineYoutube className="w-16 h-16 text-red-500" />
              </motion.div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[var(--text)] mb-2">
                  Searching YouTube...
                </div>
                <div className="flex justify-center gap-1 mb-4">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-red-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-red-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-red-500 rounded-full"
                  />
                </div>
                <p className="text-sm text-[var(--muted)] text-center">
                  AI is searching YouTube with your filters and preferences
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Search Failed</h3>
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
                  <AiOutlineYoutube className="w-4 h-4" />
                  <span className="font-semibold">YouTube Search Complete</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Found {result.output.total_results || 0} videos matching your criteria
                </p>
              </div>
              {formatYouTubeResult(result)}
            </motion.div>
          ) : (
            <div className="text-center text-[var(--muted)] flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <AiOutlineYoutube className="w-20 h-20 text-red-500/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                Ready for YouTube Search
              </h3>
              <p className="text-lg mb-4 max-w-sm">
                Enter a search query and get comprehensive YouTube video results with advanced filtering and detailed information
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-sm">
                  🎯 Smart Filtering
                </span>
                <span className="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-sm">
                  📊 Video Stats
                </span>
                <span className="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-sm">
                  📱 Direct Links
                </span>
                <span className="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-sm">
                  🎬 Channel Info
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default YouTubeFinderAgentInterface;