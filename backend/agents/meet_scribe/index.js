const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class MeetingScribeAgent {
  async run(input) {
    try {
      const { audio_file } = input;

      if (!audio_file) {
        throw new Error('Audio file path is required');
      }

      if (!fs.existsSync(audio_file)) {
        throw new Error('Audio file not found');
      }

      // Check file size (limit to reasonable size for demo)
      const stats = fs.statSync(audio_file);
      if (stats.size > 25 * 1024 * 1024) { // 25MB limit
        throw new Error('Audio file too large. Maximum size is 25MB.');
      }

      // For now, simulate transcription (would need actual speech-to-text API)
      // In production, this would use Whisper API or similar
      const transcription = await this.simulateTranscription(audio_file);

      // Analyze the transcription
      const analysis = await this.analyzeMeeting(transcription);

      return {
        success: true,
        transcription: transcription,
        analysis: analysis,
        audio_file: path.basename(audio_file),
        processed_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Meeting Scribe Error:', error);
      return {
        success: false,
        error: error.message,
        transcription: null,
        analysis: null
      };
    }
  }

  async simulateTranscription(audioFile) {
    // This is a simulation - in production, you'd use actual speech-to-text
    // For demo purposes, we'll return a mock transcription
    // Real implementation would use Whisper API, Google Speech-to-Text, etc.

    const fileName = path.basename(audioFile).toLowerCase();

    // Simulate different types of meetings based on filename
    if (fileName.includes('product')) {
      return `Good morning team. Let's discuss the new product launch. Sarah, how is the development coming along? We've got about three weeks until launch. The marketing team has prepared the campaign materials. John mentioned some concerns about the API integration. We need to schedule a follow-up meeting with the engineering team. Action items: Sarah to complete API testing by Friday, John to review marketing materials, and I'll send out the meeting invite for next Tuesday.`;
    } else if (fileName.includes('standup') || fileName.includes('daily')) {
      return `Daily standup meeting. Mike, what did you work on yesterday? I completed the user authentication feature and started on the dashboard. Today I'll finish the dashboard and help with testing. Any blockers? The API documentation is outdated. Sarah, you mentioned working on the payment integration. I ran into an issue with the payment gateway. Let me show you the error. Okay, let's pair on that after this meeting.`;
    } else {
      return `Meeting transcription: Welcome everyone. Today we're discussing the quarterly planning. The Q1 results look good, but we need to focus on customer retention. The support team has identified several pain points. We should prioritize the mobile app improvements. Action items include: creating a task force for mobile development, scheduling customer feedback sessions, and updating the product roadmap by end of week.`;
    }
  }

  async analyzeMeeting(transcription) {
    try {
      const prompt = `Analyze this meeting transcription and provide:
1. A short summary (2-3 sentences)
2. List of exactly 5 action items with owners and deadlines (infer if not specified)
3. Key decisions made
4. Follow-up questions or concerns

Transcription:
${transcription}

Format your response clearly with sections. Be specific and actionable.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.3,
        max_tokens: 1000,
      });

      const result = completion.choices[0]?.message?.content;

      if (!result) {
        throw new Error('No response from AI model');
      }

      // Parse the analysis
      const analysis = this.parseMeetingAnalysis(result);

      return analysis;

    } catch (error) {
      throw new Error(`Meeting analysis failed: ${error.message}`);
    }
  }

  parseMeetingAnalysis(response) {
    const analysis = {
      summary: '',
      action_items: [],
      decisions: [],
      follow_ups: []
    };

    const lines = response.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const lowerLine = line.toLowerCase().trim();

      if (lowerLine.includes('summary')) {
        currentSection = 'summary';
      } else if (lowerLine.includes('action item')) {
        currentSection = 'action_items';
      } else if (lowerLine.includes('decision')) {
        currentSection = 'decisions';
      } else if (lowerLine.includes('follow') || lowerLine.includes('question') || lowerLine.includes('concern')) {
        currentSection = 'follow_ups';
      } else if (line.trim() && currentSection && !line.startsWith('#') && !line.startsWith('```')) {
        if (currentSection === 'summary') {
          analysis.summary += line.trim() + ' ';
        } else {
          // For lists, extract items that look like list items
          if (line.match(/^[-•*]\s/) || line.match(/^\d+\./)) {
            const item = line.replace(/^[-•*\d+.]+\s*/, '').trim();
            if (item.length > 5) { // Filter out very short items
              analysis[currentSection].push(item);
            }
          }
        }
      }
    }

    // Clean up summary
    analysis.summary = analysis.summary.trim();

    // Ensure we have exactly 5 action items (or as many as possible)
    while (analysis.action_items.length < 5 && analysis.action_items.length > 0) {
      analysis.action_items.push('Additional follow-up needed');
    }

    return analysis;
  }
}

module.exports = new MeetingScribeAgent();
