import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  Code,
  ShieldCheck
} from 'lucide-react';
import { fetchApiKeys, createApiKey, toggleApiKey, deleteApiKey } from '../services/api';

export default function ApiKeyManager({ onUpdateStats }) {
  const [keys, setKeys] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [keyRateLimit, setKeyRateLimit] = useState('1,000 req/min');
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [activeTab, setActiveTab] = useState('curl');

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    try {
      const res = await fetchApiKeys();
      if (res.success) {
        setKeys(res.keys);
      }
    } catch (err) {
      console.error('Failed to load API keys:', err);
    }
  }

  async function handleCreateKey(e) {
    e.preventDefault();
    if (!keyName.trim()) return;

    try {
      const res = await createApiKey({
        name: keyName.trim(),
        rateLimit: keyRateLimit
      });

      if (res.success) {
        setKeys(prev => [res.key, ...prev]);
        setShowCreateModal(false);
        setKeyName('');
        if (onUpdateStats) onUpdateStats();
      }
    } catch (err) {
      console.error('Failed to create key:', err);
    }
  }

  async function handleToggle(id) {
    try {
      const res = await toggleApiKey(id);
      if (res.success) {
        setKeys(prev => prev.map(k => k.id === id ? res.key : k));
        if (onUpdateStats) onUpdateStats();
      }
    } catch (err) {
      console.error('Failed to toggle key:', err);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteApiKey(id);
      setKeys(prev => prev.filter(k => k.id !== id));
      if (onUpdateStats) onUpdateStats();
    } catch (err) {
      console.error('Failed to delete key:', err);
    }
  }

  function handleCopy(text, id) {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  }

  const sampleKey = keys.find(k => k.status === 'active')?.key || 'nx_live_9a8f4c2e71d3e8b0a5f90124c7e8';

  const CODE_EXAMPLES = {
    curl: `curl -X POST https://api.nexus.dev/v1/chat/completions \\
  -H "Authorization: Bearer ${sampleKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "Claude 3.5 Sonnet",
    "messages": [{"role": "user", "content": "Explain zero-trust microservice architecture."}],
    "temperature": 0.7
  }'`,
    node: `import { NexusClient } from '@nexus/sdk';

const nexus = new NexusClient({
  apiKey: process.env.NEXUS_API_KEY || '${sampleKey}'
});

const response = await nexus.chat.create({
  model: 'Claude 3.5 Sonnet',
  messages: [{ role: 'user', content: 'Generate high-throughput API handler.' }],
  temperature: 0.5
});

console.log(response.choices[0].message.content);`,
    python: `from nexus import NexusClient

client = NexusClient(api_key="${sampleKey}")

response = client.chat.completions.create(
    model="Claude 3.5 Sonnet",
    messages=[{"role": "user", "content": "Analyze algorithmic complexity."}],
    temperature=0.6
)

print(response.choices[0].message.content)`
  };

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            API Credentials & Keys
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Secret tokens used to authenticate programmatic HTTP API requests from your backend services.
          </p>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
          style={{ padding: '6px 14px' }}
        >
          <Plus size={14} />
          <span>Create New Key</span>
        </button>
      </div>

      {/* Keys Table */}
      <div className="surface-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>Active Credentials ({keys.length})</h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-hairline)', color: 'var(--text-tertiary)' }}>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Key Label</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Secret Token</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Rate Limit</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Created</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Last Active</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '10px 12px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map(k => (
                <tr 
                  key={k.id}
                  style={{ borderBottom: '1px solid var(--border-hairline)' }}
                >
                  <td style={{ padding: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Key size={13} color="var(--text-secondary)" />
                      <span>{k.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <code style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.04)', padding: '2px 6px', borderRadius: '4px' }}>
                        {k.key.substring(0, 14)}••••••••
                      </code>
                      <button
                        onClick={() => handleCopy(k.key, k.id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                        title="Copy Key"
                      >
                        {copiedKeyId === k.id ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{k.rateLimit}</td>
                  <td style={{ padding: '12px', color: 'var(--text-tertiary)' }}>{k.createdAt}</td>
                  <td style={{ padding: '12px', color: 'var(--text-tertiary)' }}>{k.lastUsed}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={k.status === 'active' ? 'badge badge-emerald' : 'badge badge-amber'}>
                      {k.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        onClick={() => handleToggle(k.id)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--border-hairline)',
                          borderRadius: 'var(--radius-xs)',
                          padding: '3px 7px',
                          color: 'var(--text-secondary)',
                          fontSize: '0.7rem',
                          cursor: 'pointer'
                        }}
                      >
                        {k.status === 'active' ? 'Revoke' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(k.id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                        title="Delete key"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integration Code Snippets */}
      <div className="surface-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>SDK & API Integration</h2>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
              Call the unified endpoint using your choice of runtime.
            </p>
          </div>

          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-sm)',
            padding: '2px'
          }}>
            {['curl', 'node', 'python'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  background: activeTab === tab ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Code Box */}
        <div style={{ position: 'relative' }}>
          <pre style={{
            background: '#090A0D',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-xs)',
            padding: '14px 16px',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            overflowX: 'auto',
            lineHeight: 1.45,
            fontFamily: 'Geist Mono, monospace'
          }}>
            <code>{CODE_EXAMPLES[activeTab]}</code>
          </pre>
          <button
            onClick={() => handleCopy(CODE_EXAMPLES[activeTab], 'snippet')}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-xs)',
              padding: '3px 7px',
              color: 'var(--text-secondary)',
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            {copiedKeyId === 'snippet' ? <Check size={11} color="#10B981" /> : <Copy size={11} />}
            <span>{copiedKeyId === 'snippet' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>Create API Key</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Generate a secure key to authenticate your server-side requests.
            </p>

            <form onSubmit={handleCreateKey} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Key Description
                </label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. Production Backend Worker"
                  value={keyName}
                  onChange={e => setKeyName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Rate Limit
                </label>
                <select
                  className="custom-input"
                  value={keyRateLimit}
                  onChange={e => setKeyRateLimit(e.target.value)}
                >
                  <option value="200 req/min">Development (200 req/min)</option>
                  <option value="1,000 req/min">Production Standard (1,000 req/min)</option>
                  <option value="5,000 req/min">High Throughput (5,000 req/min)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
