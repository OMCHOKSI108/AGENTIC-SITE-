const axios = require('axios');
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class MarketWatchAgent {
  async run(input) {
    try {
      const { symbol } = input;

      if (!symbol) {
        throw new Error('Trading symbol is required (e.g., BTCUSDT, AAPL)');
      }

      // Get market data (mock for demo - would use real API)
      const marketData = await this.getMarketData(symbol);

      // Calculate technical indicators
      const indicators = this.calculateIndicators(marketData);

      // Generate signals and analysis
      const analysis = await this.generateAnalysis(symbol, marketData, indicators);

      return {
        success: true,
        symbol: symbol.toUpperCase(),
        market_data: marketData,
        indicators: indicators,
        analysis: analysis,
        last_updated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Market Watch Error:', error);
      return {
        success: false,
        error: error.message,
        symbol: input.symbol?.toUpperCase(),
        market_data: null,
        indicators: null,
        analysis: null
      };
    }
  }

  async getMarketData(symbol) {
    // Mock market data - in production, this would call a real market data API
    // like Alpha Vantage, Yahoo Finance, Binance API, etc.

    const basePrice = this.getBasePrice(symbol);
    const volatility = 0.02; // 2% volatility

    // Generate mock price data for the last 24 hours (hourly)
    const prices = [];
    let currentPrice = basePrice;

    for (let i = 23; i >= 0; i--) {
      const change = (Math.random() - 0.5) * volatility * currentPrice;
      currentPrice += change;

      prices.push({
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        price: Math.max(0.01, currentPrice),
        volume: Math.floor(Math.random() * 1000000) + 100000
      });
    }

    const latest = prices[prices.length - 1];
    const previous = prices[prices.length - 2];

    return {
      current_price: latest.price,
      previous_price: previous.price,
      change_24h: latest.price - previous.price,
      change_percent_24h: ((latest.price - previous.price) / previous.price) * 100,
      volume_24h: prices.reduce((sum, p) => sum + p.volume, 0),
      high_24h: Math.max(...prices.map(p => p.price)),
      low_24h: Math.min(...prices.map(p => p.price)),
      price_history: prices.slice(-24), // Last 24 data points
      source: 'Mock Market Data API'
    };
  }

  getBasePrice(symbol) {
    // Mock base prices for common symbols
    const prices = {
      'BTCUSDT': 45000,
      'ETHUSDT': 2800,
      'AAPL': 180,
      'GOOGL': 140,
      'MSFT': 380,
      'TSLA': 220,
      'NVDA': 850,
      'AMZN': 155
    };

    return prices[symbol.toUpperCase()] || 100; // Default fallback
  }

  calculateIndicators(marketData) {
    const prices = marketData.price_history.map(p => p.price);

    return {
      sma_20: this.calculateSMA(prices, 20),
      sma_50: this.calculateSMA(prices, 50),
      rsi: this.calculateRSI(prices),
      macd: this.calculateMACD(prices),
      bollinger_bands: this.calculateBollingerBands(prices),
      volume_sma: this.calculateVolumeSMA(marketData.price_history)
    };
  }

  calculateSMA(prices, period) {
    if (prices.length < period) return null;

    const recentPrices = prices.slice(-period);
    return recentPrices.reduce((sum, price) => sum + price, 0) / period;
  }

  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;

    const gains = [];
    const losses = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    const avgGain = gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period;
    const avgLoss = losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  calculateMACD(prices) {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);

    if (!ema12 || !ema26) return null;

    const macd = ema12 - ema26;
    const signal = this.calculateEMA([macd], 9); // Signal line

    return {
      macd: macd,
      signal: signal,
      histogram: signal ? macd - signal : 0
    };
  }

  calculateEMA(prices, period) {
    if (prices.length < period) return null;

    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }

    return ema;
  }

  calculateBollingerBands(prices, period = 20, stdDev = 2) {
    if (prices.length < period) return null;

    const sma = this.calculateSMA(prices, period);
    const recentPrices = prices.slice(-period);

    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const std = Math.sqrt(variance);

    return {
      upper: sma + (std * stdDev),
      middle: sma,
      lower: sma - (std * stdDev)
    };
  }

  calculateVolumeSMA(priceHistory, period = 20) {
    if (priceHistory.length < period) return null;

    const volumes = priceHistory.slice(-period).map(p => p.volume);
    return volumes.reduce((sum, vol) => sum + vol, 0) / period;
  }

  async generateAnalysis(symbol, marketData, indicators) {
    try {
      const prompt = `Analyze this market data for ${symbol} and provide trading signals:

Current Price: $${marketData.current_price.toFixed(2)}
24h Change: ${marketData.change_percent_24h.toFixed(2)}%
RSI: ${indicators.rsi?.toFixed(2) || 'N/A'}
SMA 20: $${indicators.sma_20?.toFixed(2) || 'N/A'}
SMA 50: $${indicators.sma_50?.toFixed(2) || 'N/A'}

Provide:
1. Current market sentiment (bullish/bearish/neutral)
2. Key signals (buy/sell/hold)
3. Risk assessment (low/medium/high)
4. Next support/resistance levels
5. Short-term outlook (1-3 days)

Be specific and actionable. Keep it concise.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.3,
        max_tokens: 600,
      });

      const result = completion.choices[0]?.message?.content;

      if (!result) {
        throw new Error('No response from AI model');
      }

      // Parse the analysis
      const analysis = this.parseMarketAnalysis(result);

      return analysis;

    } catch (error) {
      return {
        sentiment: 'neutral',
        signals: ['Unable to generate analysis'],
        risk_level: 'unknown',
        support_resistance: 'N/A',
        outlook: 'Market analysis unavailable'
      };
    }
  }

  parseMarketAnalysis(response) {
    const analysis = {
      sentiment: 'neutral',
      signals: [],
      risk_level: 'medium',
      support_resistance: '',
      outlook: ''
    };

    const lines = response.split('\n');

    for (const line of lines) {
      const lowerLine = line.toLowerCase().trim();

      if (lowerLine.includes('sentiment')) {
        if (lowerLine.includes('bullish')) analysis.sentiment = 'bullish';
        else if (lowerLine.includes('bearish')) analysis.sentiment = 'bearish';
        else analysis.sentiment = 'neutral';
      } else if (lowerLine.includes('signal') || lowerLine.includes('buy') || lowerLine.includes('sell')) {
        analysis.signals.push(line.replace(/^\d+\.\s*/, '').trim());
      } else if (lowerLine.includes('risk')) {
        if (lowerLine.includes('low')) analysis.risk_level = 'low';
        else if (lowerLine.includes('high')) analysis.risk_level = 'high';
        else analysis.risk_level = 'medium';
      } else if (lowerLine.includes('support') || lowerLine.includes('resistance')) {
        analysis.support_resistance = line.replace(/^\d+\.\s*/, '').trim();
      } else if (lowerLine.includes('outlook')) {
        analysis.outlook = line.replace(/^\d+\.\s*/, '').trim();
      }
    }

    return analysis;
  }
}

module.exports = new MarketWatchAgent();
