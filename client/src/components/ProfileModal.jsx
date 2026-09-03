import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Briefcase, 
  Check, 
  LogOut, 
  Save
} from 'lucide-react';
import { updateUserProfile } from '../services/api';

const AVATAR_PALETTES = [
  { label: 'Royal Violet', value: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' },
  { label: 'Ocean Blue', value: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' },
  { label: 'Emerald Mint', value: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
  { label: 'Amber Flame', value: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
  { label: 'Dark Slate', value: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }
];

export default function ProfileModal({ isOpen, onClose, user, onUpdateUser, onLogout }) {
  const [name, setName] = useState(user?.name || 'Arjun Developer');
  const [role, setRole] = useState(user?.role || 'Fullstack AI Engineer');
  const [email, setEmail] = useState(user?.email || 'arjun@example.com');
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || AVATAR_PALETTES[0].value);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  function calculateInitials(n) {
    if (!n) return 'AD';
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

      const updated = {
        ...(res?.user || user),
        name: name.trim(),
        role: role.trim(),
        email: email.trim(),
        initials: liveInitials,
        avatarColor
      };

      localStorage.setItem('forge_user', JSON.stringify(updated));
      onUpdateUser(updated);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      const updated = {
        ...user,
        name: name.trim(),
        role: role.trim(),
        email: email.trim(),
        initials: liveInitials,
        avatarColor
      };
      localStorage.setItem('forge_user', JSON.stringify(updated));
      onUpdateUser(updated);
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '480px', padding: '28px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
            Edit Profile
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} color="#64748B" />
          </button>
        </div>

        {/* Live Avatar Preview */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '14px',
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: 'var(--radius-md)',
          marginBottom: '18px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: avatarColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            fontWeight: 800,
            color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}>
            {liveInitials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#0F172A' }}>{name || 'Your Name'}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>{role || 'Role'}</span>
            <span style={{ fontSize: '0.74rem', color: '#64748B' }}>{email || 'email@example.com'}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                className="custom-input"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>Title / Role</label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                className="custom-input"
                value={role}
                onChange={e => setRole(e.target.value)}
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="email"
                className="custom-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          {/* Color Palettes */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Avatar Theme</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {AVATAR_PALETTES.map((pal, idx) => (
                <div
                  key={idx}
                  onClick={() => setAvatarColor(pal.value)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: pal.value,
                    border: avatarColor === pal.value ? '2px solid #0F172A' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: avatarColor === pal.value ? '0 0 0 2px #CBD5E1' : 'none'
                  }}
                  title={pal.label}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '16px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onLogout}
              className="btn-secondary"
              style={{ color: '#EF4444', borderColor: '#FECACA', background: '#FEE2E2' }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={isSaving} className="btn-primary">
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
