import { useState, useEffect } from "react";
import api from "../../services/api";

//Convert date + time to ISO format (for backend)
function toLocalDateTime(date, time) {
  return `${date}T${time}:00`;
}

export default function BookResource({ resourceId, onBack, onSuccess }) {

  const handleBack = () => {
    if (onBack) return onBack();

    // Check where user came from
    const returnTo = sessionStorage.getItem("bookingReturnTo");
    sessionStorage.removeItem("bookingReturnTo");
    if (returnTo === "student") {
      window.location.href = "/student";
    } else {
      window.history.back();
    }
  };

  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState("");

  const [form, setForm] = useState({
    resourceId: resourceId || "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    api
      .get("/api/resources")
      .then((data) => setResources(data || []))
      .catch(() => setResourcesError("Failed to load resources. Please refresh."))
      .finally(() => setResourcesLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSuccessMsg("");
    setErrorMsg("");
  };

  const validate = () => {
    const errors = {};
    if (!form.resourceId)       errors.resourceId        = "Please select a resource.";
    if (!form.date)             errors.date              = "Please pick a date.";
    if (!form.startTime)        errors.startTime         = "Start time is required.";
    if (!form.endTime)          errors.endTime           = "End time is required.";
    if (!form.purpose.trim())   errors.purpose           = "Purpose is required.";
    if (!form.expectedAttendees || Number(form.expectedAttendees) < 1)
                                errors.expectedAttendees = "Enter a valid attendee count.";
    if (form.startTime && form.endTime && form.startTime >= form.endTime)
      errors.endTime = "End time must be after start time.";

    // Same-day past time slot check
    if (form.date && form.startTime) {
      const today = new Date().toISOString().split("T")[0];
      if (form.date === today) {
        const now = new Date();
        const [hh, mm] = form.startTime.split(":").map(Number);
        const slotStart = new Date();
        slotStart.setHours(hh, mm, 0, 0);
        if (slotStart <= now) {
          errors.startTime = "Cannot select a past time slot for today. Please choose a future time.";
        }
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    setSubmitting(true);
    try {
      const payload = {
        resourceId:        form.resourceId,
        startTime:         toLocalDateTime(form.date, form.startTime),
        endTime:           toLocalDateTime(form.date, form.endTime),
        purpose:           form.purpose.trim(),
        expectedAttendees: Number(form.expectedAttendees),
      };
      await api.post("/api/bookings", payload);
      setSuccessMsg("Booking submitted! It is now pending admin approval.");
      setForm({ resourceId: "", date: "", startTime: "", endTime: "", purpose: "", expectedAttendees: "" });
      setFieldErrors({});
      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }
    } catch (err) {
      setErrorMsg(
        err.message ||
        "An unexpected error occurred. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (field) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm text-gray-800 bg-white transition focus:outline-none focus:ring-2 focus:ring-[#6a0dad]/30 focus:border-[#6a0dad]
     ${fieldErrors[field] ? "border-red-400 bg-red-50" : "border-gray-200"}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="mb-5 flex items-center gap-2 text-sm text-gray-500 hover:text-[#6a0dad] transition-colors font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6a0dad] shadow-lg shadow-[#6a0dad]/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Book a Resource</h1>
              <p className="text-sm text-gray-500 mt-0.5">Reserve campus facilities for your session</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          {/* Resources loading / error */}
          {resourcesLoading && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-[#6a0dad]/5 border border-[#6a0dad]/20 px-4 py-3 text-sm text-[#6a0dad]">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Loading available resources…
            </div>
          )}
          {resourcesError && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {resourcesError}
            </div>
          )}

          {/* Success / Error banners */}
          {successMsg && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Resource dropdown */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Resource <span className="text-[#6a0dad]">*</span>
              </label>
              <select
                name="resourceId"
                value={form.resourceId}
                onChange={handleChange}
                disabled={resourcesLoading}
                className={`${inputCls("resourceId")} cursor-pointer`}
              >
                <option value="">— Select a resource —</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}{r.type ? ` (${r.type.replace("_", " ")})` : ""}
                  </option>
                ))}
              </select>
              {fieldErrors.resourceId && <p className="mt-1 text-xs text-red-500">{fieldErrors.resourceId}</p>}
            </div>

            {/* Date */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Date <span className="text-[#6a0dad]">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className={inputCls("date")}
              />
              {fieldErrors.date && <p className="mt-1 text-xs text-red-500">{fieldErrors.date}</p>}
            </div>

            {/* Time Slot */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Time Slot <span className="text-[#6a0dad]">*</span>
              </label>
              {/* Quick-select chips */}
              <div className="mb-3 flex flex-wrap gap-2">
                {[
                  { label: "8:00 – 10:00 AM",  start: "08:00", end: "10:00" },
                  { label: "10:00 – 12:00 PM", start: "10:00", end: "12:00" },
                  { label: "12:00 – 2:00 PM",  start: "12:00", end: "14:00" },
                  { label: "2:00 – 4:00 PM",   start: "14:00", end: "16:00" },
                  { label: "4:00 – 6:00 PM",   start: "16:00", end: "18:00" },
                  { label: "6:00 – 8:00 PM",   start: "18:00", end: "20:00" },
                ].map((slot) => {
                  const isActive = form.startTime === slot.start && form.endTime === slot.end;
                  return (
                    <button
                      key={slot.label}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, startTime: slot.start, endTime: slot.end }));
                        setFieldErrors((prev) => ({ ...prev, startTime: "", endTime: "" }));
                      }}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all
                        ${isActive
                          ? "border-[#6a0dad] bg-[#6a0dad] text-white shadow-sm shadow-[#6a0dad]/30"
                          : "border-gray-200 bg-white text-gray-600 hover:border-[#6a0dad] hover:text-[#6a0dad]"
                        }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>

              {/* Manual override */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Custom Start</label>
                  <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className={inputCls("startTime")} />
                  {fieldErrors.startTime && <p className="mt-1 text-xs text-red-500">{fieldErrors.startTime}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Custom End</label>
                  <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className={inputCls("endTime")} />
                  {fieldErrors.endTime && <p className="mt-1 text-xs text-red-500">{fieldErrors.endTime}</p>}
                </div>
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Purpose <span className="text-[#6a0dad]">*</span>
              </label>
              <textarea
                name="purpose"
                rows={3}
                value={form.purpose}
                onChange={handleChange}
                placeholder="e.g. Weekly team meeting, Lab session…"
                className={`${inputCls("purpose")} resize-none`}
              />
              {fieldErrors.purpose && <p className="mt-1 text-xs text-red-500">{fieldErrors.purpose}</p>}
            </div>

            {/* Expected attendees */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Expected Attendees <span className="text-[#6a0dad]">*</span>
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
              {fieldErrors.expectedAttendees && <p className="mt-1 text-xs text-red-500">{fieldErrors.expectedAttendees}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || resourcesLoading}
              className="w-full rounded-xl bg-[#6a0dad] py-3 text-sm font-bold text-white shadow-lg shadow-[#6a0dad]/20 transition-all duration-200 hover:bg-[#5a0b9d] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 mt-2"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Submitting…
                </span>
              ) : "Request Booking"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Bookings require admin approval before they are confirmed.
        </p>
      </div>
    </div>
  );
}
