import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Briefcase, 
  Check, 
  LogOut, 
  Save, 
  ShieldCheck,
  Palette
} from 'lucide-react';
import { updateUserProfile } from '../services/api';

const AVATAR_PALETTES = [
  { label: 'Obsidian Slate', value: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' },
  { label: 'Royal Blue', value: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' },
  { label: 'Emerald Mint', value: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
  { label: 'Violet Glow', value: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' },
  { label: 'Amber Flame', value: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }
];

export default function ProfileModal({ isOpen, onClose, user, onUpdateUser, onLogout }) {
  const [name, setName] = useState(user?.name || 'Alex Chen');
  const [role, setRole] = useState(user?.role || 'Core Architect');
  const [email, setEmail] = useState(user?.email || 'alex@nexus.dev');
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || AVATAR_PALETTES[0].value);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  function calculateInitials(n) {
    if (!n) return 'NX';
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  const liveInitials = calculateInitials(name);

  async function handleSave(e) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await updateUserProfile({
        id: user?.id,
        name: name.trim(),
        role: role.trim(),
        email: email.trim(),
        avatarColor
      });

      if (res.success) {
        const updated = { ...res.user, avatarColor };
        localStorage.setItem('nexus_user', JSON.stringify(updated));
        onUpdateUser(updated);
        setSavedSuccess(true);
        setTimeout(() => {
          setSavedSuccess(false);
          onClose();
        }, 800);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '520px', padding: '28px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-blue">User Account</span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Session Active</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Edit Account Profile
            </h2>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Live Avatar Preview Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-full)',
            background: avatarColor,
            border: '2px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 800,
            color: '#FFFFFF',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)'
          }}>
            {liveInitials}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>{name || 'Your Name'}</span>
            <span style={{ fontSize: '0.8rem', color: '#60A5FA', fontWeight: 500 }}>{role || 'Role'}</span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>{email || 'email@domain.dev'}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                className="custom-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name..."
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
              Title / Role
            </label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                className="custom-input"
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Lead AI Engineer, CTO"
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="email"
                className="custom-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.dev"
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          {/* Avatar Color Picker */}
          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Avatar Color Theme
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {AVATAR_PALETTES.map((pal, idx) => (
                <div
                  key={idx}
                  onClick={() => setAvatarColor(pal.value)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: pal.value,
                    border: avatarColor === pal.value ? '2px solid #FFFFFF' : '2px solid transparent',
                    boxShadow: avatarColor === pal.value ? '0 0 10px rgba(255, 255, 255, 0.4)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title={pal.label}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onLogout}
              className="btn-secondary"
              style={{ color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.25)', background: 'rgba(239, 68, 68, 0.06)' }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-accent"
              >
                <Save size={14} />
                <span>{savedSuccess ? 'Saved!' : isSaving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
