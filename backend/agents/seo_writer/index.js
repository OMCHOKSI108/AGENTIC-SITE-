const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class SEOWriterAgent {
  async run(input) {
    try {
      const { keyword } = input;

      if (!keyword) {
        throw new Error('Keyword is required');
      }

      // Generate SEO-optimized content
      const content = await this.generateSEOContent(keyword);

      return {
        success: true,
        content: content,
        keyword: keyword,
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('SEO Writer Error:', error);
      return {
        success: false,
        error: error.message,
        content: null
      };
    }
  }

  async generateSEOContent(keyword) {
    try {
      const prompt = `Create an SEO-optimized blog post for the keyword "${keyword}". Include:

1. SEO Title (under 60 characters)
2. Meta Description (under 160 characters)
3. H1 heading
4. Introduction paragraph (100-150 words)
5. 3-4 H2 sections with content (each 200-300 words)
6. Conclusion paragraph
7. 5 suggested internal links
8. 3 suggested external links

Make the content comprehensive, engaging, and optimized for search engines. Use the keyword naturally throughout the content. Include relevant sub-keywords and long-tail phrases.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.7,
        max_tokens: 3000,
      });

      const result = completion.choices[0]?.message?.content;

      if (!result) {
        throw new Error('No response from AI model');
      }

      // Parse and structure the content
      const structuredContent = this.parseSEOContent(result, keyword);

      return structuredContent;

    } catch (error) {
      throw new Error(`SEO content generation failed: ${error.message}`);
    }
  }

  parseSEOContent(response, keyword) {
    const content = {
      seo_title: '',
      meta_description: '',
      h1: '',
      introduction: '',
      sections: [],
      conclusion: '',
      internal_links: [],
      external_links: [],
      word_count: 0,
      keyword_density: 0
    };

    const lines = response.split('\n');
    let currentSection = '';
    let sectionContent = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lowerLine = line.toLowerCase();

      if (lowerLine.includes('seo title') || lowerLine.includes('title:')) {
        content.seo_title = line.replace(/^(seo title|title):?\s*/i, '').trim();
      } else if (lowerLine.includes('meta description') || lowerLine.includes('description:')) {
        content.meta_description = line.replace(/^(meta description|description):?\s*/i, '').trim();
      } else if (line.match(/^#+\s/) && !content.h1) {
        content.h1 = line.replace(/^#+\s*/, '').trim();
      } else if (lowerLine.includes('introduction') || lowerLine.includes('intro')) {
        currentSection = 'introduction';
        sectionContent = '';
      } else if (lowerLine.includes('conclusion')) {
        if (currentSection === 'introduction') {
          content.introduction = sectionContent.trim();
        }
        currentSection = 'conclusion';
        sectionContent = '';
      } else if (lowerLine.includes('internal links') || lowerLine.includes('suggested internal')) {
        currentSection = 'internal_links';
      } else if (lowerLine.includes('external links') || lowerLine.includes('suggested external')) {
        currentSection = 'external_links';
      } else if (line.match(/^##+\s/) && currentSection !== 'introduction' && currentSection !== 'conclusion') {
        // New H2 section
        if (sectionContent.trim()) {
          content.sections.push({
            title: sectionContent.split('\n')[0] || 'Section',
            content: sectionContent.trim()
          });
        }
        sectionContent = line.replace(/^##+\s*/, '') + '\n';
      } else if (line.trim() && currentSection) {
        if (currentSection === 'internal_links') {
          if (line.match(/^[-•*]\s/) || line.match(/^\d+\./)) {
            content.internal_links.push(line.replace(/^[-•*\d+.]+\s*/, '').trim());
          }
        } else if (currentSection === 'external_links') {
          if (line.match(/^[-•*]\s/) || line.match(/^\d+\./)) {
            content.external_links.push(line.replace(/^[-•*\d+.]+\s*/, '').trim());
          }
        } else {
          sectionContent += line + '\n';
        }
      }
    }

    // Handle remaining content
    if (currentSection === 'conclusion') {
      content.conclusion = sectionContent.trim();
    } else if (sectionContent.trim()) {
      content.sections.push({
        title: 'Additional Content',
        content: sectionContent.trim()
      });
    }

    // Calculate word count and keyword density
    const fullText = [
      content.introduction,
      content.conclusion,
      ...content.sections.map(s => s.content)
    ].join(' ');

    content.word_count = fullText.split(/\s+/).filter(word => word.length > 0).length;
    content.keyword_density = this.calculateKeywordDensity(fullText, keyword);

    return content;
  }

  calculateKeywordDensity(text, keyword) {
    if (!text || !keyword) return 0;

    const words = text.toLowerCase().split(/\s+/);
    const keywordLower = keyword.toLowerCase();
    const keywordCount = words.filter(word => word.includes(keywordLower)).length;

    return Math.round((keywordCount / words.length) * 10000) / 100; // Percentage with 2 decimals
  }
}

module.exports = new SEOWriterAgent();
