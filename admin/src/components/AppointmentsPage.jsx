import React, { useState, useEffect, useMemo } from "react";
import { Search, Calendar } from "lucide-react";
import { pageStyles as ps, statusClasses, keyframesStyles } from '../assets/dummyStyles';

const API_BASE = import.meta.env.VITE_API_BASE;

// Helper Functions
// Returns date in dd/mm/yyyy format
function formatDateISO(iso) {
    try {
        const d = new Date(iso + "T00:00:00");
        return d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch (e) {
        return iso;
    }
}

// Returns date and time from slot
function dateTimeFromSlot(slot) {
    try {
        const [y, m, d] = slot.date.split("-");
        const base = new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0, 0);

        const [time, ampm] = slot.time.split(" ");
        let [hh, mm] = time.split(":").map(Number);
        if (ampm === "PM" && hh !== 12) hh += 12;
        if (ampm === "AM" && hh === 12) hh = 0;
        base.setHours(hh, mm, 0, 0);
        return base;
    } catch (e) {
        return new Date(slot.date + "T00:00:00");
    }
}

const AppointmentsPage = () => {
    const isAdmin = true; // As the admin is logged in and is Major Admin for responses

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [query, setQuery] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filterSpeciality, setFilterSpeciality] = useState("all");
    const [showAll, setShowAll] = useState(false);

    // Fetch list from server
    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const q = query.trim();
                const url = `${API_BASE}/api/appointments?limit=200${q ? `&search=${encodeURIComponent(q)}` : ""
                    }`;
                const res = await fetch(url);
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body?.message || `Failed to fetch (${res.status})`);
                }
                const data = await res.json();
                const items = (data?.appointments || []).map((a) => {
                    const doctorName =
                        (a.doctorId && a.doctorId.name) || a.doctorName || "";
                    const speciality =
                        (a.doctorId && a.doctorId.specialization) ||
                        a.speciality ||
                        a.specialization ||
                        "General";
                    const fee = typeof a.fees === "number" ? a.fees : a.fee || 0;
                    return {
                        id: a._id || a.id,
                        patientName: a.patientName || "",
                        age: a.age || "",
                        gender: a.gender || "",
                        mobile: a.mobile || "",
                        doctorName,
                        speciality,
                        fee,
                        slot: {
                            date: a.date || (a.slot && a.slot.date) || "",
                            time: a.time || (a.slot && a.slot.time) || "00:00 AM",
                        },
                        status: a.status || (a.payment && a.payment.status) || "Pending",
                        raw: a, // keep original in case we need it
                    };
                });
                setAppointments(items);  // Fetch all the details present in the DB
            } catch (err) {
                console.error("Load appointments error:", err);
                setError(err.message || "Failed to load appointments");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Computes available specialities from fetched appointments
    const specialities = useMemo(() => {
        const set = new Set(appointments.map((a) => a.speciality || "General"));
        return ["all", ...Array.from(set)];
    }, [appointments]);

    // Filters by speciality, date & query
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return appointments.filter((a) => {
            if (
                filterSpeciality !== "all" &&
                (a.speciality || "").toLowerCase() !== filterSpeciality.toLowerCase()
            )
                return false;
            if (filterDate && a.slot?.date !== filterDate) return false;
            if (!q) return true;
            return (
                (a.doctorName || "").toLowerCase().includes(q) ||
                (a.speciality || "").toLowerCase().includes(q) ||
                (a.patientName || "").toLowerCase().includes(q) ||
                (a.mobile || "").toLowerCase().includes(q)
            );
        });
    }, [appointments, query, filterDate, filterSpeciality]);

    // Sort filtered by datetime in descending order
    const sortedFiltered = useMemo(() => {
        return filtered.slice().sort((a, b) => {
            const da = dateTimeFromSlot(a.slot).getTime();
            const db = dateTimeFromSlot(b.slot).getTime();
            return db - da;
        });
    }, [filtered]);

    // Display all the appointments or the filtered ones
    const displayed = useMemo(
        () => (showAll ? sortedFiltered : sortedFiltered.slice(0, 8)),
        [sortedFiltered, showAll]
    );

    // Admin wants to cancel an appointment
    async function adminCancelAppointment(id) {
        const appt = appointments.find((x) => x.id === id);
        if (!appt) return;

        const statusLower = (appt.status || "").toLowerCase();
        const isCanceled =
            statusLower === "canceled" || statusLower === "canceled";
        const isCompleted = statusLower === "completed";

        // Prevents admin from cancelling an already canceled or completed appointment
        if (isCanceled || isCompleted) return;

        const ok = window.confirm(
            `As admin, mark appointment for ${appt.patientName} with ${appt.doctorName
            } on ${formatDateISO(appt.slot.date)} at ${appt.slot.time} as CANCELED?`
        );
        if (!ok) return;

        try {
            setAppointments((prev) =>
                prev.map((p) => (p.id === id ? { ...p, status: "Canceled" } : p))
            );
            setShowAll(true);

            const res = await fetch(`${API_BASE}/api/appointments/${id}/cancel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.message || `Cancel failed (${res.status})`);
            }
            const data = await res.json();
            const updated = data?.appointment || data?.appointments || null;
            if (updated) {
                setAppointments((prev) =>
                    prev.map((p) =>
                        p.id === id
                            ? {
                                ...p,
                                status: updated.status || "Canceled",
                                slot: {
                                    date: updated.date || p.slot.date,
                                    time: updated.time || p.slot.time,
                                },
                                raw: updated,
                            }
                            : p
                    )
                );
            }
        } catch (err) {
            console.error("Cancel error:", err);
            setError(err.message || "Failed to cancel appointment");
            try {
                const reload = await fetch(`${API_BASE}/api/appointments?limit=200`);
                if (reload.ok) {
                    const body = await reload.json();
                    const items = (body?.appointments || []).map((a) => ({
                        id: a._id || a.id,
                        patientName: a.patientName || "",
                        age: a.age || "",
                        gender: a.gender || "",
                        mobile: a.mobile || "",
                        doctorName: (a.doctorId && a.doctorId.name) || a.doctorName || "",
                        speciality:
                            (a.doctorId && a.doctorId.specialization) ||
                            a.speciality ||
                            a.specialization ||
                            "General",
                        fee: typeof a.fees === "number" ? a.fees : a.fee || 0,
                        slot: {
                            date: a.date || (a.slot && a.slot.date) || "",
                            time: a.time || (a.slot && a.slot.time) || "00:00 AM",
                        },
                        status: a.status || (a.payment && a.payment.status) || "Pending",
                        raw: a,
                    }));
                    setAppointments(items);
                }
            } catch (e) {
                // Ignore any error
            }
        }
    }


    return (
        <div className={ps.container}>
            <style>{keyframesStyles}</style>
            <div className={ps.maxWidthContainer}>
                <header className={ps.headerContainer}>
                    <div className={ps.headerTitleSection}>
                        <h1 className={ps.headerTitle}>Appointments</h1>
                        <p className={ps.headerSubtitle}>
                            Manage and search upcoming patient appointments
                        </p>
                    </div>
                    <div className={ps.headerControlSection}>
                        <div className="flex flex-col md:flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                            <div className={ps.searchContainer}>
                                <Search size={16} className={ps.searchIcon} />
                                <input className={ps.searchInput}
                                    placeholder="Search Doctor, Patient, Speciality or Mobile"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>

                            {/* Filters */}
                            <div className={ps.filterContainer}>
                                <div className={ps.dateFilter}>
                                    <Calendar size={14} className={ps.dateFilterIcon} />
                                    <input type="date"
                                        className={ps.dateInput}
                                        value={filterDate}
                                        onChange={(e) => setFilterDate(e.target.value)}
                                    />
                                </div>

                                <select className={ps.selectFilter}
                                    value={filterSpeciality} onChange={(e) => setFilterSpeciality(e.target.value)}
                                >
                                    {specialities.map((spec) => (
                                        <option key={spec} value={spec}>
                                            {spec === 'all' ? 'All Specialities' : spec}
                                        </option>))}

                                </select>

                                <button
                                    onClick={() => {
                                        setQuery("");
                                        setFilterDate("");
                                        setFilterSpeciality("all");
                                        setShowAll(false);
                                        setError(null);
                                    }}
                                    className={ps.clearButton}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className={ps.loadingErrorContainer}>Loading...</div>
                ) : error ? (
                    <div className={ps.errorContainer}>{error}</div>
                ) : sortedFiltered.length === 0 ? (
                    <div className={ps.noResultsContainer}>
                        No Appointments found
                    </div>
                ) : (
                    <main className={ps.gridContainer}>
                        {displayed.map((a, idx) => {
                            const statusLower = (a.status || "").toLowerCase();
                            const isCanceled =
                                statusLower === "canceled" || statusLower === "";
                            const isCompleted = statusLower === "completed";
                            const isDisabled = isCanceled || isCompleted;

                            return (
                                <div
                                    key={a.id}
                                    style={{
                                        animation: `fadeUp 420ms cubic-bezier(.2,.9,.2,1) forwards`,
                                        animationDelay: `${idx * 70}ms`,
                                        opacity: 0,
                                    }}
                                    className={ps.card}
                                >
                                    <div className={ps.cardHeader}>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className={ps.cardTitle}>
                                                    {a.patientName}
                                                </h3>

                                                <div className={ps.patientInfo}>
                                                    <span>{a.age ? `${a.age} yrs` : ""}</span>
                                                    <span> {a.age ? ":" : ""} </span>
                                                    <span>{a.gender}</span>
                                                    <span className="hidden md:inline"> : </span>
                                                    <span className=" max-w-30">{a.mobile}</span>
                                                </div>
                                            </div>

                                            <div className={ps.doctorInfo}>
                                                {a.doctorName} :{" "}
                                                <span className={ps.doctorSpeciality}>
                                                    {a.speciality}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className={ps.feeLabel}>
                                                Fees
                                            </div>
                                            <div className={ps.feeAmount}>
                                                <BadgeIndianRupee size={16} />
                                                <span>{a.fee}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 flex-wrap">
                                        <div className={ps.slotContainer}>
                                            <Calendar size={14} className={ps.slotIcon} />
                                            <span>
                                                {formatDateISO(a.slot.date)} — {a.slot.time}
                                            </span>
                                        </div>

                                        <div
                                            className={`${ps.statusBadge} ${statusClasses(a.status)}`}
                                        >
                                            {a.status ? a.status.toUpperCase() : "PENDING"}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {isAdmin && (
                                                <button
                                                    onClick={() => adminCancelAppointment(a.id)}
                                                    title={
                                                        isDisabled
                                                            ? isCompleted
                                                                ? "Cannot cancel a completed appointment"
                                                                : "Already canceled"
                                                            : "Admin Cancel (mark as canceled)"
                                                    }
                                                    disabled={isDisabled}
                                                    aria-disabled={isDisabled}
                                                    className={ps.cancelButton(isDisabled, isCompleted)}
                                                >
                                                    {isDisabled
                                                        ? isCompleted
                                                            ? "Completed"
                                                            : "Admin Canceled"
                                                        : "Admin Cancel"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </main>
                )}

                {sortedFiltered.length > 8 && (
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => setShowAll((s) => !s)}
                            className={ps.showMoreButton}
                        >
                            {showAll ? "Show Less" : `Show More (${sortedFiltered.length - 8})`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentsPage;