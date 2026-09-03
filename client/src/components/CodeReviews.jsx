import React, { useState } from 'react';
import { 
  GitPullRequest, 
  CheckCircle2, 
  GitCommit, 
  FileCode2, 
  Bot, 
  MessageSquare, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  Code2
} from 'lucide-react';

const SUB_TABS = [
  { id: 'conversation', label: 'Conversation', count: null },
  { id: 'commits', label: 'Commits', count: 3 },
  { id: 'checks', label: 'Checks', count: 5 },
  { id: 'files', label: 'Files changed', count: 4 },
];

export default function CodeReviews() {
  const [activeTab, setActiveTab] = useState('conversation');
  const [userComment, setUserComment] = useState('');
  const [comments, setComments] = useState([]);

  function handlePostComment(e) {
    e.preventDefault();
    if (!userComment.trim()) return;
    setComments([...comments, {
      author: 'Arjun Developer',
      time: 'Just now',
      text: userComment.trim()
    }]);
    setUserComment('');
  }

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
            Pull Request #12
          </span>
          <span className="badge badge-success">
            <GitPullRequest size={13} />
            <span>Open</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#334155' }}>
            Add budget analytics API
          </h1>
          <span className="badge badge-success" style={{ fontSize: '0.74rem' }}>
            <CheckCircle2 size={12} />
            <span>All checks passed</span>
          </span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{
        display: 'flex',
        gap: '24px',
        borderBottom: '1px solid #E2E8F0',
        paddingBottom: '2px'
      }}>
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 0',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--primary)' : '#64748B',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span style={{
                fontSize: '0.72rem',
                background: activeTab === tab.id ? 'var(--primary-light)' : '#F1F5F9',
                color: activeTab === tab.id ? 'var(--primary)' : '#64748B',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Conversation View */}
      {activeTab === 'conversation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '820px' }}>
          {/* Reviewer Agent Review Card */}
          <div className="forge-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Reviewer Agent Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(124, 58, 237, 0.12)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.78rem'
                }}>
                  RA
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>Reviewer Agent</span>
                  <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>10:24 AM</span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.66rem', padding: '1px 6px' }}>bot</span>
                </div>
              </div>
            </div>

            {/* Review Feedback Message */}
            <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p>Great work! I've reviewed the changes and have a few suggestions:</p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#475569' }}>
                <li>Add input validation for amount field</li>
                <li>Consider using decimal for currency values</li>
                <li>Add unit tests for the new endpoint</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '8px' }}>
              <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                <span>View Full Review</span>
              </button>
            </div>
          </div>

          {/* User Comments List */}
          {comments.map((c, idx) => (
            <div key={idx} className="forge-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>{c.author}</span>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{c.time}</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.5 }}>{c.text}</p>
            </div>
          ))}

          {/* Reply Form */}
          <form onSubmit={handlePostComment} className="forge-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              className="custom-input"
              rows={3}
              placeholder="Leave a comment or reply to Reviewer Agent..."
              value={userComment}
              onChange={e => setUserComment(e.target.value)}
              style={{ resize: 'vertical', fontSize: '0.86rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.82rem' }}>
                Comment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Files Changed Sub-tab */}
      {activeTab === 'files' && (
        <div className="forge-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>Modified Files (4)</span>
          {[
            { name: 'controllers/analytics.py', changes: '+45 -3' },
            { name: 'schemas/budget.py', changes: '+28 -0' },
            { name: 'models/db.py', changes: '+12 -2' },
            { name: 'tests/test_analytics.py', changes: '+64 -0' }
          ].map((f, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0', fontSize: '0.82rem' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#0F172A', fontWeight: 600 }}>{f.name}</span>
              <span style={{ color: '#16A34A', fontWeight: 700 }}>{f.changes}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
