const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class ResumeOptimizerAgent {
  async run(input) {
    try {
      const { resume_file, job_description } = input;

      if (!resume_file) {
        throw new Error('Resume file path is required');
      }

      if (!job_description) {
        throw new Error('Job description is required');
      }

      // Read resume content
      let resumeContent = '';
      if (fs.existsSync(resume_file)) {
        const fileExtension = path.extname(resume_file).toLowerCase();
        if (fileExtension === '.pdf') {
          // For PDF files, we'd need pdf-parse, but for now return a message
          throw new Error('PDF parsing not yet implemented. Please provide text content directly.');
        } else if (fileExtension === '.txt' || fileExtension === '.docx') {
          resumeContent = fs.readFileSync(resume_file, 'utf8');
        } else {
          resumeContent = resume_file; // Assume it's text content
        }
      } else {
        resumeContent = resume_file; // Assume it's text content
      }

      // Optimize the resume
      const optimization = await this.optimizeResume(resumeContent, job_description);

      return {
        success: true,
        optimization: optimization,
        original_length: resumeContent.length,
        optimized_length: optimization.content.length,
        processed_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Resume Optimizer Error:', error);
      return {
        success: false,
        error: error.message,
        optimization: null
      };
    }
  }

  async optimizeResume(resumeContent, jobDescription) {
    try {
      const prompt = `Optimize this resume for the following job description. Make it ATS-friendly and highly targeted.

JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME:
${resumeContent}

Please provide:
1. Optimized resume content with relevant keywords from the job description
2. ATS optimization suggestions (keep it to 1 page, use standard headings, etc.)
3. Keyword matching analysis (which important keywords were added/improved)
4. Specific improvements made
5. Final resume formatted for ATS parsing

Focus on:
- Incorporating job-specific keywords naturally
- Quantifying achievements where possible
- Using standard section headings
- Keeping length appropriate (1 page)
- Making it scannable for recruiters`;

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

      // Parse the optimization results
      const optimization = this.parseOptimization(result, resumeContent, jobDescription);

      return optimization;

    } catch (error) {
      throw new Error(`Resume optimization failed: ${error.message}`);
    }
  }

  parseOptimization(response, originalResume, jobDescription) {
    const optimization = {
      content: '',
      ats_suggestions: [],
      keyword_analysis: [],
      improvements: [],
      ats_score: 0
    };

    const lines = response.split('\n');
    let currentSection = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lowerLine = line.toLowerCase();

      if (lowerLine.includes('optimized resume') || lowerLine.includes('final resume')) {
        currentSection = 'content';
        optimization.content = '';
      } else if (lowerLine.includes('ats optimization') || lowerLine.includes('ats suggestions')) {
        currentSection = 'ats_suggestions';
      } else if (lowerLine.includes('keyword') && lowerLine.includes('analysis')) {
        currentSection = 'keyword_analysis';
      } else if (lowerLine.includes('improvement')) {
        currentSection = 'improvements';
      } else if (line.trim() && currentSection && !line.startsWith('#') && !line.startsWith('```')) {
        if (currentSection === 'content') {
          optimization.content += line + '\n';
        } else if (line.match(/^[-•*]\s/) || line.match(/^\d+\./)) {
          const item = line.replace(/^[-•*\d+.]+\s*/, '').trim();
          if (item.length > 5) {
            optimization[currentSection].push(item);
          }
        }
      }
    }

    // Calculate ATS score (simple heuristic)
    optimization.ats_score = this.calculateATSScore(optimization);

    // Clean up content
    optimization.content = optimization.content.trim();

    // If content is empty, provide a fallback
    if (!optimization.content) {
      optimization.content = originalResume;
      optimization.improvements.push('Unable to generate optimized content - using original');
    }

    return optimization;
  }

  calculateATSScore(optimization) {
    let score = 50; // Base score

    // Check for ATS-friendly elements
    if (optimization.content.includes('SUMMARY') || optimization.content.includes('EXPERIENCE')) {
      score += 15;
    }

    if (optimization.content.split('\n').length < 50) { // Reasonable length
      score += 10;
    }

    if (optimization.keyword_analysis.length > 0) {
      score += 15;
    }

    if (optimization.ats_suggestions.length > 0) {
      score += 10;
    }

    return Math.min(score, 100);
  }
}

module.exports = new ResumeOptimizerAgent();
