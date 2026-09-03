import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Rocket, 
  Activity, 
  Server, 
  ShieldCheck, 
  Clock, 
  Users, 
  ArrowUpRight,
  RefreshCw,
  Zap
} from 'lucide-react';

export default function Deployments() {
  const [isDeploying, setIsDeploying] = useState(false);

  const pipelineStages = [
    { name: 'Build', status: 'completed' },
    { name: 'Tests', status: 'completed' },
    { name: 'Security Scan', status: 'completed' },
    { name: 'Deploy', status: 'completed' },
    { name: 'Health Check', status: 'completed' }
  ];

  function handleTriggerDeploy() {
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
    }, 1200);
  }

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
            Production Deployment
          </h1>
          <span className="badge badge-success">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }} />
            <span>Live</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleTriggerDeploy}
            disabled={isDeploying}
            className="btn-primary"
            style={{ padding: '7px 14px', fontSize: '0.82rem' }}
          >
            <Rocket size={14} />
            <span>{isDeploying ? 'Deploying...' : 'Redeploy'}</span>
          </button>
          <button className="btn-secondary" style={{ padding: '7px 14px', fontSize: '0.82rem' }}>
            <span>View Pipeline</span>
          </button>
        </div>
      </div>

      {/* Pipeline Stepper Card */}
      <div className="forge-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {/* Connector Line */}
          <div style={{
            position: 'absolute',
            left: '25px',
            right: '25px',
            top: '14px',
            height: '2px',
            background: 'var(--success)',
            zIndex: 1
          }} />

          {pipelineStages.map((stage, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2 }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--success)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 0 4px #DCFCE7'
              }}>
                <CheckCircle2 size={16} />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                {stage.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom 2 Panels: Deployment Info & Application Health */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Deployment Info */}
        <div className="forge-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A' }}>Deployment Info</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9', fontSize: '0.84rem' }}>
              <span style={{ color: '#64748B' }}>Environment</span>
              <span style={{ fontWeight: 700, color: '#0F172A' }}>Production</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9', fontSize: '0.84rem' }}>
              <span style={{ color: '#64748B' }}>Version</span>
              <span style={{ fontWeight: 700, color: '#0F172A', fontFamily: 'JetBrains Mono, monospace' }}>v1.2.0</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9', fontSize: '0.84rem' }}>
              <span style={{ color: '#64748B' }}>Deployed At</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>May 24, 2024 10:20 AM</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: '#64748B' }}>Deployed By</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Forge DevOps Agent</span>
            </div>
          </div>
        </div>

        {/* Application Health */}
        <div className="forge-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A' }}>Application Health</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9', fontSize: '0.84rem' }}>
              <span style={{ color: '#64748B' }}>Status</span>
              <span className="badge badge-success">+ Healthy</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9', fontSize: '0.84rem' }}>
              <span style={{ color: '#64748B' }}>Uptime</span>
              <span style={{ fontWeight: 700, color: '#0F172A' }}>99.9%</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9', fontSize: '0.84rem' }}>
              <span style={{ color: '#64748B' }}>Response Time</span>
              <span style={{ fontWeight: 700, color: '#0F172A', fontFamily: 'JetBrains Mono, monospace' }}>182ms</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: '#64748B' }}>Active Users</span>
              <span style={{ fontWeight: 700, color: '#0F172A' }}>128</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
