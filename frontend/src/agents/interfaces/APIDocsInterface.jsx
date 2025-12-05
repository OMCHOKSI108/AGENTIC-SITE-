import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineFileText, AiOutlineCode, AiOutlineDownload, AiOutlineCopy, AiOutlineCheckCircle } from 'react-icons/ai';
import { FiFile, FiCode, FiDownload, FiCopy } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const APIDocsInterface = ({ agent, onRun }) => {
  const [codeInput, setCodeInput] = useState('');
  const [apiType, setApiType] = useState('rest');
  const [language, setLanguage] = useState('javascript');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const apiTypes = [
    { value: 'rest', label: 'REST API', description: 'Generate OpenAPI/Swagger specs for REST endpoints' },
    { value: 'graphql', label: 'GraphQL API', description: 'Generate GraphQL schema documentation' },
    { value: 'grpc', label: 'gRPC API', description: 'Generate protobuf definitions and documentation' }
  ];

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'go', 'csharp', 'php', 'ruby'
  ];

  const handleRun = async () => {
    if (!codeInput.trim()) {
      setError('Please provide API code or description');
      return;
    }

    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const response = await onRun({
        code_input: codeInput,
        api_type: apiType,
        language: language
      });
      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to generate API documentation');
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
    const blob = new Blob([content], { type: 'text/plain' });
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
          <AiOutlineFileText className="text-blue-500" />
          API Documentation Generator
        </h2>
        <p className="text-[var(--muted)] text-lg">
          Generate comprehensive API documentation, OpenAPI specs, and client SDK examples from your code
        </p>
      </div>

      <div className="space-y-6">
        {/* API Type Selection */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
          <label className="block text-lg font-medium text-[var(--text)] mb-3">
            API Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {apiTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setApiType(type.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  apiType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-[var(--border)] bg-[var(--bg)] hover:border-[var(--text)]'
                }`}
              >
                <h3 className="font-medium text-[var(--text)]">{type.label}</h3>
                <p className="text-sm text-[var(--muted)] mt-1">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
          <label className="block text-lg font-medium text-[var(--text)] mb-3">
            Programming Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Code Input */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
          <label className="block text-lg font-medium text-[var(--text)] mb-3">
            API Code or Description
          </label>
          <textarea
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder={`Paste your API code here, or describe your API endpoints...

Example for REST API:
app.get('/users', (req, res) => {
  // Get all users
});

app.post('/users', (req, res) => {
  // Create new user
});`}
            className="w-full h-64 p-4 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
          />
        </div>

        {/* Run Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleRun}
            disabled={!codeInput.trim() || running}
            className="px-8 py-3 text-lg"
          >
            {running ? 'Generating Documentation...' : 'Generate API Docs'}
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
              <h3 className="text-lg font-semibold text-green-800">API Documentation Generated</h3>
            </div>

            <div className="space-y-4">
              {/* OpenAPI/Schema Specification */}
              {result.openapi_spec && (
                <div className="bg-white p-4 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">OpenAPI Specification (YAML)</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.openapi_spec)}
                      className="flex items-center gap-2"
                    >
                      {copied ? <AiOutlineCheckCircle className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <pre className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap overflow-x-auto font-mono">{result.openapi_spec}</pre>
                </div>
              )}

              {/* Markdown Documentation */}
              {result.markdown_docs && (
                <div className="bg-white p-4 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">API Documentation (Markdown)</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.markdown_docs)}
                      className="flex items-center gap-2"
                    >
                      {copied ? <AiOutlineCheckCircle className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{result.markdown_docs}</pre>
                  </div>
                </div>
              )}

              {/* Client SDK Examples */}
              {result.client_examples && (
                <div className="bg-white p-4 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Client SDK Examples ({language})</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.client_examples)}
                      className="flex items-center gap-2"
                    >
                      {copied ? <AiOutlineCheckCircle className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <pre className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap overflow-x-auto font-mono">{result.client_examples}</pre>
                </div>
              )}

              {/* Postman Collection */}
              {result.postman_collection && (
                <div className="bg-white p-4 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Postman Collection (JSON)</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.postman_collection)}
                      className="flex items-center gap-2"
                    >
                      {copied ? <AiOutlineCheckCircle className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <pre className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap overflow-x-auto font-mono max-h-64 overflow-y-auto">{result.postman_collection}</pre>
                </div>
              )}

              {/* Download Buttons */}
              <div className="flex gap-2 flex-wrap">
                {result.openapi_spec && (
                  <Button
                    variant="outline"
                    onClick={() => downloadFile(result.openapi_spec, 'openapi-spec.yaml')}
                    className="flex items-center gap-2"
                  >
                    <FiDownload className="h-4 w-4" />
                    Download OpenAPI Spec
                  </Button>
                )}
                {result.markdown_docs && (
                  <Button
                    variant="outline"
                    onClick={() => downloadFile(result.markdown_docs, 'api-docs.md')}
                    className="flex items-center gap-2"
                  >
                    <FiDownload className="h-4 w-4" />
                    Download Markdown Docs
                  </Button>
                )}
                {result.postman_collection && (
                  <Button
                    variant="outline"
                    onClick={() => downloadFile(result.postman_collection, 'postman-collection.json')}
                    className="flex items-center gap-2"
                  >
                    <FiDownload className="h-4 w-4" />
                    Download Postman Collection
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

export default APIDocsInterface;