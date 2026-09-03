import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  Plus, 
  Bot, 
  CheckSquare, 
  AlertCircle, 
  TrendingUp,
  ArrowRight,
  Sparkles,
  GitBranch,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function Dashboard({ project, onSelectTab, onOpenNewTask }) {
  const title = project?.title || 'Expense Tracker SaaS';
  const description = project?.description || 'AI-powered expense tracking platform for college students';

  const steps = [
    { name: 'Research', status: 'completed' },
    { name: 'Architecture', status: 'completed' },
    { name: 'Planning', status: 'completed' },
    { name: 'Development', status: 'in-progress' },
    { name: 'Testing', status: 'pending' },
    { name: 'Deployment', status: 'pending' }
  ];

  const recentAgents = [
    { name: 'Architect Agent', action: 'Generated system architecture', time: '2 min ago', avatar: 'AA', color: '#7C3AED' },
    { name: 'Planner Agent', action: 'Created 14 tasks', time: '5 min ago', avatar: 'PA', color: '#2563EB' },
    { name: 'Builder Agent', action: 'Implemented authentication module', time: '15 min ago', avatar: 'BA', color: '#16A34A' }
  ];

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              {title}
            </h1>
            <span className="badge badge-success">
              <CheckCircle2 size={12} />
              <span>Active</span>
            </span>
          </div>
          <p style={{ fontSize: '0.86rem', color: '#64748B' }}>
            {description}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="btn-secondary">
            <UserPlus size={15} color="#64748B" />
            <span>Invite</span>
          </button>
          <button className="btn-primary" onClick={onOpenNewTask}>
            <Plus size={15} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {/* Progress */}
        <div className="forge-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>Progress</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>68%</div>
          <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '68%', height: '100%', background: 'var(--success)', borderRadius: '4px' }} />
          </div>
        </div>

        {/* Tasks */}
        <div className="forge-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>Tasks</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>32 / 47</div>
          <span style={{ fontSize: '0.76rem', color: '#64748B' }}>Completed</span>
        </div>

        {/* Agents */}
        <div className="forge-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>Agents</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>8</div>
          <span style={{ fontSize: '0.76rem', color: 'var(--primary)', fontWeight: 600 }}>Active</span>
        </div>

        {/* Issues */}
        <div className="forge-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>Issues</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>12</div>
          <span style={{ fontSize: '0.76rem', color: '#EF4444', fontWeight: 600 }}>Open</span>
        </div>
      </div>

      {/* Project Progress Stepper Card */}
      <div className="forge-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <h2 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A' }}>Project Progress</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {/* Connector Line */}
          <div style={{
            position: 'absolute',
            left: '30px',
            right: '30px',
            top: '16px',
            height: '2px',
            background: '#E2E8F0',
            zIndex: 1
          }} />

          {steps.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isInProgress = step.status === 'in-progress';
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2 }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isCompleted ? 'var(--success)' : isInProgress ? 'var(--primary)' : '#FFFFFF',
                  border: isCompleted ? 'none' : isInProgress ? '3px solid #DDD6FE' : '2px solid #CBD5E1',
                  color: isCompleted || isInProgress ? '#FFFFFF' : '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  boxShadow: isInProgress ? '0 0 0 4px rgba(124, 58, 237, 0.15)' : 'none'
                }}>
                  {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isInProgress ? 'var(--primary)' : '#0F172A' }}>
                    {step.name}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: isCompleted ? 'var(--success-text)' : isInProgress ? 'var(--primary)' : '#94A3B8', fontWeight: 500 }}>
                    {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Grid: Recent Agent Activity & Tasks Overview Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '18px' }}>
        {/* Recent Agent Activity */}
        <div className="forge-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A' }}>Recent Agent Activity</h2>
            <button 
              onClick={() => onSelectTab('agents')} 
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>View All</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentAgents.map((agent, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: `${agent.color}15`,
                    color: agent.color,
                    border: `1px solid ${agent.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}>
                    {agent.avatar}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                      {agent.name}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                      {agent.action}
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{agent.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Overview (Donut Chart) */}
        <div className="forge-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A' }}>Tasks Overview</h2>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '16px' }}>
            {/* SVG Donut Chart */}
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                {/* Background Ring */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#E2E8F0" strokeWidth="4" />
                {/* Completed (68%) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#16A34A" strokeWidth="4" strokeDasharray="60 100" strokeDashoffset="0" />
                {/* In Progress (21%) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#2563EB" strokeWidth="4" strokeDasharray="18.5 100" strokeDashoffset="-60" />
                {/* To Do (11%) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#F59E0B" strokeWidth="4" strokeDasharray="9.5 100" strokeDashoffset="-78.5" />
              </svg>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>47</span>
                <span style={{ fontSize: '0.64rem', color: '#64748B', fontWeight: 600 }}>Total</span>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16A34A' }} />
                <span style={{ color: '#0F172A', fontWeight: 600 }}>Completed</span>
                <span style={{ color: '#64748B', marginLeft: 'auto' }}>32 (68%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563EB' }} />
                <span style={{ color: '#0F172A', fontWeight: 600 }}>In Progress</span>
                <span style={{ color: '#64748B', marginLeft: 'auto' }}>10 (21%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                <span style={{ color: '#0F172A', fontWeight: 600 }}>To Do</span>
                <span style={{ color: '#64748B', marginLeft: 'auto' }}>5 (11%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
                <span style={{ color: '#0F172A', fontWeight: 600 }}>Blocked</span>
                <span style={{ color: '#64748B', marginLeft: 'auto' }}>0 (0%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
