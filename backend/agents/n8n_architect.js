const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Valid n8n node types (subset of commonly used ones)
const VALID_NODE_TYPES = [
  'n8n-nodes-base.scheduleTrigger',
  'n8n-nodes-base.webhook',
  'n8n-nodes-base.httpRequest',
  'n8n-nodes-base.emailSend',
  'n8n-nodes-base.gmail',
  'n8n-nodes-base.googleDrive',
  'n8n-nodes-base.slack',
  'n8n-nodes-base.discord',
  'n8n-nodes-base.telegram',
  'n8n-nodes-base.twilio',
  'n8n-nodes-base.airtable',
  'n8n-nodes-base.notion',
  'n8n-nodes-base.jira',
  'n8n-nodes-base.trello',
  'n8n-nodes-base.github',
  'n8n-nodes-base.git',
  'n8n-nodes-base.mysql',
  'n8n-nodes-base.postgres',
  'n8n-nodes-base.mongodb',
  'n8n-nodes-base.redis',
  'n8n-nodes-base.spreadsheetFile',
  'n8n-nodes-base.csv',
  'n8n-nodes-base.json',
  'n8n-nodes-base.set',
  'n8n-nodes-base.switch',
  'n8n-nodes-base.if',
  'n8n-nodes-base.loopOverItems',
  'n8n-nodes-base.splitInBatches',
  'n8n-nodes-base.aggregate',
  'n8n-nodes-base.merge',
  'n8n-nodes-base.filter',
  'n8n-nodes-base.sort',
  'n8n-nodes-base.limit',
  'n8n-nodes-base.removeDuplicates',
  'n8n-nodes-base.htmlExtract',
  'n8n-nodes-base.rssFeedRead',
  'n8n-nodes-base.cron',
  'n8n-nodes-base.wait',
  'n8n-nodes-base.errorTrigger',
  'n8n-nodes-base.manualTrigger'
];

// Validation function for n8n workflow JSON
function validateN8nWorkflow(workflowJson) {
  try {
    // Check basic structure
    if (!workflowJson.nodes || !Array.isArray(workflowJson.nodes)) {
      return { valid: false, error: "Missing or invalid 'nodes' array" };
    }

    if (!workflowJson.connections || typeof workflowJson.connections !== 'object') {
      return { valid: false, error: "Missing or invalid 'connections' object" };
    }

    // Check if all nodes have valid types
    for (const node of workflowJson.nodes) {
      if (!node.type || !VALID_NODE_TYPES.includes(node.type)) {
        return { valid: false, error: `Invalid node type: ${node.type}. Must be one of: ${VALID_NODE_TYPES.slice(0, 5).join(', ')}...` };
      }
    }

    // Check for orphan nodes (nodes with no connections except triggers)
    const nodeNames = workflowJson.nodes.map(n => n.name);
    const connectedNodes = new Set();

    // Collect all nodes that have connections
    Object.keys(workflowJson.connections).forEach(sourceNode => {
      connectedNodes.add(sourceNode);
      if (workflowJson.connections[sourceNode].main) {
        workflowJson.connections[sourceNode].main.forEach(connection => {
          connection.forEach(target => {
            connectedNodes.add(target.node);
          });
        });
      }
    });

    // Find trigger nodes (they don't need input connections)
    const triggerNodes = workflowJson.nodes
      .filter(n => n.type.includes('Trigger'))
      .map(n => n.name);

    // Check for orphan nodes (non-trigger nodes with no input connections)
    const orphanNodes = nodeNames.filter(nodeName => {
      return !triggerNodes.includes(nodeName) && !connectedNodes.has(nodeName);
    });

    if (orphanNodes.length > 0) {
      return { valid: false, error: `Orphan nodes found (not connected): ${orphanNodes.join(', ')}` };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: `JSON validation error: ${error.message}` };
  }
}

// Generate workflow plan
async function generateWorkflowPlan(goal) {
  const prompt = `Break down this workflow goal into specific n8n node steps. Identify triggers, actions, and data flow.

Goal: "${goal}"

Rules:
1. Start with a trigger node (schedule, webhook, manual, etc.)
2. Use specific n8n node types from the valid list
3. Show the logical flow: [Trigger] -> [Action1] -> [Action2] -> ...
4. Keep it simple but complete
5. Focus on the main workflow path

Output format:
TRIGGER: [node type] - [description]
STEP 1: [node type] - [description]
STEP 2: [node type] - [description]
...`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// Generate n8n workflow JSON
async function generateWorkflowJson(goal, plan, retryCount = 0) {
  const validNodesList = VALID_NODE_TYPES.slice(0, 20).join('\n- ');

  const prompt = `Generate a valid n8n workflow JSON for this goal.

GOAL: "${goal}"

WORKFLOW PLAN:
${plan}

VALID NODE TYPES (use ONLY these):
- ${validNodesList}

RULES:
1. Use ONLY node types from the valid list above
2. Every node must have a unique "name" (no spaces, use camelCase)
3. The "connections" object must connect ALL nodes in sequence
4. Use "main" as the connection key (not array indices)
5. Include proper parameters for each node type
6. Start with a trigger node
7. Output ONLY valid JSON, no markdown or explanations

JSON Structure:
{
  "name": "Workflow Name",
  "nodes": [
    {
      "name": "triggerNode",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {},
      "position": [100, 100]
    },
    {
      "name": "actionNode",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {},
      "position": [300, 100]
    }
  ],
  "connections": {
    "triggerNode": {
      "main": [
        [
          {
            "node": "actionNode",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}`;

  const result = await model.generateContent(prompt);
  let jsonText = result.response.text().trim();

  // Clean up the response (remove markdown if present)
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\s*/, '').replace(/```\s*$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\s*/, '').replace(/```\s*$/, '');
  }

  try {
    const workflowJson = JSON.parse(jsonText);
    return workflowJson;
  } catch (error) {
    if (retryCount < 2) {
      // Try to fix JSON syntax errors
      const fixedJson = await fixJsonErrors(jsonText, error.message, retryCount + 1);
      return fixedJson;
    }
    throw new Error(`Failed to generate valid JSON after ${retryCount + 1} attempts: ${error.message}`);
  }
}

// Fix JSON syntax errors
async function fixJsonErrors(brokenJson, error, retryCount) {
  const prompt = `Fix this broken JSON for an n8n workflow. The error is: ${error}

BROKEN JSON:
${brokenJson}

Output ONLY the corrected JSON, no explanations.`;

  const result = await model.generateContent(prompt);
  let jsonText = result.response.text().trim();

  // Clean up the response
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\s*/, '').replace(/```\s*$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\s*/, '').replace(/```\s*$/, '');
  }

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    if (retryCount < 2) {
      return await fixJsonErrors(jsonText, error.message, retryCount + 1);
    }
    throw error;
  }
}

// Fix workflow validation errors
async function fixWorkflowErrors(workflowJson, validationError, goal, plan, retryCount) {
  const prompt = `Fix this n8n workflow JSON. The validation error is: ${validationError}

GOAL: "${goal}"

WORKFLOW PLAN:
${plan}

CURRENT BROKEN JSON:
${JSON.stringify(workflowJson, null, 2)}

VALID NODE TYPES:
${VALID_NODE_TYPES.slice(0, 15).join(', ')}

Fix the JSON and output ONLY the corrected JSON, no explanations.`;

  const result = await model.generateContent(prompt);
  let jsonText = result.response.text().trim();

  // Clean up the response
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\s*/, '').replace(/```\s*$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\s*/, '').replace(/```\s*$/, '');
  }

  try {
    const fixedJson = JSON.parse(jsonText);
    return fixedJson;
  } catch (error) {
    throw new Error(`Failed to fix workflow: ${error.message}`);
  }
}

// Convert workflow JSON to React Flow format
function convertToReactFlow(workflowJson) {
  const nodes = workflowJson.nodes.map((node, index) => ({
    id: node.name,
    type: 'default',
    position: node.position || [index * 200, 100],
    data: {
      label: node.name,
      nodeType: node.type,
      parameters: node.parameters
    },
    style: {
      background: '#1a365d',
      color: '#ffffff',
      border: '2px solid #2d3748',
      borderRadius: '8px',
      padding: '10px'
    }
  }));

  const edges = [];
  Object.keys(workflowJson.connections).forEach(sourceNode => {
    if (workflowJson.connections[sourceNode].main) {
      workflowJson.connections[sourceNode].main.forEach((connectionArray, mainIndex) => {
        connectionArray.forEach((connection, index) => {
          edges.push({
            id: `${sourceNode}-${connection.node}-${mainIndex}-${index}`,
            source: sourceNode,
            target: connection.node,
            type: 'smoothstep',
            style: { stroke: '#4299e1', strokeWidth: 2 },
            markerEnd: { type: 'arrowclosed', color: '#4299e1' }
          });
        });
      });
    }
  });

  return { nodes, edges };
}

// Main agent function
async function run(input) {
  const { goal } = input;

  if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
    return {
      success: false,
      error: 'Please provide a valid workflow goal'
    };
  }

  try {
    // Step 1: Generate workflow plan
    console.log('Step 1: Generating workflow plan...');
    const plan = await generateWorkflowPlan(goal);

    // Step 2: Generate initial workflow JSON
    console.log('Step 2: Generating workflow JSON...');
    let workflowJson = await generateWorkflowJson(goal, plan);

    // Step 3-4: Validate and auto-fix (up to 3 retries)
    let validation = validateN8nWorkflow(workflowJson);
    let retryCount = 0;

    while (!validation.valid && retryCount < 3) {
      console.log(`Step 4: Fixing validation error (attempt ${retryCount + 1}): ${validation.error}`);
      workflowJson = await fixWorkflowErrors(workflowJson, validation.error, goal, plan, retryCount);
      validation = validateN8nWorkflow(workflowJson);
      retryCount++;
    }

    if (!validation.valid) {
      return {
        success: false,
        error: `Failed to generate valid workflow after ${retryCount} attempts: ${validation.error}`,
        plan: plan
      };
    }

    // Step 5: Convert to React Flow format
    console.log('Step 5: Converting to React Flow format...');
    const reactFlowData = convertToReactFlow(workflowJson);

    return {
      success: true,
      output: {
        workflowJson: workflowJson,
        reactFlowData: reactFlowData,
        plan: plan,
        validation: validation
      },
      cost: 0.05, // Estimated cost for multiple LLM calls
      time_ms: Date.now() - new Date().getTime()
    };

  } catch (error) {
    console.error('n8n Architect error:', error);
    return {
      success: false,
      error: `Failed to generate n8n workflow: ${error.message}`
    };
  }
}

module.exports = { run };