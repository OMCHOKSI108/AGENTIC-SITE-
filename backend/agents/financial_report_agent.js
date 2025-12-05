const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function run(input) {
  const { pdf_content } = input;

  if (!pdf_content) {
    return {
      success: false,
      error: 'Please provide PDF content to analyze'
    };
  }

  try {
    const prompt = `Analyze this financial report (earnings call, 10-K, etc.) and extract the key information in a simplified format.

DOCUMENT CONTENT:
${pdf_content}

Requirements:
1. Extract key financial metrics and changes
2. Identify major business developments
3. Summarize risk factors and challenges
4. Highlight future outlook and guidance
5. Note any significant announcements
6. Keep the summary concise but comprehensive

Format as:
## Executive Summary
[2-3 sentence overview]

## Key Financial Highlights
- Revenue: [amount and % change]
- Net Income: [amount and % change]
- Other important metrics...

## Business Developments
[Major announcements, product launches, etc.]

## Risks & Challenges
[Key risk factors mentioned]

## Future Outlook
[Guidance, projections, strategic plans]`;

    const result = await model.generateContent(prompt);

    const summary = result.response.text().trim();

    return {
      success: true,
      output: summary,
      cost: 0.02,
      time_ms: 2000
    };

  } catch (error) {
    console.error('Financial Report Simplifier error:', error);
    return {
      success: false,
      error: `Failed to analyze financial report: ${error.message}`
    };
  }
}

module.exports = { run };
