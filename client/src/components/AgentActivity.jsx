import React, { useState } from 'react';
import { 
  Bot, 
  CheckCircle2, 
  Eye, 
  Filter, 
  Clock, 
  ArrowRight,
  GitPullRequest,
  CheckCheck,
  Code,
  ListTodo,
  Layers,
  X
} from 'lucide-react';

const TIMELINE_EVENTS = [
  {
    id: 1,
    time: '10:24 AM',
    agent: 'Reviewer Agent',
    role: 'Code & PR Auditor',
    detail: 'Reviewed PR #12 - Suggested 3 changes',
    fullLog: 'Scanned 4 files (controllers/analytics.py, tests/test_analytics.py, schemas/budget.py, models/db.py). Suggested input bounds validation for transaction amount field, precision decimal handling, and unit test coverage.',
    color: '#7C3AED',
    avatar: 'RA'
  },
  {
    id: 2,
    time: '10:21 AM',
    agent: 'QA Agent',
    role: 'Automated Test Runner',
    detail: 'All tests passed - 56/56',
    fullLog: 'Executed pytest suite. 56 unit and integration test assertions passed in 1.42s with 98.4% branch coverage.',
    color: '#16A34A',
    avatar: 'QA'
  },
  {
    id: 3,
    time: '10:18 AM',
    agent: 'Builder Agent',
    role: 'Backend Implementor',
    detail: 'Implemented budget analytics API',
    fullLog: 'Created /api/v1/analytics/spending endpoint with daily rolling averages, categorized merchant tag aggregation, and student discount recommendations.',
    color: '#2563EB',
    avatar: 'BA'
  },
  {
    id: 4,
    time: '10:12 AM',
    agent: 'Planner Agent',
    role: 'Task Orchestrator',
    detail: 'Updated task status - 7 tasks completed',
    fullLog: 'Shifted Sprint 1 tasks (Auth flow, DB schemas, initial UI mocks) to Done state after automated verification pass.',
    color: '#F59E0B',
    avatar: 'PA'
  },
  {
    id: 5,
    time: '10:05 AM',
    agent: 'Architect Agent',
    role: 'System Architect',
    detail: 'Updated database schema',
    fullLog: 'Added Alembic migration for multi-tenant college student budgets, recurring subscriptions, and category limit constraints in PostgreSQL.',
    color: '#8B5CF6',
    avatar: 'AA'
  }
];

export default function AgentActivity() {
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [activeModal, setActiveModal] = useState(null);

  const filtered = selectedAgent === 'all' 
    ? TIMELINE_EVENTS 
    : TIMELINE_EVENTS.filter(e => e.agent.toLowerCase().includes(selectedAgent.toLowerCase()));

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
              Agent Activity Timeline
            </h1>
            <span className="badge badge-success">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }} />
              <span>Live</span>
            </span>
          </div>
          <p style={{ fontSize: '0.86rem', color: '#64748B' }}>
            Live timeline of multi-agent execution with details and log traces.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'Reviewer', 'QA', 'Builder', 'Planner', 'Architect'].map(f => (
            <button
              key={f}
              onClick={() => setSelectedAgent(f)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid',
                borderColor: selectedAgent === f ? 'var(--primary)' : '#E2E8F0',
                background: selectedAgent === f ? 'var(--primary-light)' : '#FFFFFF',
                color: selectedAgent === f ? 'var(--primary)' : '#64748B',
                fontSize: '0.78rem',
                fontWeight: selectedAgent === f ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {f === 'all' ? 'All Agents' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Card List */}
      <div className="forge-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '0px' }}>
        {filtered.map((item, idx) => (
          <div 
            key={item.id} 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 12px',
              borderBottom: idx < filtered.length - 1 ? '1px solid #F1F5F9' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            {/* Left: Time + Node + Detail */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#94A3B8',
                width: '70px',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                {item.time}
              </span>

              {/* Dot & Line Indicator */}
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: item.color,
                boxShadow: `0 0 0 4px ${item.color}20`
              }} />

              {/* Agent Badge & Action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  minWidth: '130px'
                }}>
                  {item.agent}
                </span>

                <span style={{ fontSize: '0.86rem', color: '#475569' }}>
                  {item.detail}
                </span>
              </div>
            </div>

            {/* Right: View Button */}
            <button
              onClick={() => setActiveModal(item)}
              className="btn-secondary"
              style={{ padding: '5px 12px', fontSize: '0.78rem' }}
            >
              <span>View</span>
            </button>
          </div>
        ))}

        {/* View Full Timeline Link */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '18px', borderTop: '1px solid #F1F5F9', marginTop: '12px' }}>
          <button style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>View Full Timeline</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Event Details Modal */}
      {activeModal && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: `${activeModal.color}15`,
                  color: activeModal.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.8rem'
                }}>
                  {activeModal.avatar}
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>{activeModal.agent}</h3>
                  <span style={{ fontSize: '0.74rem', color: '#64748B' }}>{activeModal.role} • {activeModal.time}</span>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} color="#64748B" />
              </button>
            </div>

            <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0F172A' }}>{activeModal.detail}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Execution Output</span>
              <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6, background: '#FFFFFF', padding: '12px', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-sm)' }}>
                {activeModal.fullLog}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
