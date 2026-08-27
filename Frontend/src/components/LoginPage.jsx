import React, { useState } from "react";
import { loginPageStyles as lps, toastStyles as ts } from "../assets/dummyStyles";
import logo from '../assets/logo.png';
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const STORAGE_KEY = "doctorToken_v1";

const LoginPage = () => {
    const API_BASE = import.meta.env.VITE_API_BASE;

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [busy, setBusy] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData((s) => ({
            ...s,
            [e.target.name]: e.target.value
        }));
    }

    // Login
    const handleLogin = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            toast.error("All fields are required", { style: ts.error });
            return;
        }

        setBusy(true);
        try {
            const res = await fetch(`${API_BASE}/api/doctors/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const json = await res.json().catch(() => null);

            if (!res.ok) {
                toast.error(json?.message || "Login failed", { duration: 4000 });
                setBusy(false);
                return;
            }
            const token = json?.token || json?.data?.token;
            if (!token) {
                toast.error("Authentication token missing");
                setBusy(false);
                return;
            }

            const doctorId =
                json?.data?._id || json?.doctor?._id || json?.data?.doctor?._id;
            if (!doctorId) {
                toast.error("Doctor ID missing from server response");
                setBusy(false);
                return;
            }

            localStorage.setItem(STORAGE_KEY, token);
            window.dispatchEvent(
                new StorageEvent("storage", { key: STORAGE_KEY, newValue: token }),
            );
            toast.success("Login successful — redirecting...", {
                style: ts.successToast,
            });
            setTimeout(() => {
                navigate(`/doctor-admin/${doctorId}`);
            }, 700);

        } catch (err) {
            console.error("login error", err);
            toast.error("Network error during login");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className={lps.mainContainer}>
            <Toaster position="top-right" reverseOrder={false} />
            <button onClick={() => navigate("/")} className={lps.backButton}>
                <ArrowLeft className={lps.backButtonIcon} />
                Back to Home
            </button>

            <div className={lps.loginCard}>
                <div className={lps.logoContainer}>
                    <img src={logo} alt="Logo" className={lps.logo} />
                </div>

                <h2 className={lps.title}>Doctor Admin</h2>
                <p className={lps.subtitle}>Sign in to manage your profile & schedule</p>

                <form onSubmit={handleLogin} className={lps.form}>
                    <input type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={lps.input}
                        placeholder="Enter your Email Address"
                        required
                    />
                    <input type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={lps.input}
                        placeholder="Enter your password"
                    />
                    <button type="submit" disabled={busy} className={lps.submitButton}>
                        {busy ? "Signing in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;