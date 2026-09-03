import React from 'react';
import { 
  LayoutDashboard, 
  FolderGit2, 
  Bot, 
  CheckSquare, 
  Rocket, 
  Puzzle, 
  Settings,
  Flame,
  ChevronRight,
  Sparkles,
  GitPullRequest,
  Layers
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'onboarding', label: 'Create Project', icon: Sparkles, badge: 'New' },
  { id: 'agents', label: 'Agent Activity', icon: Bot },
  { id: 'architecture', label: 'Plan & Architecture', icon: Layers },
  { id: 'tasks', label: 'Tasks & Issues', icon: CheckSquare },
  { id: 'reviews', label: 'Code & Reviews', icon: GitPullRequest },
  { id: 'deployments', label: 'Deployments', icon: Rocket },
  { id: 'integrations', label: 'Integrations', icon: Puzzle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ currentTab, onSelectTab, onOpenProfile, user }) {
  const name = user?.name || 'Arjun Developer';
  const email = user?.email || 'arjun@example.com';
  const initials = user?.initials || 'AD';
  const avatarColor = user?.avatarColor || 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)';

  return (
    <aside style={{
      width: '240px',
      minWidth: '240px',
      background: '#0F172A',
      color: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px 14px',
      height: '100vh',
      userSelect: 'none'
    }}>
      {/* Top Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* FORGE Logo Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '2px 8px'
        }}>
          {/* Anvil / Forge Monogram Icon */}
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)'
          }}>
            <Flame size={19} color="#FFFFFF" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.03em', color: '#FFFFFF' }}>
              FORGE
            </span>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.color = '#F8FAFC';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#94A3B8';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={17} color={isActive ? '#FFFFFF' : '#64748B'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span style={{
                    fontSize: '0.65rem',
                    background: 'rgba(124, 58, 237, 0.4)',
                    color: '#DDD6FE',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile at Bottom */}
      <button
        onClick={onOpenProfile}
        title="Click to edit profile"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 10px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          cursor: 'pointer',
          textAlign: 'left',
          color: '#F8FAFC',
          transition: 'all 0.18s ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.09)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        }}
      >
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-full)',
          background: avatarColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.78rem',
          color: '#FFFFFF',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
        }}>
          {initials}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {name}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#94A3B8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {email}
          </span>
        </div>
      </button>
    </aside>
  );
}
