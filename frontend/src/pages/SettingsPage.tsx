import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { initials } from '../data/constants';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="pm-settings">
      <h1>Account settings</h1>
      <p>Details for the account you are currently signed in with.</p>
      <div className="pm-settings-card">
        <span className="pm-avatar">{initials(user.name)}</span>
        <div>
          <b>{user.name}</b>
          <small>{user.email}</small>
          <small>{user.role} · {user.title}</small>
        </div>
      </div>
      <button className="pm-settings-out" onClick={signOut}>
        <LogOut size={16} /> Log out
      </button>
    </div>
  );
}
