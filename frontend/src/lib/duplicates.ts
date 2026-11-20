import type { RequestItem } from '../types';

// A report is a duplicate when an OPEN request already has the same category + location + title
// (ignoring case, punctuation and extra spaces). Keep in sync with MaintenanceRequest::fingerprint() in the Laravel backend.
export const OPEN_STATUSES: RequestItem['status'][] = ['Pending', 'Approved', 'Assigned', 'In Progress'];

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

export const fingerprint = (r: { category: string; location: string; title: string }) =>
  `${norm(r.category)}|${norm(r.location)}|${norm(r.title)}`;

export const findDuplicate = (list: RequestItem[], input: { category: string; location: string; title: string }) => {
  const fp = fingerprint(input);
  return list.find((r) => OPEN_STATUSES.includes(r.status) && fingerprint(r) === fp);
};

export class DuplicateRequestError extends Error {
  existing: RequestItem;
  constructor(existing: RequestItem) {
    super(`A report for this issue is already open (${existing.id}). Please wait for it to be resolved.`);
    this.name = 'DuplicateRequestError';
    this.existing = existing;
  }
}
