import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Settings from "./Settings";
import BillingAndInvoices from "./BillingAndInvoices";
import EditProfile from "./EditProfile";
import {
  fetchProfileData,
  updateProfile,
  updateSettings,
  type ProfileData,
  type BillingData,
  type SettingsData
} from "./data/typesprofile";

type ActiveSection = "profile" | "billing" | "settings" | "editProfile";

export default function Profile() {
  const navigate = useNavigate();
  const isNestedInAccount = location.pathname.startsWith("/accounts");
  const [activeSection, setActiveSection] = useState<ActiveSection>("profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // State for API data
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        const response = await fetchProfileData();

        if (response.success && response.data) {
          setProfile(response.data.profile);
          setBilling(response.data.billing ?? null);
          setSettings(response.data.settings ?? null);
        } else {
          setError("Failed to load profile data");
        }
      } catch (err) {
        setError("An error occurred while fetching profile data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  // Update profile function
  const handleUpdateProfile = async (updatedData: Partial<ProfileData>) => {
    try {
      setLoading(true);
      const response = await updateProfile(updatedData);

      if (response.success && response.data) {
        setProfile(response.data.profile);
        setActiveSection("profile"); // Switch back to profile view after update
      } else {
        setError("Failed to update profile");
      }
    } catch (err) {
      setError("An error occurred while updating profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update settings function
  const handleUpdateSettings = async (updatedData: Partial<SettingsData>) => {
    try {
      setLoading(true);
      const response = await updateSettings(updatedData);

      if (response.success && response.data) {
        setSettings(response.data.settings ?? null);
      } else {
        setError("Failed to update settings");
      }
    } catch (err) {
      setError("An error occurred while updating settings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('.sidebar');
      const menuButton = document.querySelector('.menu-button');

      if (isMobile &&
        isSidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        menuButton &&
        !menuButton.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSectionClick = (section: ActiveSection) => {
    setActiveSection(section);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Loading state
  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Mobile Header */}
      <div className="lg:hidden sm:mt-0 mt-[-6vw] top-0 left-0 right-0 z-40 bg-white px-4  flex items-center h-16 border-gray-200">
        <svg
          className="w-6 h-6 cursor-pointer"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          onClick={() => navigate("/user_dashboard", { replace: true })}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.9067 3.69177C12.9691 3.74521 13.0203 3.81042 13.0574 3.88366C13.0946 3.9569 13.1169 4.03674 13.1232 4.11862C13.1294 4.2005 13.1195 4.28281 13.094 4.36085C13.0684 4.43889 13.0277 4.51113 12.9742 4.57344L8.32339 10.0001L12.9742 15.4268C13.0758 15.5533 13.1242 15.7144 13.1091 15.8759C13.0941 16.0374 13.0169 16.1868 12.8937 16.2924C12.7706 16.398 12.6112 16.4516 12.4492 16.4419C12.2873 16.4321 12.1355 16.3598 12.0259 16.2401L7.02589 10.4068C6.92884 10.2935 6.87549 10.1493 6.87549 10.0001C6.87549 9.85095 6.92884 9.70671 7.02589 9.59344L12.0259 3.76011C12.1338 3.63443 12.2872 3.55672 12.4523 3.54407C12.6175 3.53141 12.7809 3.58484 12.9067 3.69261"
            fill="#1A212F"
          />
        </svg>
        <span onClick={() => navigate("/user_dashboard", { replace: true })} className="cursor-pointer"> Go Back</span>
      </div>

      <div className="flex">
        {/* Overlay for mobile sidebar */}
        {!isNestedInAccount && isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-opacity-50 z-50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        {!isNestedInAccount && (
          <div className={`
            sidebar fixed lg:relative top-0 left-0 h-full lg:h-auto
            w-[280px] lg:w-[300px] flex-shrink-0 
            border-r border-[rgba(26,30,47,0.4)] 
            bg-white z-50 lg:z-auto
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            flex flex-col pb-7
            ${isMobile ? 'pt-5' : 'pt-6 lg:pt-0'}
          `}>



            {/* Go Dashboard button */}
            <div className="px-4 lg:px-10 pt-4">
              <button
                onClick={() => navigate("/user_dashboard", { replace: true })}
                className="flex items-center gap-2 py-3 w-full bg-[#174CD2] hover:bg-[#123a9c] text-white rounded-lg justify-center mb-2 transition-colors"
                style={{ fontWeight: 600, fontSize: '18px' }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>
                Go Dashboard
              </button>
            </div>
            {/* Go back to dashboard */}
            <div className="px-4 lg:px-10">
              <button
                onClick={() => navigate("/user_dashboard", { replace: true })}
                className="flex items-center gap-2 py-3 lg:py-10 lg:pb-[60px] w-full"
              >
                <i className="ri-arrow-left-line"></i>
                <span className="text-[#1A212F] cursor-pointer font-semibold text-xl leading-[93%]">
                  Go Back
                </span>
              </button>
            </div>

            {/* Navigation Items */}
            <div className="flex flex-col lg:gap-3 gap-5 flex-1 mt-10 lg:mt-0 px-4 lg:px-0">



              {/* Profile */}
              <button
                onClick={() => handleSectionClick("profile")}
                className={`flex items-center cursor-pointer gap-3 px-4 lg:px-10 py-4 lg:py-5 w-full ${activeSection === "profile" ? "bg-[rgba(23,76,210,0.06)]" : "hover:bg-gray-50"
                  }`}
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.9974 8.33317C11.8383 8.33317 13.3307 6.84079 13.3307 4.99984C13.3307 3.15889 11.8383 1.6665 9.9974 1.6665C8.15645 1.6665 6.66406 3.15889 6.66406 4.99984C6.66406 6.84079 8.15645 8.33317 9.9974 8.33317Z"
                    stroke={activeSection === "profile" ? "#174CD2" : "#1A212F"}
                    strokeWidth="1.25"
                  />
                  <path
                    d="M16.6693 14.5833C16.6693 16.6541 16.6693 18.3333 10.0026 18.3333C3.33594 18.3333 3.33594 16.6541 3.33594 14.5833C3.33594 12.5124 6.32094 10.8333 10.0026 10.8333C13.6843 10.8333 16.6693 12.5124 16.6693 14.5833Z"
                    stroke={activeSection === "profile" ? "#174CD2" : "#1A212F"}
                    strokeWidth="1.25"
                  />
                </svg>
                <span className={`flex-1 text-left font-semibold text-base ${activeSection === "profile" ? "text-[#174CD2]" : "text-[rgba(26,33,47,0.7)]"
                  }`}>
                  Profile
                </span>
              </button>

              {/* Billing and Invoices */}
              <button
                onClick={() => handleSectionClick("billing")}
                className={`flex items-center cursor-pointer gap-3 px-4 lg:px-10 py-4 lg:py-5 w-full ${activeSection === "billing" ? "bg-[rgba(23,76,210,0.06)]" : "hover:bg-gray-50"
                  }`}
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.91667 1.0415H14.0842C14.9317 1.0415 15.515 1.0415 16.0058 1.2115C16.4645 1.37374 16.8795 1.63945 17.2189 1.98803C17.5582 2.33661 17.8127 2.75868 17.9625 3.2215C18.1258 3.719 18.125 4.31067 18.125 5.18817V16.9782C18.125 18.1998 16.6858 18.9265 15.7383 18.059C15.7079 18.0299 15.6675 18.0137 15.6254 18.0137C15.5833 18.0137 15.5429 18.0299 15.5125 18.059L15.1092 18.4273C14.3358 19.1357 13.1642 19.1357 12.3908 18.4273C12.2509 18.2966 12.0665 18.224 11.875 18.224C11.6835 18.224 11.4991 18.2966 11.3592 18.4273C10.5858 19.1357 9.41417 19.1357 8.64083 18.4273C8.50086 18.2966 8.3165 18.224 8.125 18.224C7.9335 18.224 7.74914 18.2966 7.60917 18.4273C6.83583 19.1357 5.66417 19.1357 4.89083 18.4273L4.48833 18.059C4.45789 18.0297 4.41727 18.0133 4.375 18.0133C4.33273 18.0133 4.29211 18.0297 4.26167 18.059C3.31417 18.9257 1.875 18.1998 1.875 16.9782V5.189C1.875 4.31067 1.875 3.719 2.0375 3.2215C2.18734 2.75868 2.4418 2.33661 2.78113 1.98803C3.12046 1.63945 3.53554 1.37374 3.99417 1.2115C4.48583 1.04067 5.06917 1.0415 5.91667 1.0415ZM6.0375 2.2915C5.02 2.2915 4.66917 2.29984 4.40417 2.39234C4.12741 2.49156 3.87718 2.65313 3.67286 2.86454C3.46853 3.07594 3.31558 3.33152 3.22583 3.6115C3.13333 3.89317 3.12583 4.26484 3.12583 5.30817V16.9782C3.12583 17.0782 3.175 17.1382 3.2375 17.1673C3.26602 17.1809 3.29781 17.1861 3.32917 17.1823C3.36289 17.1766 3.39402 17.1606 3.41833 17.1365C3.67909 16.8965 4.02057 16.7632 4.375 16.7632C4.72943 16.7632 5.07091 16.8965 5.33167 17.1365L5.73417 17.5048C5.87414 17.6355 6.0585 17.7082 6.25 17.7082C6.4415 17.7082 6.62586 17.6355 6.76583 17.5048C7.1362 17.1636 7.62139 16.9741 8.125 16.9741C8.62861 16.9741 9.1138 17.1636 9.48417 17.5048C9.62414 17.6355 9.8085 17.7082 10 17.7082C10.1915 17.7082 10.3759 17.6355 10.5158 17.5048C10.8862 17.1636 11.3714 16.9741 11.875 16.9741C12.3786 16.9741 12.8638 17.1636 13.2342 17.5048C13.3741 17.6355 13.5585 17.7082 13.75 17.7082C13.9415 17.7082 14.1259 17.6355 14.2658 17.5048L14.6683 17.1365C14.9291 16.8965 15.2706 16.7632 15.625 16.7632C15.9794 16.7632 16.3209 16.8965 16.5817 17.1365C16.6175 17.1698 16.6483 17.1798 16.6717 17.1823C16.7028 17.186 16.7342 17.1808 16.7625 17.1673C16.825 17.1382 16.825 17.0773 16.825 16.9782V5.30817C16.825 4.26484 16.8167 3.89317 16.725 3.61067C16.635 3.33067 16.4817 3.07514 16.2771 2.86388C16.0725 2.65261 15.822 2.49126 15.545 2.39234C15.2808 2.30067 14.93 2.29234 13.9125 2.29234L6.0375 2.2915ZM5.20917 6.24984C5.20917 6.08408 5.27501 5.92511 5.39222 5.8079C5.50943 5.69069 5.66841 5.62484 5.83417 5.62484H6.25083C6.41659 5.62484 6.57556 5.69069 6.69277 5.8079C6.80998 5.92511 6.87583 6.08408 6.87583 6.24984C6.87583 6.4156 6.80998 6.57457 6.69277 6.69178C6.57556 6.80899 6.41659 6.87484 6.25083 6.87484H5.83417C5.66841 6.87484 5.50943 6.80899 5.39222 6.69178C5.27501 6.57457 5.20917 6.4156 5.20917 6.24984ZM8.12583 6.24984C8.12583 6.08408 8.19168 5.92511 8.30889 5.8079C8.4261 5.69069 8.58507 5.62484 8.75083 5.62484H14.1675C14.3333 5.62484 14.4922 5.69069 14.6094 5.8079C14.7267 5.92511 14.7925 6.08408 14.7925 6.24984C14.7925 6.4156 14.7267 6.57457 14.6094 6.69178C14.4922 6.80899 14.3333 6.87484 14.1675 6.87484H8.75083C8.58507 6.87484 8.4261 6.80899 8.30889 6.69178C8.19168 6.57457 8.12583 6.4156 8.12583 6.24984ZM5.20917 9.1665C5.20917 9.00074 5.27501 8.84177 5.39222 8.72456C5.50943 8.60735 5.66841 8.5415 5.83417 8.5415H6.25083C6.41659 8.5415 6.57556 8.60735 6.69277 8.72456C6.80998 8.84177 6.87583 9.00074 6.87583 9.1665C6.87583 9.33226 6.80998 9.49123 6.69277 9.60845C6.57556 9.72566 6.41659 9.7915 6.25083 9.7915H5.83417C5.66841 9.7915 5.50943 9.72566 5.39222 9.60845C5.27501 9.49123 5.20917 9.33226 5.20917 9.1665ZM8.12583 9.1665C8.12583 9.00074 8.19168 8.84177 8.30889 8.72456C8.4261 8.60735 8.58507 8.5415 8.75083 8.5415H14.1675C14.3333 8.5415 14.4922 8.60735 14.6094 8.72456C14.7267 8.84177 14.7925 9.00074 14.7925 9.1665C14.7925 9.33226 14.7267 9.49123 14.6094 9.60845C14.4922 9.72566 14.3333 9.7915 14.1675 9.7915H8.75083C8.58507 9.7915 8.4261 9.72566 8.30889 9.60845C8.19168 9.49123 8.12583 9.33226 8.12583 9.1665ZM5.20917 12.0832C5.20917 11.9174 5.27501 11.7584 5.39222 11.6412C5.50943 11.524 5.66841 11.4582 5.83417 11.4582H6.25083C6.41659 11.4582 6.57556 11.524 6.69277 11.6412C6.80998 11.7584 6.87583 11.9174 6.87583 12.0832C6.87583 12.2489 6.80998 12.4079 6.69277 12.5251C6.57556 12.6423 6.41659 12.7082 6.25083 12.7082H5.83417C5.66841 12.7082 5.50943 12.6423 5.39222 12.5251C5.27501 12.4079 5.20917 12.2489 5.20917 12.0832ZM8.12583 12.0832C8.12583 11.9174 8.19168 11.7584 8.30889 11.6412C8.4261 11.524 8.58507 11.4582 8.75083 11.4582H14.1675C14.3333 11.4582 14.4922 11.524 14.6094 11.6412C14.7267 11.7584 14.7925 11.9174 14.7925 12.0832C14.7925 12.2489 14.7267 12.4079 14.6094 12.5251C14.4922 12.6423 14.3333 12.7082 14.1675 12.7082H8.75083C8.58507 12.7082 8.4261 12.6423 8.30889 12.5251C8.19168 12.4079 8.12583 12.2489 8.12583 12.0832Z"
                    fill={activeSection === "billing" ? "#174CD2" : "rgba(26, 33, 47, 0.7)"}
                  />
                </svg>
                <span className={`flex-1 text-left font-semibold text-base ${activeSection === "billing" ? "text-[#174CD2]" : "text-[rgba(26,33,47,0.7)]"
                  }`}>
                  Billing and Invoices
                </span>
              </button>

              {/* Settings */}
              <button
                onClick={() => handleSectionClick("settings")}
                className={`flex items-center cursor-pointer gap-3 px-4 lg:px-10 py-4 lg:py-5 w-full ${activeSection === "settings" ? "bg-[rgba(23,76,210,0.06)]" : "hover:bg-gray-50"
                  }`}
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.91406 11.6668C8.5771 11.6668 9.21299 11.9302 9.68183 12.3991C10.1507 12.8679 10.4141 13.5038 10.4141 14.1668C10.4141 14.8299 10.1507 15.4658 9.68183 15.9346C9.21299 16.4034 8.5771 16.6668 7.91406 16.6668C7.25102 16.6668 6.61514 16.4034 6.1463 15.9346C5.67745 15.4658 5.41406 14.8299 5.41406 14.1668C5.41406 13.5038 5.67745 12.8679 6.1463 12.3991C6.61514 11.9302 7.25102 11.6668 7.91406 11.6668ZM12.0807 3.3335C11.7524 3.3335 11.4273 3.39816 11.124 3.5238C10.8207 3.64943 10.5451 3.83358 10.313 4.06573C10.0808 4.29788 9.89667 4.57347 9.77103 4.87679C9.64539 5.1801 9.58073 5.50519 9.58073 5.8335C9.58073 6.1618 9.64539 6.48689 9.77103 6.7902C9.89667 7.09352 10.0808 7.36912 10.313 7.60126C10.5451 7.83341 10.8207 8.01756 11.124 8.1432C11.4273 8.26883 11.7524 8.3335 12.0807 8.3335C12.7438 8.3335 13.3797 8.0701 13.8485 7.60126C14.3173 7.13242 14.5807 6.49654 14.5807 5.8335C14.5807 5.17045 14.3173 4.53457 13.8485 4.06573C13.3797 3.59689 12.7438 3.3335 12.0807 3.3335Z"
                    stroke={activeSection === "settings" ? "#174CD2" : "rgba(26, 33, 47, 0.7)"}
                    strokeOpacity={activeSection === "settings" ? "1" : "0.7"}
                    strokeWidth="1.25"
                  />
                  <path
                    d="M12.4974 14.1326H18.3307M7.4974 5.79932H1.66406M1.66406 14.1326H3.33073M18.3307 5.79932H16.6641"
                    stroke={activeSection === "settings" ? "#174CD2" : "rgba(26, 33, 47, 0.7)"}
                    strokeOpacity={activeSection === "settings" ? "1" : "0.7"}
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                </svg>
                <span className={`flex-1 text-left font-semibold text-base ${activeSection === "settings" ? "text-[#174CD2]" : "text-[rgba(26,33,47,0.7)]"
                  }`}>
                  Settings
                </span>
              </button>

              {/* Logout */}
              <button
                onClick={() => navigate("/")}
                className="flex items-center cursor-pointer gap-3 px-4 lg:px-10 py-4 lg:py-5 w-full hover:bg-gray-50"
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.4525 1.0415C11.3133 1.0415 10.3942 1.0415 9.67168 1.139C8.92168 1.239 8.29001 1.45567 7.78834 1.9565C7.35168 2.394 7.13001 2.9315 7.01418 3.56317C6.90168 4.17734 6.88001 4.92817 6.87501 5.82984C6.87412 5.9956 6.93913 6.15492 7.05571 6.27276C7.1723 6.39059 7.33092 6.45729 7.49668 6.45817C7.66244 6.45905 7.82176 6.39405 7.93959 6.27747C8.05743 6.16088 8.12412 6.00226 8.12501 5.8365C8.13001 4.92567 8.15334 4.27984 8.24334 3.789C8.33084 3.31734 8.47001 3.04317 8.67251 2.84067C8.90334 2.60984 9.22751 2.45984 9.83918 2.37734C10.4683 2.29317 11.3025 2.2915 12.4983 2.2915H13.3317C14.5283 2.2915 15.3625 2.29317 15.9917 2.37734C16.6033 2.45984 16.9267 2.61067 17.1583 2.84067C17.3883 3.0715 17.5383 3.39484 17.6208 4.00734C17.7058 4.63567 17.7067 5.47067 17.7067 6.6665V13.3332C17.7067 14.529 17.7058 15.3632 17.6208 15.9932C17.5383 16.6048 17.3883 16.9282 17.1575 17.159C16.9267 17.3898 16.6033 17.5398 15.9917 17.6223C15.3625 17.7065 14.5283 17.7082 13.3317 17.7082H12.4983C11.3025 17.7082 10.4683 17.7065 9.83834 17.6223C9.22751 17.5398 8.90334 17.389 8.67251 17.159C8.47001 16.9557 8.33084 16.6823 8.24334 16.2107C8.15334 15.7198 8.13001 15.074 8.12501 14.1632C8.12457 14.0811 8.10797 13.9999 8.07616 13.9242C8.04434 13.8486 7.99794 13.7799 7.93959 13.7222C7.88125 13.6645 7.8121 13.6188 7.73611 13.5878C7.66011 13.5568 7.57875 13.5411 7.49668 13.5415C7.4146 13.5419 7.33341 13.5585 7.25775 13.5904C7.18209 13.6222 7.11344 13.6686 7.05571 13.7269C6.99798 13.7853 6.95231 13.8544 6.92131 13.9304C6.8903 14.0064 6.87457 14.0878 6.87501 14.1698C6.88001 15.0715 6.90168 15.8223 7.01418 16.4365C7.13084 17.0682 7.35168 17.6057 7.78918 18.0432C8.29001 18.5448 8.92251 18.7598 9.67251 18.8615C10.3942 18.9582 11.3133 18.9582 12.4525 18.9582H13.3775C14.5175 18.9582 15.4358 18.9582 16.1583 18.8615C16.9083 18.7598 17.54 18.5448 18.0417 18.0432C18.5433 17.5415 18.7583 16.9098 18.86 16.1598C18.9567 15.4373 18.9567 14.5182 18.9567 13.379V6.62067C18.9567 5.4815 18.9567 4.56234 18.86 3.83984C18.7592 3.08984 18.5433 2.45817 18.0417 1.9565C17.54 1.45484 16.9083 1.23984 16.1583 1.139C15.4358 1.0415 14.5167 1.0415 13.3775 1.0415H12.4525Z"
                    fill="#CE2823"
                  />
                  <path
                    d="M12.4979 9.37506C12.6636 9.37506 12.8226 9.44091 12.9398 9.55812C13.057 9.67533 13.1229 9.8343 13.1229 10.0001C13.1229 10.1658 13.057 10.3248 12.9398 10.442C12.8226 10.5592 12.6636 10.6251 12.4979 10.6251H3.35369L4.98786 12.0251C5.11384 12.1329 5.19181 12.2864 5.20463 12.4517C5.21744 12.6171 5.16405 12.7807 5.05619 12.9067C4.94834 13.0327 4.79486 13.1107 4.62951 13.1235C4.46417 13.1363 4.30051 13.0829 4.17453 12.9751L1.25786 10.4751C1.18925 10.4164 1.13416 10.3435 1.09639 10.2615C1.05862 10.1795 1.03906 10.0903 1.03906 10.0001C1.03906 9.90978 1.05862 9.82057 1.09639 9.73857C1.13416 9.65658 1.18925 9.58373 1.25786 9.52506L4.17453 7.02506C4.23691 6.97165 4.30919 6.93106 4.38726 6.90559C4.46532 6.88012 4.54764 6.87028 4.62951 6.87663C4.71138 6.88297 4.7912 6.90538 4.86441 6.94257C4.93762 6.97977 5.00279 7.03101 5.05619 7.09339C5.1096 7.15577 5.15019 7.22806 5.17566 7.30612C5.20113 7.38419 5.21097 7.46651 5.20463 7.54838C5.19828 7.63025 5.17587 7.71007 5.13868 7.78328C5.10149 7.85649 5.05024 7.92165 4.98786 7.97506L3.35453 9.37506H12.4979Z"
                    fill="#CE2823"
                  />
                </svg>
                <span className="flex-1 text-left text-[#CE2823] font-semibold text-base">
                  Logout
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col px-4 sm:px-6 lg:px-10 xl:px-10 py-7 pt-20 lg:pt-12 min-h-screen overflow-x-hidden">
          {/* Loading indicator for specific sections */}
          {loading && activeSection !== "profile" && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Page Title - Hidden on mobile, shown on desktop */}
          <h1 className="hidden lg:block text-[#1A212F] text-[32px] lg:text-[40px]
           font-normal leading-normal tracking-[-0.64px] lg:tracking-[-0.8px] mb-6 lg:mb-10">
            {activeSection === "profile" && "Profile"}
            {activeSection === "billing" && "Billing and Invoices"}
            {activeSection === "settings" && "Settings"}
            {activeSection === "editProfile" && "Edit Profile"}
          </h1>

          {/* Profile Section */}
          {activeSection === "profile" && profile && (
            <div className="flex flex-col sm:ml-10 justify-start items-start gap-5 w-full max-w-4xl ">
              {/* Profile Picture */}
              <div className="w-32 h-32 lg:w-40 lg:h-40 flex justify-center items-center rounded-xl bg-[rgba(0,0,0,0.04)] self-center lg:self-start">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <svg
                    className="w-[48px] h-[48px] lg:w-[68px] lg:h-[68px] flex-shrink-0"
                    width="68"
                    height="68"
                    viewBox="0 0 68 68"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M33.9974 28.3334C40.2566 28.3334 45.3307 23.2593 45.3307 17.0001C45.3307 10.7409 40.2566 5.66675 33.9974 5.66675C27.7382 5.66675 22.6641 10.7409 22.6641 17.0001C22.6641 23.2593 27.7382 28.3334 33.9974 28.3334Z"
                      fill="#1A212F"
                      fillOpacity="0.4"
                    />
                    <path
                      d="M56.6693 49.5833C56.6693 56.6241 56.6693 62.3333 34.0026 62.3333C11.3359 62.3333 11.3359 56.6241 11.3359 49.5833C11.3359 42.5424 21.4849 36.8333 34.0026 36.8333C46.5203 36.8333 56.6693 42.5424 56.6693 49.5833Z"
                      fill="#1A212F"
                      fillOpacity="0.4"
                    />
                  </svg>
                )}
              </div>

              {/* Profile Information */}
              <div className="flex flex-col items-start gap-5 w-full max-w-full lg:max-w-[357px]">
                {/* Name */}
                <div className="flex flex-col items-start gap-2 self-stretch rounded-lg">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[#1A212F] text-xl lg:text-2xl font-bold leading-normal">
                      {profile.name}
                    </h2>
                    <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Active
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Member since {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="h-px self-stretch bg-[rgba(0,0,0,0.08)]"></div>

                {/* Contact Info */}
                <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-12 w-full">
                  {/* Phone */}
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.6174 13.3333C11.4938 13.3333 10.3418 13.052 9.1614 12.4893C7.98095 11.9266 6.88229 11.1366 5.8654 10.1193C4.85651 9.1024 4.07073 8.00574 3.50806 6.82929C2.9454 5.65285 2.66406 4.50307 2.66406 3.37996C2.66406 3.17996 2.73073 3.01107 2.86406 2.87329C2.9974 2.73551 3.16406 2.66663 3.36406 2.66663H5.01273C5.19406 2.66663 5.35228 2.72374 5.4874 2.83796C5.62251 2.95218 5.71384 3.09863 5.7614 3.27729L6.09206 4.86663C6.12317 5.05329 6.11762 5.21618 6.0754 5.35529C6.03317 5.4944 5.95917 5.6084 5.8534 5.69729L4.39073 7.06129C4.66451 7.55774 4.96695 7.51907 5.29806 7.94529C5.62917 8.37152 5.98251 8.77529 6.35806 9.15663C6.74473 9.5433 7.16117 9.9033 7.6074 10.2366C8.05362 10.5695 8.5434 10.8837 9.07673 11.1793L10.5027 9.728C10.6112 9.6111 10.7332 9.534 10.8687 9.49663C11.0038 9.45974 11.1536 9.4524 11.3181 9.47463L12.7201 9.7613C12.9014 9.8057 13.0485 9.8971 13.1614 10.0353C13.2743 10.1735 13.3307 10.3317 13.3307 10.51V12.1333C13.3307 12.3333 13.2618 12.5 13.1241 12.6333C12.9863 12.7666 12.8174 12.8333 12.6174 12.8333Z"
                        fill="#1A212F"
                        fillOpacity="0.7"
                      />
                    </svg>
                    <span className="text-[rgba(26,33,47,0.7)] text-sm lg:text-base font-normal leading-normal truncate">
                      {profile.phone}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.66927 13.3333C2.3026 13.3333 1.98883 13.2028 1.72794 12.942C1.46705 12.6811 1.33638 12.3671 1.33594 12V3.99996C1.33594 3.63329 1.4666 3.31951 1.72794 3.05863C1.98927 2.79774 2.30305 2.66707 2.66927 2.66663H13.3359C13.7026 2.66663 14.0166 2.79729 14.2779 3.05863C14.5393 3.31996 14.6697 3.63374 14.6693 3.99996V12C14.6693 12.3666 14.5388 12.6806 14.2779 12.942C14.017 13.2033 13.703 13.3337 13.3359 13.3333H2.66927ZM8.0026 8.66663L13.3359 5.33329V3.99996L8.0026 7.33329L2.66927 3.99996V5.33329L8.0026 8.66663Z"
                        fill="#1A212F"
                      />
                    </svg>
                    <span className="text-[rgba(26,33,47,0.7)] text-sm lg:text-base font-normal leading-normal truncate">
                      {profile.email}
                    </span>
                  </div>
                </div>

                <div className="h-px self-stretch bg-[rgba(0,0,0,0.08)]"></div>

                {/* Address */}
                <div className="text-[rgba(26,33,47,0.7)] text-sm lg:text-base font-normal leading-normal">
                  {profile.address}
                </div>

                <div className="h-px self-stretch bg-[rgba(0,0,0,0.08)]"></div>

                {/* Edit Profile Button */}
                <button
                  onClick={() => setActiveSection("editProfile")}
                  className="flex h-11 px-6 lg:px-10 py-3 justify-center items-center gap-1 self-stretch rounded-lg border border-[#174CD2] hover:bg-blue-50 transition-colors"
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_716_11825)">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9.8407 1.74732C10.4261 1.16189 11.2201 0.833008 12.048 0.833008C12.8759 0.833008 13.6699 1.16189 14.2554 1.74732C14.8408 2.33274 15.1697 3.12674 15.1697 3.95465C15.1697 4.78256 14.8408 5.57656 14.2554 6.16198L7.93136 12.486C7.57003 12.8473 7.35803 12.0593 7.1207 12.244C6.84159 12.4627 6.54159 12.6482 6.2207 12.8007C5.95003 12.9293 5.6647 13.0246 5.1807 13.186L2.95936 13.926L2.4247 14.1047C2.21205 14.1756 1.98383 14.186 1.76563 14.1345C1.54743 14.0831 1.34788 13.9718 1.18936 13.8133C1.03084 13.6548 0.919613 13.4552 0.868155 13.237C0.816697 13.0189 0.827042 12.7906 0.89803 12.578L1.8167 9.8226C1.97803 9.338 2.07336 9.0526 2.20203 8.78132C2.35492 8.46132 2.54047 8.16132 2.7587 7.88132C2.9427 7.64532 3.15536 7.43265 3.5167 7.07132L9.8407 1.74732ZM2.93603 13.8806L4.83003 13.2486C5.35736 13.0726 5.58136 12.9973 5.79003 12.898C6.04425 12.7762 6.2827 12.6289 6.50536 12.456C6.68736 12.3133 6.85536 12.1473 7.2487 11.754L12.2954 6.70732C11.6034 6.46213 10.9753 6.06482 10.4574 5.54465C9.93768 5.02654 9.54083 4.39845 9.29603 3.70665L4.24936 8.75332C3.85603 9.14598 3.68936 9.31332 3.54736 9.49598C3.37403 9.71821 3.2267 9.95665 3.10536 10.2113C3.00603 10.42 2.9307 10.644 2.7547 11.1713L2.1227 13.0667L2.93603 13.8806ZM10.106 2.89532C10.1294 3.01198 10.1674 3.17065 10.232 3.35532C10.4271 3.91335 10.7462 4.41984 11.1654 4.83665C11.582 5.25574 12.0882 5.57486 12.646 5.76998C12.8314 5.83465 12.99 5.87265 13.1067 5.89598L13.548 5.45465C13.9436 5.05634 14.1651 4.51751 14.1641 3.95619C14.1631 3.39486 13.9397 2.85681 13.5428 2.45989C13.1459 2.06297 12.6078 2.03955 12.0465 2.03857C11.4852 2.03759 10.9463 2.05912 10.548 2.45465L10.106 2.89532Z"
                        fill="#174CD2"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_716_11825">
                        <rect width="16" height="16" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  <span className="text-[#174CD2] font-semibold text-sm lg:text-base leading-[93%]">
                    Edit profile
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Billing and Invoices Section */}
          {activeSection === "billing" && billing && (
            <div className="w-full sm:mt-[0px] mt-[-50px] sm:max-w-8xl">
              <BillingAndInvoices billingData={billing} />
            </div>
          )}

          {/* Settings Section */}
          {activeSection === "settings" && settings && (
            <div className="w-full max-w-6xl">
              <Settings
                settingsData={settings}
                onUpdateSettings={handleUpdateSettings}
                loading={loading}
              />
            </div>
          )}

          {/* Edit Profile Section */}
          {activeSection === "editProfile" && profile && (
            <div className="w-full mt-[-120px] sm:mt-[-50px] sm:ml-[-100px] max-w-6xl">
              <EditProfile
                profileData={profile}
                onUpdateProfile={handleUpdateProfile}
                onCancel={() => setActiveSection("profile")}
                loading={loading}
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Mobile Sidebar Toggle Button */}
        {!isNestedInAccount && !isSidebarOpen && isMobile && (
          <button
            onClick={toggleSidebar}
            className="lg:hidden fixed bottom-6 right-6 flex items-center justify-center w-12 h-12 bg-[#174CD2] text-white rounded-full shadow-lg z-30"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}