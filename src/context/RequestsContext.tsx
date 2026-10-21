import { createContext, useContext, useState, type ReactNode } from 'react';
import { initialRequests } from '../data/requests';
import { todayLabel } from '../data/constants';
import { accounts } from '../data/users';
import type { Media, Priority, RequestItem } from '../types';

export type NewRequestInput = {
  title: string; description: string; category: string; location: string; priority: Priority;
  images: Media[]; video: Media; requesterId: string; requester: string;
};

type Ctx = {
  requests: RequestItem[];
  addRequest: (input: NewRequestInput) => RequestItem;
  approve: (id: string) => void;
  decline: (id: string, reason: string) => void;
  assign: (id: string, staffId: string) => void;
  updateProgress: (id: string, status: 'In Progress' | 'Resolved') => void;
};

const RequestsContext = createContext<Ctx | null>(null);

export function RequestsProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<RequestItem[]>(initialRequests);
  const patch = (id: string, allowed: RequestItem['status'][], change: Partial<RequestItem>) =>
    setRequests((old) => old.map((r) => (r.id === id && allowed.includes(r.status) ? { ...r, ...change } : r)));

  const addRequest: Ctx['addRequest'] = (input) => {
    const next = Math.max(...requests.map((r) => Number(r.id.replace('FX-', '')))) + 1;
    const item: RequestItem = { ...input, id: `FX-${next}`, date: todayLabel(), status: 'Pending', assignee: 'Unassigned' };
    setRequests((old) => [item, ...old]);
    return item;
  };

  const value: Ctx = {
    requests,
    addRequest,
    approve: (id) => patch(id, ['Pending'], { status: 'Approved', declineReason: undefined }),
    decline: (id, reason) => patch(id, ['Pending'], { status: 'Declined', declineReason: reason }),
    assign: (id, staffId) => {
      const staff = accounts.find((a) => a.id === staffId && a.role === 'maintenance');
      if (staff) patch(id, ['Approved', 'Assigned'], { status: 'Assigned', assigneeId: staff.id, assignee: staff.name });
    },
    updateProgress: (id, status) => patch(id, status === 'In Progress' ? ['Assigned'] : ['In Progress'], { status }),
  };

  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRequests() {
  const ctx = useContext(RequestsContext);
  if (!ctx) throw new Error('useRequests must be used inside RequestsProvider');
  return ctx;
}
