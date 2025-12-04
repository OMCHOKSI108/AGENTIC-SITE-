import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineMail, AiOutlineUser, AiOutlineBulb, AiOutlineSend, AiOutlineFileText } from 'react-icons/ai';
import { FiMail, FiUser, FiSend, FiFileText } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const EmailComposerInterface = ({ agent, onRun }) => {
  const [emailType, setEmailType] = useState('professional');
  const [recipient, setRecipient] = useState('');
  const [context, setContext] = useState('');
  const [tone, setTone] = useState('professional');
  const [urgency, setUrgency] = useState('normal');
  const [includeAttachments, setIncludeAttachments] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const emailTypes = [
    { value: 'professional', label: 'Professional', icon: '💼', description: 'Business emails, formal communication' },
    { value: 'meeting', label: 'Meeting Request', icon: '📅', description: 'Schedule meetings and appointments' },
    { value: 'followup', label: 'Follow-up', icon: '📧', description: 'Follow up on previous conversations' },
    { value: 'thankyou', label: 'Thank You', icon: '🙏', description: 'Express gratitude and appreciation' },
    { value: 'invitation', label: 'Invitation', icon: '🎉', description: 'Event or project invitations' },
    { value: 'proposal', label: 'Proposal', icon: '📄', description: 'Business proposals and offers' },
  ];

  const toneOptions = [
    { value: 'professional', label: 'Professional', color: 'blue' },
    { value: 'friendly', label: 'Friendly', color: 'green' },
    { value: 'formal', label: 'Formal', color: 'purple' },
    { value: 'casual', label: 'Casual', color: 'orange' },
  ];

  const urgencyOptions = [
    { value: 'low', label: 'Low Priority', icon: '🐌' },
    { value: 'normal', label: 'Normal', icon: '🚶' },
    { value: 'high', label: 'High Priority', icon: '⚡' },
    { value: 'urgent', label: 'Urgent', icon: '🚨' },
  ];

  const handleRun = async () => {
    if (!recipient.trim()) {
      setError('Please specify the recipient');
      return;
    }

    if (!context.trim()) {
      setError('Please provide context for the email');
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const response = await onRun({
        email_type: emailType,
        recipient: recipient,
        context: context,
        tone: tone,
        urgency: urgency,
        include_attachments: includeAttachments
      });

      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const formatEmailResult = (result) => {
    if (!result || !result.output) return null;

    const data = result.output;
    if (!data.success) {
      return (
        <div className="text-center text-red-500">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Email Generation Failed</h3>
          <p className="text-[var(--text)]">{data.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Generated Email */}
        <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
          <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
            <AiOutlineMail className="w-5 h-5 text-primary" />
            Generated Email
          </h3>

          {/* Email Header */}
          <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--muted)] mb-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-[var(--text)]">To:</span>
                <span className="text-[var(--muted)]">{data.email.to || recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-[var(--text)]">Subject:</span>
                <span className="text-[var(--muted)]">{data.email.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-[var(--text)]">From:</span>
                <span className="text-[var(--muted)]">{data.email.from || 'Your Name'}</span>
              </div>
            </div>
          </div>

          {/* Email Body */}
          <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--muted)]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-[var(--text)]">Email Content</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(data.email.body);
                }}
              >
                Copy Email
              </Button>
            </div>
            <div className="text-[var(--text)] whitespace-pre-wrap leading-relaxed font-mono text-sm">
              {data.email.body}
            </div>
          </div>
        </div>

        {/* Email Analysis */}
        {data.analysis && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBulb className="w-5 h-5 text-blue-500" />
              Email Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.analysis.tone && (
                <div className="p-3 bg-[var(--bg)] rounded border">
                  <div className="text-sm font-medium text-[var(--text)] mb-1">Detected Tone</div>
                  <div className="text-lg font-bold text-[var(--text)] capitalize">{data.analysis.tone}</div>
                </div>
              )}
              {data.analysis.length && (
                <div className="p-3 bg-[var(--bg)] rounded border">
                  <div className="text-sm font-medium text-[var(--text)] mb-1">Email Length</div>
                  <div className="text-lg font-bold text-[var(--text)]">{data.analysis.length} words</div>
                </div>
              )}
              {data.analysis.reading_time && (
                <div className="p-3 bg-[var(--bg)] rounded border">
                  <div className="text-sm font-medium text-[var(--text)] mb-1">Reading Time</div>
                  <div className="text-lg font-bold text-[var(--text)]">{data.analysis.reading_time} min</div>
                </div>
              )}
              {data.analysis.professionalism_score && (
                <div className="p-3 bg-[var(--bg)] rounded border">
                  <div className="text-sm font-medium text-[var(--text)] mb-1">Professionalism</div>
                  <div className="text-lg font-bold text-[var(--text)]">{data.analysis.professionalism_score}/10</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Key Points */}
        {data.key_points && data.key_points.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBulb className="w-5 h-5 text-green-500" />
              Key Points Covered ({data.key_points.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.key_points.map((point, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-[var(--bg)] rounded border border-[var(--muted)]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <p className="text-[var(--text)] text-sm">{point}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {data.suggestions && data.suggestions.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBulb className="w-5 h-5 text-orange-500" />
              Suggestions ({data.suggestions.length})
            </h3>
            <div className="space-y-3">
              {data.suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AiOutlineBulb className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-[var(--text)] mb-1">{suggestion.title}</h4>
                    <p className="text-sm text-[var(--text)]">{suggestion.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Attachments */}
        {data.attachments && data.attachments.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineFileText className="w-5 h-5 text-purple-500" />
              Suggested Attachments ({data.attachments.length})
            </h3>
            <div className="space-y-2">
              {data.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded border border-[var(--muted)]">
                  <AiOutlineFileText className="w-4 h-4 text-purple-500" />
                  <div className="flex-1">
                    <div className="font-medium text-[var(--text)] text-sm">{attachment.name}</div>
                    <div className="text-xs text-[var(--muted)]">{attachment.type} • {attachment.size}</div>
                  </div>
                  <div className="text-xs text-[var(--muted)]">{attachment.purpose}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Follow-up Reminder */}
        {data.follow_up && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineSend className="w-5 h-5 text-indigo-500" />
              Follow-up Recommendation
            </h3>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
              <p className="text-[var(--text)] mb-2">{data.follow_up.message}</p>
              {data.follow_up.when && (
                <p className="text-sm text-indigo-600 dark:text-indigo-400">
                  Suggested follow-up: {data.follow_up.when}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Input Panel */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <AiOutlineMail className="w-7 h-7 text-blue-500" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Generate professional emails with AI-powered writing assistance
          </p>
        </div>

        {/* Email Type Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-[var(--text)]">
            Email Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {emailTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setEmailType(type.value)}
                className={`p-4 border rounded-lg text-left transition-all ${
                  emailType === type.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-[var(--muted)] bg-[var(--surface)] text-[var(--text)] hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{type.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs opacity-70 mt-1">{type.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recipient */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Recipient
          </label>
          <div className="relative">
            <AiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted)] w-5 h-5" />
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g., Om Smith, CEO of TechCorp"
              className="w-full pl-10 pr-4 py-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Context */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Context & Details
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Describe what the email should be about, key points to include, any specific requirements..."
            className="w-full h-32 p-4 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex justify-between text-xs text-[var(--muted)]">
            <span>{context.split(/\s+/).filter(word => word.length > 0).length} words</span>
            <span>{context.length} characters</span>
          </div>
        </div>

        {/* Email Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tone */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {toneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              Urgency Level
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {urgencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--text)]">Suggest Attachments</label>
            <button
              onClick={() => setIncludeAttachments(!includeAttachments)}
              className={`w-12 h-6 rounded-full transition-colors ${
                includeAttachments ? 'bg-blue-500' : 'bg-[var(--muted)]'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  includeAttachments ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Run Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={handleRun}
            loading={running}
            disabled={!recipient.trim() || !context.trim() || running}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {running ? (
              <div className="flex items-center gap-3">
                <AiOutlineMail className="w-5 h-5 animate-spin" />
                <span>Generating email...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <AiOutlineMail className="w-5 h-5" />
                <span>Generate Email</span>
              </div>
            )}
          </Button>
        </motion.div>
      </motion.div>

      {/* Output Panel */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--text)] flex items-center gap-3">
            <AiOutlineMail className="w-7 h-7 text-blue-500" />
            Generated Email
          </h2>
          {result && result.output?.success && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const emailData = result.output.email;
                  const emailString = `To: ${emailData.to}\nSubject: ${emailData.subject}\n\n${emailData.body}`;
                  const dataBlob = new Blob([emailString], { type: 'text/plain' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'generated-email.txt';
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export Email
              </Button>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] rounded-xl p-6 min-h-96 border border-blue-500/10 shadow-lg overflow-y-auto">
          {running ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <AiOutlineMail className="w-16 h-16 text-blue-500" />
              </motion.div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[var(--text)] mb-2">
                  Crafting your email...
                </div>
                <div className="flex justify-center gap-1 mb-4">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                  />
                </div>
                <p className="text-sm text-[var(--muted)] text-center">
                  AI is generating professional email content tailored to your needs
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Email Generation Failed</h3>
              <p className="text-[var(--text)] mb-4">{error}</p>
              <Button onClick={handleRun} variant="outline">
                Try Again
              </Button>
            </div>
          ) : result ? (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                  <AiOutlineMail className="w-4 h-4" />
                  <span className="font-semibold">Email Generated Successfully</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Professional email crafted with appropriate tone and structure
                </p>
              </div>
              {formatEmailResult(result)}
            </motion.div>
          ) : (
            <div className="text-center text-[var(--muted)] flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <AiOutlineMail className="w-20 h-20 text-blue-500/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                Ready for Email Generation
              </h3>
              <p className="text-lg mb-4 max-w-sm">
                Describe your email needs and get professionally crafted messages with the perfect tone and structure
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  📧 Professional Writing
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  🎯 Tone Matching
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  📋 Structured Format
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  💡 Smart Suggestions
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EmailComposerInterface;