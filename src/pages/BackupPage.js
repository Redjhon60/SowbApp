import React, { useState, useEffect } from 'react';
import { HardDrive, Download, Upload, Plus, CheckCircle, AlertCircle, RefreshCw, Shield } from 'lucide-react';

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function BackupPage() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState(null);

  const load = async () => {
    setLoading(true);
    const b = await window.api.listBackups();
    setBackups(b);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const result = await window.api.createBackup();
      if (result.success) {
        setMessage({ type: 'success', text: `Sauvegarde créée: ${result.filename}` });
        load();
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setCreating(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleExport = async () => {
    const result = await window.api.exportBackup();
    if (result.success) {
      setMessage({ type: 'success', text: `Exporté vers: ${result.path}` });
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const autoBackups = backups.filter(b => b.type === 'auto');
  const manualBackups = backups.filter(b => b.type === 'manual');

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">Sauvegarde</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {backups.length} sauvegarde{backups.length !== 1 ? 's' : ''} disponible{backups.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={15} /> Exporter .db
          </button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
            {creating ? <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />Sauvegarde...</> : <><Plus size={15} />Sauvegarder Maintenant</>}
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '1rem' }}>
          {message.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {message.text}
        </div>
      )}

      {/* Info cards */}
      <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
        {[
          { label: 'Sauvegardes Totales', value: backups.length, color: 'var(--accent-orange)', icon: HardDrive },
          { label: 'Automatiques', value: autoBackups.length, color: 'var(--info)', icon: RefreshCw },
          { label: 'Manuelles', value: manualBackups.length, color: 'var(--success)', icon: Shield },
        ].map((item, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: `${item.color}20`, border: `1px solid ${item.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <item.icon size={20} style={{ color: item.color }} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: item.color }}>{item.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
        <Shield size={15} />
        Les sauvegardes automatiques sont effectuées quotidiennement. Conservez des copies sur un disque externe pour plus de sécurité.
      </div>

      {/* Backups list */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: '600', fontSize: '0.875rem' }}>
          Historique des Sauvegardes
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fichier</th>
                <th>Type</th>
                <th>Taille</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </td></tr>
              ) : backups.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Aucune sauvegarde. Créez votre première sauvegarde maintenant.
                </td></tr>
              ) : backups.map(b => (
                <tr key={b.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <HardDrive size={15} style={{ color: 'var(--accent-orange)', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-primary)' }}>{b.filename}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${b.type === 'auto' ? 'badge-info' : 'badge-success'}`}>
                      {b.type === 'auto' ? '⟳ Auto' : '✓ Manuel'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatSize(b.size)}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {b.createdAt ? new Date(b.createdAt).toLocaleString('fr-MA') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
