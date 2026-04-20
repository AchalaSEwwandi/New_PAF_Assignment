import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8082";

// Combines a date string (YYYY-MM-DD) and time string (HH:mm) into
// the ISO-8601 LocalDateTime format Spring Boot expects: "YYYY-MM-DDTHH:mm:ss"
function toLocalDateTime(date, time) {
  return `${date}T${time}:00`;
}

export default function BookResource() {
  const { id: urlResourceId } = useParams();   // pre-selected resource from URL
  const navigate = useNavigate();

  const [resources, setResources]           = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState("");

  const [form, setForm] = useState({
    resourceId:        urlResourceId || "",
    date:              "",
    startTime:         "",
    endTime:           "",
    purpose:           "",
    expectedAttendees: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg,   setErrorMsg]   = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Fetch available resources on mount ─────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API_BASE}/api/resources`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setResources(res.data))
      .catch(() => setResourcesError("Failed to load resources. Please refresh."))
      .finally(() => setResourcesLoading(false));
  }, []);

  // ── Generic change handler ─────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error when user starts editing
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSuccessMsg("");
    setErrorMsg("");
  };

  // ── Client-side validation ─────────────────────────────────────────────────
  const validate = () => {
    const errors = {};
    if (!form.resourceId)        errors.resourceId        = "Please select a resource.";
    if (!form.date)              errors.date              = "Please pick a date.";
    if (!form.startTime)         errors.startTime         = "Start time is required.";
    if (!form.endTime)           errors.endTime           = "End time is required.";
    if (!form.purpose.trim())    errors.purpose           = "Purpose is required.";
    if (!form.expectedAttendees || Number(form.expectedAttendees) < 1)
                                  errors.expectedAttendees = "Enter a valid attendee count.";

    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      errors.endTime = "End time must be after start time.";
    }
    return errors;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        resourceId:        form.resourceId,
        startTime:         toLocalDateTime(form.date, form.startTime),
        endTime:           toLocalDateTime(form.date, form.endTime),
        purpose:           form.purpose.trim(),
        expectedAttendees: Number(form.expectedAttendees),
      };

      await axios.post(`${API_BASE}/api/bookings`, payload, {
        headers: {
          Authorization:  `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setSuccessMsg("Booking submitted successfully! It is now pending approval.");
      setForm({
        resourceId: "", date: "", startTime: "", endTime: "",
        purpose: "", expectedAttendees: "",
      });
      setFieldErrors({});
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "An unexpected error occurred. Please try again.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Shared input class helper ───────────────────────────────────────────────
  const inputCls = (field) =>
    `w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white
     placeholder-slate-400 backdrop-blur-sm transition focus:outline-none
     focus:ring-2 focus:ring-indigo-500
     ${fieldErrors[field] ? "border-red-500" : "border-white/10"}`;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-2xl">

        {/* ── Header ── */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/resources")}
            className="mb-4 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Facilities
          </button>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/40">
              {/* calendar icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Book a Resource</h1>
            <p className="mt-1 text-sm text-slate-400">Reserve campus facilities for your session</p>
          </div>
        </div>

        {/* ── Card ── */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">

          {/* Resources loading / error */}
          {resourcesLoading && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-indigo-500/10 px-4 py-3 text-sm text-indigo-300">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Loading available resources…
            </div>
          )}
          {resourcesError && (
            <div className="mb-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/30">
              {resourcesError}
            </div>
          )}

          {/* ── Success / Error banners ── */}
          {successMsg && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* ── Resource dropdown ── */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Resource <span className="text-indigo-400">*</span>
              </label>
              <select
                name="resourceId"
                value={form.resourceId}
                onChange={handleChange}
                disabled={resourcesLoading}
                className={`${inputCls("resourceId")} cursor-pointer`}
              >
                <option value="" className="bg-slate-800">— Select a resource —</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-800">
                    {r.name}{r.type ? ` (${r.type})` : ""}
                  </option>
                ))}
              </select>
              {fieldErrors.resourceId && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.resourceId}</p>
              )}
            </div>

            {/* ── Date ── */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Date <span className="text-indigo-400">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className={inputCls("date")}
              />
              {fieldErrors.date && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.date}</p>
              )}
            </div>

            {/* ── Start / End time row ── */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Start Time <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  className={inputCls("startTime")}
                />
                {fieldErrors.startTime && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.startTime}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  End Time <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  className={inputCls("endTime")}
                />
                {fieldErrors.endTime && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.endTime}</p>
                )}
              </div>
            </div>

            {/* ── Purpose ── */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Purpose <span className="text-indigo-400">*</span>
              </label>
              <textarea
                name="purpose"
                rows={3}
                value={form.purpose}
                onChange={handleChange}
                placeholder="e.g. Weekly team meeting, Lab session…"
                className={`${inputCls("purpose")} resize-none`}
              />
              {fieldErrors.purpose && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.purpose}</p>
              )}
            </div>

            {/* ── Expected attendees ── */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Expected Attendees <span className="text-indigo-400">*</span>
              </label>
              <input
                type="number"
                name="expectedAttendees"
                value={form.expectedAttendees}
                onChange={handleChange}
                min={1}
                placeholder="e.g. 10"
                className={inputCls("expectedAttendees")}
              />
              {fieldErrors.expectedAttendees && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.expectedAttendees}</p>
              )}
            </div>

            {/* ── Submit button ── */}
            <button
              type="submit"
              disabled={submitting || resourcesLoading}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white
                         shadow-lg shadow-indigo-500/30 transition-all duration-200
                         hover:bg-indigo-500 hover:shadow-indigo-500/50
                         active:scale-[0.98]
                         disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Submitting…
                </span>
              ) : (
                "Request Booking"
              )}
            </button>
          </form>
        </div>

        {/* ── Footer note ── */}
        <p className="mt-4 text-center text-xs text-slate-500">
          Bookings require admin approval before they are confirmed.
        </p>
      </div>
    </div>
  );
}
