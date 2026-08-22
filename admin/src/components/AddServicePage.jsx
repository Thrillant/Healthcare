import React, { useState, useRef, useEffect } from "react";
import { addServiceStyles as ads } from "../assets/dummyStyles";
import { AlertTriangle, CheckCircle, XCircle, Clock, Image, Plus, Trash2, Calendar } from "lucide-react";
import { useParams } from "react-router-dom";

const AddServicePage = () => {
    const { serviceId } = useParams();
    const API_BASE = import.meta.env.VITE_API_BASE;

    const fileRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [hasExistingImage, setHasExistingImage] = useState(false); // Update the image if found
    const [removeImage, setRemoveImage] = useState(false);  // Remove the image

    const [serviceName, setServiceName] = useState("");
    const [about, setAbout] = useState("");
    const [price, setPrice] = useState("");
    const [availability, setAvailability] = useState("available");

    const [instructions, setInstructions] = useState([""]);
    const [slots, setSlots] = useState([]);

    // Date & Time controls
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();

    const years = Array.from({ length: 5 }).map((_, i) => currentYear + i);
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    const hours = Array.from({ length: 12 }).map((_, i) =>
        String(i + 1).padStart(2, "0")
    );
    const minutes = Array.from({ length: 12 }).map((_, i) =>
        String(i * 5).padStart(2, "0")
    );
    const ampm = ["AM", "PM"];

    // Date & Time slot
    const [slotDay, setSlotDay] = useState(String(currentDate));
    const [slotMonth, setSlotMonth] = useState(String(currentMonth));
    const [slotYear, setSlotYear] = useState(String(currentYear));
    const [slotHour, setSlotHour] = useState("11");
    const [slotMinute, setSlotMinute] = useState("00");
    const [slotAmPm, setSlotAmPm] = useState("AM");

    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});

    // Days in the selected month
    const selectedYearNum = Number(slotYear);
    const selectedMonthNum = Number(slotMonth);
    const daysInSelectedMonth = new Date(
        selectedYearNum,
        selectedMonthNum + 1,
        0
    ).getDate();
    const days = Array.from({ length: daysInSelectedMonth }).map((_, i) =>
        String(i + 1)
    );

    // Update the day if it is greater than the number of days in the selected month
    useEffect(() => {
        if (Number(slotDay) > daysInSelectedMonth) {
            setSlotDay(String(daysInSelectedMonth));
        }
    }, [slotMonth, slotYear, daysInSelectedMonth]);

    // Fetch the services
    useEffect(() => {
        let mounted = true;
        async function loadService() {
            if (!serviceId) return;
            try {
                const res = await fetch(`${API_BASE}/api/services/${serviceId}`);
                if (!res.ok) {
                    const txt = await res.text().catch(() => "");
                    console.warn("Failed to fetch service:", res.status, txt);
                    showToast(
                        "error",
                        "Load failed",
                        "Could not load service for editing."
                    );
                    return;
                }
                const payload = await res.json().catch(() => null);
                const data = payload?.data || payload;
                if (!data) return;
                if (!mounted) return;

                setServiceName(data.name || "");
                setAbout(data.about || data.description || "");
                setPrice(data.price != null ? String(data.price) : "");
                setAvailability(data.available ? "available" : "unavailable");
                setInstructions(
                    Array.isArray(data.instructions) && data.instructions.length
                        ? data.instructions
                        : [""]
                );
                setSlots(Array.isArray(data.slots) ? data.slots : []);
                if (data.imageUrl) {
                    setImagePreview(data.imageUrl);
                    setHasExistingImage(true);
                    setRemoveImage(false);
                } else {
                    setImagePreview(null);
                    setHasExistingImage(false);
                }
            } catch (err) {
                console.error("loadService error:", err);
                showToast("error", "Network error", "Could not load service.");
            }
        }
        loadService();
        return () => {
            mounted = false;
        };
    }, [serviceId, API_BASE]); // Pre fetch for that paarticular service if present

    // Handle image change
    function handleImageChange(e) {
        const f = e.target.files?.[0];
        if (!f) return;
        if (imagePreview && imagePreview.startsWith("blob:")) {
            try {
                URL.revokeObjectURL(imagePreview);
            } catch (err) { }
        }
        setImageFile(f);
        setImagePreview(URL.createObjectURL(f));
        // If new image is added, remove old image
        setRemoveImage(false);
        setHasExistingImage(false);
    }

    // Instruction handlers
    function addInstruction() {
        setInstructions((s) => [...s, ""]);
    }
    function updateInstruction(i, v) {
        setInstructions((s) => s.map((x, idx) => (idx === i ? v : x)));
    }
    function removeInstruction(i) {
        setInstructions((s) => s.filter((_, idx) => idx !== i));
    }

    // Reset form helper
    function resetForm() {
        if (imagePreview && imagePreview.startsWith("blob:")) {
            try {
                URL.revokeObjectURL(imagePreview);
            } catch (err) { }
        }
        setImagePreview(null);
        setImageFile(null);
        setHasExistingImage(false);
        setRemoveImage(false);
        setServiceName("");
        setAbout("");
        setPrice("");
        setAvailability("available");
        setInstructions([""]);
        setSlots([]);
        setErrors({});
    }

    // Show toast for 3.5 secs
    function showToast(type, title, message) {
        setToast({ type, title, message });
        setTimeout(() => setToast(null), 3500);
    }

    // Select date and time
    function selectedDateTime() {
        const d = Number(slotDay);
        const m = Number(slotMonth);
        const y = Number(slotYear);
        let h = Number(slotHour);
        const mm = Number(slotMinute);
        const ap = slotAmPm;

        if (ap === "AM") {
            if (h === 12) h = 0;
        } else {
            if (h !== 12) h = h + 12;
        }

        return new Date(y, m, d, h, mm, 0, 0);
    }

    // Check if selected date and time is in past
    function isSelectedDateTimeInPast() {
        const sel = selectedDateTime();
        return sel.getTime() <= Date.now();
    }

    // Add slot
    function addSlot() {
        const m = months[Number(slotMonth)];
        const d = String(slotDay).padStart(2, "0");
        const y = slotYear;
        const h = String(slotHour).padStart(2, "0");
        const mm = slotMinute;
        const ap = slotAmPm;
        const formatted = `${d} ${m} ${y} • ${h}:${mm} ${ap}`;

        if (slots.includes(formatted)) {
            showToast(
                "error",
                "Duplicate Slot",
                "This time slot has already been added. Please select a different time."
            );
            return;
        }

        if (isSelectedDateTimeInPast()) {
            showToast(
                "error",
                "Past Time",
                "You cannot add a time slot in the past. Please select a future date/time."
            );
            setErrors((e) => ({ ...e, slots: true }));
            return;
        }

        setSlots((s) => [...s, formatted]);
        setErrors((e) => ({ ...e, slots: false }));
        showToast("success", "Slot Added", `Time slot added: ${formatted}`);
    }

    function removeSlot(i) {
        const removedSlot = slots[i];
        setSlots((s) => s.filter((_, idx) => idx !== i));
        showToast("info", "Slot Removed", `Removed: ${removedSlot}`);
    }

    // Validation helper
    function validate() {
        const newErrors = {};
        if (!imageFile && !hasExistingImage) newErrors.image = true;
        if (!serviceName.trim()) newErrors.serviceName = true;
        if (!about.trim()) newErrors.about = true;
        if (!String(price).trim()) newErrors.price = true;
        if (!instructions.some((ins) => ins.trim())) newErrors.instructions = true;
        if (!slots.length) newErrors.slots = true;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    // Handle form submission
    async function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) {
            showToast(
                "error",
                "Missing Fields",
                "Please fill all required fields before submitting."
            );
            return;
        }

        setSubmitting(true);

        try {
            const fd = new FormData();
            fd.append("name", serviceName);
            fd.append("about", about);
            const numericPrice = String(price).replace(/[^\d.-]/g, "");
            fd.append("price", numericPrice === "" ? "0" : numericPrice);
            fd.append("availability", availability);
            // arrays serialized as JSON
            fd.append("instructions", JSON.stringify(instructions));
            fd.append("slots", JSON.stringify(slots));

            if (imageFile) {
                fd.append("image", imageFile);
            } else if (removeImage) {
                fd.append("removeImage", "true");
            }

            const url = serviceId
                ? `${API_BASE}/api/services/${serviceId}`
                : `${API_BASE}/api/services`;
            const method = serviceId ? "PUT" : "POST";

            const res = await fetch(url, { method, body: fd });
            const data = await res.json().catch(() => null);

            if (!res.ok) {
                const msg = data?.message || `Server error (${res?.status || "?"})`;
                showToast("error", "Save Failed", msg);
                setSubmitting(false);
                return;
            }

            showToast(
                "success",
                serviceId ? "Service Updated" : "Service Added",
                `${serviceName} saved with ${slots.length} slot(s).`
            );

            if (!serviceId) {
                resetForm();
                if (fileRef.current) fileRef.current.value = null;
            } else {
                const saved = data?.data || null;
                if (saved) {
                    setHasExistingImage(Boolean(saved.imageUrl));
                    setImagePreview(saved.imageUrl || null);
                    setImageFile(null);
                    setRemoveImage(false);
                }
            }
        } catch (err) {
            console.error("service submit error:", err);
            showToast("error", "Network error", "Could not reach server.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className={ads.container.main}>
            <div className={ads.toast.container}>
                {toast && (
                    <div className={`${ads.toast.toastBase} ${toast.type === "error"
                        ? ads.toast.toastError
                        : toast.type === "info"
                            ? ads.toast.toastInfo
                            : ads.toast.toastSuccess
                        } animate-slideIn`}
                    >
                        <div className={ads.toast.iconContainer(toast.type)}>
                            {toast.type === "error" ? (
                                <AlertTriangle className="w-5 h-5" />
                            ) : toast.type === "info" ? (
                                <Clock className="w-5 h-5" />
                            ) : (
                                <CheckCircle className="w-5 h-5" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className={ads.toast.title}>{toast.title}</div>
                            <div className={ads.toast.message}>{toast.message}</div>
                        </div>
                        <button onClick={() => setToast(null)}
                            className={ads.buttons.toastClose}>
                            <XCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </button>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className={ads.container.form}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                    <div>
                        <h1 className={ads.header.title}>
                            {serviceId ? "Edit Service" : "Add Service"}
                        </h1>
                        <p className={ads.header.subtitle}>
                            Create a beautiful service card with unique time slots
                        </p>
                    </div>
                    <div className={ads.headerActions}>
                        <button type="button" onClick={resetForm} className={ads.buttons.reset}>
                            Reset
                        </button>
                        <button type="submit" disabled={submitting} className={ads.buttons.submit}>
                            {submitting ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin">
                                    Saving...
                                </div>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    {serviceId ? "Update Service" : "Save Service"}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Left side */}
                <div className={ads.grids.main}>
                    <div className="lg:col-span-1 md:col-span-1 flex flex-col items-center">
                        <div className={ads.imageUpload.container(errors.image)}>
                            <div className={ads.imageUpload.preview}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className={ads.imageUpload.placeholder}>
                                        <Image className="w-10 h-10" />
                                        <div className="mt-2 text-sm">Service image (required)</div>
                                    </div>
                                )}
                            </div>

                            <div className="w-full flex gap-2 items-center">
                                <input type="file" accept="image/*" ref={fileRef}
                                    onChange={handleImageChange} className="hidden"
                                />
                                <button type="button" onClick={() => fileRef.current?.click()}
                                    className={ads.buttons.uploadImage}
                                    disabled={submitting}
                                >
                                    <Plus className="w-4 h-4" />{" "}
                                    {imagePreview ? "Replace Image" : "Upload Image"}
                                </button>

                                {(imagePreview || hasExistingImage) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // If current preview is a blob URL, revoke it
                                            if (imagePreview && imagePreview.startsWith("blob:")) {
                                                try {
                                                    URL.revokeObjectURL(imagePreview);
                                                } catch (err) { }
                                            }
                                            setImagePreview(null);
                                            setImageFile(null);
                                            // mark that user wants to remove the existing image
                                            if (hasExistingImage) {
                                                setRemoveImage(true);
                                                setHasExistingImage(false);
                                            }
                                            if (fileRef.current) fileRef.current.value = null;
                                        }}
                                        className={ads.buttons.removeImage}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                )}

                            </div>

                            {hasExistingImage && (
                                <div className="w-full text-xs text-gray-600 mt-2 flex items-center gap-2">
                                    <input
                                        id="remove-img"
                                        type="checkbox"
                                        checked={removeImage}
                                        onChange={(e) => {
                                            setRemoveImage(Boolean(e.target.checked));
                                            if (e.target.checked) {
                                                setImagePreview(null);
                                                setImageFile(null);
                                                setHasExistingImage(false);
                                            }
                                        }}
                                        className="rounded"
                                    />
                                    <label htmlFor="remove-img">Remove existing image</label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="lg:col-span-2 md:col-span-1 col-span-1 space-y-6">
                        <div className={ads.grids.formFields}>
                            <div>
                                <label className={ads.labels.standard}>
                                    Service name
                                </label>
                                <input
                                    value={serviceName}
                                    onChange={(e) => setServiceName(e.target.value)}
                                    placeholder="e.g. General Consultation"
                                    className={ads.formFields.input(errors.serviceName)}
                                />
                            </div>

                            <div>
                                <label className={ads.labels.standard}>
                                    Price
                                </label>
                                <input
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="₹ 499"
                                    className={ads.formFields.input(errors.price)}
                                    inputMode="numeric"
                                />

                                <div className="mt-3">
                                    <label className={ads.labels.standard}>
                                        Availability
                                    </label>
                                    <select
                                        value={availability}
                                        onChange={(e) => setAvailability(e.target.value)}
                                        className={ads.formFields.select}
                                    >
                                        <option value="available">Available</option>
                                        <option value="unavailable">Unavailable</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={ads.labels.standard}>
                                About this service
                            </label>
                            <textarea
                                value={about}
                                onChange={(e) => setAbout(e.target.value)}
                                placeholder="Short description"
                                rows={4}
                                className={ads.formFields.textarea(errors.about)}
                            />
                        </div>

                        {/* instructions */}
                        <div>
                            <div className="flex items-center justify-between">
                                <label className={ads.labels.standard}>
                                    Instructions (point wise)
                                </label>
                                <button
                                    type="button"
                                    onClick={addInstruction}
                                    className={ads.buttons.addInstruction}
                                >
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </div>

                            <div
                                className={ads.instructions.container(errors.instructions)}
                            >
                                {instructions.map((ins, idx) => (
                                    <div
                                        key={idx}
                                        className={ads.instructions.item}
                                    >
                                        <div className={ads.icon.number}>
                                            {idx + 1}.
                                        </div>
                                        <input
                                            value={ins}
                                            onChange={(e) => updateInstruction(idx, e.target.value)}
                                            placeholder={`Instruction ${idx + 1}`}
                                            className={ads.instructions.input}
                                        />
                                        {instructions.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeInstruction(idx)}
                                                className={ads.instructions.removeButton}
                                            >
                                                <Trash2 className={ads.icon.removeInstruction} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* slot controls */}
                        <div
                            className={ads.slots.container(errors.slots)}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                                    <Calendar className="w-5 h-5" /> Slots & Schedule
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-sm text-gray-500">
                                        {slots.length} slot{slots.length !== 1 ? "s" : ""} added
                                    </div>
                                </div>
                            </div>

                            <div className={ads.grids.timeGrid}>
                                <div className="min-w-0">
                                    <label className={ads.labels.small}>Day</label>
                                    <select
                                        value={slotDay}
                                        onChange={(e) => setSlotDay(e.target.value)}
                                        className={ads.formFields.smallSelect}
                                    >
                                        {days.map((d) => {
                                            const dNum = Number(d);
                                            const disabled =
                                                Number(slotYear) === currentYear &&
                                                Number(slotMonth) === currentMonth &&
                                                dNum < currentDate;
                                            return (
                                                <option key={d} value={d} disabled={disabled}>
                                                    {d}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <div className="min-w-0">
                                    <label className={ads.labels.small}>Month</label>
                                    <select
                                        value={slotMonth}
                                        onChange={(e) => setSlotMonth(e.target.value)}
                                        className={ads.formFields.smallSelect}
                                    >
                                        {months.map((m, idx) => {
                                            const disabled =
                                                Number(slotYear) === currentYear && idx < currentMonth;
                                            return (
                                                <option key={m} value={String(idx)} disabled={disabled}>
                                                    {m}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <div className="min-w-0">
                                    <label className={ads.labels.small}>Year</label>
                                    <select
                                        value={slotYear}
                                        onChange={(e) => setSlotYear(e.target.value)}
                                        className={ads.formFields.smallSelect}
                                    >
                                        {years.map((y) => (
                                            <option key={y} value={String(y)}>
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={ads.grids.timeSubGrid}>
                                    <div className="min-w-0">
                                        <label className={ads.labels.small}>Hour</label>
                                        <select
                                            value={slotHour}
                                            onChange={(e) => setSlotHour(e.target.value)}
                                            className={ads.formFields.timeSelect}
                                        >
                                            {hours.map((h) => (
                                                <option key={h} value={h}>
                                                    {h}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="min-w-0">
                                        <label className={ads.labels.small}>Minute</label>
                                        <select
                                            value={slotMinute}
                                            onChange={(e) => setSlotMinute(e.target.value)}
                                            className={ads.formFields.timeSelect}
                                        >
                                            {minutes.map((m) => (
                                                <option key={m} value={m}>
                                                    {m}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="min-w-0">
                                        <label className={ads.labels.small}>AM/PM</label>
                                        <select
                                            value={slotAmPm}
                                            onChange={(e) => setSlotAmPm(e.target.value)}
                                            className={ads.formFields.ampmSelect}
                                        >
                                            {ampm.map((a) => (
                                                <option key={a} value={a}>
                                                    {a}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <button
                                    type="button"
                                    onClick={addSlot}
                                    className={ads.buttons.addSlot}
                                >
                                    <Plus className="w-4 h-4" /> Add This Time Slot
                                </button>
                            </div>

                            <div>
                                <div className="text-xs text-gray-500 mb-2">
                                    Added Slots ({slots.length})
                                </div>

                                <div className={ads.grids.slotsGrid}>
                                    {slots.length === 0 ? (
                                        <div className="text-sm text-gray-400 italic px-4 py-2">
                                            No slots added yet. Select a time and click "Add This Time Slot"
                                        </div>
                                    ) : (
                                        slots.map((s, idx) => (
                                            <div
                                                key={s}
                                                className={ads.slots.slotItem}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Clock className={ads.icon.clock} />
                                                    <div className={ads.slots.slotText}>
                                                        {s}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeSlot(idx)}
                                                    className={ads.buttons.slotRemove}
                                                >
                                                    <Trash2 className={ads.icon.trash} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </form>

            <style>{ads.customCSS}</style>
        </div>
    );
};

export default AddServicePage;