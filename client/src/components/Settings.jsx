import React, { useState } from 'react';
import { 
  Github, 
  MessageSquare, 
  Boxes, 
  Globe, 
  Database, 
  CheckCircle2, 
  Key, 
  Users, 
  AlertTriangle,
  Save,
  Check
} from 'lucide-react';

const SUB_TABS = ['General', 'Integrations', 'Team', 'Danger Zone'];

const INITIAL_INTEGRATIONS = [
  { id: 'github', name: 'GitHub', desc: 'Code repository and pull request automation', icon: Github, connected: true, color: '#24292F' },
  { id: 'slack', name: 'Slack', desc: 'Real-time multi-agent activity broadcasts and alerts', icon: MessageSquare, connected: true, color: '#E01E5A' },
  { id: 'docker', name: 'Docker Hub', desc: 'Automated container build and artifact push', icon: Boxes, connected: true, color: '#0DB7ED' },
  { id: 'vercel', name: 'Vercel', desc: 'Continuous deployment for frontend micro-apps', icon: Globe, connected: true, color: '#000000' },
  { id: 'postgres', name: 'PostgreSQL', desc: 'Managed database cluster for state persistence', icon: Database, connected: true, color: '#336791' }
];

export default function Settings({ project, user }) {
  const [activeTab, setActiveTab] = useState('Integrations');
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);
  const [projectName, setProjectName] = useState(project?.title || 'Expense Tracker SaaS');
  const [saved, setSaved] = useState(false);

  function toggleIntegration(id) {
    setIntegrations(integrations.map(i => {
      if (i.id === id) return { ...i, connected: !i.connected };
      return i;
    }));
  }

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Sub Tabs */}
      <div style={{
        display: 'flex',
        gap: '24px',
        borderBottom: '1px solid #E2E8F0',
        paddingBottom: '2px'
      }}>
        {SUB_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 0',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--primary)' : '#64748B',
              fontWeight: activeTab === tab ? 800 : 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Integrations View */}
      {activeTab === 'Integrations' && (
        <div className="forge-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '820px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>Connected Services & Webhooks</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {integrations.map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.color
                    }}>
                      <Icon size={18} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                        {item.desc}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleIntegration(item.id)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid',
                      borderColor: item.connected ? 'var(--success-border)' : '#CBD5E1',
                      background: item.connected ? 'var(--success-light)' : '#FFFFFF',
                      color: item.connected ? 'var(--success-text)' : '#64748B',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {item.connected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* General Settings View */}
      {activeTab === 'General' && (
        <form onSubmit={handleSave} className="forge-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>Project Preferences</h2>
          
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>Project Name</label>
            <input 
              type="text" 
              className="custom-input" 
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>Default Target Framework</label>
            <select className="custom-input" defaultValue="fastapi">
              <option value="fastapi">FastAPI + Next.js (Modern Fullstack)</option>
              <option value="node">Node.js Express + React</option>
              <option value="flutter">Python Backend + Flutter Mobile</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button type="submit" className="btn-primary">
              <Save size={14} />
              <span>{saved ? 'Saved!' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Team View */}
      {activeTab === 'Team' && (
        <div className="forge-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>Active Collaborators</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem' }}>
                {user?.initials || 'AD'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>{user?.name || 'Arjun Developer'} (You)</span>
                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{user?.email || 'arjun@example.com'}</span>
              </div>
            </div>
            <span className="badge badge-primary">Owner / Lead</span>
          </div>
        </div>
      )}

      {/* Danger Zone View */}
      {activeTab === 'Danger Zone' && (
        <div className="forge-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px', borderColor: '#FCA5A5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626' }}>
            <AlertTriangle size={18} />
            <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>Danger Zone</h2>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#64748B' }}>Once you delete a project, there is no going back. All multi-agent generated files, architecture graphs, and database snapshots will be deleted.</p>
          <button className="btn-secondary" style={{ color: '#DC2626', borderColor: '#FCA5A5', width: 'fit-content' }}>
            Delete this Project
          </button>
        </div>
      )}
    </div>
  );
}
