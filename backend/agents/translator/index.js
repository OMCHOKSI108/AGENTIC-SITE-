const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class TranslatorAgent {
  async run(input) {
    try {
      const { text, target_language, source_language = 'auto', preserve_formatting = true } = input;

      if (!text) {
        throw new Error('Text to translate is required');
      }

      if (!target_language) {
        throw new Error('Target language is required');
      }

      // Perform translation
      const translation = await this.translateText(text, target_language, source_language, preserve_formatting);

      return {
        success: true,
        translation: translation,
        source_text: text,
        source_language: source_language === 'auto' ? translation.detected_language : source_language,
        target_language: target_language,
        preserve_formatting: preserve_formatting,
        translated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Translator Error:', error);
      return {
        success: false,
        error: error.message,
        translation: null
      };
    }
  }

  async translateText(text, targetLang, sourceLang, preserveFormatting) {
    try {
      const prompt = `Translate the following text to ${targetLang}.

${preserveFormatting ? 'PRESERVE FORMATTING: Keep the structure, line breaks, bullet points, and formatting intact.' : ''}

SOURCE LANGUAGE: ${sourceLang}
TARGET LANGUAGE: ${targetLang}

TEXT TO TRANSLATE:
"${text}"

Please provide:
1. The translated text in ${targetLang}
2. Detected source language (if source was 'auto')
3. Translation confidence level
4. Any cultural notes or context that might affect the translation
5. Alternative translations if the text is ambiguous

Ensure the translation is:
- Natural and fluent in ${targetLang}
- Culturally appropriate
- Maintains the original meaning and tone
- Professional quality

If the source language cannot be determined, assume it's English.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.1,
        max_tokens: 1200,
      });

      const result = completion.choices[0]?.message?.content;

      if (!result) {
        throw new Error('No response from AI model');
      }

      // Parse the translation response
      const parsedTranslation = this.parseTranslation(result, targetLang);

      return parsedTranslation;

    } catch (error) {
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  parseTranslation(response, targetLang) {
    const translation = {
      translated_text: '',
      detected_language: 'en',
      confidence: 'high',
      cultural_notes: [],
      alternatives: []
    };

    const lines = response.split('\n');
    let currentSection = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.toLowerCase().includes('translated text') || line.toLowerCase().includes('translation')) {
        currentSection = 'translated_text';
      } else if (line.toLowerCase().includes('detected') && line.toLowerCase().includes('language')) {
        currentSection = 'detected_language';
        const langMatch = line.match(/detected.*language.*:\s*(\w+)/i);
        if (langMatch) {
          translation.detected_language = langMatch[1].toLowerCase();
        }
      } else if (line.toLowerCase().includes('confidence')) {
        currentSection = 'confidence';
        const confidenceMatch = line.match(/confidence.*:\s*(high|medium|low)/i);
        if (confidenceMatch) {
          translation.confidence = confidenceMatch[1].toLowerCase();
        }
      } else if (line.toLowerCase().includes('cultural') || line.toLowerCase().includes('context')) {
        currentSection = 'cultural_notes';
      } else if (line.toLowerCase().includes('alternative')) {
        currentSection = 'alternatives';
      } else if (currentSection && line.trim()) {
        if (currentSection === 'translated_text') {
          // Look for the actual translated text (usually in quotes or as a block)
          if (line.startsWith('"') && line.endsWith('"') && line.length > 10) {
            translation.translated_text = line.slice(1, -1);
          } else if (!line.includes(':') && line.length > 10 && !line.toLowerCase().includes('text')) {
            translation.translated_text = line;
          }
        } else if (currentSection === 'cultural_notes') {
          if (line.match(/^[-•*]\s/) || line.match(/^\d+\./)) {
            translation.cultural_notes.push(line.replace(/^[-•*\d+.]+\s*/, '').trim());
          }
        } else if (currentSection === 'alternatives') {
          if (line.match(/^[-•*]\s/) || line.match(/^\d+\./)) {
            translation.alternatives.push(line.replace(/^[-•*\d+.]+\s*/, '').trim());
          }
        }
      }
    }

    // Fallback if translation text wasn't found
    if (!translation.translated_text) {
      // Try to find a substantial paragraph that looks like translated text
      const paragraphs = response.split('\n\n');
      for (const para of paragraphs) {
        if (para.trim().length > 20 && !para.toLowerCase().includes('translate') &&
            !para.toLowerCase().includes('language') && !para.toLowerCase().includes('confidence')) {
          translation.translated_text = para.trim();
          break;
        }
      }

      // Last resort
      if (!translation.translated_text) {
        translation.translated_text = response.split('\n')[0] || `Translation to ${targetLang}`;
      }
    }

    return translation;
  }

  // Helper method to get supported languages
  getSupportedLanguages() {
    return [
      'english', 'spanish', 'french', 'german', 'italian', 'portuguese',
      'russian', 'chinese', 'japanese', 'korean', 'arabic', 'hindi',
      'dutch', 'swedish', 'danish', 'norwegian', 'finnish', 'polish',
      'turkish', 'greek', 'hebrew', 'thai', 'vietnamese', 'indonesian'
    ];
  }
}

module.exports = new TranslatorAgent();
