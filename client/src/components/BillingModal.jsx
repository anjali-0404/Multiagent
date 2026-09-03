import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Calculator,
  ArrowRight
} from 'lucide-react';

const TIERS = [
  {
    id: 'starter',
    name: 'Hobby',
    price: '$0',
    period: '/ month',
    desc: 'For individual developers experimenting with LLMs.',
    features: [
      '500k monthly tokens',
      '3 Pipelines / DAGs',
      'Shared inference nodes',
      '100MB Vector storage'
    ],
    buttonText: 'Current Plan',
    current: true,
    highlight: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$40',
    period: '/ month',
    desc: 'For teams building production AI workflows and RAG systems.',
    features: [
      '10M monthly tokens',
      'Unlimited Pipelines',
      'Low-latency edge routing',
      '10GB Vector storage',
      'Team audit logs'
    ],
    buttonText: 'Upgrade to Pro',
    current: false,
    highlight: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For organizations needing dedicated VPC instances and custom SLAs.',
    features: [
      'Dedicated GPU pools',
      '99.99% uptime SLA',
      'SOC2 & HIPAA compliance',
      'Custom fine-tuned weights',
      '24/7 Support engineer'
    ],
    buttonText: 'Contact Sales',
    current: false,
    highlight: false
  }
];

export default function BillingModal({ isOpen, onClose }) {
  const [tokenSlider, setTokenSlider] = useState(2500000);
  const [upgraded, setUpgraded] = useState(false);

  if (!isOpen) return null;

  const estimatedCost = Math.round((tokenSlider / 1000000) * 4.0);

  function handleUpgrade(tier) {
    if (tier.current) return;
    setUpgraded(true);
    setTimeout(() => {
      setUpgraded(false);
      onClose();
    }, 1200);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '780px', padding: '24px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Plans & Capacity
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Scale effortlessly from local development to production workloads.
            </p>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tier Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {TIERS.map(tier => (
            <div
              key={tier.id}
              style={{
                borderRadius: 'var(--radius-sm)',
                padding: '18px 16px',
                background: tier.highlight ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                border: '1px solid',
                borderColor: tier.highlight ? '#3B82F6' : 'var(--border-hairline)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{tier.name}</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                  <span style={{ fontSize: '1.45rem', fontWeight: 600, color: 'var(--text-primary)' }}>{tier.price}</span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>{tier.period}</span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                  {tier.desc}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border-hairline)', paddingTop: '10px', marginTop: '4px' }}>
                  {tier.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      <Check size={12} color={tier.highlight ? '#3B82F6' : '#10B981'} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleUpgrade(tier)}
                disabled={tier.current}
                className={tier.highlight ? 'btn-accent' : 'btn-secondary'}
                style={{
                  marginTop: '16px',
                  width: '100%',
                  justifyContent: 'center',
                  padding: '6px',
                  fontSize: '0.78rem',
                  opacity: tier.current ? 0.5 : 1
                }}
              >
                {upgraded && tier.highlight ? '✓ Updated' : tier.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Usage Calculator */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-hairline)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Estimated Token Usage</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              ~${estimatedCost} / month
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <input
              type="range"
              min="500000"
              max="20000000"
              step="500000"
              value={tokenSlider}
              onChange={e => setTokenSlider(parseInt(e.target.value))}
              style={{ flex: 1, accentColor: '#3B82F6', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', minWidth: '90px', textAlign: 'right', fontFamily: 'Geist Mono, monospace' }}>
              {(tokenSlider / 1000000).toFixed(1)}M tokens
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
