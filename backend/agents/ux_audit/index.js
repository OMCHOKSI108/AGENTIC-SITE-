const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class UXAuditAgent {
  async run(input) {
    try {
      const { screenshot_or_url, audit_type = 'comprehensive' } = input;

      if (!screenshot_or_url) {
        throw new Error('Screenshot or URL is required');
      }

      // Analyze the UI/UX
      const audit = await this.performUXAudit(screenshot_or_url, audit_type);

      return {
        success: true,
        audit: audit,
        audit_type: audit_type,
        analyzed_at: new Date().toISOString(),
        recommendations_count: audit.recommendations.length,
        accessibility_score: audit.accessibility_score,
        usability_score: audit.usability_score
      };

    } catch (error) {
      console.error('UX Audit Error:', error);
      return {
        success: false,
        error: error.message,
        audit: null
      };
    }
  }

  async performUXAudit(screenshotOrUrl, auditType) {
    try {
      let description = '';

      // If it's a file path, read it (for now, assume it's a description)
      if (fs.existsSync(screenshotOrUrl)) {
        // For demo purposes, we'll use a placeholder description
        // In a real implementation, you'd use OCR or image analysis
        description = `UI screenshot analysis for: ${path.basename(screenshotOrUrl)}`;
      } else if (screenshotOrUrl.startsWith('http')) {
        description = `Website URL analysis for: ${screenshotOrUrl}`;
      } else {
        // Assume it's a text description of the UI
        description = screenshotOrUrl;
      }

      const prompt = `Perform a comprehensive UX audit on the following interface:

INTERFACE DESCRIPTION:
${description}

AUDIT TYPE: ${auditType}

Please provide a detailed UX audit covering:

1. **Accessibility Issues** (WCAG 2.1 compliance):
   - Color contrast problems
   - Missing alt text
   - Keyboard navigation issues
   - Screen reader compatibility
   - Focus indicators

2. **Usability Issues**:
   - Nielsen's 10 usability heuristics violations
   - Information architecture problems
   - Navigation issues
   - Cognitive load issues

3. **Visual Design Issues**:
   - Layout and spacing problems
   - Typography issues
   - Visual hierarchy problems
   - Consistency issues

4. **Technical Issues**:
   - Performance considerations
   - Mobile responsiveness
   - Loading states
   - Error handling

For each issue found, provide:
- Severity level (Critical/High/Medium/Low)
- Specific problem description
- Exact location/component affected
- WCAG guideline reference (if applicable)
- Recommended fix with code examples
- Impact on user experience

Also provide:
- Overall accessibility score (0-100)
- Overall usability score (0-100)
- Priority recommendations (top 5 fixes)

Be thorough and specific in your analysis. If no issues are found in a category, state that explicitly.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.2,
        max_tokens: 2500,
      });

      const result = completion.choices[0]?.message?.content;

      if (!result) {
        throw new Error('No response from AI model');
      }

      // Parse the audit results
      const audit = this.parseUXAudit(result);

      return audit;

    } catch (error) {
      throw new Error(`UX audit failed: ${error.message}`);
    }
  }

  parseUXAudit(response) {
    const audit = {
      accessibility_issues: [],
      usability_issues: [],
      visual_issues: [],
      technical_issues: [],
      recommendations: [],
      accessibility_score: 0,
      usability_score: 0,
      overall_score: 0
    };

    const lines = response.split('\n');
    let currentSection = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lowerLine = line.toLowerCase();

      // Detect sections
      if (lowerLine.includes('accessibility') && lowerLine.includes('issue')) {
        currentSection = 'accessibility';
      } else if (lowerLine.includes('usability') && lowerLine.includes('issue')) {
        currentSection = 'usability';
      } else if (lowerLine.includes('visual') && lowerLine.includes('issue')) {
        currentSection = 'visual';
      } else if (lowerLine.includes('technical') && lowerLine.includes('issue')) {
        currentSection = 'technical';
      } else if (lowerLine.includes('recommendation') || lowerLine.includes('priority')) {
        currentSection = 'recommendations';
      } else if (lowerLine.includes('score')) {
        // Extract scores
        const scoreMatch = line.match(/(\d+)(?:\s*\/\s*100|\s*%)?/);
        if (scoreMatch) {
          const score = parseInt(scoreMatch[1]);
          if (lowerLine.includes('accessibility')) {
            audit.accessibility_score = score;
          } else if (lowerLine.includes('usability')) {
            audit.usability_score = score;
          } else if (lowerLine.includes('overall')) {
            audit.overall_score = score;
          }
        }
      } else if (line.trim() && currentSection && !line.startsWith('#') && !line.startsWith('```')) {
        // Parse issues
        if (line.match(/^[-•*]\s/) || line.match(/^\d+\./) || line.match(/^(Critical|High|Medium|Low):/i)) {
          const issue = this.parseIssue(line);
          if (issue && audit[`${currentSection}_issues`]) {
            audit[`${currentSection}_issues`].push(issue);
          } else if (currentSection === 'recommendations' && issue) {
            audit.recommendations.push(issue);
          }
        }
      }
    }

    // Calculate overall score if not provided
    if (!audit.overall_score) {
      audit.overall_score = Math.round((audit.accessibility_score + audit.usability_score) / 2);
    }

    return audit;
  }

  parseIssue(line) {
    // Remove bullet points and numbering
    let cleanLine = line.replace(/^[-•*\d+.]+\s*/, '').trim();

    // Extract severity if present
    let severity = 'Medium';
    const severityMatch = cleanLine.match(/^(Critical|High|Medium|Low):\s*/i);
    if (severityMatch) {
      severity = severityMatch[1].charAt(0).toUpperCase() + severityMatch[1].slice(1).toLowerCase();
      cleanLine = cleanLine.replace(severityMatch[0], '').trim();
    }

    if (cleanLine.length < 10) return null;

    return {
      description: cleanLine,
      severity: severity,
      category: 'UX Issue'
    };
  }
}

module.exports = new UXAuditAgent();
