import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListChecks, LogOut, PlusCircle, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../data/constants';

export default function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const me = user!;
  const link = ({ isActive }: { isActive: boolean }) => `u-link ${isActive ? 'active' : ''}`;
  return (
    <div className="theme-user">
      <header className="u-top">
        <div className="u-top-in">
          <div className="u-brand"><span><Wrench size={18} /></span><b>FIXORA</b><small>Report an issue</small></div>
          <nav className="u-nav">
            <NavLink to="/user" end className={link}><LayoutDashboard size={16} /> Dashboard</NavLink>
            <NavLink to="/user/requests" className={link}><ListChecks size={16} /> My requests</NavLink>
          </nav>
          <NavLink to="/user/new" className="btn btn-primary u-new"><PlusCircle size={16} /> New request</NavLink>
          <div className="u-me">
            <span className="u-avatar">{initials(me.name)}</span>
            <span className="u-me-text"><b>{me.name}</b><small>{me.title}</small></span>
            <button className="u-logout" aria-label="Sign out" onClick={() => { logout(); navigate('/login', { replace: true }); }}><LogOut size={16} /></button>
          </div>
        </div>
      </header>
      <main className="u-main"><Outlet /></main>
    </div>
  );
}
