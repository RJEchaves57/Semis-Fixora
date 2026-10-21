import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCheck, ClipboardList, PlayCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestsContext';
import { PriorityBadge, StatusBadge } from '../../components/Badges';
import RequestDetail from '../../components/RequestDetail';

export default function MaintenanceDashboard() {
  const { user } = useAuth();
  const { requests, updateProgress } = useRequests();
  const [open, setOpen] = useState<string | null>(null);
  const mine = requests.filter((r) => r.assigneeId === user!.id);
  const todo = mine.filter((r) => r.status === 'Assigned');
  const doing = mine.filter((r) => r.status === 'In Progress');
  const done = mine.filter((r) => r.status === 'Resolved');
  const order = { High: 0, Medium: 1, Low: 2 } as const;
  const next = [...todo, ...doing].sort((a, b) => order[a.priority] - order[b.priority]);
  const selected = mine.find((r) => r.id === open);
  const urgent = next.filter((r) => r.priority === 'High').length;

  const tiles = [
    { label: 'New assignments', value: todo.length, icon: ClipboardList, tone: 'amber' },
    { label: 'In progress', value: doing.length, icon: PlayCircle, tone: 'blue' },
    { label: 'Completed', value: done.length, icon: CheckCheck, tone: 'green' },
  ];

  return (
    <>
      <div className="m-head">
        <div><h1>Good day, {user!.name.split(' ')[0]}.</h1><p>{next.length ? `You have ${next.length} open task${next.length > 1 ? 's' : ''} assigned by the admin.` : 'No open tasks — nice work.'}</p></div>
        {urgent > 0 && <div className="m-alert"><AlertTriangle size={16} /> {urgent} high-priority</div>}
      </div>

      <div className="m-tiles">{tiles.map((t) => <div key={t.label} className={`m-tile-stat ${t.tone}`}><t.icon size={22} /><b>{t.value}</b><span>{t.label}</span></div>)}</div>

      <section className="m-panel">
        <div className="m-panel-head"><h2>Up next</h2><Link to="/maintenance/tasks">Open task board <ArrowRight size={14} /></Link></div>
        {next.length === 0 ? <p className="m-empty">Nothing waiting for you.</p> : (
          <ul className="m-list">
            {next.map((r) => (
              <li key={r.id}>
                <button className="m-li-main" onClick={() => setOpen(r.id)}>
                  <PriorityBadge priority={r.priority} />
                  <span><b>{r.title}</b><small>{r.id} · {r.location}</small></span>
                </button>
                <StatusBadge status={r.status} />
                {r.status === 'Assigned'
                  ? <button className="btn btn-primary btn-sm" onClick={() => updateProgress(r.id, 'In Progress')}>Start work</button>
                  : <button className="btn btn-success btn-sm" onClick={() => updateProgress(r.id, 'Resolved')}>Mark resolved</button>}
              </li>
            ))}
          </ul>
        )}
      </section>
      {selected && <RequestDetail request={selected} onClose={() => setOpen(null)} />}
    </>
  );
}
