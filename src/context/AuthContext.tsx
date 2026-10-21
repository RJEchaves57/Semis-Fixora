import { createContext, useContext, useState, type ReactNode } from 'react';
import { accounts as seedAccounts } from '../data/users';
import { staffCodes } from '../data/constants';
import type { Account, Role, Session } from '../types';

const SESSION_KEY = 'fixora-session';
const EXTRA_KEY = 'fixora-extra';
export const MIN_PASSWORD = 8;

// DEMO ONLY: registered accounts and reset passwords are kept in this browser's localStorage in plain text.
// A real system must store hashed passwords on the server.
type Extra = { registered: Account[]; passwords: Record<string, string> };

const readExtra = (): Extra => {
  try {
    const p = JSON.parse(localStorage.getItem(EXTRA_KEY) ?? 'null');
    if (p) return { registered: p.registered ?? [], passwords: p.passwords ?? {} };
  } catch { /* ignore */ }
  return { registered: [], passwords: {} };
};
const writeExtra = (e: Extra) => { try { localStorage.setItem(EXTRA_KEY, JSON.stringify(e)); } catch { /* ignore */ } };
const allAccounts = (): Account[] => {
  const e = readExtra();
  return [...seedAccounts, ...e.registered].map((a) => (e.passwords[a.id] ? { ...a, password: e.passwords[a.id] } : a));
};
const findByEmail = (email: string) => allAccounts().find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
const toSession = (a: Account): Session => { const { password, ...rest } = a; void password; return rest; };
// Maintenance accounts (seed + registered) without password fields; used for the admin's assign list.
// eslint-disable-next-line react-refresh/only-export-components
export const getMaintenanceStaff = (): Session[] => allAccounts().filter((a) => a.role === 'maintenance').map(toSession);

type Ctx = {
  user: Session | null;
  login: (email: string, password: string, role: Role) => string | null;
  register: (input: { name: string; email: string; password: string; role: Role; specialty?: string; code?: string }) => string | null;
  emailExists: (email: string) => boolean;
  resetPassword: (email: string, password: string) => string | null;
  logout: () => void;
};
const AuthContext = createContext<Ctx | null>(null);

const restore = (): Session | null => {
  try {
    const id = sessionStorage.getItem(SESSION_KEY);
    const found = allAccounts().find((a) => a.id === id);
    return found ? toSession(found) : null;
  } catch { return null; }
};
const startSession = (a: Account) => { try { sessionStorage.setItem(SESSION_KEY, a.id); } catch { /* ignore */ } };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session | null>(restore);

  const login: Ctx['login'] = (email, password, role) => {
    const found = findByEmail(email);
    if (!found || found.password !== password) return 'Incorrect email or password.';
    if (found.role !== role) return 'This account does not belong to the selected role.';
    startSession(found);
    setUser(toSession(found));
    return null;
  };

  // Admin and Maintenance registration needs the staff access code (demo protection only).
  const register: Ctx['register'] = ({ name, email, password, role, specialty, code }) => {
    if (role !== 'user' && code?.trim() !== staffCodes[role]) return 'Invalid staff access code.';
    if (findByEmail(email)) return 'An account with this email already exists.';
    const title = role === 'admin' ? 'Administrator' : role === 'maintenance' ? 'Maintenance technician' : 'Student / Staff';
    const account: Account = { id: `${role[0]}-${Date.now().toString(36)}`, name: name.trim(), email: email.trim(), password, role, title, specialty: role === 'maintenance' ? specialty : undefined };
    const extra = readExtra();
    writeExtra({ ...extra, registered: [...extra.registered, account] });
    startSession(account);
    setUser(toSession(account));
    return null;
  };

  const resetPassword: Ctx['resetPassword'] = (email, password) => {
    const found = findByEmail(email);
    if (!found) return 'No account found with that email.';
    const extra = readExtra();
    writeExtra({ ...extra, passwords: { ...extra.passwords, [found.id]: password } });
    return null;
  };

  const logout = () => { try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ } setUser(null); };

  return <AuthContext.Provider value={{ user, login, register, emailExists: (e) => !!findByEmail(e), resetPassword, logout }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
