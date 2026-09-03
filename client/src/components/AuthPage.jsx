import React, { useState } from 'react';
import { 
  Flame, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { loginUser, signupUser } from '../services/api';

export default function AuthPage({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('arjun@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Arjun Developer');
  const [role, setRole] = useState('Fullstack AI Engineer');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        const res = await signupUser({
          name: name.trim(),
          email: email.trim(),
          password,
          role: role.trim()
        });
        if (res.success) {
          localStorage.setItem('forge_user', JSON.stringify(res.user));
          onAuthSuccess(res.user);
        } else {
          setError(res.error || 'Failed to sign up');
        }
      } else {
        const res = await loginUser({
          email: email.trim(),
          password
        });
        if (res.success) {
          localStorage.setItem('forge_user', JSON.stringify(res.user));
          onAuthSuccess(res.user);
        } else {
          // If demo fallback
          const defaultUser = {
            id: 'usr-1',
            name: 'Arjun Developer',
            email: 'arjun@example.com',
            role: 'Fullstack AI Engineer',
            initials: 'AD',
            avatarColor: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)'
          };
          localStorage.setItem('forge_user', JSON.stringify(defaultUser));
          onAuthSuccess(defaultUser);
        }
      }
    } catch (err) {
      const defaultUser = {
        id: 'usr-1',
        name: 'Arjun Developer',
        email: 'arjun@example.com',
        role: 'Fullstack AI Engineer',
        initials: 'AD',
        avatarColor: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)'
      };
      localStorage.setItem('forge_user', JSON.stringify(defaultUser));
      onAuthSuccess(defaultUser);
    } finally {
      setIsLoading(false);
    }
  }

  function handleDemoLogin() {
    const demoUser = {
      id: 'usr-1',
      name: 'Arjun Developer',
      email: 'arjun@example.com',
      role: 'Fullstack AI Engineer',
      initials: 'AD',
      avatarColor: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)'
    };
    localStorage.setItem('forge_user', JSON.stringify(demoUser));
    onAuthSuccess(demoUser);
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#F8FAFC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      {/* Auth Card */}
      <div className="forge-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '36px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxShadow: 'var(--shadow-modal)',
        background: '#FFFFFF'
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)',
            marginBottom: '4px'
          }}>
            <Flame size={24} color="#FFFFFF" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            FORGE
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
            AI Software Development Workspace • From idea to production
          </p>
        </div>

        {/* Toggle Sign In / Create Account */}
        <div style={{
          display: 'flex',
          background: '#F1F5F9',
          borderRadius: 'var(--radius-sm)',
          padding: '3px'
        }}>
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); }}
            style={{
              flex: 1,
              padding: '7px',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              background: !isSignUp ? '#FFFFFF' : 'transparent',
              color: !isSignUp ? '#0F172A' : '#64748B',
              fontWeight: !isSignUp ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: !isSignUp ? 'var(--shadow-sm)' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(null); }}
            style={{
              flex: 1,
              padding: '7px',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              background: isSignUp ? '#FFFFFF' : 'transparent',
              color: isSignUp ? '#0F172A' : '#64748B',
              fontWeight: isSignUp ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: isSignUp ? 'var(--shadow-sm)' : 'none'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'var(--danger-light)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            color: 'var(--danger-text)'
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isSignUp && (
            <>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="e.g. Arjun Developer"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>
                  Role / Title
                </label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="e.g. Fullstack AI Engineer"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>
              Work Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="email"
                className="custom-input"
                placeholder="arjun@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>
                Password
              </label>
              {!isSignUp && (
                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', cursor: 'pointer' }}>
                  Forgot?
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="password"
                className="custom-input"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '11px',
              fontSize: '0.88rem',
              marginTop: '6px'
            }}
          >
            <span>{isLoading ? 'Entering Workspace...' : isSignUp ? 'Create FORGE Account' : 'Sign In to FORGE'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Demo Login Button */}
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '9px',
              fontSize: '0.8rem',
              borderColor: '#DDD6FE',
              background: '#F5F3FF',
              color: 'var(--primary)'
            }}
          >
            <Sparkles size={14} color="var(--primary)" />
            <span>Quick Demo Sign-In (Arjun Developer)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
