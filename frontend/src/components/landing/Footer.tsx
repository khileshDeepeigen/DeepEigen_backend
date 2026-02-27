import svgPaths from "../imports/svg";
import { Link } from "react-router-dom";
import "./footer.css";
import logo_svg from "../../assets/Logo/logo-white.png";
import SocialIcons from "../footer/SocialIcons";

const Logo = () => (
    <Link to="/" className="flex items-center gap-3">
        <img src={logo_svg} alt="Deep Eigen AI Labs" className="w-35 h-auto" />
        
    </Link>
);

const FooterLeft = () => (
    <div className="footer__left">
        <Logo />
        <div className="footer__description">
            <p>
                Deep Eigen is an education platform providing access to graduate level
                courses related to artificial intelligence and autonomous driving, with
                an aim to provide quality content at a level similar to top universities
                around the world.
            </p>
            <p>
                Deep Eigen AI Labs conducts foundational research at the intersection
                of Physical AI and Applied Mathematics, exploring the principles that
                govern learning, perception, and embodied intelligence.
            </p>
        </div>
        <SocialIcons />
    </div>
);

const FooterLinks = () => (
    <div className="footer__links">
        <div className="footer__section">
            <h4>Deep Eigen AI Labs</h4>
            <div className="footer__list">
                <p>
                    <Link to="/about-us">
                        About Us
                    </Link>
                </p>
                <p>
                    <Link to="/courses">
                        Courses
                    </Link>
                </p>
                <p>
                    <Link to="/team">
                        Team
                    </Link>
                </p>
                <p>
                    <Link to="/contactus">
                        Contact
                    </Link>
                </p>
            </div>
        </div>
        <div className="footer__section">
            <h4>Quick Links</h4>
            <div className="footer__list">
                <p>
                    <Link to="/faqs">
                        FAQs
                    </Link>
                </p>
                <p>
                    <Link to="/pricing">
                        Pricing
                    </Link>
                </p>
                <p>
                    <Link to="/terms_conditions">
                        Terms of service
                    </Link>
                </p>
                <p>
                    <Link to="/privacy_policy">
                        Privacy Policy
                    </Link>
                </p>
                <Link to="/sitemap">
                        SiteMap
                    </Link>
                <p>Subscribe</p>
            </div>
        </div>
    </div>
);

const FooterBackground = () => (
    <div className="footer__background">
        <svg viewBox="0 0 1725 628" fill="none" preserveAspectRatio="none">
            <g filter="url(#blurFilter)" opacity="0.52">
                <path d={svgPaths.p209d9980} fill="url(#gradient)" />
            </g>
            <defs>
                <filter id="blurFilter" x="0" y="0" width="1724" height="627">
                    <feGaussianBlur stdDeviation="40" />
                </filter>
                   <linearGradient id="gradient" x1="1107" y1="548" x2="178" y2="126">
                    <stop stopColor="#25083bff" stopOpacity="0" />
                    <stop offset="1" stopColor="#7310BE" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

const Footer = () => {
    return (
        <footer className="footer">
            <FooterBackground />
            <div className="footer__content">
                <FooterLeft />
                <FooterLinks />
            </div>
            <div className="footer__copyright-container">
                <p className="footer__copyright">
                    © <span>Deep Eigen</span> Private lLimited. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;