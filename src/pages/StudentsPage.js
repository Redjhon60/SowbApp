import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Filter, Edit2, Trash2, Eye, GraduationCap,
  Bus, Shield, Phone, X, Save, ChevronDown, UserX
} from 'lucide-react';

const CLASSES = ['PS','MS','GS','CP','CE1','CE2','CM1','CM2','6EME','1AC','2AC','3AC','TC','1BAC','2BAC'];
const GENDERS = [{ value: 'M', label: 'Masculin / ذكر' }, { value: 'F', label: 'Féminin / أنثى' }];

function StudentModal({ student, classes, onSave, onClose }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', gender: 'M', dateOfBirth: '',
    address: '', parentName: '', parentPhone: '', emergencyPhone: '',
    classId: classes[0]?.id || 1, hasTransport: false, insurancePaid: false,
    monthlyFee: 1200, transportFee: 300, insuranceFee: 300, notes: '',
    ...student,
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.parentName || !form.parentPhone) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }
    setSaving(true);
    try {
      if (student?.id) {
        await window.api.updateStudent({ ...form, id: student.id });
      } else {
        await window.api.createStudent(form);
      }
      onSave();
    } catch (e) {
      alert('Erreur: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-xl">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <GraduationCap size={20} style={{ color: 'var(--accent-orange)' }} />
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem' }}>
              {student?.id ? 'Modifier l\'Élève' : 'Nouvel Élève'}
            </h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Prénom *</label>
              <input className="input" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Prénom" />
            </div>
            <div className="form-group">
              <label className="label">Nom *</label>
              <input className="input" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Nom de famille" />
            </div>
            <div className="form-group">
              <label className="label">Genre</label>
              <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)}>
                {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Date de Naissance</label>
              <input type="date" className="input" value={form.dateOfBirth || ''} onChange={e => set('dateOfBirth', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Classe *</label>
              <select className="input" value={form.classId} onChange={e => set('classId', parseInt(e.target.value))}>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} - {c.level}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Adresse</label>
              <input className="input" value={form.address || ''} onChange={e => set('address', e.target.value)} placeholder="Adresse" />
            </div>
            <div className="form-group">
              <label className="label">Nom du Parent *</label>
              <input className="input" value={form.parentName} onChange={e => set('parentName', e.target.value)} placeholder="Nom complet" />
            </div>
            <div className="form-group">
              <label className="label">Téléphone Parent *</label>
              <input className="input" value={form.parentPhone} onChange={e => set('parentPhone', e.target.value)} placeholder="06 XX XX XX XX" />
            </div>
            <div className="form-group">
              <label className="label">Téléphone Urgence</label>
              <input className="input" value={form.emergencyPhone || ''} onChange={e => set('emergencyPhone', e.target.value)} placeholder="06 XX XX XX XX" />
            </div>
          </div>

          <hr className="divider" />
          <div style={{ fontWeight: '600', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Tarification & Options
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Mensualité (DH)</label>
              <input type="number" className="input" value={form.monthlyFee} onChange={e => set('monthlyFee', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="form-group">
              <label className="label">Transport (DH)</label>
              <input type="number" className="input" value={form.transportFee} onChange={e => set('transportFee', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="form-group">
              <label className="label">Assurance (DH)</label>
              <input type="number" className="input" value={form.insuranceFee} onChange={e => set('insuranceFee', parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={form.hasTransport} onChange={e => set('hasTransport', e.target.checked)}
                style={{ accentColor: 'var(--accent-orange)', width: '16px', height: '16px' }} />
              Abonné Transport
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={form.insurancePaid} onChange={e => set('insurancePaid', e.target.checked)}
                style={{ accentColor: 'var(--success)', width: '16px', height: '16px' }} />
              Assurance Payée
            </label>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="label">Notes</label>
            <textarea className="input" value={form.notes || ''} onChange={e => set('notes', e.target.value)} placeholder="Remarques..." />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />Enregistrement...</> : <><Save size={15} />Enregistrer</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | student obj
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([
        window.api.getStudents({ search, classId: filterClass || undefined }),
        window.api.getClasses(),
      ]);
      setStudents(s);
      setClasses(c);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, filterClass]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    await window.api.deleteStudent(id);
    setDeleteConfirm(null);
    load();
  };

  const handleSave = () => {
    setModal(null);
    load();
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">Gestion des Élèves</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {students.length} élève{students.length !== 1 ? 's' : ''} inscrit{students.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          <Plus size={16} />
          Nouvel Élève
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input"
            placeholder="Rechercher par nom, code, téléphone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
        <select className="input" style={{ width: '180px' }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
          <option value="">Toutes les classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Élève</th>
                <th>Classe</th>
                <th>Parent</th>
                <th>Téléphone</th>
                <th>Mensualité</th>
                <th>Transport</th>
                <th>Assurance</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="spinner" />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Chargement...</span>
                  </div>
                </td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <UserX size={40} style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.4 }} />
                  Aucun élève trouvé
                </td></tr>
              ) : students.map(s => (
                <tr key={s.id}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent-orange)' }}>{s.code}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'var(--accent-orange-dim)',
                        border: '1px solid var(--accent-orange)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-orange)',
                        flexShrink: 0,
                      }}>
                        {s.firstName.charAt(0)}{s.lastName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{s.firstName} {s.lastName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.gender === 'M' ? '♂' : '♀'}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-gray">{s.className}</span></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.parentName}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Phone size={12} style={{ color: 'var(--text-muted)' }} />
                      {s.parentPhone}
                    </span>
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{s.monthlyFee} DH</td>
                  <td>
                    {s.hasTransport
                      ? <span className="badge badge-info"><Bus size={10} /> Oui</span>
                      : <span className="badge badge-gray">Non</span>}
                  </td>
                  <td>
                    {s.insurancePaid
                      ? <span className="badge badge-success"><Shield size={10} /> Payée</span>
                      : <span className="badge badge-warning">En attente</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Profil" onClick={() => navigate(`/students/${s.id}`)}>
                        <Eye size={15} />
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Modifier" onClick={() => setModal(s)}>
                        <Edit2 size={15} />
                      </button>
                      <button className="btn btn-danger btn-icon btn-sm" title="Supprimer" onClick={() => setDeleteConfirm(s)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <StudentModal
          student={modal === 'create' ? null : modal}
          classes={classes}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal modal-sm">
            <div className="modal-header">
              <h3 style={{ color: 'var(--danger)' }}>Confirmer la Suppression</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setDeleteConfirm(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Êtes-vous sûr de vouloir supprimer l'élève <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm.firstName} {deleteConfirm.lastName}</strong> ?
                Cette action est irréversible.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Annuler</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>
                <Trash2 size={15} /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
