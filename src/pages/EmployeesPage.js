import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Save, Search, UserCheck, DollarSign, Calendar } from 'lucide-react';

const ROLES = [
  { value: 'professeur', label: 'Professeur' },
  { value: 'administratif', label: 'Administratif' },
  { value: 'technicien', label: 'Technicien' },
  { value: 'chauffeur', label: 'Chauffeur' },
  { value: 'autre', label: 'Autre' },
];

function EmployeeModal({ employee, onSave, onClose }) {
  const [form, setForm] = useState({
    name: '', cin: '', phone: '', address: '', role: 'professeur',
    salary: 0, hiringDate: new Date().toISOString().slice(0, 10), notes: '',
    ...employee,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.cin || !form.phone || !form.hiringDate) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }
    setSaving(true);
    try {
      if (employee?.id) await window.api.updateEmployee({ ...form, id: employee.id });
      else await window.api.createEmployee(form);
      onSave();
    } catch (e) { alert('Erreur: ' + e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-md">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <UserCheck size={20} style={{ color: 'var(--accent-orange)' }} />
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem' }}>
              {employee?.id ? 'Modifier Employé' : 'Nouvel Employé'}
            </h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="grid-2">
            <div className="form-group">
              <label className="label">Nom Complet *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">CIN *</label>
              <input className="input" value={form.cin} onChange={e => set('cin', e.target.value)} placeholder="AB123456" />
            </div>
            <div className="form-group">
              <label className="label">Téléphone *</label>
              <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Rôle *</label>
              <select className="input" value={form.role} onChange={e => set('role', e.target.value)}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Salaire de Base (DH)</label>
              <input type="number" className="input" value={form.salary} onChange={e => set('salary', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="form-group">
              <label className="label">Date d'Embauche *</label>
              <input type="date" className="input" value={form.hiringDate} onChange={e => set('hiringDate', e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="label">Adresse</label>
              <input className="input" value={form.address || ''} onChange={e => set('address', e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="label">Notes</label>
              <textarea className="input" value={form.notes || ''} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> : <Save size={15} />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

function SalaryModal({ employees, onSave, onClose }) {
  const [form, setForm] = useState({
    employeeId: '', month: new Date().toISOString().slice(0, 7),
    baseSalary: 0, bonus: 0, advance: 0, isPaid: true, notes: '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectEmployee = (emp) => {
    set('employeeId', emp.id);
    set('baseSalary', emp.salary);
  };

  const net = parseFloat(form.baseSalary || 0) + parseFloat(form.bonus || 0) - parseFloat(form.advance || 0);

  const handleSubmit = async () => {
    if (!form.employeeId || !form.baseSalary) { alert('Champs requis manquants'); return; }
    setSaving(true);
    try {
      await window.api.createSalary(form);
      onSave();
    } catch (e) { alert('Erreur: ' + e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-md">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <DollarSign size={20} style={{ color: 'var(--success)' }} />
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem' }}>Payer Salaire</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Employé *</label>
              <select className="input" value={form.employeeId} onChange={e => {
                const emp = employees.find(em => em.id === parseInt(e.target.value));
                if (emp) selectEmployee(emp);
              }}>
                <option value="">Sélectionner un employé...</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} - {e.role} ({e.salary} DH)</option>)}
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Mois *</label>
                <input type="month" className="input" value={form.month} onChange={e => set('month', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Salaire de Base (DH) *</label>
                <input type="number" className="input" value={form.baseSalary} onChange={e => set('baseSalary', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Prime / Bonus (DH)</label>
                <input type="number" className="input" value={form.bonus} onChange={e => set('bonus', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Avance déjà prise (DH)</label>
                <input type="number" className="input" value={form.advance} onChange={e => set('advance', e.target.value)} />
              </div>
            </div>
            <div style={{
              padding: '0.875rem 1rem',
              background: 'var(--success-dim)', border: '1px solid var(--success)',
              borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Salaire Net à Payer:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--success)' }}>{net.toFixed(2)} DH</span>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input type="checkbox" checked={form.isPaid} onChange={e => set('isPaid', e.target.checked)}
                style={{ accentColor: 'var(--success)', width: '16px', height: '16px' }} />
              Marquer comme payé
            </label>
            <div className="form-group">
              <label className="label">Notes</label>
              <textarea className="input" value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-success" onClick={handleSubmit} disabled={saving}>
            <DollarSign size={15} /> Enregistrer Salaire
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('employees');
  const [modal, setModal] = useState(null);
  const [salaryModal, setSalaryModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [e, s] = await Promise.all([
        window.api.getEmployees({ search, role: filterRole || undefined }),
        window.api.getSalaries({ month: filterMonth || undefined }),
      ]);
      setEmployees(e);
      setSalaries(s);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, filterRole, filterMonth]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    await window.api.deleteEmployee(id);
    setDeleteConfirm(null);
    load();
  };

  const totalSalaries = salaries.reduce((s, sal) => s + sal.netSalary, 0);

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">Employés & Enseignants</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {employees.length} employé{employees.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setSalaryModal(true)}>
            <DollarSign size={15} /> Payer Salaire
          </button>
          <button className="btn btn-primary" onClick={() => setModal('create')}>
            <Plus size={15} /> Nouvel Employé
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
        {[
          { id: 'employees', label: `Employés (${employees.length})` },
          { id: 'salaries', label: `Salaires - ${filterMonth}` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '0.625rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: `2px solid ${tab === t.id ? 'var(--accent-orange)' : 'transparent'}`,
            color: tab === t.id ? 'var(--accent-orange)' : 'var(--text-secondary)',
            fontWeight: tab === t.id ? '600' : '400', fontSize: '0.875rem',
            marginBottom: '-1px', transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'employees' && (
        <>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem' }} />
            </div>
            <select className="input" style={{ width: '180px' }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="">Tous les rôles</option>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>CIN</th>
                    <th>Rôle</th>
                    <th>Téléphone</th>
                    <th>Salaire</th>
                    <th>Embauché le</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                      <div className="spinner" style={{ margin: '0 auto' }} />
                    </td></tr>
                  ) : employees.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Aucun employé</td></tr>
                  ) : employees.map(e => (
                    <tr key={e.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '30px', height: '30px', borderRadius: '50%',
                            background: 'var(--info-dim)', border: '1px solid var(--info)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: '700', color: 'var(--info)',
                          }}>{e.name.charAt(0)}</div>
                          <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>{e.name}</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{e.cin}</td>
                      <td><span className="badge badge-info">{ROLES.find(r => r.value === e.role)?.label || e.role}</span></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{e.phone}</td>
                      <td style={{ fontWeight: '600', color: 'var(--success)' }}>{e.salary} DH</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{e.hiringDate?.slice(0, 10)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(e)}><Edit2 size={14} /></button>
                          <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteConfirm(e)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'salaries' && (
        <>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
            <input type="month" className="input" style={{ width: '180px' }} value={filterMonth} onChange={e => setFilterMonth(e.target.value)} />
            <div style={{
              marginLeft: 'auto',
              padding: '0.5rem 1rem',
              background: 'var(--success-dim)', border: '1px solid var(--success)',
              borderRadius: 'var(--radius)', fontSize: '0.875rem',
            }}>
              Total Salaires: <strong style={{ color: 'var(--success)' }}>{totalSalaries.toFixed(2)} DH</strong>
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Employé</th>
                    <th>Rôle</th>
                    <th>Mois</th>
                    <th>Base</th>
                    <th>Prime</th>
                    <th>Avance</th>
                    <th>Net</th>
                    <th>Statut</th>
                    <th>Date Paiement</th>
                  </tr>
                </thead>
                <tbody>
                  {salaries.length === 0 ? (
                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Aucun salaire enregistré pour ce mois</td></tr>
                  ) : salaries.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '500', fontSize: '0.875rem' }}>{s.employeeName}</td>
                      <td><span className="badge badge-gray">{s.role}</span></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{s.month}</td>
                      <td>{s.baseSalary} DH</td>
                      <td style={{ color: s.bonus > 0 ? 'var(--success)' : 'var(--text-muted)' }}>+{s.bonus} DH</td>
                      <td style={{ color: s.advance > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>-{s.advance} DH</td>
                      <td style={{ fontWeight: '700', color: 'var(--success)' }}>{s.netSalary} DH</td>
                      <td>
                        <span className={`badge ${s.isPaid ? 'badge-success' : 'badge-warning'}`}>
                          {s.isPaid ? 'Payé' : 'En attente'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.paidDate?.slice(0, 10) || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {modal && (
        <EmployeeModal
          employee={modal === 'create' ? null : modal}
          onSave={() => { setModal(null); load(); }}
          onClose={() => setModal(null)}
        />
      )}
      {salaryModal && (
        <SalaryModal
          employees={employees}
          onSave={() => { setSalaryModal(false); load(); }}
          onClose={() => setSalaryModal(false)}
        />
      )}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal modal-sm">
            <div className="modal-header">
              <h3 style={{ color: 'var(--danger)' }}>Supprimer l'employé</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setDeleteConfirm(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Confirmer la suppression de <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm.name}</strong> ?
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Annuler</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}><Trash2 size={15} /> Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
