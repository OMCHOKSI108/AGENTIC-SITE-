import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineBarChart, AiOutlineStock, AiOutlineRise, AiOutlineFall, AiOutlineDollar, AiOutlineGlobal } from 'react-icons/ai';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiActivity } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const MarketWatchInterface = ({ agent, onRun }) => {
  const [symbols, setSymbols] = useState('');
  const [marketType, setMarketType] = useState('stocks');
  const [timeframe, setTimeframe] = useState('1D');
  const [indicators, setIndicators] = useState(['price', 'volume']);
  const [alerts, setAlerts] = useState(false);
  const [analysis, setAnalysis] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const marketTypes = [
    { value: 'stocks', label: 'Stocks', icon: '📈', description: 'Individual company stocks' },
    { value: 'crypto', label: 'Cryptocurrency', icon: '₿', description: 'Digital currencies' },
    { value: 'forex', label: 'Forex', icon: '💱', description: 'Currency exchange rates' },
    { value: 'commodities', label: 'Commodities', icon: '🛢️', description: 'Oil, gold, metals' },
    { value: 'indices', label: 'Market Indices', icon: '📊', description: 'S&P 500, NASDAQ, etc.' },
  ];

  const timeframes = [
    { value: '1D', label: '1 Day', icon: '📅' },
    { value: '1W', label: '1 Week', icon: '📆' },
    { value: '1M', label: '1 Month', icon: '🗓️' },
    { value: '3M', label: '3 Months', icon: '📈' },
    { value: '1Y', label: '1 Year', icon: '📊' },
  ];

  const indicatorOptions = [
    { value: 'price', label: 'Price Data', icon: '💰' },
    { value: 'volume', label: 'Volume', icon: '📊' },
    { value: 'moving_average', label: 'Moving Averages', icon: '📈' },
    { value: 'rsi', label: 'RSI', icon: '📉' },
    { value: 'macd', label: 'MACD', icon: '📊' },
    { value: 'bollinger', label: 'Bollinger Bands', icon: '🎯' },
  ];

  const handleRun = async () => {
    if (!symbols.trim()) {
      setError('Please enter at least one symbol');
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const response = await onRun({
        symbols: symbols.split(',').map(s => s.trim().toUpperCase()),
        market_type: marketType,
        timeframe: timeframe,
        indicators: indicators,
        enable_alerts: alerts,
        include_analysis: analysis
      });

      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const formatMarketResult = (result) => {
    if (!result || !result.output) return null;

    const data = result.output;
    if (!data.success) {
      return (
        <div className="text-center text-red-500">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Market Data Fetch Failed</h3>
          <p className="text-[var(--text)]">{data.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Market Overview */}
        {data.market_overview && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineGlobal className="w-5 h-5 text-primary" />
              Market Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(data.market_overview).map(([key, value]) => (
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

        {/* Individual Assets */}
        {data.assets && data.assets.length > 0 && (
          <div className="space-y-4">
            {data.assets.map((asset, index) => (
              <motion.div
                key={asset.symbol}
                className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {marketType === 'crypto' ? '₿' : marketType === 'stocks' ? '📈' : '💰'}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[var(--text)]">{asset.symbol}</h4>
                      <p className="text-sm text-[var(--muted)]">{asset.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[var(--text)]">
                      {asset.price ? `$${asset.price.toFixed(2)}` : 'N/A'}
                    </div>
                    <div className={`text-sm flex items-center gap-1 ${
                      asset.change_percent >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {asset.change_percent >= 0 ? (
                        <AiOutlineRise className="w-4 h-4" />
                      ) : (
                        <AiOutlineFall className="w-4 h-4" />
                      )}
                      {asset.change_percent ? `${asset.change_percent >= 0 ? '+' : ''}${asset.change_percent.toFixed(2)}%` : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Asset Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {asset.volume && (
                    <div className="text-center p-3 bg-[var(--bg)] rounded border">
                      <div className="text-sm font-bold text-[var(--text)]">
                        {asset.volume.toLocaleString()}
                      </div>
                      <div className="text-xs text-[var(--muted)]">Volume</div>
                    </div>
                  )}
                  {asset.market_cap && (
                    <div className="text-center p-3 bg-[var(--bg)] rounded border">
                      <div className="text-sm font-bold text-[var(--text)]">
                        ${(asset.market_cap / 1e9).toFixed(2)}B
                      </div>
                      <div className="text-xs text-[var(--muted)]">Market Cap</div>
                    </div>
                  )}
                  {asset.high_52w && (
                    <div className="text-center p-3 bg-[var(--bg)] rounded border">
                      <div className="text-sm font-bold text-[var(--text)]">
                        ${asset.high_52w.toFixed(2)}
                      </div>
                      <div className="text-xs text-[var(--muted)]">52W High</div>
                    </div>
                  )}
                  {asset.low_52w && (
                    <div className="text-center p-3 bg-[var(--bg)] rounded border">
                      <div className="text-sm font-bold text-[var(--text)]">
                        ${asset.low_52w.toFixed(2)}
                      </div>
                      <div className="text-xs text-[var(--muted)]">52W Low</div>
                    </div>
                  )}
                </div>

                {/* Technical Indicators */}
                {asset.indicators && (
                  <div className="space-y-3">
                    <h5 className="font-medium text-[var(--text)]">Technical Indicators</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(asset.indicators).map(([key, value]) => (
                        <div key={key} className="p-2 bg-[var(--bg)] rounded border">
                          <div className="text-xs text-[var(--muted)] uppercase">{key}</div>
                          <div className="text-sm font-bold text-[var(--text)]">
                            {typeof value === 'number' ? value.toFixed(2) : value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Market Analysis */}
        {data.analysis && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBarChart className="w-5 h-5 text-blue-500" />
              Market Analysis
            </h3>
            <div className="space-y-4">
              {data.analysis.summary && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-[var(--text)] mb-2">Market Summary</h4>
                  <p className="text-sm text-[var(--text)]">{data.analysis.summary}</p>
                </div>
              )}

              {data.analysis.trends && data.analysis.trends.length > 0 && (
                <div>
                  <h4 className="font-medium text-[var(--text)] mb-3">Key Trends</h4>
                  <div className="space-y-2">
                    {data.analysis.trends.map((trend, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded border">
                        <div className={`w-3 h-3 rounded-full ${
                          trend.sentiment === 'bullish' ? 'bg-green-500' :
                          trend.sentiment === 'bearish' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <span className="text-[var(--text)]">{trend.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alerts & Signals */}
        {data.signals && data.signals.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineStock className="w-5 h-5 text-orange-500" />
              Trading Signals ({data.signals.length})
            </h3>
            <div className="space-y-3">
              {data.signals.map((signal, index) => (
                <motion.div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    signal.type === 'buy' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                    signal.type === 'sell' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                    'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  }`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                        signal.type === 'buy' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        signal.type === 'sell' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {signal.type.toUpperCase()}
                      </span>
                      <span className="font-medium text-[var(--text)]">{signal.symbol}</span>
                    </div>
                    <span className="text-sm text-[var(--muted)]">{signal.timestamp}</span>
                  </div>
                  <p className="text-[var(--text)] text-sm mb-2">{signal.description}</p>
                  <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
                    {signal.price && <span>Price: ${signal.price.toFixed(2)}</span>}
                    {signal.confidence && <span>Confidence: {signal.confidence}%</span>}
                    {signal.timeframe && <span>Timeframe: {signal.timeframe}</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Assessment */}
        {data.risk_assessment && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBarChart className="w-5 h-5 text-red-500" />
              Risk Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(data.risk_assessment).map(([key, value]) => (
                <div key={key} className="p-3 bg-[var(--bg)] rounded border">
                  <div className="text-sm font-medium text-[var(--text)] mb-1 capitalize">
                    {key.replace('_', ' ')}
                  </div>
                  <div className={`text-lg font-bold ${
                    key.includes('risk') || key.includes('volatility') ?
                      (value > 0.7 ? 'text-red-500' : value > 0.4 ? 'text-yellow-500' : 'text-green-500') :
                      'text-[var(--text)]'
                  }`}>
                    {typeof value === 'number' ? (value > 1 ? value.toFixed(2) : `${(value * 100).toFixed(1)}%`) : value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {data.recommendations && data.recommendations.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineStock className="w-5 h-5 text-purple-500" />
              Investment Recommendations ({data.recommendations.length})
            </h3>
            <div className="space-y-3">
              {data.recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--text)] mb-1">{rec.title}</h4>
                    <p className="text-sm text-[var(--text)] mb-2">{rec.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-purple-600 dark:text-purple-400">
                        {rec.action}
                      </span>
                      {rec.risk_level && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          rec.risk_level === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          rec.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {rec.risk_level} risk
                        </span>
                      )}
                    </div>
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
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <AiOutlineBarChart className="w-7 h-7 text-orange-500" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Monitor markets, analyze trends, and get trading signals with real-time data
          </p>
        </div>

        {/* Symbols Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Symbols *
          </label>
          <div className="relative">
            <AiOutlineStock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted)] w-5 h-5" />
            <input
              type="text"
              value={symbols}
              onChange={(e) => setSymbols(e.target.value)}
              placeholder="e.g., AAPL, GOOGL, BTC, EURUSD (comma-separated)"
              className="w-full pl-10 pr-4 py-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-[var(--muted)]">
            Enter stock tickers, crypto symbols, currency pairs, or commodity codes
          </p>
        </div>

        {/* Market Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Market Type
          </label>
          <select
            value={marketType}
            onChange={(e) => setMarketType(e.target.value)}
            className="w-full p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {marketTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Timeframe */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Analysis Timeframe
          </label>
          <div className="grid grid-cols-3 gap-2">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                  timeframe === tf.value
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                    : 'border-[var(--muted)] bg-[var(--surface)] text-[var(--text)] hover:border-orange-300'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span>{tf.icon}</span>
                  <span>{tf.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Technical Indicators */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Technical Indicators
          </label>
          <div className="grid grid-cols-2 gap-2">
            {indicatorOptions.map((indicator) => (
              <button
                key={indicator.value}
                onClick={() => {
                  setIndicators(prev =>
                    prev.includes(indicator.value)
                      ? prev.filter(i => i !== indicator.value)
                      : [...prev, indicator.value]
                  );
                }}
                className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                  indicators.includes(indicator.value)
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                    : 'border-[var(--muted)] bg-[var(--surface)] text-[var(--text)] hover:border-orange-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{indicator.icon}</span>
                  <span>{indicator.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--text)]">Enable Price Alerts</label>
            <button
              onClick={() => setAlerts(!alerts)}
              className={`w-12 h-6 rounded-full transition-colors ${
                alerts ? 'bg-orange-500' : 'bg-[var(--muted)]'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  alerts ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--text)]">Include Market Analysis</label>
            <button
              onClick={() => setAnalysis(!analysis)}
              className={`w-12 h-6 rounded-full transition-colors ${
                analysis ? 'bg-orange-500' : 'bg-[var(--muted)]'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  analysis ? 'translate-x-6' : 'translate-x-0.5'
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
            disabled={!symbols.trim() || running}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {running ? (
              <div className="flex items-center gap-3">
                <AiOutlineBarChart className="w-5 h-5 animate-spin" />
                <span>Analyzing markets...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <AiOutlineBarChart className="w-5 h-5" />
                <span>Analyze Markets</span>
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
            <AiOutlineStock className="w-7 h-7 text-orange-500" />
            Market Analysis
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
                  link.download = 'market-analysis.json';
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
                  Analyzing market data...
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
                  AI is fetching live market data, calculating indicators, and generating trading insights
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Market Analysis Failed</h3>
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
                  <span className="font-semibold">Market Analysis Complete</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Retrieved live data for {result.output.assets?.length || 0} assets with technical analysis and trading signals
                </p>
              </div>
              {formatMarketResult(result)}
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
                Ready for Market Analysis
              </h3>
              <p className="text-lg mb-4 max-w-sm">
                Enter stock symbols, crypto tickers, or currency pairs to get real-time market data, technical analysis, and trading signals
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-sm">
                  📊 Live Market Data
                </span>
                <span className="px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-sm">
                  📈 Technical Indicators
                </span>
                <span className="px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-sm">
                  🎯 Trading Signals
                </span>
                <span className="px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-sm">
                  ⚠️ Risk Assessment
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MarketWatchInterface;