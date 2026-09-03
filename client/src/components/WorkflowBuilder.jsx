import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Plus, 
  Trash2, 
  GitBranch, 
  Terminal, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Database, 
  Cpu, 
  Send,
  Zap,
  Globe,
  FileText
} from 'lucide-react';
import { fetchWorkflows, runWorkflow, saveWorkflow, deleteWorkflow } from '../services/api';

const ICON_MAP = {
  Webhook: Zap,
  Database: Database,
  BrainCircuit: Cpu,
  Send: Send,
  Clock: Clock,
  Globe: Globe,
  Cpu: Cpu,
  FileText: FileText,
  ShieldCheck: CheckCircle2,
  CheckCircle: CheckCircle2
};

export default function WorkflowBuilder({ onUpdateStats }) {
  const [workflows, setWorkflows] = useState([]);
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeNodeIndex, setActiveNodeIndex] = useState(-1);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTrigger, setNewTrigger] = useState('Webhook Ingestion');

  useEffect(() => {
    loadWorkflows();
  }, []);

  async function loadWorkflows() {
    try {
      const res = await fetchWorkflows();
      if (res.success && res.workflows.length > 0) {
        setWorkflows(res.workflows);
        setActiveWorkflow(res.workflows[0]);
      }
    } catch (err) {
      console.error('Failed to load workflows:', err);
    }
  }

  async function handleRunWorkflow() {
    if (!activeWorkflow || isRunning) return;

    setIsRunning(true);
    setTerminalLogs([`[${new Date().toLocaleTimeString()}] [SYSTEM] Dispatching job for pipeline: "${activeWorkflow.name}"`]);

    const totalNodes = activeWorkflow.nodes.length;
    for (let i = 0; i < totalNodes; i++) {
      setActiveNodeIndex(i);
      const node = activeWorkflow.nodes[i];
      await new Promise(r => setTimeout(r, 450));
      setTerminalLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [STAGE ${i + 1}/${totalNodes}] OK: "${node.label}"`
      ]);
    }

    try {
      const res = await runWorkflow(activeWorkflow.id);
      if (res.success) {
        setTerminalLogs(prev => [...prev, ...res.logs]);
        if (onUpdateStats) onUpdateStats();
      }
    } catch (err) {
      setTerminalLogs(prev => [...prev, `[ERROR] Execution failure: ${err.message}`]);
    } finally {
      setIsRunning(false);
      setActiveNodeIndex(-1);
    }
  }

  async function handleCreateWorkflow(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const payload = {
      name: newTitle,
      description: newDesc,
      trigger: newTrigger,
      nodes: [
        { id: `n-${Date.now()}-1`, type: 'trigger', label: newTrigger, icon: 'Webhook', status: 'ready' },
        { id: `n-${Date.now()}-2`, type: 'rag', label: 'Vector Similarity Retrieval', icon: 'Database', status: 'ready' },
        { id: `n-${Date.now()}-3`, type: 'llm', label: 'LLM Reasoning Worker (Claude 3.5)', icon: 'Cpu', status: 'ready' },
        { id: `n-${Date.now()}-4`, type: 'action', label: 'Sink Dispatch & Webhook', icon: 'Send', status: 'ready' }
      ]
    };

    try {
      const res = await saveWorkflow(payload);
      if (res.success) {
        setWorkflows(prev => [res.workflow, ...prev]);
        setActiveWorkflow(res.workflow);
        setShowCreateModal(false);
        setNewTitle('');
        setNewDesc('');
      }
    } catch (err) {
      console.error('Failed to create workflow:', err);
    }
  }

  async function handleDeleteWorkflow(id) {
    try {
      await deleteWorkflow(id);
      const remaining = workflows.filter(w => w.id !== id);
      setWorkflows(remaining);
      if (activeWorkflow?.id === id) {
        setActiveWorkflow(remaining[0] || null);
      }
    } catch (err) {
      console.error('Failed to delete workflow:', err);
    }
  }

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Pipelines & DAG Automation
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Configure and trigger multi-step agent reasoning, tool execution, and webhook dispatches.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-secondary"
            style={{ padding: '6px 12px' }}
          >
            <Plus size={14} />
            <span>Create Pipeline</span>
          </button>

          <button 
            onClick={handleRunWorkflow}
            disabled={isRunning || !activeWorkflow}
            className="btn-primary"
            style={{ padding: '6px 14px' }}
          >
            <Play size={13} fill="currentColor" />
            <span>{isRunning ? 'Executing...' : 'Run Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Pipeline Selector & DAG Canvas */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px' }}>
        {/* Left: Pipelines List */}
        <div className="surface-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', height: 'fit-content' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Configured Pipelines ({workflows.length})
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {workflows.map(wf => {
              const isSelected = activeWorkflow?.id === wf.id;
              return (
                <div
                  key={wf.id}
                  onClick={() => {
                    setActiveWorkflow(wf);
                    setTerminalLogs([]);
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--border-hover)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'background 0.12s ease'
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: isSelected ? 600 : 500, fontSize: '0.82rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {wf.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkflow(wf.id);
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', opacity: 0.6 }}
                      title="Delete pipeline"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', lineHeight: 1.3 }}>
                    {wf.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-hairline)', paddingTop: '4px', marginTop: '2px' }}>
                    <span>{wf.nodes.length} Stages</span>
                    <span>Last run: {wf.lastRun}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Clean Node Canvas & Execution Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Canvas */}
          <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{activeWorkflow?.name || 'Select a Workflow'}</h2>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                  Trigger source: <code style={{ color: 'var(--text-secondary)' }}>{activeWorkflow?.trigger}</code>
                </span>
              </div>
              <span className="badge badge-neutral">{activeWorkflow?.nodes.length || 0} Stages</span>
            </div>

            {/* Stages Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 0',
              overflowX: 'auto'
            }}>
              {(activeWorkflow?.nodes || []).map((node, idx) => {
                const Icon = ICON_MAP[node.icon] || Cpu;
                const isCurrentlyActive = activeNodeIndex === idx;

                return (
                  <React.Fragment key={node.id}>
                    <div style={{
                      minWidth: '170px',
                      background: isCurrentlyActive ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid',
                      borderColor: isCurrentlyActive ? '#3B82F6' : 'var(--border-hairline)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      transition: 'border-color 0.15s ease'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.66rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>
                          Stage {idx + 1}
                        </span>
                        <Icon size={13} color="var(--text-secondary)" />
                      </div>

                      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                        {node.label}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: isCurrentlyActive ? '#3B82F6' : '#10B981' }} />
                        <span>{isCurrentlyActive ? 'Executing...' : 'Ready'}</span>
                      </div>
                    </div>

                    {idx < activeWorkflow.nodes.length - 1 && (
                      <ArrowRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Execution Terminal */}
          <div className="surface-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={14} color="var(--text-secondary)" />
                <h3 style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>Execution Logs</h3>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>stdout / stderr</span>
            </div>

            <div style={{
              background: '#090A0D',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-xs)',
              padding: '10px 12px',
              minHeight: '120px',
              maxHeight: '180px',
              overflowY: 'auto',
              fontFamily: 'Geist Mono, monospace',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {terminalLogs.length === 0 ? (
                <span style={{ color: 'var(--text-muted)' }}>Ready. Trigger "Run Pipeline" to execute stages and capture telemetry.</span>
              ) : (
                terminalLogs.map((log, idx) => (
                  <div key={idx} style={{ color: log.includes('OK') ? '#34D399' : log.includes('ERROR') ? '#EF4444' : 'var(--text-secondary)' }}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>Create Pipeline</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Define a sequence of autonomous tasks, model inference steps, and downstream sinks.
            </p>

            <form onSubmit={handleCreateWorkflow} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Pipeline Name
                </label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. Inbound Lead Enrichment"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  className="custom-input"
                  rows={3}
                  placeholder="Describe pipeline function..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Trigger Type
                </label>
                <select
                  className="custom-input"
                  value={newTrigger}
                  onChange={e => setNewTrigger(e.target.value)}
                >
                  <option value="Webhook Ingestion">Webhook Ingestion (POST /v1/events)</option>
                  <option value="Scheduled Cron (15m)">Scheduled Cron (Every 15m)</option>
                  <option value="GitHub Event">GitHub PR Webhook</option>
                  <option value="S3 Upload">S3 Bucket Event</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
