import type { ReactNode } from "react";
import { X } from "lucide-react";
import type { RequestItem } from "../../types";
import { PriorityBadge, StatusBadge } from "./Badges";
import StatusTracker from "./StatusTracker";

export default function RequestDetail({
  request,
  onClose,
  children,
}: {
  request: RequestItem;
  onClose: () => void;
  children?: ReactNode;
}) {
  const meta: [string, ReactNode][] = [
    ["Category", request.category],
    ["Priority", <PriorityBadge priority={request.priority} />],
    ["Location", request.location],
    ["Reported by", request.requester],
    ["Date", request.date],
    ["Assigned to", request.assignee],
  ];
  return (
    <div
      className="dm-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="dm"
        role="dialog"
        aria-modal="true"
        aria-label={request.title}
      >
        <div className="dm-head">
          <div>
            <small>{request.id}</small>
            <h2>{request.title}</h2>
          </div>
          <StatusBadge status={request.status} />
          <button className="dm-close" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="dm-body">
          <StatusTracker status={request.status} />
          <dl className="dm-meta">
            {meta.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <h3>Description</h3>
          <p className="dm-desc">
            {request.description || "No description provided."}
          </p>
          {request.declineReason && (
            <div className="dm-decline">
              <b>Reason for decline:</b> {request.declineReason}
            </div>
          )}
          <h3>
            Photos{" "}
            {request.images.length > 0 && (
              <span>({request.images.length})</span>
            )}
          </h3>
          {request.images.length ? (
            <div className="gallery">
              {request.images.map((m) => (
                <a key={m.url} href={m.url} target="_blank" rel="noreferrer">
                  <img src={m.url} alt={m.name} />
                </a>
              ))}
            </div>
          ) : (
            <p className="dm-empty">No photos attached.</p>
          )}
          <h3>Video</h3>
          {request.video ? (
            <video
              className="dm-video"
              src={request.video.url}
              controls
              preload="metadata"
            />
          ) : (
            <p className="dm-empty">No video attached.</p>
          )}
        </div>
        {children && <div className="dm-foot">{children}</div>}
      </div>
    </div>
  );
}
