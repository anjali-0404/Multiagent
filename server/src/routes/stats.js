import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// GET /api/stats - overview telemetry and metrics
router.get('/', (req, res) => {
  try {
    const stats = db.getStats();
    const activityLogs = db.getActivityLogs();
    res.json({
      success: true,
      stats,
      recentActivity: activityLogs.slice(0, 8)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/stats/reset - reset usage stats
router.post('/reset', (req, res) => {
  try {
    const stats = db.updateStats({
      totalTokens: 0,
      apiCalls: 0,
      currentSpendUsd: 0.0
    });
    db.logActivity({
      event: 'Telemetry Reset',
      detail: 'API counters and token consumption reset by admin.',
      type: 'warning'
    });
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
