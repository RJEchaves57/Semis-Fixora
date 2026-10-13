
import { Search, Plus, Download, SlidersHorizontal, ArrowUpRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { RequestItem } from '../types';

const categories = [
  'Electrical',
  'Plumbing',
  'HVAC',
  'Furniture',
  'Carpentry',
  'IT Equipment',
  'Cleaning',
  'Building & Safety',
  'Other',
];

type RequestsProps = {
  requests: RequestItem[];
  onNew: () => void;
  onStatus: (id: string, status: RequestItem['status']) => void;
};

export default function Requests({
  requests,
  onNew,
  onStatus,
}: RequestsProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All statuses');
  const [categoryFilter, setCategoryFilter] = useState('All categories');

  const filtered = useMemo(
    () =>
      requests.filter((r) => {
        const text = `${r.id} ${r.title} ${r.location} ${r.requester} ${r.category}`.toLowerCase();
        const matchesSearch = text.includes(query.toLowerCase());
        const matchesStatus =
          filter === 'All statuses' || r.status === filter;
        const matchesCategory =
          categoryFilter === 'All categories' ||
          r.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      }),
    [requests, query, filter, categoryFilter]
  );

  const exportCSV = () => {
    const escapeCSV = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const headers = [
      'ID',
      'Title',
      'Category',
      'Location',
      'Requester',
      'Date',
      'Priority',
      'Status',
      'Assignee',
    ];

    const rows = filtered.map((r) =>
      [
        r.id,
        r.title,
        r.category,
        r.location,
        r.requester,
        r.date,
        r.priority,
        r.status,
        r.assignee,
      ]
        .map(escapeCSV)
        .join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    );
    const link = document.createElement('a');

    link.href = url;
    link.download = 'fixora-requests.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" /> OPERATIONS / REQUESTS
          </div>
          <h1>Maintenance requests</h1>
          <p>Track, assign, and resolve maintenance issues across campus.</p>
        </div>
        <button className="primary-btn" onClick={onNew}>
          <Plus size={17} /> Create request
        </button>
      </div>

      <div className="request-kpis">
        <div>
          <span>All requests</span>
          <b>{requests.length}</b>
        </div>
        <div>
          <span>Pending review</span>
          <b>{requests.filter((r) => r.status === 'Pending').length}</b>
        </div>
        <div>
          <span>In progress</span>
          <b>{requests.filter((r) => r.status === 'In Progress').length}</b>
        </div>
        <div>
          <span>Resolved</span>
          <b>{requests.filter((r) => r.status === 'Resolved').length}</b>
        </div>
      </div>

      <section className="panel full-requests">
        <div className="list-toolbar">
          <div>
            <h2>
              All requests <span className="count-pill">{filtered.length}</span>
            </h2>
            <p>All reported issues from your school workspace.</p>
          </div>

          <div className="filter-actions">
            <label className="table-search">
              <Search size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search requests..."
                aria-label="Search requests"
              />
            </label>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="All categories">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="All statuses">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Urgent">Urgent</option>
            </select>

            <button className="outline-btn" onClick={exportCSV}>
              <Download size={15} /> Export
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="requests-table">
            <thead>
              <tr>
                <th>REQUEST DETAILS</th>
                <th>LOCATION</th>
                <th>REPORTED BY</th>
                <th>DATE</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
                <th>ASSIGNEE</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="request-cell">
                      <span className="request-symbol general">
                        <SlidersHorizontal size={15} />
                      </span>
                      <span>
                        <b>{r.title}</b>
                        <small>
                          {r.id} · {r.category}
                        </small>
                      </span>
                    </div>
                  </td>
                  <td className="muted-cell">{r.location}</td>
                  <td>{r.requester}</td>
                  <td className="muted-cell">{r.date}</td>
                  <td>
                    <span
                      className={`priority priority-${r.priority.toLowerCase()}`}
                    >
                      <i /> {r.priority}
                    </span>
                  </td>
                  <td>
                    <select
                      className={`status-select status-${r.status
                        .toLowerCase()
                        .replace(' ', '-')}`}
                      value={r.status}
                      aria-label={`Update status for ${r.id}`}
                      onChange={(e) =>
                        onStatus(
                          r.id,
                          e.target.value as RequestItem['status']
                        )
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </td>
                  <td>
                    <span className="assignee-text">{r.assignee}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="empty-state">
              No requests match your search or selected filters.
            </div>
          )}
        </div>

        <div className="table-foot">
          Showing <b>{filtered.length}</b> of <b>{requests.length}</b> requests
          <span>
            Updated just now <ArrowUpRight size={13} />
          </span>
        </div>
      </section>
    </>
  );
}