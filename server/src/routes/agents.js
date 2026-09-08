import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || 'forge_dev_secret_key_12345';

// POST /api/agents/run - trigger asynchronous multi-agent loop (HTTP 202)
router.post('/run', async (req, res) => {
  try {
    const { goal, projectName, category, idempotencyKey, createGithubRepo, githubToken } = req.body;
    if (!goal) {
      return res.status(400).json({ success: false, error: 'Goal description is required.' });
    }

    const payload = {
      goal,
      projectName: projectName || 'FORGE Project',
      category: category || 'web',
      idempotencyKey,
      createGithubRepo: Boolean(createGithubRepo),
      githubToken
    };

    // Forward to FastAPI background runner
    const aiRes = await fetch(`${AI_SERVICE_URL}/agents/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': INTERNAL_SERVICE_SECRET
      },
      body: JSON.stringify(payload)
    });

    if (!aiRes.ok) {
      const errData = await aiRes.json().catch(() => ({}));
      return res.status(aiRes.status).json({
        success: false,
        error: errData.detail || 'Failed to trigger agent execution in AI microservice.'
      });
    }

    const jobData = await aiRes.json();

    db.logActivity({
      event: `Agent Job Queued`,
      detail: `Queued execution for goal: "${goal.substring(0, 45)}..." (Job: ${jobData.jobId})`,
      type: 'info'
    });

    return res.status(202).json({
      success: true,
      ...jobData
    });
  } catch (error) {
    console.error('Agents run error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/agents/runs/:jobId - poll status, progress, step logs, and blueprint
router.get('/runs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    const aiRes = await fetch(`${AI_SERVICE_URL}/agents/runs/${jobId}`, {
      headers: {
        'X-Internal-Secret': INTERNAL_SERVICE_SECRET
      }
    });

    if (!aiRes.ok) {
      return res.status(aiRes.status).json({ success: false, error: `Job '${jobId}' not found.` });
    }

    const jobStatus = await aiRes.json();

    // If newly completed, sync agent steps into db.logActivity
    if (jobStatus.status === 'completed' && jobStatus.logs && jobStatus.logs.length > 0) {
      // Sync latest step log if not already logged
      const latestLog = jobStatus.logs[jobStatus.logs.length - 1];
      if (latestLog && !jobStatus._hasLoggedCompletion) {
        jobStatus._hasLoggedCompletion = true;
        db.logActivity({
          event: `${latestLog.agent}: ${latestLog.action}`,
          detail: latestLog.detail,
          type: latestLog.type || 'success'
        });
      }
    }

    res.json({
      success: true,
      job: jobStatus
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
