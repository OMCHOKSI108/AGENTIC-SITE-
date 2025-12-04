const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run(input) {
  const { company_url, offer } = input;

  if (!company_url || !offer) {
    return {
      success: false,
      error: 'Please provide both company URL and your offer'
    };
  }

  try {
    const prompt = `Write a personalized cold outreach email based on the company website and your offer.

COMPANY WEBSITE: ${company_url}
YOUR OFFER: ${offer}

Requirements:
1. Research the company based on the URL (infer their business, challenges, etc.)
2. Write a personalized email that shows you've done your homework
3. Keep it concise but compelling (100-150 words)
4. Include a clear value proposition
5. End with a specific call-to-action
6. Use professional but friendly tone

Format as:
## Subject Line
[Compelling subject line]

## Email Body
[Personalized email content]

## Why This Email Works
[Brief explanation of the personalization strategy]`;

    const result = await model.generateContent(prompt);

    const emailDraft = result.response.text().trim();

    return {
      success: true,
      output: emailDraft,
      cost: 0.015,
      time_ms: 1500
    };

  } catch (error) {
    console.error('Cold Outreach Writer error:', error);
    return {
      success: false,
      error: `Failed to generate outreach email: ${error.message}`
    };
  }
}

module.exports = { run };