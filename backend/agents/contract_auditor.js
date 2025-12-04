const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run(input) {
  const { contract_content } = input;

  if (!contract_content) {
    return {
      success: false,
      error: 'Please provide contract content to analyze'
    };
  }

  try {
    const prompt = `Audit this legal contract for potentially problematic clauses, unfair terms, and areas of concern.

CONTRACT CONTENT:
${contract_content}

Requirements:
1. Identify clauses that are unfavorable to the non-drafting party
2. Flag terms that deviate from industry standards
3. Highlight ambiguous language that could be problematic
4. Note any unusual liability provisions
5. Suggest specific improvements or negotiations
6. Rate the overall fairness of the contract

Format as:
## Contract Audit Summary

### Overall Assessment: [Fair/Concerning/Problematic]

### Flagged Clauses

#### [Clause Name/Type]
**Issue:** [Description of the problem]
**Standard Term:** [What it should say instead]
**Risk Level:** [High/Medium/Low]
**Recommendation:** [Specific suggestion]

### Positive Aspects
[List any fair or standard clauses]

### Negotiation Priorities
[Ranked list of issues to address first]

### Recommendations
[Overall advice for handling this contract]`;

    const result = await model.generateContent(prompt);

    const audit = result.response.text().trim();

    return {
      success: true,
      output: audit,
      cost: 0.035,
      time_ms: 3500
    };

  } catch (error) {
    console.error('Legal Contract Auditor error:', error);
    return {
      success: false,
      error: `Failed to audit contract: ${error.message}`
    };
  }
}

module.exports = { run };