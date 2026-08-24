import React from "react";
import { footerStyles as fs } from "../assets/dummyStyles";
import logo from "../assets/logo.png"
import { Stethoscope, Activity, Phone, Mail, MapPin, ArrowRight, Send } from "lucide-react";

// Inline SVG social icons
const Facebook = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);
const Twitter = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);
const Instagram = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
);
const Linkedin = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);
const Youtube = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const quickLinks = [
        { name: "Home", href: "/" },
        { name: "Doctors", href: "/doctors" },
        { name: "Services", href: "/services" },
        { name: "Contact", href: "/contact" },
        { name: "Appointments", href: "/appointments" },
    ];

    const services = [
        { name: "Blood Pressure Check", href: "/services" },
        { name: "Blood Sugar Test", href: "/services" },
        { name: "Full Blood Count", href: "/services" },
        { name: "X-Ray Scan", href: "/services" },
    ];

    const socialLinks = [
        {
            Icon: Facebook,
            color: fs.facebookColor,
            name: "Facebook",
            href: "https://www.facebook.com/people/Hexagon-Digital-Services/61567156598660/",
        },
        {
            Icon: Twitter,
            color: fs.twitterColor,
            name: "Twitter",
            href: "https://www.linkedin.com/company/hexagondigtial-services/",
        },
        {
            Icon: Instagram,
            color: fs.instagramColor,
            name: "Instagram",
            href: "http://instagram.com/hexagondigitalservices?igsh=MWp2NG1oNTlibWVnZA%3D%3D",
        },
        {
            Icon: Linkedin,
            color: fs.linkedinColor,
            name: "LinkedIn",
            href: "https://www.linkedin.com/company/hexagondigtial-services/",
        },
        {
            Icon: Youtube,
            color: fs.youtubeColor,
            name: "YouTube",
            href: "https://youtube.com/@hexagondigitalservices?si=lxEFYNCP42t6AoDJ",
        },
    ];


    return (
        <footer className={fs.footerContainer}>
            <div className={fs.floatingIcon1}>
                <Stethoscope className={fs.stethoscopeIcon} />
            </div>
            <div className={fs.floatingIcon2} style={{
                animationDelay: "3s"
            }}>
                <Activity className={fs.activityIcon} />
            </div>

            <div className={fs.mainContent}>
                <div className={fs.gridContainer}>
                    <div className={fs.companySection}>
                        <div className={fs.logoContainer}>
                            <div className={fs.logoWrapper}>
                                <div className={fs.logoImageContainer}>
                                    <img src={logo} alt={logo} className={fs.logoImage} />
                                </div>
                            </div>

                            <div>
                                <h1 className={fs.companyName}>Medicare</h1>
                                <p className={fs.companyTagline}>Healthcare Solutions</p>
                            </div>
                        </div>

                        <p className={fs.companyDescription}>
                            Your trusted partner in Healthcare Solutions. We'are commited to provide exceptional healthcare services tailored to meet the needs of our patients.
                        </p>

                        <div className={fs.contactContainer}>
                            <div className={fs.contactItem}>
                                <div className={fs.contactIconWrapper}>
                                    <Phone className={fs.contactIcon} />
                                </div>
                                <span className={fs.contactText}>+91 99999 99999</span>
                            </div>
                            <div className={fs.contactItem}>
                                <div className={fs.contactIconWrapper}>
                                    <Mail className={fs.contactIcon} />
                                </div>
                                <span className={fs.contactText}>medicare@gmail.com</span>
                            </div>
                            <div className={fs.contactItem}>
                                <div className={fs.contactIconWrapper}>
                                    <MapPin className={fs.contactIcon} />
                                </div>
                                <span className={fs.contactText}>Kolkata, West Bengal</span>
                            </div>


                        </div>

                    </div>

                    {/* Quick Links */}
                    <div className={fs.linksSection}>
                        <h3 className={fs.sectionTitle}>Quick Links</h3>
                        <ul className={fs.linksList}>
                            {quickLinks.map((link, i) => (
                                <li key={link.name} className={fs.linkItem}>
                                    <a href={link.href}
                                        className={fs.quickLink}
                                        style={{
                                            animationDelay: `${i * 60}ms`
                                        }}
                                    >
                                        <div className={fs.quickLinkIconWrapper}>
                                            <ArrowRight className={fs.quickLinkIcon} />
                                        </div>
                                        <span>{link.name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={fs.linksSection}>
                        <h3 className={fs.sectionTitle}>Our Servics</h3>
                        <ul className={fs.linksList}>
                            {services.map((service, i) => (
                                <li key={service.name}>
                                    <a href={service.href}
                                        className={fs.serviceLink}
                                    >
                                        <div className={fs.serviceIcon}></div>
                                        <span>{service.name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter & Social */}
                    <div className={fs.newsletterSection}>
                        <h3 className={fs.newsletterTitle}>Stay Connected</h3>
                        <p className={fs.newsletterDescription}>
                            Subscribe for health tips, medical updates, and wellness insights delivered
                            to your inbox.
                        </p>

                        {/* Newsletter form */}
                        <div className={fs.newsletterForm}>
                            <div className={fs.mobileNewsletterContainer}>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className={fs.emailInput}
                                />
                                <button className={fs.mobileSubscribeButton}>
                                    <Send className={fs.mobileButtonIcon} />
                                    Subscribe
                                </button>
                            </div>

                            {/* Desktop newsletter */}
                            <div className={fs.desktopNewsletterContainer}>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className={fs.desktopEmailInput}
                                />
                                <button className={fs.desktopSubscribeButton}>
                                    <Send className={fs.desktopButtonIcon} />
                                    <span className={fs.desktopButtonText}>Subscribe</span>
                                </button>
                            </div>

                            {/* Social icons */}
                            <div className={fs.socialContainer}>
                                {socialLinks.map(({ Icon, color, name, href }, index) => (
                                    <a
                                        key={name}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={fs.socialLink}
                                        style={{ animationDelay: `${index * 120}ms` }}
                                    >
                                        <div className={fs.socialIconBackground} />
                                        <Icon className={`${fs.socialIcon} ${color}`} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={fs.bottomSection}>
                    <div className={fs.copyright}>
                        <span>&copy;{currentYear} MediCare Healthcare . All rights reserved.</span>
                    </div>
                    <div className={fs.designerText}>
                        <span>Desinged By Suvodip Howladar</span>
                    </div>
                </div>
            </div>

            <style>{fs.animationStyles}</style>
        </footer>
    );
};

export default Footer;