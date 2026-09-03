import React, { useState } from 'react';
import { 
  BarChart3, 
  Activity, 
  Clock, 
  GitBranch, 
  ArrowUpRight, 
  CheckCircle2, 
  RefreshCw,
  Terminal,
  Database,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';

export default function Dashboard({ stats, recentActivity, onSelectTab, onRefresh }) {
  const [timeRange, setTimeRange] = useState('7d');
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const tokenHistory = stats?.tokenHistory || [];
  const maxTokens = Math.max(...tokenHistory.map(t => t.tokens), 350000);

  const modelUsage = stats?.modelUsage || [
    { name: 'GPT-4o', percentage: 45, color: '#3B82F6', calls: '22,014 reqs' },
    { name: 'Claude 3.5 Sonnet', percentage: 30, color: '#10B981', calls: '14,676 reqs' },
    { name: 'DeepSeek R1', percentage: 15, color: '#8B5CF6', calls: '7,338 reqs' },
    { name: 'Gemini 1.5 Pro', percentage: 10, color: '#F59E0B', calls: '4,892 reqs' }
  ];

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Top Header & Range Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-blue">Nexus v2.4</span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Global Telemetry</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Infrastructure & Performance Overview
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Real-time metrics for LLM token ingestion, async pipeline workers, and edge retrieval latency.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Segmented Time Filter */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-sm)',
            padding: '3px'
          }}>
            {['24h', '7d', '30d', 'All'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  background: timeRange === range ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-xs)',
                  color: timeRange === range ? '#FFFFFF' : 'var(--text-dim)',
                  padding: '4px 12px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={onRefresh}
            className="btn-secondary"
            style={{ padding: '7px 12px' }}
            title="Refresh metrics"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* 4 Hero Metric Cards with Sparklines */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {/* Metric 1 */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Tokens Inferred</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} color="#60A5FA" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em' }}>
              {(stats?.totalTokens || 1428500).toLocaleString()}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem' }}>
            <span style={{ color: '#34D399', fontWeight: 600 }}>↑ 18.4%</span>
            <span style={{ color: 'var(--text-dim)' }}>vs prior 7 days</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>API Invocations</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={14} color="#34D399" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em' }}>
              {(stats?.apiCalls || 48920).toLocaleString()}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem' }}>
            <span style={{ color: '#34D399', fontWeight: 600 }}>99.98%</span>
            <span style={{ color: 'var(--text-dim)' }}>availability SLA</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>p95 Cluster Latency</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={14} color="#A5B4FC" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em' }}>
              {stats?.avgLatencyMs || 142}
            </span>
            <span style={{ fontSize: '0.86rem', color: 'var(--text-dim)', fontWeight: 600 }}>ms</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem' }}>
            <span style={{ color: '#60A5FA', fontWeight: 600 }}>-12ms</span>
            <span style={{ color: 'var(--text-dim)' }}>edge acceleration</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Pipelines</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GitBranch size={14} color="#FBBF24" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em' }}>
              {stats?.activeAgents || 12}
            </span>
            <span style={{ fontSize: '0.86rem', color: 'var(--text-dim)', fontWeight: 600 }}>DAGs</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem' }}>
            <span style={{ color: '#FBBF24', fontWeight: 600 }}>3 running</span>
            <span style={{ color: 'var(--text-dim)' }}>with 0 queue depth</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Token Velocity Graph & Model Capacity */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '18px' }}>
        {/* Token Velocity Chart */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>Token Velocity & Consumption</h2>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Daily token volume across all inference workers</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3B82F6' }} />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>Live Telemetry</span>
            </div>
          </div>

          {/* Clean Interactive SVG Bar / Curve Visualizer */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '160px', paddingTop: '16px', gap: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            {tokenHistory.map((item, idx) => {
              const heightPct = Math.round((item.tokens / maxTokens) * 100);
              const isSelected = hoveredIdx === idx || (hoveredIdx === null && idx === tokenHistory.length - 1);
              return (
                <div 
                  key={idx} 
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <div 
                    style={{
                      width: '100%',
                      maxWidth: '44px',
                      height: `${heightPct}%`,
                      background: isSelected 
                        ? 'linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)' 
                        : 'linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%)',
                      borderRadius: '6px 6px 2px 2px',
                      boxShadow: isSelected ? '0 0 16px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      cursor: 'pointer'
                    }}
                    title={`${item.date}: ${item.tokens.toLocaleString()} tokens ($${item.cost})`}
                  />
                  <span style={{ fontSize: '0.72rem', color: isSelected ? '#FFFFFF' : 'var(--text-dim)', fontWeight: isSelected ? 700 : 500 }}>
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Graph footer stats */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <span>Peak Daily: <strong>345,000 tokens</strong></span>
            <span>7-Day Run Rate: <strong>${((stats?.totalTokens || 1428500) * 0.000003).toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Model Capacity Distribution */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>Model Allocation</h2>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Compute capacity by architecture family</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {modelUsage.map((m, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-main)' }}>{m.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem', fontWeight: 500 }}>{m.calls}</span>
                    <span style={{ color: m.color }}>{m.percentage}%</span>
                  </div>
                </div>
                <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${m.percentage}%`, height: '100%', background: m.color, borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Workspaces Launchpad & Live Audit Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '18px' }}>
        {/* Core Workspaces Cards */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>Platform Workspaces</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div 
              onClick={() => onSelectTab('playground')}
              className="glass-card glass-card-interactive"
              style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Terminal size={14} color="#60A5FA" />
                </div>
                <ArrowUpRight size={14} color="var(--text-dim)" />
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-main)' }}>Prompt Studio</span>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>Test GPT-4o, Claude 3.5, & parameter tuning</p>
            </div>

            <div 
              onClick={() => onSelectTab('workflows')}
              className="glass-card glass-card-interactive"
              style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GitBranch size={14} color="#34D399" />
                </div>
                <ArrowUpRight size={14} color="var(--text-dim)" />
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-main)' }}>Pipelines & DAGs</span>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>Build multi-stage asynchronous agent workflows</p>
            </div>

            <div 
              onClick={() => onSelectTab('knowledge')}
              className="glass-card glass-card-interactive"
              style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(6, 182, 212, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Database size={14} color="#38BDF8" />
                </div>
                <ArrowUpRight size={14} color="var(--text-dim)" />
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-main)' }}>Vector Knowledge</span>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>Ingest corpus & test semantic similarity scoring</p>
            </div>

            <div 
              onClick={() => onSelectTab('images')}
              className="glass-card glass-card-interactive"
              style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(244, 63, 94, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={14} color="#FB7185" />
                </div>
                <ArrowUpRight size={14} color="var(--text-dim)" />
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-main)' }}>Asset Studio</span>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>Generate visual media & style presets</p>
            </div>
          </div>
        </div>

        {/* Live Audit Stream */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>Live Audit Stream</h2>
            <span style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 600 }}>● Connected</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '210px', overflowY: 'auto' }}>
            {(recentActivity || []).map(act => (
              <div 
                key={act.id} 
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {act.event}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {act.detail}
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                  {act.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
