import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Upload, 
  Trash2, 
  FileText, 
  ArrowRight
} from 'lucide-react';
import { fetchDocuments, uploadDocument, searchKnowledgeBase, deleteDocument } from '../services/api';

export default function KnowledgeBase({ onUpdateStats }) {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('Architecture');
  const [docContent, setDocContent] = useState('');

  useEffect(() => {
    loadDocs();
  }, []);

  async function loadDocs() {
    try {
      const res = await fetchDocuments();
      if (res.success) {
        setDocuments(res.documents);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  }

  async function handleSearch(e) {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await searchKnowledgeBase(searchQuery.trim());
      if (res.success) {
        setSearchResults(res.results);
        if (onUpdateStats) onUpdateStats();
      }
    } catch (err) {
      console.error('Failed to search knowledge base:', err);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;

    try {
      const res = await uploadDocument({
        title: docTitle,
        category: docCategory,
        content: docContent
      });

      if (res.success) {
        setDocuments(prev => [res.document, ...prev]);
        setShowUploadModal(false);
        setDocTitle('');
        setDocContent('');
        if (onUpdateStats) onUpdateStats();
      }
    } catch (err) {
      console.error('Failed to upload document:', err);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  }

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Vector Knowledge Base
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Manage indexed documentation, vector embeddings, and test cosine similarity queries.
          </p>
        </div>

        <button 
          onClick={() => setShowUploadModal(true)}
          className="btn-primary"
          style={{ padding: '6px 14px' }}
        >
          <Upload size={14} />
          <span>Ingest Document</span>
        </button>
      </div>

      {/* Semantic Vector Search Bar */}
      <div className="surface-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>Semantic Vector Query Tester</h2>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
            Execute real-time similarity score searches against the indexed 1536-dimensional HNSW index.
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            <input
              type="text"
              className="custom-input"
              placeholder="e.g. mTLS zero-trust communication, latency SLA guarantee..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.84rem' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={isSearching || !searchQuery.trim()}
            className="btn-secondary"
            style={{ padding: '0 16px', height: '38px' }}
          >
            <span>{isSearching ? 'Searching...' : 'Search Index'}</span>
          </button>
        </form>

        {/* Results */}
        {searchResults.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Ranked Vector Matches for "{searchQuery}"
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
              {searchResults.map((res, idx) => (
                <div 
                  key={idx}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-hairline)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {res.title}
                    </span>
                    <span className="badge badge-blue">
                      {(res.similarityScore * 100).toFixed(1)}% score
                    </span>
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    "{res.snippet}"
                  </p>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Category: {res.category}</span>
                    <span>Model: {res.vectorModel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ingested Documents Table */}
      <div className="surface-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>Indexed Corpus ({documents.length} Files)</h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>HNSW Index: Online</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-hairline)', color: 'var(--text-tertiary)' }}>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Document Name</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Category</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Chunks</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Embeddings</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Size</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '10px 12px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr 
                  key={doc.id}
                  style={{ borderBottom: '1px solid var(--border-hairline)' }}
                >
                  <td style={{ padding: '12px', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={14} color="var(--text-secondary)" />
                    <span>{doc.title}</span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{doc.category}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                    <span className="badge badge-neutral">{doc.chunksCount} chunks</span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-tertiary)', fontFamily: 'Geist Mono, monospace', fontSize: '0.72rem' }}>
                    {doc.embeddingsModel}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-tertiary)' }}>{doc.size}</td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-emerald">Indexed</span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                      title="Delete document"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>Ingest Knowledge Document</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Text will be split into 250-word sliding window chunks and converted to 1536-dimensional embeddings.
            </p>

            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Document Title
                </label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. Security Policy & OAuth2 Guidelines"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Category
                </label>
                <select
                  className="custom-input"
                  value={docCategory}
                  onChange={e => setDocCategory(e.target.value)}
                >
                  <option value="Architecture">Architecture & Infrastructure</option>
                  <option value="Security">Security & Cryptography</option>
                  <option value="API Specs">API Documentation</option>
                  <option value="Legal & Privacy">Compliance & Legal</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Document Content
                </label>
                <textarea
                  className="custom-input"
                  rows={5}
                  placeholder="Paste documentation text here..."
                  value={docContent}
                  onChange={e => setDocContent(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Vectorize & Ingest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
