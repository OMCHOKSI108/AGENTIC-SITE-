const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class SQLQueryGeneratorAgent {
  async run(input) {
    try {
      const { question, schema, database_type = 'postgresql' } = input;

      if (!question) {
        throw new Error('Question is required');
      }

      if (!schema) {
        throw new Error('Database schema is required');
      }

      // Generate SQL query
      const result = await this.generateSQLQuery(question, schema, database_type);

      return {
        success: true,
        query: result.query,
        explanation: result.explanation,
        optimization_tips: result.optimization_tips,
        database_type: database_type,
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('SQL Query Generator Error:', error);
      return {
        success: false,
        error: error.message,
        query: null
      };
    }
  }

  async generateSQLQuery(question, schema, databaseType) {
    try {
      const prompt = `Generate a SQL query based on the following natural language question and database schema.

DATABASE TYPE: ${databaseType}
SCHEMA:
${schema}

QUESTION: "${question}"

Please provide:
1. The complete SQL query
2. A step-by-step explanation of what the query does
3. Optimization tips and best practices
4. Any assumptions made about the data

Make sure the query is:
- Syntactically correct for ${databaseType}
- Efficient and well-structured
- Uses appropriate JOINs, WHERE clauses, GROUP BY, etc.
- Includes proper aliases and formatting

If the question is ambiguous, provide the most logical interpretation.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.1,
        max_tokens: 1000,
      });

      const result = completion.choices[0]?.message?.content;

      if (!result) {
        throw new Error('No response from AI model');
      }

      // Parse the response
      const parsed = this.parseSQLResponse(result);

      return parsed;

    } catch (error) {
      throw new Error(`SQL query generation failed: ${error.message}`);
    }
  }

  parseSQLResponse(response) {
    const result = {
      query: '',
      explanation: '',
      optimization_tips: []
    };

    const lines = response.split('\n');
    let currentSection = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.toLowerCase().includes('sql') && line.toLowerCase().includes('query')) {
        currentSection = 'query';
      } else if (line.toLowerCase().includes('explanation')) {
        currentSection = 'explanation';
      } else if (line.toLowerCase().includes('optimization') || line.toLowerCase().includes('tips')) {
        currentSection = 'optimization';
      } else if (currentSection && line.trim()) {
        if (currentSection === 'query') {
          if (line.toLowerCase().startsWith('select') || line.toLowerCase().startsWith('insert') ||
              line.toLowerCase().startsWith('update') || line.toLowerCase().startsWith('delete')) {
            result.query = line;
            // Continue reading multi-line query
            let j = i + 1;
            while (j < lines.length && !lines[j].trim().toLowerCase().includes('explanation') &&
                   !lines[j].trim().toLowerCase().includes('optimization')) {
              if (lines[j].trim()) {
                result.query += '\n' + lines[j].trim();
              }
              j++;
            }
            i = j - 1;
          }
        } else if (currentSection === 'explanation') {
          result.explanation += (result.explanation ? ' ' : '') + line;
        } else if (currentSection === 'optimization') {
          if (line.match(/^[-•*]\s/) || line.match(/^\d+\./)) {
            result.optimization_tips.push(line.replace(/^[-•*\d+.]+\s*/, '').trim());
          }
        }
      }
    }

    // Fallback if parsing failed
    if (!result.query) {
      result.query = response.split('\n').find(line =>
        line.toLowerCase().includes('select') || line.toLowerCase().includes('insert') ||
        line.toLowerCase().includes('update') || line.toLowerCase().includes('delete')
      ) || 'SELECT * FROM table_name; -- Query could not be generated';
    }

    if (!result.explanation) {
      result.explanation = 'This query retrieves data based on your question.';
    }

    return result;
  }
}

module.exports = new SQLQueryGeneratorAgent();
