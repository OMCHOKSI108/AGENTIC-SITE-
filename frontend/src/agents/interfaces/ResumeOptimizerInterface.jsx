import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineFileText, AiOutlineCheckCircle, AiOutlineWarning, AiOutlineBulb, AiOutlineUpload, AiOutlineDownload } from 'react-icons/ai';
import { FiFile, FiUpload, FiTarget, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const ResumeOptimizerInterface = ({ agent, onRun }) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [optimizationFocus, setOptimizationFocus] = useState(['ats', 'keywords', 'content']);
  const [includeCoverLetter, setIncludeCoverLetter] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing',
    'Engineering', 'Sales', 'Human Resources', 'Legal', 'Manufacturing',
    'Retail', 'Consulting', 'Non-profit', 'Government', 'Other'
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-2 years)', icon: '🌱' },
    { value: 'mid', label: 'Mid Level (3-5 years)', icon: '🌿' },
    { value: 'senior', label: 'Senior Level (6-10 years)', icon: '🌳' },
    { value: 'executive', label: 'Executive Level (10+ years)', icon: '👑' },
  ];

  const optimizationOptions = [
    { value: 'ats', label: 'ATS Optimization', icon: '🎯', description: 'Optimize for applicant tracking systems' },
    { value: 'keywords', label: 'Keyword Optimization', icon: '🔍', description: 'Add relevant industry keywords' },
    { value: 'content', label: 'Content Enhancement', icon: '✨', description: 'Improve content quality and impact' },
    { value: 'format', label: 'Format Optimization', icon: '📄', description: 'Improve layout and readability' },
    { value: 'quantify', label: 'Quantify Achievements', icon: '📊', description: 'Add metrics and quantifiable results' },
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, DOC, DOCX, or TXT file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setResumeFile(file);
    setError(null);
  };

  const handleRun = async () => {
    if (!resumeFile) {
      setError('Please upload a resume file');
      return;
    }

    if (!jobDescription.trim() && !targetIndustry) {
      setError('Please provide either a job description or target industry');
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('job_description', jobDescription);
      formData.append('target_industry', targetIndustry);
      formData.append('experience_level', experienceLevel);
      formData.append('optimization_focus', JSON.stringify(optimizationFocus));
      formData.append('include_cover_letter', includeCoverLetter);

      const response = await onRun(formData);
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const formatOptimizationResult = (result) => {
    if (!result || !result.output) return null;

    const data = result.output;
    if (!data.success) {
      return (
        <div className="text-center text-red-500">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Resume Optimization Failed</h3>
          <p className="text-[var(--text)]">{data.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Overall Score */}
        {data.overall_score && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineCheckCircle className="w-5 h-5 text-green-500" />
              Resume Optimization Score
            </h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="var(--muted)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke={data.overall_score >= 80 ? '#10B981' : data.overall_score >= 60 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(data.overall_score / 100) * 314} 314`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--text)]">{data.overall_score}%</div>
                    <div className="text-sm text-[var(--muted)]">Overall</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {data.scores && Object.entries(data.scores).map(([key, value]) => (
                <div key={key} className="p-3 bg-[var(--bg)] rounded border">
                  <div className="text-lg font-bold text-[var(--text)] mb-1">{value}%</div>
                  <div className="text-sm text-[var(--muted)] capitalize">
                    {key.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optimized Resume */}
        {data.optimized_resume && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineFileText className="w-5 h-5 text-blue-500" />
              Optimized Resume
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text)] font-medium">Download Optimized Version</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([data.optimized_resume.content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'optimized_resume.txt';
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <AiOutlineDownload className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
              <div className="p-4 bg-[var(--bg)] rounded border max-h-60 overflow-y-auto">
                <pre className="text-sm text-[var(--text)] whitespace-pre-wrap font-mono">
                  {data.optimized_resume.content}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Keyword Analysis */}
        {data.keyword_analysis && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <FiTarget className="w-5 h-5 text-orange-500" />
              Keyword Analysis
            </h3>
            <div className="space-y-4">
              {data.keyword_analysis.missing_keywords && data.keyword_analysis.missing_keywords.length > 0 && (
                <div>
                  <h4 className="font-medium text-[var(--text)] mb-2 text-red-600 dark:text-red-400">
                    Missing Keywords ({data.keyword_analysis.missing_keywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.keyword_analysis.missing_keywords.map((keyword, index) => (
                      <span key={index} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.keyword_analysis.present_keywords && data.keyword_analysis.present_keywords.length > 0 && (
                <div>
                  <h4 className="font-medium text-[var(--text)] mb-2 text-green-600 dark:text-green-400">
                    Present Keywords ({data.keyword_analysis.present_keywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.keyword_analysis.present_keywords.map((keyword, index) => (
                      <span key={index} className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.keyword_analysis.suggested_keywords && data.keyword_analysis.suggested_keywords.length > 0 && (
                <div>
                  <h4 className="font-medium text-[var(--text)] mb-2 text-blue-600 dark:text-blue-400">
                    Suggested Keywords ({data.keyword_analysis.suggested_keywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.keyword_analysis.suggested_keywords.map((keyword, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Improvements */}
        {data.content_improvements && data.content_improvements.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBulb className="w-5 h-5 text-yellow-500" />
              Content Improvement Suggestions ({data.content_improvements.length})
            </h3>
            <div className="space-y-3">
              {data.content_improvements.map((improvement, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-[var(--text)] mb-1">{improvement.title}</h4>
                      <p className="text-sm text-[var(--text)] mb-2">{improvement.description}</p>
                      {improvement.example && (
                        <div className="text-sm text-[var(--muted)] italic">
                          Example: {improvement.example}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ATS Compatibility */}
        {data.ats_analysis && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineCheckCircle className="w-5 h-5 text-green-500" />
              ATS Compatibility Analysis
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">✅ Passed Checks</h4>
                  <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                    {data.ats_analysis.passed_checks && data.ats_analysis.passed_checks.map((check, index) => (
                      <li key={index}>• {check}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-medium text-red-700 dark:text-red-300 mb-2">❌ Failed Checks</h4>
                  <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                    {data.ats_analysis.failed_checks && data.ats_analysis.failed_checks.map((check, index) => (
                      <li key={index}>• {check}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {data.ats_analysis.recommendations && data.ats_analysis.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium text-[var(--text)] mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {data.ats_analysis.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded border">
                        <FiAlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <span className="text-[var(--text)]">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cover Letter */}
        {data.cover_letter && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineFileText className="w-5 h-5 text-purple-500" />
              Generated Cover Letter
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text)] font-medium">Download Cover Letter</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([data.cover_letter.content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'cover_letter.txt';
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <AiOutlineDownload className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
              <div className="p-4 bg-[var(--bg)] rounded border max-h-60 overflow-y-auto">
                <pre className="text-sm text-[var(--text)] whitespace-pre-wrap">
                  {data.cover_letter.content}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Job Match Analysis */}
        {data.job_match && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-indigo-500" />
              Job Match Analysis
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-[var(--bg)] rounded border">
                  <div className="text-2xl font-bold text-[var(--text)] mb-1">
                    {data.job_match.overall_match}%
                  </div>
                  <div className="text-sm text-[var(--muted)]">Overall Match</div>
                </div>
                <div className="text-center p-3 bg-[var(--bg)] rounded border">
                  <div className="text-2xl font-bold text-[var(--text)] mb-1">
                    {data.job_match.skill_match}%
                  </div>
                  <div className="text-sm text-[var(--muted)]">Skills Match</div>
                </div>
                <div className="text-center p-3 bg-[var(--bg)] rounded border">
                  <div className="text-2xl font-bold text-[var(--text)] mb-1">
                    {data.job_match.experience_match}%
                  </div>
                  <div className="text-sm text-[var(--muted)]">Experience Match</div>
                </div>
                <div className="text-center p-3 bg-[var(--bg)] rounded border">
                  <div className="text-2xl font-bold text-[var(--text)] mb-1">
                    {data.job_match.keyword_match}%
                  </div>
                  <div className="text-sm text-[var(--muted)]">Keywords Match</div>
                </div>
              </div>

              {data.job_match.strengths && data.job_match.strengths.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">Strengths</h4>
                  <ul className="text-sm text-[var(--text)] space-y-1">
                    {data.job_match.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <AiOutlineCheckCircle className="w-4 h-4 text-green-500" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.job_match.gaps && data.job_match.gaps.length > 0 && (
                <div>
                  <h4 className="font-medium text-orange-600 dark:text-orange-400 mb-2">Areas for Improvement</h4>
                  <ul className="text-sm text-[var(--text)] space-y-1">
                    {data.job_match.gaps.map((gap, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <AiOutlineWarning className="w-4 h-4 text-orange-500" />
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
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
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <AiOutlineFileText className="w-7 h-7 text-green-500" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Optimize your resume for ATS systems and improve your job application success rate
          </p>
        </div>

        {/* Resume Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Resume File *
          </label>
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-full p-6 border-2 border-dashed rounded-lg transition-colors ${
                resumeFile
                  ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
                  : 'border-[var(--muted)] hover:border-green-400 bg-[var(--surface)] hover:bg-green-50 dark:hover:bg-green-900/10'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                {resumeFile ? (
                  <>
                    <AiOutlineCheckCircle className="w-8 h-8 text-green-500" />
                    <div className="text-center">
                      <div className="text-lg font-medium text-[var(--text)]">{resumeFile.name}</div>
                      <div className="text-sm text-[var(--muted)]">
                        {(resumeFile.size / 1024).toFixed(1)} KB • {resumeFile.type}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <AiOutlineUpload className="w-8 h-8 text-[var(--muted)]" />
                    <div className="text-center">
                      <span className="text-[var(--text)] font-medium">Click to upload resume</span>
                      <span className="text-sm text-[var(--muted)] block">
                        PDF, DOC, DOCX, or TXT (max 10MB)
                      </span>
                    </div>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Job Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here to optimize your resume for this specific role..."
            rows={4}
            className="w-full p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-[var(--muted)]">
            Optional: Provide the job description for targeted optimization
          </p>
        </div>

        {/* Target Industry */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Target Industry
          </label>
          <select
            value={targetIndustry}
            onChange={(e) => setTargetIndustry(e.target.value)}
            className="w-full p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select industry (optional)</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Experience Level
          </label>
          <div className="grid grid-cols-2 gap-2">
            {experienceLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setExperienceLevel(level.value)}
                className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                  experienceLevel === level.value
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-[var(--muted)] bg-[var(--surface)] text-[var(--text)] hover:border-green-300'
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

        {/* Optimization Focus */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Optimization Focus
          </label>
          <div className="grid grid-cols-1 gap-2">
            {optimizationOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setOptimizationFocus(prev =>
                    prev.includes(option.value)
                      ? prev.filter(f => f !== option.value)
                      : [...prev, option.value]
                  );
                }}
                className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                  optimizationFocus.includes(option.value)
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-[var(--muted)] bg-[var(--surface)] text-[var(--text)] hover:border-green-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{option.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs opacity-70">{option.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cover Letter Option */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[var(--text)]">Generate Cover Letter</label>
          <button
            onClick={() => setIncludeCoverLetter(!includeCoverLetter)}
            className={`w-12 h-6 rounded-full transition-colors ${
              includeCoverLetter ? 'bg-green-500' : 'bg-[var(--muted)]'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                includeCoverLetter ? 'translate-x-6' : 'translate-x-0.5'
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
            disabled={!resumeFile || running}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {running ? (
              <div className="flex items-center gap-3">
                <AiOutlineFileText className="w-5 h-5 animate-spin" />
                <span>Optimizing resume...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <AiOutlineFileText className="w-5 h-5" />
                <span>Optimize Resume</span>
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
            <FiTarget className="w-7 h-7 text-green-500" />
            Optimization Results
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
                  link.href = url;
                  link.download = 'resume-optimization-results.json';
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export Results
              </Button>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] rounded-xl p-6 min-h-96 border border-green-500/10 shadow-lg overflow-y-auto">
          {running ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <AiOutlineFileText className="w-16 h-16 text-green-500" />
              </motion.div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[var(--text)] mb-2">
                  Analyzing and optimizing your resume...
                </div>
                <div className="flex justify-center gap-1 mb-4">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-green-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-green-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-green-500 rounded-full"
                  />
                </div>
                <p className="text-sm text-[var(--muted)] text-center">
                  AI is analyzing your resume, optimizing content, checking ATS compatibility, and generating improvements
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Resume Optimization Failed</h3>
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
                  <AiOutlineCheckCircle className="w-4 h-4" />
                  <span className="font-semibold">Resume Optimization Complete</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Your resume has been analyzed and optimized for better ATS compatibility and job matching
                </p>
              </div>
              {formatOptimizationResult(result)}
            </motion.div>
          ) : (
            <div className="text-center text-[var(--muted)] flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <AiOutlineFileText className="w-20 h-20 text-green-500/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                Ready for Resume Optimization
              </h3>
              <p className="text-lg mb-4 max-w-sm">
                Upload your resume and get AI-powered optimization for ATS systems, keyword matching, and content enhancement
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm">
                  🎯 ATS Optimization
                </span>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm">
                  🔍 Keyword Analysis
                </span>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm">
                  ✨ Content Enhancement
                </span>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm">
                  📊 Job Match Scoring
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResumeOptimizerInterface;