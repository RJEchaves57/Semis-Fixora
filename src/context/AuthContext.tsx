import { createContext, useContext, useState, type ReactNode } from 'react';
import { accounts } from '../data/users';
import type { Role, Session } from '../types';

const KEY = 'fixora-session';
type Ctx = { user: Session | null; login: (email: string, password: string, role: Role) => string | null; logout: () => void };
const AuthContext = createContext<Ctx | null>(null);

const restore = (): Session | null => {
  try {
    const id = sessionStorage.getItem(KEY);
    const found = accounts.find((a) => a.id === id);
    if (!found) return null;
    const { password: _pw, ...session } = found;
    void _pw;
    return session;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session | null>(restore);

  const login: Ctx['login'] = (email, password, role) => {
    const found = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password);
    if (!found) return 'Incorrect email or password.';
    if (found.role !== role) return 'This account does not belong to the selected role.';
    const { password: _pw, ...session } = found;
    void _pw;
    try { sessionStorage.setItem(KEY, found.id); } catch { /* ignore */ }
    setUser(session);
    return null;
  };

  const logout = () => {
    try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
