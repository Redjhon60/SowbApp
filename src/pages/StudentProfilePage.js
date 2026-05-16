import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, GraduationCap, Phone, MapPin, Calendar, Bus,
  Shield, CreditCard, FileText, Edit2, User
} from 'lucide-react';

const typeLabels = { mensualite: 'Mensualité', assurance: 'Assurance', transport: 'Transport', autre: 'Autre' };

export default function StudentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');

  useEffect(() => {
    window.api.getStudent(parseInt(id)).then(s => {
      setStudent(s);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem', flexDirection: 'column' }}>
      <div className="spinner" />
      <span style={{ color: 'var(--text-muted)' }}>Chargement...</span>
    </div>
  );

  if (!student) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
      Élève introuvable
    </div>
  );

  const totalPaid = (student.payments || []).reduce((s, p) => s + p.amountPaid, 0);

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '1.5rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/students')}>
          <ArrowLeft size={15} /> Retour aux élèves
        </button>
      </div>

      {/* Profile header */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'var(--accent-orange-dim)',
            border: '3px solid var(--accent-orange)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', fontWeight: '700', color: 'var(--accent-orange)',
            flexShrink: 0,
          }}>
            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: '700' }}>
              {student.firstName} {student.lastName}
            </h2>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent-orange)' }}>{student.code}</span>
              <span className="badge badge-gray">{student.className}</span>
              <span className={`badge ${student.insurancePaid ? 'badge-success' : 'badge-warning'}`}>
                <Shield size={10} /> {student.insurancePaid ? 'Assuré' : 'Sans assurance'}
              </span>
              {student.hasTransport && <span className="badge badge-info"><Bus size={10} /> Transport</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'center' }}>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius)', padding: '0.75rem 1.25rem', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--success)' }}>{totalPaid} DH</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Payé</div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius)', padding: '0.75rem 1.25rem', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-orange)' }}>
                {student.monthlyFee + (student.hasTransport ? student.transportFee : 0)} DH
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mensualité Totale</div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius)', padding: '0.75rem 1.25rem', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--info)' }}>
                {(student.payments || []).length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Paiements</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {[
          { id: 'info', label: 'Informations', icon: User },
          { id: 'payments', label: 'Historique Paiements', icon: CreditCard },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.625rem 1rem',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: `2px solid ${tab === t.id ? 'var(--accent-orange)' : 'transparent'}`,
              color: tab === t.id ? 'var(--accent-orange)' : 'var(--text-secondary)',
              fontWeight: tab === t.id ? '600' : '400',
              fontSize: '0.875rem',
              transition: 'all 0.15s',
              marginBottom: '-1px',
            }}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="card">
            <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={16} style={{ color: 'var(--accent-orange)' }} />
              Informations de l'Élève
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Prénom', value: student.firstName },
                { label: 'Nom', value: student.lastName },
                { label: 'Genre', value: student.gender === 'M' ? 'Masculin' : 'Féminin' },
                { label: 'Date de Naissance', value: student.dateOfBirth?.slice(0, 10) || '—' },
                { label: 'Classe', value: student.className },
                { label: 'Date d\'inscription', value: student.registrationDate?.slice(0, 10) },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '500' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card">
              <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} style={{ color: 'var(--info)' }} />
                Contact & Parent
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Parent', value: student.parentName },
                  { label: 'Téléphone', value: student.parentPhone },
                  { label: 'Urgence', value: student.emergencyPhone || '—' },
                  { label: 'Adresse', value: student.address || '—' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '500' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={16} style={{ color: 'var(--success)' }} />
                Tarification
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { label: 'Mensualité', value: `${student.monthlyFee} DH` },
                  { label: 'Transport', value: student.hasTransport ? `${student.transportFee} DH` : 'Non abonné' },
                  { label: 'Assurance', value: `${student.insuranceFee} DH` },
                  { label: 'Total Mensuel', value: `${student.monthlyFee + (student.hasTransport ? student.transportFee : 0)} DH`, bold: true },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0.5rem', background: item.bold ? 'var(--accent-orange-dim)' : 'var(--bg-tertiary)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: item.bold ? '700' : '500', color: item.bold ? 'var(--accent-orange)' : 'var(--text-primary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'payments' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>N° Reçu</th>
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
                {(student.payments || []).length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Aucun paiement enregistré
                  </td></tr>
                ) : (student.payments || []).map(p => (
                  <tr key={p.id}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent-orange)' }}>{p.receiptNumber}</span></td>
                    <td><span className="badge badge-info">{typeLabels[p.type] || p.type}</span></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.month || '—'}</td>
                    <td style={{ fontWeight: '500' }}>{p.amount} DH</td>
                    <td style={{ color: 'var(--success)', fontWeight: '600' }}>{p.amountPaid} DH</td>
                    <td style={{ color: p.remaining > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{p.remaining} DH</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.paymentMethod}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.paymentDate?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
