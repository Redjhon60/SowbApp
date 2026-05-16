import React, { useState, useEffect, useCallback } from 'react';
import { BarChart2, Download, FileText, Table, Filter } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const [classes, setClasses] = useState([]);
  const [reportType, setReportType] = useState('students');
  const [filterClass, setFilterClass] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    window.api.getClasses().then(setClasses);
    window.api.getSettings().then(setSettings);
  }, []);

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      let result = [];
      if (reportType === 'students') {
        result = await window.api.getStudentsReport({ classId: filterClass || undefined });
      } else if (reportType === 'payments') {
        result = await window.api.getPaymentsReport({ month: filterMonth || undefined });
      }
      setData(result);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [reportType, filterClass, filterMonth]);

  useEffect(() => { loadReport(); }, [loadReport]);

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const schoolName = settings.school_name || 'Le Schéma';
    const date = new Date().toLocaleDateString('fr-MA');

    // Header
    doc.setFillColor(249, 115, 22);
    doc.rect(0, 0, 297, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(schoolName, 10, 13);
    doc.setFontSize(10);
    doc.text(`Rapport: ${reportType === 'students' ? 'Liste des Élèves' : 'Paiements'} - ${date}`, 297 - 10, 13, { align: 'right' });

    let columns = [];
    let rows = [];

    if (reportType === 'students') {
      columns = ['Code', 'Prénom', 'Nom', 'Classe', 'Parent', 'Téléphone', 'Mensualité', 'Transport', 'Assurance'];
      rows = data.map(s => [
        s.code, s.firstName, s.lastName, s.className, s.parentName, s.parentPhone,
        `${s.monthlyFee} DH`, s.hasTransport ? 'Oui' : 'Non', s.insurancePaid ? 'Payée' : 'Non',
      ]);
    } else {
      columns = ['Reçu', 'Élève', 'Classe', 'Type', 'Mois', 'Payé', 'Reste', 'Date'];
      rows = data.map(p => [
        p.receiptNumber, p.studentName, p.className, p.type, p.month || '—',
        `${p.amountPaid} DH`, `${p.remaining} DH`, p.paymentDate?.slice(0, 10),
      ]);
    }

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 25,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [30, 30, 35], textColor: [249, 115, 22], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 248] },
    });

    doc.save(`rapport_${reportType}_${date}.pdf`);
  };

  const exportExcel = () => {
    let wsData = [];
    if (reportType === 'students') {
      wsData = [
        ['Code', 'Prénom', 'Nom', 'Classe', 'Niveau', 'Parent', 'Téléphone', 'Mensualité', 'Transport', 'Transport Tarif', 'Assurance', 'Inscription'],
        ...data.map(s => [
          s.code, s.firstName, s.lastName, s.className, s.classLevel, s.parentName, s.parentPhone,
          s.monthlyFee, s.hasTransport ? 'Oui' : 'Non', s.transportFee, s.insurancePaid ? 'Payée' : 'Non',
          s.registrationDate?.slice(0, 10),
        ]),
      ];
    } else {
      wsData = [
        ['N° Reçu', 'Élève', 'Classe', 'Type', 'Mois', 'Montant Total', 'Payé', 'Reste', 'Mode', 'Date'],
        ...data.map(p => [
          p.receiptNumber, p.studentName, p.className, p.type, p.month || '',
          p.amount, p.amountPaid, p.remaining, p.paymentMethod, p.paymentDate?.slice(0, 10),
        ]),
      ];
    }
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rapport');
    XLSX.writeFile(wb, `rapport_${reportType}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">Rapports & Exports</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {data.length} entrée{data.length !== 1 ? 's' : ''} dans le rapport
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={exportExcel} disabled={data.length === 0}>
            <Table size={15} /> Export Excel
          </button>
          <button className="btn btn-primary" onClick={exportPDF} disabled={data.length === 0}>
            <FileText size={15} /> Export PDF
          </button>
        </div>
      </div>

      {/* Report type selection */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { id: 'students', label: 'Liste des Élèves' },
          { id: 'payments', label: 'Rapport Paiements' },
        ].map(r => (
          <button
            key={r.id}
            onClick={() => setReportType(r.id)}
            className={`btn ${reportType === r.id ? 'btn-primary' : 'btn-ghost'}`}
          >
            <BarChart2 size={15} />
            {r.label}
          </button>
        ))}

        {reportType === 'students' && (
          <select className="input" style={{ width: '200px' }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="">Toutes les classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        {reportType === 'payments' && (
          <input type="month" className="input" style={{ width: '180px' }} value={filterMonth} onChange={e => setFilterMonth(e.target.value)} />
        )}
      </div>

      {/* Data table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : reportType === 'students' ? (
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Prénom</th>
                  <th>Nom</th>
                  <th>Classe</th>
                  <th>Parent</th>
                  <th>Téléphone</th>
                  <th>Mensualité</th>
                  <th>Transport</th>
                  <th>Assurance</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Aucune donnée</td></tr>
                ) : data.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent-orange)' }}>{s.code}</td>
                    <td style={{ fontSize: '0.875rem' }}>{s.firstName}</td>
                    <td style={{ fontSize: '0.875rem', fontWeight: '500' }}>{s.lastName}</td>
                    <td><span className="badge badge-gray">{s.className}</span></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.parentName}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.parentPhone}</td>
                    <td style={{ fontWeight: '600' }}>{s.monthlyFee} DH</td>
                    <td><span className={`badge ${s.hasTransport ? 'badge-info' : 'badge-gray'}`}>{s.hasTransport ? 'Oui' : 'Non'}</span></td>
                    <td><span className={`badge ${s.insurancePaid ? 'badge-success' : 'badge-warning'}`}>{s.insurancePaid ? 'Payée' : 'Non'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>N° Reçu</th>
                  <th>Élève</th>
                  <th>Classe</th>
                  <th>Type</th>
                  <th>Mois</th>
                  <th>Payé</th>
                  <th>Reste</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Aucune donnée</td></tr>
                ) : data.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--accent-orange)' }}>{p.receiptNumber}</td>
                    <td style={{ fontSize: '0.875rem' }}>{p.studentName}</td>
                    <td><span className="badge badge-gray">{p.className}</span></td>
                    <td><span className="badge badge-info">{p.type}</span></td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.month || '—'}</td>
                    <td style={{ color: 'var(--success)', fontWeight: '600' }}>{p.amountPaid} DH</td>
                    <td style={{ color: p.remaining > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{p.remaining} DH</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.paymentDate?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Summary footer */}
      {data.length > 0 && reportType === 'payments' && (
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Payé', value: `${data.reduce((s, p) => s + p.amountPaid, 0).toFixed(2)} DH`, color: 'var(--success)' },
            { label: 'Total Restant', value: `${data.reduce((s, p) => s + p.remaining, 0).toFixed(2)} DH`, color: 'var(--danger)' },
            { label: 'Nb Paiements', value: data.length, color: 'var(--info)' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '0.625rem 1rem',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', display: 'flex', gap: '0.5rem', alignItems: 'center',
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.label}:</span>
              <span style={{ fontWeight: '700', color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
