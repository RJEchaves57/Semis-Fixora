import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { HardHat, KanbanSquare, LayoutDashboard, LogOut, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestsContext';
import { initials } from '../../data/constants';

export default function MaintenanceLayout() {
  const { user, logout } = useAuth();
  const { requests } = useRequests();
  const navigate = useNavigate();
  const me = user!;
  const active = requests.filter((r) => r.assigneeId === me.id && (r.status === 'Assigned' || r.status === 'In Progress')).length;
  const link = ({ isActive }: { isActive: boolean }) => `m-link ${isActive ? 'active' : ''}`;
  return (
    <div className="theme-maint m-shell">
      <aside className="m-rail">
        <div className="m-logo"><Wrench size={20} /></div>
        <nav>
          <NavLink to="/maintenance" end className={link} title="Dashboard"><LayoutDashboard size={20} /><span>Home</span></NavLink>
          <NavLink to="/maintenance/tasks" className={link} title="My tasks"><KanbanSquare size={20} /><span>Tasks</span>{active > 0 && <i>{active}</i>}</NavLink>
        </nav>
        <button className="m-out" onClick={() => { logout(); navigate('/login', { replace: true }); }} title="Sign out"><LogOut size={19} /><span>Exit</span></button>
      </aside>
      <div className="m-body">
        <header className="m-top">
          <div className="m-top-title"><HardHat size={18} /> Maintenance Team <span>· Field console</span></div>
          <div className="m-who"><span className="m-avatar">{initials(me.name)}</span><span><b>{me.name}</b><small>{me.specialty} · {me.title}</small></span></div>
        </header>
        <main className="m-main"><Outlet /></main>
      </div>
    </div>
  );
}
