import React, { useState } from 'react';
import { 
  Cpu, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Github
} from 'lucide-react';
import { loginUser, signupUser } from '../services/api';

export default function AuthPage({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('alex@nexus.dev');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Alex Chen');
  const [role, setRole] = useState('Core Architect');
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
          localStorage.setItem('nexus_user', JSON.stringify(res.user));
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
          localStorage.setItem('nexus_user', JSON.stringify(res.user));
          onAuthSuccess(res.user);
        } else {
          setError(res.error || 'Invalid credentials');
        }
      }
    } catch (err) {
      setError(err.message || 'Network communication failure');
    } finally {
      setIsLoading(false);
    }
  }

  function handleDemoLogin() {
    setEmail('alex@nexus.dev');
    setPassword('password123');
    setIsSignUp(false);
    setTimeout(() => {
      loginUser({ email: 'alex@nexus.dev', password: 'password123' }).then(res => {
        if (res.success) {
          localStorage.setItem('nexus_user', JSON.stringify(res.user));
          onAuthSuccess(res.user);
        }
      });
    }, 100);
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'var(--bg-deep)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: `
        radial-gradient(ellipse at 80% 10%, rgba(59, 130, 246, 0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 20% 90%, rgba(99, 102, 241, 0.08) 0%, transparent 45%),
        radial-gradient(ellipse at 50% 50%, rgba(6, 182, 212, 0.03) 0%, transparent 70%)
      `
    }}>
      {/* Auth Card */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'linear-gradient(160deg, rgba(19, 23, 34, 0.95) 0%, rgba(13, 16, 24, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.14)',
        padding: '36px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        zIndex: 10
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(37, 99, 235, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
            marginBottom: '4px'
          }}>
            <Cpu size={24} color="#FFFFFF" />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Nexus Studio
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {isSignUp ? 'Create your developer account to begin' : 'Sign in to access your multi-agent workspaces'}
          </p>
        </div>

        {/* Toggle Pills */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
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
              background: !isSignUp ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: !isSignUp ? '#FFFFFF' : 'var(--text-dim)',
              fontWeight: !isSignUp ? 600 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
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
              background: isSignUp ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: isSignUp ? '#FFFFFF' : 'var(--text-dim)',
              fontWeight: isSignUp ? 600 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            color: '#F87171'
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
                <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="e.g. Alex Chen"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
                  Role / Title
                </label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="e.g. Core Architect"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
              Work Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="email"
                className="custom-input"
                placeholder="name@company.dev"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Password
              </label>
              {!isSignUp && (
                <span style={{ fontSize: '0.7rem', color: '#60A5FA', cursor: 'pointer' }}>
                  Forgot?
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
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
            className="btn-accent"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '11px',
              fontSize: '0.88rem',
              marginTop: '6px'
            }}
          >
            <span>{isLoading ? 'Authenticating...' : isSignUp ? 'Create Developer Account' : 'Sign In to Workspace'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Demo Login Shortcut */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '9px',
              fontSize: '0.8rem',
              background: 'rgba(59, 130, 246, 0.08)',
              borderColor: 'rgba(59, 130, 246, 0.3)'
            }}
          >
            <Sparkles size={14} color="#60A5FA" />
            <span>Quick Demo Sign-In (Alex Chen)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
