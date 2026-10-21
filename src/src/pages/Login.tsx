import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  Wrench,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import Brand from "../components/Brand";
import { useAuth } from "../context/AuthContext";
import { roleHome, roleLabel } from "../data/constants";
import { accounts } from "../data/users";
import type { Role } from "../../types";

const roles: { key: Role; icon: LucideIcon; hint: string }[] = [
  {
    key: "user",
    icon: UserRound,
    hint: "Report and track maintenance issues.",
  },
  {
    key: "admin",
    icon: ShieldCheck,
    hint: "Approve requests and assign the team.",
  },
  {
    key: "maintenance",
    icon: Wrench,
    hint: "View assigned tasks and update progress.",
  },
];
const demo: Record<Role, string> = {
  user: "user@fixora.edu",
  admin: "admin@fixora.edu",
  maintenance: "rafael@fixora.edu",
};

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  if (user) return <Navigate to={roleHome[user.role]} replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err = login(email, password, role);
    if (err) setError(err);
    else navigate(roleHome[role], { replace: true });
  };

  const fillDemo = () => {
    const acc = accounts.find((a) => a.email === demo[role])!;
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
  };

  return (
    <div className="auth-page">
      <aside className="auth-side">
        <Brand />
        <div>
          <h1>Keep every campus fix on track.</h1>
          <p>
            Report issues with photo and video proof, get them approved,
            assigned and resolved — all in one place.
          </p>
          <ul>
            <li>
              <ClipboardCheck size={16} /> Requests with required photo + video
              evidence
            </li>
            <li>
              <ShieldCheck size={16} /> Admin approval and team assignment
            </li>
            <li>
              <Wrench size={16} /> Live task progress for the maintenance team
            </li>
          </ul>
        </div>
        <small>© 2026 FIXORA · School Maintenance System</small>
      </aside>

      <main className="auth-main">
        <form className="auth-card" onSubmit={submit} noValidate>
          <h2>Sign in</h2>
          <p className="auth-sub">Choose your account type to continue.</p>

          <div className="role-tabs" role="tablist">
            {roles.map((r) => (
              <button
                type="button"
                role="tab"
                aria-selected={role === r.key}
                key={r.key}
                className={role === r.key ? "active" : ""}
                onClick={() => {
                  setRole(r.key);
                  setError("");
                }}
              >
                <r.icon size={17} />
                <span>{roleLabel[r.key]}</span>
              </button>
            ))}
          </div>
          <p className="role-hint">{roles.find((r) => r.key === role)!.hint}</p>

          <label>
            Email
            <span className="auth-input">
              <Mail size={16} />
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                required
              />
            </span>
          </label>
          <label>
            Password
            <span className="auth-input">
              <LockKeyhole size={16} />
              <input
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="eye"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
          </label>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}
          <button
            className="auth-submit"
            type="submit"
            disabled={!email || !password}
          >
            Sign in as {roleLabel[role]}
          </button>

          <div className="demo-box">
            <span>
              Demo account for <b>{roleLabel[role]}</b>
            </span>
            <button type="button" onClick={fillDemo}>
              Fill credentials
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
