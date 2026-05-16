import React, { useState, useEffect, useCallback } from 'react';
import { Bus, Plus, X, Save, Users, MapPin } from 'lucide-react';

function BusModal({ onSave, onClose }) {
  const [form, setForm] = useState({ name: '', plateNumber: '', capacity: 30, route: '' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.plateNumber) { alert('Champs requis'); return; }
    setSaving(true);
    try { await window.api.createBus(form); onSave(); }
    catch (e) { alert('Erreur: ' + e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-sm">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bus size={20} style={{ color: 'var(--accent-orange)' }} />
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem' }}>Nouveau Bus</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Nom du Bus *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Bus 1, Navette A..." />
            </div>
            <div className="form-group">
              <label className="label">Plaque d'Immatriculation *</label>
              <input className="input" value={form.plateNumber} onChange={e => set('plateNumber', e.target.value)} placeholder="12345-A-1" />
            </div>
            <div className="form-group">
              <label className="label">Capacité (places)</label>
              <input type="number" className="input" value={form.capacity} onChange={e => set('capacity', parseInt(e.target.value) || 30)} />
            </div>
            <div className="form-group">
              <label className="label">Itinéraire / Route</label>
              <textarea className="input" value={form.route} onChange={e => set('route', e.target.value)} placeholder="Description de l'itinéraire..." />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            <Save size={15} /> Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TransportPage() {
  const [buses, setBuses] = useState([]);
  const [students, setStudents] = useState([]);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, s] = await Promise.all([
        window.api.getBuses(),
        window.api.getStudents({ search: search || undefined }),
      ]);
      setBuses(b);
      setStudents(s.filter(s => s.hasTransport));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const totalTransportRevenue = students.reduce((sum, s) => sum + (s.transportFee || 0), 0);
  const totalCapacity = buses.reduce((sum, b) => sum + b.capacity, 0);

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">Transport Scolaire</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {students.length} élève{students.length !== 1 ? 's' : ''} abonné{students.length !== 1 ? 's' : ''} · {buses.length} bus
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Plus size={15} /> Ajouter Bus
        </button>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
        {[
          { label: 'Élèves Abonnés', value: students.length, color: 'var(--accent-orange)', icon: Users },
          { label: 'Capacité Totale', value: `${students.length} / ${totalCapacity}`, color: 'var(--info)', icon: Bus },
          { label: 'Revenus Transport', value: `${totalTransportRevenue} DH/mois`, color: 'var(--success)', icon: Bus },
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
                <div style={{ fontSize: '1.3rem', fontWeight: '700', color: item.color }}>{item.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Buses */}
        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
            FLOTTE DE BUS ({buses.length})
          </h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : buses.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <Bus size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.3, display: 'block' }} />
              Aucun bus enregistré
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {buses.map(bus => (
                <div key={bus.id} className="card card-hover">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: 'var(--accent-orange-dim)', border: '1px solid var(--accent-orange)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Bus size={22} style={{ color: 'var(--accent-orange)' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{bus.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{bus.plateNumber}</div>
                      </div>
                    </div>
                    <span className="badge badge-orange">{bus.capacity} places</span>
                  </div>
                  {bus.route && (
                    <div style={{ marginTop: '0.625rem', display: 'flex', alignItems: 'flex-start', gap: '0.375rem' }}>
                      <MapPin size={13} style={{ color: 'var(--text-muted)', marginTop: '1px', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{bus.route}</span>
                    </div>
                  )}
                  <div style={{ marginTop: '0.5rem', height: '4px', background: 'var(--bg-hover)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min((students.length / bus.capacity) * 100, 100)}%`,
                      height: '100%',
                      background: students.length >= bus.capacity ? 'var(--danger)' : 'var(--success)',
                      borderRadius: '2px', transition: 'width 0.5s'
                    }} />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Occupation: {Math.min(students.length, bus.capacity)} / {bus.capacity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transport students */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              ÉLÈVES ABONNÉS ({students.length})
            </h3>
            <input
              className="input input-sm"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '160px' }}
            />
          </div>
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap" style={{ maxHeight: '500px', overflow: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Élève</th>
                    <th>Classe</th>
                    <th>Parent</th>
                    <th>Tarif</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Aucun élève abonné au transport
                    </td></tr>
                  ) : students.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: '500', fontSize: '0.8rem' }}>{s.firstName} {s.lastName}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{s.code}</div>
                      </td>
                      <td><span className="badge badge-gray">{s.className}</span></td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{s.parentPhone}</td>
                      <td style={{ fontWeight: '600', color: 'var(--accent-orange)' }}>{s.transportFee} DH</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <BusModal onSave={() => { setModal(false); load(); }} onClose={() => setModal(false)} />
      )}
    </div>
  );
}
