import { useState, type FormEvent, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ClipboardCheck, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound, Wrench, type LucideIcon } from 'lucide-react';
import Brand from '../components/Brand';
import { MIN_PASSWORD, useAuth } from '../context/AuthContext';
import { categories, roleHome, roleLabel } from '../data/constants';
import type { Role } from '../types';

const roles: { key: Role; icon: LucideIcon; hint: string }[] = [
  { key: 'user', icon: UserRound, hint: 'Report and track maintenance issues.' },
  { key: 'admin', icon: ShieldCheck, hint: 'Approve requests and assign the team.' },
  { key: 'maintenance', icon: Wrench, hint: 'View assigned tasks and update progress.' },
];
type Mode = 'login' | 'register' | 'forgot';

function Field({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return <label>{label}<span className="auth-input">{icon}{children}</span></label>;
}

function PasswordInput({ value, onChange, placeholder, autoComplete }: { value: string; onChange: (v: string) => void; placeholder: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <input type={show ? 'text' : 'password'} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required />
      <button type="button" className="eye" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
    </>
  );
}

export default function Login() {
  const { user, login, register, emailExists, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<Role>('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [specialty, setSpecialty] = useState(categories[0]);
  const [step, setStep] = useState<1 | 2>(1); // forgot password step
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  if (user) return <Navigate to={roleHome[user.role]} replace />;

  const go = (m: Mode, keepEmail = false) => {
    setMode(m); setError(''); setStep(1); setPassword(''); setConfirm(''); setCode('');
    if (!keepEmail) setEmail('');
    if (m !== 'login') setNotice('');
  };

  const checkNewPassword = () => {
    if (password.length < MIN_PASSWORD) return `Password must be at least ${MIN_PASSWORD} characters.`;
    if (password !== confirm) return 'Passwords do not match.';
    return '';
  };

  const submitLogin = (e: FormEvent) => {
    e.preventDefault();
    const err = login(email, password, role);
    if (err) setError(err); else navigate(roleHome[role], { replace: true });
  };

  const submitRegister = (e: FormEvent) => {
    e.preventDefault();
    const bad = role !== 'user' && !code.trim() ? 'Enter the staff access code.' : !name.trim() ? 'Please enter your full name.' : !/^\S+@\S+\.\S+$/.test(email.trim()) ? 'Enter a valid email address.' : checkNewPassword();
    if (bad) return setError(bad);
    const err = register({ name, email, password, role, specialty, code });
    if (err) setError(err); else navigate(roleHome[role], { replace: true });
  };

  const submitForgot = (e: FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!emailExists(email)) return setError('No account found with that email.');
      setError(''); setStep(2);
      return;
    }
    const bad = checkNewPassword();
    if (bad) return setError(bad);
    const err = resetPassword(email, password);
    if (err) return setError(err);
    setRole('user'); setMode('login'); setPassword(''); setConfirm(''); setStep(1); setError('');
    setNotice('Password updated. You can now sign in with your new password.');
  };

  const emailField = (
    <Field label="Email" icon={<Mail size={16} />}>
      <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" required readOnly={mode === 'forgot' && step === 2} />
    </Field>
  );
  const errorBox = error && <div className="auth-error" role="alert">{error}</div>;

  return (
    <div className="auth-page">
      <aside className="auth-side">
        <Brand />
        <div>
          <h1>Keep every campus fix on track.</h1>
          <p>Report issues with photo and video proof, get them approved, assigned and resolved — all in one place.</p>
          <ul>
            <li><ClipboardCheck size={16} /> Requests with required photo + video evidence</li>
            <li><ShieldCheck size={16} /> Admin approval and team assignment</li>
            <li><Wrench size={16} /> Live task progress for the maintenance team</li>
          </ul>
        </div>
        <small>© 2026 FIXORA · School Maintenance System</small>
      </aside>

      <main className="auth-main">
        {mode === 'login' && (
          <form className="auth-card" onSubmit={submitLogin} noValidate>
            <h2>Sign in</h2>
            <p className="auth-sub">Choose your account type to continue.</p>
            <div className="role-tabs" role="tablist">
              {roles.map((r) => (
                <button type="button" role="tab" aria-selected={role === r.key} key={r.key} className={role === r.key ? 'active' : ''} onClick={() => { setRole(r.key); setError(''); }}>
                  <r.icon size={17} /><span>{roleLabel[r.key]}</span>
                </button>
              ))}
            </div>
            <p className="role-hint">{roles.find((r) => r.key === role)!.hint}</p>
            {notice && <div className="auth-ok" role="status"><CheckCircle2 size={15} /> {notice}</div>}
            {emailField}
            <Field label="Password" icon={<LockKeyhole size={16} />}>
              <PasswordInput value={password} onChange={setPassword} placeholder="Enter your password" autoComplete="current-password" />
            </Field>
            <div className="auth-row"><button type="button" className="auth-link" onClick={() => go('forgot', true)}>Forgot password?</button></div>
            {errorBox}
            <button className="auth-submit" type="submit" disabled={!email || !password}>Sign in as {roleLabel[role]}</button>
            <p className="auth-switch">New here? <button type="button" className="auth-link" onClick={() => go('register')}>Create an account</button></p>
          </form>
        )}

        {mode === 'register' && (
          <form className="auth-card" onSubmit={submitRegister} noValidate>
            <button type="button" className="auth-back" onClick={() => go('login')}><ArrowLeft size={14} /> Back to sign in</button>
            <h2>Create account</h2>
            <p className="auth-sub">Choose the account type you want to create.</p>
            <div className="role-tabs" role="tablist">
              {roles.map((r) => (
                <button type="button" role="tab" aria-selected={role === r.key} key={r.key} className={role === r.key ? 'active' : ''} onClick={() => { setRole(r.key); setError(''); }}>
                  <r.icon size={17} /><span>{roleLabel[r.key]}</span>
                </button>
              ))}
            </div>
            <Field label="Full name" icon={<UserRound size={16} />}>
              <input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Dela Cruz" required />
            </Field>
            {emailField}
            {role === 'maintenance' && (
              <label>Specialty<span className="auth-input"><Wrench size={16} />
                <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
              </span></label>
            )}
            {role !== 'user' && (
              <Field label="Staff access code" icon={<ShieldCheck size={16} />}>
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Provided by the school administrator" autoComplete="off" required />
              </Field>
            )}
            <Field label="Password" icon={<LockKeyhole size={16} />}>
              <PasswordInput value={password} onChange={setPassword} placeholder={`At least ${MIN_PASSWORD} characters`} autoComplete="new-password" />
            </Field>
            <Field label="Confirm password" icon={<LockKeyhole size={16} />}>
              <PasswordInput value={confirm} onChange={setConfirm} placeholder="Re-enter your password" autoComplete="new-password" />
            </Field>
            {errorBox}
            <button className="auth-submit" type="submit" disabled={!name || !email || !password || !confirm || (role !== 'user' && !code)}>Create {roleLabel[role]} account</button>
            <p className="auth-switch">Already registered? <button type="button" className="auth-link" onClick={() => go('login')}>Sign in</button></p>
          </form>
        )}

        {mode === 'forgot' && (
          <form className="auth-card" onSubmit={submitForgot} noValidate>
            <button type="button" className="auth-back" onClick={() => go('login', true)}><ArrowLeft size={14} /> Back to sign in</button>
            <h2>Reset password</h2>
            <p className="auth-sub">{step === 1 ? 'Enter your account email to continue.' : `Choose a new password for ${email}.`}</p>
            {emailField}
            {step === 2 && (
              <>
                <Field label="New password" icon={<LockKeyhole size={16} />}>
                  <PasswordInput value={password} onChange={setPassword} placeholder={`At least ${MIN_PASSWORD} characters`} autoComplete="new-password" />
                </Field>
                <Field label="Confirm new password" icon={<LockKeyhole size={16} />}>
                  <PasswordInput value={confirm} onChange={setConfirm} placeholder="Re-enter your new password" autoComplete="new-password" />
                </Field>
              </>
            )}
            {errorBox}
            <button className="auth-submit" type="submit" disabled={!email || (step === 2 && (!password || !confirm))}>{step === 1 ? 'Continue' : 'Update password'}</button>
            <div className="demo-box demo-note"><span>Demo mode: no email is sent. A real system emails a secure, expiring reset link.</span></div>
          </form>
        )}
      </main>
    </div>
  );
}
