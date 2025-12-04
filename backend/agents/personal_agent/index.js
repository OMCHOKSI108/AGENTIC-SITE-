const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class PersonalAssistantAgent {
  constructor() {
    this.memory = new Map(); // Simple in-memory storage for demo
    this.tasks = [];
    this.reminders = [];
    this.notes = [];
  }

  async run(input) {
    try {
      const { query, user_id = 'default' } = input;

      if (!query) {
        throw new Error('Query is required');
      }

      // Process the personal assistant request
      const response = await this.processQuery(query, user_id);

      return {
        success: true,
        response: response,
        user_id: user_id,
        processed_at: new Date().toISOString(),
        action_taken: response.action || 'query_processed',
        follow_up_needed: response.follow_up || false
      };

    } catch (error) {
      console.error('Personal Assistant Error:', error);
      return {
        success: false,
        error: error.message,
        response: null
      };
    }
  }

  async processQuery(query, userId) {
    try {
      const prompt = `You are a powerful personal assistant AI. Analyze this user query and provide an appropriate response:

USER QUERY: "${query}"

Your capabilities include:
1. Calendar management (schedule meetings, check availability, set reminders)
2. Task management (create, update, prioritize, track tasks)
3. Note-taking and organization
4. Email drafting and management
5. Information retrieval and summarization
6. Workflow automation for personal tasks
7. Time management and productivity advice
8. Contact management
9. Goal setting and tracking
10. Daily planning and scheduling

Analyze the query and determine:
- What action the user wants
- What information you need to respond
- Any follow-up actions required
- How to structure your response

Response format:
- Action: What you're doing (e.g., "scheduling_meeting", "creating_task", "setting_reminder")
- Response: Natural language response to the user
- Data: Any structured data (meeting details, task info, etc.)
- FollowUp: Boolean indicating if user follow-up is needed
- Suggestions: Array of suggested next actions or related tasks

Be proactive, helpful, and thorough in your assistance. If the query is ambiguous, ask clarifying questions.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.3,
        max_tokens: 1500,
      });

      const result = completion.choices[0]?.message?.content;

      if (!result) {
        throw new Error('No response from AI model');
      }

      // Parse and execute the assistant's response
      const parsedResponse = this.parseAssistantResponse(result);

      // Execute any actions based on the response
      await this.executeActions(parsedResponse, userId);

      return parsedResponse;

    } catch (error) {
      throw new Error(`Personal assistant query processing failed: ${error.message}`);
    }
  }

  parseAssistantResponse(response) {
    const parsed = {
      action: 'general_assistance',
      response: '',
      data: {},
      follow_up: false,
      suggestions: []
    };

    const lines = response.split('\n');
    let currentSection = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.toLowerCase().includes('action:')) {
        currentSection = 'action';
        parsed.action = line.replace(/action:\s*/i, '').trim();
      } else if (line.toLowerCase().includes('response:')) {
        currentSection = 'response';
        parsed.response = '';
      } else if (line.toLowerCase().includes('data:')) {
        currentSection = 'data';
        parsed.data = {};
      } else if (line.toLowerCase().includes('followup:')) {
        currentSection = 'followup';
        parsed.follow_up = line.toLowerCase().includes('true') || line.toLowerCase().includes('yes');
      } else if (line.toLowerCase().includes('suggestions:')) {
        currentSection = 'suggestions';
        parsed.suggestions = [];
      } else if (currentSection && line.trim()) {
        if (currentSection === 'response') {
          parsed.response += (parsed.response ? ' ' : '') + line;
        } else if (currentSection === 'data') {
          // Parse key-value pairs
          const colonIndex = line.indexOf(':');
          if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim().toLowerCase().replace(/\s+/g, '_');
            const value = line.substring(colonIndex + 1).trim();
            parsed.data[key] = value;
          }
        } else if (currentSection === 'suggestions') {
          if (line.match(/^[-•*]\s/) || line.match(/^\d+\./)) {
            parsed.suggestions.push(line.replace(/^[-•*\d+.]+\s*/, '').trim());
          }
        }
      }
    }

    // Fallback response if parsing failed
    if (!parsed.response) {
      parsed.response = response;
    }

    return parsed;
  }

  async executeActions(parsedResponse, userId) {
    const { action, data } = parsedResponse;

    switch (action.toLowerCase()) {
      case 'scheduling_meeting':
      case 'schedule_meeting':
        await this.scheduleMeeting(data, userId);
        break;

      case 'creating_task':
      case 'create_task':
        await this.createTask(data, userId);
        break;

      case 'setting_reminder':
      case 'set_reminder':
        await this.setReminder(data, userId);
        break;

      case 'taking_note':
      case 'create_note':
        await this.createNote(data, userId);
        break;

      case 'checking_calendar':
        await this.checkCalendar(data, userId);
        break;

      case 'sending_email':
        await this.draftEmail(data, userId);
        break;

      default:
        // No specific action to execute
        break;
    }
  }

  async scheduleMeeting(data, userId) {
    const meeting = {
      id: Date.now().toString(),
      title: data.title || 'Meeting',
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || '09:00',
      duration: data.duration || '60',
      attendees: data.attendees || [],
      location: data.location || 'TBD',
      description: data.description || '',
      created_at: new Date().toISOString()
    };

    // Store in memory (in real app, this would go to a database)
    if (!this.memory.has(userId)) {
      this.memory.set(userId, { meetings: [], tasks: [], reminders: [], notes: [] });
    }
    this.memory.get(userId).meetings.push(meeting);

    return meeting;
  }

  async createTask(data, userId) {
    const task = {
      id: Date.now().toString(),
      title: data.title || 'Task',
      description: data.description || '',
      priority: data.priority || 'medium',
      due_date: data.due_date || null,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    if (!this.memory.has(userId)) {
      this.memory.set(userId, { meetings: [], tasks: [], reminders: [], notes: [] });
    }
    this.memory.get(userId).tasks.push(task);

    return task;
  }

  async setReminder(data, userId) {
    const reminder = {
      id: Date.now().toString(),
      title: data.title || 'Reminder',
      message: data.message || '',
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || '09:00',
      recurring: data.recurring || false,
      created_at: new Date().toISOString()
    };

    if (!this.memory.has(userId)) {
      this.memory.set(userId, { meetings: [], tasks: [], reminders: [], notes: [] });
    }
    this.memory.get(userId).reminders.push(reminder);

    return reminder;
  }

  async createNote(data, userId) {
    const note = {
      id: Date.now().toString(),
      title: data.title || 'Note',
      content: data.content || '',
      tags: data.tags || [],
      created_at: new Date().toISOString()
    };

    if (!this.memory.has(userId)) {
      this.memory.set(userId, { meetings: [], tasks: [], reminders: [], notes: [] });
    }
    this.memory.get(userId).notes.push(note);

    return note;
  }

  async checkCalendar(data, userId) {
    const userData = this.memory.get(userId);
    if (!userData) return { meetings: [], tasks: [], reminders: [] };

    return {
      meetings: userData.meetings || [],
      tasks: userData.tasks || [],
      reminders: userData.reminders || []
    };
  }

  async draftEmail(data, userId) {
    // In a real implementation, this would integrate with email service
    return {
      to: data.to || '',
      subject: data.subject || '',
      body: data.body || '',
      drafted_at: new Date().toISOString()
    };
  }
}

module.exports = new PersonalAssistantAgent();
