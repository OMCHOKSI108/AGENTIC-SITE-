import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineCode, AiOutlineDownload, AiOutlineCopy, AiOutlineCheckCircle } from 'react-icons/ai';
import { FiCode, FiDownload, FiCopy } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const TerraformInterface = ({ agent, onRun }) => {
  const [projectDescription, setProjectDescription] = useState('');
  const [cloudProvider, setCloudProvider] = useState('');
  const [region, setRegion] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const cloudProviders = [
    { value: 'aws', label: 'Amazon Web Services (AWS)', regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'] },
    { value: 'azure', label: 'Microsoft Azure', regions: ['East US', 'West Europe', 'Southeast Asia', 'Australia East'] },
    { value: 'gcp', label: 'Google Cloud Platform', regions: ['us-central1', 'europe-west1', 'asia-southeast1', 'us-west1'] }
  ];

  const selectedProvider = cloudProviders.find(p => p.value === cloudProvider);

  const handleRun = async () => {
    if (!projectDescription.trim()) {
      setError('Please describe your infrastructure requirements');
      return;
    }
    if (!cloudProvider) {
      setError('Please select a cloud provider');
      return;
    }

    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const response = await onRun({
        project_description: projectDescription,
        cloud_provider: cloudProvider,
        region: region
      });
      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to generate Terraform code');
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
          <AiOutlineCode className="text-purple-500" />
          Terraform Architect
        </h2>
        <p className="text-[var(--muted)] text-lg">
          Describe your cloud infrastructure needs and get production-ready Terraform code with best practices
        </p>
      </div>

      <div className="space-y-6">
        {/* Project Description */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
          <label className="block text-lg font-medium text-[var(--text)] mb-3">
            Infrastructure Requirements
          </label>
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Describe your infrastructure needs (e.g., 'VPC with public/private subnets, security groups, RDS PostgreSQL instance, EC2 instances with auto-scaling, S3 bucket for storage')"
            className="w-full h-32 p-4 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Cloud Provider Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
            <label className="block text-lg font-medium text-[var(--text)] mb-3">
              Cloud Provider
            </label>
            <select
              value={cloudProvider}
              onChange={(e) => {
                setCloudProvider(e.target.value);
                setRegion(''); // Reset region when provider changes
              }}
              className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select cloud provider</option>
              {cloudProviders.map((provider) => (
                <option key={provider.value} value={provider.value}>{provider.label}</option>
              ))}
            </select>
          </div>

          {/* Region Selection */}
          <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
            <label className="block text-lg font-medium text-[var(--text)] mb-3">
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              disabled={!cloudProvider}
              className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select region (optional)</option>
              {selectedProvider?.regions.map((regionOption) => (
                <option key={regionOption} value={regionOption}>{regionOption}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Run Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleRun}
            disabled={!projectDescription.trim() || !cloudProvider || running}
            className="px-8 py-3 text-lg"
          >
            {running ? 'Generating Terraform...' : 'Generate Terraform Code'}
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
              <h3 className="text-lg font-semibold text-green-800">Terraform Code Generated</h3>
            </div>

            <div className="space-y-4">
              {/* Main Terraform Configuration */}
              <div className="bg-white p-4 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">main.tf</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.main_tf)}
                    className="flex items-center gap-2"
                  >
                    {copied ? <AiOutlineCheckCircle className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <pre className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap overflow-x-auto font-mono">{result.main_tf}</pre>
              </div>

              {/* Variables File */}
              {result.variables_tf && (
                <div className="bg-white p-4 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">variables.tf</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.variables_tf)}
                      className="flex items-center gap-2"
                    >
                      {copied ? <AiOutlineCheckCircle className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <pre className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap overflow-x-auto font-mono">{result.variables_tf}</pre>
                </div>
              )}

              {/* Outputs File */}
              {result.outputs_tf && (
                <div className="bg-white p-4 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">outputs.tf</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.outputs_tf)}
                      className="flex items-center gap-2"
                    >
                      {copied ? <AiOutlineCheckCircle className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <pre className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap overflow-x-auto font-mono">{result.outputs_tf}</pre>
                </div>
              )}

              {/* Security Notes */}
              {result.security_notes && (
                <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-2">Security Considerations</h4>
                  <p className="text-sm text-yellow-700">{result.security_notes}</p>
                </div>
              )}

              {/* Download Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => downloadFile(result.main_tf, 'main.tf')}
                  className="flex items-center gap-2"
                >
                  <FiDownload className="h-4 w-4" />
                  Download main.tf
                </Button>
                {result.variables_tf && (
                  <Button
                    variant="outline"
                    onClick={() => downloadFile(result.variables_tf, 'variables.tf')}
                    className="flex items-center gap-2"
                  >
                    <FiDownload className="h-4 w-4" />
                    Download variables.tf
                  </Button>
                )}
                {result.outputs_tf && (
                  <Button
                    variant="outline"
                    onClick={() => downloadFile(result.outputs_tf, 'outputs.tf')}
                    className="flex items-center gap-2"
                  >
                    <FiDownload className="h-4 w-4" />
                    Download outputs.tf
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

export default TerraformInterface;