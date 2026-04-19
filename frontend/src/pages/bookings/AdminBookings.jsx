import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8082";
const STATUSES = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED"];

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
}
function fmtTime(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

// ── Status badge ───────────────────────────────────────────────────────────
const STATUS_STYLES = {
  PENDING:   "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  APPROVED:  "bg-green-500/20  text-green-300  border-green-500/30",
  REJECTED:  "bg-red-500/20    text-red-300    border-red-500/30",
  CANCELLED: "bg-slate-500/20  text-slate-400  border-slate-500/30",
  COMPLETED: "bg-blue-500/20   text-blue-300   border-blue-500/30",
};
function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] ?? ""}`}>
      {status}
    </span>
  );
}

// ── Reject modal ───────────────────────────────────────────────────────────
function RejectModal({ booking, onConfirm, onClose, submitting }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-slate-900 p-6 shadow-2xl">
        <h3 className="mb-1 text-lg font-bold text-white">Reject Booking</h3>
        <p className="mb-4 text-sm text-slate-400">
          Rejecting booking for{" "}
          <span className="font-medium text-white">
            {booking.resource?.name ?? "Unknown Resource"}
          </span>{" "}
          by{" "}
          <span className="font-medium text-white">
            {booking.user?.fullName ?? booking.user?.username ?? "Unknown User"}
          </span>.
        </p>

        <label className="mb-1.5 block text-sm font-medium text-slate-300">
          Reason <span className="text-red-400">*</span>
        </label>
        <textarea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Provide a clear reason for rejection…"
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5
                     text-sm text-white placeholder-slate-500 focus:border-red-500/50
                     focus:outline-none focus:ring-2 focus:ring-red-500/30"
        />

        <div className="mt-5 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm
                       text-slate-300 transition hover:bg-white/10 hover:text-white
                       disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={submitting || !reason.trim()}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm
                       font-semibold text-white transition hover:bg-red-500
                       active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Rejecting…
              </>
            ) : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function AdminBookings() {
  const [bookings, setBookings]       = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState("");
  const [actionError, setActionError] = useState("");

  // Per-row action state
  const [approvingId, setApprovingId]   = useState(null);
  const [rejectModal, setRejectModal]   = useState(null);   // booking object
  const [rejectingId, setRejectingId]   = useState(null);

  const fetchBookings = useCallback(() => {
    setLoading(true);
    setFetchError("");
    setActionError("");
    const token = localStorage.getItem("token");
    const params = statusFilter !== "ALL" ? { status: statusFilter } : {};
    axios
      .get(`${API_BASE}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      })
      .then((res) => setBookings(res.data))
      .catch((err) => {
        setFetchError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load bookings."
        );
      })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // ── Approve ──────────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    setApprovingId(id);
    setActionError("");
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE}/api/bookings/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBookings();
    } catch (err) {
      setActionError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to approve booking."
      );
    } finally {
      setApprovingId(null);
    }
  };

  // ── Reject ───────────────────────────────────────────────────────────────
  const handleRejectConfirm = async (reason) => {
    if (!rejectModal) return;
    setRejectingId(rejectModal.id);
    setActionError("");
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/api/bookings/${rejectModal.id}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRejectModal(null);
      fetchBookings();
    } catch (err) {
      setActionError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to reject booking."
      );
      setRejectModal(null);
    } finally {
      setRejectingId(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-4 py-10">
      {rejectModal && (
        <RejectModal
          booking={rejectModal}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectModal(null)}
          submitting={!!rejectingId}
        />
      )}

      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Manage Bookings</h1>
            <p className="mt-1 text-sm text-slate-400">Review, approve or reject resource booking requests</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm
                         text-white backdrop-blur-sm focus:outline-none focus:ring-2
                         focus:ring-indigo-500 cursor-pointer"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s} className="bg-slate-800">{s}</option>
              ))}
            </select>
            {/* Refresh */}
            <button
              onClick={fetchBookings}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5
                         px-4 py-2 text-sm text-slate-300 backdrop-blur-sm transition
                         hover:bg-white/10 hover:text-white active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0
                         0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Action error banner */}
        {actionError && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30
                          bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {actionError}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <svg className="h-10 w-10 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-sm text-slate-400">Loading bookings…</p>
          </div>
        )}

        {/* Fetch error */}
        {!loading && fetchError && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-12 text-center">
            <p className="text-red-400">{fetchError}</p>
            <button onClick={fetchBookings}
                    className="mt-4 rounded-xl bg-red-600 px-6 py-2 text-sm font-semibold
                               text-white hover:bg-red-500 transition">
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !fetchError && bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border
                          border-white/10 bg-white/5 py-28 text-center backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg"
                 className="mb-4 h-14 w-14 text-slate-600" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2
                       0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0
                       002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg font-semibold text-slate-400">No bookings found</p>
            <p className="mt-1 text-sm text-slate-500">
              {statusFilter !== "ALL"
                ? `No bookings with status "${statusFilter}".`
                : "There are no booking requests yet."}
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && !fetchError && bookings.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    {["Student","Resource","Location","Date","Time","Purpose","Pax","Status","Actions"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookings.map((b) => {
                    const isPending    = b.status === "PENDING";
                    const isApproving  = approvingId === b.id;
                    const isRejecting  = rejectingId === b.id;

                    return (
                      <tr key={b.id}
                          className="transition hover:bg-white/5">
                        {/* Student */}
                        <td className="px-4 py-3.5 text-white font-medium whitespace-nowrap">
                          {b.user?.fullName ?? b.user?.username ?? "—"}
                          {b.user?.email && (
                            <p className="text-xs text-slate-500 font-normal mt-0.5">{b.user.email}</p>
                          )}
                        </td>
                        {/* Resource */}
                        <td className="px-4 py-3.5 text-slate-300 whitespace-nowrap">
                          {b.resource?.name ?? "—"}
                        </td>
                        {/* Location */}
                        <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">
                          {b.resource?.location ?? "—"}
                        </td>
                        {/* Date */}
                        <td className="px-4 py-3.5 text-slate-300 whitespace-nowrap">
                          {fmtDate(b.startTime)}
                        </td>
                        {/* Time */}
                        <td className="px-4 py-3.5 text-slate-300 whitespace-nowrap">
                          {fmtTime(b.startTime)} – {fmtTime(b.endTime)}
                        </td>
                        {/* Purpose */}
                        <td className="px-4 py-3.5 text-slate-400 max-w-[180px]">
                          <span className="line-clamp-2">{b.purpose ?? "—"}</span>
                        </td>
                        {/* Attendees */}
                        <td className="px-4 py-3.5 text-slate-300 text-center whitespace-nowrap">
                          {b.expectedAttendees ?? "—"}
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <StatusBadge status={b.status} />
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {isPending ? (
                            <div className="flex items-center gap-2">
                              {/* Approve */}
                              <button
                                onClick={() => handleApprove(b.id)}
                                disabled={isApproving || isRejecting}
                                className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5
                                           text-xs font-semibold text-white transition hover:bg-green-500
                                           active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isApproving ? (
                                  <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                  </svg>
                                ) : (
                                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24"
                                       stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                  </svg>
                                )}
                                {isApproving ? "…" : "Approve"}
                              </button>
                              {/* Reject */}
                              <button
                                onClick={() => setRejectModal(b)}
                                disabled={isApproving || isRejecting}
                                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5
                                           text-xs font-semibold text-white transition hover:bg-red-500
                                           active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-600 italic">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="border-t border-white/10 px-5 py-3 text-xs text-slate-500">
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
              {statusFilter !== "ALL" && ` · filtered by ${statusFilter}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
