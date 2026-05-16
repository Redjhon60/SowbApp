import React, { useState, useEffect } from 'react';
import {
  Users, GraduationCap, TrendingUp, TrendingDown, CreditCard,
  Bus, Shield, AlertTriangle, CheckCircle, UserCheck, RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const CHART_COLORS = {
  orange: 'rgba(249,115,22,0.85)',
  orangeDim: 'rgba(249,115,22,0.15)',
  gold: 'rgba(184,151,90,0.85)',
  goldDim: 'rgba(184,151,90,0.15)',
  success: 'rgba(63,185,80,0.85)',
  successDim: 'rgba(63,185,80,0.15)',
  danger: 'rgba(248,81,73,0.85)',
  dangerDim: 'rgba(248,81,73,0.15)',
  info: 'rgba(88,166,255,0.85)',
  grid: 'rgba(48,54,61,0.8)',
};

const chartDefaults = {
  plugins: { legend: { labels: { color: '#8b949e', font: { size: 11 } } } },
  scales: {
    x: { ticks: { color: '#6e7681', font: { size: 10 } }, grid: { color: CHART_COLORS.grid } },
    y: { ticks: { color: '#6e7681', font: { size: 10 } }, grid: { color: CHART_COLORS.grid } },
  },
};

function StatCard({ icon: Icon, label, value, sub, color, trend }) {
  return (
    <div className="stat-card card-hover" style={{ cursor: 'default' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: '42px', height: '42px',
          borderRadius: '12px',
          background: `${color}20`,
          border: `1px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} style={{ color }} />
        </div>
        {trend !== undefined && (
          <span style={{ fontSize: '0.72rem', color: trend >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ marginTop: '0.875rem' }}>
        <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{sub}</div>}
      </div>
    </div>
  );
}

function formatAmount(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M DH`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K DH`;
  return `${n?.toFixed(0) || 0} DH`;
}

function formatMonth(m) {
  if (!m) return '';
  const [y, mo] = m.split('-');
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  return `${months[parseInt(mo) - 1]} ${y}`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await window.api.getDashboardStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div className="spinner" />
      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Chargement du tableau de bord...</span>
    </div>
  );

  if (!stats) return null;

  // Chart data
  const allMonths = [...new Set([
    ...(stats.monthlyChart || []).map(r => r.month),
    ...(stats.expensesChart || []).map(r => r.month),
  ])].sort();

  const revenueByMonth = allMonths.map(m => stats.monthlyChart.find(r => r.month === m)?.total || 0);
  const expenseByMonth = allMonths.map(m => stats.expensesChart.find(r => r.month === m)?.total || 0);
  const labels = allMonths.map(formatMonth);

  const barData = {
    labels,
    datasets: [
      {
        label: 'Revenus',
        data: revenueByMonth,
        backgroundColor: CHART_COLORS.orange,
        borderRadius: 6,
      },
      {
        label: 'Dépenses',
        data: expenseByMonth,
        backgroundColor: CHART_COLORS.dangerDim,
        borderColor: CHART_COLORS.danger,
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const doughnutData = {
    labels: ['Payés', 'Non payés'],
    datasets: [{
      data: [stats.paidStudents, stats.unpaidStudents],
      backgroundColor: [CHART_COLORS.success, CHART_COLORS.danger],
      borderColor: 'var(--bg-card)',
      borderWidth: 3,
      hoverOffset: 8,
    }],
  };

  const classData = {
    labels: (stats.classChart || []).map(c => c.name),
    datasets: [{
      label: 'Élèves',
      data: (stats.classChart || []).map(c => c.count),
      backgroundColor: CHART_COLORS.orange,
      borderRadius: 4,
    }],
  };

  return (
    <div className="animate-fade">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">Tableau de Bord</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Vue d'ensemble de l'établissement
          </p>
        </div>
        <button className="btn btn-secondary" onClick={load}>
          <RefreshCw size={15} />
          Actualiser
        </button>
      </div>

      {/* Stat Cards Row 1 */}
      <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
        <StatCard icon={GraduationCap} label="Total Élèves" value={stats.totalStudents} color="var(--accent-orange)" />
        <StatCard icon={UserCheck} label="Enseignants" value={stats.totalTeachers} sub={`${stats.totalEmployees} employés au total`} color="var(--info)" />
        <StatCard icon={CheckCircle} label="Élèves Payés" value={stats.paidStudents} sub="Ce mois" color="var(--success)" />
        <StatCard icon={AlertTriangle} label="Élèves Impayés" value={stats.unpaidStudents} sub="Ce mois" color="var(--warning)" />
      </div>

      {/* Stat Cards Row 2 */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard icon={TrendingUp} label="Revenus Mensuels" value={formatAmount(stats.monthlyRevenue)} color="var(--success)" />
        <StatCard icon={TrendingDown} label="Dépenses Mensuelles" value={formatAmount(stats.monthlyExpenses)} color="var(--danger)" />
        <StatCard icon={CreditCard} label="Bénéfice Net" value={formatAmount(stats.profit)} color={stats.profit >= 0 ? 'var(--success)' : 'var(--danger)'} />
        <StatCard icon={Bus} label="Transport" value={stats.transportStudents} sub="Abonnés transport" color="var(--accent-gold)" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Revenue vs Expenses Bar */}
        <div className="chart-container">
          <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Revenus vs Dépenses (12 derniers mois)
          </div>
          <Bar
            data={barData}
            options={{
              ...chartDefaults,
              responsive: true,
              plugins: {
                ...chartDefaults.plugins,
                legend: { labels: { color: '#8b949e', font: { size: 11 } } },
              },
            }}
            height={200}
          />
        </div>

        {/* Payment Status Doughnut */}
        <div className="chart-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-primary)', alignSelf: 'flex-start' }}>
            Statut des Paiements (mois en cours)
          </div>
          <Doughnut
            data={doughnutData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom', labels: { color: '#8b949e', padding: 16 } },
              },
              cutout: '65%',
            }}
            style={{ maxHeight: '200px' }}
          />
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--success)' }}>{stats.paidStudents}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Payés</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--danger)' }}>{stats.unpaidStudents}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Non payés</div>
            </div>
          </div>
        </div>
      </div>

      {/* Students per class */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div className="chart-container">
          <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Élèves par Classe
          </div>
          <Bar
            data={classData}
            options={{
              ...chartDefaults,
              responsive: true,
              plugins: { legend: { display: false } },
            }}
            height={180}
          />
        </div>

        {/* Financial summary */}
        <div className="chart-container">
          <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Résumé Financier Annuel
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { label: 'Revenus Annuels', value: formatAmount(stats.yearlyRevenue), color: 'var(--success)' },
              { label: 'Dépenses Annuelles', value: formatAmount(stats.yearlyExpenses), color: 'var(--danger)' },
              { label: 'Bénéfice Annuel', value: formatAmount(stats.yearlyRevenue - stats.yearlyExpenses), color: stats.yearlyRevenue - stats.yearlyExpenses >= 0 ? 'var(--success)' : 'var(--danger)' },
              { label: 'Assurances Payées', value: `${stats.insurancePaid} / ${stats.totalStudents}`, color: 'var(--info)' },
              { label: 'Transport', value: `${stats.transportStudents} abonnés`, color: 'var(--accent-gold)' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.5rem 0.75rem',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.25rem' }}>
        {/* Recent Payments */}
        <div className="card">
          <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={16} style={{ color: 'var(--accent-orange)' }} />
            Derniers Paiements
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Reçu</th>
                  <th>Élève</th>
                  <th>Classe</th>
                  <th>Type</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                {(stats.recentPayments || []).slice(0, 8).map(p => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent-orange)' }}>{p.receiptNumber}</td>
                    <td style={{ fontSize: '0.8rem' }}>{p.studentName}</td>
                    <td><span className="badge badge-gray">{p.className}</span></td>
                    <td>
                      <span className={`badge ${p.type === 'mensualite' ? 'badge-info' : p.type === 'assurance' ? 'badge-success' : 'badge-orange'}`}>
                        {p.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--success)' }}>{p.amountPaid} DH</td>
                  </tr>
                ))}
                {(!stats.recentPayments || stats.recentPayments.length === 0) && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Aucun paiement enregistré</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="card">
          <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingDown size={16} style={{ color: 'var(--danger)' }} />
            Dernières Dépenses
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {(stats.recentExpenses || []).map(e => (
              <div key={e.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.625rem 0.75rem',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-primary)' }}>{e.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{e.date?.slice(0, 10)} · {e.category}</div>
                </div>
                <span style={{ fontWeight: '700', color: 'var(--danger)', fontSize: '0.875rem' }}>-{e.amount} DH</span>
              </div>
            ))}
            {(!stats.recentExpenses || stats.recentExpenses.length === 0) && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.875rem' }}>
                Aucune dépense enregistrée
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
