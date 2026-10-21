import { useState } from 'react';
import { Check, UserPlus, X } from 'lucide-react';
import RequestDetail from '../../components/RequestDetail';
import { useRequests } from '../../context/RequestsContext';
import { maintenanceStaff } from '../../data/users';

export default function AdminReviewModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { requests, approve, decline, assign } = useRequests();
  const request = requests.find((r) => r.id === id);
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState('');
  const [staffId, setStaffId] = useState('');
  if (!request) return null;

  const suggested = maintenanceStaff.find((s) => s.specialty && request.category.toLowerCase().includes(s.specialty.toLowerCase()));
  const chosen = staffId || request.assigneeId || suggested?.id || '';

  return (
    <RequestDetail request={request} onClose={onClose}>
      {request.status === 'Pending' && !declining && (
        <>
          <button className="btn btn-danger" onClick={() => setDeclining(true)}><X size={15} /> Decline</button>
          <button className="btn btn-success" onClick={() => approve(request.id)}><Check size={15} /> Approve request</button>
        </>
      )}
      {request.status === 'Pending' && declining && (
        <>
          <div className="grow"><textarea rows={2} autoFocus placeholder="Reason for declining (required)" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
          <button className="btn btn-ghost" onClick={() => setDeclining(false)}>Back</button>
          <button className="btn btn-danger" disabled={!reason.trim()} onClick={() => { decline(request.id, reason.trim()); setDeclining(false); }}>Confirm decline</button>
        </>
      )}
      {(request.status === 'Approved' || request.status === 'Assigned') && (
        <>
          <div className="grow">
            <select value={chosen} onChange={(e) => setStaffId(e.target.value)} aria-label="Assign to maintenance team member">
              <option value="" disabled>Select maintenance team member…</option>
              {maintenanceStaff.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.specialty}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" disabled={!chosen || chosen === request.assigneeId} onClick={() => assign(request.id, chosen)}>
            <UserPlus size={15} /> {request.status === 'Assigned' ? 'Reassign' : 'Assign task'}
          </button>
        </>
      )}
      {['In Progress', 'Resolved', 'Declined'].includes(request.status) && <button className="btn btn-ghost" onClick={onClose}>Close</button>}
    </RequestDetail>
  );
}
