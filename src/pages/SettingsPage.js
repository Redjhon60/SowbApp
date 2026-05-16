import React, { useState, useEffect } from 'react';
import { Settings, Save, Building, Phone, Mail, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    school_name: '', school_address: '', school_phone: '', school_email: '',
    currency: 'DH', insurance_fee: '300', receipt_footer: '',
    backup_auto: '1', backup_frequency: 'daily', language: 'fr',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    window.api.getSettings().then(s => setSettings(prev => ({ ...prev, ...s })));
  }, []);

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await window.api.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { alert('Erreur: ' + e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">Paramètres</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Configuration de l'application</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {saved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.875rem' }}>
              <CheckCircle size={16} /> Sauvegardé !
            </div>
          )}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> : <Save size={15} />}
            Enregistrer
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* School Info */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <Building size={18} style={{ color: 'var(--accent-orange)' }} />
            <h3 style={{ fontWeight: '600', fontSize: '0.9rem' }}>Informations de l'École</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Nom de l'École</label>
              <input className="input" value={settings.school_name} onChange={e => set('school_name', e.target.value)} placeholder="Le Schéma" />
            </div>
            <div className="form-group">
              <label className="label">Adresse</label>
              <textarea className="input" value={settings.school_address} onChange={e => set('school_address', e.target.value)} placeholder="Adresse complète..." />
            </div>
            <div className="form-group">
              <label className="label">Téléphone</label>
              <input className="input" value={settings.school_phone} onChange={e => set('school_phone', e.target.value)} placeholder="+212 6XX XX XX XX" />
            </div>
            <div className="form-group">
              <label className="label">Email</label>
              <input type="email" className="input" value={settings.school_email} onChange={e => set('school_email', e.target.value)} placeholder="contact@ecole.ma" />
            </div>
          </div>
        </div>

        {/* Financial & Receipt Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <DollarSign size={18} style={{ color: 'var(--success)' }} />
              <h3 style={{ fontWeight: '600', fontSize: '0.9rem' }}>Paramètres Financiers</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="label">Devise</label>
                <select className="input" value={settings.currency} onChange={e => set('currency', e.target.value)}>
                  <option value="DH">Dirham Marocain (DH)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollar ($)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Frais d'Assurance par Défaut (DH)</label>
                <input type="number" className="input" value={settings.insurance_fee} onChange={e => set('insurance_fee', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Pied de Page des Reçus</label>
                <input className="input" value={settings.receipt_footer} onChange={e => set('receipt_footer', e.target.value)} placeholder="Merci de votre confiance" />
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <Settings size={18} style={{ color: 'var(--info)' }} />
              <h3 style={{ fontWeight: '600', fontSize: '0.9rem' }}>Sauvegarde Automatique</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={settings.backup_auto === '1'} onChange={e => set('backup_auto', e.target.checked ? '1' : '0')}
                  style={{ accentColor: 'var(--accent-orange)', width: '18px', height: '18px' }} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>Sauvegarde automatique activée</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sauvegarde quotidienne de la base de données</div>
                </div>
              </label>
              <div className="alert alert-info" style={{ fontSize: '0.8rem' }}>
                <AlertCircle size={14} />
                Les sauvegardes sont stockées localement sur cet appareil. Exportez-les régulièrement vers un disque externe.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credentials info */}
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
          <Settings size={18} style={{ color: 'var(--warning)' }} />
          <h3 style={{ fontWeight: '600', fontSize: '0.9rem' }}>Comptes Utilisateurs</h3>
        </div>
        <div className="alert alert-warning" style={{ fontSize: '0.8rem' }}>
          <AlertCircle size={14} />
          Pour modifier les mots de passe des comptes, contactez l'administrateur système. Les mots de passe sont stockés de manière sécurisée dans la base de données locale.
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { role: 'Admin', username: 'admin', color: 'var(--accent-orange)' },
            { role: 'Comptable', username: 'comptable', color: 'var(--accent-gold)' },
            { role: 'Secrétaire', username: 'secretaire', color: 'var(--info)' },
          ].map(u => (
            <div key={u.username} style={{
              padding: '0.5rem 0.875rem',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', display: 'flex', gap: '0.5rem', alignItems: 'center',
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.color }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.role}:</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: u.color }}>{u.username}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
