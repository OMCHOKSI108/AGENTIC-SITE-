const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class APIBuilderAgent {
  async run(input) {
    try {
      const { description, framework = 'express', language = 'javascript', database = 'mongodb' } = input;

      if (!description) {
        throw new Error('API description is required');
      }

      // Generate API boilerplate
      const apiCode = await this.generateAPICode(description, framework, language, database);

      return {
        success: true,
        api_code: apiCode,
        framework: framework,
        language: language,
        database: database,
        description: description,
        generated_at: new Date().toISOString(),
        files_generated: apiCode.files.length
      };

    } catch (error) {
      console.error('API Builder Error:', error);
      return {
        success: false,
        error: error.message,
        api_code: null
      };
    }
  }

  async generateAPICode(description, framework, language, database) {
    try {
      const prompt = `Generate complete API boilerplate code based on this description.

DESCRIPTION: "${description}"

FRAMEWORK: ${framework}
LANGUAGE: ${language}
DATABASE: ${database}

Please generate a complete API with the following structure:

1. **Main Server File** (${language} code for the main application)
2. **Route Handlers** (API endpoints)
3. **Models/Schemas** (Data models for ${database})
4. **Middleware** (Authentication, validation, error handling)
5. **Configuration** (Environment variables, database connection)
6. **Package Dependencies** (package.json or requirements.txt)

The API should include:
- RESTful endpoints (GET, POST, PUT, DELETE)
- Input validation
- Error handling
- Database integration
- Basic authentication (optional)
- API documentation comments

Make it production-ready with proper error handling, logging, and security considerations.

For ${framework} framework:
${framework === 'express' ? '- Use Express.js with middleware, routes, controllers' :
  framework === 'fastapi' ? '- Use FastAPI with Pydantic models, dependency injection' :
  framework === 'django' ? '- Use Django REST framework with serializers, viewsets' :
  '- Use appropriate framework patterns'}

Include realistic endpoints based on the description, with proper HTTP methods and status codes.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.3,
        max_tokens: 2000,
      });

      const result = completion.choices[0]?.message?.content;

      if (!result) {
        throw new Error('No response from AI model');
      }

      // Parse and structure the API code
      const structuredCode = this.parseAPICode(result, framework, language);

      return structuredCode;

    } catch (error) {
      throw new Error(`API generation failed: ${error.message}`);
    }
  }

  parseAPICode(response, framework, language) {
    const apiCode = {
      files: [],
      dependencies: [],
      setup_instructions: '',
      api_endpoints: []
    };

    const lines = response.split('\n');
    let currentFile = null;
    let inCodeBlock = false;
    let currentCode = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect file headers
      if (line.match(/^[A-Za-z_][A-Za-z0-9_]*\.(js|py|ts|json|txt|md)$/i) ||
          line.toLowerCase().includes('file:') ||
          line.toLowerCase().includes('create file')) {
        // Save previous file if exists
        if (currentFile && currentCode.trim()) {
          apiCode.files.push({
            name: currentFile,
            content: currentCode.trim(),
            language: this.detectFileLanguage(currentFile)
          });
        }

        // Start new file
        currentFile = line.replace(/^(file|create file)[:\s]*/i, '').trim();
        currentCode = '';
        inCodeBlock = false;
        continue;
      }

      // Detect code blocks
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          currentCode = '';
        } else {
          inCodeBlock = false;
        }
        continue;
      }

      // Detect dependencies section
      if (line.toLowerCase().includes('dependencies') || line.toLowerCase().includes('requirements')) {
        currentFile = 'dependencies';
        currentCode = '';
        continue;
      }

      // Detect setup instructions
      if (line.toLowerCase().includes('setup') || line.toLowerCase().includes('instructions')) {
        currentFile = 'setup_instructions';
        currentCode = '';
        continue;
      }

      // Accumulate content
      if (currentFile) {
        if (inCodeBlock || currentFile === 'dependencies' || currentFile === 'setup_instructions') {
          currentCode += line + '\n';
        }
      }
    }

    // Save the last file
    if (currentFile && currentCode.trim()) {
      if (currentFile === 'dependencies') {
        apiCode.dependencies = this.parseDependencies(currentCode);
      } else if (currentFile === 'setup_instructions') {
        apiCode.setup_instructions = currentCode.trim();
      } else {
        apiCode.files.push({
          name: currentFile,
          content: currentCode.trim(),
          language: this.detectFileLanguage(currentFile)
        });
      }
    }

    // Generate fallback content if parsing failed
    if (apiCode.files.length === 0) {
      apiCode.files = this.generateFallbackAPIFiles(framework, language);
    }

    // Extract API endpoints from the generated code
    apiCode.api_endpoints = this.extractAPIEndpoints(apiCode.files);

    return apiCode;
  }

  parseDependencies(depsText) {
    const dependencies = [];
    const lines = depsText.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('//')) {
        // Remove version specifiers and quotes
        const dep = trimmed.replace(/[<>=^~].*$/, '').replace(/['"]/g, '').trim();
        if (dep) {
          dependencies.push(dep);
        }
      }
    }

    return dependencies;
  }

  detectFileLanguage(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const langMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'json': 'json',
      'md': 'markdown',
      'txt': 'text',
      'yml': 'yaml',
      'yaml': 'yaml'
    };
    return langMap[ext] || 'text';
  }

  generateFallbackAPIFiles(framework, language) {
    const files = [];

    if (framework === 'express' && language === 'javascript') {
      files.push({
        name: 'server.js',
        content: `const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/api');

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
        language: 'javascript'
      });

      files.push({
        name: 'package.json',
        content: `{
  "name": "api-boilerplate",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^7.0.0"
  }
}`,
        language: 'json'
      });
    }

    return files;
  }

  extractAPIEndpoints(files) {
    const endpoints = [];

    for (const file of files) {
      if (file.language === 'javascript' || file.language === 'typescript') {
        const lines = file.content.split('\n');
        for (const line of lines) {
          const match = line.match(/app\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]*)['"]/i);
          if (match) {
            endpoints.push({
              method: match[1].toUpperCase(),
              path: match[2],
              file: file.name
            });
          }
        }
      }
    }

    return endpoints;
  }
}

module.exports = new APIBuilderAgent();
