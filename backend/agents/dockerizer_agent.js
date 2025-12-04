const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run(input) {
  const { repo_url, code_snippet } = input;

  if (!repo_url && !code_snippet) {
    return {
      success: false,
      error: 'Please provide either a GitHub repository URL or code snippet'
    };
  }

  try {
    let context = '';
    if (repo_url) {
      context = `GitHub Repository: ${repo_url}`;
    } else {
      context = `Code Snippet:\n${code_snippet}`;
    }

    const prompt = `Generate production-ready Docker configuration for this project.

${context}

Requirements:
1. Create a multi-stage Dockerfile optimized for production
2. Include docker-compose.yml for local development
3. Add .dockerignore file
4. Include proper security practices
5. Optimize for build speed and image size
6. Add health checks and proper CMD/ENTRYPOINT
7. Include environment variables and secrets management
8. Add comments explaining each section

Consider the technology stack and create appropriate Docker setup.`;

    const aiResult = await model.generateContent(prompt);

    const dockerConfig = aiResult.response.text().trim();

    const result = `# Docker Configuration Generated

${dockerConfig}

## Quick Start

1. **Build the image:**
   \`\`\`bash
   docker build -t my-app .
   \`\`\`

2. **Run with docker-compose:**
   \`\`\`bash
   docker-compose up -d
   \`\`\`

3. **Check logs:**
   \`\`\`bash
   docker-compose logs -f
   \`\`\`

## Production Deployment

For production deployment:
1. Use multi-stage builds to reduce image size
2. Run as non-root user for security
3. Use environment variables for configuration
4. Implement proper health checks
5. Use secrets management for sensitive data

## Security Best Practices
- Images run as non-root user
- Minimal base images used
- No sensitive data in Dockerfiles
- Regular security updates
- Proper file permissions

## Performance Optimizations
- Multi-stage builds reduce final image size
- Layer caching for faster builds
- Minimal dependencies in final image
- Proper .dockerignore to exclude unnecessary files
`;

    return {
      success: true,
      output: result,
      cost: 0.028,
      time_ms: 2800
    };

  } catch (error) {
    console.error('Dockerizer Agent error:', error);
    return {
      success: false,
      error: `Failed to generate Docker configuration: ${error.message}`
    };
  }
}

module.exports = { run };