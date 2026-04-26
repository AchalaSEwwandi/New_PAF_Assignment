import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";

//Format date
function fmtDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString(undefined, {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });
}
//Format time
function fmtTime(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

//Styles for different booking statuses
const STATUS_STYLES = {
  PENDING:   { pill: "bg-yellow-100 text-yellow-700 border-yellow-200",  dot: "bg-yellow-400"  },
  APPROVED:  { pill: "bg-green-100  text-green-700  border-green-200",   dot: "bg-green-500"   },
  REJECTED:  { pill: "bg-red-100    text-red-600    border-red-200",     dot: "bg-red-500"     },
  CANCELLED: { pill: "bg-gray-100   text-gray-500   border-gray-200",    dot: "bg-gray-400"    },
  COMPLETED: { pill: "bg-blue-100   text-blue-600   border-blue-200",    dot: "bg-blue-500"    },
};

//Component to display status badge
function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

export default function MyBookings() {
  const [bookings, setBookings]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState("");
  const [cancelling, setCancelling]   = useState(null);
  const [cancelError, setCancelError] = useState("");

  const [qrModal, setQrModal]         = useState(null);
  const [qrLoading, setQrLoading]     = useState(false);
  const [qrError, setQrError]         = useState("");

  //Fetch bbokings from backend API
  const fetchBookings = useCallback(() => {
    setLoading(true);
    setFetchError("");
    api
      .get("/api/bookings/my")
      .then((data) => setBookings(data || []))
      .catch((err) => {
        setFetchError(
          err.message ||
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
      await api.put(`/api/bookings/${booking.id}/cancel`, {});
      setBookings((prev) =>
        prev.map((b) => b.id === booking.id ? { ...b, status: "CANCELLED" } : b)
      );
    } catch (err) {
      setCancelError(
        err.message ||
        "Failed to cancel booking."
      );
    } finally {
      setCancelling(null);
    }
  };

  //show QR code for approved booking
  const showQRCode = async (booking) => {
    setQrModal(booking);
    setQrLoading(true);
    setQrError("");
    try {
      //Fetch QR code from backend
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

      {/* QR Code Modal */}
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

      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Bookings</h1>
            <p className="mt-1 text-sm text-gray-500">Track and manage your resource reservations</p>
          </div>
          <button
            onClick={fetchBookings}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Cancel error */}
        {cancelError && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {cancelError}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <svg className="h-10 w-10 animate-spin text-[#6a0dad]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-sm text-gray-400">Loading your bookings…</p>
          </div>
        )}

        {/* Fetch error */}
        {!loading && fetchError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
            <p className="text-red-600">{fetchError}</p>
            <button onClick={fetchBookings}
                    className="mt-4 rounded-xl bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-500 transition">
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !fetchError && bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6a0dad]/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#6a0dad]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-700">No bookings yet</p>
            <p className="mt-1 text-sm text-gray-400">
              Head to <span className="font-medium text-[#6a0dad]">Facilities</span> to make your first reservation.
            </p>
          </div>
        )}

        {/* Booking cards */}
        {!loading && !fetchError && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const canCancel = ["PENDING", "APPROVED"].includes(booking.status);
              const isCancelling = cancelling === booking.id;

              return (
                <div
                  key={booking.id}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-[#6a0dad]/30"
                >
                  {/* Top row */}
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-base font-bold text-gray-900 leading-tight">
                        {booking.resource?.name ?? "Unknown Resource"}
                      </h2>
                      {booking.resource?.location && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {booking.resource.location}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  {/* Detail grid */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{fmtDate(booking.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{fmtTime(booking.startTime)} – {fmtTime(booking.endTime)}</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="line-clamp-2">{booking.purpose ?? "—"}</span>
                    </div>
                  </div>

                  {/* Rejection reason */}
                  {booking.status === "REJECTED" && booking.rejectionReason && (
                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                      <span className="font-semibold">Reason: </span>{booking.rejectionReason}
                    </div>
                  )}

                  {/* Actions wrapper */}
                  <div className="mt-4 flex flex-wrap justify-end gap-3">
                    {/* View pass button */}
                    {booking.status === "APPROVED" && (
                      <button
                        onClick={() => showQRCode(booking)}
                        className="flex items-center gap-2 rounded-xl border border-[#6a0dad]/20 bg-[#6a0dad]/5 px-4 py-1.5 text-xs font-semibold text-[#6a0dad] transition hover:bg-[#6a0dad]/10 active:scale-95"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        View Pass
                      </button>
                    )}

                    {/* Cancel button */}
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(booking)}
                        disabled={isCancelling}
                        className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isCancelling ? (
                          <>
                            <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                            Cancelling…
                          </>
                        ) : (
                          <>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel Booking
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer count */}
        {!loading && !fetchError && bookings.length > 0 && (
          <p className="mt-6 text-center text-xs text-gray-400">
            Showing {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
