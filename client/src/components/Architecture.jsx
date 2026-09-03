import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Download, 
  Layers, 
  Database, 
  Cpu, 
  Server, 
  Smartphone, 
  Globe, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Boxes
} from 'lucide-react';

const SUB_TABS = ['Overview', 'Architecture', 'Tech Stack', 'Database', 'Decisions'];

const KEY_DECISIONS = [
  'FastAPI for high performance APIs',
  'PostgreSQL for relational data',
  'Redis for caching and sessions',
  'Docker for containerization',
  'GitHub Actions for CI/CD'
];

export default function Architecture() {
  const [activeTab, setActiveTab] = useState('Architecture');

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Bar with Sub-tabs and Export */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          display: 'flex',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 'var(--radius-sm)',
          padding: '3px'
        }}>
          {SUB_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                background: activeTab === tab ? '#F1F5F9' : 'transparent',
                color: activeTab === tab ? '#0F172A' : '#64748B',
                fontWeight: activeTab === tab ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
          <Download size={14} color="#64748B" />
          <span>Export</span>
        </button>
      </div>

      {/* Main Content Grid: System Architecture Diagram + Summary Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '20px' }}>
        {/* System Architecture Node Diagram */}
        <div className="forge-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>System Architecture</h2>

          {/* Architecture Visual Grid */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            minHeight: '380px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            {/* Column 1: Clients */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', zIndex: 2 }}>
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #BFDBFE',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Globe size={16} color="#2563EB" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563EB' }}>Web App</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748B' }}>(Next.js)</span>
                </div>
              </div>

              <div style={{
                background: '#FFFFFF',
                border: '1px solid #BFDBFE',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Smartphone size={16} color="#2563EB" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563EB' }}>Mobile App</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748B' }}>(Flutter)</span>
                </div>
              </div>
            </div>

            {/* Column 2: Gateway */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 2 }}>
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: 'var(--radius-sm)',
                padding: '16px 20px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Server size={18} color="#0F172A" />
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A' }}>API Gateway</span>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>(FastAPI)</span>
              </div>
            </div>

            {/* Column 3: Microservices */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', zIndex: 2 }}>
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px'
              }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>Auth Service</span>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>(FastAPI)</span>
              </div>

              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px'
              }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>AI Service</span>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>(Python)</span>
              </div>
            </div>

            {/* Column 4: Storage */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', zIndex: 2 }}>
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Database size={16} color="#7C3AED" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>PostgreSQL</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748B' }}>(Database)</span>
                </div>
              </div>

              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Zap size={16} color="#EF4444" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>Redis</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748B' }}>(Cache)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Architecture Summary & Key Decisions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Summary Card */}
          <div className="forge-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A' }}>Architecture Summary</h3>
            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.6 }}>
              A modular monolithic architecture with clear separation of concerns. RESTful APIs with JWT authentication, PostgreSQL for data storage, Redis for caching and Celery for background jobs.
            </p>
          </div>

          {/* Key Decisions Card */}
          <div className="forge-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A' }}>Key Decisions</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {KEY_DECISIONS.map((dec, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 500 }}>
                    {dec}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
