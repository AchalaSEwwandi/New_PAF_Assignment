import { useState, useEffect } from "react";
import api from "../../services/api";

export default function VerifyPass() {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Extract ID from URL query param: ?id=...
  const queryParams = new URLSearchParams(window.location.search);
  const bookingId = queryParams.get("id");

  useEffect(() => {
    if (!bookingId) {
      setError("No Booking ID provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .get(`/api/bookings/${bookingId}`)
      .then((data) => {
        setBooking(data);
      })
      .catch((err) => {
        setError(err.message || "Failed to load booking details.");
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#6a0dad]/5 p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#6a0dad]/20 border-t-[#6a0dad]"></div>
          <p className="text-sm font-medium text-[#6a0dad] animate-pulse">Verifying Pass...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-red-50 p-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-100 text-red-600 shadow-sm">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Pass</h1>
        <p className="text-gray-500 mb-8 max-w-xs mx-auto">{error}</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="rounded-xl bg-gray-900 px-8 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-95 shadow-lg"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const isApproved = booking?.status === "APPROVED";

  return (
    <div className={`min-h-screen flex flex-col items-center p-6 transition-colors duration-500 ${isApproved ? 'bg-[#6a0dad]/5' : 'bg-gray-50'}`}>
      
      {/* Decorative background accent */}
      <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-b from-[#6a0dad]/10 to-transparent pointer-events-none" />

      <div className="relative w-full max-w-md mt-12">
        {/* Pass Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-4 border border-gray-100">
            <div className="w-10 h-10 bg-[#6a0dad] rounded-xl flex items-center justify-center text-white font-bold">SC</div>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Official Campus Pass</h1>
          <p className="text-xs font-semibold text-[#6a0dad] uppercase tracking-widest mt-1">Status: {booking.status}</p>
        </div>

        {/* The Pass Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100 flex flex-col">
          
          {/* Status Header */}
          <div className={`py-6 flex flex-col items-center gap-2 ${isApproved ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-white'}`}>
            <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
              {isApproved ? (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <span className="text-lg font-bold tracking-wide">
              {isApproved ? 'VERIFIED PASS' : 'INVALID STATUS'}
            </span>
            <span className="text-[10px] font-medium opacity-80 uppercase tracking-tighter">
              {new Date().toLocaleString()}
            </span>
          </div>

          {/* Card Body */}
          <div className="p-8 space-y-6 relative">
            
            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
              <svg className="w-64 h-64" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>

            <div className="grid grid-cols-1 gap-6 relative z-10">
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">HOLDER</label>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold border border-gray-200">
                    {(booking.user?.fullName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900">{booking.user?.fullName || booking.user?.username}</p>
                    <p className="text-xs text-gray-500">{booking.user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">RESOURCE</label>
                  <p className="text-sm font-bold text-gray-800">{booking.resource?.name}</p>
                  <p className="text-[11px] text-gray-500">{booking.resource?.location}</p>
                </div>
                <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">BOOKING ID</label>
                <p className="text-xs font-mono font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 break-all">#{booking.id}</p>
              </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 text-gray-600">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">START TIME</label>
                  <div className="flex items-center gap-2">
                    <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-semibold">{new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <p className="text-[11px] font-medium text-gray-400 mt-0.5">{new Date(booking.startTime).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col gap-1 text-gray-600">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">END TIME</label>
                  <div className="flex items-center gap-2">
                    <svg className="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-semibold">{new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <p className="text-[11px] font-medium text-gray-400 mt-0.5">{new Date(booking.endTime).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Dotted separator line */}
            <div className="flex items-center gap-1 py-2">
              <div className="h-px flex-1 border-t border-dashed border-gray-300" />
              <div className="h-4 w-4 rounded-full bg-gray-50 border border-gray-100" />
              <div className="h-px flex-1 border-t border-dashed border-gray-300" />
            </div>

            {/* Bottom info */}
            <div className="text-center">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Validation Secure</p>
              <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-2xl">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[11px] font-bold text-gray-600">SMART CAMPUS AUTHENTICATED</span>
              </div>
            </div>

          </div>
        </div>

        {/* Back button */}
        <div className="mt-12 text-center">
          <button 
            onClick={() => window.location.href = '/'}
            className="text-sm font-semibold text-gray-400 hover:text-[#6a0dad] transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            ← Back to Application
          </button>
        </div>

      </div>
    </div>
  );
}
