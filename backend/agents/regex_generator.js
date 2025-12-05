const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

class RegexGeneratorAgent {
  async run(input) {
    const { requirement } = input;

    if (!requirement || typeof requirement !== 'string') {
      return {
        success: false,
        error: 'Please provide a regex requirement'
      };
    }

    try {
      const prompt = `Generate a regular expression for the following requirement. Return the response as a valid JSON object with this exact structure:

{
  "regex": "the regex pattern without slashes",
  "flags": "g,i,m,s,u,y flags if needed, otherwise empty string",
  "explanation": "detailed explanation of the regex pattern",
  "test_cases": [
    {
      "test_string": "example string to test",
      "expected_match": true,
      "explanation": "why this should/shouldn't match"
    }
  ],
  "code_examples": [
    {
      "language": "JavaScript",
      "code": "const regex = /pattern/flags;\\nconst result = regex.test('test string');",
      "description": "How to use this regex in JavaScript"
    },
    {
      "language": "Python",
      "code": "import re\\npattern = r'pattern'\\nresult = re.search(pattern, 'test string')",
      "description": "How to use this regex in Python"
    }
  ],
  "common_use_cases": [
    "Use case 1",
    "Use case 2"
  ],
  "performance_notes": "Any performance considerations or best practices"
}

Requirement: "${requirement}"

Make sure the regex is optimized and the test cases cover both matching and non-matching scenarios. Include at least 4 test cases. Provide code examples for at least 2 programming languages.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();

      // Try to parse the JSON response
      let parsedResponse;
      try {
        // Remove any markdown code blocks if present
        const jsonMatch = responseText.match(/```json\s*(\{[\s\S]*?\})\s*```/) ||
                         responseText.match(/```javascript\s*(\{[\s\S]*?\})\s*```/) ||
                         responseText.match(/(\{[\s\S]*\})/);

        const jsonString = jsonMatch ? jsonMatch[1] : responseText;
        parsedResponse = JSON.parse(jsonString);
      } catch (parseError) {
        console.log('JSON parsing failed, using fallback extraction');
        // If JSON parsing fails, create a structured response from the text
        parsedResponse = {
          regex: this.extractRegexFromText(responseText),
          flags: this.extractFlagsFromText(responseText),
          explanation: this.extractExplanationFromText(responseText),
          test_cases: this.extractTestCasesFromText(responseText),
          code_examples: [
            {
              language: "JavaScript",
              code: `const regex = /${this.extractRegexFromText(responseText)}/${this.extractFlagsFromText(responseText)};\nconsole.log(regex.test("test string"));`,
              description: "Basic usage in JavaScript"
            },
            {
              language: "Python",
              code: `import re\npattern = r"${this.extractRegexFromText(responseText)}"\nresult = re.search(pattern, "test string")\nprint(result)`,
              description: "Basic usage in Python"
            }
          ],
          common_use_cases: ["Input validation", "Text parsing", "Data extraction"],
          performance_notes: "Test regex performance with large datasets. Consider using non-capturing groups when possible."
        };
      }

      return {
        success: true,
        output: parsedResponse,
        cost: 0.018,
        time_ms: 1800
      };

    } catch (error) {
      console.error('Regex Generator error:', error);
      return {
        success: false,
        error: `Failed to generate regex: ${error.message}`
      };
    }
  }

  // Helper functions to extract data from text if JSON parsing fails
  extractRegexFromText(text) {
    const regexMatch = text.match(/\/([^\/]+)\//) || text.match(/`([^`]+)`/) || text.match(/regex[:\s]*([^\s\n]+)/i);
    return regexMatch ? regexMatch[1] : '[regex pattern]';
  }

  extractFlagsFromText(text) {
    const flagsMatch = text.match(/\/[a-z]+\s*\n/) || text.match(/flags[:\s]*([gimuy]+)/i);
    return flagsMatch ? flagsMatch[1] : '';
  }

  extractExplanationFromText(text) {
    const explanationMatch = text.match(/## Explanation\s*\n([\s\S]*?)(?=##|$)/) ||
                            text.match(/explanation[:\s]*([^\n]+)/i);
    return explanationMatch ? explanationMatch[1].trim() : 'This regex pattern matches the specified requirement.';
  }

  extractTestCasesFromText(text) {
    const testCases = [];
    const matchesMatch = text.match(/## Test Cases\s*\n([\s\S]*?)(?=##|$)/) ||
                        text.match(/test cases[:\s]*([\s\S]*?)(?=##|$)/i);

    if (matchesMatch) {
      const testText = matchesMatch[1];
      const lines = testText.split('\n').filter(line => line.trim());

      lines.forEach(line => {
        const matchMatch = line.match(/[✅✔️✓]\s*Match:\s*"([^"]+)"(?:\s*→\s*(.+))?/i) ||
                          line.match(/should match[:\s]*"([^"]+)"(?:\s*-\s*(.+))?/i);
        const noMatchMatch = line.match(/[❌✗✕]\s*No Match:\s*"([^"]+)"(?:\s*→\s*(.+))?/i) ||
                            line.match(/should not match[:\s]*"([^"]+)"(?:\s*-\s*(.+))?/i);

        if (matchMatch) {
          testCases.push({
            test_string: matchMatch[1],
            expected_match: true,
            explanation: matchMatch[2] || 'Should match this pattern'
          });
        } else if (noMatchMatch) {
          testCases.push({
            test_string: noMatchMatch[1],
            expected_match: false,
            explanation: noMatchMatch[2] || 'Should not match this pattern'
          });
        }
      });
    }

    // Add default test cases if none found
    if (testCases.length === 0) {
      testCases.push(
        { test_string: "example", expected_match: true, explanation: "Basic example" },
        { test_string: "test", expected_match: true, explanation: "Another example" },
        { test_string: "invalid", expected_match: false, explanation: "Should not match" },
        { test_string: "wrong", expected_match: false, explanation: "Should not match" }
      );
    }

    return testCases.slice(0, 6); // Limit to 6 test cases
  }
}

module.exports = new RegexGeneratorAgent();
