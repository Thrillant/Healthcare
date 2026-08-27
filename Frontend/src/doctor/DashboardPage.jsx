import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
    Calendar,
    CheckCircle,
    XCircle,
    Users,
    Phone,
    BadgeIndianRupee,
} from "lucide-react";
import { dashboardStyles as dbs } from "../assets/dummyStyles";

const API_BASE = import.meta.env.VITE_API_BASE;

// Parse datetime from date and time strings
function parseDateTime(date, time) {
    return new Date(`${date}T${time}:00`);
}

// Format time to AM/PM format
function formatTimeAMPM(time24) {
    if (!time24) return "";
    const [hh, mm] = time24.split(":");
    let h = parseInt(hh, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${mm} ${ampm}`;
}

// Format date string
function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

// Backend status to frontend status
function backendToFrontendStatus(s) {
    if (!s) return "pending";
    const v = String(s).toLowerCase();
    if (v === "pending") return "pending";
    if (v === "confirmed") return "confirmed";
    if (v === "completed") return "complete";
    if (v === "canceled" || v === "cancelled") return "cancelled";
    if (v === "rescheduled") return "rescheduled";
    return v;
}

// Frontend status to backend status
function frontendToBackendStatus(fs) {
    if (!fs) return "Pending";
    const v = String(fs).toLowerCase();
    if (v === "pending") return "Pending";
    if (v === "confirmed") return "Confirmed";
    if (v === "complete") return "Completed";
    if (v === "cancelled") return "Canceled";
    if (v === "rescheduled") return "Rescheduled";
    return fs;
}

// Convert 12-hour format to 24-hour format
function to24Hour(timeStr) {
    if (!timeStr) return "00:00";
    const m = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!m) return timeStr;
    let hh = Number(m[1]);
    const mm = m[2];
    const ampm = m[3];
    if (!ampm) {
        return `${String(hh).padStart(2, "0")}:${mm}`;
    }
    const up = ampm.toUpperCase();
    if (up === "AM") {
        if (hh === 12) hh = 0;
    } else {
        if (hh !== 12) hh += 12;
    }
    return `${String(hh).padStart(2, "0")}:${mm}`;
}

// Convert 24-hour format to 12-hour format
function to12HourFrom24(hhmm) {
    if (!hhmm) return "12:00 AM";
    const [hh, mm] = hhmm.split(":").map(Number);
    const ampm = hh >= 12 ? "PM" : "AM";
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${String(h12)}:${String(mm).padStart(2, "0")} ${ampm}`;
}

// Normalize appointment data
function normalizeAppointment(a) {
    if (!a) return null;
    const id = a._id || a.id || String(Math.random()).slice(2);
    const patient = a.patientName || a.patient || a.name || "Unknown";
    const age = a.age ?? a.patientAge ?? "";
    const gender = a.gender || "";
    const doctorName =
        (a.doctorId && typeof a.doctorId === "object" && a.doctorId.name) ||
        a.doctorName ||
        a.doctor ||
        "Doctor";

    const doctorImage =
        (a.doctorId && typeof a.doctorId === "object" && a.doctorId.imageUrl) ||
        a.doctorImage ||
        a.doctorImageUrl ||
        "";

    const speciality =
        (a.doctorId && (a.doctorId.specialization || a.doctorId.speciality)) ||
        a.speciality ||
        a.specialization ||
        "";
    const mobile = a.mobile || a.phone || "";
    const fee = Number(a.fees ?? a.fee ?? a.payment?.amount ?? 0) || 0;
    const date = a.date || (a.slot && a.slot.date) || "";
    const rawTime =
        a.time ||
        (a.slot && a.slot.time) ||
        (a.hour != null && a.minute != null
            ? `${String(a.hour).padStart(2, "0")}:${String(a.minute).padStart(
                2,
                "0",
            )}`
            : "");
    const time24 = to24Hour(rawTime);
    const status = backendToFrontendStatus(
        a.status || (a.payment && a.payment.status) || "Pending",
    );
    return {
        id,
        patient,
        age,
        gender,
        doctorName,
        doctorImage,
        speciality,
        mobile,
        date,
        time: time24,
        fee,
        status,
        raw: a,
    };
}

export default function DashboardPage({ apiBase }) {
    const params = useParams();
    const location = useLocation();

    const [doctorInfo, setDoctorInfo] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    location.search;
    const API = apiBase || API_BASE;

    const doctorId = params.id;

    // Fetch doctor info
    useEffect(() => {
        if (!doctorId) return;
        async function fetchDoctorInfo() {
            try {
                const res = await fetch(`${API}/api/doctors/${encodeURIComponent(doctorId)}`);
                if (res.ok) {
                    const json = await res.json();
                    const d = json.data || json || {};
                    setDoctorInfo(d);
                }
            } catch (err) {
                console.error("fetchDoctorInfo error:", err);
            }
        }
        fetchDoctorInfo();
    }, [API, doctorId]);

    // Fetch appointments from the backend
    async function fetchAppointments() {
        setLoading(true);
        setError(null);
        try {
            const basePath = `${API}/api/appointments/doctor/${encodeURIComponent(
                doctorId,
            )}`;
            const url = `${basePath}`;
            // console.log(url);

            const res = await fetch(url);

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(
                    body?.message || `Failed to fetch appointments (${res.status})`,
                );
            }
            const body = await res.json();
            const list = Array.isArray(body.appointments)
                ? body.appointments
                : Array.isArray(body)
                    ? body
                    : (body.items ?? body.data ?? []);

            const normalized = (Array.isArray(list) ? list : [])
                .map(normalizeAppointment)
                .filter(Boolean);

            setAppointments(normalized);
        } catch (err) {
            console.error("fetchAppointments:", err);
            setError(err.message || "Failed to load appointments");
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAppointments();
    }, [API, doctorId]);

    const sorted = useMemo(() => {
        return [...appointments].sort(
            (a, b) => parseDateTime(b.date, b.time) - parseDateTime(a.date, a.time),
        );
    }, [appointments]);

    const top8 = sorted.slice(0, 12);

    // Calculate stats
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(
        (a) => a.status === "complete",
    ).length;
    const cancelledAppointments = appointments.filter(
        (a) => a.status === "cancelled",
    ).length;
    const totalEarnings = appointments
        .filter((a) => a.status === "complete")
        .reduce((s, a) => s + (Number(a.fee) || 0), 0);

    // Update appointment status
    async function updateStatusRemote(id, newStatusFrontend) {
        const appt = appointments.find((p) => p.id === id);
        if (!appt) return;
        if (appt.status === "complete" || appt.status === "cancelled") return;

        const backendStatus = frontendToBackendStatus(newStatusFrontend);
        setAppointments((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: newStatusFrontend } : p)),
        );

        // Try to update status in backend
        try {
            const res = await fetch(`${API}/api/appointments/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: backendStatus }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(
                    body?.message || `Status update failed (${res.status})`,
                );
            }
            const data = await res.json();
            const updated = data.appointment || data;

            setAppointments((prev) =>
                prev.map((p) => {
                    if (p.id !== id) return p;

                    const mergedRaw = { ...(p.raw || {}), ...(updated || {}) };

                    const normalized = normalizeAppointment(mergedRaw);
                    if (normalized) return normalized;
                    return {
                        ...p,
                        status: backendToFrontendStatus(updated.status || backendStatus),
                        raw: mergedRaw,
                    };
                }),
            );
        } catch (err) {
            console.error("updateStatusRemote:", err);
            setAppointments((prev) =>
                prev.map((p) => (p.id === id ? { ...p, status: appt.status } : p)),
            );
            setError(err.message || "Failed to update status");
        }
    }

    // Reschedule appointment
    async function rescheduleRemote(id, newDate, newTime24) {
        const appt = appointments.find((p) => p.id === id);
        if (!appt) return;
        if (appt.status === "complete" || appt.status === "cancelled") return;

        const hhmm = newTime24;
        const time12 = to12HourFrom24(hhmm);
        setAppointments((prev) =>
            prev.map((p) =>
                p.id === id
                    ? { ...p, date: newDate, time: hhmm, status: "rescheduled" }
                    : p,
            ),
        );

        try {
            const res = await fetch(`${API}/api/appointments/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: newDate, time: time12 }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.message || `Reschedule failed (${res.status})`);
            }
            const data = await res.json();
            const updated = data.appointment || data;

            setAppointments((prev) =>
                prev.map((p) => {
                    if (p.id !== id) return p;
                    const mergedRaw = { ...(p.raw || {}), ...(updated || {}) };

                    const normalized = normalizeAppointment(mergedRaw);
                    if (normalized) return normalized;
                    return {
                        ...p,
                        date: newDate,
                        time: hhmm,
                        status: backendToFrontendStatus(updated.status || "Rescheduled"),
                        raw: mergedRaw,
                    };
                }),
            );
        } catch (err) {
            console.error("rescheduleRemote:", err);
            setError(err.message || "Failed to reschedule");
            await fetchAppointments();
        }
    }

    function updateStatus(id, newStatus) {
        updateStatusRemote(id, newStatus);
    }

    function updateDateTime(id, newDate, newTime) {
        rescheduleRemote(id, newDate, newTime);
    }

    const doctorDisplayName =
        doctorInfo?.name ||
        appointments[0]?.raw?.doctorId?.name ||
        appointments[0]?.raw?.doctorName ||
        "Doctor";

    return (
        <div className={dbs.pageContainer}>
            <div className={dbs.contentWrapper}>
                <div className={dbs.headerContainer}>
                    <div>
                        <h1 className={dbs.headerTitle}>
                            {`${doctorDisplayName} — Dashboard`}
                        </h1>
                        <p className={dbs.headerSubtitle}>
                            {`Showing appointments for ${doctorDisplayName}`}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={dbs.headerInfo}>
                            {loading ? "Loading..." : `${appointments.length} total`}
                        </div>
                        <button
                            onClick={() => fetchAppointments()}
                            className={dbs.refreshButton}
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stat cards */}
                <div className={dbs.statsGrid}>
                    <StatCard
                        title="Total Appointments"
                        value={totalAppointments}
                        icon={<Calendar className="w-5 h-5" />}
                        accentTop={dbs.accentTopEmerald}
                        accentBottom={dbs.accentBottomEmerald}
                    />

                    <StatCard
                        title="Total Earnings"
                        value={`₹ ${totalEarnings}`}
                        icon={<BadgeIndianRupee className="w-5 h-5" />}
                        accentTop={dbs.accentTopAmber}
                        accentBottom={dbs.accentBottomAmber}
                    />

                    <StatCard
                        title="Completed"
                        value={completedAppointments}
                        icon={<CheckCircle className="w-5 h-5" />}
                        accentTop={dbs.accentTopEmeraldLight}
                        accentBottom={dbs.accentBottomEmerald}
                    />

                    <StatCard
                        title="Cancelled"
                        value={cancelledAppointments}
                        icon={<XCircle className="w-5 h-5" />}
                        accentTop={dbs.accentTopRose}
                        accentBottom={dbs.accentBottomRose}
                    />
                </div>

                <div className={dbs.appointmentsContainer}>
                    <div className={dbs.appointmentsHeader}>
                        <h2 className={dbs.appointmentsTitle}>
                            Latest Appointments
                        </h2>
                        <div className="flex items-center gap-3">
                            <div className={dbs.appointmentsTotal}>
                                <Users className={dbs.totalIcon} />
                                <span>{totalAppointments} total</span>
                            </div>
                        </div>
                    </div>

                    {/* Cards grid */}
                    <div className={dbs.cardsGrid}>
                        {top8.map((a) => (
                            <div key={a.id} className={dbs.appointmentCard}>
                                <div className={dbs.cardHeader}>
                                    <div className={dbs.cardAvatar}>
                                        {a.doctorImage ? (
                                            <img
                                                src={a.doctorImage}
                                                alt={a.doctorName}
                                                onError={(e) =>
                                                    (e.currentTarget.style.display = "none")
                                                }
                                                className={dbs.cardAvatarImage}
                                            />
                                        ) : (
                                            <div className={dbs.cardAvatarFallback}>
                                                {(a.doctorName || "D").charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    <div className={dbs.cardContent}>
                                        <div className={dbs.cardPatientName}>
                                            {a.patient}
                                        </div>
                                        <div className={dbs.cardPatientInfo}>
                                            {a.age} yrs · {a.gender}
                                        </div>
                                        <div className={dbs.cardDoctorInfo}>
                                            <span className={dbs.cardDoctorName}>
                                                {a.doctorName}
                                            </span>
                                        </div>
                                        <div className={dbs.cardSpeciality}>
                                            {a.speciality}
                                        </div>
                                        <div className={dbs.cardPhoneContainer}>
                                            <Phone className={dbs.cardPhoneIcon} />
                                            <span>{a.mobile}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={dbs.dateTimeContainer}>
                                    <div className={dbs.dateText}>
                                        {formatDate(a.date)}
                                    </div>
                                    <div className={dbs.timeText}>
                                        {formatTimeAMPM(a.time)}
                                    </div>
                                </div>

                                <div>
                                    <div className={dbs.cardFooter}>
                                        <div className={dbs.feeText}>₹{a.fee}</div>

                                        <div className={dbs.statusContainer}>
                                            <StatusBadge status={a.status} />
                                            <StatusSelect
                                                appointment={a}
                                                onChange={(s) => updateStatus(a.id, s)}
                                            />
                                        </div>

                                        <div className="mt-2 w-full">
                                            <RescheduleButton
                                                appointment={a}
                                                onReschedule={(newDate, newTime) =>
                                                    updateDateTime(a.id, newDate, newTime)
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={dbs.showMoreContainer}>
                        <Link
                            to={
                                doctorId
                                    ? `/doctor-admin/${doctorId}/appointments`
                                    : "/appointments"
                            }
                            className={dbs.showMoreButton}
                        >
                            Show more
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
    accentTop = dbs.accentTopEmeraldLight,
    accentBottom = dbs.accentBottomEmerald,
}) {
    return (
        <div className={dbs.statCard}>
            <div className={dbs.statContent}>
                <div className={dbs.statTextContainer}>
                    <div className={dbs.statTitle}>{title}</div>
                    <div className={dbs.statValue}>{value}</div>
                </div>

                <div
                    className={`${dbs.statIconContainer} ${accentTop} ${accentBottom}`}
                >
                    <div className={dbs.statIcon}>{icon}</div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const base = dbs.statusBadgeBase;
    if (status === "complete")
        return (
            <span className={`${base} ${dbs.statusBadgeComplete}`}>
                Completed
            </span>
        );
    if (status === "cancelled")
        return (
            <span className={`${base} ${dbs.statusBadgeCancelled}`}>
                Cancelled
            </span>
        );
    if (status === "confirmed")
        return (
            <span className={`${base} ${dbs.statusBadgeConfirmed}`}>
                Confirmed
            </span>
        );
    if (status === "rescheduled")
        return (
            <span className={`${base} ${dbs.statusBadgeRescheduled}`}>
                Rescheduled
            </span>
        );
    return (
        <span className={`${base} ${dbs.statusBadgePending}`}>
            Pending
        </span>
    );
}

function StatusSelect({ appointment, onChange }) {
    const terminal =
        appointment.status === "complete" || appointment.status === "cancelled";

    if (appointment.status === "rescheduled") {
        return (
            <select
                value={appointment.status}
                onChange={(e) => onChange(e.target.value)}
                className={`${dbs.statusSelect} ${terminal
                        ? dbs.statusSelectDisabled
                        : dbs.statusSelectEnabled
                    }`}
                title="Change status (only Completed or Cancelled allowed after reschedule)"
            >
                <option value="rescheduled" disabled>
                    Rescheduled
                </option>
                <option value="complete">Completed</option>
                <option value="cancelled">Cancelled</option>
            </select>
        );
    }

    const options = [
        { value: "pending", label: "Pending" },
        { value: "confirmed", label: "Confirmed" },
        { value: "complete", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
    ];

    return (
        <select
            value={appointment.status}
            onChange={(e) => onChange(e.target.value)}
            disabled={terminal}
            className={`${dbs.statusSelect} ${terminal
                    ? dbs.statusSelectDisabled
                    : dbs.statusSelectEnabled
                }`}
            title={terminal ? "Status cannot be changed" : "Change status"}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value} className="text-sm">
                    {opt.label}
                </option>
            ))}
        </select>
    );
}

function RescheduleButton({ appointment, onReschedule }) {
    const terminal =
        appointment.status === "complete" || appointment.status === "cancelled";
    const [editing, setEditing] = useState(false);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("09:00");
    const minDate = React.useMemo(() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    }, []);

    React.useEffect(() => {
        const apptRaw = appointment.date ? String(appointment.date) : "";
        const apptDate = apptRaw.slice(0, 10);

        setDate(apptDate && apptDate >= minDate ? apptDate : minDate);
        setTime(appointment.time || "09:00");
    }, [appointment.date, appointment.time, minDate]);

    function save() {
        if (!date || !time) return;
        if (date < minDate) {
            setDate(minDate);
            return;
        }
        onReschedule(date, time);
        setEditing(false);
    }

    function cancel() {
        const apptRaw = appointment.date ? String(appointment.date) : "";
        const apptDate = apptRaw.slice(0, 10);
        setDate(apptDate && apptDate >= minDate ? apptDate : minDate);
        setTime(appointment.time || "09:00");
        setEditing(false);
    }

    return (
        <div className="w-full">
            {!editing ? (
                <div className="flex justify-end">
                    <button
                        onClick={() => setEditing(true)}
                        disabled={terminal}
                        title={
                            terminal ? "Cannot reschedule completed/cancelled" : "Reschedule"
                        }
                        className={`${dbs.rescheduleButton} ${terminal
                                ? dbs.rescheduleButtonDisabled
                                : dbs.rescheduleButtonEnabled
                            }`}
                    >
                        Reschedule
                    </button>
                </div>
            ) : (
                <div className={dbs.rescheduleForm}>
                    <input
                        type="date"
                        value={date}
                        min={minDate}
                        onChange={(e) => setDate(e.target.value)}
                        className={dbs.rescheduleDateInput}
                    />
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className={dbs.rescheduleTimeInput}
                    />
                    <div className={dbs.rescheduleButtons}>
                        <button onClick={save} className={dbs.saveButton}>
                            Save
                        </button>
                        <button onClick={cancel} className={dbs.cancelButton}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
