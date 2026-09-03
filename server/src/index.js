import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import statsRouter from './routes/stats.js';
import chatRouter from './routes/chat.js';
import workflowsRouter from './routes/workflows.js';
import documentsRouter from './routes/documents.js';
import imagesRouter from './routes/images.js';
import apikeysRouter from './routes/apikeys.js';
import authRouter from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'FORGE AI Workspace Core Engine',
    version: '1.0.0'
  });
});

// Mount API Routes
app.use('/api/auth', authRouter);
app.use('/api/stats', statsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/workflows', workflowsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/images', imagesRouter);
app.use('/api/keys', apikeysRouter);

// Serve static frontend build if present (for production on Render / Vercel / Heroku)
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    } else {
      res.status(404).json({ success: false, error: 'Endpoint not found' });
    }
  });
} else {
  // 404 Handler when running in dev without dist
  app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, error: 'API endpoint not found' });
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 FORGE AI Workspace Server running on http://localhost:${PORT}`);
});
