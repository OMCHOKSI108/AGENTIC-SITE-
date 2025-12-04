const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class ImageDesignerAgent {
  async run(input) {
    try {
      const { prompt, reference_image } = input;

      if (!prompt) {
        throw new Error('Image prompt is required');
      }

      // Generate image description and parameters
      const imageSpec = await this.generateImageSpec(prompt, reference_image);

      // In a real implementation, this would call an image generation API
      // For now, we'll return the specification and mock URLs
      const mockResult = await this.simulateImageGeneration(imageSpec);

      return {
        success: true,
        image_spec: imageSpec,
        result: mockResult,
        prompt: prompt,
        has_reference: !!reference_image,
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Image Designer Error:', error);
      return {
        success: false,
        error: error.message,
        image_spec: null,
        result: null
      };
    }
  }

  async generateImageSpec(prompt, referenceImage) {
    try {
      let enhancementPrompt = `Enhance this image generation prompt to be more detailed and effective: "${prompt}"

Provide:
1. Enhanced prompt for AI image generation
2. Style recommendations (realistic, artistic, cartoon, etc.)
3. Composition suggestions
4. Color palette recommendations
5. Technical specifications (resolution, aspect ratio)`;

      if (referenceImage) {
        enhancementPrompt += `\n\nReference image context: The user has provided a reference image, so consider this as an editing/improvement task rather than pure generation.`;
      }

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: enhancementPrompt
          }
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.6,
        max_tokens: 800,
      });

      const result = completion.choices[0]?.message?.content;

      if (!result) {
        throw new Error('No response from AI model');
      }

      // Parse the specification
      const spec = this.parseImageSpec(result);

      return spec;

    } catch (error) {
      throw new Error(`Image specification generation failed: ${error.message}`);
    }
  }

  parseImageSpec(response) {
    const spec = {
      enhanced_prompt: '',
      style: '',
      composition: '',
      colors: '',
      technical: {
        resolution: '1024x1024',
        aspect_ratio: '1:1',
        format: 'PNG'
      }
    };

    const lines = response.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const lowerLine = line.toLowerCase().trim();

      if (lowerLine.includes('enhanced prompt') || lowerLine.includes('prompt')) {
        currentSection = 'enhanced_prompt';
      } else if (lowerLine.includes('style')) {
        currentSection = 'style';
      } else if (lowerLine.includes('composition')) {
        currentSection = 'composition';
      } else if (lowerLine.includes('color')) {
        currentSection = 'colors';
      } else if (lowerLine.includes('technical') || lowerLine.includes('resolution')) {
        currentSection = 'technical';
      } else if (line.trim() && currentSection && !line.startsWith('#') && !line.startsWith('```')) {
        if (currentSection === 'technical') {
          if (lowerLine.includes('resolution')) {
            spec.technical.resolution = line.replace(/.*resolution:?\s*/i, '').trim();
          } else if (lowerLine.includes('aspect')) {
            spec.technical.aspect_ratio = line.replace(/.*aspect:?\s*/i, '').trim();
          }
        } else {
          spec[currentSection] += line.trim() + ' ';
        }
      }
    }

    // Clean up text fields
    Object.keys(spec).forEach(key => {
      if (typeof spec[key] === 'string') {
        spec[key] = spec[key].trim();
      }
    });

    return spec;
  }

  async simulateImageGeneration(spec) {
    // This simulates what a real image generation API would return
    // In production, this would call DALL-E, Midjourney, Stable Diffusion, etc.

    const mockImages = [
      {
        url: `https://picsum.photos/1024/1024?random=${Date.now()}`,
        thumbnail: `https://picsum.photos/256/256?random=${Date.now()}`,
        alt: spec.enhanced_prompt.substring(0, 100) + '...',
        size: '1024x1024',
        format: 'PNG'
      }
    ];

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      images: mockImages,
      processing_time: '2.1 seconds',
      api_used: 'Mock Image Generation API',
      credits_used: 1,
      status: 'completed'
    };
  }
}

module.exports = new ImageDesignerAgent();
