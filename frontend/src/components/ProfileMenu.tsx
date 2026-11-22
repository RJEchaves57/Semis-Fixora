import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ChevronDown, ChevronRight, LogOut, Repeat2, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { initials, roleHome, roleLabel } from '../data/constants';
import { accounts } from '../data/users';
import type { Account } from '../types';

type Props = {
  /** Existing layout class used for the avatar row, e.g. "admin-mini" or "u-me". */
  triggerClassName?: string;
  avatarClassName?: string;
  subtitle?: string;
  settingsTo: string;
};

export default function ProfileMenu({
  triggerClassName = '',
  avatarClassName = '',
  subtitle,
  settingsTo,
}: Props) {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) {
        setOpen(false);
        setSwitchOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (switchOpen) setSwitchOpen(false);
      else setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, switchOpen]);

  if (!user) return null;

  const close = () => {
    setOpen(false);
    setSwitchOpen(false);
  };

  const signOut = async () => {
    close();
    await logout();
    navigate('/login', { replace: true });
  };

  const switchTo = async (account: Account) => {
    if (account.email === user.email || busy) return;
    setBusy(true);
    close();
    await logout();
    const error = await login(account.email, account.password, account.role);
    setBusy(false);
    navigate(error ? '/login' : roleHome[account.role], { replace: true });
  };

  return (
    <div className={`pm ${open ? 'open' : ''}`} ref={root}>
      <button
        type="button"
        className={`pm-trigger ${triggerClassName}`}
        onClick={() => {
          setOpen((value) => !value);
          setSwitchOpen(false);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <span className={`pm-avatar ${avatarClassName}`}>{initials(user.name)}</span>
        <span className="pm-identity">
          <b>{user.name}</b>
          {subtitle && <small>{subtitle}</small>}
        </span>
        <ChevronDown size={15} className="pm-chevron" />
      </button>

      {open && (
        <div className="pm-card" role="menu">
          <div className="pm-head">
            <span className={`pm-avatar ${avatarClassName}`}>{initials(user.name)}</span>
            <span className="pm-head-text">
              <b>{user.name}</b>
              <small>{user.email}</small>
              <i>{user.role}</i>
            </span>
          </div>
          <div className="pm-divider" />
          <Link to={settingsTo} className="pm-item" role="menuitem" onClick={close}>
            <Settings size={16} /> Settings
          </Link>

          <div className="pm-switch-wrap">
            <button
              type="button"
              className={`pm-item ${switchOpen ? 'active' : ''}`}
              role="menuitem"
              aria-haspopup="dialog"
              aria-expanded={switchOpen}
              onClick={() => setSwitchOpen((value) => !value)}
            >
              <Repeat2 size={16} /> Switch account
              <ChevronRight size={14} className="pm-item-chevron" />
            </button>

            {switchOpen && (
              <div className="pm-switch" role="dialog" aria-label="Switch account">
                <div className="pm-switch-title">Choose an account</div>
                <div className="pm-switch-list">
                  {accounts.map((account) => {
                    const current = account.email === user.email;
                    return (
                      <button
                        type="button"
                        key={account.email}
                        className={`pm-account ${current ? 'current' : ''}`}
                        disabled={current || busy}
                        onClick={() => switchTo(account)}
                      >
                        <span className="pm-account-avatar">{initials(account.name)}</span>
                        <span className="pm-account-text">
                          <b>{account.name}</b>
                          <small>{roleLabel[account.role]} · {account.email}</small>
                        </span>
                        {current && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="pm-divider" />
          <button type="button" className="pm-item pm-danger" role="menuitem" onClick={signOut}>
            <LogOut size={16} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
