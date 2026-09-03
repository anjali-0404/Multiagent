import express from 'express';
import { db } from '../db/database.js';
import { chunkText, searchVectors } from '../services/ragService.js';

const router = express.Router();

// GET /api/documents - list all documents
router.get('/', (req, res) => {
  try {
    const documents = db.getDocuments();
    res.json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/documents - upload/ingest document
router.post('/', (req, res) => {
  try {
    const { title, category, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required' });
    }

    const chunks = chunkText(content);
    const newDoc = {
      id: `doc-${Date.now()}`,
      title,
      category: category || 'General',
      chunksCount: Math.max(1, chunks.length),
      embeddingsModel: 'text-embedding-3-large',
      uploadedAt: new Date().toISOString(),
      size: `${Math.ceil(content.length / 1024)} KB`,
      status: 'indexed',
      content
    };

    db.addDocument(newDoc);
    db.logActivity({
      event: 'Document Ingested (RAG)',
      detail: `Indexed "${title}" into ${newDoc.chunksCount} chunks with 1536-dim embeddings.`,
      type: 'success'
    });

    res.json({ success: true, document: newDoc, chunksSample: chunks.slice(0, 3) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/documents/search - semantic search against knowledge base
router.post('/search', (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }

    const docs = db.getDocuments();
    const results = searchVectors(query, docs);

    db.logActivity({
      event: 'Semantic Vector Query',
      detail: `Search "${query.slice(0, 30)}..." returned ${results.length} ranked matches.`,
      type: 'info'
    });

    res.json({ success: true, query, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/documents/:id - delete document
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.deleteDocument(id);
    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
