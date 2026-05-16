import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Clock, Calendar } from 'lucide-react';

const routeTitles = {
  '/': { fr: 'Tableau de Bord', ar: 'لوحة التحكم' },
  '/students': { fr: 'Gestion des Élèves', ar: 'إدارة الطلاب' },
  '/payments': { fr: 'Gestion des Paiements', ar: 'إدارة المدفوعات' },
  '/employees': { fr: 'Employés & Enseignants', ar: 'الموظفون والمعلمون' },
  '/expenses': { fr: 'Gestion des Dépenses', ar: 'إدارة المصروفات' },
  '/transport': { fr: 'Transport Scolaire', ar: 'النقل المدرسي' },
  '/timetable': { fr: "Emploi du Temps", ar: 'الجدول الدراسي' },
  '/documents': { fr: 'Documents', ar: 'الوثائق' },
  '/reports': { fr: 'Rapports & Exports', ar: 'التقارير والتصدير' },
  '/settings': { fr: 'Paramètres', ar: 'الإعدادات' },
  '/backup': { fr: 'Sauvegarde', ar: 'النسخ الاحتياطي' },
};

const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function TopBar() {
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [notifications] = useState([
    { id: 1, type: 'warning', message: '5 élèves n\'ont pas payé ce mois' },
    { id: 2, type: 'info', message: 'Sauvegarde automatique effectuée' },
  ]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentRoute = Object.keys(routeTitles).find(k =>
    k === '/' ? location.pathname === '/' : location.pathname.startsWith(k)
  );
  const title = routeTitles[currentRoute] || { fr: 'School Manager Pro', ar: '' };

  const d = time;
  const dateStr = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  const timeStr = d.toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <header style={{
      height: 'var(--header-height)',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 1.5rem',
      gap: '1rem',
      flexShrink: 0,
      position: 'relative',
      zIndex: 50,
    }}>
      {/* Title */}
      <div style={{ flex: 1 }}>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '1.1rem',
          fontWeight: '600',
          color: 'var(--text-primary)',
        }}>
          {title.fr}
        </h1>
        {title.ar && (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'Amiri, serif', direction: 'rtl' }}>
            {title.ar}
          </div>
        )}
      </div>

      {/* Date & Time */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '0.375rem 0.75rem',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
      }}>
        <Calendar size={13} style={{ color: 'var(--accent-orange)' }} />
        <span>{dateStr}</span>
        <span style={{ color: 'var(--border)' }}>|</span>
        <Clock size={13} style={{ color: 'var(--accent-orange)' }} />
        <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--accent-orange)' }}>{timeStr}</span>
      </div>

      {/* Notifications */}
      <div style={{ position: 'relative' }}>
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => setShowNotifs(!showNotifs)}
          style={{ position: 'relative' }}
        >
          <Bell size={18} />
          {notifications.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px', right: '4px',
              width: '8px', height: '8px',
              borderRadius: '50%',
              background: 'var(--danger)',
              border: '2px solid var(--bg-secondary)',
            }} />
          )}
        </button>

        {showNotifs && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '300px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow)',
            overflow: 'hidden',
            zIndex: 200,
          }}>
            <div style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>Notifications</span>
              <span className="badge badge-orange">{notifications.length}</span>
            </div>
            {notifications.map(n => (
              <div key={n.id} style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--border-light)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-start',
              }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%', marginTop: '5px', flexShrink: 0,
                  background: n.type === 'warning' ? 'var(--warning)' : 'var(--info)',
                }} />
                {n.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close notifs */}
      {showNotifs && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100 }}
          onClick={() => setShowNotifs(false)}
        />
      )}
    </header>
  );
}
