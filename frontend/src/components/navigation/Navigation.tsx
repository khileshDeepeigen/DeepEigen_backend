// import { useState, useEffect, useRef } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import type { RootState } from "../../redux/store";
// import { logout } from "../../redux/slices/auth";
// import { logoutUser } from "../userDashboard/data/typesprofile";
// import logo_svg from "../../assets/Logo/logo-black.png";

// export default function Navigation() {
//   const COURSES = [
//     { id: 1, name: "AI-1.0Z: Introduction to Fundamentals of Machine Learning", href: "/course_details" },
//     { id: 2, name: "CV-1.0X: Introduction to Computer Vision", href: "/course_computer" },
//     { id: 3, name: "RL-1.0Y: Fundamentals of Reinforcement Learning", href: "/course_Reinforcement_Learning" },
//     { id: 4, name: "CV-2.0X: Introduction to Visual Odometry and Mapping", href: "/course_details" },
//     { id: 5, name: "GenAI-1.0X: Generative AI", href: "/course_details" },
//     { id: 6, name: "MO-1.0x: Introduction to Mathematical Optimization", href: "/course_details" },
//     { id: 8, name: "Courses", href: "/courses" },
//   ];

//   const COMPANY = [
//     { id: 1, name: "Media", href: "/media" },
//     { id: 2, name: "Career", href: "/career" },
//     { id: 3, name: "Contact Us", href: "/contactus" },
//   ];

//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const user = useSelector((state: RootState) => state.auth.user);
//   const location = useLocation();

//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [coursesOpen, setCoursesOpen] = useState(false);
//   const [isLoggingOut, setIsLoggingOut] = useState(false);
//   const mobileMenuRef = useRef<HTMLDivElement>(null);

//   // New states for user dropdown only
//   const [desktopUserOpen, setDesktopUserOpen] = useState(false);
//   const desktopUserRef = useRef<HTMLDivElement>(null);

//   // Handle logout with API call
//   const handleLogout = async () => {
//     if (isLoggingOut) return;

//     setIsLoggingOut(true);
//     try {
//       // Call the backend logout API
//       await logoutUser();

//       // Clear Redux state
//       dispatch(logout());

//       // Navigate to home page
//       navigate("/", { replace: true });
//     } catch (error) {
//       console.error("Logout error:", error);
//       // Even on error, clear local state and redirect
//       dispatch(logout());
//       navigate("/", { replace: true });
//     } finally {
//       setIsLoggingOut(false);
//       setMobileOpen(false);
//     }
//   };

//   // Close mobile menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         mobileMenuRef.current &&
//         !mobileMenuRef.current.contains(event.target as Node) &&
//         mobileOpen
//       ) {
//         setMobileOpen(false);
//       }

//       // Close desktop user dropdown
//       if (
//         desktopUserRef.current &&
//         !desktopUserRef.current.contains(event.target as Node) &&
//         desktopUserOpen
//       ) {
//         setDesktopUserOpen(false);
//       }
//     };

//     // Prevent scrolling when mobile menu is open
//     if (mobileOpen) {
//       document.body.style.overflow = 'hidden';
//       document.addEventListener('mousedown', handleClickOutside);
//     } else {
//       document.body.style.overflow = 'auto';
//     }

//     return () => {
//       document.body.style.overflow = 'auto';
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [mobileOpen, desktopUserOpen]);

//   // Close mobile menu when route changes
//   useEffect(() => {
//     setMobileOpen(false);
//     setDesktopUserOpen(false);
//   }, [location.pathname]);

//   return (
//     <nav className="w-full bg-white border-b border-gray-200 z-50 relative">
//       <div className="mx-auto flex justify-between items-center sm:px-[10vw] px-4 py-6">
//         {/* Logo */}
//         <Link to="/" className="flex items-center gap-3">
//           <img src={logo_svg} alt="" className="w-35 h-auto" />
//         </Link>

//         {/* Desktop Menu */}
//         <div className="hidden lg:flex items-center gap-8">
//           {/* Courses Dropdown */}
//           <div className="relative group">
//             <Link to="/courses">
//               <button className="flex items-center gap-1 text-gray-800 hover:text-blue-600 font-medium">
//                 Courses
//                 <svg
//                   className="w-4 h-4 transition-transform group-hover:rotate-180"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   viewBox="0 0 24 24"
//                 >
//                   <path d="M19 9l-7 7-7-7" />
//                 </svg>
//               </button>
//             </Link>

//             <div className="absolute left-0 hidden group-hover:block bg-white shadow-lg rounded-lg mt-0 w-80 py-3 z-50">
//               {COURSES.map((course) => (
//                 <Link
//                   key={course.id}
//                   to={course.href}
//                   className="block px-4 py-2 text-gray-700 hover:bg-gray-200"
//                 >
//                   {course.name}
//                 </Link>73/courses
//               ))}
//             </div>
//           </div>

//           <Link to="/team" className="text-gray-800 hover:text-blue-600 font-medium">Team</Link>
//           <Link to="/pricing" className="text-gray-800 hover:text-blue-600 font-medium">Pricing</Link>

//           {/* Company Dropdown */}
//           <div className="relative group">
//             <button className="flex items-center gap-1 text-gray-800 hover:text-blue-600 font-medium">
//               Company
//               <svg
//                 className="w-4 h-4 transition-transform group-hover:rotate-180"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 viewBox="0 0 24 24"
//               >
//                 <path d="M19 9l-7 7-7-7" />
//               </svg>
//             </button>
//             <div className="absolute left-0 hidden group-hover:block bg-white shadow-lg rounded-lg mt-0 w-48 py-3 z-50">
//               {COMPANY.map((item) => (
//                 <Link
//                   key={item.id}
//                   to={item.href}
//                   className="block px-4 py-2 text-gray-700 hover:bg-gray-200"
//                 >
//                   {item.name}
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Desktop Buttons */}
//         <div className="hidden lg:flex items-center gap-3">
//           {!user ? (
//             <>
//               <Link
//                 to="/login"
//                 className="px-5 py-2 border border-blue-600 text-blue-600 font-semibold rounded-md hover:bg-blue-600 hover:text-white transition"
//               >
//                 Login
//               </Link>

//               <Link
//                 to="/register"
//                 className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
//               >
//                 Register
//               </Link>
//             </>
//           ) : (
//             <div className="relative" ref={desktopUserRef}>
//               {/* Avatar + Name */}
//               <Link to="/accounts/profile"

//                 className="flex items-center bg-[#f1f5fd] gap-3 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
//               >
//                 <div className="bg-blue-600 text-white font-semibold w-10 h-10 rounded-full flex items-center justify-center">
//                   {"U"}
//                 </div>
//                 <div className="text-left leading-tight">
//                   <p className="font-semibold">John</p>
//                   <p className="text-sm text-gray-500">{user.email}</p>
//                 </div>

//               </Link>


//             </div>
//           )}
//         </div>

//         {/* Mobile Toggle Button */}
//         <button
//           className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
//           onClick={() => setMobileOpen(!mobileOpen)}
//         >
//           {mobileOpen ? (
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//               <path d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           ) : (
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//               <path d="M4 6h16M4 12h16M4 18h16" />
//             </svg>
//           )}
//         </button>
//       </div>

//       {mobileOpen && (
//         <>
//           {/* Overlay Background */}
//           <div
//             className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
//             onClick={() => setMobileOpen(false)}
//           />

//           {/* Mobile Menu Sidebar (RIGHT SIDE) */}
//           <div
//             ref={mobileMenuRef}
//             className="
//               fixed top-0 right-0
//               h-full w-full max-w-80
//               bg-white z-50 lg:hidden
//               transform transition-transform duration-500 ease-out
//             "
//             style={{
//               transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
//             }}
//           >
//             {/* Menu Header */}
//             <div className="flex items-center justify-between p-6 border-b border-gray-200">
//               <Link
//                 to="/"
//                 className="flex items-center gap-3"
//                 onClick={() => setMobileOpen(false)}
//               >
//                 <img
//                   src={logo_svg}
//                   alt="Deep Eigen AI Labs"
//                   className="w-35 h-auto"
//                 />
//               </Link>

//               <button
//                 onClick={() => setMobileOpen(false)}
//                 className="p-2 rounded-md hover:bg-gray-100 transition"
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-6 w-6"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   viewBox="0 0 24 24"
//                 >
//                   <path d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             {/* Menu Content */}
//             <div className="h-full overflow-y-auto p-6">
//               {/* User Info if logged in */}
//               {user && (
//                 <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//                   <div className="flex items-center gap-3">
//                     <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold">
//                       {"U"}
//                     </div>
//                     <div>
//                       <p className="font-semibold text-gray-800">John</p>
//                       <p className="text-sm text-gray-500">{user.email}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Menu Items */}
//               <div className="space-y-1">
//                 {/* Courses Dropdown (Keep as dropdown for mobile) */}
//                 <div className="border-b border-gray-100 pb-2">
//                   <button
//                     onClick={() => setCoursesOpen(!coursesOpen)}
//                     className="flex justify-between items-center w-full py-3 text-gray-800 font-medium hover:text-blue-600"
//                   >
//                     <span>Courses</span>
//                     <svg
//                       className={`w-4 h-4 transition-transform ${coursesOpen ? "rotate-180" : ""}`}
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       viewBox="0 0 24 24"
//                     >
//                       <path d="M19 9l-7 7-7-7" />
//                     </svg>
//                   </button>
//                   {coursesOpen && (
//                     <div className="pl-4 space-y-2 mb-3">
//                       {COURSES.map((course) => (
//                         <Link
//                           key={course.id}
//                           to={course.href}
//                           className="block py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md px-3"
//                           onClick={() => setMobileOpen(false)}
//                         >
//                           {course.name}
//                         </Link>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 {/* Team Link */}
//                 <Link
//                   to="/team"
//                   className="block py-3 text-gray-800 font-medium hover:text-blue-600 hover:bg-gray-50 rounded-md px-3 border-b border-gray-100"
//                   onClick={() => setMobileOpen(false)}
//                 >
//                   Team
//                 </Link>

//                 {/* Pricing Link */}
//                 <Link
//                   to="/pricing"
//                   className="block py-3 text-gray-800 font-medium hover:text-blue-600 hover:bg-gray-50 rounded-md px-3 border-b border-gray-100"
//                   onClick={() => setMobileOpen(false)}
//                 >
//                   Pricing
//                 </Link>

//                 {/* Company Items - Show directly without dropdown on mobile */}
//                 <div className="pb-2">
//                   <div className="space-y-2 pb-2 mb-3">
//                     {COMPANY.map((item) => (
//                       <Link
//                         key={item.id}
//                         to={item.href}
//                         className="block py-2 text-gray-900 border-b border-gray-100 hover:text-blue-600 hover:bg-gray-50 rounded-md px-3"
//                         onClick={() => setMobileOpen(false)}
//                       >
//                         {item.name}
//                       </Link>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Auth Buttons */}
//               <div className="mt-8 pt-6 border-t border-gray-200">
//                 {!user ? (
//                   <div className="space-y-3">
//                     <Link
//                       to="/login"
//                       className="block w-full text-center border border-blue-600 text-blue-600 font-semibold rounded-md py-3 hover:bg-blue-600 hover:text-white transition"
//                       onClick={() => setMobileOpen(false)}
//                     >
//                       Login
//                     </Link>

//                     <Link
//                       to="/register"
//                       className="block w-full text-center bg-blue-600 text-white font-semibold rounded-md py-3 hover:bg-blue-700 transition"
//                       onClick={() => setMobileOpen(false)}
//                     >
//                       Register
//                     </Link>
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                   <Link
//                       to="/accounts/profile"
//                       className="flex items-center gap-3 py-3 text-gray-700 hover:bg-gray-50 rounded-md px-3"
//                       onClick={() => setMobileOpen(false)}
//                     >
//                       <span>👤</span> Profile
//                     </Link>

//                     <button
//                       className="flex items-center gap-3 w-full text-left py-3 text-red-600 hover:bg-gray-50 rounded-md px-3 disabled:opacity-50"
//                       onClick={handleLogout}
//                       disabled={isLoggingOut}
//                     >
//                       <span>🚪</span> {isLoggingOut ? "Logging out..." : "Log out"}
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </nav>
//   );
// }

import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { logout } from "../../redux/slices/auth";
import { logoutUser } from "../userDashboard/data/typesprofile";
import logo_svg from "../../assets/Logo/logo-black.png";
import { API_BASE } from "../../utils/api";


// Define interface for course data
interface Course {
  id: number;
  title: string;
  url_link_name: string;
  category: string;
  duration: number;
  level: string;
  indian_fee: number;
  foreign_fee: number;
  course_image: string;
}

interface ApiResponse {
  success: boolean;
  title: string;
  description: string;
  canonical_url: string;
  course_flag: boolean;
  courses: Course[];
}

export default function Navigation() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // const response = await fetch("http://127.0.0.1:8000/courses/");
        const response = await fetch(`${API_BASE}/courses/`, {
          credentials: "include",
        });


        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        if (data.success && data.courses) {
          setCourses(data.courses);
        } else {
          throw new Error("Failed to fetch courses");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);



  const COURSES = [
    { id: 999, name: "Courses", href: "/showallcourses" },
    ...courses.map((course) => ({
      id: course.id,
      name: course.title,
      href: `/courses/${course.id}/${course.url_link_name}`
    }))
  ];

  const COMPANY = [
    { id: 1, name: "Media", href: "/media" },
    { id: 2, name: "Career", href: "/career" },
    { id: 3, name: "Contact Us", href: "/contactus" },
  ];

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // New states for user dropdown only
  const [desktopUserOpen, setDesktopUserOpen] = useState(false);
  const desktopUserRef = useRef<HTMLDivElement>(null);

  // Handle logout with API call
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
      setMobileOpen(false);
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileOpen
      ) {
        setMobileOpen(false);
      }

      // Close desktop user dropdown
      if (
        desktopUserRef.current &&
        !desktopUserRef.current.contains(event.target as Node) &&
        desktopUserOpen
      ) {
        setDesktopUserOpen(false);
      }
    };

    // Prevent scrolling when mobile menu is open
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileOpen, desktopUserOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
    setDesktopUserOpen(false);
  }, [location.pathname]);

  return (
    <nav className="w-full bg-white border-b border-gray-200 z-50 relative">
      <div className="mx-auto flex justify-between items-center sm:px-[10vw] px-4 py-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src={logo_svg} alt="" className="w-35 h-auto" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          {/* Courses Dropdown */}
          <div className="relative group">
            <Link to="/showallcourses">
              <button className="flex items-center gap-1 text-gray-800 hover:text-blue-600 font-medium">
                Courses
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </Link>

            <div className="absolute left-0 hidden group-hover:block bg-white shadow-lg rounded-lg mt-0 w-80 py-3 z-50">
              {loading ? (
                <div className="px-4 py-2 text-gray-500">Loading courses...</div>
              ) : error ? (
                <div className="px-4 py-2 text-red-500">Failed to load courses</div>
              ) : (
                COURSES.map((course) => (
                  <Link
                    key={course.id}
                    to={course.href}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-200 truncate"
                    title={course.name}
                  >
                    {course.name}
                  </Link>
                ))
              )}
            </div>
          </div>

          <Link to="/team" className="text-gray-800 hover:text-blue-600 font-medium">Team</Link>
          <Link to="/pricing" className="text-gray-800 hover:text-blue-600 font-medium">Pricing</Link>

          {/* Company Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-gray-800 hover:text-blue-600 font-medium">
              Company
              <svg
                className="w-4 h-4 transition-transform group-hover:rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute left-0 hidden group-hover:block bg-white shadow-lg rounded-lg mt-0 w-48 py-3 z-50">
              {COMPANY.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {!user ? (
            <>
              <Link
                to="/login"
                className="px-5 py-2 border border-blue-600 text-blue-600 font-semibold rounded-md hover:bg-blue-600 hover:text-white transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="relative" ref={desktopUserRef}>
              {/* Avatar + Name */}
              <Link to="/accounts/profile"

                className="flex items-center bg-[#f1f5fd] gap-3 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="bg-blue-600 text-white font-semibold w-10 h-10 rounded-full flex items-center justify-center">
                  {"U"}
                </div>
                <div className="text-left leading-tight">
                  <p className="font-semibold">{user.first_name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>

              </Link>


            </div>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {mobileOpen && (
        <>
          {/* Overlay Background */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          />

          {/* Mobile Menu Sidebar (RIGHT SIDE) */}
          <div
            ref={mobileMenuRef}
            className="
              fixed top-0 right-0
              h-full w-full max-w-80
              bg-white z-50 lg:hidden
              transform transition-transform duration-500 ease-out
            "
            style={{
              transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
            }}
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <Link
                to="/"
                className="flex items-center gap-3"
                onClick={() => setMobileOpen(false)}
              >
                <img
                  src={logo_svg}
                  alt="Deep Eigen AI Labs"
                  className="w-35 h-auto"
                />
              </Link>

              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Menu Content */}
            <div className="h-full overflow-y-auto p-6">
              {/* User Info if logged in */}
              {user && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold">
                      {"U"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">John</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Menu Items */}
              <div className="space-y-1">
                {/* Courses Dropdown (Keep as dropdown for mobile) */}
                <div className="border-b border-gray-100 pb-2">
                  <button
                    onClick={() => setCoursesOpen(!coursesOpen)}
                    className="flex justify-between items-center w-full py-3 text-gray-800 font-medium hover:text-blue-600"
                  >
                    <span>Courses</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${coursesOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {coursesOpen && (
                    <div className="pl-4 space-y-2 mb-3">
                      {loading ? (
                        <div className="py-2 text-gray-500">Loading courses...</div>
                      ) : error ? (
                        <div className="py-2 text-red-500">Failed to load courses</div>
                      ) : (
                        COURSES.map((course) => (
                          <Link
                            key={course.id}
                            to={course.href}
                            className="block py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md px-3 truncate"
                            onClick={() => setMobileOpen(false)}
                            title={course.name}
                          >
                            {course.name}
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Team Link */}
                <Link
                  to="/team"
                  className="block py-3 text-gray-800 font-medium hover:text-blue-600 hover:bg-gray-50 rounded-md px-3 border-b border-gray-100"
                  onClick={() => setMobileOpen(false)}
                >
                  Team
                </Link>

                {/* Pricing Link */}
                <Link
                  to="/pricing"
                  className="block py-3 text-gray-800 font-medium hover:text-blue-600 hover:bg-gray-50 rounded-md px-3 border-b border-gray-100"
                  onClick={() => setMobileOpen(false)}
                >
                  Pricing
                </Link>

                {/* Company Items - Show directly without dropdown on mobile */}
                <div className="pb-2">
                  <div className="space-y-2 pb-2 mb-3">
                    {COMPANY.map((item) => (
                      <Link
                        key={item.id}
                        to={item.href}
                        className="block py-2 text-gray-900 border-b border-gray-100 hover:text-blue-600 hover:bg-gray-50 rounded-md px-3"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Auth Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                {!user ? (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="block w-full text-center border border-blue-600 text-blue-600 font-semibold rounded-md py-3 hover:bg-blue-600 hover:text-white transition"
                      onClick={() => setMobileOpen(false)}
                    >
                      Login
                    </Link>

                    <Link
                      to="/register"
                      className="block w-full text-center bg-blue-600 text-white font-semibold rounded-md py-3 hover:bg-blue-700 transition"
                      onClick={() => setMobileOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/accounts/profile"
                      className="flex items-center gap-3 py-3 text-gray-700 hover:bg-gray-50 rounded-md px-3"
                      onClick={() => setMobileOpen(false)}
                    >
                      <span>👤</span> Profile
                    </Link>

                    <button
                      className="flex items-center gap-3 w-full text-left py-3 text-red-600 hover:bg-gray-50 rounded-md px-3 disabled:opacity-50"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <span>🚪</span> {isLoggingOut ? "Logging out..." : "Log out"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}