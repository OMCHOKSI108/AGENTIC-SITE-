const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class SocialMediaManagerAgent {
  async run(input) {
    try {
      const { content_topic, platform, target_audience, tone, post_count = 5 } = input;

      if (!content_topic) {
        throw new Error('Content topic is required');
      }

      if (!platform) {
        throw new Error('Social media platform is required');
      }

      if (!target_audience) {
        throw new Error('Target audience is required');
      }

      // Generate social media content
      const content = await this.generateSocialContent(content_topic, platform, target_audience, tone, post_count);

      return {
        success: true,
        content: content,
        platform: platform,
        target_audience: target_audience,
        tone: tone || 'professional',
        post_count: post_count,
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Social Media Manager Error:', error);
      return {
        success: false,
        error: error.message,
        content: null
      };
    }
  }

  async generateSocialContent(topic, platform, audience, tone, count) {
    try {
      const prompt = `Create ${count} engaging social media posts for ${platform} about "${topic}" targeted at ${audience}.

Platform: ${platform}
Topic: ${topic}
Audience: ${audience}
Tone: ${tone || 'professional'}
Number of posts: ${count}

For each post, provide:
1. Post text (optimized for the platform's character limits and style)
2. Hashtags (3-5 relevant hashtags)
3. Best posting time suggestion
4. Engagement strategy (what to ask for comments/likes/shares)
5. Visual content suggestion (if applicable)

Platform-specific guidelines:
- Twitter/X: Keep under 280 characters, use threads for longer content
- LinkedIn: Professional, industry-focused, networking-oriented
- Facebook: Community-building, conversational, visual-focused
- Instagram: Visual-first, storytelling, emoji-rich
- TikTok: Trendy, short-form, viral potential

Make the content engaging, authentic, and optimized for each platform's algorithm.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.7,
        max_tokens: 1500,
      });

      const result = completion.choices[0]?.message?.content;

      if (!result) {
        throw new Error('No response from AI model');
      }

      // Parse the generated content
      const posts = this.parseSocialContent(result, platform, count);

      return posts;

    } catch (error) {
      throw new Error(`Social content generation failed: ${error.message}`);
    }
  }

  parseSocialContent(response, platform, expectedCount) {
    const posts = [];
    const lines = response.split('\n');
    let currentPost = null;
    let postIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for new post indicators
      if (line.match(/^Post\s*\d+:/i) || line.match(/^\d+\./) || line.match(/^Post\s+\d+/i)) {
        if (currentPost) {
          posts.push(currentPost);
        }
        currentPost = {
          id: postIndex + 1,
          text: '',
          hashtags: [],
          best_time: '',
          engagement_strategy: '',
          visual_suggestion: '',
          platform: platform
        };
        postIndex++;
      } else if (currentPost && line) {
        const lowerLine = line.toLowerCase();

        if (lowerLine.includes('hashtags') || lowerLine.includes('#')) {
          const hashtagMatch = line.match(/#[\w]+/g);
          if (hashtagMatch) {
            currentPost.hashtags = hashtagMatch;
          }
        } else if (lowerLine.includes('best time') || lowerLine.includes('posting time')) {
          currentPost.best_time = line.replace(/^(best time|posting time)[:\s]*/i, '').trim();
        } else if (lowerLine.includes('engagement') || lowerLine.includes('strategy')) {
          currentPost.engagement_strategy = line.replace(/^(engagement strategy)[:\s]*/i, '').trim();
        } else if (lowerLine.includes('visual') || lowerLine.includes('image')) {
          currentPost.visual_suggestion = line.replace(/^(visual suggestion|image suggestion)[:\s]*/i, '').trim();
        } else if (!line.startsWith('#') && !line.startsWith('```') && line.length > 10) {
          // Likely the main post text
          if (currentPost.text) {
            currentPost.text += ' ' + line;
          } else {
            currentPost.text = line;
          }
        }
      }
    }

    // Add the last post
    if (currentPost) {
      posts.push(currentPost);
    }

    // Ensure we have the expected number of posts
    while (posts.length < expectedCount) {
      posts.push({
        id: posts.length + 1,
        text: `Sample post ${posts.length + 1} about the topic`,
        hashtags: ['#sample', '#content'],
        best_time: '9 AM',
        engagement_strategy: 'Ask for opinions in comments',
        visual_suggestion: 'Relevant image or graphic',
        platform: platform
      });
    }

    return posts.slice(0, expectedCount);
  }
}

module.exports = new SocialMediaManagerAgent();
