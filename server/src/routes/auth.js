import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

function calculateInitials(name) {
  if (!name) return 'NX';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = db.getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const { password: _, ...safeUser } = user;
    db.logActivity({
      event: 'User Logged In',
      detail: `${user.name} (${user.role}) signed in successfully.`,
      type: 'info'
    });

    res.json({
      success: true,
      user: safeUser,
      token: `nx_jwt_${Date.now()}_${user.id}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/signup
router.post('/signup', (req, res) => {
  try {
    const { name, email, password, role = 'AI Developer' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'User with this email already exists' });
    }

    const initials = calculateInitials(name);
    const colors = [
      'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
      'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
      'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
    ];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      password,
      initials,
      avatarColor,
      createdAt: new Date().toISOString()
    };

    db.createUser(newUser);
    const { password: _, ...safeUser } = newUser;

    db.logActivity({
      event: 'New User Registered',
      detail: `${name} (${role}) created an account.`,
      type: 'success'
    });

    res.json({
      success: true,
      user: safeUser,
      token: `nx_jwt_${Date.now()}_${newUser.id}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  try {
    const users = db.getUsers();
    if (users.length > 0) {
      const { password: _, ...safeUser } = users[0];
      return res.json({ success: true, user: safeUser });
    }
    res.status(404).json({ success: false, error: 'No user session found' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/auth/profile - update current user profile (editable!)
router.put('/profile', (req, res) => {
  try {
    const { id, name, role, email } = req.body;
    const targetId = id || db.getUsers()[0]?.id;

    if (!targetId) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updates = {};
    if (name) {
      updates.name = name;
      updates.initials = calculateInitials(name);
    }
    if (role) updates.role = role;
    if (email) updates.email = email;

    const updated = db.updateUser(targetId, updates);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { password: _, ...safeUser } = updated;

    db.logActivity({
      event: 'Profile Updated',
      detail: `User profile updated: ${safeUser.name} (${safeUser.role})`,
      type: 'info'
    });

    res.json({ success: true, user: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
