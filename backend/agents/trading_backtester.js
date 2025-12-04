const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run(input) {
  const { strategy_logic, csv_data } = input;

  if (!strategy_logic || !csv_data) {
    return {
      success: false,
      error: 'Please provide both strategy logic and CSV data'
    };
  }

  try {
    const prompt = `Backtest this trading strategy using the provided data. Perform a complete simulation and analysis.

STRATEGY LOGIC:
${strategy_logic}

HISTORICAL DATA (CSV format):
${csv_data}

Requirements:
1. Parse the CSV data (assume columns: date, open, high, low, close, volume)
2. Implement the trading strategy logic
3. Simulate trades with realistic transaction costs (0.1% per trade)
4. Calculate comprehensive performance metrics
5. Generate buy/sell signals based on the strategy
6. Provide detailed analysis and recommendations

Output format:
## Strategy Performance Report

### Overview
- Total Return: X%
- Annualized Return: X%
- Max Drawdown: X%
- Win Rate: X%
- Total Trades: X
- Profit Factor: X

### Detailed Metrics
[Complete analysis with charts/data]

### Recommendations
[Strategy improvements and risk management suggestions]`;

    const result = await model.generateContent(prompt);

    const backtestResults = result.response.text().trim();

    return {
      success: true,
      output: backtestResults,
      cost: 0.04,
      time_ms: 4000
    };

  } catch (error) {
    console.error('Trading Strategy Backtester error:', error);
    return {
      success: false,
      error: `Failed to backtest strategy: ${error.message}`
    };
  }
}

module.exports = { run };