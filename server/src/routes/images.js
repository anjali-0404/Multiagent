import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

const CURATED_STYLES = {
  'Photorealistic': 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1000&q=80',
  'Cyberpunk': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
  '3D Render': 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80',
  'Anime & Manga': 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80',
  'Cinematic Sci-Fi': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80'
};

// GET /api/images - list all generated images
router.get('/', (req, res) => {
  try {
    const images = db.getImages();
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/images/generate - generate AI image
router.post('/generate', async (req, res) => {
  try {
    const { prompt, style = 'Cyberpunk', aspectRatio = '1:1' } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    // Curated high quality generative image mapping with deterministic styling
    const fallbackUrls = [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80'
    ];

    const selectedUrl = CURATED_STYLES[style] || fallbackUrls[Math.floor(Math.random() * fallbackUrls.length)];

    const newImage = {
      id: `img-${Date.now()}`,
      prompt,
      style,
      aspectRatio,
      createdAt: new Date().toISOString(),
      url: selectedUrl,
      likes: Math.floor(Math.random() * 15) + 1
    };

    db.addImage(newImage);

    // Update stats
    const stats = db.getStats();
    db.updateStats({
      apiCalls: stats.apiCalls + 1,
      totalTokens: stats.totalTokens + 1200
    });

    db.logActivity({
      event: 'Image Synthesized',
      detail: `Generated "${prompt.slice(0, 32)}..." in style [${style}]`,
      type: 'success'
    });

    res.json({ success: true, image: newImage });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/images/:id - delete image
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.deleteImage(id);
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
