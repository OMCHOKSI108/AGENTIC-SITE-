const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class SQLTeacherAgent {
  async run(input) {
    try {
      const { sql_query, skill_level = 'intermediate' } = input;

      if (!sql_query) {
        throw new Error('SQL query is required');
      }

      // Explain the SQL query
      const explanation = await this.explainSQLQuery(sql_query, skill_level);

      return {
        success: true,
        explanation: explanation,
        skill_level: skill_level,
        original_query: sql_query,
        explained_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('SQL Teacher Error:', error);
      return {
        success: false,
        error: error.message,
        explanation: null
      };
    }
  }

  async explainSQLQuery(sqlQuery, skillLevel) {
    try {
      const prompt = `Explain this SQL query in detail for a ${skillLevel} level developer/user.

SQL QUERY:
${sqlQuery}

Please provide a comprehensive explanation that includes:

1. **What the query does** (high-level overview)
2. **Step-by-step breakdown** of each clause/component
3. **Key concepts** used (JOINs, subqueries, window functions, etc.)
4. **Performance considerations** and potential optimizations
5. **Common use cases** for this type of query
6. **Alternative approaches** if applicable

For ${skillLevel} level:
${skillLevel === 'beginner' ? '- Use simple language, explain basic concepts' :
  skillLevel === 'intermediate' ? '- Assume basic SQL knowledge, focus on advanced concepts' :
  '- Deep technical analysis, performance implications, edge cases'}

Format the explanation clearly with sections and code examples where helpful.`;

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

      // Parse and structure the explanation
      const structuredExplanation = this.structureExplanation(result, sqlQuery);

      return structuredExplanation;

    } catch (error) {
      throw new Error(`SQL explanation failed: ${error.message}`);
    }
  }

  structureExplanation(response, originalQuery) {
    const explanation = {
      overview: '',
      step_by_step: [],
      key_concepts: [],
      performance_notes: [],
      use_cases: [],
      alternatives: []
    };

    const lines = response.split('\n');
    let currentSection = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect sections
      if (line.toLowerCase().includes('what the query does') || line.toLowerCase().includes('overview')) {
        currentSection = 'overview';
      } else if (line.toLowerCase().includes('step-by-step') || line.toLowerCase().includes('breakdown')) {
        currentSection = 'step_by_step';
      } else if (line.toLowerCase().includes('key concepts')) {
        currentSection = 'key_concepts';
      } else if (line.toLowerCase().includes('performance')) {
        currentSection = 'performance_notes';
      } else if (line.toLowerCase().includes('use case')) {
        currentSection = 'use_cases';
      } else if (line.toLowerCase().includes('alternative')) {
        currentSection = 'alternatives';
      } else if (currentSection && line.trim() && !line.startsWith('#')) {
        if (line.match(/^[-•*]\s/) || line.match(/^\d+\./)) {
          const item = line.replace(/^[-•*\d+.]+\s*/, '').trim();
          if (item.length > 5) {
            if (Array.isArray(explanation[currentSection])) {
              explanation[currentSection].push(item);
            }
          }
        } else if (currentSection === 'overview' && !line.match(/^[-•*\d+.]/)) {
          explanation.overview += (explanation.overview ? ' ' : '') + line;
        }
      }
    }

    // Fallback content if parsing failed
    if (!explanation.overview) {
      explanation.overview = `This SQL query performs operations on database tables to retrieve, manipulate, or analyze data.`;
    }

    if (explanation.step_by_step.length === 0) {
      explanation.step_by_step = [
        'Parse the query structure and identify main components',
        'Execute FROM clause to determine data sources',
        'Apply WHERE conditions to filter data',
        'Perform JOIN operations if specified',
        'Apply GROUP BY and aggregate functions',
        'Apply HAVING conditions to grouped data',
        'Sort results with ORDER BY',
        'Limit results with LIMIT/OFFSET'
      ];
    }

    return explanation;
  }
}

module.exports = new SQLTeacherAgent();
