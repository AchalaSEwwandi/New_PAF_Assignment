import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8082";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Format an ISO LocalDateTime string to a readable date. */
function fmtDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString(undefined, {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });
}

/** Format an ISO LocalDateTime string to HH:mm. */
function fmtTime(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleTimeString(undefined, {
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Status badge config ────────────────────────────────────────────────────
const STATUS_STYLES = {
  PENDING:   { pill: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",  dot: "bg-yellow-400"  },
  APPROVED:  { pill: "bg-green-500/20  text-green-300  border-green-500/30",   dot: "bg-green-400"   },
  REJECTED:  { pill: "bg-red-500/20    text-red-300    border-red-500/30",     dot: "bg-red-400"     },
  CANCELLED: { pill: "bg-slate-500/20  text-slate-400  border-slate-500/30",   dot: "bg-slate-400"   },
  COMPLETED: { pill: "bg-blue-500/20   text-blue-300   border-blue-500/30",    dot: "bg-blue-400"    },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function MyBookings() {
  const [bookings, setBookings]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState("");
  const [cancelling, setCancelling]   = useState(null);   // bookingId being cancelled
  const [cancelError, setCancelError] = useState("");

  const fetchBookings = useCallback(() => {
    setLoading(true);
    setFetchError("");
    const token = localStorage.getItem("token");
    axios
      .get(`${API_BASE}/api/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBookings(res.data))
      .catch((err) => {
        setFetchError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load bookings. Please try again."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleCancel = async (booking) => {
    const confirmed = window.confirm(
      `Cancel booking for "${booking.resource?.name ?? "this resource"}" on ${fmtDate(booking.startTime)}?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    setCancelling(booking.id);
    setCancelError("");
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/api/bookings/${booking.id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Optimistically update status in-place
      setBookings((prev) =>
        prev.map((b) => b.id === booking.id ? { ...b, status: "CANCELLED" } : b)
      );
    } catch (err) {
      setCancelError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to cancel booking."
      );
    } finally {
      setCancelling(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-4 py-12">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">My Bookings</h1>
            <p className="mt-1 text-sm text-slate-400">Track and manage your resource reservations</p>
          </div>
          <button
            onClick={fetchBookings}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5
                       px-4 py-2 text-sm text-slate-300 backdrop-blur-sm transition
                       hover:bg-white/10 hover:text-white active:scale-95"
          >
            {/* refresh icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0
                       0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Cancel error banner */}
        {cancelError && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30
                          bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {cancelError}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <svg className="h-10 w-10 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-sm text-slate-400">Loading your bookings…</p>
          </div>
        )}

        {/* ── Fetch error ── */}
        {!loading && fetchError && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-10 text-center">
            <p className="text-red-400">{fetchError}</p>
            <button onClick={fetchBookings}
                    className="mt-4 rounded-xl bg-red-600 px-6 py-2 text-sm font-semibold
                               text-white hover:bg-red-500 transition">
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !fetchError && bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border
                          border-white/10 bg-white/5 py-24 text-center backdrop-blur-sm">
            {/* calendar icon */}
            <svg xmlns="http://www.w3.org/2000/svg"
                 className="mb-4 h-14 w-14 text-slate-600" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2
                       0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-semibold text-slate-400">No bookings yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Head to <span className="text-indigo-400">Book a Resource</span> to make your first reservation.
            </p>
          </div>
        )}

        {/* ── Booking cards ── */}
        {!loading && !fetchError && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const canCancel = ["PENDING", "APPROVED"].includes(booking.status);
              const isCancelling = cancelling === booking.id;

              return (
                <div
                  key={booking.id}
                  className="group relative rounded-2xl border border-white/10 bg-white/5
                             p-6 backdrop-blur-sm transition hover:border-indigo-500/30
                             hover:bg-white/8 hover:shadow-xl hover:shadow-indigo-500/5"
                >
                  {/* Top row: resource name + status */}
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-white leading-tight">
                        {booking.resource?.name ?? "Unknown Resource"}
                      </h2>
                      {booking.resource?.location && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                          {/* pin icon */}
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"
                               stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827
                                     0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {booking.resource.location}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  {/* Detail grid */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-slate-300">
                      <svg className="h-4 w-4 shrink-0 text-slate-500" fill="none"
                           viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2
                                 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{fmtDate(booking.startTime)}</span>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-2 text-slate-300">
                      <svg className="h-4 w-4 shrink-0 text-slate-500" fill="none"
                           viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{fmtTime(booking.startTime)} – {fmtTime(booking.endTime)}</span>
                    </div>

                    {/* Purpose */}
                    <div className="flex items-start gap-2 text-slate-300 sm:col-span-1">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" fill="none"
                           viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0
                                 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828
                                 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="line-clamp-2">{booking.purpose ?? "—"}</span>
                    </div>
                  </div>

                  {/* Rejection reason (if any) */}
                  {booking.status === "REJECTED" && booking.rejectionReason && (
                    <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10
                                    px-3 py-2 text-xs text-red-400">
                      <span className="font-semibold">Reason: </span>
                      {booking.rejectionReason}
                    </div>
                  )}

                  {/* Cancel button */}
                  {canCancel && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleCancel(booking)}
                        disabled={isCancelling}
                        className="flex items-center gap-2 rounded-xl border border-red-500/30
                                   bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-400
                                   transition hover:bg-red-500/20 hover:text-red-300
                                   active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isCancelling ? (
                          <>
                            <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10"
                                      stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                            Cancelling…
                          </>
                        ) : (
                          <>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel Booking
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary footer */}
        {!loading && !fetchError && bookings.length > 0 && (
          <p className="mt-6 text-center text-xs text-slate-500">
            Showing {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
