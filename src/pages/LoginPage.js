import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Eye, EyeOff, Lock, User, GraduationCap, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await window.api.login(form);
      if (result.success) {
        login(result.user);
        navigate('/');
      } else {
        setError(result.error || 'Identifiants incorrects');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Left decorative panel */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #1a0a00 0%, #2d1500 40%, #1a0a00 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        {[300, 500, 700].map((size, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            border: `1px solid rgba(249,115,22,${0.08 - i * 0.02})`,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
          }} />
        ))}

        {/* Logo */}
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <img
            src="/logo.jpeg"
            alt="Le Schéma"
            style={{
              width: '160px',
              height: '160px',
              objectFit: 'contain',
              borderRadius: '20px',
              border: '3px solid rgba(249,115,22,0.3)',
              background: 'white',
              padding: '10px',
              marginBottom: '2rem',
            }}
          />
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '0.5rem',
          }}>
            Le Schéma
          </h1>
          <p style={{
            color: 'var(--accent-orange)',
            fontSize: '1rem',
            fontWeight: '500',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}>
            Innover · Créer · Exceller
          </p>
          <div style={{
            marginTop: '2rem',
            fontFamily: 'Amiri, serif',
            fontSize: '1.25rem',
            color: 'rgba(255,255,255,0.5)',
            direction: 'rtl',
          }}>
            نظام إدارة المدرسة
          </div>
        </div>

        {/* Bottom tagline */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '0.75rem',
        }}>
          School Manager Pro v1.0 · Système Offline
        </div>
      </div>

      {/* Right login form */}
      <div style={{
        width: '480px',
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
      }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          {/* Header */}
          <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
            <div style={{
              width: '56px', height: '56px',
              background: 'var(--accent-orange-dim)',
              border: '2px solid var(--accent-orange)',
              borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <GraduationCap size={28} style={{ color: 'var(--accent-orange)' }} />
            </div>
            <h2 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.75rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              Connexion
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Connectez-vous à votre espace
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="label">Nom d'utilisateur</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{
                  position: 'absolute', left: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)',
                }} />
                <input
                  type="text"
                  className="input"
                  placeholder="admin"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  style={{ paddingLeft: '2.5rem' }}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', left: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)',
                }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                  Connexion...
                </>
              ) : (
                'Se Connecter'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{
            marginTop: '2rem',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1rem',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>
              COMPTES PAR DÉFAUT
            </div>
            {[
              { u: 'admin', p: 'admin123', r: 'Administrateur' },
              { u: 'comptable', p: 'compta123', r: 'Comptable' },
              { u: 'secretaire', p: 'secr123', r: 'Secrétaire' },
            ].map(c => (
              <div key={c.u} style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: '0.78rem', color: 'var(--text-secondary)',
                padding: '0.2rem 0',
              }}>
                <span>{c.r}</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--accent-orange)' }}>{c.u} / {c.p}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            © 2026 Le Schéma · Tous droits réservés
          </div>
        </div>
      </div>
    </div>
  );
}
