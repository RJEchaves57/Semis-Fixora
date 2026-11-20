import { useState } from 'react';
import { CheckCheck, MapPin, PlayCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestsContext';
import { PriorityBadge } from '../../components/Badges';
import RequestDetail from '../../components/RequestDetail';
import type { RequestItem } from '../../types';

const columns: { status: RequestItem['status']; title: string; hint: string }[] = [
  { status: 'Assigned', title: 'To do', hint: 'Assigned by admin' },
  { status: 'In Progress', title: 'In progress', hint: 'You’re working on these' },
  { status: 'Resolved', title: 'Done', hint: 'Completed' },
];

export default function MyTasks() {
  const { user } = useAuth();
  const { requests, updateProgress } = useRequests();
  const [open, setOpen] = useState<string | null>(null);
  const mine = requests.filter((r) => r.assigneeId === user!.id);
  const selected = mine.find((r) => r.id === open);

  return (
    <>
      <div className="m-head"><div><h1>My tasks</h1><p>Open a card to see the photos and video the reporter attached.</p></div></div>
      <div className="m-board">
        {columns.map((c) => {
          const items = mine.filter((r) => r.status === c.status);
          return (
            <section key={c.status} className={`m-col col-${c.status.toLowerCase().replace(' ', '-')}`}>
              <header><h2>{c.title}</h2><span>{items.length}</span><small>{c.hint}</small></header>
              {items.length === 0 && <p className="m-empty">No tasks here.</p>}
              {items.map((r) => (
                <article className="m-card" key={r.id}>
                  <button className="m-card-main" onClick={() => setOpen(r.id)}>
                    <div className="m-card-top"><small>{r.id}</small><PriorityBadge priority={r.priority} /></div>
                    <h3>{r.title}</h3>
                    <p><MapPin size={13} /> {r.location}</p>
                    <p className="m-cat">{r.category} · {r.images.length} photo{r.images.length === 1 ? '' : 's'}{r.video ? ' · video' : ''}</p>
                  </button>
                  {r.status === 'Assigned' && <button className="btn btn-primary btn-sm m-act" onClick={() => updateProgress(r.id, 'In Progress')}><PlayCircle size={14} /> Start work</button>}
                  {r.status === 'In Progress' && <button className="btn btn-success btn-sm m-act" onClick={() => updateProgress(r.id, 'Resolved')}><CheckCheck size={14} /> Mark resolved</button>}
                </article>
              ))}
            </section>
          );
        })}
      </div>
      {selected && <RequestDetail request={selected} onClose={() => setOpen(null)}>
        {selected.status === 'Assigned' && <button className="btn btn-primary" onClick={() => updateProgress(selected.id, 'In Progress')}><PlayCircle size={15} /> Start work</button>}
        {selected.status === 'In Progress' && <button className="btn btn-success" onClick={() => updateProgress(selected.id, 'Resolved')}><CheckCheck size={15} /> Mark resolved</button>}
      </RequestDetail>}
    </>
  );
}
