const Groq = require('groq-sdk');
const nodemailer = require('nodemailer');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class EmailComposerAgent {
  async run(input) {
    try {
      // Handle both generic prompt format and specific agent format
      const { prompt, purpose, tone = 'professional' } = input;
      const emailPurpose = purpose || prompt;

      if (!emailPurpose) {
        throw new Error('Email purpose is required');
      }

      const promptText = `Generate a professional email based on the following request. Make it ${tone} in tone.

Purpose: ${emailPurpose}

Please provide:
1. Subject line
2. Email body (6 sentences maximum)
3. Appropriate greeting and closing

Format the response clearly with sections.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.5,
        max_tokens: 800,
      });

      const result = completion.choices[0]?.message?.content;

      if (!result) {
        throw new Error('No response from AI model');
      }

      // Parse the response to extract subject and body
      const lines = result.split('\n');
      let subject = '';
      let body = '';

      let inBody = false;
      for (const line of lines) {
        if (line.toLowerCase().includes('subject')) {
          subject = line.replace(/^(subject:?\s*)/i, '').trim();
        } else if (line.toLowerCase().includes('body') || line.toLowerCase().includes('email body')) {
          inBody = true;
        } else if (inBody && line.trim()) {
          body += line + '\n';
        }
      }

      // If parsing failed, use the whole response as body
      if (!subject) {
        subject = this.extractSubjectFromPurpose(purpose);
      }
      if (!body.trim()) {
        body = result;
      }

      return {
        success: true,
        email: {
          subject: subject,
          body: body.trim(),
          tone: tone,
          purpose: purpose
        },
        canSend: this.canSendEmail(),
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Email Composer Error:', error);
      return {
        success: false,
        error: error.message,
        email: null
      };
    }
  }

  extractSubjectFromPurpose(purpose) {
    // Simple fallback subject extraction
    const words = purpose.split(' ').slice(0, 5).join(' ');
    return `Regarding: ${words}${purpose.length > 30 ? '...' : ''}`;
  }

  canSendEmail() {
    // Check if SMTP credentials are configured
    return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  }

  async sendEmail(emailData, recipient) {
    try {
      if (!this.canSendEmail()) {
        throw new Error('SMTP not configured');
      }

      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: recipient,
        subject: emailData.subject,
        text: emailData.body
      };

      const result = await transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId,
        sent: true
      };

    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error.message,
        sent: false
      };
    }
  }
}

module.exports = new EmailComposerAgent();
