import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineSearch, AiOutlinePlayCircle, AiOutlineClockCircle, AiOutlineEye, AiOutlineLike, AiOutlineCalendar } from 'react-icons/ai';
import { FiSearch, FiPlay, FiClock, FiEye, FiThumbsUp, FiCalendar } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const YouTubeFinderInterface = ({ agent, onRun }) => {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(12);
  const [sortBy, setSortBy] = useState('relevance');
  const [duration, setDuration] = useState('any');
  const [minViews, setMinViews] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const sortOptions = [
    { value: 'relevance', label: 'Relevance', icon: '🎯' },
    { value: 'viewCount', label: 'Most Viewed', icon: '👁️' },
    { value: 'rating', label: 'Highest Rated', icon: '⭐' },
    { value: 'date', label: 'Most Recent', icon: '🕒' }
  ];

  const durationOptions = [
    { value: 'any', label: 'Any Duration', icon: '⏰' },
    { value: 'short', label: 'Short (< 4 min)', icon: '⚡' },
    { value: 'medium', label: 'Medium (4-20 min)', icon: '📏' },
    { value: 'long', label: 'Long (> 20 min)', icon: '⏳' }
  ];

  const handleRun = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('query', query.trim());
      formData.append('limit', limit.toString());
      formData.append('sortBy', sortBy);
      formData.append('duration', duration);
      if (minViews) {
        formData.append('minViews', minViews);
      }

      const response = await onRun(formData);
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
          <h3 className="text-xl font-bold mb-2">YouTube Search Failed</h3>
          <p className="text-[var(--text)]">{data.error || result.output.error}</p>
          {data.videos && data.videos.length === 0 && (
            <p className="text-sm text-[var(--muted)]">No videos found matching your criteria.</p>
          )}
        </div>
      );
    }

    // Handle single video result
    if (data.video) {
      const video = data.video;
      return (
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
              <AiOutlinePlayCircle className="w-4 h-4" />
              <span className="font-semibold">Video Found</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400">
              Found educational content matching your search
            </p>
          </div>

          <motion.div
            className="bg-[var(--surface)] rounded-xl overflow-hidden border border-[var(--muted)] hover:border-red-500/50 transition-all duration-300"
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
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                🎥
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-[var(--text)] mb-2 hover:text-red-500 transition-colors cursor-pointer">
                {video.title}
              </h3>
              <p className="text-[var(--muted)] mb-4">
                by {video.channel}
              </p>
              <p className="text-[var(--text)] mb-4 line-clamp-3">
                {video.description}
              </p>
              <div className="flex items-center gap-6 text-sm text-[var(--muted)] mb-4">
                <span className="flex items-center gap-1">
                  <FiEye className="w-4 h-4" />
                  {video.viewCount.toLocaleString()} views
                </span>
                <span className="flex items-center gap-1">
                  <FiThumbsUp className="w-4 h-4" />
                  {video.likeCount.toLocaleString()} likes
                </span>
                <span className="flex items-center gap-1">
                  <FiCalendar className="w-4 h-4" />
                  {new Date(video.publishedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Tags */}
              {video.tags && video.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {video.tags.slice(0, 8).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded-full"
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
                    <AiOutlinePlayCircle className="w-4 h-4" />
                    Transcript {video.transcript.available ? '(Available)' : '(Not Available)'}
                  </h4>
                  {video.transcript.available ? (
                    <div className="bg-[var(--bg)] p-4 rounded-lg max-h-48 overflow-y-auto">
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

    // Handle multiple videos
    if (data.videos && Array.isArray(data.videos)) {
      return (
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
              <AiOutlineSearch className="w-4 h-4" />
              <span className="font-semibold">Search Results</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400">
              Found {data.totalResults} videos for "{data.query}"
            </p>
          </div>

          <div className="space-y-4">
            {data.videos.map((video, index) => (
              <motion.div
                key={index}
                className="bg-[var(--surface)] rounded-xl overflow-hidden border border-[var(--muted)] hover:border-red-500/50 transition-all duration-300 hover:shadow-lg"
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
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-bold">
                      #{index + 1}
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="text-lg font-bold text-[var(--text)] mb-2 line-clamp-2 hover:text-red-500 transition-colors cursor-pointer">
                      {video.title}
                    </h3>
                    <p className="text-[var(--muted)] text-sm mb-3">
                      by {video.channel}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[var(--muted)] mb-3">
                      <span className="flex items-center gap-1">
                        <FiEye className="w-3 h-3" />
                        {video.viewCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiThumbsUp className="w-3 h-3" />
                        {video.likeCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        {new Date(video.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(video.url, '_blank');
                        }}
                        className="text-xs px-4 py-2 hover:bg-red-50 hover:border-red-500"
                      >
                        Watch Video
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Search Filters Applied */}
          {data.filters && (
            <div className="mt-6 p-4 bg-[var(--bg)] rounded-lg border border-[var(--muted)]">
              <h4 className="font-semibold text-[var(--text)] mb-2">Search Filters Applied:</h4>
              <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                <span>Sort: {data.filters.sortBy}</span>
                <span>Duration: {data.filters.duration}</span>
                {data.filters.minViews > 0 && (
                  <span>Min Views: {data.filters.minViews.toLocaleString()}</span>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
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
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-red-500 to-pink-500 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <FiPlay className="w-7 h-7 text-red-500" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Find the best educational videos and lectures for any topic
          </p>
        </div>

        {/* Search Query */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Search Query *
          </label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-[var(--muted)] w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. dynamic programming algorithms, machine learning basics..."
              className="w-full pl-10 pr-4 py-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-[var(--muted)]">
            Enter what you want to learn. The AI will find the highest-quality educational videos.
          </p>
        </div>

        {/* Search Filters */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--text)] flex items-center gap-2">
            <AiOutlineSearch className="w-5 h-5" />
            Search Filters
          </h3>

          {/* Number of Videos */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              Number of Videos: {limit}
            </label>
            <input
              type="range"
              min="6"
              max="50"
              step="6"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="w-full h-2 bg-[var(--muted)] rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-[var(--muted)]">
              <span>6 videos</span>
              <span>50 videos</span>
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              Sort By
            </label>
            <div className="grid grid-cols-2 gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                    sortBy === option.value
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
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

          {/* Duration */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              Duration
            </label>
            <div className="grid grid-cols-2 gap-2">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDuration(option.value)}
                  className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                    duration === option.value
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
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

          {/* Minimum Views */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              Minimum Views (optional)
            </label>
            <input
              type="number"
              placeholder="e.g. 10000"
              value={minViews}
              onChange={(e) => setMinViews(e.target.value)}
              className="w-full p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-[var(--muted)]">
              Filter out videos with fewer than this many views
            </p>
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
            disabled={running || !query.trim()}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {running ? (
              <div className="flex items-center gap-3">
                <FiSearch className="w-5 h-5 animate-spin" />
                <span>Searching YouTube...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <FiSearch className="w-5 h-5" />
                <span>Find Educational Videos</span>
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
            <AiOutlinePlayCircle className="w-7 h-7 text-red-500" />
            Video Results
          </h2>
          {result && result.output?.success && result.output.videos && (
            <div className="text-sm text-[var(--muted)]">
              {result.output.videos.length} videos found
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
                <FiPlay className="w-16 h-16 text-red-500" />
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
                  AI is searching YouTube for the highest-quality educational content matching your criteria
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
                  <AiOutlineSearch className="w-4 h-4" />
                  <span className="font-semibold">Search Completed</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Found educational videos for your search query
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
                <FiPlay className="w-20 h-20 text-red-500/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                Ready to Find Videos
              </h3>
              <p className="text-lg mb-4 max-w-sm">
                Enter a topic you want to learn about, and discover the best educational videos on YouTube
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-sm">
                  🎓 Educational Content
                </span>
                <span className="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-sm">
                  ⭐ Quality Filtered
                </span>
                <span className="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-sm">
                  📊 Engagement Metrics
                </span>
                <span className="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-sm">
                  🎥 Transcript Available
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default YouTubeFinderInterface;