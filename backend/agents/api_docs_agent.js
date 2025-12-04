const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run(input) {
  const { code_file } = input;

  if (!code_file) {
    return {
      success: false,
      error: 'Please provide code file content to analyze'
    };
  }

  try {
    const prompt = `Generate comprehensive API documentation for this code file. Create both OpenAPI/Swagger spec and human-readable documentation.

CODE FILE CONTENT:
${code_file}

Requirements:
1. Analyze the code to identify all API endpoints
2. Extract parameters, request/response formats
3. Generate OpenAPI 3.0 specification (JSON)
4. Create human-readable markdown documentation
5. Include examples for each endpoint
6. Document authentication requirements
7. Add error response codes

Output both the OpenAPI JSON spec and the markdown documentation.`;

    const result = await model.generateContent(prompt);

    const documentation = result.response.text().trim();

    return {
      success: true,
      output: documentation,
      cost: 0.03,
      time_ms: 3000
    };

  } catch (error) {
    console.error('API Documentation Generator error:', error);
    return {
      success: false,
      error: `Failed to generate API documentation: ${error.message}`
    };
  }
}

module.exports = { run };