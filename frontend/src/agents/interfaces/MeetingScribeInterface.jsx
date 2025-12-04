import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineAudio, AiOutlineFileText, AiOutlineTeam, AiOutlineClockCircle, AiOutlineBulb, AiOutlineUpload } from 'react-icons/ai';
import { FiMic, FiFileText, FiUsers, FiClock, FiCheckSquare } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const MeetingScribeInterface = ({ agent, onRun }) => {
  const [inputType, setInputType] = useState('audio');
  const [audioFile, setAudioFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [meetingType, setMeetingType] = useState('general');
  const [attendees, setAttendees] = useState('');
  const [generateTasks, setGenerateTasks] = useState(true);
  const [generateSummary, setGenerateSummary] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const meetingTypes = [
    { value: 'general', label: 'General Meeting', icon: '👥', description: 'Regular team meetings and discussions' },
    { value: 'project', label: 'Project Review', icon: '📊', description: 'Project updates and planning' },
    { value: 'client', label: 'Client Meeting', icon: '🤝', description: 'Client calls and presentations' },
    { value: 'interview', label: 'Interview', icon: '🎤', description: 'Job interviews and assessments' },
    { value: 'training', label: 'Training Session', icon: '🎓', description: 'Training and workshops' },
    { value: 'brainstorm', label: 'Brainstorming', icon: '💡', description: 'Creative sessions and ideation' },
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioFile(file);
      setError(null);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && (file.type.startsWith('audio/') || file.name.toLowerCase().match(/\.(mp3|wav|m4a|aac|ogg)$/))) {
      setAudioFile(file);
      setError(null);
    } else {
      setError('Please select a valid audio file (MP3, WAV, M4A, AAC, OGG)');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleRun = async () => {
    let inputData = {};

    if (inputType === 'audio' && !audioFile) {
      setError('Please select an audio file');
      return;
    }

    if (inputType === 'transcript' && !transcript.trim()) {
      setError('Please provide a meeting transcript');
      return;
    }

    setRunning(true);
    setError(null);

    try {
      if (inputType === 'audio') {
        inputData = {
          audio_file: audioFile.path || audioFile.name,
          meeting_type: meetingType,
          attendees: attendees,
          generate_tasks: generateTasks,
          generate_summary: generateSummary
        };
      } else if (inputType === 'transcript') {
        inputData = {
          transcript: transcript,
          meeting_type: meetingType,
          attendees: attendees,
          generate_tasks: generateTasks,
          generate_summary: generateSummary
        };
      }

      const response = await onRun(inputData);
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const formatMeetingResult = (result) => {
    if (!result || !result.output) return null;

    const data = result.output;
    if (!data.success) {
      return (
        <div className="text-center text-red-500">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Processing Failed</h3>
          <p className="text-[var(--text)]">{data.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Meeting Summary */}
        {data.summary && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineFileText className="w-5 h-5 text-primary" />
              Meeting Summary
            </h3>
            <div className="prose prose-lg max-w-none">
              <div className="text-[var(--text)] leading-relaxed whitespace-pre-wrap">
                {data.summary}
              </div>
            </div>
          </div>
        )}

        {/* Key Decisions */}
        {data.key_decisions && data.key_decisions.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBulb className="w-5 h-5 text-green-500" />
              Key Decisions ({data.key_decisions.length})
            </h3>
            <div className="space-y-3">
              {data.key_decisions.map((decision, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <p className="text-[var(--text)] font-medium">{decision.decision}</p>
                    {decision.rationale && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        {decision.rationale}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Action Items */}
        {data.action_items && data.action_items.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineTeam className="w-5 h-5 text-blue-500" />
              Action Items ({data.action_items.length})
            </h3>
            <div className="space-y-3">
              {data.action_items.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-[var(--text)] font-medium">{item.task}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-blue-600 dark:text-blue-400">
                      {item.assignee && (
                        <span className="flex items-center gap-1">
                          <AiOutlineTeam className="w-3 h-3" />
                          {item.assignee}
                        </span>
                      )}
                      {item.deadline && (
                        <span className="flex items-center gap-1">
                          <AiOutlineClockCircle className="w-3 h-3" />
                          {item.deadline}
                        </span>
                      )}
                      {item.priority && (
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {item.priority}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Meeting Transcript */}
        {data.transcript && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineAudio className="w-5 h-5 text-purple-500" />
              Meeting Transcript
            </h3>
            <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--muted)] max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-[var(--text)]">Full Transcript</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(data.transcript);
                  }}
                >
                  Copy Transcript
                </Button>
              </div>
              <div className="text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed">
                {data.transcript}
              </div>
            </div>
          </div>
        )}

        {/* Topics Discussed */}
        {data.topics && data.topics.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBulb className="w-5 h-5 text-orange-500" />
              Topics Discussed ({data.topics.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-sm rounded-full border border-orange-200 dark:border-orange-800"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Attendees */}
        {data.attendees && data.attendees.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineTeam className="w-5 h-5 text-indigo-500" />
              Attendees ({data.attendees.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.attendees.map((attendee, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded border border-[var(--muted)]">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {attendee.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-[var(--text)] text-sm">{attendee.name}</div>
                    {attendee.role && (
                      <div className="text-xs text-[var(--muted)]">{attendee.role}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meeting Duration */}
        {data.duration && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineClockCircle className="w-5 h-5 text-teal-500" />
              Meeting Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-[var(--bg)] rounded border">
                <div className="text-lg font-bold text-[var(--text)]">{data.duration}</div>
                <div className="text-sm text-[var(--muted)]">Duration</div>
              </div>
              <div className="text-center p-3 bg-[var(--bg)] rounded border">
                <div className="text-lg font-bold text-[var(--text)]">{data.word_count || 0}</div>
                <div className="text-sm text-[var(--muted)]">Words</div>
              </div>
              <div className="text-center p-3 bg-[var(--bg)] rounded border">
                <div className="text-lg font-bold text-[var(--text)]">{data.sentiment || 'N/A'}</div>
                <div className="text-sm text-[var(--muted)]">Overall Sentiment</div>
              </div>
            </div>
          </div>
        )}

        {/* Follow-up Questions */}
        {data.follow_up_questions && data.follow_up_questions.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBulb className="w-5 h-5 text-pink-500" />
              Follow-up Questions ({data.follow_up_questions.length})
            </h3>
            <div className="space-y-2">
              {data.follow_up_questions.map((question, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-pink-50 dark:bg-pink-900/20 rounded border border-pink-200 dark:border-pink-800">
                  <span className="text-pink-500 font-bold text-sm">Q{index + 1}.</span>
                  <p className="text-[var(--text)] text-sm">{question}</p>
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
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <AiOutlineAudio className="w-7 h-7 text-purple-500" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Transcribe meetings and generate summaries, action items, and insights
          </p>
        </div>

        {/* Input Type Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-[var(--text)]">
            Input Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'audio', label: 'Audio File', icon: AiOutlineAudio },
              { value: 'transcript', label: 'Text Transcript', icon: AiOutlineFileText },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setInputType(type.value)}
                className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                  inputType === type.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                    : 'border-[var(--muted)] bg-[var(--surface)] text-[var(--text)] hover:border-purple-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <type.icon className="w-5 h-5" />
                  <span>{type.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          {inputType === 'audio' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text)]">
                Audio File
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                  audioFile
                    ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-[var(--muted)] hover:border-purple-500 hover:bg-purple-500/5'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {audioFile ? (
                  <div className="space-y-3">
                    <AiOutlineAudio className="w-12 h-12 text-purple-500 mx-auto" />
                    <div>
                      <p className="text-lg font-semibold text-[var(--text)]">{audioFile.name}</p>
                      <p className="text-sm text-[var(--muted)]">
                        {(audioFile.size / 1024 / 1024).toFixed(2)} MB • Ready for transcription
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AiOutlineAudio className="w-12 h-12 text-[var(--muted)] mx-auto" />
                    <div>
                      <p className="text-lg font-semibold text-[var(--text)]">Drop audio file here</p>
                      <p className="text-sm text-[var(--muted)]">
                        or click to browse • Supports MP3, WAV, M4A, AAC, OGG up to 100MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {inputType === 'transcript' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text)]">
                Meeting Transcript
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste your meeting transcript here..."
                className="w-full h-40 p-4 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-between text-xs text-[var(--muted)]">
                <span>{transcript.split(/\s+/).filter(word => word.length > 0).length} words</span>
                <span>{transcript.length} characters</span>
              </div>
            </div>
          )}
        </div>

        {/* Meeting Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Meeting Type
          </label>
          <select
            value={meetingType}
            onChange={(e) => setMeetingType(e.target.value)}
            className="w-full p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {meetingTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Attendees */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Attendees (Optional)
          </label>
          <input
            type="text"
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
            placeholder="e.g., Om Smith, Sarah Omson, Mike Chen"
            className="w-full p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--text)]">Generate Action Items</label>
            <button
              onClick={() => setGenerateTasks(!generateTasks)}
              className={`w-12 h-6 rounded-full transition-colors ${
                generateTasks ? 'bg-purple-500' : 'bg-[var(--muted)]'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  generateTasks ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--text)]">Generate Summary</label>
            <button
              onClick={() => setGenerateSummary(!generateSummary)}
              className={`w-12 h-6 rounded-full transition-colors ${
                generateSummary ? 'bg-purple-500' : 'bg-[var(--muted)]'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  generateSummary ? 'translate-x-6' : 'translate-x-0.5'
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
            disabled={running || (inputType === 'audio' && !audioFile) || (inputType === 'transcript' && !transcript.trim())}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {running ? (
              <div className="flex items-center gap-3">
                <AiOutlineAudio className="w-5 h-5 animate-spin" />
                <span>Processing meeting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <AiOutlineAudio className="w-5 h-5" />
                <span>Process Meeting</span>
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
            <AiOutlineFileText className="w-7 h-7 text-purple-500" />
            Meeting Analysis
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
                  link.download = 'meeting-analysis.json';
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export JSON
              </Button>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] rounded-xl p-6 min-h-96 border border-purple-500/10 shadow-lg overflow-y-auto">
          {running ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <AiOutlineAudio className="w-16 h-16 text-purple-500" />
              </motion.div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[var(--text)] mb-2">
                  Analyzing meeting...
                </div>
                <div className="flex justify-center gap-1 mb-4">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-purple-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-purple-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-purple-500 rounded-full"
                  />
                </div>
                <p className="text-sm text-[var(--muted)] text-center">
                  AI is transcribing audio and extracting key insights from your meeting
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Processing Failed</h3>
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
                  <AiOutlineAudio className="w-4 h-4" />
                  <span className="font-semibold">Meeting Processed Successfully</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Generated comprehensive analysis with {result.output.action_items?.length || 0} action items and key insights
                </p>
              </div>
              {formatMeetingResult(result)}
            </motion.div>
          ) : (
            <div className="text-center text-[var(--muted)] flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <AiOutlineAudio className="w-20 h-20 text-purple-500/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                Ready for Meeting Analysis
              </h3>
              <p className="text-lg mb-4 max-w-sm">
                Upload audio recordings or paste transcripts to get AI-powered meeting summaries, action items, and insights
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm">
                  🎧 Audio Transcription
                </span>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm">
                  📝 Action Items
                </span>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm">
                  💡 Key Decisions
                </span>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm">
                  👥 Attendee Tracking
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MeetingScribeInterface;