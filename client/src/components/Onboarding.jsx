import React, { useState } from 'react';
import { 
  Globe, 
  Smartphone, 
  Server, 
  Cpu, 
  ArrowRight, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const GOAL_OPTIONS = [
  { id: 'web', label: 'Web App', icon: Globe },
  { id: 'mobile', label: 'Mobile App', icon: Smartphone },
  { id: 'backend', label: 'API / Backend', icon: Server },
  { id: 'ai', label: 'AI / ML', icon: Cpu },
];

export default function Onboarding({ onCreateProject }) {
  const [prompt, setPrompt] = useState(
    'Build an expense tracking SaaS for college students with AI insights, budget planning, and real-time analytics.'
  );
  const [selectedGoal, setSelectedGoal] = useState('web');
  const [isGenerating, setIsGenerating] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onCreateProject({
        title: 'Expense Tracker SaaS',
        description: prompt,
        goal: selectedGoal
      });
    }, 900);
  }

  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      background: '#F8FAFC'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '680px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '28px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.03em'
          }}>
            Let's build something amazing
          </h1>
          <p style={{
            fontSize: '0.94rem',
            color: '#64748B',
            maxWidth: '520px',
            lineHeight: 1.5
          }}>
            Describe your idea in detail. FORGE will turn it into a production-ready software project.
          </p>
        </div>

        {/* Card Form */}
        <form 
          onSubmit={handleSubmit}
          className="forge-card"
          style={{
            width: '100%',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
            textAlign: 'left'
          }}
        >
          {/* Text Area */}
          <div style={{ position: 'relative' }}>
            <textarea
              className="custom-input"
              rows={4}
              value={prompt}
              maxLength={1000}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. Build an AI-powered SaaS..."
              style={{
                resize: 'vertical',
                fontSize: '0.94rem',
                lineHeight: 1.6,
                padding: '14px',
                minHeight: '120px'
              }}
              required
            />
            <div style={{
              position: 'absolute',
              right: '12px',
              bottom: '12px',
              fontSize: '0.72rem',
              color: '#94A3B8',
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              {prompt.length}/1000
            </div>
          </div>

          {/* Goal Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>
              Choose primary goal (optional)
            </span>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {GOAL_OPTIONS.map(goal => {
                const Icon = goal.icon;
                const isSelected = selectedGoal === goal.id;
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => setSelectedGoal(goal.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--primary)' : '#E2E8F0',
                      background: isSelected ? 'var(--primary-light)' : '#FFFFFF',
                      color: isSelected ? 'var(--primary)' : '#475569',
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={15} color={isSelected ? 'var(--primary)' : '#64748B'} />
                    <span>{goal.label}</span>
                    {isSelected && <CheckCircle2 size={14} color="var(--primary)" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isGenerating}
            className="btn-primary"
            style={{
              padding: '12px 20px',
              fontSize: '0.94rem',
              width: '100%',
              marginTop: '6px'
            }}
          >
            <span>{isGenerating ? 'Synthesizing Architecture & Agents...' : 'Create Project'}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
