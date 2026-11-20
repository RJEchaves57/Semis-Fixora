import type { Priority, Status } from '../types';

export const StatusBadge = ({ status }: { status: Status }) => (
  <span className={`st st-${status.toLowerCase().replace(' ', '-')}`}>{status}</span>
);
export const PriorityBadge = ({ priority }: { priority: Priority }) => (
  <span className={`pr pr-${priority.toLowerCase()}`}>{priority}</span>
);
