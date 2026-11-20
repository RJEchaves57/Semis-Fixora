import { Check, X } from 'lucide-react';
import type { Status } from '../types';

const steps: { key: Status; label: string }[] = [
  { key: 'Pending', label: 'Submitted' },
  { key: 'Approved', label: 'Approved' },
  { key: 'Assigned', label: 'Assigned' },
  { key: 'In Progress', label: 'In progress' },
  { key: 'Resolved', label: 'Resolved' },
];

export default function StatusTracker({ status }: { status: Status }) {
  if (status === 'Declined') {
    return <div className="track-declined"><X size={14} /> This request was declined by the administrator.</div>;
  }
  const current = steps.findIndex((s) => s.key === status);
  return (
    <ol className="track">
      {steps.map((s, i) => (
        <li key={s.key} className={i < current || status === 'Resolved' ? 'done' : i === current ? 'now' : ''}>
          <span>{i < current || status === 'Resolved' ? <Check size={12} /> : i + 1}</span>
          <small>{s.label}</small>
        </li>
      ))}
    </ol>
  );
}
