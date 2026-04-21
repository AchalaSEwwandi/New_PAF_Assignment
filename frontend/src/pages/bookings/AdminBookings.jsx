import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";

const STATUSES = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED"];

function fmtDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
function fmtTime(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

const STATUS_STYLES = {
  PENDING:   "bg-yellow-100 text-yellow-700 border border-yellow-200",
  APPROVED:  "bg-green-100  text-green-700  border border-green-200",
  REJECTED:  "bg-red-100    text-red-600    border border-red-200",
  CANCELLED: "bg-gray-100   text-gray-500   border border-gray-200",
  COMPLETED: "bg-blue-100   text-blue-600   border border-blue-200",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] ?? ""}`}>
      {status}
    </span>
  );
}

function RejectModal({ booking, onConfirm, onClose, submitting }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <h3 className="mb-1 text-lg font-bold text-gray-900">Reject Booking</h3>
        <p className="mb-4 text-sm text-gray-500">
          Rejecting booking for{" "}
          <span className="font-semibold text-gray-800">{booking.resource?.name ?? "Unknown Resource"}</span>{" "}
          by{" "}
          <span className="font-semibold text-gray-800">
            {booking.user?.fullName ?? booking.user?.username ?? "Unknown User"}
          </span>.
        </p>

        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Provide a clear reason for rejection…"
          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20"
        />

        <div className="mt-5 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={submitting || !reason.trim()}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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

export default function AdminBookings() {
  const [bookings, setBookings]         = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState("");
  const [actionError, setActionError]   = useState("");
  const [approvingId, setApprovingId]   = useState(null);
  const [rejectModal, setRejectModal]   = useState(null);
  const [rejectingId, setRejectingId]   = useState(null);

  const [qrModal, setQrModal]         = useState(null);
  const [qrLoading, setQrLoading]     = useState(false);
  const [qrError, setQrError]         = useState("");

  const fetchBookings = useCallback(() => {
    setLoading(true);
    setFetchError("");
    setActionError("");
    const params = statusFilter !== "ALL" ? { status: statusFilter } : {};
    api
      .get("/api/bookings", { params })
      .then((data) => setBookings(data || []))
      .catch((err) => {
        setFetchError(
          err.message ||
          "Failed to load bookings."
        );
      })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleApprove = async (id) => {
    setApprovingId(id);
    setActionError("");
    try {
      await api.put(`/api/bookings/${id}/approve`, {});
      fetchBookings();
    } catch (err) {
      setActionError(err.message || "Failed to approve booking.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectModal) return;
    setRejectingId(rejectModal.id);
    setActionError("");
    try {
      await api.put(`/api/bookings/${rejectModal.id}/reject`, { reason });
      setRejectModal(null);
      fetchBookings();
    } catch (err) {
      setActionError(err.message || "Failed to reject booking.");
      setRejectModal(null);
    } finally {
      setRejectingId(null);
    }
  };

  const showQRCode = async (booking) => {
    setQrModal(booking);
    setQrLoading(true);
    setQrError("");
    try {
      const data = await api.get(`/api/bookings/${booking.id}/qr`);
      setQrModal({ ...booking, qrCodeBase64: data.qrCode });
    } catch (err) {
      setQrError("Failed to load QR code. It may not be available yet.");
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      {rejectModal && (
        <RejectModal
          booking={rejectModal}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectModal(null)}
          submitting={!!rejectingId}
        />
      )}

      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Passed</h3>
            <p className="text-sm text-gray-500 mb-6">
              Present this QR code for verification at the facility.
            </p>

            <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 mb-6">
              {qrLoading ? (
                <svg className="h-8 w-8 animate-spin text-[#6a0dad]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : qrError ? (
                <p className="text-xs text-red-500 px-4">{qrError}</p>
              ) : qrModal.qrCodeBase64 ? (
                <img src={qrModal.qrCodeBase64} alt="QR Code" className="h-56 w-56 object-contain" />
              ) : null}
            </div>

            <div className="text-left text-sm text-gray-600 space-y-1 mb-8 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p><span className="font-semibold">Resource:</span> {qrModal.resource?.name}</p>
              <p><span className="font-semibold">Date:</span> {fmtDate(qrModal.startTime)}</p>
              <p><span className="font-semibold">Time:</span> {fmtTime(qrModal.startTime)} – {fmtTime(qrModal.endTime)}</p>
            </div>

            <button
              onClick={() => {
                setQrModal(null);
                setQrError("");
              }}
              className="w-full rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Bookings</h1>
            <p className="mt-1 text-sm text-gray-500">Review, approve or reject resource booking requests</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6a0dad]/30 cursor-pointer"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={fetchBookings}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Action error */}
        {actionError && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {actionError}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <svg className="h-10 w-10 animate-spin text-[#6a0dad]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-sm text-gray-400">Loading bookings…</p>
          </div>
        )}

        {/* Fetch error */}
        {!loading && fetchError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
            <p className="text-red-600">{fetchError}</p>
            <button onClick={fetchBookings}
                    className="mt-4 rounded-xl bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-500 transition">
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !fetchError && bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-28 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6a0dad]/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#6a0dad]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-700">No bookings found</p>
            <p className="mt-1 text-sm text-gray-400">
              {statusFilter !== "ALL" ? `No bookings with status "${statusFilter}".` : "There are no booking requests yet."}
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && !fetchError && bookings.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Student", "Resource", "Location", "Date", "Time", "Purpose", "Pax", "Status", "Actions"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((b) => {
                    const isPending   = b.status === "PENDING";
                    const isApproving = approvingId === b.id;
                    const isRejecting = rejectingId === b.id;

                    return (
                      <tr key={b.id} className="transition hover:bg-gray-50/80">
                        {/* Student */}
                        <td className="px-4 py-3.5 text-gray-900 font-semibold whitespace-nowrap">
                          {b.user?.fullName ?? b.user?.username ?? "—"}
                          {b.user?.email && (
                            <p className="text-xs text-gray-400 font-normal mt-0.5">{b.user.email}</p>
                          )}
                        </td>
                        {/* Resource */}
                        <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">{b.resource?.name ?? "—"}</td>
                        {/* Location */}
                        <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{b.resource?.location ?? "—"}</td>
                        {/* Date */}
                        <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">{fmtDate(b.startTime)}</td>
                        {/* Time */}
                        <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">{fmtTime(b.startTime)} – {fmtTime(b.endTime)}</td>
                        {/* Purpose */}
                        <td className="px-4 py-3.5 text-gray-500 max-w-[180px]">
                          <span className="line-clamp-2">{b.purpose ?? "—"}</span>
                        </td>
                        {/* Attendees */}
                        <td className="px-4 py-3.5 text-gray-700 text-center whitespace-nowrap">{b.expectedAttendees ?? "—"}</td>
                        {/* Status */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <StatusBadge status={b.status} />
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {isPending ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApprove(b.id)}
                                disabled={isApproving || isRejecting}
                                className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isApproving ? (
                                  <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                  </svg>
                                ) : (
                                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                  </svg>
                                )}
                                {isApproving ? "…" : "Approve"}
                              </button>
                              <button
                                onClick={() => setRejectModal(b)}
                                disabled={isApproving || isRejecting}
                                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                                Reject
                              </button>
                            </div>
                          ) : b.status === "APPROVED" ? (
                            <button
                              onClick={() => showQRCode(b)}
                              className="flex items-center gap-2 rounded-xl border border-[#6a0dad]/20 bg-[#6a0dad]/5 px-4 py-1.5 text-xs font-semibold text-[#6a0dad] transition hover:bg-[#6a0dad]/10 active:scale-95"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                              </svg>
                              View Pass
                            </button>
                          ) : (
                            <span className="text-xs text-gray-300 italic">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Table footer */}
            <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 text-xs text-gray-400">
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
              {statusFilter !== "ALL" && ` · filtered by ${statusFilter}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
