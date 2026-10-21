import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, FilePlus2, Hammer, ListChecks } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestsContext';
import { StatusBadge } from '../../components/Badges';
import RequestDetail from '../../components/RequestDetail';

export default function UserDashboard() {
  const { user } = useAuth();
  const { requests } = useRequests();
  const [open, setOpen] = useState<string | null>(null);
  const mine = requests.filter((r) => r.requesterId === user!.id);
  const n = (...s: string[]) => mine.filter((r) => s.includes(r.status)).length;
  const stats = [
    { label: 'My requests', value: mine.length, icon: ListChecks, tone: 'indigo' },
    { label: 'Awaiting approval', value: n('Pending'), icon: Clock3, tone: 'amber' },
    { label: 'Being fixed', value: n('Approved', 'Assigned', 'In Progress'), icon: Hammer, tone: 'violet' },
    { label: 'Resolved', value: n('Resolved'), icon: CheckCircle2, tone: 'green' },
  ];
  const selected = mine.find((r) => r.id === open);

  return (
    <>
      <section className="u-hero">
        <div>
          <h1>Hi {user!.name.split(' ')[0]}, what needs fixing?</h1>
          <p>Report a campus issue with photos and a short video. We’ll keep you updated as it’s approved and repaired.</p>
        </div>
        <Link to="/user/new" className="btn u-hero-btn"><FilePlus2 size={17} /> Create new request</Link>
      </section>

      <section className="u-stats">
        {stats.map((s) => <article key={s.label} className={`u-stat ${s.tone}`}><span><s.icon size={20} /></span><b>{s.value}</b><small>{s.label}</small></article>)}
      </section>

      <section className="u-card">
        <div className="u-card-head"><h2>Recent requests</h2><Link to="/user/requests">View all <ArrowRight size={14} /></Link></div>
        {mine.length === 0 ? (
          <div className="u-empty"><p>You haven’t submitted any requests yet.</p><Link to="/user/new" className="btn btn-primary">Submit your first request</Link></div>
        ) : (
          <ul className="u-list">
            {mine.slice(0, 5).map((r) => (
              <li key={r.id}>
                <button onClick={() => setOpen(r.id)}>
                  <span className="u-thumb">{r.images[0] ? <img src={r.images[0].url} alt="" /> : <Hammer size={18} />}</span>
                  <span className="u-li-main"><b>{r.title}</b><small>{r.id} · {r.location} · {r.date}</small></span>
                  <StatusBadge status={r.status} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      {selected && <RequestDetail request={selected} onClose={() => setOpen(null)} />}
    </>
  );
}
