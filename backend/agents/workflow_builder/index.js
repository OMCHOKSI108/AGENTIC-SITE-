const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class WorkflowBuilderAgent {
  async run(input) {
    try {
      const { trigger, workflow_definition } = input;

      if (!trigger && !workflow_definition) {
        throw new Error('Either a trigger or workflow definition is required');
      }

      if (workflow_definition) {
        // Execute or validate workflow
        const result = await this.executeWorkflow(workflow_definition);
        return {
          success: true,
          operation: 'execution',
          result: result,
          processed_at: new Date().toISOString()
        };
      } else {
        // Generate workflow from trigger
        const workflow = await this.generateWorkflow(trigger);
        return {
          success: true,
          operation: 'generation',
          result: workflow,
          processed_at: new Date().toISOString()
        };
      }

    } catch (error) {
      console.error('Workflow Builder Error:', error);
      return {
        success: false,
        error: error.message,
        operation: 'unknown',
        result: null
      };
    }
  }

  async generateWorkflow(trigger) {
    try {
      const prompt = `Create an automated workflow based on this trigger: "${trigger}"

Design a workflow that includes:
1. Trigger condition
2. Sequence of actions/steps
3. Conditional logic (if any)
4. Error handling
5. Success notifications

Provide the workflow in a structured format that can be executed automatically. Consider common business automation scenarios like email notifications, data processing, API calls, etc.

Format as JSON-like structure with steps, conditions, and actions.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.4,
        max_tokens: 1000,
      });

      const result = completion.choices[0]?.message?.content;

      if (!result) {
        throw new Error('No response from AI model');
      }

      // Parse and structure the workflow
      const workflow = this.parseWorkflow(result, trigger);

      return workflow;

    } catch (error) {
      throw new Error(`Workflow generation failed: ${error.message}`);
    }
  }

  parseWorkflow(response, trigger) {
    const workflow = {
      id: `workflow_${Date.now()}`,
      name: `Workflow for: ${trigger}`,
      trigger: trigger,
      steps: [],
      conditions: [],
      error_handling: {},
      notifications: []
    };

    const lines = response.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const lowerLine = line.toLowerCase().trim();

      if (lowerLine.includes('step') || lowerLine.includes('action')) {
        currentSection = 'steps';
      } else if (lowerLine.includes('condition')) {
        currentSection = 'conditions';
      } else if (lowerLine.includes('error') || lowerLine.includes('handling')) {
        currentSection = 'error_handling';
      } else if (lowerLine.includes('notification')) {
        currentSection = 'notifications';
      } else if (line.trim() && currentSection && !line.startsWith('#') && !line.startsWith('```')) {
        if (line.match(/^[-•*]\s/) || line.match(/^\d+\./)) {
          const item = line.replace(/^[-•*\d+.]+\s*/, '').trim();
          if (item.length > 5) {
            if (currentSection === 'steps') {
              workflow.steps.push({
                id: `step_${workflow.steps.length + 1}`,
                action: item,
                type: this.inferActionType(item)
              });
            } else {
              workflow[currentSection].push(item);
            }
          }
        }
      }
    }

    // Ensure we have at least basic structure
    if (workflow.steps.length === 0) {
      workflow.steps = [
        { id: 'step_1', action: 'Process trigger event', type: 'processing' },
        { id: 'step_2', action: 'Execute main action', type: 'execution' },
        { id: 'step_3', action: 'Send completion notification', type: 'notification' }
      ];
    }

    return workflow;
  }

  inferActionType(action) {
    const lowerAction = action.toLowerCase();

    if (lowerAction.includes('email') || lowerAction.includes('notify')) {
      return 'notification';
    } else if (lowerAction.includes('api') || lowerAction.includes('call')) {
      return 'api_call';
    } else if (lowerAction.includes('database') || lowerAction.includes('save')) {
      return 'data_operation';
    } else if (lowerAction.includes('condition') || lowerAction.includes('check')) {
      return 'conditional';
    } else {
      return 'processing';
    }
  }

  async executeWorkflow(workflowDefinition) {
    try {
      // Parse workflow definition if it's a string
      let workflow;
      if (typeof workflowDefinition === 'string') {
        try {
          workflow = JSON.parse(workflowDefinition);
        } catch (e) {
          // If not JSON, treat as simple workflow description
          workflow = {
            steps: workflowDefinition.split('\n').filter(line => line.trim())
          };
        }
      } else {
        workflow = workflowDefinition;
      }

      const executionLog = [];
      let success = true;

      // Execute each step (simulated)
      for (let i = 0; i < (workflow.steps || []).length; i++) {
        const step = workflow.steps[i];
        const stepResult = await this.executeStep(step);

        executionLog.push({
          step_id: step.id || `step_${i + 1}`,
          action: step.action || step,
          status: stepResult.success ? 'completed' : 'failed',
          duration: stepResult.duration,
          output: stepResult.output
        });

        if (!stepResult.success) {
          success = false;
          break;
        }
      }

      return {
        workflow_id: workflow.id || 'executed_workflow',
        total_steps: executionLog.length,
        completed_steps: executionLog.filter(log => log.status === 'completed').length,
        success: success,
        execution_log: executionLog,
        summary: success ? 'Workflow completed successfully' : 'Workflow failed during execution'
      };

    } catch (error) {
      throw new Error(`Workflow execution failed: ${error.message}`);
    }
  }

  async executeStep(step) {
    // Simulate step execution with realistic timing
    const executionTime = Math.random() * 2000 + 500; // 500-2500ms

    await new Promise(resolve => setTimeout(resolve, executionTime));

    // Simulate success/failure (90% success rate)
    const success = Math.random() > 0.1;

    return {
      success: success,
      duration: Math.round(executionTime),
      output: success ? `Step "${step.action || step}" executed successfully` : `Step "${step.action || step}" failed`
    };
  }
}

module.exports = new WorkflowBuilderAgent();
