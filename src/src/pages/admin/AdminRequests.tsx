import { useMemo, useState } from "react";
import { Download, Eye, Search } from "lucide-react";
import { useRequests } from "../../context/RequestsContext";
import { categories } from "../../data/constants";
import { PriorityBadge, StatusBadge } from "../../components/Badges";
import type { Status } from "../../../types";
import AdminReviewModal from "./AdminReviewModal";

const statuses: Status[] = [
  "Pending",
  "Approved",
  "Declined",
  "Assigned",
  "In Progress",
  "Resolved",
];

export default function AdminRequests() {
  const { requests } = useRequests();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [category, setCategory] = useState("All categories");
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      requests.filter((r) => {
        const text =
          `${r.id} ${r.title} ${r.location} ${r.requester} ${r.category}`.toLowerCase();
        return (
          text.includes(query.toLowerCase()) &&
          (status === "All statuses" || r.status === status) &&
          (category === "All categories" || r.category === category)
        );
      }),
    [requests, query, status, category],
  );

  const exportCSV = () => {
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const head = [
      "ID",
      "Title",
      "Category",
      "Location",
      "Requester",
      "Date",
      "Priority",
      "Status",
      "Assignee",
      "Photos",
      "Video",
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
        r.images.length,
        r.video ? "Yes" : "No",
      ]
        .map(esc)
        .join(","),
    );
    const url = URL.createObjectURL(
      new Blob([[head.join(","), ...rows].join("\n")], {
        type: "text/csv;charset=utf-8;",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "fixora-requests.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" /> ADMIN / REQUESTS
          </div>
          <h1>Maintenance requests</h1>
          <p>
            Approve or decline reports and assign approved ones to the
            maintenance team.
          </p>
        </div>
      </div>

      <div className="request-kpis">
        <div>
          <span>All requests</span>
          <b>{requests.length}</b>
        </div>
        <div>
          <span>Awaiting approval</span>
          <b>{requests.filter((r) => r.status === "Pending").length}</b>
        </div>
        <div>
          <span>Active work</span>
          <b>
            {
              requests.filter(
                (r) => r.status === "Assigned" || r.status === "In Progress",
              ).length
            }
          </b>
        </div>
        <div>
          <span>Resolved</span>
          <b>{requests.filter((r) => r.status === "Resolved").length}</b>
        </div>
      </div>

      <section className="panel full-requests">
        <div className="list-toolbar">
          <div>
            <h2>
              All requests <span className="count-pill">{filtered.length}</span>
            </h2>
            <p>Open a request to review its photos and video.</p>
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
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
            >
              <option>All categories</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter by status"
            >
              <option>All statuses</option>
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
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
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="request-cell">
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
                    <PriorityBadge priority={r.priority} />
                  </td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td>
                    <span className="assignee-text">{r.assignee}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setOpen(r.id)}
                    >
                      <Eye size={13} />{" "}
                      {r.status === "Pending"
                        ? "Review"
                        : r.status === "Approved"
                          ? "Assign"
                          : "View"}
                    </button>
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
        </div>
      </section>
      {open && <AdminReviewModal id={open} onClose={() => setOpen(null)} />}
    </>
  );
}
