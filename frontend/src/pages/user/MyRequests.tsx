import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Hammer, Image as ImageIcon, MapPin, PlusCircle, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestsContext';
import { PriorityBadge, StatusBadge } from '../../components/Badges';
import RequestDetail from '../../components/RequestDetail';

const tabs = ['All', 'Pending', 'Approved', 'In Progress', 'Resolved', 'Declined'] as const;

export default function MyRequests() {
  const { user } = useAuth();
  const { requests } = useRequests();
  const [tab, setTab] = useState<(typeof tabs)[number]>('All');
  const [open, setOpen] = useState<string | null>(null);
  const mine = requests.filter((r) => r.requesterId === user!.id);
  const shown = mine.filter((r) => tab === 'All' || (tab === 'Approved' ? r.status === 'Approved' || r.status === 'Assigned' : r.status === tab));
  const selected = mine.find((r) => r.id === open);

  return (
    <>
      <div className="u-page-head">
        <div><h1>My requests</h1><p>Track every report you’ve submitted.</p></div>
        <Link to="/user/new" className="btn btn-primary"><PlusCircle size={16} /> New request</Link>
      </div>
      <div className="u-tabs">{tabs.map((t) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
      {shown.length === 0 ? <div className="u-card u-empty"><p>No requests in this view.</p></div> : (
        <div className="u-grid">
          {shown.map((r) => (
            <article key={r.id} className="u-req" onClick={() => setOpen(r.id)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setOpen(r.id); }}>
              <div className="u-req-img">{r.images[0] ? <img src={r.images[0].url} alt="" /> : <Hammer size={26} />}</div>
              <div className="u-req-body">
                <div className="u-req-top"><small>{r.id}</small><StatusBadge status={r.status} /></div>
                <h3>{r.title}</h3>
                <p><MapPin size={13} /> {r.location}</p>
                <div className="u-req-foot">
                  <PriorityBadge priority={r.priority} />
                  <span><ImageIcon size={13} /> {r.images.length}</span>
                  {r.video && <span><Video size={13} /> 1</span>}
                  <span className="u-date">{r.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {selected && <RequestDetail request={selected} onClose={() => setOpen(null)} />}
    </>
  );
}
