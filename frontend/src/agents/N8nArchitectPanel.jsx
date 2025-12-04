import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { AiOutlineCloud, AiOutlineFire, AiOutlineDownload, AiOutlineCopy, AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import Loader from '../components/ui/Loader.jsx';

// Custom node component for n8n workflows
const WorkflowNode = ({ data }) => {
  const getNodeIcon = (nodeType) => {
    if (nodeType.includes('Trigger')) return '🔔';
    if (nodeType.includes('email') || nodeType.includes('slack') || nodeType.includes('discord')) return '📤';
    if (nodeType.includes('http') || nodeType.includes('webhook')) return '🌐';
    if (nodeType.includes('google') || nodeType.includes('drive')) return '📁';
    if (nodeType.includes('database') || nodeType.includes('mysql') || nodeType.includes('postgres')) return '🗄️';
    if (nodeType.includes('filter') || nodeType.includes('switch')) return '🔀';
    return '⚙️';
  };

  const getNodeColor = (nodeType) => {
    if (nodeType.includes('Trigger')) return '#10b981'; // green
    if (nodeType.includes('email') || nodeType.includes('slack')) return '#3b82f6'; // blue
    if (nodeType.includes('http') || nodeType.includes('webhook')) return '#f59e0b'; // amber
    if (nodeType.includes('google') || nodeType.includes('drive')) return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  return (
    <div
      className="px-4 py-3 shadow-lg rounded-lg border-2 min-w-48 text-center"
      style={{
        background: getNodeColor(data.nodeType),
        borderColor: getNodeColor(data.nodeType),
        color: 'white'
      }}
    >
      <div className="text-2xl mb-2">{getNodeIcon(data.nodeType)}</div>
      <div className="font-bold text-sm mb-1">{data.label}</div>
      <div className="text-xs opacity-90 truncate" title={data.nodeType}>
        {data.nodeType.replace('n8n-nodes-base.', '')}
      </div>
    </div>
  );
};

const nodeTypes = {
  workflowNode: WorkflowNode,
};

const N8nArchitectPanel = ({ agent, onRun, running, result, error }) => {
  const [goal, setGoal] = useState('');
  const [logs, setLogs] = useState([]);
  const [copied, setCopied] = useState(false);

  // Initialize React Flow with empty data
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Update visualization when result changes
  React.useEffect(() => {
    if (result && result.output && result.output.reactFlowData) {
      setNodes(result.output.reactFlowData.nodes || []);
      setEdges(result.output.reactFlowData.edges || []);
    }
  }, [result, setNodes, setEdges]);

  const handleRun = async () => {
    if (!goal.trim()) return;

    setLogs([]);
    setNodes([]);
    setEdges([]);

    // Add initial log
    setLogs(prev => [...prev, { type: 'info', message: '🤔 Analyzing workflow goal...', timestamp: new Date() }]);

    try {
      const response = await onRun({ goal });

      if (response.output) {
        // Add success logs
        setLogs(prev => [
          ...prev,
          { type: 'success', message: '✅ Workflow plan generated', timestamp: new Date() },
          { type: 'info', message: '🔧 Building n8n JSON structure...', timestamp: new Date() },
          { type: 'success', message: '✅ JSON validated and fixed', timestamp: new Date() },
          { type: 'success', message: '🎨 Rendering workflow visualization', timestamp: new Date() }
        ]);
      }
    } catch (err) {
      setLogs(prev => [...prev, { type: 'error', message: `❌ Error: ${err.message}`, timestamp: new Date() }]);
    }
  };

  const downloadJson = () => {
    if (!result || !result.output || !result.output.workflowJson) return;

    const dataStr = JSON.stringify(result.output.workflowJson, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `n8n-workflow-${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const copyToClipboard = async () => {
    if (!result || !result.output || !result.output.workflowJson) return;

    try {
      await navigator.clipboard.writeText(JSON.stringify(result.output.workflowJson, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatLogTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Left Panel: Input and Logs */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-primary to-orange-500 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <AiOutlineFire className="w-7 h-7 text-primary" />
            n8n Architect
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            AI-powered workflow builder with autonomous validation
          </p>
        </div>

        {/* Workflow Goal Input */}
        <div className="space-y-4">
          <div className="relative">
            <Input
              label="Workflow Goal"
              placeholder="Describe your automation workflow (e.g., 'Monitor Gmail for invoices, upload PDFs to Google Drive, send Slack notifications')"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="min-h-24 text-lg"
              as="textarea"
            />
            <div className="absolute bottom-3 right-3 text-xs text-[var(--muted)]">
              {goal.length}/1000
            </div>
          </div>

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
              disabled={!goal.trim() || running}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {running ? (
                <div className="flex items-center gap-3">
                  <Loader size="sm" />
                  <span>Building Workflow...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <AiOutlineCloud className="w-5 h-5" />
                  <span>Generate n8n Workflow</span>
                </div>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Logs Panel */}
        <div className="bg-gray-900 rounded-xl p-4 min-h-64 max-h-96 overflow-y-auto font-mono text-sm">
          <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
            <AiOutlineCloud className="w-4 h-4" />
            Build Logs
          </h3>

          {logs.length === 0 ? (
            <div className="text-green-600 text-center py-8">
              Ready to build your n8n workflow...
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-start gap-2 p-2 rounded ${
                    log.type === 'error' ? 'bg-red-900/20 text-red-300' :
                    log.type === 'success' ? 'bg-green-900/20 text-green-300' :
                    'bg-blue-900/20 text-blue-300'
                  }`}
                >
                  <span className="text-xs opacity-70 mt-0.5">
                    {formatLogTime(log.timestamp)}
                  </span>
                  <span className="flex-1">{log.message}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Workflow Plan Display */}
        {result && result.output && result.output.plan && (
          <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--muted)]">
            <h3 className="text-[var(--text)] font-bold mb-3 flex items-center gap-2">
              <AiOutlineCheckCircle className="w-4 h-4 text-green-500" />
              Generated Plan
            </h3>
            <div className="text-[var(--text)] whitespace-pre-wrap text-sm bg-[var(--bg)] p-3 rounded border">
              {result.output.plan}
            </div>
          </div>
        )}
      </motion.div>

      {/* Right Panel: Workflow Visualization */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--text)] flex items-center gap-3">
            <AiOutlineCloud className="w-7 h-7 text-primary" />
            Workflow Visualization
          </h2>

          {result && result.output && result.output.workflowJson && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex items-center gap-2"
              >
                {copied ? <AiOutlineCheckCircle className="w-4 h-4 text-green-500" /> : <AiOutlineCopy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy JSON'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadJson}
                className="flex items-center gap-2"
              >
                <AiOutlineDownload className="w-4 h-4" />
                Download
              </Button>
            </div>
          )}
        </div>

        {/* React Flow Visualization */}
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--muted)] h-96 lg:h-[600px]">
          {nodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--muted)]">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <AiOutlineCloud className="w-20 h-20 text-primary/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                Workflow Preview
              </h3>
              <p className="text-center max-w-sm">
                Enter a workflow goal and click "Generate" to see your n8n workflow visualized here
              </p>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
            >
              <Controls />
              <MiniMap
                nodeColor={(node) => {
                  if (node.data?.nodeType?.includes('Trigger')) return '#10b981';
                  if (node.data?.nodeType?.includes('email') || node.data?.nodeType?.includes('slack')) return '#3b82f6';
                  return '#6b7280';
                }}
              />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          )}
        </div>

        {/* JSON Preview */}
        {result && result.output && result.output.workflowJson && (
          <div className="bg-gray-900 rounded-xl p-4 max-h-64 overflow-y-auto">
            <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
              <AiOutlineCloud className="w-4 h-4" />
              Generated JSON
            </h3>
            <pre className="text-green-300 text-xs whitespace-pre-wrap">
              {JSON.stringify(result.output.workflowJson, null, 2)}
            </pre>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-300 mb-2">
              <AiOutlineCloseCircle className="w-4 h-4" />
              <span className="font-bold">Build Failed</span>
            </div>
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default N8nArchitectPanel;