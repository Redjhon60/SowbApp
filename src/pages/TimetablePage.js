import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, Trash2, X, Save, Printer } from 'lucide-react';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const SUBJECTS = ['Mathématiques', 'Français', 'Arabe', 'Anglais', 'Sciences', 'Histoire-Géo', 'Éducation Islamique', 'Sport', 'Informatique', 'Arts Plastiques', 'Autre'];

const SUBJECT_COLORS = {
  'Mathématiques': '#3b82f6',
  'Français': '#8b5cf6',
  'Arabe': '#f59e0b',
  'Anglais': '#10b981',
  'Sciences': '#06b6d4',
  'Histoire-Géo': '#f97316',
  'Éducation Islamique': '#84cc16',
  'Sport': '#ec4899',
  'Informatique': '#6366f1',
  'Arts Plastiques': '#ef4444',
  'Autre': '#6b7280',
};

function ScheduleModal({ classId, onSave, onClose }) {
  const [form, setForm] = useState({ classId, day: 'Lundi', startTime: '08:00', endTime: '09:00', subject: 'Mathématiques', teacher: '', room: '' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.teacher || !form.subject) { alert('Champs requis'); return; }
    setSaving(true);
    try { await window.api.createSchedule(form); onSave(); }
    catch (e) { alert('Erreur: ' + e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-md">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Calendar size={20} style={{ color: 'var(--accent-orange)' }} />
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem' }}>Ajouter Cours</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="grid-2">
            <div className="form-group">
              <label className="label">Jour *</label>
              <select className="input" value={form.day} onChange={e => set('day', e.target.value)}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Matière *</label>
              <select className="input" value={form.subject} onChange={e => set('subject', e.target.value)}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Heure Début *</label>
              <input type="time" className="input" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Heure Fin *</label>
              <input type="time" className="input" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Enseignant *</label>
              <input className="input" value={form.teacher} onChange={e => set('teacher', e.target.value)} placeholder="Nom de l'enseignant" />
            </div>
            <div className="form-group">
              <label className="label">Salle</label>
              <input className="input" value={form.room || ''} onChange={e => set('room', e.target.value)} placeholder="Salle 1, Terrain..." />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            <Save size={15} /> Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TimetablePage() {
  const [classes, setClasses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.api.getClasses().then(c => {
      setClasses(c);
      if (c.length > 0) setSelectedClass(c[0]);
    });
  }, []);

  const load = useCallback(async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const data = await window.api.getSchedules(selectedClass.id);
      setSchedules(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [selectedClass]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce cours ?')) return;
    await window.api.deleteSchedule(id);
    load();
  };

  const getScheduleForSlot = (day, hour) => {
    return schedules.filter(s => s.day === day && s.startTime <= hour && s.endTime > hour);
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">Emploi du Temps</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {selectedClass ? `Classe: ${selectedClass.name}` : 'Sélectionner une classe'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={15} /> Imprimer
          </button>
          {selectedClass && (
            <button className="btn btn-primary" onClick={() => setModal(true)}>
              <Plus size={15} /> Ajouter Cours
            </button>
          )}
        </div>
      </div>

      {/* Class selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {classes.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedClass(c)}
            className={`btn ${selectedClass?.id === c.id ? 'btn-primary' : 'btn-ghost'} btn-sm`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {!selectedClass ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.3, display: 'block' }} />
          Sélectionnez une classe pour afficher son emploi du temps
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : (
        <>
          {/* Timetable grid */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: '900px', borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)' }}>
                    <th style={{ padding: '0.75rem 1rem', width: '80px', borderRight: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      Heure
                    </th>
                    {DAYS.map(day => (
                      <th key={day} style={{
                        padding: '0.75rem 0.5rem', textAlign: 'center',
                        borderRight: '1px solid var(--border)',
                        fontSize: '0.8rem', fontWeight: '600',
                        color: 'var(--text-primary)',
                      }}>{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOURS.map(hour => (
                    <tr key={hour} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{
                        padding: '0.375rem 0.75rem', borderRight: '1px solid var(--border)',
                        fontSize: '0.75rem', color: 'var(--accent-orange)',
                        fontFamily: 'monospace', fontWeight: '600',
                        background: 'var(--bg-tertiary)',
                      }}>
                        {hour}
                      </td>
                      {DAYS.map(day => {
                        const slots = getScheduleForSlot(day, hour);
                        return (
                          <td key={day} style={{
                            padding: '0.25rem',
                            borderRight: '1px solid var(--border-light)',
                            verticalAlign: 'top',
                            minHeight: '50px',
                            height: '50px',
                          }}>
                            {slots.map(slot => {
                              const color = SUBJECT_COLORS[slot.subject] || '#6b7280';
                              return (
                                <div key={slot.id} style={{
                                  background: `${color}20`,
                                  border: `1px solid ${color}60`,
                                  borderLeft: `3px solid ${color}`,
                                  borderRadius: '4px',
                                  padding: '3px 6px',
                                  fontSize: '0.72rem',
                                  position: 'relative',
                                  group: 'true',
                                }}>
                                  <div style={{ fontWeight: '600', color: color, marginBottom: '1px' }}>
                                    {slot.subject}
                                  </div>
                                  <div style={{ color: 'var(--text-muted)' }}>{slot.teacher}</div>
                                  {slot.room && <div style={{ color: 'var(--text-muted)' }}>🏫 {slot.room}</div>}
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                    {slot.startTime} - {slot.endTime}
                                  </div>
                                  <button
                                    onClick={() => handleDelete(slot.id)}
                                    style={{
                                      position: 'absolute', top: '2px', right: '2px',
                                      background: 'none', border: 'none', cursor: 'pointer',
                                      color: 'var(--danger)', opacity: 0.6, padding: '1px',
                                      fontSize: '10px',
                                    }}
                                    title="Supprimer"
                                  >✕</button>
                                </div>
                              );
                            })}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {Object.entries(SUBJECT_COLORS).map(([subj, color]) => (
              <div key={subj} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color, flexShrink: 0 }} />
                {subj}
              </div>
            ))}
          </div>
        </>
      )}

      {modal && selectedClass && (
        <ScheduleModal
          classId={selectedClass.id}
          onSave={() => { setModal(false); load(); }}
          onClose={() => setModal(false)}
        />
      )}
    </div>
  );
}
