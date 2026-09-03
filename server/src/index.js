import express from 'express';
import cors from 'cors';
import statsRouter from './routes/stats.js';
import chatRouter from './routes/chat.js';
import workflowsRouter from './routes/workflows.js';
import documentsRouter from './routes/documents.js';
import imagesRouter from './routes/images.js';
import apikeysRouter from './routes/apikeys.js';

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
    service: 'NexusAI Studio Core Engine',
    version: '1.0.0'
  });
});

// Mount Routes
app.use('/api/stats', statsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/workflows', workflowsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/images', imagesRouter);
app.use('/api/keys', apikeysRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 NexusAI Studio Backend running on http://localhost:${PORT}`);
});
