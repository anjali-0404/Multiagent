import React, { useState } from 'react';
import { 
  Plus, 
  CheckSquare, 
  AlertCircle, 
  Calendar, 
  Tag, 
  Check, 
  X,
  Filter,
  MoreVertical,
  Trash2
} from 'lucide-react';

const INITIAL_TASKS = [
  { id: 1, title: 'Design user authentication flow', tag: 'Auth', priority: 'High', date: 'May 25', status: 'Done' },
  { id: 2, title: 'Implement login & registration API', tag: 'Auth', priority: 'High', date: 'May 25', status: 'Done' },
  { id: 3, title: 'Create expense CRUD APIs', tag: 'Backend', priority: 'Medium', date: 'May 26', status: 'In Progress' },
  { id: 4, title: 'Build dashboard UI', tag: 'UI', priority: 'Medium', date: 'May 28', status: 'In Progress' },
  { id: 5, title: 'Integrate analytics charts', tag: 'Analytics', priority: 'Low', date: 'May 30', status: 'To Do' }
];

export default function TasksIssues() {
  const [topTab, setTopTab] = useState('Tasks');
  const [filterStatus, setFilterStatus] = useState('All');
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState('Backend');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDate, setNewDate] = useState('Jun 02');

  const filteredTasks = tasks.filter(t => {
    if (filterStatus === 'All') return true;
    return t.status.toLowerCase() === filterStatus.toLowerCase();
  });

  function handleAddTask(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask = {
      id: Date.now(),
      title: newTitle.trim(),
      tag: newTag,
      priority: newPriority,
      date: newDate,
      status: 'To Do'
    };

    setTasks([newTask, ...tasks]);
    setNewTitle('');
    setIsModalOpen(false);
  }

  function toggleTaskStatus(id) {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: t.status === 'Done' ? 'To Do' : 'Done'
        };
      }
      return t;
    }));
  }

  function deleteTask(id) {
    setTasks(tasks.filter(t => t.id !== id));
  }

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Nav: Tasks, Issues, Milestones */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '20px', borderBottom: '2px solid transparent' }}>
          {['Tasks', 'Issues', 'Milestones'].map(tab => (
            <button
              key={tab}
              onClick={() => setTopTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '6px 0',
                borderBottom: topTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                color: topTab === tab ? '#0F172A' : '#64748B',
                fontWeight: topTab === tab ? 800 : 600,
                fontSize: '0.94rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary" 
          style={{ padding: '7px 14px', fontSize: '0.82rem' }}
        >
          <Plus size={14} />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Status Bar */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {['All', 'To Do', 'In Progress', 'Done', 'Blocked'].map(f => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid',
              borderColor: filterStatus === f ? 'var(--primary)' : '#E2E8F0',
              background: filterStatus === f ? 'var(--primary-light)' : '#FFFFFF',
              color: filterStatus === f ? 'var(--primary)' : '#64748B',
              fontSize: '0.78rem',
              fontWeight: filterStatus === f ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task Table Card */}
      <div className="forge-card" style={{ padding: '0px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '12px 18px', fontSize: '0.76rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Task Description</th>
              <th style={{ padding: '12px 18px', fontSize: '0.76rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Category</th>
              <th style={{ padding: '12px 18px', fontSize: '0.76rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Priority</th>
              <th style={{ padding: '12px 18px', fontSize: '0.76rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Due Date</th>
              <th style={{ padding: '12px 18px', fontSize: '0.76rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task, idx) => (
              <tr 
                key={task.id}
                style={{
                  borderBottom: idx < filteredTasks.length - 1 ? '1px solid #F1F5F9' : 'none',
                  background: task.status === 'Done' ? 'rgba(248, 250, 252, 0.6)' : '#FFFFFF',
                  transition: 'background 0.15s ease'
                }}
              >
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div 
                      onClick={() => toggleTaskStatus(task.id)}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        border: task.status === 'Done' ? 'none' : '2px solid #CBD5E1',
                        background: task.status === 'Done' ? 'var(--success)' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {task.status === 'Done' && <Check size={12} color="#FFFFFF" />}
                    </div>
                    <span style={{
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: task.status === 'Done' ? '#94A3B8' : '#0F172A',
                      textDecoration: task.status === 'Done' ? 'line-through' : 'none'
                    }}>
                      {task.title}
                    </span>
                  </div>
                </td>

                <td style={{ padding: '14px 18px' }}>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: task.tag === 'Auth' ? '#EFF6FF' : task.tag === 'Backend' ? '#F5F3FF' : task.tag === 'UI' ? '#F0FDF4' : '#FFFBEB',
                    color: task.tag === 'Auth' ? '#2563EB' : task.tag === 'Backend' ? '#7C3AED' : task.tag === 'UI' ? '#16A34A' : '#D97706',
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}>
                    {task.tag}
                  </span>
                </td>

                <td style={{ padding: '14px 18px' }}>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: task.priority === 'High' ? '#FEE2E2' : task.priority === 'Medium' ? '#FEF3C7' : '#DCFCE7',
                    color: task.priority === 'High' ? '#DC2626' : task.priority === 'Medium' ? '#D97706' : '#16A34A'
                  }}>
                    {task.priority}
                  </span>
                </td>

                <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: '#64748B', fontFamily: 'JetBrains Mono, monospace' }}>
                  {task.date}
                </td>

                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: '4px' }}
                    title="Delete task"
                  >
                    <Trash2 size={14} onMouseEnter={e => e.currentTarget.style.color = '#EF4444'} onMouseLeave={e => e.currentTarget.style.color = '#CBD5E1'} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>Create New Task</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>Task Title</label>
                <input 
                  type="text" 
                  className="custom-input" 
                  placeholder="e.g. Implement webhook dispatch retry logic"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>Category</label>
                  <select 
                    className="custom-input"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                  >
                    <option value="Auth">Auth</option>
                    <option value="Backend">Backend</option>
                    <option value="UI">UI</option>
                    <option value="Analytics">Analytics</option>
                    <option value="Database">Database</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>Priority</label>
                  <select 
                    className="custom-input"
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value)}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>Due Date</label>
                  <input 
                    type="text" 
                    className="custom-input" 
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
