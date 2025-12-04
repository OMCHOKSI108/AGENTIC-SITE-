import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineNodeIndex, AiOutlineBranches, AiOutlinePlayCircle, AiOutlineSave, AiOutlineImport, AiOutlineExport } from 'react-icons/ai';
import { FiPlus, FiTrash2, FiEdit3, FiPlay, FiSettings, FiArrowRight } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const WorkflowBuilderInterface = ({ agent, onRun }) => {
  const [workflowName, setWorkflowName] = useState('');
  const [description, setDescription] = useState('');
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  const nodeTypes = [
    { type: 'start', label: 'Start', icon: '🚀', color: 'bg-green-500', description: 'Workflow entry point' },
    { type: 'action', label: 'Action', icon: '⚡', color: 'bg-blue-500', description: 'Execute a task or API call' },
    { type: 'condition', label: 'Condition', icon: '🔀', color: 'bg-yellow-500', description: 'Decision point with branches' },
    { type: 'loop', label: 'Loop', icon: '🔄', color: 'bg-purple-500', description: 'Repeat actions' },
    { type: 'delay', label: 'Delay', icon: '⏱️', color: 'bg-orange-500', description: 'Wait for a period' },
    { type: 'end', label: 'End', icon: '🏁', color: 'bg-red-500', description: 'Workflow exit point' },
  ];

  const addNode = (type) => {
    const nodeType = nodeTypes.find(nt => nt.type === type);
    const newNode = {
      id: Date.now() + Math.random(),
      type,
      label: `${nodeType.label} ${nodes.filter(n => n.type === type).length + 1}`,
      x: Math.random() * 400 + 50,
      y: Math.random() * 300 + 50,
      config: {
        action: '',
        condition: '',
        delay: 0,
        loop_count: 1,
      },
      inputs: [],
      outputs: [],
    };

    // Set default inputs/outputs based on node type
    switch (type) {
      case 'start':
        newNode.outputs = ['output'];
        break;
      case 'action':
        newNode.inputs = ['input'];
        newNode.outputs = ['success', 'error'];
        break;
      case 'condition':
        newNode.inputs = ['input'];
        newNode.outputs = ['true', 'false'];
        break;
      case 'loop':
        newNode.inputs = ['input'];
        newNode.outputs = ['complete', 'error'];
        break;
      case 'delay':
        newNode.inputs = ['input'];
        newNode.outputs = ['output'];
        break;
      case 'end':
        newNode.inputs = ['input'];
        break;
    }

    setNodes(prev => [...prev, newNode]);
  };

  const updateNode = (id, updates) => {
    setNodes(prev => prev.map(node =>
      node.id === id ? { ...node, ...updates } : node
    ));
  };

  const deleteNode = (id) => {
    setNodes(prev => prev.filter(node => node.id !== id));
    setConnections(prev => prev.filter(conn =>
      conn.from !== id && conn.to !== id
    ));
    if (selectedNode === id) setSelectedNode(null);
  };

  const addConnection = (fromId, fromPort, toId, toPort) => {
    const connection = {
      id: Date.now() + Math.random(),
      from: fromId,
      fromPort,
      to: toId,
      toPort,
    };
    setConnections(prev => [...prev, connection]);
  };

  const deleteConnection = (id) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
  };

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedNode(null);
    }
  };

  const handleNodeMouseDown = (e, nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();

    setDragOffset({
      x: e.clientX - canvasRect.left - node.x,
      y: e.clientY - canvasRect.top - node.y,
    });
    setIsDragging(true);
    setSelectedNode(nodeId);
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging || !selectedNode) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;

    updateNode(selectedNode, {
      x: Math.max(0, Math.min(newX, canvasRect.width - 120)),
      y: Math.max(0, Math.min(newY, canvasRect.height - 80)),
    });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const validateWorkflow = () => {
    const errors = [];

    if (!workflowName.trim()) {
      errors.push('Workflow name is required');
    }

    if (nodes.length === 0) {
      errors.push('At least one node is required');
    }

    const startNodes = nodes.filter(n => n.type === 'start');
    const endNodes = nodes.filter(n => n.type === 'end');

    if (startNodes.length === 0) {
      errors.push('Workflow must have a start node');
    }

    if (endNodes.length === 0) {
      errors.push('Workflow must have an end node');
    }

    // Check for disconnected nodes
    const connectedNodeIds = new Set();
    connections.forEach(conn => {
      connectedNodeIds.add(conn.from);
      connectedNodeIds.add(conn.to);
    });

    const disconnectedNodes = nodes.filter(n => !connectedNodeIds.has(n.id) && n.type !== 'start');
    if (disconnectedNodes.length > 0) {
      errors.push(`${disconnectedNodes.length} nodes are not connected to the workflow`);
    }

    return errors;
  };

  const handleRun = async () => {
    const validationErrors = validateWorkflow();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const workflowData = {
        name: workflowName,
        description,
        nodes,
        connections,
      };

      const response = await onRun(workflowData);
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const exportWorkflow = () => {
    const workflowData = {
      name: workflowName,
      description,
      nodes,
      connections,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(workflowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflowName || 'workflow'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importWorkflow = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workflowData = JSON.parse(e.target.result);
        setWorkflowName(workflowData.name || '');
        setDescription(workflowData.description || '');
        setNodes(workflowData.nodes || []);
        setConnections(workflowData.connections || []);
        setSelectedNode(null);
      } catch (err) {
        setError('Invalid workflow file format');
      }
    };
    reader.readAsText(file);
  };

  const formatWorkflowResult = (result) => {
    if (!result || !result.output) return null;

    const data = result.output;
    if (!data.success) {
      return (
        <div className="text-center text-red-500">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Workflow Execution Failed</h3>
          <p className="text-[var(--text)]">{data.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Execution Summary */}
        <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
          <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
            <AiOutlinePlayCircle className="w-5 h-5 text-green-500" />
            Execution Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {data.execution_stats?.nodes_executed || 0}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Nodes Executed</div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {data.execution_stats?.total_time ? `${data.execution_stats.total_time}s` : 'N/A'}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Total Time</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                {data.execution_stats?.branches_taken || 0}
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">Branches Taken</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {data.execution_stats?.loops_completed || 0}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Loops Completed</div>
            </div>
          </div>
        </div>

        {/* Node Execution Results */}
        {data.node_results && data.node_results.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineNodeIndex className="w-5 h-5 text-blue-500" />
              Node Execution Results ({data.node_results.length})
            </h3>
            <div className="space-y-3">
              {data.node_results.map((nodeResult, index) => (
                <motion.div
                  key={nodeResult.node_id}
                  className={`p-4 rounded-lg border ${
                    nodeResult.status === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                    nodeResult.status === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                    'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${
                        nodeResult.status === 'success' ? 'bg-green-500' :
                        nodeResult.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <span className="font-medium text-[var(--text)]">{nodeResult.node_label}</span>
                      <span className="text-xs text-[var(--muted)]">({nodeResult.node_type})</span>
                    </div>
                    <div className="text-sm text-[var(--muted)]">
                      {nodeResult.execution_time ? `${nodeResult.execution_time}s` : ''}
                    </div>
                  </div>
                  {nodeResult.output && (
                    <div className="text-sm text-[var(--text)] mb-2">
                      <strong>Output:</strong> {typeof nodeResult.output === 'object' ?
                        JSON.stringify(nodeResult.output, null, 2) : nodeResult.output}
                    </div>
                  )}
                  {nodeResult.error && (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      <strong>Error:</strong> {nodeResult.error}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Workflow Path */}
        {data.execution_path && data.execution_path.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineBranches className="w-5 h-5 text-purple-500" />
              Execution Path
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {data.execution_path.map((nodeId, index) => {
                const node = nodes.find(n => n.id === nodeId);
                return (
                  <React.Fragment key={nodeId}>
                    {index > 0 && <FiArrowRight className="w-4 h-4 text-[var(--muted)]" />}
                    <div className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        {node?.label || `Node ${nodeId}`}
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">
                        {node?.type}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Final Output */}
        {data.final_output && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlinePlayCircle className="w-5 h-5 text-indigo-500" />
              Final Output
            </h3>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <pre className="text-sm text-indigo-700 dark:text-indigo-300 whitespace-pre-wrap">
                {typeof data.final_output === 'object' ?
                  JSON.stringify(data.final_output, null, 2) : data.final_output}
              </pre>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {data.performance_metrics && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineNodeIndex className="w-5 h-5 text-orange-500" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(data.performance_metrics).map(([key, value]) => (
                <div key={key} className="text-center p-3 bg-[var(--bg)] rounded border">
                  <div className="text-lg font-bold text-[var(--text)] mb-1">
                    {typeof value === 'number' ? value.toFixed(2) : value}
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
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <AiOutlineNodeIndex className="w-7 h-7 text-purple-500" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Build and execute automated workflows with visual drag-and-drop interface
          </p>
        </div>

        {/* Workflow Details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              Workflow Name *
            </label>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Enter workflow name..."
              className="w-full p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this workflow does..."
              rows={2}
              className="w-full p-3 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Node Palette */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Add Nodes
          </label>
          <div className="grid grid-cols-2 gap-2">
            {nodeTypes.map((nodeType) => (
              <button
                key={nodeType.type}
                onClick={() => addNode(nodeType.type)}
                className="p-3 border border-[var(--muted)] rounded-lg hover:border-purple-300 bg-[var(--surface)] hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{nodeType.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-[var(--text)]">{nodeType.label}</div>
                    <div className="text-xs text-[var(--muted)]">{nodeType.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Workflow Actions */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Workflow Actions
          </label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportWorkflow}
              disabled={nodes.length === 0}
            >
              <AiOutlineExport className="w-4 h-4 mr-2" />
              Export
            </Button>
            <label className="flex-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                as="span"
              >
                <AiOutlineImport className="w-4 h-4 mr-2" />
                Import
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={importWorkflow}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Node Configuration */}
        {selectedNode && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              Node Configuration
            </label>
            <div className="p-4 bg-[var(--bg)] rounded-lg border space-y-3">
              {(() => {
                const node = nodes.find(n => n.id === selectedNode);
                if (!node) return null;

                return (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[var(--text)]">{node.label}</span>
                      <button
                        onClick={() => deleteNode(selectedNode)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[var(--muted)]">Label</label>
                      <input
                        type="text"
                        value={node.label}
                        onChange={(e) => updateNode(selectedNode, { label: e.target.value })}
                        className="w-full p-2 text-sm bg-[var(--surface)] border border-[var(--muted)] rounded text-[var(--text)]"
                      />
                    </div>

                    {node.type === 'action' && (
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-[var(--muted)]">Action</label>
                        <textarea
                          value={node.config.action}
                          onChange={(e) => updateNode(selectedNode, {
                            config: { ...node.config, action: e.target.value }
                          })}
                          placeholder="Describe the action to perform..."
                          rows={2}
                          className="w-full p-2 text-sm bg-[var(--surface)] border border-[var(--muted)] rounded text-[var(--text)] resize-none"
                        />
                      </div>
                    )}

                    {node.type === 'condition' && (
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-[var(--muted)]">Condition</label>
                        <input
                          type="text"
                          value={node.config.condition}
                          onChange={(e) => updateNode(selectedNode, {
                            config: { ...node.config, condition: e.target.value }
                          })}
                          placeholder="e.g., status == 'success'"
                          className="w-full p-2 text-sm bg-[var(--surface)] border border-[var(--muted)] rounded text-[var(--text)]"
                        />
                      </div>
                    )}

                    {node.type === 'delay' && (
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-[var(--muted)]">Delay (seconds)</label>
                        <input
                          type="number"
                          min="0"
                          value={node.config.delay}
                          onChange={(e) => updateNode(selectedNode, {
                            config: { ...node.config, delay: parseInt(e.target.value) || 0 }
                          })}
                          className="w-full p-2 text-sm bg-[var(--surface)] border border-[var(--muted)] rounded text-[var(--text)]"
                        />
                      </div>
                    )}

                    {node.type === 'loop' && (
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-[var(--muted)]">Loop Count</label>
                        <input
                          type="number"
                          min="1"
                          value={node.config.loop_count}
                          onChange={(e) => updateNode(selectedNode, {
                            config: { ...node.config, loop_count: parseInt(e.target.value) || 1 }
                          })}
                          className="w-full p-2 text-sm bg-[var(--surface)] border border-[var(--muted)] rounded text-[var(--text)]"
                        />
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

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
            disabled={!workflowName.trim() || nodes.length === 0 || running}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {running ? (
              <div className="flex items-center gap-3">
                <AiOutlinePlayCircle className="w-5 h-5 animate-spin" />
                <span>Executing workflow...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <AiOutlinePlayCircle className="w-5 h-5" />
                <span>Execute Workflow</span>
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
            <AiOutlineBranches className="w-7 h-7 text-purple-500" />
            Workflow Canvas & Results
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
                  link.download = 'workflow-results.json';
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export Results
              </Button>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] rounded-xl p-6 min-h-96 border border-purple-500/10 shadow-lg overflow-hidden">
          {running ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <AiOutlineNodeIndex className="w-16 h-16 text-purple-500" />
              </motion.div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[var(--text)] mb-2">
                  Executing workflow...
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
                  AI is processing nodes, executing actions, and following the workflow logic
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Workflow Execution Failed</h3>
              <p className="text-[var(--text)] mb-4">{error}</p>
              <Button onClick={handleRun} variant="outline">
                Try Again
              </Button>
            </div>
          ) : result ? (
            <motion.div
              className="space-y-6 overflow-y-auto max-h-96"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                  <AiOutlinePlayCircle className="w-4 h-4" />
                  <span className="font-semibold">Workflow Executed Successfully</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Completed execution of {result.output.execution_stats?.nodes_executed || 0} nodes in {result.output.execution_stats?.total_time || 'N/A'} seconds
                </p>
              </div>
              {formatWorkflowResult(result)}
            </motion.div>
          ) : (
            <div className="relative h-full">
              {/* Canvas */}
              <div
                ref={canvasRef}
                className="absolute inset-0 bg-[var(--bg)] border-2 border-dashed border-[var(--muted)] rounded-lg cursor-crosshair overflow-hidden"
                onClick={handleCanvasClick}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              >
                {/* Grid Background */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, var(--muted) 1px, transparent 1px),
                      linear-gradient(to bottom, var(--muted) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}
                />

                {/* Connections */}
                <svg className="absolute inset-0 pointer-events-none">
                  {connections.map((conn) => {
                    const fromNode = nodes.find(n => n.id === conn.from);
                    const toNode = nodes.find(n => n.id === conn.to);
                    if (!fromNode || !toNode) return null;

                    const fromX = fromNode.x + 120;
                    const fromY = fromNode.y + 40;
                    const toX = toNode.x;
                    const toY = toNode.y + 40;

                    const midX = (fromX + toX) / 2;

                    return (
                      <g key={conn.id}>
                        <path
                          d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
                          stroke="var(--muted)"
                          strokeWidth="2"
                          fill="none"
                          markerEnd="url(#arrowhead)"
                        />
                        <defs>
                          <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                          >
                            <polygon
                              points="0 0, 10 3.5, 0 7"
                              fill="var(--muted)"
                            />
                          </marker>
                        </defs>
                      </g>
                    );
                  })}
                </svg>

                {/* Nodes */}
                {nodes.map((node) => {
                  const nodeType = nodeTypes.find(nt => nt.type === node.type);
                  return (
                    <motion.div
                      key={node.id}
                      className={`absolute w-30 h-20 rounded-lg border-2 cursor-move select-none ${
                        selectedNode === node.id
                          ? 'border-purple-500 shadow-lg'
                          : 'border-[var(--muted)] hover:border-purple-300'
                      } ${nodeType.color} text-white flex flex-col items-center justify-center text-xs font-bold`}
                      style={{ left: node.x, top: node.y }}
                      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-lg mb-1">{nodeType.icon}</div>
                      <div className="text-center leading-tight max-w-24 truncate">
                        {node.label}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Empty State */}
              {nodes.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--muted)]">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mb-4"
                  >
                    <AiOutlineNodeIndex className="w-20 h-20 text-purple-500/50" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                    Build Your Workflow
                  </h3>
                  <p className="text-lg mb-4 max-w-sm text-center">
                    Add nodes from the palette and connect them to create automated workflows
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm">
                      🎯 Drag & Drop Nodes
                    </span>
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm">
                      🔗 Connect Logic
                    </span>
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm">
                      ⚡ Execute Actions
                    </span>
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm">
                      📊 Track Results
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default WorkflowBuilderInterface;