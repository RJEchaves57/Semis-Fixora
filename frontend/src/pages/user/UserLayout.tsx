import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ListChecks, PlusCircle, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProfileMenu from '../../components/ProfileMenu';

export default function UserLayout() {
  const { user } = useAuth();
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
          <ProfileMenu triggerClassName="u-me" avatarClassName="u-avatar" subtitle={me.title} settingsTo="/user/settings" />
        </div>
      </header>
      <main className="u-main"><Outlet /></main>
    </div>
  );
}
