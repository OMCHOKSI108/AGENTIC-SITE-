import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineFileText, AiOutlineDownload, AiOutlineCopy, AiOutlineCheckCircle } from 'react-icons/ai';
import { FiFile, FiDownload, FiCopy } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const ReadmeArchitectInterface = ({ agent, onRun }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [features, setFeatures] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const inputTypes = [
    {
      value: 'url',
      label: 'GitHub Repository URL',
      icon: '🔗',
      description: 'Generate README from GitHub repo analysis',
      placeholder: 'https://github.com/username/repo'
    },
    {
      value: 'manual',
      label: 'Manual Description',
      icon: '📝',
      description: 'Provide project details manually',
      placeholder: 'Describe your project...'
    }
  ];

  const [inputType, setInputType] = useState('url');

  const techStackOptions = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#',
    'PHP', 'Ruby', 'Swift', 'Kotlin', 'React', 'Vue.js', 'Angular', 'Svelte',
    'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Laravel'
  ];

  const handleRun = async () => {
    if (inputType === 'url' && !repoUrl.trim()) {
      setError('Please provide a GitHub repository URL');
      return;
    }
    if (inputType === 'manual' && !projectDescription.trim()) {
      setError('Please provide a project description');
      return;
    }

    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const payload = inputType === 'url'
        ? { repo_url: repoUrl }
        : {
            project_description: projectDescription,
            tech_stack: techStack,
            features: features
          };

      const response = await onRun(payload);
      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to generate README');
    } finally {
      setRunning(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 bg-[var(--bg)] rounded-lg shadow-lg"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text)] mb-4 flex items-center gap-3">
          <AiOutlineFileText className="text-indigo-500" />
          README.md Architect
        </h2>
        <p className="text-[var(--muted)] text-lg">
          Generate professional README files with badges, installation instructions, and comprehensive documentation
        </p>
      </div>

      <div className="space-y-6">
        {/* Input Type Selection */}
        <div className="flex gap-4 mb-6">
          {inputTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setInputType(type.value)}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                inputType === type.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--text)]'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{type.icon}</div>
                <h3 className="font-medium text-[var(--text)]">{type.label}</h3>
                <p className="text-sm text-[var(--muted)] mt-1">{type.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* GitHub URL Input */}
        {inputType === 'url' && (
          <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
            <label className="block text-lg font-medium text-[var(--text)] mb-3">
              GitHub Repository URL
            </label>
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repository-name"
              className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-[var(--muted)] mt-2">
              The agent will analyze your repository structure, tech stack, and existing files to generate a comprehensive README
            </p>
          </div>
        )}

        {/* Manual Input */}
        {inputType === 'manual' && (
          <div className="space-y-6">
            <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
              <label className="block text-lg font-medium text-[var(--text)] mb-3">
                Project Description
              </label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Describe what your project does, its main purpose, and target audience..."
                className="w-full h-24 p-4 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
                <label className="block text-lg font-medium text-[var(--text)] mb-3">
                  Tech Stack
                </label>
                <select
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select primary technology</option>
                  {techStackOptions.map((tech) => (
                    <option key={tech} value={tech}>{tech}</option>
                  ))}
                </select>
              </div>

              <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
                <label className="block text-lg font-medium text-[var(--text)] mb-3">
                  Key Features (Optional)
                </label>
                <textarea
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="List main features, one per line..."
                  className="w-full h-24 p-3 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Run Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleRun}
            disabled={
              (inputType === 'url' && !repoUrl.trim()) ||
              (inputType === 'manual' && !projectDescription.trim()) ||
              running
            }
            className="px-8 py-3 text-lg"
          >
            {running ? 'Generating README...' : 'Generate README.md'}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}

        {/* Results Display */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <AiOutlineCheckCircle className="text-green-600 h-5 w-5" />
              <h3 className="text-lg font-semibold text-green-800">README.md Generated</h3>
            </div>

            <div className="space-y-4">
              {/* Generated README Preview */}
              <div className="bg-white p-4 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Generated README.md</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.readme_content)}
                    className="flex items-center gap-2"
                  >
                    {copied ? <AiOutlineCheckCircle className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono">{result.readme_content}</pre>
                </div>
              </div>

              {/* Badges/Shields */}
              {result.badges && (
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-medium text-gray-900 mb-2">Recommended Badges</h4>
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    <pre className="whitespace-pre-wrap">{result.badges}</pre>
                  </div>
                </div>
              )}

              {/* Installation Commands */}
              {result.installation_commands && (
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-medium text-gray-900 mb-2">Installation Commands</h4>
                  <pre className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap font-mono">{result.installation_commands}</pre>
                </div>
              )}

              {/* Download Button */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => downloadFile(result.readme_content, 'README.md')}
                  className="flex items-center gap-2"
                >
                  <FiDownload className="h-4 w-4" />
                  Download README.md
                </Button>
                {result.badges && (
                  <Button
                    variant="outline"
                    onClick={() => downloadFile(result.badges, 'badges.md')}
                    className="flex items-center gap-2"
                  >
                    <FiDownload className="h-4 w-4" />
                    Download Badges
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ReadmeArchitectInterface;