import React, { useState, useEffect } from 'react';
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
  Zap,
  Terminal,
  RotateCcw,
  ExternalLink,
  Play,
  Check,
  AlertCircle
} from 'lucide-react';

const INITIAL_STAGES = [
  { id: 'build', name: 'Build', status: 'completed', duration: '24s', log: '✓ Docker image built: forge/expense-tracker:v1.2.0 (42.1MB)' },
  { id: 'tests', name: 'Tests', status: 'completed', duration: '12s', log: '✓ 56/56 unit and integration test assertions passed in 1.42s' },
  { id: 'security', name: 'Security Scan', status: 'completed', duration: '8s', log: '✓ 0 high/critical vulnerabilities found (Trivy & OWASP pass)' },
  { id: 'deploy', name: 'Deploy', status: 'completed', duration: '18s', log: '✓ Rolling update dispatched to 4 global edge regions with zero downtime' },
  { id: 'health', name: 'Health Check', status: 'completed', duration: '5s', log: '✓ HTTP 200 OK received from /api/health (p99 latency 142ms)' }
];

export default function Deployments() {
  const [stages, setStages] = useState(INITIAL_STAGES);
  const [isDeploying, setIsDeploying] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(-1);
  const [version, setVersion] = useState('v1.2.0');
  const [deployedAt, setDeployedAt] = useState('May 24, 2024 10:20 AM');
  const [logs, setLogs] = useState([
    '[10:20:01 AM] Triggered production deployment by Forge DevOps Agent',
    '[10:20:25 AM] Stage [Build] finished in 24s',
    '[10:20:37 AM] Stage [Tests] finished in 12s',
    '[10:20:45 AM] Stage [Security Scan] finished in 8s',
    '[10:21:03 AM] Stage [Deploy] finished in 18s',
    '[10:21:08 AM] Stage [Health Check] finished in 5s',
    '[10:21:09 AM] Deployment v1.2.0 is live and healthy across all edge clusters.'
  ]);
  const [activeTab, setActiveTab] = useState('overview');

  function handleRedeploy() {
    if (isDeploying) return;

    setIsDeploying(true);
    const nextVer = version.replace(/\d+$/, n => parseInt(n, 10) + 1);
    
    // Reset all stages to pending
    setStages(INITIAL_STAGES.map(s => ({ ...s, status: 'pending' })));
    setLogs([
      `[${new Date().toLocaleTimeString()}] Redeployment triggered for release ${nextVer}...`,
      `[${new Date().toLocaleTimeString()}] Pulling latest commit from main branch...`
    ]);

    let step = 0;
    setCurrentStageIdx(0);

    const interval = setInterval(() => {
      if (step < INITIAL_STAGES.length) {
        const stage = INITIAL_STAGES[step];
        
        // Update current stage to in-progress
        setStages(prev => prev.map((s, idx) => {
          if (idx < step) return { ...s, status: 'completed' };
          if (idx === step) return { ...s, status: 'in-progress' };
          return { ...s, status: 'pending' };
        }));

        setLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Executing stage [${stage.name}]...`,
          `[${new Date().toLocaleTimeString()}] ${stage.log.replace('v1.2.0', nextVer)}`
        ]);

        step++;
        setCurrentStageIdx(step);
      } else {
        clearInterval(interval);
        // All complete
        setStages(INITIAL_STAGES.map(s => ({ ...s, status: 'completed' })));
        setIsDeploying(false);
        setVersion(nextVer);
        setDeployedAt('Just now');
        setCurrentStageIdx(-1);
        setLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] 🎉 Deployment ${nextVer} completed successfully! Edge routing active.`
        ]);
      }
    }, 1100);
  }

  function handleRollback() {
    const prevVer = 'v1.2.0';
    setVersion(prevVer);
    setDeployedAt('Rolled back to v1.2.0 (Just now)');
    setLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Rolled back deployment to release ${prevVer}. Health verified.`
    ]);
  }

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
              Production Deployment
            </h1>
            <span className="badge badge-success">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }} />
              <span>{isDeploying ? 'Deploying...' : 'Live'}</span>
            </span>
          </div>
          <p style={{ fontSize: '0.86rem', color: '#64748B' }}>
            Multi-region edge cluster deployments with automated test verification and rollback guards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleRollback}
            disabled={isDeploying}
            className="btn-secondary"
            style={{ padding: '7px 14px', fontSize: '0.82rem' }}
          >
            <RotateCcw size={14} />
            <span>Rollback</span>
          </button>

          <button 
            onClick={handleRedeploy}
            disabled={isDeploying}
            className="btn-primary"
            style={{ padding: '7px 16px', fontSize: '0.82rem' }}
          >
            <Rocket size={14} className={isDeploying ? 'animate-spin' : ''} />
            <span>{isDeploying ? 'Deploying Pipeline...' : 'Redeploy Release'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {!isDeploying && deployedAt === 'Just now' && (
        <div style={{
          background: '#DCFCE7',
          border: '1px solid #BBF7D0',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#15803D',
          fontSize: '0.86rem',
          fontWeight: 600
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>Deployment {version} is live! All health checks and edge probes passed.</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#166534', fontFamily: 'JetBrains Mono, monospace' }}>0 downtime</span>
        </div>
      )}

      {/* Pipeline Stepper Card */}
      <div className="forge-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A' }}>
            CI/CD Pipeline ({version})
          </span>
          <span style={{ fontSize: '0.76rem', color: '#64748B', fontFamily: 'JetBrains Mono, monospace' }}>
            5 Stages • Automated Verification
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {/* Connector Line */}
          <div style={{
            position: 'absolute',
            left: '25px',
            right: '25px',
            top: '14px',
            height: '2px',
            background: isDeploying ? '#E2E8F0' : 'var(--success)',
            zIndex: 1
          }} />

          {stages.map((stage, idx) => {
            const isDone = stage.status === 'completed';
            const isCurrent = stage.status === 'in-progress';
            return (
              <div key={stage.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2 }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: isDone ? 'var(--success)' : isCurrent ? 'var(--primary)' : '#FFFFFF',
                  color: isDone || isCurrent ? '#FFFFFF' : '#94A3B8',
                  border: isDone ? 'none' : isCurrent ? '3px solid #DDD6FE' : '2px solid #CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  boxShadow: isDone ? '0 0 0 4px #DCFCE7' : isCurrent ? '0 0 0 4px rgba(124, 58, 237, 0.2)' : 'none',
                  transition: 'all 0.25s ease'
                }}>
                  {isDone ? <Check size={16} /> : isCurrent ? <RefreshCw size={14} className="animate-spin" /> : idx + 1}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isCurrent ? 'var(--primary)' : isDone ? '#0F172A' : '#94A3B8' }}>
                    {stage.name}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: isDone ? '#16A34A' : isCurrent ? 'var(--primary)' : '#94A3B8', fontWeight: 500 }}>
                    {isDone ? 'Passed' : isCurrent ? 'Running...' : 'Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Pipeline Terminal Logs */}
      <div className="forge-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#0F172A', color: '#F8FAFC' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1E293B', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={15} color="#A78BFA" />
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#F8FAFC', fontFamily: 'JetBrains Mono, monospace' }}>
              Deployment Terminal Stream
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
            <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>stdout/stderr</span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          maxHeight: '160px',
          overflowY: 'auto',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.76rem',
          color: '#CBD5E1',
          lineHeight: 1.5
        }}>
          {logs.map((line, idx) => (
            <div key={idx} style={{
              color: line.includes('🎉') ? '#34D399' : line.includes('✓') ? '#60A5FA' : '#94A3B8'
            }}>
              {line}
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
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'JetBrains Mono, monospace' }}>{version}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9', fontSize: '0.84rem' }}>
              <span style={{ color: '#64748B' }}>Deployed At</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>{deployedAt}</span>
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
              <span style={{ fontWeight: 700, color: '#0F172A' }}>99.98%</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9', fontSize: '0.84rem' }}>
              <span style={{ color: '#64748B' }}>Response Time</span>
              <span style={{ fontWeight: 700, color: '#0F172A', fontFamily: 'JetBrains Mono, monospace' }}>142ms</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: '#64748B' }}>Active Users</span>
              <span style={{ fontWeight: 700, color: '#0F172A' }}>134</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
