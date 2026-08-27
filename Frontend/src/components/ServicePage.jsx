import React, { useState, useEffect } from "react";
import { servicePageStyles as sps, serviceCardStyles as scs } from "../assets/dummyStyles";
import { Link } from "react-router-dom";
import { ChevronsRight, MousePointer2Off } from "lucide-react";

const PlaceholderImg = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

const ServiceCard = ({ service }) => {
    const hasSrcSet =
        !!service.imageSrcSet ||
        (!!service.imageSmall && !!service.imageMedium && !!service.imageLarge);

    const src = service.imageUrl || service.image || service.imageSmall || "";
    const srcSet =
        service.imageSrcSet ||
        (service.imageSmall || service.image
            ? `${service.imageSmall || src} 480w, ${service.imageMedium || src
            } 768w, ${service.imageLarge || src} 1200w`
            : null);

    const name = service.name || "Service";
    const shortDescription = service.shortDescription || service.about || "";

    return (
        <div className={scs.card}>
            <div className={scs.imageContainer} aria-hidden="true">
                {hasSrcSet ? (
                    <picture className={scs.picture}>
                        {service.imageWebp && (
                            <source srcSet={service.imageWebp} type="image/webp" />
                        )}
                        {service.imageSrcSet ? (
                            <img
                                src={src || PlaceholderImg}
                                srcSet={service.imageSrcSet}
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className={scs.responsiveImage}
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = PlaceholderImg;
                                }}
                            />
                        ) : (
                            <img
                                src={src || PlaceholderImg}
                                srcSet={srcSet || undefined}
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className={scs.responsiveImage}
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = PlaceholderImg;
                                }}
                            />
                        )}
                    </picture>
                ) : (
                    <img
                        src={src || PlaceholderImg}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className={scs.fallbackImage}
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = PlaceholderImg;
                        }}
                    />
                )}
            </div>

            <div className={scs.content}>
                <h3 className={scs.serviceName}>{name}</h3>

                <div className={scs.buttonContainer}>
                    {service.available ? (
                        <Link
                            to={`/services/${service.id}`}
                            state={{ service: service.raw || service }}
                            className={scs.buttonAvailable}
                            aria-label={`Book ${name}`}
                        >
                            <ChevronsRight className="w-5 h-5" aria-hidden="true" />
                            Book Now
                        </Link>
                    ) : (
                        <button
                            disabled
                            className={scs.buttonUnavailable}
                            aria-label={`${name} not available`}
                        >
                            <MousePointer2Off className="w-5 h-5" aria-hidden="true" />
                            Not Available
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const ServicePage = ({ previewCount = 9999 } = {}) => {
    const API_BASE = import.meta.env.VITE_API_BASE;
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Load services from API
    async function loadServices() {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/api/services`);
            const json = await res.json().catch(() => null);

            if (!res.ok) {
                const msg =
                    (json && json.message) || `Failed to load services (${res.status})`;
                setError(msg);
                setServices([]);
                setLoading(false);
                return;
            }

            const items = (json && (json.data || json)) || [];
            const normalized = (Array.isArray(items) ? items : []).map((s) => {
                const id = s._id || s.id;
                const image = s.imageUrl || s.image || s.imageSmall || "";
                const available =
                    typeof s.available === "boolean"
                        ? s.available
                        : typeof s.availability === "string"
                            ? s.availability.toLowerCase() === "available"
                            : s.availability === "Available" || s.available === true;

                return {
                    id,
                    name: s.name || "Service",
                    shortDescription: s.shortDescription || s.about || "",
                    image,
                    imageSmall: s.imageSmall || null,
                    imageMedium: s.imageMedium || null,
                    imageLarge: s.imageLarge || null,
                    imageSrcSet: s.imageSrcSet || null,
                    imageWebp: s.imageWebp || null,
                    price: s.price ?? s.fee ?? 0,
                    available,
                    raw: s,
                };
            });

            setServices(normalized);
        } catch (err) {
            console.error("load services error:", err);
            setError("Network error while loading services.");
            setServices([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadServices();
    }, [API_BASE]);

    const shown = services.slice(0, previewCount);

    return (
        <div className={sps.pageContainer}>
            <div className={sps.maxWidthContainer}>
                <header className={sps.header}>
                    <h1 className={sps.title}>
                        Our Diagnostic Services
                    </h1>
                    <p className={sps.subtitle}>
                        Safe, accurate, and advanced diagnostic tests with the best doctors in the area.
                    </p>
                </header>

                {error && (
                    <div className={sps.errorContainer}>
                        <div className={sps.errorText}>{error}</div>
                        <button onClick={loadServices} className={sps.retryButton}>Retry</button>
                    </div>
                )}

                {loading ? (
                    <section className={sps.skeletonGrid}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className={sps.skeletonCard}>
                                <div className={sps.skeletonImage}></div>
                                <div className={sps.skeletonText1}></div>
                                <div className={sps.skeletonText2}></div>
                                <div className={sps.skeletonButton}></div>
                            </div>
                        ))}
                    </section>
                ) : (
                    <section className={sps.servicesGrid}>
                        {shown.length > 0 ? shown.map((s) => (
                            <ServiceCard key={s.id || s.name} service={s} />
                        )) : (
                            <div className={sps.emptyState}>
                                No services available.
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
};

export default ServicePage;