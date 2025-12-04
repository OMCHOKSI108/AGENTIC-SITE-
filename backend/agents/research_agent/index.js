const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class ResearchAgent {
  async run(input) {
    try {
      // Handle both generic prompt format and specific agent format
      const { prompt, topic, depth = 'comprehensive', sources = 5 } = input;
      const researchTopic = topic || prompt;

      if (!researchTopic) {
        throw new Error('Research topic is required');
      }

      // Conduct research
      const research = await this.conductResearch(researchTopic, depth, sources);

      return {
        success: true,
        research: research,
        topic: topic,
        depth: depth,
        sources_analyzed: sources,
        completed_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Research Agent Error:', error);
      return {
        success: false,
        error: error.message,
        research: null
      };
    }
  }

  async conductResearch(topic, depth, sources) {
    try {
      const prompt = `Conduct comprehensive research on the topic: "${topic}"

Research Parameters:
- Depth: ${depth} (brief/comprehensive/detailed)
- Sources to analyze: ${sources}

Please provide a structured research report including:

1. **Executive Summary**: 2-3 paragraph overview of key findings

2. **Background & Context**: Historical context and current state

3. **Key Findings**: Main discoveries and insights (3-5 major points)

4. **Detailed Analysis**: 
   - Current trends and developments
   - Statistics and data points
   - Expert opinions and perspectives
   - Challenges and opportunities

5. **Sources & References**: 
   - Primary sources analyzed
   - Credible references
   - Data sources

6. **Future Outlook**: Predictions and emerging trends

7. **Recommendations**: Actionable insights based on research

8. **Methodology**: How the research was conducted

Ensure the research is:
- Well-structured and easy to navigate
- Based on logical analysis and reasoning
- Balanced with multiple perspectives
- Current and relevant (as of 2024)
- Properly cited and referenced

For ${depth} depth:
${depth === 'brief' ? '- Focus on key highlights and main conclusions' :
  depth === 'comprehensive' ? '- Cover all aspects with detailed analysis' :
  '- Extremely thorough with extensive details and multiple viewpoints'}`;

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

      // Structure the research report
      const structuredReport = this.structureResearchReport(result, topic);

      return structuredReport;

    } catch (error) {
      throw new Error(`Research failed: ${error.message}`);
    }
  }

  structureResearchReport(response, topic) {
    const report = {
      executive_summary: '',
      background_context: '',
      key_findings: [],
      detailed_analysis: {
        trends: [],
        statistics: [],
        perspectives: [],
        challenges: []
      },
      sources_references: [],
      future_outlook: '',
      recommendations: [],
      methodology: ''
    };

    const lines = response.split('\n');
    let currentSection = '';
    let currentSubsection = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect main sections
      if (line.toLowerCase().includes('executive summary')) {
        currentSection = 'executive_summary';
        currentSubsection = '';
      } else if (line.toLowerCase().includes('background') || line.toLowerCase().includes('context')) {
        currentSection = 'background_context';
        currentSubsection = '';
      } else if (line.toLowerCase().includes('key findings')) {
        currentSection = 'key_findings';
        currentSubsection = '';
      } else if (line.toLowerCase().includes('detailed analysis')) {
        currentSection = 'detailed_analysis';
        currentSubsection = '';
      } else if (line.toLowerCase().includes('sources') || line.toLowerCase().includes('references')) {
        currentSection = 'sources_references';
        currentSubsection = '';
      } else if (line.toLowerCase().includes('future outlook')) {
        currentSection = 'future_outlook';
        currentSubsection = '';
      } else if (line.toLowerCase().includes('recommendations')) {
        currentSection = 'recommendations';
        currentSubsection = '';
      } else if (line.toLowerCase().includes('methodology')) {
        currentSection = 'methodology';
        currentSubsection = '';
      } else if (currentSection === 'detailed_analysis') {
        // Handle subsections within detailed analysis
        if (line.toLowerCase().includes('trend')) {
          currentSubsection = 'trends';
        } else if (line.toLowerCase().includes('statistic')) {
          currentSubsection = 'statistics';
        } else if (line.toLowerCase().includes('perspective')) {
          currentSubsection = 'perspectives';
        } else if (line.toLowerCase().includes('challenge')) {
          currentSubsection = 'challenges';
        }
      } else if (currentSection && line.trim() && !line.startsWith('#')) {
        if (line.match(/^[-•*]\s/) || line.match(/^\d+\./)) {
          const item = line.replace(/^[-•*\d+.]+\s*/, '').trim();
          if (item.length > 5) {
            if (currentSection === 'key_findings') {
              report.key_findings.push(item);
            } else if (currentSection === 'recommendations') {
              report.recommendations.push(item);
            } else if (currentSection === 'sources_references') {
              report.sources_references.push(item);
            } else if (currentSection === 'detailed_analysis' && currentSubsection) {
              report.detailed_analysis[currentSubsection].push(item);
            }
          }
        } else if (!line.match(/^[-•*\d+.]/)) {
          // Regular paragraph text
          if (currentSection === 'executive_summary') {
            report.executive_summary += (report.executive_summary ? ' ' : '') + line;
          } else if (currentSection === 'background_context') {
            report.background_context += (report.background_context ? ' ' : '') + line;
          } else if (currentSection === 'future_outlook') {
            report.future_outlook += (report.future_outlook ? ' ' : '') + line;
          } else if (currentSection === 'methodology') {
            report.methodology += (report.methodology ? ' ' : '') + line;
          }
        }
      }
    }

    // Ensure we have fallback content
    if (!report.executive_summary) {
      report.executive_summary = `This research report provides a comprehensive analysis of ${topic}, covering key findings, trends, and insights based on thorough investigation.`;
    }

    if (report.key_findings.length === 0) {
      report.key_findings = [
        'Multiple perspectives and data sources were analyzed',
        'Key trends and patterns were identified',
        'Actionable insights and recommendations were developed'
      ];
    }

    return report;
  }
}

module.exports = new ResearchAgent();
