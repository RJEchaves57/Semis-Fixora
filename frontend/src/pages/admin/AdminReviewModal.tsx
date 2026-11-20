import { useState } from "react";
import { Check, UserPlus, X } from "lucide-react";

import RequestDetail from "../../components/RequestDetail";
import { useRequests } from "../../context/RequestsContext";

export default function AdminReviewModal({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { requests, staff, loading, approve, decline, assign } = useRequests();

  const request = requests.find((item) => item.id === id);

  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState("");
  const [staffId, setStaffId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!request) return null;

  const suggested = staff.find(
    (member) =>
      member.specialty &&
      request.category.toLowerCase().includes(member.specialty.toLowerCase()),
  );

  const chosen = staffId || request.assigneeId || suggested?.id || "";

  const handleApprove = async () => {
    setBusy(true);
    setError("");

    try {
      await approve(request.id);

      if (staffId) {
        await assign(request.id, staffId);
      }

      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to approve this request.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDecline = async () => {
    if (!reason.trim()) return;

    setBusy(true);
    setError("");

    try {
      await decline(request.id, reason.trim());
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to decline this request.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleAssign = async () => {
    if (!chosen) return;

    setBusy(true);
    setError("");

    try {
      await assign(request.id, chosen);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to assign this request.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <RequestDetail request={request} onClose={onClose}>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {request.status === "Pending" && !declining && (
        <>
          <button
            className="btn btn-danger"
            disabled={busy}
            onClick={() => setDeclining(true)}
          >
            <X size={15} /> Decline
          </button>

          <div className="grow">
            <select
              value={staffId}
              onChange={(event) => setStaffId(event.target.value)}
              disabled={busy || loading}
              aria-label="Assign to maintenance team member (optional)"
            >
              <option value="">Assign to… (optional)</option>

              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                  {member.specialty ? ` · ${member.specialty}` : ""}
                </option>
              ))}
            </select>

            {loading && <small>Loading maintenance staff...</small>}

            {!loading && staff.length === 0 && (
              <small>No maintenance staff accounts were found.</small>
            )}
          </div>

          <button
            className="btn btn-success"
            disabled={busy || loading}
            onClick={handleApprove}
          >
            <Check size={15} />
            {busy
              ? "Processing..."
              : staffId
                ? "Approve & assign"
                : "Approve request"}
          </button>
        </>
      )}

      {request.status === "Pending" && declining && (
        <>
          <div className="grow">
            <textarea
              rows={2}
              autoFocus
              placeholder="Reason for declining (required)"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={busy}
            />
          </div>

          <button
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => setDeclining(false)}
          >
            Back
          </button>

          <button
            className="btn btn-danger"
            disabled={busy || !reason.trim()}
            onClick={handleDecline}
          >
            {busy ? "Processing..." : "Confirm decline"}
          </button>
        </>
      )}

      {(request.status === "Approved" || request.status === "Assigned") && (
        <>
          <div className="grow">
            <select
              value={chosen}
              onChange={(event) => setStaffId(event.target.value)}
              disabled={busy || loading}
              aria-label="Assign to maintenance team member"
            >
              <option value="">Select maintenance team member…</option>

              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                  {member.specialty ? ` · ${member.specialty}` : ""}
                </option>
              ))}
            </select>

            {loading && <small>Loading maintenance staff...</small>}

            {!loading && staff.length === 0 && (
              <small>No maintenance staff accounts were found.</small>
            )}
          </div>

          <button
            className="btn btn-primary"
            disabled={
              busy || loading || !chosen || chosen === request.assigneeId
            }
            onClick={handleAssign}
          >
            <UserPlus size={15} />
            {busy
              ? "Assigning..."
              : request.status === "Assigned"
                ? "Reassign"
                : "Assign task"}
          </button>
        </>
      )}

      {["In Progress", "Resolved", "Declined"].includes(request.status) && (
        <button className="btn btn-ghost" onClick={onClose}>
          Close
        </button>
      )}
    </RequestDetail>
  );
}
