import React, { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    CalendarCheck,
    MapPin,
    BadgeInfo,
    GraduationCap,
    Award,
    Clock,
    Star,
    Heart,
    Zap,
    Shield,
    Users,
    Phone,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Clerk client hooks
import { useAuth, useUser } from "@clerk/react";
import { doctorDetailStyles as dds } from "../assets/dummyStyles";

const API_BASE = import.meta.env.VITE_API_BASE;

// Parse schedule dates
function getScheduleDates(schedule) {
    if (!schedule) return [];

    const keys =
        typeof schedule === "object" && !Array.isArray(schedule)
            ? Object.keys(schedule)
            : [];

    // Parse keys into Date objects (supporting YYYY-MM-DD and ISO)
    const parsed = keys
        .map((k) => {
            const d = new Date(k);
            if (!isNaN(d)) return { key: k, date: d };

            // fallback: try splitting YYYY-MM-DD
            const parts = k.split("-").map((n) => Number(n));
            if (parts.length >= 3) {
                const [y, m, day] = parts;
                const dd = new Date(y, m - 1, day);
                if (!isNaN(dd)) return { key: k, date: dd };
            }
            return null;
        })
        .filter(Boolean);

    // Normalize compare by date-only (use UTC to avoid timezone time-of-day issues)
    const dateOnlyValue = (d) =>
        Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());

    const today = new Date();
    const todayVal = dateOnlyValue(today);

    const past = parsed
        .filter((p) => dateOnlyValue(p.date) < todayVal)
        .sort(
            (a, b) =>
                // most recent past first (descending)
                dateOnlyValue(b.date) - dateOnlyValue(a.date),
        );

    const future = parsed
        .filter((p) => dateOnlyValue(p.date) >= todayVal)
        .sort(
            (a, b) =>
                // earliest first (ascending)
                dateOnlyValue(a.date) - dateOnlyValue(b.date),
        );

    // Return array of Date objects: future first, then past
    return [...future, ...past].map((p) => p.date);
}

/**
 * Normalize phone string: remove non-digits and return up to last 10 digits.
 * Returns empty string if no digits.
 */
// Normalize phone to 10 digits
function normalizePhoneTo10(phone) {
    if (!phone) return "";
    const digits = ("" + phone).replace(/\D/g, "");
    if (!digits) return "";
    // prefer last 10 digits (common when country code present)
    return digits.length <= 10 ? digits : digits.slice(-10);
}

// Main DoctorDetail component
export default function DoctorDetail() {
    // Get doctor ID from URL params
    const { id } = useParams();

    // State variables
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedDate, setSelectedDate] = useState("data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [isVisible, setIsVisible] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        age: "",
        mobile: "",
        gender: "",
        email: "",
    });

    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Clerk hooks
    const { getToken, isLoaded: authLoaded } = useAuth();
    const { isSignedIn, user, isLoaded: userLoaded } = useUser();

    useEffect(() => {
        setIsVisible(true);
    }, []);

    // Prefill the form fields quietly if user is available (no UI markup change)
    useEffect(() => {
        if (!userLoaded) return;
        if (user) {
            const fullName =
                user.fullName ||
                `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                "";
            const rawPhone =
                user.primaryPhone ||
                (user.phoneNumbers && user.phoneNumbers.length > 0
                    ? user.phoneNumbers[0]
                    : "") ||
                "";
            const phone = normalizePhoneTo10(rawPhone);
            const email =
                (user.emailAddresses && user.emailAddresses[0]?.emailAddress) ||
                user.primaryEmailAddress ||
                "";

            setFormData((prev) => ({
                ...prev,
                name: prev.name || fullName,
                mobile: prev.mobile || phone,
                email: prev.email || email,
            }));
        }
    }, [userLoaded, user]);

    // Fetch doctor details
    useEffect(() => {
        let mounted = true;
        async function fetchDoctor() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_BASE}/api/doctors/${id}`);
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(
                        body.message || `Failed to fetch (status ${res.status})`,
                    );
                    // Parse JSON response
                }
                const payload = await res.json();
                const doc = payload?.data || null;
                if (mounted) setDoctor(doc);
            } catch (err) {
                if (mounted) setError(err.message || "Failed to fetch doctor");
            } finally {
                if (mounted) setLoading(false);
            }
        }
        fetchDoctor();
        return () => {
            mounted = false;
        };
    }, [id]);

    const next7 = useMemo(() => getScheduleDates(doctor?.schedule), [doctor]);
    const fee = Number(doctor?.fee ?? doctor?.fees ?? 0);

    const slots = useMemo(() => {
        if (!selectedDate || !doctor?.schedule) return [];
        const key = selectedDate.toISOString().split("T")[0];
        return doctor.schedule && doctor.schedule[key] ? doctor.schedule[key] : [];
    }, [selectedDate, doctor]);

    // Mobile input handlers: only digits, max 10
    // Handle mobile change
    const handleMobileChange = (value) => {
        const digits = value.replace(/\D/g, "").slice(0, 10);
        setFormData((prev) => ({ ...prev, mobile: digits }));
    };

    // Handle mobile paste
    const handleMobilePaste = (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData("text");
        const digits = pasted.replace(/\D/g, "").slice(0, 10);
        setFormData((prev) => ({ ...prev, mobile: digits }));
    };

    const handleBooking = async () => {
        if (isSubmitting) return;

        // Validate patient details
        if (
            !formData.name ||
            !formData.age ||
            !formData.mobile ||
            !formData.gender
        ) {
            toast.error("Please fill all patient details!", {
                position: "top-center",
                autoClose: 2000,
            });
            return;
        }

        // Mobile must be exactly 10 digits
        const mobileDigits = (formData.mobile || "").replace(/\D/g, "");
        if (mobileDigits.length !== 10) {
            toast.error("Mobile number must be exactly 10 digits.", {
                position: "top-center",
                autoClose: 2500,
            });
            return;
        }

        if (!selectedDate || !selectedSlot) {
            toast.error("Please select a date and time slot", {
                position: "top-center",
                autoClose: 2000,
            });
            return;
        }

        if (!authLoaded || !userLoaded) {
            toast.error("Authentication not ready. Please try again in a moment.", {
                position: "top-center",
                autoClose: 2000,
            });
            return;
        }

        if (!isSignedIn) {
            toast.error("You must sign in to create an appointment.", {
                position: "top-center",
                autoClose: 2200,
            });
            return;
        }

        setIsSubmitting(true);

        const dateISO = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD

        // prefer fields from doctor object (this is only sent as a hint; backend will use DB)
        const doctorNameValue = doctor?.name || "";
        const specialityValue =
            doctor?.specialization ||
            doctor?.speciality ||
            doctor?.specialityName ||
            "";

        // optional owner from doctor object (backend will prefer doctor.owner)
        const ownerValue = doctor?.owner || undefined;

        const payload = {
            doctorId: doctor._id || doctor.id,
            doctorName: doctorNameValue,
            speciality: specialityValue,
            owner: ownerValue,
            // NEW: send image hints (optional — backend prefers DB but accepts these)
            doctorImageUrl: doctor?.imageUrl || doctor?.image || "",
            doctorImagePublicId:
                doctor?.imagePublicId || doctor?.image?.publicId || "",
            patientName: formData.name,
            mobile: mobileDigits,
            age: formData.age,
            gender: formData.gender,
            date: dateISO,
            time: selectedSlot,
            fee: fee,
            fees: fee,
            paymentMethod: paymentMethod || "Online",
            email: formData.email || undefined,
        };

        try {
            const token = await getToken();
            if (!token) {
                throw new Error("Failed to obtain authentication token.");
            }

            const res = await fetch(`${API_BASE}/api/appointments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const body = await res.json().catch(() => null);
            if (!res.ok) {
                const message =
                    body?.message || body?.error || `Booking failed (${res.status})`;
                toast.error(message, { position: "top-center" });
                setIsSubmitting(false);
                return;
            }

            // If checkoutUrl is returned -> redirect to Stripe Checkout
            if (body.checkoutUrl) {
                // redirect user to Stripe Checkout
                window.location.href = body.checkoutUrl;
                return;
            }

            // Booking created (Cash or free)
            toast.success("Booking successful", {
                position: "top-center",
                autoClose: 1500,
            });

            // navigate to appointments list (you can change this path)
            setTimeout(() => {
                window.location.href = "/appointments?payment_status=Pending";
            }, 700);
        } catch (err) {
            console.error("Booking error:", err);
            toast.error(
                err?.message || "Network error - booking failed (auth or server issue)",
                { position: "top-center" },
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading case
    if (loading)
        return (
            <div className={dds.loadingContainer}>
                <div>Loading doctor...</div>
            </div>
        );

    // Error case
    if (error)
        return (
            <div className={dds.errorContainer}>
                <div className={dds.errorContent}>
                    <div className={dds.errorText}>Error</div>
                    <div className={dds.errorMessage}>{error}</div>
                    <Link to="/doctors" className={dds.backButton}>
                        <ArrowLeft size={20} />
                        Back to Doctors
                    </Link>
                </div>
            </div>
        );

    // Not found case
    if (!doctor)
        return (
            <div className={dds.notFoundContainer}>
                <div className={dds.notFoundContent}>
                    <div className={dds.notFoundEmoji}>😷</div>
                    <h1 className={dds.notFoundTitle}>Doctor Not Found</h1>
                    <Link to="/doctors" className={dds.backButton}>
                        <ArrowLeft size={20} />
                        Back to Doctors
                    </Link>
                </div>
            </div>
        );

    return (
        <div className={dds.pageContainer}>
            <ToastContainer />
            {/* Header */}
            <div className={dds.headerContainer}>
                <div className={dds.headerContent}>
                    <div className={dds.headerFlex}>
                        <Link to="/doctors" className={dds.headerBackButton}>
                            <ArrowLeft size={18} />
                            <span className={dds.headerBackButtonText}>
                                Back
                            </span>
                        </Link>

                        <div className={dds.headerTitleContainer}>
                            <h1 className={dds.headerTitle}>Doctor Profile</h1>
                        </div>

                        <div className={dds.headerRatingContainer}>
                            <Star className={dds.headerRatingIcon} size={18} />
                            <span className={dds.headerRatingText}>
                                {doctor.rating}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className={`${dds.mainContent} ${isVisible
                    ? dds.visibleState
                    : dds.hiddenState
                    }`}
            >
                {/* profile card */}
                <div className={dds.profileCard}>
                    <div className={dds.profileGrid}>
                        <div className={dds.leftColumn}>
                            <div className={dds.avatarContainer}>
                                <div className={dds.avatarGlow}></div>

                                <img
                                    src={
                                        doctor.imageUrl || doctor.image || "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
                                    }
                                    alt="Doctor"
                                    className={dds.avatarImage}
                                    style={{ objectPosition: "center" }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
                                    }}
                                />
                            </div>

                            <div className={dds.statsGrid}>
                                <div className={dds.statBox}>
                                    <Heart
                                        className={`${dds.statIcon} ${dds.heartIcon}`}
                                    />
                                    <div className={dds.statValue}>
                                        {doctor.success}%
                                    </div>
                                    <div className={dds.statLabel}>Success</div>
                                </div>
                                <div className={dds.statBox}>
                                    <Award
                                        className={`${dds.statIcon} ${dds.awardIcon}`}
                                    />
                                    <div className={dds.statValue}>
                                        {doctor.experience} Years
                                    </div>
                                    <div className={dds.statLabel}>Experience</div>
                                </div>
                                <div className={dds.statBox}>
                                    <Users
                                        className={`${dds.statIcon} ${dds.usersIcon}`}
                                    />
                                    <div className={dds.statValue}>
                                        {doctor.patients}
                                    </div>
                                    <div className={dds.statLabel}>Patients</div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT */}
                        <div className={dds.rightColumn}>
                            <div className={dds.doctorNameContainer}>
                                <h1 className={dds.doctorName}>{doctor.name}</h1>
                                <div className={dds.specializationBadge}>
                                    <Zap className={dds.badgeIcon} />
                                    {doctor.specialization ||
                                        doctor.speciality ||
                                        "General"}
                                </div>
                            </div>

                            <div className={dds.infoGrid}>
                                <div className={dds.infoItem}>
                                    <GraduationCap className={dds.infoIcon} />
                                    <div>
                                        <div className={dds.infoLabel}>
                                            Qualifications
                                        </div>
                                        <div className={dds.infoValue}>
                                            {doctor.qualifications}
                                        </div>
                                    </div>
                                </div>

                                <div className={dds.infoItem}>
                                    <MapPin className={dds.infoIcon} />
                                    <div>
                                        <div className={dds.infoLabel}>Location</div>
                                        <div className={dds.infoValue}>
                                            {doctor.location}
                                        </div>
                                    </div>
                                </div>

                                <div className={dds.infoItem}>
                                    <Clock className={dds.infoIcon} />
                                    <div>
                                        <div className={dds.infoLabel}>
                                            Consultation Fee
                                        </div>
                                        <div className={dds.feeValue}>₹{fee}</div>
                                    </div>
                                </div>

                                <div className={dds.infoItem}>
                                    <Shield className={dds.infoIcon} />
                                    <div>
                                        <div className={dds.infoLabel}>
                                            Availability
                                        </div>
                                        <div className={dds.infoValue}>
                                            {doctor.availability === "Available" || doctor.available
                                                ? "Available"
                                                : "Available Soon"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={dds.aboutContainer}>
                                <div className={dds.aboutHeader}>
                                    <BadgeInfo className={dds.aboutIcon} />
                                    <h3 className={dds.aboutTitle}>
                                        About Doctor
                                    </h3>
                                </div>
                                <p className={dds.aboutText}>
                                    {doctor.about || doctor.bio}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* APPOINTMENT */}
                <div className={dds.appointmentContainer}>
                    <div className={dds.appointmentContent}>
                        <div className={dds.appointmentHeader}>
                            <CalendarCheck className={dds.appointmentIcon} />
                            <h2 className={dds.appointmentTitle}>
                                Book Your Appointment
                            </h2>
                        </div>

                        <div className={dds.appointmentGrid}>
                            {/* LEFT COLUMN */}
                            <div className={dds.dateSection}>
                                <h3 className={dds.dateTitle}>
                                    <CalendarCheck className={dds.dateTitleIcon} />{" "}
                                    Select Date
                                </h3>

                                <div className={dds.dateScrollContainer}>
                                    <div className={dds.dateButtonsContainer}>
                                        {next7.map((date) => {
                                            const isSelected =
                                                selectedDate?.toDateString() === date.toDateString();
                                            return (
                                                <button
                                                    key={date.toISOString()}
                                                    onClick={() => setSelectedDate(date)}
                                                    className={`${dds.dateButton} ${isSelected
                                                        ? dds.dateButtonSelected
                                                        : dds.dateButtonUnselected
                                                        }`}
                                                >
                                                    <div className={dds.dateContent}>
                                                        <div className={dds.dateWeekday}>
                                                            {date.toLocaleDateString("en-US", {
                                                                weekday: "short",
                                                            })}
                                                        </div>
                                                        <div className={dds.dateDay}>
                                                            {date.getDate()}
                                                        </div>
                                                        <div className={dds.dateMonth}>
                                                            {date.toLocaleDateString("en-US", {
                                                                month: "short",
                                                            })}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* PATIENT FORM */}
                                <div className={dds.patientForm}>
                                    <h3 className={dds.patientFormTitle}>
                                        Patient Details
                                    </h3>

                                    <div className={dds.patientFormGrid}>
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            className={dds.formInput}
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                        />

                                        <input
                                            type="number"
                                            placeholder="Age"
                                            className={dds.formInput}
                                            value={formData.age}
                                            onChange={(e) =>
                                                setFormData({ ...formData, age: e.target.value })
                                            }
                                        />

                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            pattern="\d{10}"
                                            maxLength={10}
                                            placeholder="Mobile Number (10 digits)"
                                            className={dds.formInput}
                                            value={formData.mobile}
                                            onChange={(e) => handleMobileChange(e.target.value)}
                                            onPaste={handleMobilePaste}
                                        />

                                        <select
                                            className={dds.formSelect}
                                            value={formData.gender}
                                            onChange={(e) =>
                                                setFormData({ ...formData, gender: e.target.value })
                                            }
                                        >
                                            <option value="">Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>

                                        <input
                                            type="email"
                                            placeholder="Email (optional - for receipts)"
                                            className={dds.emailInput}
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({ ...formData, email: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN */}
                            <div className={dds.timeSlotsSection}>
                                <h3 className={dds.timeSlotsTitle}>
                                    <Clock className={dds.timeSlotsIcon} />{" "}
                                    Available Time Slots
                                </h3>

                                <div className={dds.timeSlotsContainer}>
                                    {slots.length === 0 && (
                                        <p className={dds.noSlotsMessage}>
                                            No time slots for this date.
                                        </p>
                                    )}

                                    {slots.map((slot) => (
                                        <button
                                            key={slot}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`${dds.timeSlotButton} ${selectedSlot === slot
                                                ? dds.timeSlotButtonSelected
                                                : dds.timeSlotButtonUnselected
                                                }`}
                                        >
                                            <div className={dds.timeSlotContent}>
                                                <Clock className={dds.timeSlotIcon} />
                                                <span>{slot}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* SUMMARY */}
                                <div className={dds.summaryContainer}>
                                    <div className={dds.summaryItem}>
                                        <div className={dds.summaryRow}>
                                            <span className={dds.summaryLabel}>
                                                Selected Doctor:
                                            </span>
                                            <span className={dds.summaryValue}>
                                                {doctor?.name || "—"}
                                            </span>
                                        </div>

                                        <div className={dds.summaryRow}>
                                            <span className={dds.summaryLabel}>
                                                Doctor Speciality:
                                            </span>
                                            <span className={dds.summaryValue}>
                                                {doctor?.specialization || doctor?.speciality || "—"}
                                            </span>
                                        </div>

                                        <div className={dds.summaryRow}>
                                            <span className={dds.summaryLabel}>
                                                Selected Date:
                                            </span>
                                            <span className={dds.summaryValue}>
                                                {selectedDate
                                                    ? selectedDate.toLocaleDateString("en-US", {
                                                        weekday: "long",
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })
                                                    : "Not selected"}
                                            </span>
                                        </div>

                                        <div className={dds.summaryRow}>
                                            <span className={dds.summaryLabel}>
                                                Selected Time:
                                            </span>
                                            <span className={dds.summaryValue}>
                                                {selectedSlot || "Not selected"}
                                            </span>
                                        </div>

                                        <div className={dds.summaryRow}>
                                            <span className={dds.summaryLabel}>
                                                Consultation Fee:
                                            </span>
                                            <span className={dds.feeDisplay}>
                                                ₹{fee}
                                            </span>
                                        </div>
                                    </div>

                                    {/* PAYMENT METHOD SELECTOR */}
                                    <div className={dds.paymentContainer}>
                                        <label className={dds.paymentLabel}>
                                            Payment:
                                        </label>
                                        <div className={dds.paymentOptions}>
                                            <label
                                                className={`${dds.paymentOption} ${paymentMethod === "Cash"
                                                    ? dds.paymentOptionSelected
                                                    : dds.paymentOptionUnselected
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value="Cash"
                                                    checked={paymentMethod === "Cash"}
                                                    onChange={() => setPaymentMethod("Cash")}
                                                    className={dds.paymentRadio}
                                                />
                                                Cash
                                            </label>
                                            <label
                                                className={`${dds.paymentOption} ${paymentMethod === "Online"
                                                    ? dds.paymentOptionSelected
                                                    : dds.paymentOptionUnselected
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value="Online"
                                                    checked={paymentMethod === "Online"}
                                                    onChange={() => setPaymentMethod("Online")}
                                                    className={dds.paymentRadio}
                                                />
                                                Online
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleBooking}
                                        disabled={!selectedDate || !selectedSlot || isSubmitting}
                                        className={`${dds.bookingButton} ${!selectedDate || !selectedSlot || isSubmitting
                                            ? dds.bookingButtonDisabled
                                            : dds.bookingButtonEnabled
                                            }`}
                                    >
                                        <div className={dds.bookingButtonContent}>
                                            <Phone className={dds.bookingIcon} />
                                            <span>
                                                {isSubmitting ? "Booking..." : "Confirm Booking"}
                                            </span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
