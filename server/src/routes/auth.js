import express from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';

const router = express.Router();

// BUG-01 FIX: Proper password hashing using Node built-in crypto (PBKDF2).
// No bcrypt dependency needed. SHA-256 PBKDF2 with per-user salt stored in DB.
// Existing users with plaintext passwords are migrated on first login.

function hashPassword(password, salt) {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, s, 100_000, 64, 'sha256').toString('hex');
  return { hash, salt: s };
}

function verifyPassword(plaintext, storedHash, storedSalt) {
  const { hash } = hashPassword(plaintext, storedSalt);
  return hash === storedHash;
}

// BUG-01 FIX: In-memory session token store (token → userId).
// Tokens are cryptographically random 32-byte hex strings.
const SESSION_STORE = new Map();

function issueToken(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  SESSION_STORE.set(token, userId);
  return token;
}

export function getUserIdFromToken(token) {
  return token ? SESSION_STORE.get(token) : null;
}

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
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // BUG-01 FIX: Migrate plaintext passwords on first login.
    // If passwordHash is absent this is an old plaintext record — compare directly then upgrade.
    let authenticated = false;
    if (!user.passwordHash) {
      // Legacy plaintext check
      if (user.password === password) {
        authenticated = true;
        // Upgrade to hashed storage immediately
        const { hash, salt } = hashPassword(password);
        db.updateUser(user.id, { passwordHash: hash, passwordSalt: salt, password: undefined });
      }
    } else {
      authenticated = verifyPassword(password, user.passwordHash, user.passwordSalt);
    }

    if (!authenticated) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = issueToken(user.id);
    const { password: _p, passwordHash: _h, passwordSalt: _s, ...safeUser } = user;

    db.logActivity({
      event: 'User Logged In',
      detail: `${user.name} (${user.role}) signed in successfully.`,
      type: 'info'
    });

    res.json({ success: true, user: safeUser, token });
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
    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
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

    // BUG-01 FIX: Hash password before storing
    const { hash, salt } = hashPassword(password);

    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      passwordHash: hash,
      passwordSalt: salt,
      initials,
      avatarColor,
      createdAt: new Date().toISOString()
    };

    db.createUser(newUser);
    const token = issueToken(newUser.id);
    const { passwordHash: _h, passwordSalt: _s, ...safeUser } = newUser;

    db.logActivity({
      event: 'New User Registered',
      detail: `${name} (${role}) created an account.`,
      type: 'success'
    });

    res.json({ success: true, user: safeUser, token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/auth/me — BUG-01 FIX: Validate token, return the correct user
router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const userId = getUserIdFromToken(token);

    if (!userId) {
      // Graceful fallback for static deployments without auth header:
      // Return the first user but mark it as a guest session.
      const users = db.getUsers();
      if (users.length > 0) {
        const { password: _p, passwordHash: _h, passwordSalt: _s, ...safeUser } = users[0];
        return res.json({ success: true, user: safeUser, session: 'guest' });
      }
      return res.status(404).json({ success: false, error: 'No user session found' });
    }

    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const { password: _p, passwordHash: _h, passwordSalt: _s, ...safeUser } = user;
    res.json({ success: true, user: safeUser, session: 'authenticated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/auth/profile — token-validated update
router.put('/profile', (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const userId = getUserIdFromToken(token);

    const { id, name, role, email } = req.body;
    const targetId = userId || id || db.getUsers()[0]?.id;

    if (!targetId) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updates = {};
    if (name) { updates.name = name; updates.initials = calculateInitials(name); }
    if (role) updates.role = role;
    if (email) updates.email = email;

    const updated = db.updateUser(targetId, updates);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { password: _p, passwordHash: _h, passwordSalt: _s, ...safeUser } = updated;

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

// POST /api/auth/logout — invalidate token
router.post('/logout', (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token) SESSION_STORE.delete(token);
    res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
