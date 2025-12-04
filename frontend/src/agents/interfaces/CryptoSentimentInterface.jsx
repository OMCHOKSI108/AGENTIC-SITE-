import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineSearch, AiOutlineGlobal, AiOutlineTwitter, AiOutlineReddit, AiOutlineBarChart, AiOutlineCheckCircle, AiOutlineRise } from 'react-icons/ai';
import { FiTrendingUp, FiTrendingDown, FiActivity } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const CryptoSentimentInterface = ({ agent, onRun }) => {
  const [coinSymbol, setCoinSymbol] = useState('');
  const [timeframe, setTimeframe] = useState('24h');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const timeframeOptions = [
    { value: '1h', label: 'Last Hour', icon: '⏰' },
    { value: '24h', label: 'Last 24 Hours', icon: '📅' },
    { value: '7d', label: 'Last 7 Days', icon: '📊' },
    { value: '30d', label: 'Last 30 Days', icon: '📈' },
  ];

  const popularCoins = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'BNB', name: 'Binance Coin' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'DOT', name: 'Polkadot' },
    { symbol: 'AVAX', name: 'Avalanche' },
    { symbol: 'MATIC', name: 'Polygon' },
  ];

  const handleRun = async () => {
    if (!coinSymbol.trim()) {
      setError('Please enter a cryptocurrency symbol');
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const response = await onRun({
        coin_symbol: coinSymbol.toUpperCase(),
        timeframe: timeframe
      });

      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const formatSentimentResult = (result) => {
    if (!result || !result.output) return null;

    const data = result.output;
    if (!data.success) {
      return (
        <div className="text-center text-red-500">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Sentiment Analysis Failed</h3>
          <p className="text-[var(--text)]">{data.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Overall Sentiment Score */}
        {data.overall_sentiment && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBarChart className="w-5 h-5 text-blue-500" />
              Overall Sentiment Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sentiment Score */}
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${
                  data.overall_sentiment.score >= 70 ? 'text-green-500' :
                  data.overall_sentiment.score >= 40 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {data.overall_sentiment.score}/100
                </div>
                <div className="text-sm text-[var(--muted)]">Sentiment Score</div>
                <div className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                  data.overall_sentiment.sentiment === 'bullish' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                  data.overall_sentiment.sentiment === 'bearish' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                }`}>
                  {data.overall_sentiment.sentiment}
                </div>
              </div>

              {/* Sources Analyzed */}
              <div className="text-center">
                <div className="text-4xl font-bold text-[var(--text)] mb-2">
                  {data.overall_sentiment.sources_analyzed || 0}
                </div>
                <div className="text-sm text-[var(--muted)]">Sources Analyzed</div>
              </div>

              {/* Confidence Level */}
              <div className="text-center">
                <div className="text-4xl font-bold text-[var(--text)] mb-2">
                  {data.overall_sentiment.confidence || 0}%
                </div>
                <div className="text-sm text-[var(--muted)]">Confidence</div>
              </div>
            </div>
          </div>
        )}

        {/* Sentiment by Source */}
        {data.sentiment_by_source && data.sentiment_by_source.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineGlobal className="w-5 h-5 text-purple-500" />
              Sentiment by Source ({data.sentiment_by_source.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.sentiment_by_source.map((source, index) => (
                <motion.div
                  key={index}
                  className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--muted)]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {source.source_type === 'news' && <AiOutlineGlobal className="w-4 h-4 text-blue-500" />}
                      {source.source_type === 'twitter' && <AiOutlineTwitter className="w-4 h-4 text-blue-400" />}
                      {source.source_type === 'reddit' && <AiOutlineReddit className="w-4 h-4 text-orange-500" />}
                      <span className="font-medium text-[var(--text)] capitalize">{source.source_type}</span>
                    </div>
                    <div className={`text-sm px-2 py-1 rounded-full ${
                      source.sentiment === 'bullish' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      source.sentiment === 'bearish' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {source.sentiment}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--muted)]">Score:</span>
                      <span className="font-medium text-[var(--text)]">{source.score}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--muted)]">Mentions:</span>
                      <span className="font-medium text-[var(--text)]">{source.mentions_count || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--muted)]">Confidence:</span>
                      <span className="font-medium text-[var(--text)]">{source.confidence || 0}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Key Topics */}
        {data.key_topics && data.key_topics.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <FiActivity className="w-5 h-5 text-indigo-500" />
              Key Topics & Themes ({data.key_topics.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.key_topics.map((topic, index) => (
                <motion.div
                  key={index}
                  className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-3 py-2 rounded-full text-sm border border-indigo-200 dark:border-indigo-800"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-2">
                    <span>{topic.topic}</span>
                    <span className="text-xs bg-indigo-200 dark:bg-indigo-800 px-1.5 py-0.5 rounded-full">
                      {topic.mentions}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Headlines */}
        {data.recent_headlines && data.recent_headlines.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineGlobal className="w-5 h-5 text-green-500" />
              Recent Headlines ({data.recent_headlines.length})
            </h3>
            <div className="space-y-3">
              {data.recent_headlines.map((headline, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-[var(--bg)] rounded-lg border border-[var(--muted)]"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                    headline.sentiment === 'bullish' ? 'bg-green-500' :
                    headline.sentiment === 'bearish' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-[var(--text)] font-medium mb-1">{headline.title}</p>
                    <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
                      <span>{headline.source}</span>
                      <span>{headline.published_at}</span>
                      <span className={`px-2 py-1 rounded-full ${
                        headline.sentiment === 'bullish' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        headline.sentiment === 'bearish' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {headline.sentiment}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Social Media Sentiment */}
        {data.social_sentiment && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineTwitter className="w-5 h-5 text-blue-400" />
              Social Media Sentiment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Twitter */}
              {data.social_sentiment.twitter && (
                <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--muted)]">
                  <div className="flex items-center gap-2 mb-3">
                    <AiOutlineTwitter className="w-5 h-5 text-blue-400" />
                    <span className="font-medium text-[var(--text)]">Twitter</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--muted)]">Sentiment:</span>
                      <span className={`text-sm font-medium ${
                        data.social_sentiment.twitter.sentiment === 'bullish' ? 'text-green-500' :
                        data.social_sentiment.twitter.sentiment === 'bearish' ? 'text-red-500' : 'text-yellow-500'
                      }`}>
                        {data.social_sentiment.twitter.sentiment}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--muted)]">Tweets:</span>
                      <span className="text-sm font-medium text-[var(--text)]">{data.social_sentiment.twitter.tweet_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--muted)]">Score:</span>
                      <span className="text-sm font-medium text-[var(--text)]">{data.social_sentiment.twitter.score || 0}/100</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Reddit */}
              {data.social_sentiment.reddit && (
                <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--muted)]">
                  <div className="flex items-center gap-2 mb-3">
                    <AiOutlineReddit className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-[var(--text)]">Reddit</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--muted)]">Sentiment:</span>
                      <span className={`text-sm font-medium ${
                        data.social_sentiment.reddit.sentiment === 'bullish' ? 'text-green-500' :
                        data.social_sentiment.reddit.sentiment === 'bearish' ? 'text-red-500' : 'text-yellow-500'
                      }`}>
                        {data.social_sentiment.reddit.sentiment}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--muted)]">Posts:</span>
                      <span className="text-sm font-medium text-[var(--text)]">{data.social_sentiment.reddit.post_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--muted)]">Score:</span>
                      <span className="text-sm font-medium text-[var(--text)]">{data.social_sentiment.reddit.score || 0}/100</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Price Impact Analysis */}
        {data.price_impact && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBarChart className="w-5 h-5 text-teal-500" />
              Price Impact Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-4 bg-[var(--bg)] rounded border">
                <div className="text-2xl font-bold text-[var(--text)] mb-1">
                  {data.price_impact.correlation || 'N/A'}
                </div>
                <div className="text-sm text-[var(--muted)]">Sentiment-Price Correlation</div>
              </div>
              <div className="text-center p-4 bg-[var(--bg)] rounded border">
                <div className="text-2xl font-bold text-[var(--text)] mb-1">
                  {data.price_impact.predicted_change || 'N/A'}
                </div>
                <div className="text-sm text-[var(--muted)]">Predicted Price Change</div>
              </div>
            </div>
            {data.price_impact.analysis && (
              <div className="mt-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                <p className="text-sm text-teal-700 dark:text-teal-300">
                  {data.price_impact.analysis}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {data.recommendations && data.recommendations.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineRise className="w-5 h-5 text-orange-500" />
              Trading Recommendations ({data.recommendations.length})
            </h3>
            <div className="space-y-3">
              {data.recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    💡
                  </div>
                  <div>
                    <p className="text-[var(--text)] font-medium">{rec.recommendation}</p>
                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                      {rec.reasoning}
                    </p>
                    {rec.confidence && (
                      <div className="text-xs text-[var(--muted)] mt-2">
                        Confidence: {rec.confidence}%
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
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <AiOutlineBarChart className="w-7 h-7 text-orange-500" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Analyze cryptocurrency sentiment from news and social media
          </p>
        </div>

        {/* Coin Symbol Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Cryptocurrency Symbol
          </label>
          <div className="relative">
            <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted)] w-5 h-5" />
            <input
              type="text"
              value={coinSymbol}
              onChange={(e) => setCoinSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., BTC, ETH, ADA..."
              className="w-full pl-10 pr-4 py-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-orange-500 focus:border-transparent uppercase"
              maxLength={10}
            />
          </div>
        </div>

        {/* Popular Coins */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Popular Cryptocurrencies
          </label>
          <div className="grid grid-cols-4 gap-2">
            {popularCoins.map((coin) => (
              <button
                key={coin.symbol}
                onClick={() => setCoinSymbol(coin.symbol)}
                className={`p-2 border rounded-lg text-xs font-medium transition-all ${
                  coinSymbol === coin.symbol
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                    : 'border-[var(--muted)] bg-[var(--surface)] text-[var(--text)] hover:border-orange-300'
                }`}
              >
                {coin.symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Timeframe */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Analysis Timeframe
          </label>
          <div className="grid grid-cols-2 gap-2">
            {timeframeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeframe(option.value)}
                className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                  timeframe === option.value
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                    : 'border-[var(--muted)] bg-[var(--surface)] text-[var(--text)] hover:border-orange-300'
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

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Features */}
        <div className="bg-[var(--surface)] rounded-lg p-4 border border-[var(--muted)]">
          <h3 className="font-semibold text-[var(--text)] mb-3">Analysis Features</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-[var(--text)]">News Sentiment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-[var(--text)]">Social Media</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[var(--text)]">Price Correlation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-[var(--text)]">Trading Signals</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-[var(--text)]">Risk Assessment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              <span className="text-[var(--text)]">Topic Analysis</span>
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
            disabled={!coinSymbol.trim() || running}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {running ? (
              <div className="flex items-center gap-3">
                <AiOutlineSearch className="w-5 h-5 animate-spin" />
                <span>Analyzing Sentiment...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <AiOutlineBarChart className="w-5 h-5" />
                <span>Analyze Crypto Sentiment</span>
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
            <AiOutlineSearch className="w-7 h-7 text-orange-500" />
            Sentiment Analysis Results
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
                  link.download = 'crypto-sentiment.json';
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export JSON
              </Button>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] rounded-xl p-6 min-h-96 border border-orange-500/10 shadow-lg overflow-y-auto">
          {running ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <AiOutlineBarChart className="w-16 h-16 text-orange-500" />
              </motion.div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[var(--text)] mb-2">
                  Analyzing cryptocurrency sentiment...
                </div>
                <div className="flex justify-center gap-1 mb-4">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-orange-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-orange-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-orange-500 rounded-full"
                  />
                </div>
                <p className="text-sm text-[var(--muted)] text-center">
                  AI is scanning news articles, social media posts, and market data for sentiment signals
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
                  <span className="font-semibold">Sentiment Analysis Complete</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Analyzed sentiment from multiple sources for {coinSymbol}
                </p>
              </div>
              {formatSentimentResult(result)}
            </motion.div>
          ) : (
            <div className="text-center text-[var(--muted)] flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <AiOutlineBarChart className="w-20 h-20 text-orange-500/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                Ready for Sentiment Analysis
              </h3>
              <p className="text-lg mb-4 max-w-sm">
                Enter a cryptocurrency symbol to get comprehensive sentiment analysis from news, Twitter, Reddit, and market data
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-sm">
                  📰 News Analysis
                </span>
                <span className="px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-sm">
                  🐦 Social Media
                </span>
                <span className="px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-sm">
                  📊 Market Correlation
                </span>
                <span className="px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-sm">
                  💡 Trading Signals
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CryptoSentimentInterface;