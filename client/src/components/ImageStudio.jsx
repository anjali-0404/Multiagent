import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Download, 
  Trash2, 
  Copy, 
  Check, 
  Maximize2, 
  Layers
} from 'lucide-react';
import { fetchImages, generateImage, deleteImage } from '../services/api';

const STYLE_PRESETS = [
  { id: 'Photorealistic', label: 'Photorealistic', desc: '8K macro photography' },
  { id: 'Cyberpunk', label: 'Cyberpunk', desc: 'Obsidian & neon accents' },
  { id: '3D Render', label: '3D Render', desc: 'Studio lighting, clean geometry' },
  { id: 'Anime & Manga', label: 'Illustration', desc: 'Stylized vector art' },
  { id: 'Cinematic Sci-Fi', label: 'Cinematic', desc: 'Atmospheric lighting' }
];

const PROMPT_SUGGESTIONS = [
  'Modern server rack cluster in a dark climate-controlled datacenter, subtle blue status LED indicator, high resolution macro',
  'Minimalist 3D data visualization glass cube floating over black background, studio lighting',
  'Quantum computing processor schematic on dark silicon substrate, hyper-detailed'
];

export default function ImageStudio({ onUpdateStats }) {
  const [images, setImages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Photorealistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [copiedPromptId, setCopiedPromptId] = useState(null);

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    try {
      const res = await fetchImages();
      if (res.success) {
        setImages(res.images);
      }
    } catch (err) {
      console.error('Failed to load images:', err);
    }
  }

  async function handleGenerate(e) {
    e?.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const res = await generateImage({
        prompt: prompt.trim(),
        style: selectedStyle,
        aspectRatio
      });

      if (res.success) {
        setImages(prev => [res.image, ...prev]);
        if (onUpdateStats) onUpdateStats();
      }
    } catch (err) {
      console.error('Image generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteImage(id);
      setImages(prev => prev.filter(i => i.id !== id));
      if (selectedImage?.id === id) {
        setSelectedImage(null);
      }
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  }

  function handleCopyPrompt(text, id) {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  }

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Asset & Media Generation
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Generate visual concepts, UI mockups, and illustrative assets with style presets.
        </p>
      </div>

      {/* Generator Box */}
      <div className="surface-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <textarea
              className="custom-input"
              rows={2}
              placeholder="Describe your visual concept in detail..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              style={{ fontSize: '0.86rem', resize: 'vertical' }}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="btn-accent"
              style={{ minWidth: '130px', justifyContent: 'center' }}
            >
              <span>{isGenerating ? 'Rendering...' : 'Generate'}</span>
            </button>
          </div>

          {/* Quick Idea Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>Presets:</span>
            {PROMPT_SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(sug)}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '3px 8px',
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {sug.substring(0, 40)}...
              </button>
            ))}
          </div>
        </div>

        {/* Style Selection Chips & Aspect Ratio */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-hairline)', paddingTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginRight: '4px' }}>Style:</span>
            {STYLE_PRESETS.map(style => {
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-xs)',
                    background: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--border-hover)' : 'transparent',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: '0.74rem',
                    cursor: 'pointer'
                  }}
                >
                  {style.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Ratio:</span>
            {['1:1', '16:9', '4:3'].map(ar => (
              <button
                key={ar}
                onClick={() => setAspectRatio(ar)}
                style={{
                  background: aspectRatio === ar ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  border: '1px solid',
                  borderColor: aspectRatio === ar ? 'var(--border-hover)' : 'transparent',
                  color: aspectRatio === ar ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                {ar}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="surface-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>Generated Assets ({images.length})</h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Cloud Storage</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {images.map(img => (
            <div
              key={img.id}
              style={{
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-hairline)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Image Preview Container */}
              <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden' }}>
                <img
                  src={img.url}
                  alt={img.prompt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span className="badge badge-neutral" style={{ position: 'absolute', top: '8px', left: '8px' }}>
                  {img.style}
                </span>
                <button
                  onClick={() => setSelectedImage(img)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '26px',
                    height: '26px',
                    borderRadius: '4px',
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                  title="Expand preview"
                >
                  <Maximize2 size={12} />
                </button>
              </div>

              {/* Card Meta */}
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-primary)', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {img.prompt}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-hairline)', paddingTop: '8px' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                    {img.aspectRatio} • {new Date(img.createdAt).toLocaleDateString()}
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleCopyPrompt(img.prompt, img.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                      title="Copy prompt"
                    >
                      {copiedPromptId === img.id ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                    </button>
                    <button
                      onClick={() => handleDelete(img.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                      title="Delete asset"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="modal-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px', padding: '20px' }}>
            <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '12px', maxHeight: '420px' }}>
              <img src={selectedImage.url} alt={selectedImage.prompt} style={{ width: '100%', maxHeight: '420px', objectFit: 'contain' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-neutral">{selectedImage.style}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Ratio: {selectedImage.aspectRatio}</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {selectedImage.prompt}
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <a
                  href={selectedImage.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="btn-primary"
                  style={{ textDecoration: 'none' }}
                >
                  <Download size={13} />
                  <span>Download</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
