const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

class ReadmeArchitectAgent {
  async run(input) {
    const { repo_url } = input;

    if (!repo_url) {
      return {
        success: false,
        error: 'Please provide a repository URL'
      };
    }

    try {
      const prompt = `Generate a professional README.md file for this GitHub repository.

Repository URL: ${repo_url}

Requirements:
1. Create a comprehensive README with all standard sections
2. Include badges for build status, license, version, etc.
3. Add proper project description and features
4. Include installation and usage instructions
5. Add API documentation if applicable
6. Include contribution guidelines
7. Add license information
8. Make it visually appealing with proper formatting

Analyze the repository type and tech stack to create appropriate content. Include:
- Project title and description
- Badges and shields
- Table of contents
- Installation steps
- Usage examples
- API reference (if applicable)
- Contributing guidelines
- License
- Contact information`;

      const result = await model.generateContent(prompt);

      const readme = result.response.text().trim();

      return {
        success: true,
        output: readme,
        cost: 0.025,
        time_ms: 2500
      };

    } catch (error) {
      console.error('Readme Architect error:', error);
      return {
        success: false,
        error: `Failed to generate README: ${error.message}`
      };
    }
  }
}

module.exports = new ReadmeArchitectAgent();
