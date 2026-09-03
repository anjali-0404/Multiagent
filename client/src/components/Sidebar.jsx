import React from 'react';
import { 
  BarChart3, 
  Terminal, 
  GitBranch, 
  Database, 
  Sparkles, 
  KeyRound, 
  CreditCard,
  Server,
  Layers,
  Cpu
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview', icon: BarChart3, badge: null },
  { id: 'playground', label: 'Prompt Studio', icon: Terminal, badge: 'v2.4' },
  { id: 'workflows', label: 'Pipelines & DAGs', icon: GitBranch, badge: '3 active' },
  { id: 'knowledge', label: 'Vector Index', icon: Database, badge: null },
  { id: 'images', label: 'Asset Studio', icon: Sparkles, badge: null },
  { id: 'apikeys', label: 'API Credentials', icon: KeyRound, badge: null },
];

export default function Sidebar({ currentTab, onSelectTab, onOpenBilling }) {
  return (
    <aside style={{
      width: '240px',
      background: 'rgba(9, 11, 16, 0.95)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px 12px',
      userSelect: 'none'
    }}>
      {/* Top Brand & Nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Workspace Brand Monogram */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '4px 8px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}>
            <Cpu size={17} color="#FFFFFF" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Nexus Studio
            </span>
            <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              AI Infrastructure
            </span>
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, paddingLeft: '8px', marginBottom: '4px' }}>
            Platform Modules
          </span>

          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: isActive ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                  background: isActive ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.03) 100%)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.16s ease',
                  textAlign: 'left',
                  position: 'relative'
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  if (!isActive) e.currentTarget.style.color = 'var(--text-main)';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                  if (!isActive) e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: '-2px',
                    top: '25%',
                    height: '50%',
                    width: '3px',
                    borderRadius: '2px',
                    background: '#3B82F6',
                    boxShadow: '0 0 8px #3B82F6'
                  }} />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={16} color={isActive ? '#60A5FA' : 'var(--text-dim)'} />
                  <span style={{ fontSize: '0.84rem', fontWeight: isActive ? 600 : 500 }}>
                    {item.label}
                  </span>
                </div>
                {item.badge && (
                  <span className={item.badge === 'v2.4' ? 'badge badge-blue' : 'badge badge-emerald'} style={{ fontSize: '0.66rem', padding: '1px 6px' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Node Status Card */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={14} color="#10B981" />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Edge Shard v1.4
            </span>
          </div>
          <span style={{ fontSize: '0.68rem', color: '#34D399', fontWeight: 600 }}>Active</span>
        </div>

        <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
          Vector DB synced across 4 global regions with zero replication lag.
        </p>

        <button
          onClick={onOpenBilling}
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            padding: '6px 10px',
            color: 'var(--text-main)',
            fontSize: '0.76rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-card-hover)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
        >
          <CreditCard size={13} color="var(--text-muted)" />
          <span>Billing & Limits</span>
        </button>
      </div>
    </aside>
  );
}
