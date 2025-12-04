const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class CodeAssistantAgent {
  async run(input) {
    try {
      const { code_snippet, repo_url } = input;

      if (!code_snippet) {
        throw new Error('Code snippet is required');
      }

      let code = code_snippet;

      // If it's a file path, read the content
      if (fs.existsSync(code_snippet)) {
        code = fs.readFileSync(code_snippet, 'utf8');
      }

      // Detect programming language
      const language = this.detectLanguage(code, code_snippet);

      // Analyze the code
      const analysis = await this.analyzeCode(code, language);

      return {
        success: true,
        analysis: analysis,
        language: language,
        code_length: code.length,
        processed_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Code Assistant Error:', error);
      return {
        success: false,
        error: error.message,
        analysis: null
      };
    }
  }

  detectLanguage(code, filePath = '') {
    // Check file extension first
    if (filePath) {
      const ext = path.extname(filePath).toLowerCase();
      const extMap = {
        '.js': 'javascript',
        '.ts': 'typescript',
        '.py': 'python',
        '.java': 'java',
        '.cpp': 'cpp',
        '.c': 'c',
        '.cs': 'csharp',
        '.php': 'php',
        '.rb': 'ruby',
        '.go': 'go',
        '.rs': 'rust',
        '.swift': 'swift',
        '.kt': 'kotlin'
      };
      if (extMap[ext]) return extMap[ext];
    }

    // Check code content
    if (code.includes('def ') || code.includes('import ') || code.includes('print(')) {
      return 'python';
    }
    if (code.includes('function') || code.includes('const ') || code.includes('let ')) {
      return 'javascript';
    }
    if (code.includes('public class') || code.includes('System.out')) {
      return 'java';
    }
    if (code.includes('#include') || code.includes('int main')) {
      return 'cpp';
    }

    return 'unknown';
  }

  async analyzeCode(code, language) {
    try {
      const prompt = `Analyze this ${language} code and provide:
1. Bug detection: List any potential bugs or issues
2. Code quality: Suggestions for improvement
3. Best practices: Any violations or recommendations
4. Minimal fix: If bugs found, provide corrected version

Code:
\`\`\`${language}
${code}
\`\`\`

Format your response clearly with sections. Be specific and actionable.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.2,
        max_tokens: 1500,
      });

      const result = completion.choices[0]?.message?.content;

      if (!result) {
        throw new Error('No response from AI model');
      }

      // Parse the response
      const analysis = this.parseAnalysis(result);

      return analysis;

    } catch (error) {
      throw new Error(`Code analysis failed: ${error.message}`);
    }
  }

  parseAnalysis(response) {
    const sections = {
      bugs: [],
      quality: [],
      practices: [],
      fix: ''
    };

    const lines = response.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const lowerLine = line.toLowerCase().trim();

      if (lowerLine.includes('bug') && lowerLine.includes('detect')) {
        currentSection = 'bugs';
      } else if (lowerLine.includes('code quality') || lowerLine.includes('improvement')) {
        currentSection = 'quality';
      } else if (lowerLine.includes('best practice') || lowerLine.includes('recommendation')) {
        currentSection = 'practices';
      } else if (lowerLine.includes('minimal fix') || lowerLine.includes('corrected')) {
        currentSection = 'fix';
      } else if (line.trim() && currentSection && !line.startsWith('#') && !line.startsWith('```')) {
        if (currentSection === 'fix') {
          sections.fix += line + '\n';
        } else {
          sections[currentSection].push(line.trim());
        }
      }
    }

    return {
      issues_found: sections.bugs.length > 0,
      bugs: sections.bugs.filter(bug => bug.length > 10), // Filter out short/empty items
      quality_suggestions: sections.quality.filter(s => s.length > 10),
      best_practices: sections.practices.filter(p => p.length > 10),
      suggested_fix: sections.fix.trim() || 'No specific fix suggested',
      severity: this.calculateSeverity(sections.bugs)
    };
  }

  calculateSeverity(bugs) {
    if (bugs.length === 0) return 'low';
    if (bugs.some(bug => bug.toLowerCase().includes('error') || bug.toLowerCase().includes('crash'))) {
      return 'high';
    }
    if (bugs.some(bug => bug.toLowerCase().includes('warning') || bug.toLowerCase().includes('potential'))) {
      return 'medium';
    }
    return 'low';
  }
}

module.exports = new CodeAssistantAgent();
