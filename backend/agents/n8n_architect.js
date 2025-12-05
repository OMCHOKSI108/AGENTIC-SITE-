const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

class N8nArchitectAgent {
  async run(input) {
    const { goal } = input;

    if (!goal) {
      return {
        success: false,
        error: "Please provide a goal for the n8n workflow"
      };
    }

    try {
      const prompt = `Design a comprehensive n8n workflow based on this goal: "${goal}"

Please provide:
1. Complete n8n workflow JSON configuration
2. Step-by-step setup instructions
3. Required n8n nodes and their configuration
4. Any additional integrations needed
5. Testing and deployment guidance

Make the workflow production-ready with proper error handling, logging, and best practices.

Output format:
- Workflow JSON
- Setup instructions
- Node configurations
- Testing steps`;

      const result = await model.generateContent(prompt);
      const workflow = result.response.text().trim();

      return {
        success: true,
        output: workflow,
        cost: 0.03,
        time_ms: 3000
      };

    } catch (error) {
      console.error("N8N Architect error:", error);
      return {
        success: false,
        error: `Failed to generate n8n workflow: ${error.message}`
      };
    }
  }
}

module.exports = new N8nArchitectAgent();
