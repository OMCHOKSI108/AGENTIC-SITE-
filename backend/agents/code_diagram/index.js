const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class CodeToDiagramAgent {
  async run(input) {
    try {
      const { code, diagram_type = 'uml', output_format = 'mermaid' } = input;

      if (!code) {
        throw new Error('Code is required');
      }

      // Generate diagram from code
      const diagram = await this.generateDiagram(code, diagram_type, output_format);

      return {
        success: true,
        diagram: diagram,
        code_language: this.detectLanguage(code),
        diagram_type: diagram_type,
        output_format: output_format,
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Code-to-Diagram Error:', error);
      return {
        success: false,
        error: error.message,
        diagram: null
      };
    }
  }

  async generateDiagram(code, diagramType, outputFormat) {
    try {
      const prompt = `Analyze the following code and generate a ${diagramType} diagram in ${outputFormat} format.

CODE:
${code}

DIAGRAM TYPE: ${diagramType}
OUTPUT FORMAT: ${outputFormat}

Please provide:

1. **Diagram Code**: The complete ${outputFormat} syntax for the diagram
2. **Explanation**: What the diagram represents and key components
3. **Relationships**: How different parts of the code interact
4. **Key Classes/Functions**: Main components identified
5. **Flow/Structure**: How data or control flows through the system

For ${diagramType} diagrams:
${diagramType === 'uml' ? '- Include classes, interfaces, inheritance, associations' :
  diagramType === 'flowchart' ? '- Show decision points, loops, function calls' :
  diagramType === 'sequence' ? '- Show interaction between objects over time' :
  '- Create appropriate diagram type for the code structure'}

Ensure the diagram is:
- Accurate representation of the code structure
- Well-organized and readable
- Includes all major components and relationships
- Uses proper ${outputFormat} syntax

If the code is too complex, focus on the main architectural components.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.2,
        max_tokens: 1200,
      });

      const result = completion.choices[0]?.message?.content;

      if (!result) {
        throw new Error('No response from AI model');
      }

      // Parse and structure the diagram response
      const structuredDiagram = this.parseDiagramResponse(result, outputFormat);

      return structuredDiagram;

    } catch (error) {
      throw new Error(`Diagram generation failed: ${error.message}`);
    }
  }

  parseDiagramResponse(response, outputFormat) {
    const diagram = {
      diagram_code: '',
      explanation: '',
      relationships: [],
      key_components: [],
      flow_structure: ''
    };

    const lines = response.split('\n');
    let currentSection = '';
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect code blocks
      if (line.startsWith('```' + outputFormat) || line.startsWith('```mermaid') || line.startsWith('```')) {
        inCodeBlock = true;
        currentSection = 'diagram_code';
        diagram.diagram_code = '';
        continue;
      } else if (line.startsWith('```') && inCodeBlock) {
        inCodeBlock = false;
        continue;
      }

      if (inCodeBlock && currentSection === 'diagram_code') {
        diagram.diagram_code += line + '\n';
        continue;
      }

      // Detect sections when not in code block
      if (line.toLowerCase().includes('explanation')) {
        currentSection = 'explanation';
      } else if (line.toLowerCase().includes('relationship')) {
        currentSection = 'relationships';
      } else if (line.toLowerCase().includes('key') && line.toLowerCase().includes('component')) {
        currentSection = 'key_components';
      } else if (line.toLowerCase().includes('flow') || line.toLowerCase().includes('structure')) {
        currentSection = 'flow_structure';
      } else if (currentSection && line.trim() && !line.startsWith('#')) {
        if (line.match(/^[-•*]\s/) || line.match(/^\d+\./)) {
          const item = line.replace(/^[-•*\d+.]+\s*/, '').trim();
          if (item.length > 3) {
            if (currentSection === 'relationships') {
              diagram.relationships.push(item);
            } else if (currentSection === 'key_components') {
              diagram.key_components.push(item);
            }
          }
        } else if (!line.match(/^[-•*\d+.]/)) {
          if (currentSection === 'explanation') {
            diagram.explanation += (diagram.explanation ? ' ' : '') + line;
          } else if (currentSection === 'flow_structure') {
            diagram.flow_structure += (diagram.flow_structure ? ' ' : '') + line;
          }
        }
      }
    }

    // Clean up diagram code
    diagram.diagram_code = diagram.diagram_code.trim();

    // Fallback if diagram code is empty
    if (!diagram.diagram_code) {
      diagram.diagram_code = this.generateFallbackDiagram(outputFormat);
    }

    // Fallback content
    if (!diagram.explanation) {
      diagram.explanation = 'This diagram represents the structure and relationships found in the provided code.';
    }

    return diagram;
  }

  generateFallbackDiagram(format) {
    if (format === 'mermaid') {
      return `graph TD
    A[Code Component] --> B[Function/Method]
    A --> C[Class/Module]
    B --> D[Logic Flow]
    C --> D`;
    }
    return 'Diagram syntax not generated';
  }

  detectLanguage(code) {
    const firstLines = code.split('\n').slice(0, 10).join('\n').toLowerCase();

    if (firstLines.includes('function') && firstLines.includes('const') && firstLines.includes('=>')) {
      return 'javascript';
    } else if (firstLines.includes('def ') && firstLines.includes('import ')) {
      return 'python';
    } else if (firstLines.includes('public class') || firstLines.includes('system.out')) {
      return 'java';
    } else if (firstLines.includes('#include') || firstLines.includes('int main')) {
      return 'c/c++';
    } else if (firstLines.includes('using system') || firstLines.includes('console.writeline')) {
      return 'c#';
    } else if (firstLines.includes('<?php') || firstLines.includes('echo ')) {
      return 'php';
    } else if (firstLines.includes('fn ') || firstLines.includes('let ') && firstLines.includes('rust')) {
      return 'rust';
    } else if (firstLines.includes('func ') && firstLines.includes('package main')) {
      return 'go';
    }

    return 'unknown';
  }
}

module.exports = new CodeToDiagramAgent();
