const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run(input) {
  const { project_description } = input;

  if (!project_description || typeof project_description !== 'string') {
    return {
      success: false,
      error: 'Please provide a project description'
    };
  }

  try {
    const prompt = `Generate a complete GitHub Actions workflow file (.github/workflows/deploy.yml) for this project.

Project Description: "${project_description}"

Requirements:
1. Create a production-ready CI/CD pipeline
2. Include checkout, dependency installation, linting, testing, building, and deployment
3. Use appropriate actions for the technology stack mentioned
4. Add proper environment variables and secrets
5. Include caching for dependencies to speed up builds
6. Add deployment steps if mentioned in the description
7. Include proper error handling and notifications
8. Add comments explaining each step

Output only the YAML content for the workflow file, no markdown formatting.`;

    const result_gemini = await model.generateContent(prompt);
    const workflowYaml = result_gemini.response.text().trim();

    // Clean up any markdown formatting
    const cleanYaml = workflowYaml.replace(/```yaml\s*/g, '').replace(/```\s*$/g, '');

    const result = `# CI/CD Pipeline Generated

## Workflow File: \`.github/workflows/deploy.yml\`

\`\`\`yaml
${cleanYaml}
\`\`\`

## How to Use

1. Create the directory structure: \`mkdir -p .github/workflows\`
2. Save the above content as \`.github/workflows/deploy.yml\`
3. Push to your repository
4. The workflow will trigger on pushes to main/master branch

## Required Secrets

Make sure to add these secrets in your GitHub repository settings:
- Deployment credentials (if deploying to cloud services)
- API keys for external services
- Docker registry credentials (if using Docker)

## Customization

You can customize this workflow by:
- Modifying the trigger conditions
- Adding additional testing steps
- Configuring different deployment environments
- Adding manual approval steps for production deployments
`;

    return {
      success: true,
      output: result,
      cost: 0.03,
      time_ms: 3000
    };

  } catch (error) {
    console.error('CI/CD Generator error:', error);
    return {
      success: false,
      error: `Failed to generate CI/CD pipeline: ${error.message}`
    };
  }
}

module.exports = { run };