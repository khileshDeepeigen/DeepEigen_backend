
import { useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/auth";
import { logoutUser } from "./data/typesprofile";

type ActiveSection = "profile" | "billing" | "settings";

export default function AccountLayout() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Determine active section based on current URL
    const getActiveSection = (): ActiveSection => {
        if (location.pathname.includes("billing") || location.pathname.includes("billings_invoices")) {
            return "billing";
        } else if (location.pathname.includes("settings")) {
            return "settings";
        }
        return "profile";
    };

    const activeSection = getActiveSection();

    const handleSectionClick = (section: ActiveSection) => {
        if (section === "profile") {
            navigate("/accounts/profile");
        } else if (section === "billing") {
            navigate("/accounts/billings_invoices");
        } else if (section === "settings") {
            navigate("/accounts/settings");
        }
        // Auto-close sidebar on mobile
        setIsSidebarOpen(false);
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        try {
            // Call the backend logout API
            await logoutUser();

            // Clear Redux state
            dispatch(logout());

            // Navigate to home page
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Logout error:", error);
            // Even on error, clear local state and redirect
            dispatch(logout());
            navigate("/", { replace: true });
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
            <div className="min-h-screen bg-white relative">
            {/* Mobile Header - hide back button */}
            <div className="lg:hidden top-0 left-0 right-0 z-40 bg-white px-4 py-3 flex items-center h-16 border-gray-200">
                {/* No back button for improved mobile UI */}
            </div>

            <div className="flex">
                {/* Sidebar toggle button for mobile */}
                <button
                    className="sidebar-toggle lg:hidden absolute text-2xl bg-blue-200 w-12 h-12  rounded-full top-[90vh] fixed left-[80vw] z-50"
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Open sidebar"
                >
                    <span className="hamburger-icon">&#9776;</span>
                </button>

                {/* Overlay for mobile sidebar */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div className={`sidebar fixed lg:relative top-0 left-0 h-full lg:h-auto w-[280px] lg:w-[300px] flex-shrink-0 border-r border-[rgba(26,30,47,0.4)] bg-white z-50 lg:z-auto transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col pb-7 pt-6 lg:pt-0`}>
                    {/* Close button for mobile sidebar */}
                    <button
                        className="close-sidebar lg:hidden absolute top-8 text-3xl right-4 z-50"
                        onClick={() => setIsSidebarOpen(false)}
                        aria-label="Close sidebar"
                    >
                        &times;
                    </button>
                    {/* ...existing sidebar content... */}
                    <div className="px-4 lg:px-10">
                        <button
                            onClick={() => navigate("/user_dashboard", { replace: true })}
                            className="flex items-center gap-2 py-3 lg:py-10 lg:pb-[60px] w-full"
                        >
                            <i className="ri-arrow-left-s-line  text-2xl"></i>
                            <span className="text-[#1A212F] cursor-pointer font-semibold text-xl leading-[93%]">
                                Go Back
                            </span>
                        </button>
                    </div>
                    <div className="flex flex-col lg:gap-3 gap-5 flex-1 mt-10 lg:mt-0 px-4 lg:px-0">
                        {/* Profile */}
                        <button
                            onClick={() => handleSectionClick("profile")}
                            className={`flex items-center cursor-pointer gap-3 px-4 lg:px-10 py-4 lg:py-5 w-full ${activeSection === "profile" ? "bg-[rgba(23,76,210,0.06)]" : "hover:bg-gray-50"}`}
                        >
                            <svg className="w-5 h-5 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M9.9974 8.33317C11.8383 8.33317 13.3307 6.84079 13.3307 4.99984C13.3307 3.15889 11.8383 1.6665 9.9974 1.6665C8.15645 1.6665 6.66406 3.15889 6.66406 4.99984C6.66406 6.84079 8.15645 8.33317 9.9974 8.33317Z" stroke={activeSection === "profile" ? "#174CD2" : "#1A212F"} strokeWidth="1.25" />
                                <path d="M16.6693 14.5833C16.6693 16.6541 16.6693 18.3333 10.0026 18.3333C3.33594 18.3333 3.33594 16.6541 3.33594 14.5833C3.33594 12.5124 6.32094 10.8333 10.0026 10.8333C13.6843 10.8333 16.6693 12.5124 16.6693 14.5833Z" stroke={activeSection === "profile" ? "#174CD2" : "#1A212F"} strokeWidth="1.25" />
                            </svg>
                            <span className={`flex-1 text-left font-semibold text-base ${activeSection === "profile" ? "text-[#174CD2]" : "text-[rgba(26,33,47,0.7)]"}`}>
                                Profile
                            </span>
                        </button>
                        {/* ...existing navigation items... */}
                        {/* Billing and Invoices */}
                        <button
                            onClick={() => handleSectionClick("billing")}
                            className={`flex items-center cursor-pointer gap-3 px-4 lg:px-10 py-4 lg:py-5 w-full ${activeSection === "billing" ? "bg-[rgba(23,76,210,0.06)]" : "hover:bg-gray-50"}`}
                        >
                            <svg className="w-5 h-5 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path fillRule="evenodd" clipRule="evenodd" d="M5.91667 1.0415H14.0842C14.9317 1.0415 15.515 1.0415 16.0058 1.2115C16.4645 1.37374 16.8795 1.63945 17.2189 1.98803C17.5582 2.33661 17.8127 2.75868 17.9625 3.2215C18.1258 3.719 18.125 4.31067 18.125 5.18817V16.9782C18.125 18.1998 16.6858 18.9265 15.7383 18.059C15.7079 18.0299 15.6675 18.0137 15.6254 18.0137C15.5833 18.0137 15.5429 18.0299 15.5125 18.059L15.1092 18.4273C14.3358 19.1357 13.1642 19.1357 12.3908 18.4273C12.2509 18.2966 12.0665 18.224 11.875 18.224C11.6835 18.224 11.4991 18.2966 11.3592 18.4273C10.5858 19.1357 9.41417 19.1357 8.64083 18.4273C8.50086 18.2966 8.3165 18.224 8.125 18.224C7.9335 18.224 7.74914 18.2966 7.60917 18.4273C6.83583 19.1357 5.66417 19.1357 4.89083 18.4273L4.48833 18.059C4.45789 18.0297 4.41727 18.0133 4.375 18.0133C4.33273 18.0133 4.29211 18.0297 4.26167 18.059C3.31417 18.9257 1.875 18.1998 1.875 16.9782V5.189C1.875 4.31067 1.875 3.719 2.0375 3.2215C2.18734 2.75868 2.4418 2.33661 2.78113 1.98803C3.12046 1.63945 3.53554 1.37374 3.99417 1.2115C4.48583 1.04067 5.06917 1.0415 5.91667 1.0415Z" fill={activeSection === "billing" ? "#174CD2" : "rgba(26, 33, 47, 0.7)"} />
                            </svg>
                            <span className={`flex-1 text-left font-semibold text-base ${activeSection === "billing" ? "text-[#174CD2]" : "text-[rgba(26,33,47,0.7)]"}`}>
                                Billing and Invoices
                            </span>
                        </button>
                        {/* Settings */}
                        <button
                            onClick={() => handleSectionClick("settings")}
                            className={`flex items-center cursor-pointer gap-3 px-4 lg:px-10 py-4 lg:py-5 w-full ${activeSection === "settings" ? "bg-[rgba(23,76,210,0.06)]" : "hover:bg-gray-50"}`}
                        >
                            <svg className="w-5 h-5 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M7.91406 11.6668C8.5771 11.6668 9.21299 11.9302 9.68183 12.3991C10.1507 12.8679 10.4141 13.5038 10.4141 14.1668C10.4141 14.8299 10.1507 15.4658 9.68183 15.9346C9.21299 16.4034 8.5771 16.6668 7.91406 16.6668C7.25102 16.6668 6.61514 16.4034 6.1463 15.9346C5.67745 15.4658 5.41406 14.8299 5.41406 14.1668C5.41406 13.5038 5.67745 12.8679 6.1463 12.3991C6.61514 11.9302 7.25102 11.6668 7.91406 11.6668ZM12.0807 3.3335C11.7524 3.3335 11.4273 3.39816 11.124 3.5238C10.8207 3.64943 10.5451 3.83358 10.313 4.06573C10.0808 4.29788 9.89667 4.57347 9.77103 4.87679C9.64539 5.1801 9.58073 5.50519 9.58073 5.8335C9.58073 6.1618 9.64539 6.48689 9.77103 6.7902C9.89667 7.09352 10.0808 7.36912 10.313 7.60126C10.5451 7.83341 10.8207 8.01756 11.124 8.1432C11.4273 8.26883 11.7524 8.3335 12.0807 8.3335C12.7438 8.3335 13.3797 8.0701 13.8485 7.60126C14.3173 7.13242 14.5807 6.49654 14.5807 5.8335C14.5807 5.17045 14.3173 4.53457 13.8485 4.06573C13.3797 3.59689 12.7438 3.3335 12.0807 3.3335Z" stroke={activeSection === "settings" ? "#174CD2" : "rgba(26, 33, 47, 0.7)"} strokeOpacity={activeSection === "settings" ? "1" : "0.7"} strokeWidth="1.25" />
                                <path d="M12.4974 14.1326H18.3307M7.4974 5.79932H1.66406M1.66406 14.1326H3.33073M18.3307 5.79932H16.6641" stroke={activeSection === "settings" ? "#174CD2" : "rgba(26, 33, 47, 0.7)"} strokeOpacity={activeSection === "settings" ? "1" : "0.7"} strokeWidth="1.25" strokeLinecap="round" />
                            </svg>
                            <span className={`flex-1 text-left font-semibold text-base ${activeSection === "settings" ? "text-[#174CD2]" : "text-[rgba(26,33,47,0.7)]"}`}>
                                Settings
                            </span>
                        </button>
                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="flex items-center cursor-pointer gap-3 px-4 lg:px-10 py-4 lg:py-5 w-full hover:bg-gray-50 disabled:opacity-50"
                        >
                            <svg className="w-5 h-5 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M12.4525 1.0415C11.3133 1.0415 10.3942 1.0415 9.67168 1.139C8.92168 1.239 8.29001 1.45567 7.78834 1.9565C7.35168 2.394 7.13001 2.9315 7.01418 3.56317C6.90168 4.17734 6.88001 4.92817 6.87501 5.82984C6.87412 5.9956 6.93913 6.15492 7.05571 6.27276C7.1723 6.39059 7.33092 6.45729 7.49668 6.45817C7.66244 6.45905 7.82176 6.39405 7.93959 6.27747C8.05743 6.16088 8.12412 6.00226 8.12501 5.8365C8.13001 4.92567 8.15334 4.27984 8.24334 3.789C8.33084 3.31734 8.47001 3.04317 8.67251 2.84067C8.90334 2.60984 9.22751 2.45984 9.83918 2.37734C10.4683 2.29317 11.3025 2.2915 12.4983 2.2915H13.3317C14.5283 2.2915 15.3625 2.29317 15.9917 2.37734C16.6033 2.45984 16.9267 2.61067 17.1583 2.84067C17.3883 3.0715 17.5383 3.39484 17.6208 4.00734C17.7058 4.63567 17.7067 5.47067 17.7067 6.6665V13.3332C17.7067 14.529 17.7058 15.3632 17.6208 15.9932C17.5383 16.6048 17.3883 16.9282 17.1575 17.159C16.9267 17.3898 16.6033 17.5398 15.9917 17.6223C15.3625 17.7065 14.5283 17.7082 13.3317 17.7082H12.4983C11.3025 17.7082 10.4683 17.7065 9.83834 17.6223C9.22751 17.5398 8.90334 17.389 8.67251 17.159C8.47001 16.9557 8.33084 16.6823 8.24334 16.2107C8.15334 15.7198 8.13001 15.074 8.12501 14.1632C8.12457 14.0811 8.10797 13.9999 8.07616 13.9242C8.04434 13.8486 7.99794 13.7799 7.93959 13.7222C7.88125 13.6645 7.8121 13.6188 7.73611 13.5878C7.66011 13.5568 7.57875 13.5411 7.49668 13.5415C7.4146 13.5419 7.33341 13.5585 7.25775 13.5904C7.18209 13.6222 7.11344 13.6686 7.05571 13.7269C6.99798 13.7853 6.95231 13.8544 6.92131 13.9304C6.8903 14.0064 6.87457 14.0878 6.87501 14.1698C6.88001 15.0715 6.90168 15.8223 7.01418 16.4365C7.13084 17.0682 7.35168 17.6057 7.78918 18.0432C8.29001 18.5448 8.92251 18.7598 9.67251 18.8615C10.3942 18.9582 11.3133 18.9582 12.4525 18.9582H13.3775C14.5175 18.9582 15.4358 18.9582 16.1583 18.8615C16.9083 18.7598 17.54 18.5448 18.0417 18.0432C18.5433 17.5415 18.7583 16.9098 18.86 16.1598C18.9567 15.4373 18.9567 14.5182 18.9567 13.379V6.62067C18.9567 5.4815 18.9567 4.56234 18.86 3.83984C18.7592 3.08984 18.5433 2.45817 18.0417 1.9565C17.54 1.45484 16.9083 1.23984 16.1583 1.139C15.4358 1.0415 14.5167 1.0415 13.3775 1.0415H12.4525Z" fill="#CE2823" />
                                <path d="M12.4979 9.37506C12.6636 9.37506 12.8226 9.44091 12.9398 9.55812C13.057 9.67533 13.1229 9.8343 13.1229 10.0001C13.1229 10.1658 13.057 10.3248 12.9398 10.442C12.8226 10.5592 12.6636 10.6251 12.4979 10.6251H3.35369L4.98786 12.0251C5.11384 12.1329 5.19181 12.2864 5.20463 12.4517C5.21744 12.6171 5.16405 12.7807 5.05619 12.9067C4.94834 13.0327 4.79486 13.1107 4.62951 13.1235C4.46417 13.1363 4.30051 13.0829 4.17453 12.9751L1.25786 10.4751C1.18925 10.4164 1.13416 10.3435 1.09639 10.2615C1.05862 10.1795 1.03906 10.0903 1.03906 10.0001C1.03906 9.90978 1.05862 9.82057 1.09639 9.73857C1.13416 9.65658 1.18925 9.58373 1.25786 9.52506L4.17453 7.02506C4.23691 6.97165 4.30919 6.93106 4.38726 6.90559C4.46532 6.88012 4.54764 6.87028 4.62951 6.87663C4.71138 6.88297 4.7912 6.90538 4.86441 6.94257C4.93762 6.97977 5.00279 7.03101 5.05619 7.09339C5.1096 7.15577 5.15019 7.22806 5.17566 7.30612C5.20113 7.38419 5.21097 7.46651 5.20463 7.54838C5.19828 7.63025 5.17587 7.71007 5.13868 7.78328C5.10149 7.85649 5.05024 7.92165 4.98786 7.97506L3.35453 9.37506H12.4979Z" fill="#CE2823" />
                            </svg>
                            <span className="flex-1 text-left text-[#CE2823] font-semibold text-base">
                                {isLoggingOut ? "Logging out..." : "Logout"}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col px-4 sm:px-6 lg:px-10 xl:px-10  lg:pt-12 min-h-screen overflow-x-hidden">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

