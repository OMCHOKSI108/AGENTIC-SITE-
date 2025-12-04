import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineEye, AiOutlineCheckCircle, AiOutlineWarning, AiOutlineCloseCircle, AiOutlineUpload, AiOutlineGlobal } from 'react-icons/ai';
import { FiImage, FiUpload, FiAlertTriangle, FiCheck, FiX, FiMonitor } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const UXAuditInterface = ({ agent, onRun }) => {
  const [screenshots, setScreenshots] = useState([]);
  const [url, setUrl] = useState('');
  const [auditType, setAuditType] = useState('comprehensive');
  const [accessibilityLevel, setAccessibilityLevel] = useState('WCAG2AA');
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [generateReport, setGenerateReport] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const auditTypes = [
    { value: 'comprehensive', label: 'Comprehensive Audit', icon: '🔍', description: 'Full UX, accessibility, and usability analysis' },
    { value: 'accessibility', label: 'Accessibility Only', icon: '♿', description: 'WCAG compliance and accessibility issues' },
    { value: 'usability', label: 'Usability Only', icon: '👥', description: 'User experience and interaction design' },
    { value: 'visual', label: 'Visual Design', icon: '🎨', description: 'Design consistency and visual hierarchy' },
  ];

  const accessibilityLevels = [
    { value: 'WCAG2A', label: 'WCAG 2.0 Level A', icon: '📏', description: 'Basic accessibility requirements' },
    { value: 'WCAG2AA', label: 'WCAG 2.0 Level AA', icon: '📐', description: 'Standard accessibility compliance' },
    { value: 'WCAG2AAA', label: 'WCAG 2.0 Level AAA', icon: '📏📐', description: 'Enhanced accessibility standards' },
    { value: 'Section508', label: 'Section 508', icon: '🇺🇸', description: 'US government accessibility standards' },
  ];

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length !== files.length) {
      setError('Please upload only image files (PNG, JPG, JPEG, etc.)');
      return;
    }

    if (screenshots.length + imageFiles.length > 10) {
      setError('Maximum 10 screenshots allowed');
      return;
    }

    const totalSize = [...screenshots, ...imageFiles].reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 50 * 1024 * 1024) { // 50MB limit
      setError('Total file size must be less than 50MB');
      return;
    }

    const newScreenshots = imageFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file),
    }));

    setScreenshots(prev => [...prev, ...newScreenshots]);
    setError(null);
  };

  const removeScreenshot = (id) => {
    setScreenshots(prev => {
      const updated = prev.filter(s => s.id !== id);
      // Clean up object URLs
      const removed = prev.find(s => s.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return updated;
    });
  };

  const handleRun = async () => {
    if (screenshots.length === 0 && !url.trim()) {
      setError('Please upload screenshots or provide a URL');
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('url', url);
      formData.append('audit_type', auditType);
      formData.append('accessibility_level', accessibilityLevel);
      formData.append('include_recommendations', includeRecommendations);
      formData.append('generate_report', generateReport);

      screenshots.forEach(screenshot => {
        formData.append('screenshots', screenshot.file);
      });

      const response = await onRun(formData);
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const formatAuditResult = (result) => {
    if (!result || !result.output) return null;

    const data = result.output;
    if (!data.success) {
      return (
        <div className="text-center text-red-500">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">UX Audit Failed</h3>
          <p className="text-[var(--text)]">{data.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Overall Scores */}
        {data.overall_scores && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineCheckCircle className="w-5 h-5 text-blue-500" />
              Audit Scores Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.overall_scores).map(([key, value]) => (
                <div key={key} className="text-center p-3 bg-[var(--bg)] rounded border">
                  <div className="text-2xl font-bold text-[var(--text)] mb-1">
                    {typeof value === 'number' ? `${value}%` : value}
                  </div>
                  <div className="text-sm text-[var(--muted)] capitalize">
                    {key.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Critical Issues */}
        {data.critical_issues && data.critical_issues.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineCloseCircle className="w-5 h-5 text-red-500" />
              Critical Issues ({data.critical_issues.length})
            </h3>
            <div className="space-y-3">
              {data.critical_issues.map((issue, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-3">
                    <FiX className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-700 dark:text-red-300 mb-1">{issue.title}</h4>
                      <p className="text-sm text-red-600 dark:text-red-400 mb-2">{issue.description}</p>
                      <div className="flex items-center gap-4 text-xs text-red-500 dark:text-red-400">
                        <span>Severity: {issue.severity}</span>
                        <span>Impact: {issue.impact}</span>
                        {issue.wcag_guideline && <span>WCAG: {issue.wcag_guideline}</span>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {data.warnings && data.warnings.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineWarning className="w-5 h-5 text-yellow-500" />
              Warnings ({data.warnings.length})
            </h3>
            <div className="space-y-3">
              {data.warnings.map((warning, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-3">
                    <FiAlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-yellow-700 dark:text-yellow-300 mb-1">{warning.title}</h4>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">{warning.description}</p>
                      <div className="flex items-center gap-4 text-xs text-yellow-500 dark:text-yellow-400">
                        <span>Priority: {warning.priority}</span>
                        {warning.suggestion && <span>Suggestion: {warning.suggestion}</span>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Accessibility Issues */}
        {data.accessibility_issues && data.accessibility_issues.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineGlobal className="w-5 h-5 text-purple-500" />
              Accessibility Issues ({data.accessibility_issues.length})
            </h3>
            <div className="space-y-3">
              {data.accessibility_issues.map((issue, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                      issue.level === 'A' ? 'bg-red-500' :
                      issue.level === 'AA' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-1">{issue.title}</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 mb-2">{issue.description}</p>
                      <div className="flex items-center gap-4 text-xs text-purple-500 dark:text-purple-400">
                        <span>WCAG Level: {issue.level}</span>
                        <span>Guideline: {issue.guideline}</span>
                        <span>Impact: {issue.impact}</span>
                      </div>
                      {issue.fix && (
                        <div className="mt-2 p-2 bg-purple-100 dark:bg-purple-900/30 rounded text-sm text-purple-700 dark:text-purple-300">
                          <strong>Fix:</strong> {issue.fix}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Usability Issues */}
        {data.usability_issues && data.usability_issues.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineEye className="w-5 h-5 text-indigo-500" />
              Usability Issues ({data.usability_issues.length})
            </h3>
            <div className="space-y-3">
              {data.usability_issues.map((issue, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-3">
                    <FiMonitor className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">{issue.title}</h4>
                      <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-2">{issue.description}</p>
                      <div className="flex items-center gap-4 text-xs text-indigo-500 dark:text-indigo-400">
                        <span>Severity: {issue.severity}</span>
                        <span>Affected Users: {issue.affected_users}</span>
                      </div>
                      {issue.recommendation && (
                        <div className="mt-2 p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded text-sm text-indigo-700 dark:text-indigo-300">
                          <strong>Recommendation:</strong> {issue.recommendation}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Positive Findings */}
        {data.positive_findings && data.positive_findings.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineCheckCircle className="w-5 h-5 text-green-500" />
              Positive Findings ({data.positive_findings.length})
            </h3>
            <div className="space-y-3">
              {data.positive_findings.map((finding, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-3">
                    <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-700 dark:text-green-300 mb-1">{finding.title}</h4>
                      <p className="text-sm text-green-600 dark:text-green-400 mb-2">{finding.description}</p>
                      <div className="flex items-center gap-4 text-xs text-green-500 dark:text-green-400">
                        <span>Impact: {finding.impact}</span>
                        {finding.benchmark && <span>Benchmark: {finding.benchmark}</span>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {data.recommendations && data.recommendations.length > 0 && includeRecommendations && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineEye className="w-5 h-5 text-cyan-500" />
              Recommendations ({data.recommendations.length})
            </h3>
            <div className="space-y-4">
              {data.recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    rec.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                    rec.priority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                    'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5 ${
                      rec.priority === 'high' ? 'bg-red-500' :
                      rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-[var(--text)] mb-1">{rec.title}</h4>
                      <p className="text-sm text-[var(--text)] mb-2">{rec.description}</p>
                      <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
                        <span>Priority: {rec.priority}</span>
                        <span>Effort: {rec.effort}</span>
                        <span>Impact: {rec.impact}</span>
                      </div>
                      {rec.steps && rec.steps.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium text-[var(--text)] mb-2">Implementation Steps:</h5>
                          <ol className="text-sm text-[var(--text)] space-y-1">
                            {rec.steps.map((step, stepIndex) => (
                              <li key={stepIndex} className="flex items-start gap-2">
                                <span className="text-[var(--muted)]">{stepIndex + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Audit Report */}
        {data.report && generateReport && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineEye className="w-5 h-5 text-gray-500" />
              Complete Audit Report
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text)] font-medium">Download Full Report</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([data.report.content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'ux-audit-report.txt';
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Download Report
                </Button>
              </div>
              <div className="p-4 bg-[var(--bg)] rounded border max-h-60 overflow-y-auto">
                <pre className="text-sm text-[var(--text)] whitespace-pre-wrap">
                  {data.report.content}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        {data.summary_stats && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineEye className="w-5 h-5 text-teal-500" />
              Audit Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.summary_stats).map(([key, value]) => (
                <div key={key} className="text-center p-3 bg-[var(--bg)] rounded border">
                  <div className="text-2xl font-bold text-[var(--text)] mb-1">
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
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <AiOutlineEye className="w-7 h-7 text-cyan-500" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Analyze UI screenshots for accessibility, usability, and design issues with AI-powered insights
          </p>
        </div>

        {/* URL Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Website URL
          </label>
          <div className="relative">
            <AiOutlineGlobal className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted)] w-5 h-5" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full pl-10 pr-4 py-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-[var(--muted)]">
            Optional: Provide a URL for live website analysis
          </p>
        </div>

        {/* Screenshot Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            UI Screenshots *
          </label>
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-6 border-2 border-dashed border-[var(--muted)] rounded-lg hover:border-cyan-400 transition-colors bg-[var(--surface)] hover:bg-cyan-50 dark:hover:bg-cyan-900/10"
            >
              <div className="flex flex-col items-center gap-3">
                <AiOutlineUpload className="w-8 h-8 text-[var(--muted)]" />
                <div className="text-center">
                  <span className="text-[var(--text)] font-medium">Click to upload screenshots</span>
                  <span className="text-sm text-[var(--muted)] block">
                    PNG, JPG, JPEG supported (max 10 files, 50MB total)
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Uploaded Screenshots */}
          {screenshots.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {screenshots.map((screenshot) => (
                <motion.div
                  key={screenshot.id}
                  className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-lg border"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <img
                    src={screenshot.preview}
                    alt={screenshot.name}
                    className="w-12 h-12 object-cover rounded border"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--text)] truncate">{screenshot.name}</div>
                    <div className="text-xs text-[var(--muted)]">
                      {(screenshot.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button
                    onClick={() => removeScreenshot(screenshot.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Audit Type
          </label>
          <div className="grid grid-cols-1 gap-2">
            {auditTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setAuditType(type.value)}
                className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                  auditType === type.value
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300'
                    : 'border-[var(--muted)] bg-[var(--surface)] text-[var(--text)] hover:border-cyan-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{type.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs opacity-70">{type.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Accessibility Level */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Accessibility Standard
          </label>
          <select
            value={accessibilityLevel}
            onChange={(e) => setAccessibilityLevel(e.target.value)}
            className="w-full p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            {accessibilityLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.icon} {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--text)]">Include Recommendations</label>
            <button
              onClick={() => setIncludeRecommendations(!includeRecommendations)}
              className={`w-12 h-6 rounded-full transition-colors ${
                includeRecommendations ? 'bg-cyan-500' : 'bg-[var(--muted)]'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  includeRecommendations ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--text)]">Generate Full Report</label>
            <button
              onClick={() => setGenerateReport(!generateReport)}
              className={`w-12 h-6 rounded-full transition-colors ${
                generateReport ? 'bg-cyan-500' : 'bg-[var(--muted)]'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  generateReport ? 'translate-x-6' : 'translate-x-0.5'
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
            disabled={screenshots.length === 0 && !url.trim() || running}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {running ? (
              <div className="flex items-center gap-3">
                <AiOutlineEye className="w-5 h-5 animate-spin" />
                <span>Auditing UI...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <AiOutlineEye className="w-5 h-5" />
                <span>Run UX Audit</span>
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
            <FiMonitor className="w-7 h-7 text-cyan-500" />
            Audit Results
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
                  link.download = 'ux-audit-results.json';
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export Results
              </Button>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] rounded-xl p-6 min-h-96 border border-cyan-500/10 shadow-lg overflow-y-auto">
          {running ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <AiOutlineEye className="w-16 h-16 text-cyan-500" />
              </motion.div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[var(--text)] mb-2">
                  Analyzing UI screenshots...
                </div>
                <div className="flex justify-center gap-1 mb-4">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-cyan-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-cyan-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-cyan-500 rounded-full"
                  />
                </div>
                <p className="text-sm text-[var(--muted)] text-center">
                  AI is analyzing accessibility, usability, visual design, and generating actionable recommendations
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">UX Audit Failed</h3>
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
                  <span className="font-semibold">UX Audit Complete</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Analysis completed for {screenshots.length} screenshots with comprehensive accessibility and usability insights
                </p>
              </div>
              {formatAuditResult(result)}
            </motion.div>
          ) : (
            <div className="text-center text-[var(--muted)] flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <AiOutlineEye className="w-20 h-20 text-cyan-500/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                Ready for UX Audit
              </h3>
              <p className="text-lg mb-4 max-w-sm">
                Upload UI screenshots or provide a URL to get comprehensive accessibility, usability, and design analysis
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-sm">
                  ♿ Accessibility
                </span>
                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-sm">
                  👥 Usability
                </span>
                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-sm">
                  🎨 Visual Design
                </span>
                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-sm">
                  📋 Actionable Fixes
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UXAuditInterface;