const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run(input) {
  const { log_text } = input;

  if (!log_text || typeof log_text !== 'string') {
    return {
      success: false,
      error: 'Please provide log text to analyze'
    };
  }

  try {
    const prompt = `Analyze these server logs for anomalies, errors, and potential issues. Provide a detailed root cause analysis.

LOGS:
${log_text}

Analysis Requirements:
1. Identify the main error patterns and anomalies
2. Determine the root cause of issues
3. Provide specific line numbers where issues occur
4. Suggest concrete fixes with code examples
5. Rate the severity of each issue (Critical/High/Medium/Low)
6. Estimate impact on system performance

Format your response as:
## Root Cause Analysis

### Primary Issue: [Brief description]
**Severity:** [Critical/High/Medium/Low]
**Location:** Line X in logs
**Root Cause:** [Detailed explanation]
**Impact:** [System impact description]
**Fix:** [Specific solution with code/commands]

### Secondary Issues:
[List any additional issues found]

### Recommendations:
[Additional monitoring/alerting suggestions]`;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text().trim();

    return {
      success: true,
      output: analysis,
      cost: 0.025,
      time_ms: 2000
    };

  } catch (error) {
    console.error('Log Anomaly Detective error:', error);
    return {
      success: false,
      error: `Failed to analyze logs: ${error.message}`
    };
  }
}

module.exports = { run };