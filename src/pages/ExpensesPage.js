import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Save, Search, TrendingDown, Filter } from 'lucide-react';

const CATEGORIES = [
  { value: 'fixe', label: 'Dépense Fixe', color: 'var(--info)' },
  { value: 'variable', label: 'Dépense Variable', color: 'var(--warning)' },
];

const SUBCATEGORIES = {
  fixe: ['Loyer', 'Électricité', 'Eau', 'Internet', 'Salaires', 'Autre'],
  variable: ['Réparations', 'Fournitures', 'Activités', 'Nettoyage', 'Autre'],
};

function ExpenseModal({ expense, onSave, onClose }) {
  const [form, setForm] = useState({
    title: '', amount: 0,
    date: new Date().toISOString().slice(0, 10),
    category: 'fixe', subcategory: '', description: '',
    ...expense,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title || !form.amount || !form.date) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }
    setSaving(true);
    try {
      if (expense?.id) await window.api.updateExpense({ ...form, id: expense.id });
      else await window.api.createExpense(form);
      onSave();
    } catch (e) { alert('Erreur: ' + e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-md">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <TrendingDown size={20} style={{ color: 'var(--danger)' }} />
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem' }}>
              {expense?.id ? 'Modifier la Dépense' : 'Nouvelle Dépense'}
            </h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Titre *</label>
              <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Facture électricité" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Montant (DH) *</label>
                <input type="number" className="input" value={form.amount} onChange={e => set('amount', parseFloat(e.target.value) || 0)} />
              </div>
              <div className="form-group">
                <label className="label">Date *</label>
                <input type="date" className="input" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Catégorie *</label>
                <select className="input" value={form.category} onChange={e => { set('category', e.target.value); set('subcategory', ''); }}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Sous-catégorie</label>
                <select className="input" value={form.subcategory} onChange={e => set('subcategory', e.target.value)}>
                  <option value="">Sélectionner...</option>
                  {(SUBCATEGORIES[form.category] || []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="label">Description</label>
              <textarea className="input" value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Détails de la dépense..." />
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

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await window.api.getExpenses({
        search: search || undefined,
        category: filterCat || undefined,
        month: filterMonth || undefined,
      });
      setExpenses(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, filterCat, filterMonth]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    await window.api.deleteExpense(id);
    setDeleteConfirm(null);
    load();
  };

  const totalFixed = expenses.filter(e => e.category === 'fixe').reduce((s, e) => s + e.amount, 0);
  const totalVariable = expenses.filter(e => e.category === 'variable').reduce((s, e) => s + e.amount, 0);
  const total = totalFixed + totalVariable;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">Gestion des Dépenses</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {expenses.length} dépense{expenses.length !== 1 ? 's' : ''} · Total: {total.toFixed(0)} DH
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          <Plus size={15} /> Nouvelle Dépense
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
        {[
          { label: 'Dépenses Fixes', value: `${totalFixed.toFixed(0)} DH`, color: 'var(--info)', pct: total > 0 ? (totalFixed / total * 100).toFixed(0) : 0 },
          { label: 'Dépenses Variables', value: `${totalVariable.toFixed(0)} DH`, color: 'var(--warning)', pct: total > 0 ? (totalVariable / total * 100).toFixed(0) : 0 },
          { label: 'Total', value: `${total.toFixed(0)} DH`, color: 'var(--danger)', pct: 100 },
        ].map((item, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: '700', color: item.color }}>{item.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{item.label}</div>
              </div>
              <span className="badge" style={{ background: `${item.color}20`, color: item.color }}>{item.pct}%</span>
            </div>
            {/* Mini progress bar */}
            <div style={{ marginTop: '0.75rem', height: '4px', background: 'var(--bg-hover)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: '2px', transition: 'width 0.5s' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Rechercher une dépense..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem' }} />
        </div>
        <input type="month" className="input" style={{ width: '180px' }} value={filterMonth} onChange={e => setFilterMonth(e.target.value)} />
        <select className="input" style={{ width: '200px' }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">Toutes catégories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        {(filterCat || search) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterCat(''); setSearch(''); }}>
            <X size={14} /> Réinitialiser
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Sous-catégorie</th>
                <th>Montant</th>
                <th>Date</th>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Aucune dépense pour cette période
                </td></tr>
              ) : expenses.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: '500', fontSize: '0.875rem' }}>{e.title}</td>
                  <td>
                    <span className={`badge ${e.category === 'fixe' ? 'badge-info' : 'badge-warning'}`}>
                      {CATEGORIES.find(c => c.value === e.category)?.label || e.category}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{e.subcategory || '—'}</td>
                  <td style={{ fontWeight: '700', color: 'var(--danger)' }}>{e.amount.toFixed(2)} DH</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{e.date?.slice(0, 10)}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {e.description || '—'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(e)}><Edit2 size={14} /></button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteConfirm(e)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {expenses.length > 0 && (
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--border)' }}>
                  <td colSpan={3} style={{ padding: '0.75rem 1rem', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    TOTAL ({expenses.length} dépenses)
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--danger)', fontSize: '1rem' }}>
                    {total.toFixed(2)} DH
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {modal && (
        <ExpenseModal
          expense={modal === 'create' ? null : modal}
          onSave={() => { setModal(null); load(); }}
          onClose={() => setModal(null)}
        />
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal modal-sm">
            <div className="modal-header">
              <h3 style={{ color: 'var(--danger)' }}>Supprimer la Dépense</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setDeleteConfirm(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Supprimer <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm.title}</strong> ({deleteConfirm.amount} DH) ?
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
