import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// GET /api/workflows - list all agent workflows
router.get('/', (req, res) => {
  try {
    const workflows = db.getWorkflows();
    res.json({ success: true, workflows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/workflows - create or update workflow
router.post('/', (req, res) => {
  try {
    const { name, description, trigger, nodes, id } = req.body;
    const workflow = {
      id: id || `wf-${Date.now()}`,
      name: name || 'Untitled Agent Flow',
      description: description || 'Autonomous multi-step pipeline',
      trigger: trigger || 'Manual Trigger',
      status: 'active',
      lastRun: 'Never',
      nodes: nodes || [
        { id: 'node-1', type: 'trigger', label: 'HTTP Trigger', icon: 'Webhook', status: 'ready' },
        { id: 'node-2', type: 'llm', label: 'Reasoning Agent', icon: 'BrainCircuit', status: 'ready' },
        { id: 'node-3', type: 'action', label: 'Dispatch Response', icon: 'Send', status: 'ready' }
      ]
    };
    db.saveWorkflow(workflow);
    db.logActivity({
      event: 'Workflow Saved',
      detail: `Agent Pipeline "${workflow.name}" saved with ${workflow.nodes.length} nodes.`,
      type: 'info'
    });
    res.json({ success: true, workflow });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/workflows/:id/run - execute workflow simulation
router.post('/:id/run', async (req, res) => {
  try {
    const { id } = req.params;
    const workflow = db.getWorkflowById(id);
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    const logs = [];
    const startTime = Date.now();

    logs.push(`[${new Date().toLocaleTimeString()}] [INFO] Starting execution for pipeline "${workflow.name}" (ID: ${workflow.id})`);
    logs.push(`[${new Date().toLocaleTimeString()}] [TRIGGER] Ingesting payload from source: ${workflow.trigger}`);
    
    // Simulate node execution
    for (let i = 0; i < workflow.nodes.length; i++) {
      const node = workflow.nodes[i];
      logs.push(`[${new Date().toLocaleTimeString()}] [NODE ${i + 1}/${workflow.nodes.length}] Executing Step: "${node.label}" [${node.type.toUpperCase()}]`);
      if (node.type === 'rag') {
        logs.push(`[${new Date().toLocaleTimeString()}] [RAG] Queried top-3 vectors with cosine score 0.942. Context window expanded.`);
      } else if (node.type === 'llm') {
        logs.push(`[${new Date().toLocaleTimeString()}] [LLM] Dispatched inference to cluster. Generated 384 tokens with latency 180ms.`);
      } else if (node.type === 'tool') {
        logs.push(`[${new Date().toLocaleTimeString()}] [TOOL] Called external API connector. 200 OK received.`);
      } else if (node.type === 'action') {
        logs.push(`[${new Date().toLocaleTimeString()}] [ACTION] Outbound webhook payload delivered successfully. Response status: 200 OK.`);
      }
    }

    const durationMs = Date.now() - startTime + Math.floor(Math.random() * 200) + 150;
    logs.push(`[${new Date().toLocaleTimeString()}] [SUCCESS] Pipeline execution finished in ${durationMs}ms. Status: 0 errors.`);

    workflow.lastRun = 'Just now';
    workflow.status = 'active';
    db.saveWorkflow(workflow);

    // Update system stats
    const stats = db.getStats();
    db.updateStats({
      apiCalls: stats.apiCalls + workflow.nodes.length,
      totalTokens: stats.totalTokens + 384
    });

    db.logActivity({
      event: `Workflow Executed: ${workflow.name}`,
      detail: `Completed ${workflow.nodes.length} nodes in ${durationMs}ms.`,
      type: 'success'
    });

    res.json({
      success: true,
      workflowId: id,
      durationMs,
      logs,
      completedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/workflows/:id - delete workflow
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.deleteWorkflow(id);
    res.json({ success: true, message: 'Workflow deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
