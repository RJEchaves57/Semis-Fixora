import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ClipboardCheck, Clock3, Eye, UserPlus, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestsContext';
import { categories } from '../../data/constants';
import { PriorityBadge, StatusBadge } from '../../components/Badges';
import AdminReviewModal from './AdminReviewModal';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { requests } = useRequests();
  const [open, setOpen] = useState<string | null>(null);

  const count = (...s: string[]) => requests.filter((r) => s.includes(r.status)).length;
  const pending = requests.filter((r) => r.status === 'Pending');
  const toAssign = requests.filter((r) => r.status === 'Approved');
  const stats = [
    { label: 'Total requests', value: requests.length, desc: 'all time', icon: ClipboardCheck, tone: 'teal' },
    { label: 'Awaiting approval', value: pending.length, desc: 'need your decision', icon: Clock3, tone: 'amber' },
    { label: 'Active work', value: count('Assigned', 'In Progress'), desc: 'with maintenance team', icon: Wrench, tone: 'blue' },
    { label: 'Resolved', value: count('Resolved'), desc: 'completed', icon: CheckCircle2, tone: 'green' },
  ];
  const byCat = categories.map((c) => ({ c, total: requests.filter((r) => r.category === c).length, done: requests.filter((r) => r.category === c && r.status === 'Resolved').length }));
  const max = Math.max(1, ...byCat.map((b) => b.total));
  const waiting = count('Pending', 'Approved'), working = count('Assigned', 'In Progress'), done = count('Resolved'), total = Math.max(1, waiting + working + done);
  const a = (waiting / total) * 100, b = a + (working / total) * 100;
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> {date}</div>
          <h1>Welcome, {user?.name.split(' ')[0]} <span>✦</span></h1>
          <p>Approve incoming requests and assign them to your maintenance team.</p>
        </div>
      </div>

      <section className="stats-grid">
        {stats.map((s) => (
          <article className="stat-card" key={s.label}>
            <div className="stat-top"><span>{s.label}</span><span className={`stat-icon ${s.tone}`}><s.icon size={18} /></span></div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-foot"><span>{s.desc}</span></div>
          </article>
        ))}
      </section>

      <section className="middle-grid">
        <article className="panel activity-panel">
          <div className="panel-head"><div><h2>Requests by category</h2><p>Received vs. resolved</p></div></div>
          <div className="chart-legend"><span><i className="legend-teal" /> Received</span><span><i className="legend-light" /> Resolved</span></div>
          <div className="bar-chart">
            {byCat.map((x) => (
              <div className="bar-group" key={x.c} title={`${x.c}: ${x.total} received, ${x.done} resolved`}>
                <span className="bar received" style={{ height: `${(x.total / max) * 100}%`, minHeight: x.total ? 6 : 2 }} />
                <span className="bar resolved" style={{ height: `${(x.done / max) * 100}%`, minHeight: x.done ? 6 : 2 }} />
              </div>
            ))}
          </div>
          <div className="chart-axis">{byCat.map((x) => <span key={x.c}>{x.c.split(' ')[0]}</span>)}</div>
        </article>

        <article className="panel distribution-panel">
          <div className="panel-head"><div><h2>Request overview</h2><p>Current status breakdown</p></div></div>
          <div className="donut-wrap">
            <div className="donut" style={{ background: `conic-gradient(#d8a95c 0 ${a}%,#4e8fbd ${a}% ${b}%,#56dfc5 ${b}% 100%)` }}>
              <div><strong>{requests.length}</strong><small>Total</small></div>
            </div>
          </div>
          <div className="status-legend">
            <div><span className="status-name"><i className="dot pending-dot" /> Waiting</span><b>{waiting}</b><span className="legend-percent">{Math.round(a)}%</span></div>
            <div><span className="status-name"><i className="dot progress-dot" /> In work</span><b>{working}</b><span className="legend-percent">{Math.round(b - a)}%</span></div>
            <div><span className="status-name"><i className="dot resolved-dot" /> Resolved</span><b>{done}</b><span className="legend-percent">{Math.round(100 - b)}%</span></div>
          </div>
        </article>
      </section>

      <section className="bottom-grid">
        <article className="panel requests-panel">
          <div className="panel-head"><div><h2>Awaiting your approval</h2><p>Review the photos and video, then approve or decline.</p></div><Link className="text-link" to="/admin/requests">View all <ArrowRight size={15} /></Link></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>REQUEST</th><th>LOCATION</th><th>PRIORITY</th><th>MEDIA</th><th /></tr></thead>
              <tbody>
                {pending.length === 0 && <tr><td colSpan={5} className="muted-cell">No requests are waiting for approval.</td></tr>}
                {pending.map((r) => (
                  <tr key={r.id}>
                    <td><div className="request-cell"><span className="request-symbol general"><Wrench size={15} /></span><span><b>{r.title}</b><small>{r.id} · {r.requester}</small></span></div></td>
                    <td className="muted-cell">{r.location}</td>
                    <td><PriorityBadge priority={r.priority} /></td>
                    <td className="muted-cell">{r.images.length} photo{r.images.length === 1 ? '' : 's'}{r.video ? ' · video' : ''}</td>
                    <td><button className="btn btn-primary btn-sm" onClick={() => setOpen(r.id)}><Eye size={13} /> Review</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel admin-assign-panel">
          <div className="panel-head"><div><h2>Ready to assign</h2><p>Approved, no technician yet</p></div></div>
          <div className="assign-list">
            {toAssign.length === 0 && <p className="muted-cell">Nothing to assign right now.</p>}
            {toAssign.map((r) => (
              <div className="assign-row" key={r.id}>
                <div><b>{r.title}</b><small>{r.id} · {r.category}</small></div>
                <StatusBadge status={r.status} />
                <button className="btn btn-ghost btn-sm" onClick={() => setOpen(r.id)}><UserPlus size={13} /> Assign</button>
              </div>
            ))}
          </div>
        </article>
      </section>
      {open && <AdminReviewModal id={open} onClose={() => setOpen(null)} />}
    </>
  );
}
