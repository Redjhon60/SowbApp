import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, useSettings } from '../../App';
import {
  LayoutDashboard, Users, CreditCard, UserCheck, TrendingDown,
  Bus, Calendar, FolderOpen, BarChart2, Settings, HardDrive,
  LogOut, ChevronDown, ChevronRight, GraduationCap, Bell
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Tableau de Bord', labelAr: 'لوحة التحكم' },
  { path: '/students', icon: GraduationCap, label: 'Élèves', labelAr: 'الطلاب' },
  { path: '/payments', icon: CreditCard, label: 'Paiements', labelAr: 'المدفوعات' },
  { path: '/employees', icon: UserCheck, label: 'Employés', labelAr: 'الموظفون' },
  { path: '/expenses', icon: TrendingDown, label: 'Dépenses', labelAr: 'المصروفات' },
  { path: '/transport', icon: Bus, label: 'Transport', labelAr: 'النقل' },
  { path: '/timetable', icon: Calendar, label: 'Emploi du Temps', labelAr: 'الجدول' },
  { path: '/documents', icon: FolderOpen, label: 'Documents', labelAr: 'الوثائق' },
  { path: '/reports', icon: BarChart2, label: 'Rapports', labelAr: 'التقارير' },
  { path: '/settings', icon: Settings, label: 'Paramètres', labelAr: 'الإعدادات' },
  { path: '/backup', icon: HardDrive, label: 'Sauvegarde', labelAr: 'النسخ الاحتياطي' },
];

const roleLabels = {
  admin: { label: 'Administrateur', color: 'var(--accent-orange)' },
  comptable: { label: 'Comptable', color: 'var(--accent-gold)' },
  secretaire: { label: 'Secrétaire', color: 'var(--info)' },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = roleLabels[user?.role] || roleLabels.secretaire;

  return (
    <aside className="sidebar" style={{ width: collapsed ? '64px' : 'var(--sidebar-width)', transition: 'width 0.2s' }}>
      {/* Logo / School Name */}
      <div style={{
        padding: '1.25rem 1rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        minHeight: 'var(--header-height)',
      }}>
        <img
          src="/logo.jpeg"
          alt="Logo"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            objectFit: 'cover',
            flexShrink: 0,
            border: '2px solid var(--accent-orange)',
          }}
          onError={e => { e.target.style.display = 'none'; }}
        />
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
            }}>
              {settings.school_name || 'Le Schéma'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-orange)', fontWeight: '500' }}>
              School Manager Pro
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn btn-ghost btn-icon btn-sm"
          style={{ marginLeft: 'auto', flexShrink: 0 }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div style={{
          padding: '0.75rem 1rem',
          margin: '0.5rem',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '32px', height: '32px',
              borderRadius: '50%',
              background: 'var(--accent-orange-dim)',
              border: `2px solid ${role.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: '700', color: role.color,
              flexShrink: 0,
            }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', truncate: true }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: role.color }}>{role.label}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0.5rem 0', overflow: 'auto' }}>
        {!collapsed && <div className="section-title">Navigation</div>}
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : ''}
            style={collapsed ? { justifyContent: 'center', padding: '0.625rem' } : {}}
          >
            <item.icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '0.5rem', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleLogout}
          className="sidebar-item btn-danger"
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            color: 'var(--danger)',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <LogOut size={18} />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
