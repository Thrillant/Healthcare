import React, { useState, useEffect, useMemo } from "react";
import { doctorsPageStyles as dps } from "../assets/dummyStyles";
import { ChevronRight, CircleChevronDown, CircleChevronUp, Medal, MousePointer2Off, Search, X } from "lucide-react";
import { Link } from "react-router-dom";

const DoctorsPage = () => {
    const API_BASE = import.meta.env.VITE_API_BASE;

    const [allDoctors, setAllDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showAll, setShowAll] = useState(false);

    // Load doctors from server
    useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`${API_BASE}/api/doctors`);
                const json = await res.json().catch(() => null);

                if (!res.ok) {
                    const msg =
                        (json && json.message) || `Failed to load doctors (${res.status})`;
                    if (mounted) {
                        setError(msg);
                        setAllDoctors([]);
                        setLoading(false);
                    }
                    return;
                }

                const items = (json && (json.data || json)) || [];
                const normalized = (Array.isArray(items) ? items : []).map((d) => {
                    const id = d._id || d.id;
                    const image =
                        d.imageUrl || d.image || d.imageSmall || d.imageSrc || "";
                    let available = true;
                    if (typeof d.availability === "string") {
                        available = d.availability.toLowerCase() === "available";
                    } else if (typeof d.available === "boolean") {
                        available = d.available;
                    } else if (typeof d.availability === "boolean") {
                        available = d.availability;
                    } else {
                        available = d.availability === "Available" || d.available === true;
                    }
                    return {
                        id,
                        name: d.name || "Unknown",
                        specialization: d.specialization || "",
                        image,
                        experience:
                            (d.experience ?? d.experience === 0) ? String(d.experience) : "—",
                        fee: d.fee ?? d.price ?? 0,
                        available,
                        raw: d,
                    };
                });

                if (mounted) {
                    setAllDoctors(normalized);
                    setError("");
                }
            } catch (err) {
                console.error("load doctors error:", err);
                if (mounted) {
                    setError("Network error while loading doctors.");
                    setAllDoctors([]);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => {
            mounted = false;
        };
    }, [API_BASE]);

    // Filter the doctors
    const filteredDoctors = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return allDoctors;
        return allDoctors.filter(
            (doctor) =>
                (doctor.name || "").toLowerCase().includes(q) ||
                (doctor.specialization || "").toLowerCase().includes(q),
        );
    }, [allDoctors, searchTerm]);

    // Display all doctors or the first 8
    const displayedDoctors = showAll
        ? filteredDoctors
        : filteredDoctors.slice(0, 8);

    // Retry function
    const retry = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/api/doctors`);
            const json = await res.json().catch(() => null);
            if (!res.ok) {
                setError((json && json.message) || `Failed to load (${res.status})`);
                setAllDoctors([]);
                return;
            }
            const items = (json && (json.data || json)) || [];
            const normalized = (Array.isArray(items) ? items : []).map((d) => {
                const id = d._id || d.id;
                const image = d.imageUrl || d.image || "";
                let available = true;
                if (typeof d.availability === "string") {
                    available = d.availability.toLowerCase() === "available";
                } else if (typeof d.available === "boolean") {
                    available = d.available;
                } else {
                    available = d.availability === "Available" || d.available === true;
                }
                return {
                    id,
                    name: d.name || "Unknown",
                    specialization: d.specialization || "",
                    image,
                    experience: d.experience ?? "—",
                    fee: d.fee ?? d.price ?? 0,
                    available,
                    raw: d,
                };
            });
            setAllDoctors(normalized);
            setError("");
        } catch (e) {
            console.error(e);
            setError("Network error while loading doctors.");
            setAllDoctors([]);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className={dps.mainContainer}>
            <div className={dps.backgroundShape1}></div>
            <div className={dps.backgroundShape2}></div>

            <div className={dps.wrapper}>
                <div className={dps.headerContainer}>
                    <h1 className={dps.headerTitle}>
                        Meet Our Dedicated Doctors
                    </h1>
                    <p className={dps.headerSubtitle}>
                        Find the perfect doctor for your healthcare needs
                    </p>
                </div>

                <div className={dps.searchContainer}>
                    <div className={dps.searchWrapper}>
                        <input
                            type="text"
                            placeholder="Search doctors by name or specialization..."
                            className={dps.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        <Search className={dps.searchIcon} />
                        {searchTerm.length > 0 && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className={dps.clearButton}
                            >
                                <X size={20} strokeWidth={3.5} />
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className={dps.errorContainer}>
                        <div className={dps.errorText}>{error}</div>
                        <div className="flex items-center justify-center gap-3">
                            <button onClick={retry} className={dps.retryButton}>
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className={dps.skeletonGrid}>
                        {Array.from({ length: 8 }, (_, i) => (
                            <div key={i} className={dps.skeletonCard}>
                                <div className={dps.skeletonImage}></div>
                                <div className={dps.skeletonName}></div>
                                <div className={dps.skeletonSpecialization}></div>
                                <div className={dps.skeletonButton}></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`${dps.doctorsGrid} 
                    ${filteredDoctors.length === 0
                            ? "opacity-78"
                            : "opacity-100"
                        }`}
                    >
                        {displayedDoctors.length > 0 ? (
                            displayedDoctors.map((doc, i) => (
                                <div key={doc.id || `${doc.name}-${i}`}
                                    className={`${dps.doctorCard} ${!doc.available ? dps.doctorCardUnavailable : ""
                                        }`} style={{
                                            animationDelay: `${i * 90}ms`
                                        }} role="article"
                                >
                                    {doc.available ? (
                                        <Link
                                            to={`/doctors/${doc.id}`}
                                            state={{ doctor: doc.raw || doc }}
                                            className={dps.focusRing}
                                        >
                                            <div className={dps.imageContainer}>
                                                <img
                                                    src={doc.image || "/placeholder-doctor.svg"}
                                                    alt={doc.name}
                                                    loading="lazy"
                                                    className={dps.doctorImage}
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = "/placeholder-doctor.svg";
                                                    }}
                                                />
                                            </div>
                                        </Link>
                                    ) : (
                                        <div
                                            className={`${dps.imageContainer} ${dps.imageContainerUnavailable}`}
                                        >
                                            <img
                                                src={doc.image || "/placeholder-doctor.svg"}
                                                alt={doc.name}
                                                loading="lazy"
                                                className={dps.doctorImageUnavailable}
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = "/placeholder-doctor.svg";
                                                }}
                                            />
                                        </div>
                                    )}

                                    <h3 className={dps.doctorName}>{doc.name}</h3>
                                    <p className={dps.doctorSpecialization}>{doc.specialization}</p>
                                    <div className={dps.experienceBadge}>
                                        <Medal className={dps.experienceIcon} />
                                        <span>{doc.experience || "-"} yrs</span>
                                    </div>

                                    {doc.available ? (
                                        <Link to={`/doctors/${doc.id}`} state={{ doctor: doc.raw || doc }} className={dps.bookButton}>
                                            <ChevronRight className={dps.bookButtonIcon} />
                                            Book Now
                                        </Link>
                                    ) : (
                                        <button disabled className={dps.notAvailableButton}>
                                            <MousePointer2Off className={dps.bookButtonIcon} />
                                            Not Available
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className={dps.noResults}>
                                No doctors found matching your search criteria
                            </div>
                        )}
                    </div>
                )}

                {/* Show More / Show Less */}
                {!loading && filteredDoctors.length > 8 && (
                    <div className={dps.showMoreContainer}>
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className={dps.showMoreButton}
                        >
                            {showAll ? (
                                <>
                                    <CircleChevronUp className={dps.showMoreIcon} />
                                    Hide
                                </>
                            ) : (
                                <>
                                    <CircleChevronDown className={dps.showMoreIcon} />
                                    Show More
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Animations */}
            <style>{`
                @keyframes fade-in {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-up {
                from { opacity: 0; transform: translateY(40px); }
                to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slide-up {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.9s ease-out; }
                .animate-fade-in-up { animation: fade-in-up 0.9s ease-out both; }
                .animate-slide-up { animation: slide-up 0.8s ease-out; }

                @media (max-width: 420px) {
                .max-w-7xl { padding-left: 10px; padding-right: 10px; }
                }

                @media (prefers-reduced-motion: reduce) {
                * { animation: none !important; transition: none !important; }
                }
            `}</style>
        </div>
    );
};

export default DoctorsPage;