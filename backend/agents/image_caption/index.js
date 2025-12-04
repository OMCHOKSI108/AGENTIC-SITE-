const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class ImageCaptioningAgent {
  async run(input) {
    try {
      const { image_file, caption_style = 'descriptive', max_captions = 1, include_tags = true } = input;

      if (!image_file) {
        throw new Error('Image file path is required');
      }

      // Generate captions for the image
      const captions = await this.generateCaptions(image_file, caption_style, max_captions, include_tags);

      return {
        success: true,
        captions: captions,
        image_file: path.basename(image_file),
        caption_style: caption_style,
        max_captions: max_captions,
        include_tags: include_tags,
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Image Captioning Error:', error);
      return {
        success: false,
        error: error.message,
        captions: null
      };
    }
  }

  async generateCaptions(imagePath, style, maxCaptions, includeTags) {
    try {
      // In a real implementation, this would use vision API like GPT-4 Vision, CLIP, etc.
      // For demo purposes, we'll simulate image analysis using text description

      let imageDescription = '';

      if (fs.existsSync(imagePath)) {
        // For demo, we'll use the filename or create a generic description
        const filename = path.basename(imagePath).toLowerCase();
        imageDescription = this.inferImageFromFilename(filename);
      } else {
        // Assume it's a text description of the image
        imageDescription = imagePath;
      }

      // Generate captions based on the image description
      const captions = await this.createCaptions(imageDescription, style, maxCaptions, includeTags);

      return captions;

    } catch (error) {
      throw new Error(`Caption generation failed: ${error.message}`);
    }
  }

  inferImageFromFilename(filename) {
    // Simple inference based on filename keywords
    const keywords = {
      'cat': 'A cute cat sitting on a windowsill',
      'dog': 'A friendly dog playing in a park',
      'car': 'A red sports car parked on a city street',
      'food': 'A delicious plate of pasta with vegetables',
      'mountain': 'Majestic mountains under a clear blue sky',
      'beach': 'A beautiful beach with waves crashing on the shore',
      'city': 'A bustling city skyline at sunset',
      'flower': 'Colorful flowers in a garden during spring',
      'portrait': 'A person smiling warmly at the camera',
      'landscape': 'A serene landscape with trees and a lake'
    };

    for (const [keyword, description] of Object.entries(keywords)) {
      if (filename.includes(keyword)) {
        return description;
      }
    }

    return 'An interesting image with various visual elements';
  }

  async createCaptions(imageDescription, style, maxCaptions, includeTags) {
    try {
      const prompt = `Generate ${maxCaptions} high-quality caption(s) for this image description.

IMAGE DESCRIPTION: "${imageDescription}"

CAPTION STYLE: ${style}
${includeTags ? 'INCLUDE TAGS: Yes' : 'INCLUDE TAGS: No'}

Style guidelines:
${style === 'descriptive' ? '- Detailed and vivid descriptions of what\'s in the image' :
  style === 'concise' ? '- Short, punchy captions that capture the essence' :
  style === 'humorous' ? '- Fun, witty captions with humor' :
  style === 'poetic' ? '- Artistic, metaphorical language' :
  style === 'technical' ? '- Precise, factual descriptions' :
  '- Natural, engaging captions suitable for social media'}

For each caption, provide:
1. The main caption text
2. ${includeTags ? 'Relevant hashtags (3-5)' : 'Skip hashtags'}
3. Caption length category (short/medium/long)
4. Best use case (social media, blog, etc.)

Ensure captions are:
- Original and creative
- Appropriate for the image content
- Engaging and shareable
- Well-written with proper grammar

Generate exactly ${maxCaptions} caption(s).`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.7,
        max_tokens: 500,
      });

      const result = completion.choices[0]?.message?.content;

      if (!result) {
        throw new Error('No response from AI model');
      }

      // Parse the generated captions
      const parsedCaptions = this.parseCaptions(result, maxCaptions, includeTags);

      return parsedCaptions;

    } catch (error) {
      throw new Error(`Caption creation failed: ${error.message}`);
    }
  }

  parseCaptions(response, maxCaptions, includeTags) {
    const captions = [];
    const lines = response.split('\n');
    let currentCaption = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect new caption
      if (line.match(/^Caption\s*\d+:/i) || line.match(/^\d+\./) ||
          (line.length > 10 && !line.includes(':') && captions.length < maxCaptions)) {

        // Save previous caption
        if (currentCaption && currentCaption.text) {
          captions.push(currentCaption);
        }

        // Start new caption
        currentCaption = {
          id: captions.length + 1,
          text: '',
          hashtags: [],
          length_category: 'medium',
          best_use_case: 'social media'
        };

        // Extract caption text
        let captionText = line.replace(/^Caption\s*\d+:\s*/i, '').replace(/^\d+\.\s*/, '').trim();
        if (captionText) {
          currentCaption.text = captionText;
        }
      } else if (currentCaption) {
        // Parse additional caption details
        const lowerLine = line.toLowerCase();

        if (includeTags && (lowerLine.includes('hashtag') || lowerLine.includes('#'))) {
          const hashtagMatch = line.match(/#[\w]+/g);
          if (hashtagMatch) {
            currentCaption.hashtags = hashtagMatch;
          }
        } else if (lowerLine.includes('length') || lowerLine.includes('category')) {
          const categoryMatch = line.match(/(short|medium|long)/i);
          if (categoryMatch) {
            currentCaption.length_category = categoryMatch[1].toLowerCase();
          }
        } else if (lowerLine.includes('use case') || lowerLine.includes('best for')) {
          currentCaption.best_use_case = line.replace(/^(use case|best for)[:\s]*/i, '').trim();
        } else if (!line.includes(':') && line.length > 5 && !currentCaption.text) {
          // If we haven't set the text yet, this might be it
          currentCaption.text = line;
        }
      }
    }

    // Add the last caption
    if (currentCaption && currentCaption.text) {
      captions.push(currentCaption);
    }

    // Ensure we have the requested number of captions
    while (captions.length < maxCaptions) {
      captions.push({
        id: captions.length + 1,
        text: `A beautiful image that captures a moment worth remembering.`,
        hashtags: includeTags ? ['#photography', '#beautiful', '#moment'] : [],
        length_category: 'medium',
        best_use_case: 'social media'
      });
    }

    return captions.slice(0, maxCaptions);
  }

  // Helper method to get supported caption styles
  getSupportedStyles() {
    return [
      'descriptive',
      'concise',
      'humorous',
      'poetic',
      'technical',
      'marketing',
      'storytelling'
    ];
  }

  // Method to analyze image quality/confidence (for future use)
  analyzeImageQuality(imageData) {
    // Simulate image quality analysis
    return {
      brightness: Math.random() * 100,
      contrast: Math.random() * 100,
      sharpness: Math.random() * 100,
      overall_quality: Math.random() * 100,
      caption_confidence: Math.random() * 0.5 + 0.5
    };
  }
}

module.exports = new ImageCaptioningAgent();
