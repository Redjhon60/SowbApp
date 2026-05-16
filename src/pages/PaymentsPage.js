import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, CreditCard, Printer, Download, X, Save,
  CheckCircle, AlertCircle, Filter, Receipt
} from 'lucide-react';
import { generateReceiptPDF } from '../utils/receiptGenerator';

const PAYMENT_TYPES = [
  { value: 'mensualite', label: 'Mensualité' },
  { value: 'assurance', label: 'Assurance' },
  { value: 'transport', label: 'Transport' },
  { value: 'autre', label: 'Autre' },
];

const PAYMENT_METHODS = [
  { value: 'especes', label: 'Espèces' },
  { value: 'cheque', label: 'Chèque' },
  { value: 'virement', label: 'Virement' },
];

function PaymentModal({ students, onSave, onClose }) {
  const [form, setForm] = useState({
    studentId: '', type: 'mensualite', month: new Date().toISOString().slice(0, 7),
    amount: 0, amountPaid: 0, paymentMethod: 'especes', notes: '',
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [searchStudent, setSearchStudent] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const filteredStudents = students.filter(s =>
    `${s.firstName} ${s.lastName} ${s.code}`.toLowerCase().includes(searchStudent.toLowerCase())
  ).slice(0, 8);

  const selectStudent = (s) => {
    setSelectedStudent(s);
    set('studentId', s.id);
    setSearchStudent(`${s.firstName} ${s.lastName}`);
    // Auto-fill amount based on type
    const amounts = {
      mensualite: s.monthlyFee + (s.hasTransport ? s.transportFee : 0),
      assurance: s.insuranceFee,
      transport: s.transportFee,
      autre: 0,
    };
    set('amount', amounts[form.type] || 0);
    set('amountPaid', amounts[form.type] || 0);
  };

  useEffect(() => {
    if (selectedStudent) {
      const amounts = {
        mensualite: selectedStudent.monthlyFee + (selectedStudent.hasTransport ? selectedStudent.transportFee : 0),
        assurance: selectedStudent.insuranceFee,
        transport: selectedStudent.transportFee,
        autre: 0,
      };
      set('amount', amounts[form.type] || 0);
      set('amountPaid', amounts[form.type] || 0);
    }
  }, [form.type]);

  const handleSubmit = async () => {
    if (!form.studentId || !form.amount || !form.amountPaid) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setSaving(true);
    try {
      const result = await window.api.createPayment(form);
      setReceipt(result);
    } catch (e) {
      alert('Erreur: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = async () => {
    if (!receipt) return;
    try {
      const pdfBytes = await generateReceiptPDF(receipt);
      const base64 = btoa(String.fromCharCode(...pdfBytes));
      await window.api.saveReceipt({ receiptNumber: receipt.receiptNumber, pdfData: base64 });
      // Print by opening
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url);
      if (win) win.print();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = async () => {
    if (!receipt) return;
    try {
      const pdfBytes = await generateReceiptPDF(receipt);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${receipt.receiptNumber}.pdf`;
      a.click();
    } catch (e) {
      console.error(e);
    }
  };

  // Receipt preview
  if (receipt) {
    const s = receipt.student;
    const p = receipt.payment;
    return (
      <div className="modal-overlay">
        <div className="modal modal-md">
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle size={20} style={{ color: 'var(--success)' }} />
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem' }}>
                Paiement Enregistré
              </h2>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={() => { onSave(); onClose(); }}><X size={18} /></button>
          </div>
          <div className="modal-body">
            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
              <CheckCircle size={16} />
              Paiement enregistré avec succès · Reçu: <strong>{receipt.receiptNumber}</strong>
            </div>

            {/* Receipt preview */}
            <div style={{
              background: 'white', color: '#111', padding: '1.5rem',
              borderRadius: '8px', fontFamily: 'DM Sans, sans-serif', fontSize: '12px',
            }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #f97316', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: '700', color: '#f97316' }}>
                  {receipt.settings?.school_name || 'Le Schéma'}
                </div>
                <div style={{ fontSize: '10px', color: '#666' }}>{receipt.settings?.school_address}</div>
                <div style={{ fontSize: '10px', color: '#666' }}>Tél: {receipt.settings?.school_phone}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#888' }}>N° REÇU</div>
                  <div style={{ fontWeight: '700', color: '#f97316', fontFamily: 'monospace' }}>{receipt.receiptNumber}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#888' }}>DATE</div>
                  <div style={{ fontWeight: '600' }}>{new Date(p.paymentDate).toLocaleDateString('fr-MA')}</div>
                </div>
              </div>

              <div style={{ background: '#f8f9fa', padding: '0.5rem', borderRadius: '4px', marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: '700' }}>{s.firstName} {s.lastName}</div>
                <div style={{ color: '#666' }}>{s.className} · Code: {s.code}</div>
                <div style={{ color: '#666' }}>Parent: {s.parentName}</div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.75rem' }}>
                <thead>
                  <tr style={{ background: '#f97316', color: 'white' }}>
                    <th style={{ padding: '4px 8px', textAlign: 'left' }}>Description</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right' }}>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px 8px', borderBottom: '1px solid #eee' }}>
                      {PAYMENT_TYPES.find(t => t.value === p.type)?.label || p.type}
                      {p.month ? ` - ${p.month}` : ''}
                    </td>
                    <td style={{ padding: '4px 8px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{p.amount} DH</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style={{ background: '#f8f9fa', fontWeight: '700' }}>
                    <td style={{ padding: '4px 8px' }}>TOTAL PAYÉ</td>
                    <td style={{ padding: '4px 8px', textAlign: 'right', color: '#16a34a' }}>{p.amountPaid} DH</td>
                  </tr>
                  {p.remaining > 0 && (
                    <tr style={{ color: '#dc2626' }}>
                      <td style={{ padding: '4px 8px' }}>RESTE</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{p.remaining} DH</td>
                    </tr>
                  )}
                </tfoot>
              </table>

              <div style={{ textAlign: 'center', fontSize: '10px', color: '#888', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                {receipt.settings?.receipt_footer || 'Merci de votre confiance'}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => { onSave(); onClose(); }}>Fermer</button>
            <button className="btn btn-secondary" onClick={handleDownload}>
              <Download size={15} /> Télécharger PDF
            </button>
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={15} /> Imprimer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CreditCard size={20} style={{ color: 'var(--accent-orange)' }} />
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem' }}>Nouveau Paiement</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Student search */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="label">Élève *</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  placeholder="Rechercher un élève..."
                  value={searchStudent}
                  onChange={e => { setSearchStudent(e.target.value); set('studentId', ''); setSelectedStudent(null); }}
                />
                {searchStudent && !selectedStudent && filteredStudents.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)',
                    maxHeight: '200px', overflow: 'auto',
                  }}>
                    {filteredStudents.map(s => (
                      <div
                        key={s.id}
                        onClick={() => selectStudent(s)}
                        style={{
                          padding: '0.5rem 0.75rem', cursor: 'pointer',
                          borderBottom: '1px solid var(--border-light)',
                          fontSize: '0.875rem',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                      >
                        <span style={{ fontWeight: '500' }}>{s.firstName} {s.lastName}</span>
                        <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.78rem' }}>
                          {s.code} · {s.className}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedStudent && (
                <div style={{
                  marginTop: '0.5rem', padding: '0.5rem 0.75rem',
                  background: 'var(--accent-orange-dim)', border: '1px solid var(--accent-orange)',
                  borderRadius: 'var(--radius)', fontSize: '0.8rem',
                  display: 'flex', justifyContent: 'space-between',
                }}>
                  <span>
                    <strong>{selectedStudent.firstName} {selectedStudent.lastName}</strong>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>· {selectedStudent.className}</span>
                  </span>
                  <span style={{ color: 'var(--accent-orange)' }}>
                    Mensualité: {selectedStudent.monthlyFee} DH
                    {selectedStudent.hasTransport ? ` + Transport: ${selectedStudent.transportFee} DH` : ''}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="label">Type de Paiement *</label>
              <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
                {PAYMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {form.type === 'mensualite' && (
              <div className="form-group">
                <label className="label">Mois *</label>
                <input type="month" className="input" value={form.month} onChange={e => set('month', e.target.value)} />
              </div>
            )}

            <div className="form-group">
              <label className="label">Montant Total (DH) *</label>
              <input type="number" className="input" value={form.amount} onChange={e => set('amount', parseFloat(e.target.value) || 0)} />
            </div>

            <div className="form-group">
              <label className="label">Montant Payé (DH) *</label>
              <input type="number" className="input" value={form.amountPaid} onChange={e => set('amountPaid', parseFloat(e.target.value) || 0)} />
            </div>

            {form.amount > form.amountPaid && (
              <div className="alert alert-warning" style={{ gridColumn: '1 / -1' }}>
                <AlertCircle size={15} />
                Paiement partiel · Reste: <strong>{(form.amount - form.amountPaid).toFixed(2)} DH</strong>
              </div>
            )}

            <div className="form-group">
              <label className="label">Mode de Paiement</label>
              <select className="input" value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
                {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Notes</label>
              <input className="input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Remarque optionnelle..." />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />Enregistrement...</> : <><Save size={15} />Enregistrer & Générer Reçu</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [unpaid, setUnpaid] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [tab, setTab] = useState('all');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterType, setFilterType] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, s, u] = await Promise.all([
        window.api.getPayments({ month: filterMonth || undefined, type: filterType || undefined }),
        window.api.getStudents({}),
        window.api.getUnpaidStudents(),
      ]);
      setPayments(p);
      setStudents(s);
      setUnpaid(u);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filterMonth, filterType]);

  useEffect(() => { load(); }, [load]);

  const totalRevenue = payments.reduce((s, p) => s + p.amountPaid, 0);
  const totalRemaining = payments.reduce((s, p) => s + p.remaining, 0);

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">Gestion des Paiements</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {payments.length} paiement{payments.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Plus size={16} /> Nouveau Paiement
        </button>
      </div>

      {/* Summary */}
      <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
        {[
          { label: 'Total Encaissé', value: `${totalRevenue.toFixed(0)} DH`, color: 'var(--success)' },
          { label: 'Reste à Payer', value: `${totalRemaining.toFixed(0)} DH`, color: 'var(--danger)' },
          { label: 'Élèves Impayés (mois)', value: unpaid.length, color: 'var(--warning)' },
        ].map((item, i) => (
          <div key={i} className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: item.color }}>{item.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
        {[
          { id: 'all', label: 'Tous les Paiements' },
          { id: 'unpaid', label: `Impayés (${unpaid.length})` },
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

      {tab === 'all' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <input type="month" className="input" style={{ width: '180px' }} value={filterMonth} onChange={e => setFilterMonth(e.target.value)} placeholder="Filtrer par mois" />
            <select className="input" style={{ width: '180px' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">Tous les types</option>
              {PAYMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {(filterMonth || filterType) && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setFilterMonth(''); setFilterType(''); }}>
                <X size={14} /> Réinitialiser
              </button>
            )}
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>N° Reçu</th>
                    <th>Élève</th>
                    <th>Classe</th>
                    <th>Type</th>
                    <th>Mois</th>
                    <th>Montant</th>
                    <th>Payé</th>
                    <th>Reste</th>
                    <th>Mode</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={10} style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
                  ) : payments.length === 0 ? (
                    <tr><td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Aucun paiement</td></tr>
                  ) : payments.map(p => (
                    <tr key={p.id}>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--accent-orange)' }}>{p.receiptNumber}</span></td>
                      <td style={{ fontSize: '0.8rem' }}>{p.studentName}</td>
                      <td><span className="badge badge-gray">{p.className}</span></td>
                      <td><span className="badge badge-info">{PAYMENT_TYPES.find(t => t.value === p.type)?.label || p.type}</span></td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.month || '—'}</td>
                      <td>{p.amount} DH</td>
                      <td style={{ color: 'var(--success)', fontWeight: '600' }}>{p.amountPaid} DH</td>
                      <td style={{ color: p.remaining > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{p.remaining} DH</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.paymentMethod}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.paymentDate?.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'unpaid' && (
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {unpaid.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    <CheckCircle size={32} style={{ margin: '0 auto 0.5rem', display: 'block', color: 'var(--success)', opacity: 0.5 }} />
                    <span style={{ color: 'var(--text-muted)' }}>Tous les élèves ont payé ce mois</span>
                  </td></tr>
                ) : unpaid.map(s => (
                  <tr key={s.id}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent-orange)' }}>{s.code}</span></td>
                    <td style={{ fontWeight: '500' }}>{s.firstName} {s.lastName}</td>
                    <td><span className="badge badge-gray">{s.className}</span></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.parentName}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.parentPhone}</td>
                    <td style={{ color: 'var(--danger)', fontWeight: '600' }}>{s.monthlyFee} DH</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>
                        <CreditCard size={13} /> Payer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <PaymentModal
          students={students}
          onSave={load}
          onClose={() => setModal(false)}
        />
      )}
    </div>
  );
}
