import express from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';

const router = express.Router();

// GET /api/keys - list all API keys
router.get('/', (req, res) => {
  try {
    const keys = db.getApiKeys();
    res.json({ success: true, keys });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/keys - generate a new API key
router.post('/', (req, res) => {
  try {
    const { name = 'Production App Key', rateLimit = '1,000 req/min' } = req.body;
    const randomHex = crypto.randomBytes(16).toString('hex');
    const newKey = {
      id: `key-${Date.now()}`,
      name,
      key: `nx_live_${randomHex}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      rateLimit,
      status: 'active'
    };

    db.addApiKey(newKey);
    db.logActivity({
      event: 'API Key Generated',
      detail: `Created new token "${name}" (${newKey.key.substring(0, 12)}...)`,
      type: 'warning'
    });

    res.json({ success: true, key: newKey });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/keys/:id/toggle - revoke or activate key
router.post('/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    const updated = db.revokeApiKey(id);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Key not found' });
    }
    db.logActivity({
      event: `API Key ${updated.status === 'active' ? 'Re-activated' : 'Revoked'}`,
      detail: `Key ${updated.name} is now ${updated.status}.`,
      type: 'info'
    });
    res.json({ success: true, key: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/keys/:id - delete API key
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.deleteApiKey(id);
    res.json({ success: true, message: 'Key deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
