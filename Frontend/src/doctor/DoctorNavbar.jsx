import React, { useMemo, useState } from "react";
import { navbarStylesDr as nsd } from "../assets/dummyStyles";
import logo from '../assets/logo.png';
import { NavLink, useLocation, useParams } from "react-router-dom";
import { Calendar, Edit, Home, LogOut, Menu, X } from "lucide-react";

const STORAGE_KEY = "doctorToken_v1";

const DoctorNavbar = () => {
    const [open, setOpen] = useState(false);
    const params = useParams();
    const location = useLocation();

    // Use useMemo to extract doctor ID from URL
    const doctorId = useMemo(() => {
        if (params?.id) return params.id;
        const m = location.pathname.match(/\/doctor-admin\/([^/]+)/);
        if (m) return m[1];
        return null;
    }, [params, location.pathname]);

    const basePath = doctorId
        ? `/doctor-admin/${doctorId}`
        : "/doctor-admin/login";

    const navItems = [
        { name: "Dashboard", to: `${basePath}`, Icon: Home },
        { name: "Appointments", to: `${basePath}/appointments`, Icon: Calendar },
        { name: "Edit Profile", to: `${basePath}/profile/edit`, Icon: Edit },
    ];

    const handleLogout = () => {
        localStorage.removeItem(STORAGE_KEY);
        window.location.href = "/doctor-admin/login";
    };

    return (
        <>
            <nav className={nsd.navContainer}>
                <div className={nsd.leftBrand}>
                    <div className={nsd.logoContainer}>
                        <img src={logo} alt="logo" className={nsd.logoImage} />
                    </div>
                    <div className={nsd.brandTextContainer}>
                        <div className={nsd.brandTitle}>MedTek</div>
                        <div className={nsd.brandSubtitle}>Healthcare Solutions</div>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className={nsd.desktopMenu}>
                    <div className={nsd.desktopMenuItems}>
                        {navItems.map(({ name, to, Icon }) => (
                            <NavLink key={to} to={to} end={to === basePath}
                                className={({ isActive }) =>
                                    `${nsd.baseLink} ${isActive ? nsd.activeLink : nsd.inactiveLink}`
                                }
                            >
                                <span className={nsd.linkContent}>
                                    <Icon size={16} className={nsd.linkIcon} />
                                    <span className={nsd.linkText}>{name}</span>
                                </span>
                            </NavLink>
                        ))}
                    </div>
                </div>

                <div className={nsd.rightActions}>
                    <button onClick={() => handleLogout()} className={nsd.logoutButtonDesktop}>
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>

                    {/* To Toggle */}
                    <button
                        onClick={() => setOpen((s) => !s)}
                        className={nsd.hamburgerButtonMd}
                    >
                        {open ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <button
                        onClick={() => setOpen((s) => !s)}
                        className={nsd.hamburgerButtonLg}
                    >
                        {open ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </nav>

            <div className={nsd.mobileMenuContainer(open)}>
                <div className={nsd.mobileMenuContent}>
                    {navItems.map(({ name, to, Icon }) => (
                        <NavLink key={to} to={to} end={to === basePath}
                            className={({ isActive }) => `${nsd.mobileBaseLink} ${isActive ? nsd.activeLink : nsd.inactiveLink}`}
                            onClick={() => setOpen(false)}
                        >
                            <Icon size={18} className="text-emerald-400" />
                            <span>{name}</span>
                        </NavLink>
                    ))}

                    <button onClick={() => {
                        setOpen(false);
                        handleLogout();
                    }}
                        className={nsd.mobileLogoutButton}
                        type="button"
                    >
                        <div className={nsd.mobileLogoutContent}>
                            <LogOut size={18} />
                            <span>Logout</span>
                        </div>
                    </button>
                </div>
            </div>

            <div className={nsd.spacer}></div>
        </>
    );
};

export default DoctorNavbar;