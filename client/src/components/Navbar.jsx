import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  ChevronDown, 
  CreditCard, 
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Command,
  Activity
} from 'lucide-react';

export default function Navbar({ stats, recentActivity, onOpenBilling, onTabChange }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [env, setEnv] = useState('Production (us-east-1)');

  const budgetPct = stats ? Math.min(100, Math.round((stats.currentSpendUsd / stats.monthlyBudgetUsd) * 100)) : 29;

  return (
    <header style={{
      height: '62px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(9, 11, 16, 0.75)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Left: Organization & Environment */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.78rem',
            fontWeight: 800,
            color: '#fff',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)'
          }}>
            N
          </div>
          <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
            Nexus Enterprise
          </span>
          <ChevronDown size={14} color="var(--text-dim)" />
        </div>

        {/* Live Cluster Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          fontSize: '0.74rem',
          color: 'var(--text-muted)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)'
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 8px #10B981'
          }} />
          <span>us-east-1</span>
          <span style={{ color: 'var(--text-dark)' }}>•</span>
          <span style={{ color: '#34D399', fontWeight: 600 }}>{stats?.avgLatencyMs || 142}ms</span>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-card)',
        padding: '6px 14px',
        borderRadius: 'var(--radius-full)',
        width: '340px',
        color: 'var(--text-dim)',
        fontSize: '0.8rem',
        cursor: 'pointer',
        transition: 'all 0.18s ease'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-card-hover)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-card)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
      }}
      >
        <Search size={14} />
        <span style={{ flex: 1 }}>Search commands, models, runs...</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(255, 255, 255, 0.06)', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
          <Command size={10} />
          <span>K</span>
        </div>
      </div>

      {/* Right: Spending, Upgrade & User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Usage Gauge */}
        <button
          onClick={onOpenBilling}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-sm)',
            padding: '5px 12px',
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-card-hover)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-card)'}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Spend</span>
              <strong style={{ color: 'var(--text-main)' }}>${stats?.currentSpendUsd?.toFixed(2) || '43.65'}</strong>
            </div>
            <div style={{ width: '70px', height: '3px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${budgetPct}%`, height: '100%', background: 'linear-gradient(90deg, #3B82F6, #10B981)' }} />
            </div>
          </div>
        </button>

        {/* Upgrade Button */}
        <button
          onClick={onOpenBilling}
          className="btn-accent"
          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
        >
          <span>Upgrade Tier</span>
          <ArrowUpRight size={13} />
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: showNotifications ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.18s ease'
            }}
          >
            <Bell size={15} />
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '46px',
              width: '340px',
              background: '#10131C',
              border: '1px solid var(--border-card-hover)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
              padding: '16px',
              zIndex: 50
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-main)' }}>Live Audit Stream</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Realtime Event Log</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                {(recentActivity || []).slice(0, 5).map(act => (
                  <div key={act.id} style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>{act.event}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{act.time}</span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{act.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          paddingLeft: '6px',
          borderLeft: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--text-main)'
          }}>
            AC
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Alex Chen</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Core Architect</span>
          </div>
        </div>
      </div>
    </header>
  );
}
