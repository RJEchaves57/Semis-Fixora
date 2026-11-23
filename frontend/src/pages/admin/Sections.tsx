import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plus,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { useRequests } from '../../context/RequestsContext';
import { apiFetch } from '../../lib/api';
import { initials } from '../../data/constants';
import type { Session } from '../../types';

type Facility = {
  id: number;
  name: string;
  details: string;
  condition: string;
  condition_percent: number;
  open_issues: number;
};

type ScheduleItem = {
  id: number;
  time: string;
  title: string;
  location: string;
  assignee: string;
  status: string;
  duration: string;
};

type Settings = {
  workspace_name: string;
  system_name: string;
  timezone: string;
};

type FormState = Record<string, string>;

const defaultSettings: Settings = {
  workspace_name: 'Northfield Campus',
  system_name: 'FIXORA School Maintenance',
  timezone: 'Asia/Manila',
};

function ActionDialog({
  title,
  description,
  fields,
  values,
  onChange,
  onSubmit,
  onClose,
  error,
  saving,
}: {
  title: string;
  description: string;
  fields: { key: string; label: string; type?: string; options?: string[] }[];
  values: FormState;
  onChange: (key: string, value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
  error: string;
  saving: boolean;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form
        className="request-modal"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
      >
        <div className="modal-head">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" /> FIXORA / NEW ENTRY
            </div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-two">
          {fields.map((field) => (
            <label key={field.key}>
              {field.label}
              {field.options ? (
                <select
                  value={values[field.key] ?? ''}
                  onChange={(e) => onChange(field.key, e.target.value)}
                >
                  {field.options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type ?? 'text'}
                  value={values[field.key] ?? ''}
                  onChange={(e) => onChange(field.key, e.target.value)}
                />
              )}
            </label>
          ))}
        </div>
        {error && <div className="f-alert" role="alert">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Sections() {
  const { pathname } = useLocation();
  const { requests, staff, refresh } = useRequests();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [dialog, setDialog] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [title, desc] =
    pathname === '/admin/facilities'
      ? ['Facilities', 'Monitor campus buildings, condition, and maintenance needs.', Building2]
      : pathname === '/admin/staff'
        ? ['Maintenance team', 'Your maintenance team and their active workloads.', Users]
        : pathname === '/admin/schedule'
          ? ['Maintenance schedule', 'Plan inspections, repairs, and preventive maintenance.', CalendarDays]
          : ['Settings', 'Manage workspace preferences and system information.', Wrench];

  const load = async () => {
    try {
      const [f, s, cfg] = await Promise.all([
        apiFetch<Facility[]>('/facilities'),
        apiFetch<ScheduleItem[]>('/schedules'),
        apiFetch<Settings>('/settings'),
      ]);
      setFacilities(f);
      setSchedules(s);
      setSettings({ ...defaultSettings, ...cfg });
    } catch (e) {
      console.error('Unable to load Fixora workspace data:', e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openDialog = (name: string, initial: FormState = {}) => {
    setForm(initial);
    setError('');
    setDialog(name);
  };

  const change = (key: string, value: string) =>
    setForm((old) => ({ ...old, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!dialog) return;
    setSaving(true);
    setError('');
    try {
      if (dialog === 'facility') {
        await apiFetch('/facilities', {
          method: 'POST',
          body: JSON.stringify({
            name: form.name,
            details: form.details ?? '',
            condition: form.condition ?? 'Good',
            condition_percent: Number(form.condition_percent ?? 90),
            open_issues: Number(form.open_issues ?? 0),
          }),
        });
      } else if (dialog === 'schedule') {
        await apiFetch('/schedules', {
          method: 'POST',
          body: JSON.stringify({
            time: form.time,
            title: form.title,
            location: form.location ?? '',
            assignee: form.assignee ?? '',
            status: form.status ?? 'Upcoming',
            duration: form.duration ?? '30-60 min',
          }),
        });
      } else if (dialog === 'staff') {
        await apiFetch('/staff', {
          method: 'POST',
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            title: form.title ?? 'Maintenance technician',
            specialty: form.specialty ?? 'General',
          }),
        });
        await refresh();
      } else if (dialog === 'settings') {
        await apiFetch('/settings', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      }
      setDialog(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addLabel =
    pathname === '/admin/schedule'
      ? 'Add schedule'
      : pathname === '/admin/staff'
        ? 'Add team member'
        : pathname === '/admin/facilities'
          ? 'Add facility'
          : 'Save changes';

  const onAdd = () => {
    if (pathname === '/admin/facilities') {
      openDialog('facility', {
        name: '',
        details: '',
        condition: 'Good',
        condition_percent: '90',
        open_issues: '0',
      });
    } else if (pathname === '/admin/staff') {
      openDialog('staff', {
        name: '',
        email: '',
        password: '',
        title: 'Maintenance technician',
        specialty: 'General',
      });
    } else if (pathname === '/admin/schedule') {
      openDialog('schedule', {
        time: '',
        title: '',
        location: '',
        assignee: '',
        status: 'Upcoming',
        duration: '30-60 min',
      });
    } else {
      openDialog('settings', settings);
    }
  };

  const staffRows = (staff as Session[]).map((m) => [
    initials(m.name),
    m.name,
    m.title ?? 'Maintenance technician',
    m.specialty ?? 'General',
    `${
      requests.filter(
        (r) =>
          r.assigneeId === m.id &&
          (r.status === 'Assigned' || r.status === 'In Progress'),
      ).length
    } active tasks`,
  ]);

  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" /> FIXORA / MANAGEMENT
          </div>
          <h1>{title}</h1>
          <p>{desc}</p>
        </div>
        <button className="primary-btn" onClick={onAdd}>
          <Plus size={17} /> {addLabel}
        </button>
      </div>

      {pathname === '/admin/facilities' ? (
        <div className="facility-grid">
          {facilities.map((f) => (
            <article className="panel facility-card" key={f.id}>
              <div className="facility-top">
                <span className="facility-icon"><Building2 size={20} /></span>
                <span className={`condition ${f.condition === 'Good' ? 'condition-good' : 'condition-warn'}`}>
                  <i />{f.condition}
                </span>
              </div>
              <h2>{f.name}</h2>
              <p>{f.details}</p>
              <div className="condition-row">
                <span>Facility condition</span><b>{f.condition_percent}%</b>
              </div>
              <div className="condition-track">
                <span style={{ width: `${f.condition_percent}%` }} />
              </div>
              <div className="facility-foot">
                <span>{f.open_issues ? `${f.open_issues} open issues` : 'No critical issues'}</span>
                <ArrowUpRight size={15} />
              </div>
            </article>
          ))}
        </div>
      ) : pathname === '/admin/staff' ? (
        <section className="panel full-requests">
          <div className="list-toolbar">
            <div><h2>Maintenance team</h2><p>Team members and current workloads.</p></div>
            <span className="count-pill">{staffRows.length} members</span>
          </div>
          <div className="staff-list">
            {staffRows.map((s) => (
              <div className="staff-row" key={s[1]}>
                <span className="avatar staff-avatar">{s[0]}</span>
                <div className="staff-name"><b>{s[1]}</b><small>{s[2]}</small></div>
                <span className="staff-specialty">{s[3]}</span>
                <span className="staff-work"><Wrench size={14} />{s[4]}</span>
                <span className="staff-online"><i /> Active</span>
              </div>
            ))}
          </div>
        </section>
      ) : pathname === '/admin/schedule' ? (
        <section className="panel schedule-page">
          <div className="panel-head">
            <div><h2>Maintenance schedule</h2><p>Planned maintenance and inspections</p></div>
            <span className="count-pill">{schedules.length} scheduled</span>
          </div>
          {schedules.map((s, i) => (
            <div className="schedule-full-row" key={s.id}>
              <div className="schedule-time">{s.time}<small>{s.duration}</small></div>
              <span className={`schedule-dot schedule-dot-${i}`} />
              <div className="schedule-task">
                <b>{s.title}</b>
                <p>{s.location}</p>
                <small><Users size={13} />{s.assignee}</small>
              </div>
              <span className={`schedule-state state-${i}`}>{s.status}</span>
            </div>
          ))}
        </section>
      ) : (
        <section className="settings-grid">
          <article className="panel setting-card">
            <span className="setting-icon"><Building2 size={20} /></span>
            <h2>Workspace details</h2>
            <p>School profile and campus information.</p>
            <label>Workspace name<input value={settings.workspace_name} readOnly /></label>
            <label>System name<input value={settings.system_name} readOnly /></label>
            <label>Timezone<input value={settings.timezone} readOnly /></label>
            <button className="primary-btn" onClick={onAdd}>Save changes</button>
          </article>
          <article className="panel setting-card">
            <span className="setting-icon"><CheckCircle2 size={20} /></span>
            <h2>System status</h2>
            <p>Current health of your maintenance workspace.</p>
            <div className="system-row"><span>Application status</span><b className="online-label">Operational</b></div>
            <div className="system-row"><span>Authentication</span><b>Demo accounts (role-based)</b></div>
            <div className="system-row"><span>Data storage</span><b>Neon PostgreSQL (live)</b></div>
            <div className="system-row"><span>Last checked</span><b>Just now</b></div>
            <div className="system-note"><Clock3 size={16} /> Workspace data is saved to the Fixora API.</div>
            <Link className="text-link" to="/admin">Back to overview <ArrowUpRight size={14} /></Link>
          </article>
        </section>
      )}

      {dialog === 'facility' && (
        <ActionDialog
          title="Add facility"
          description="Create a new campus facility record."
          fields={[
            { key: 'name', label: 'Facility name' },
            { key: 'details', label: 'Details' },
            { key: 'condition', label: 'Condition', options: ['Good', 'Attention'] },
            { key: 'condition_percent', label: 'Condition %', type: 'number' },
            { key: 'open_issues', label: 'Open issues', type: 'number' },
          ]}
          values={form}
          onChange={change}
          onSubmit={submit}
          onClose={() => setDialog(null)}
          error={error}
          saving={saving}
        />
      )}

      {dialog === 'schedule' && (
        <ActionDialog
          title="Add schedule"
          description="Add a planned maintenance task to the schedule."
          fields={[
            { key: 'time', label: 'Time' },
            { key: 'title', label: 'Task' },
            { key: 'location', label: 'Location' },
            { key: 'assignee', label: 'Assignee' },
            { key: 'status', label: 'Status', options: ['Upcoming', 'In progress', 'Completed'] },
            { key: 'duration', label: 'Duration' },
          ]}
          values={form}
          onChange={change}
          onSubmit={submit}
          onClose={() => setDialog(null)}
          error={error}
          saving={saving}
        />
      )}

      {dialog === 'staff' && (
        <ActionDialog
          title="Add team member"
          description="Create a new maintenance account. They can sign in immediately."
          fields={[
            { key: 'name', label: 'Full name' },
            { key: 'email', label: 'Email' },
            { key: 'password', label: 'Password', type: 'password' },
            { key: 'title', label: 'Title' },
            { key: 'specialty', label: 'Specialty' },
          ]}
          values={form}
          onChange={change}
          onSubmit={submit}
          onClose={() => setDialog(null)}
          error={error}
          saving={saving}
        />
      )}

      {dialog === 'settings' && (
        <ActionDialog
          title="Save changes"
          description="Update the workspace details saved in the database."
          fields={[
            { key: 'workspace_name', label: 'Workspace name' },
            { key: 'system_name', label: 'System name' },
            { key: 'timezone', label: 'Timezone' },
          ]}
          values={form}
          onChange={change}
          onSubmit={submit}
          onClose={() => setDialog(null)}
          error={error}
          saving={saving}
        />
      )}
    </>
  );
}
