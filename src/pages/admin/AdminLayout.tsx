import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Building2, CalendarDays, ChevronDown, ClipboardList, LayoutDashboard, LogOut, Search, Settings, ShieldCheck, Users } from 'lucide-react';
import Brand from '../../components/Brand';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestsContext';
import { initials } from '../../data/constants';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { requests } = useRequests();
  const navigate = useNavigate();
  const loc = useLocation();
  const pending = requests.filter((r) => r.status === 'Pending').length;
  const nav = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/requests', label: 'Maintenance requests', icon: ClipboardList, count: pending ? String(pending) : undefined },
    { to: '/admin/facilities', label: 'Facilities', icon: Building2 },
    { to: '/admin/staff', label: 'Maintenance team', icon: Users },
    { to: '/admin/schedule', label: 'Maintenance schedule', icon: CalendarDays },
  ];
  const title = [...nav, { to: '/admin/settings', label: 'Settings' }].find((n) => n.to === loc.pathname)?.label ?? 'Overview';
  const signOut = () => { logout(); navigate('/login', { replace: true }); };
  const me = user!;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand sub="ADMIN CONSOLE" />
        <div className="workspace">
          <span className="workspace-icon"><Building2 size={17} /></span>
          <span><b>Northfield Campus</b><small>School workspace</small></span>
          <ChevronDown size={15} />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="main-nav">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/admin'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <n.icon size={18} /><span>{n.label}</span>{n.count && <i>{n.count}</i>}
            </NavLink>
          ))}
        </nav>
        <div className="nav-label tools-label">MANAGEMENT</div>
        <NavLink to="/admin/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Settings size={18} /><span>Settings</span></NavLink>
        <div className="sidebar-bottom">
          <div className="support-card">
            <span className="support-icon"><ShieldCheck size={18} /></span>
            <b>{pending ? `${pending} awaiting approval` : 'All caught up'}</b>
            <p>Review new reports, then assign them to the maintenance team.</p>
          </div>
          <button className="profile-row" onClick={signOut} aria-label="Sign out">
            <span className="avatar">{initials(me.name)}</span>
            <span><b>{me.name}</b><small>{me.title}</small></span>
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Admin</span><span className="crumb-slash">/</span><b>{title}</b></div>
          <div className="top-actions">
            <label className="global-search"><Search size={16} /><input placeholder="Search anything..." /></label>
            <button className="icon-btn notification-btn" aria-label="Notifications"><Bell size={18} />{pending > 0 && <i />}</button>
            <div className="top-divider" />
            <div className="admin-mini"><span className="avatar">{initials(me.name)}</span><span><b>{me.name}</b><small>Administrator</small></span></div>
          </div>
        </header>
        <div className="page-content"><Outlet /></div>
        <footer className="footer"><span>© 2026 FIXORA · School Maintenance System</span><span><i /> All systems operational <span className="footer-dot">·</span> v1.1.0</span></footer>
      </main>
    </div>
  );
}
