import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineUser, AiOutlineMessage, AiOutlineCalendar, AiOutlineMail, AiOutlinePhone, AiOutlineSearch, AiOutlineRobot } from 'react-icons/ai';
import { FiMessageSquare, FiCalendar, FiMail, FiPhone, FiSearch, FiSettings, FiHelpCircle } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const PersonalAssistantInterface = ({ agent, onRun }) => {
  const [query, setQuery] = useState('');
  const [assistantType, setAssistantType] = useState('general');
  const [context, setContext] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [includeHistory, setIncludeHistory] = useState(true);
  const [responseFormat, setResponseFormat] = useState('detailed');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const assistantTypes = [
    { value: 'general', label: 'General Assistant', icon: '🤖', description: 'Help with any task or question', color: 'bg-blue-500' },
    { value: 'productivity', label: 'Productivity Coach', icon: '⚡', description: 'Time management and task optimization', color: 'bg-green-500' },
    { value: 'communication', label: 'Communication Helper', icon: '💬', description: 'Email, messaging, and social media', color: 'bg-purple-500' },
    { value: 'learning', label: 'Learning Assistant', icon: '📚', description: 'Research, explanations, and skill building', color: 'bg-orange-500' },
    { value: 'creative', label: 'Creative Assistant', icon: '🎨', description: 'Brainstorming and creative tasks', color: 'bg-pink-500' },
    { value: 'personal', label: 'Personal Organizer', icon: '📅', description: 'Scheduling and personal management', color: 'bg-indigo-500' },
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low Priority', icon: '🐌', description: 'Take your time' },
    { value: 'normal', label: 'Normal Priority', icon: '🚶', description: 'Standard response time' },
    { value: 'high', label: 'High Priority', icon: '🏃', description: 'Quick response needed' },
    { value: 'urgent', label: 'Urgent', icon: '🚨', description: 'Immediate attention required' },
  ];

  const responseFormats = [
    { value: 'brief', label: 'Brief', icon: '📝', description: 'Concise summary' },
    { value: 'detailed', label: 'Detailed', icon: '📄', description: 'Comprehensive response' },
    { value: 'step_by_step', label: 'Step-by-Step', icon: '📋', description: 'Actionable instructions' },
    { value: 'bullet_points', label: 'Bullet Points', icon: '•', description: 'Structured list format' },
  ];

  const handleRun = async () => {
    if (!query.trim()) {
      setError('Please enter a query or request');
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const response = await onRun({
        query,
        assistant_type: assistantType,
        context: context.trim(),
        urgency,
        include_history: includeHistory,
        response_format: responseFormat,
      });

      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const formatAssistantResult = (result) => {
    if (!result || !result.output) return null;

    const data = result.output;
    if (!data.success) {
      return (
        <div className="text-center text-red-500">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Assistant Request Failed</h3>
          <p className="text-[var(--text)]">{data.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Main Response */}
        {data.response && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineMessage className="w-5 h-5 text-blue-500" />
              Assistant Response
            </h3>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="text-[var(--text)] leading-relaxed whitespace-pre-wrap">
                {data.response}
              </div>
            </div>
            {data.confidence && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-[var(--muted)]">Confidence:</span>
                <div className="flex-1 bg-[var(--bg)] rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${data.confidence}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-[var(--text)]">{data.confidence}%</span>
              </div>
            )}
          </div>
        )}

        {/* Action Items */}
        {data.action_items && data.action_items.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineCalendar className="w-5 h-5 text-green-500" />
              Action Items ({data.action_items.length})
            </h3>
            <div className="space-y-3">
              {data.action_items.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-green-700 dark:text-green-300 mb-1">{item.title}</h4>
                    <p className="text-sm text-green-600 dark:text-green-400 mb-2">{item.description}</p>
                    <div className="flex items-center gap-4 text-xs text-green-500 dark:text-green-400">
                      {item.priority && <span>Priority: {item.priority}</span>}
                      {item.deadline && <span>Deadline: {item.deadline}</span>}
                      {item.estimated_time && <span>Est. Time: {item.estimated_time}</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Follow-up Questions */}
        {data.follow_up_questions && data.follow_up_questions.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineUser className="w-5 h-5 text-purple-500" />
              Follow-up Questions ({data.follow_up_questions.length})
            </h3>
            <div className="space-y-2">
              {data.follow_up_questions.map((question, index) => (
                <motion.button
                  key={index}
                  onClick={() => setQuery(question)}
                  className="w-full text-left p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600 dark:text-purple-400">💭</span>
                    <span className="text-[var(--text)]">{question}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        {data.resources && data.resources.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineSearch className="w-5 h-5 text-orange-500" />
              Recommended Resources ({data.resources.length})
            </h3>
            <div className="space-y-3">
              {data.resources.map((resource, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                      {resource.type === 'article' ? '📄' :
                       resource.type === 'video' ? '🎥' :
                       resource.type === 'tool' ? '🛠️' :
                       resource.type === 'course' ? '🎓' : '📚'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-orange-700 dark:text-orange-300 mb-1">{resource.title}</h4>
                      <p className="text-sm text-orange-600 dark:text-orange-400 mb-2">{resource.description}</p>
                      <div className="flex items-center gap-4 text-xs text-orange-500 dark:text-orange-400">
                        <span>Type: {resource.type}</span>
                        {resource.duration && <span>Duration: {resource.duration}</span>}
                        {resource.difficulty && <span>Level: {resource.difficulty}</span>}
                      </div>
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-sm text-orange-600 dark:text-orange-400 hover:underline"
                        >
                          View Resource →
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Communication Drafts */}
        {data.communication_drafts && data.communication_drafts.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineMail className="w-5 h-5 text-indigo-500" />
              Communication Drafts ({data.communication_drafts.length})
            </h3>
            <div className="space-y-4">
              {data.communication_drafts.map((draft, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                        draft.type === 'email' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                        draft.type === 'message' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                      }`}>
                        {draft.type.toUpperCase()}
                      </span>
                      <span className="font-medium text-indigo-700 dark:text-indigo-300">{draft.recipient}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(draft.content);
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-2">
                    <strong>Subject:</strong> {draft.subject}
                  </div>
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded text-sm text-indigo-700 dark:text-indigo-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {draft.content}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Suggestions */}
        {data.schedule_suggestions && data.schedule_suggestions.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineCalendar className="w-5 h-5 text-teal-500" />
              Schedule Suggestions ({data.schedule_suggestions.length})
            </h3>
            <div className="space-y-3">
              {data.schedule_suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                      📅
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-teal-700 dark:text-teal-300 mb-1">{suggestion.title}</h4>
                      <p className="text-sm text-teal-600 dark:text-teal-400 mb-2">{suggestion.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-xs text-teal-500 dark:text-teal-400">
                        <div>
                          <strong>Date:</strong> {suggestion.date}
                        </div>
                        <div>
                          <strong>Time:</strong> {suggestion.time}
                        </div>
                        {suggestion.duration && (
                          <div>
                            <strong>Duration:</strong> {suggestion.duration}
                          </div>
                        )}
                        {suggestion.location && (
                          <div>
                            <strong>Location:</strong> {suggestion.location}
                          </div>
                        )}
                      </div>
                      {suggestion.participants && suggestion.participants.length > 0 && (
                        <div className="mt-2">
                          <strong className="text-xs text-teal-500 dark:text-teal-400">Participants:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {suggestion.participants.map((participant, pIndex) => (
                              <span key={pIndex} className="px-2 py-1 bg-teal-200 dark:bg-teal-800 text-teal-700 dark:text-teal-300 rounded-full text-xs">
                                {participant}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Learning Path */}
        {data.learning_path && data.learning_path.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineRobot className="w-5 h-5 text-pink-500" />
              Learning Path ({data.learning_path.length})
            </h3>
            <div className="space-y-3">
              {data.learning_path.map((step, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-pink-700 dark:text-pink-300 mb-1">{step.title}</h4>
                    <p className="text-sm text-pink-600 dark:text-pink-400 mb-2">{step.description}</p>
                    <div className="flex items-center gap-4 text-xs text-pink-500 dark:text-pink-400">
                      <span>Type: {step.type}</span>
                      {step.estimated_time && <span>Time: {step.estimated_time}</span>}
                      {step.difficulty && <span>Difficulty: {step.difficulty}</span>}
                    </div>
                    {step.resources && step.resources.length > 0 && (
                      <div className="mt-2">
                        <strong className="text-xs text-pink-500 dark:text-pink-400">Resources:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {step.resources.map((resource, rIndex) => (
                            <span key={rIndex} className="px-2 py-1 bg-pink-200 dark:bg-pink-800 text-pink-700 dark:text-pink-300 rounded text-xs">
                              {resource}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        {data.metadata && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineUser className="w-5 h-5 text-gray-500" />
              Response Metadata
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.metadata).map(([key, value]) => (
                <div key={key} className="text-center p-3 bg-[var(--bg)] rounded border">
                  <div className="text-lg font-bold text-[var(--text)] mb-1">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </div>
                  <div className="text-sm text-[var(--muted)] capitalize">
                    {key.replace('_', ' ')}
                  </div>
                </div>
              ))}
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
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <AiOutlineUser className="w-7 h-7 text-indigo-500" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Your intelligent personal assistant for tasks, communication, productivity, and more
          </p>
        </div>

        {/* Query Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            What can I help you with? *
          </label>
          <div className="relative">
            <AiOutlineMessage className="absolute left-3 top-3 text-[var(--muted)] w-5 h-5" />
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything - schedule meetings, draft emails, research topics, plan projects..."
              rows={4}
              className="w-full pl-10 pr-4 py-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>
          <p className="text-xs text-[var(--muted)]">
            Be specific about what you need help with for the best results
          </p>
        </div>

        {/* Assistant Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Assistant Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            {assistantTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setAssistantType(type.value)}
                className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                  assistantType === type.value
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                    : 'border-[var(--muted)] bg-[var(--surface)] text-[var(--text)] hover:border-indigo-300'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg">{type.icon}</span>
                  <span className="text-center leading-tight">{type.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Context */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Additional Context
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Any additional information, constraints, or preferences..."
            rows={2}
            className="w-full p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Urgency Level */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Priority Level
          </label>
          <div className="grid grid-cols-2 gap-2">
            {urgencyLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setUrgency(level.value)}
                className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                  urgency === level.value
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                    : 'border-[var(--muted)] bg-[var(--surface)] text-[var(--text)] hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{level.icon}</span>
                  <span>{level.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Response Format */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Response Format
          </label>
          <select
            value={responseFormat}
            onChange={(e) => setResponseFormat(e.target.value)}
            className="w-full p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {responseFormats.map((format) => (
              <option key={format.value} value={format.value}>
                {format.icon} {format.label} - {format.description}
              </option>
            ))}
          </select>
        </div>

        {/* Options */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[var(--text)]">Include Conversation History</label>
          <button
            onClick={() => setIncludeHistory(!includeHistory)}
            className={`w-12 h-6 rounded-full transition-colors ${
              includeHistory ? 'bg-indigo-500' : 'bg-[var(--muted)]'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                includeHistory ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
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
            disabled={!query.trim() || running}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {running ? (
              <div className="flex items-center gap-3">
                <AiOutlineUser className="w-5 h-5 animate-spin" />
                <span>Processing request...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <AiOutlineUser className="w-5 h-5" />
                <span>Ask Assistant</span>
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
            <FiMessageSquare className="w-7 h-7 text-indigo-500" />
            Assistant Response
          </h2>
          {result && result.output?.success && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const dataStr = JSON.stringify(result.output, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'assistant-response.json';
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export Response
              </Button>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] rounded-xl p-6 min-h-96 border border-indigo-500/10 shadow-lg overflow-y-auto">
          {running ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <AiOutlineUser className="w-16 h-16 text-indigo-500" />
              </motion.div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[var(--text)] mb-2">
                  Thinking and processing your request...
                </div>
                <div className="flex justify-center gap-1 mb-4">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-indigo-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-indigo-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-indigo-500 rounded-full"
                  />
                </div>
                <p className="text-sm text-[var(--muted)] text-center">
                  AI assistant is analyzing your request, gathering relevant information, and preparing a comprehensive response
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Assistant Request Failed</h3>
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
                  <AiOutlineUser className="w-4 h-4" />
                  <span className="font-semibold">Assistant Response Ready</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Your personal assistant has processed your request and prepared a comprehensive response
                </p>
              </div>
              {formatAssistantResult(result)}
            </motion.div>
          ) : (
            <div className="text-center text-[var(--muted)] flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <AiOutlineUser className="w-20 h-20 text-indigo-500/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                Ready to Assist
              </h3>
              <p className="text-lg mb-4 max-w-sm">
                Your intelligent personal assistant is here to help with any task - from scheduling and communication to research and productivity
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-sm">
                  🤖 Multi-purpose AI
                </span>
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-sm">
                  📅 Task Management
                </span>
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-sm">
                  💬 Communication
                </span>
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-sm">
                  📚 Learning Support
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PersonalAssistantInterface;