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

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || 'forge_dev_secret_key_12345';

// POST /api/workflows/:id/run - execute workflow DAG
router.post('/:id/run', async (req, res) => {
  try {
    const { id } = req.params;
    const workflow = db.getWorkflowById(id);
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    let resultLogs = [];
    let durationMs = 0;
    let tokensConsumed = 0;

    // 1. Attempt execution in Python AI service
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const aiRes = await fetch(`${AI_SERVICE_URL}/workflows/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': INTERNAL_SERVICE_SECRET
        },
        body: JSON.stringify({
          id: workflow.id,
          name: workflow.name,
          trigger: workflow.trigger,
          nodes: workflow.nodes
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        resultLogs = aiData.logs || [];
        durationMs = aiData.durationMs || 0;
        tokensConsumed = aiData.tokensConsumed || 384;
      }
    } catch (err) {
      console.warn(`[Workflows] Real DAG runner unavailable, using local simulation: ${err.message}`);
    }

    // 2. Python AI service was unreachable — return honest error instead of fake logs.
    if (!resultLogs || resultLogs.length === 0) {
      return res.status(503).json({
        success: false,
        error: 'Python AI service is not reachable. Start it with `python ai/run.py` to execute real workflow DAGs.',
        workflowId: id
      });
    }

    workflow.lastRun = 'Just now';
    workflow.status = 'active';
    db.saveWorkflow(workflow);

    // Update system stats with real tokens consumed
    const stats = db.getStats();
    db.updateStats({
      apiCalls: stats.apiCalls + workflow.nodes.length,
      totalTokens: stats.totalTokens + tokensConsumed
    });

    db.logActivity({
      event: `Workflow Executed: ${workflow.name}`,
      detail: `Completed ${workflow.nodes.length} nodes in ${durationMs}ms. Consumed ${tokensConsumed} tokens.`,
      type: 'success'
    });

    res.json({
      success: true,
      workflowId: id,
      durationMs,
      logs: resultLogs,
      tokensConsumed,
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
