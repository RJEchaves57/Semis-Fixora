import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { initialRequests } from '../data/requests';
import { todayLabel } from '../data/constants';
import { getMaintenanceStaff } from './AuthContext';
import { getBlob, putBlob } from '../lib/mediaStore';
import type { Media, Priority, RequestItem } from '../types';

export type NewRequestInput = {
  title: string; description: string; category: string; location: string; priority: Priority;
  images: Media[]; video: Media; requesterId: string; requester: string;
};

type Ctx = {
  requests: RequestItem[];
  addRequest: (input: NewRequestInput) => Promise<RequestItem>;
  approve: (id: string) => void;
  decline: (id: string, reason: string) => void;
  assign: (id: string, staffId: string) => void;
  updateProgress: (id: string, status: 'In Progress' | 'Resolved') => void;
};

const RequestsContext = createContext<Ctx | null>(null);

// Requests are saved in this browser's localStorage (shared by every tab/login in the same browser profile)
// and media Blobs in IndexedDB. DEMO ONLY: a real system keeps both on the server.
const STORE_KEY = 'fixora-requests';
const urlCache = new Map<string, string>(); // media key -> object URL for this tab

const withUrls = (r: RequestItem): RequestItem => ({
  ...r,
  images: r.images.map((m) => ({ ...m, url: (m.key && urlCache.get(m.key)) || m.url })),
  video: r.video ? { ...r.video, url: (r.video.key && urlCache.get(r.video.key)) || r.video.url } : undefined,
});

// Only metadata is stored; object URLs are per-tab so they are rebuilt from the Blobs on load.
const serialize = (list: RequestItem[]) =>
  JSON.stringify(list.map((r) => ({
    ...r,
    images: r.images.map((m) => ({ name: m.name, key: m.key, url: '' })),
    video: r.video ? { name: r.video.name, key: r.video.key, url: '' } : undefined,
  })));

const loadStored = (): RequestItem[] => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return (JSON.parse(raw) as RequestItem[]).map(withUrls);
  } catch { /* ignore */ }
  return initialRequests;
};

async function hydrate(list: RequestItem[]) {
  const media = list.flatMap((r) => [...r.images, ...(r.video ? [r.video] : [])]);
  await Promise.all(media.map(async (m) => {
    if (!m.key || urlCache.has(m.key)) return;
    try {
      const blob = await getBlob(m.key);
      if (blob) urlCache.set(m.key, URL.createObjectURL(blob));
    } catch { /* ignore */ }
  }));
}

export function RequestsProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<RequestItem[]>(loadStored);

  // Rebuild media URLs after a refresh.
  useEffect(() => {
    let live = true;
    hydrate(loadStored()).then(() => { if (live) setRequests((old) => old.map(withUrls)); });
    return () => { live = false; };
  }, []);

  // Save every change.
  useEffect(() => {
    const next = serialize(requests);
    try { if (localStorage.getItem(STORE_KEY) !== next) localStorage.setItem(STORE_KEY, next); } catch { /* ignore */ }
  }, [requests]);

  // Pick up changes made in other tabs (e.g. a user submits while the admin is signed in elsewhere).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORE_KEY || !e.newValue) return;
      const list = loadStored();
      setRequests(list);
      hydrate(list).then(() => setRequests((old) => old.map(withUrls)));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const patch = (id: string, allowed: RequestItem['status'][], change: Partial<RequestItem>) =>
    setRequests((old) => old.map((r) => (r.id === id && allowed.includes(r.status) ? { ...r, ...change } : r)));

  const addRequest: Ctx['addRequest'] = async (input) => {
    const latest = [...loadStored(), ...requests].map((r) => Number(r.id.replace('FX-', '')));
    const id = `FX-${Math.max(...latest) + 1}`;
    const keep = async (m: Media, key: string): Promise<Media> => {
      try {
        if (m.file) await putBlob(key, m.file);
        urlCache.set(key, m.url);
        return { name: m.name, url: m.url, key };
      } catch {
        return { name: m.name, url: m.url }; // storage unavailable: visible in this tab only
      }
    };
    const images = await Promise.all(input.images.map((m, i) => keep(m, `${id}-img-${i}`)));
    const video = await keep(input.video, `${id}-video`);
    const item: RequestItem = { ...input, images, video, id, date: todayLabel(), status: 'Pending', assignee: 'Unassigned' };
    setRequests((old) => [item, ...old]);
    return item;
  };

  const value: Ctx = {
    requests,
    addRequest,
    approve: (id) => patch(id, ['Pending'], { status: 'Approved', declineReason: undefined }),
    decline: (id, reason) => patch(id, ['Pending'], { status: 'Declined', declineReason: reason }),
    assign: (id, staffId) => {
      const staff = getMaintenanceStaff().find((a) => a.id === staffId);
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
