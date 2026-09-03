import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Plus, 
  Sparkles,
  Command,
  Flame,
  User,
  Settings
} from 'lucide-react';

export default function Navbar({ project, onOpenProfile, onOpenNewProject, user }) {
  const [showNotifications, setShowNotifications] = useState(false);

  const title = project?.title || 'Expense Tracker SaaS';
  const name = user?.name || 'Arjun Developer';
  const initials = user?.initials || 'AD';
  const avatarColor = user?.avatarColor || 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)';

  return (
    <header style={{
      height: '58px',
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      {/* Left: Project Selector Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          cursor: 'pointer'
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A' }} />
          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>
            {title}
          </span>
          <ChevronDown size={14} color="#64748B" />
        </div>
      </div>

      {/* Center: Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        padding: '6px 14px',
        borderRadius: 'var(--radius-full)',
        width: '320px',
        color: '#94A3B8',
        fontSize: '0.82rem'
      }}>
        <Search size={14} />
        <span style={{ flex: 1, color: '#64748B' }}>Search tasks, agents, architecture...</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '1px 5px', borderRadius: '4px', fontSize: '0.68rem', color: '#64748B', fontFamily: 'JetBrains Mono, monospace' }}>
          <Command size={10} />
          <span>K</span>
        </div>
      </div>

      {/* Right: New Project + Notifications + User Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          onClick={onOpenNewProject}
          className="btn-primary" 
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <Plus size={13} />
          <span>New Project</span>
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              background: showNotifications ? '#F1F5F9' : '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              cursor: 'pointer'
            }}
          >
            <Bell size={15} />
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '42px',
              width: '320px',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-modal)',
              padding: '14px',
              zIndex: 50
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0F172A' }}>Agent Notifications</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 600 }}>All read</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ padding: '8px', background: '#F8FAFC', borderRadius: 'var(--radius-xs)', border: '1px solid #E2E8F0', fontSize: '0.76rem' }}>
                  <span style={{ fontWeight: 700, color: '#0F172A', display: 'block' }}>Reviewer Agent</span>
                  <span style={{ color: '#64748B' }}>Reviewed PR #12 - Suggested 3 changes</span>
                </div>
                <div style={{ padding: '8px', background: '#F8FAFC', borderRadius: 'var(--radius-xs)', border: '1px solid #E2E8F0', fontSize: '0.76rem' }}>
                  <span style={{ fontWeight: 700, color: '#0F172A', display: 'block' }}>QA Agent</span>
                  <span style={{ color: '#64748B' }}>All 56 pytest assertions passed</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Trigger */}
        <div 
          onClick={onOpenProfile}
          title="Click to edit profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            paddingLeft: '6px',
            borderLeft: '1px solid #E2E8F0'
          }}
        >
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: avatarColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.74rem',
            color: '#FFFFFF'
          }}>
            {initials}
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
            {name}
          </span>
        </div>
      </div>
    </header>
  );
}
