import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";


import certificate from "../../assets/paylist/certificate.png";


import { FaCertificate, FaPlay } from "react-icons/fa";
import loggedInData from "./data/loggedInData.json";
import type { SectionType, LoggedInData, Certificate } from "./data/types";
import paylistimg from "../../assets/Logo/playlist.svg";
import { API_BASE } from "../../utils/api";
import { csrfFetch } from "../../utils/csrfFetch";



export default function LoggedIn() {
  const [data, setData] = useState<LoggedInData>(loggedInData as LoggedInData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<SectionType>("courses");
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  
  // Recent watch state
  const [recentWatch, setRecentWatch] = useState<{
    video_id?: number;
    video_title: string;
    video_link?: string;
    video_duration?: string;
    video_thumbnail?: string;
    course_id: number;
    course_title: string;
    course_url: string;
    section_id?: number;
    section_title?: string;
    section_url: string;
    module_name?: string;
    completed: boolean;
    watched_at: string;
  } | null>(null);

  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  // import { getRequest } from "../../utils/api";
  // import { API_BASE } from "../../utils/api";



  // Fetch dashboard data with course progress from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // console.log("Fetching dashboard data from API...");
        // console.log("document.cookie:", document.cookie);

        const dashboardResponse = await csrfFetch(`${API_BASE}/accounts/dashboard/`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!dashboardResponse.ok) {
          throw new Error(`HTTP error! status: ${dashboardResponse.status}`);
        }

        const dashboardData = await dashboardResponse.json();
        // console.log("Dashboard API response:", dashboardData);

        let playlistsData = null;
        try {
          const playlistsResponse = await csrfFetch(`${API_BASE}/accounts/playlists/`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });
          // if (playlistsResponse.ok) {
          //   playlistsData = await playlistsResponse.json();
          // }
          if (playlistsResponse.status === 401) {
            return; // csrfFetch already triggered redirect
          }

          if (!playlistsResponse.ok) {
            throw new Error(`Request failed: ${playlistsResponse.status}`);
          }

playlistsData = await playlistsResponse.json();

        } catch (err) {
          console.warn("Failed to fetch playlists, using mock data:", err);
        }

        // Fetch certificates data
        let certificatesData = null;
        try {
          const certificatesResponse = await csrfFetch(`${API_BASE}/accounts/certificates/`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (certificatesResponse.ok) {
            certificatesData = await certificatesResponse.json();
          }
        } catch (err) {
          console.warn("Failed to fetch certificates, using mock data:", err);
        }

        if (dashboardData.success && dashboardData.courses?.courses_list) {
          const transformedCourses = dashboardData.courses.courses_list.map((course: any) => ({
            id: course.id.toString(),
            title: course.title,
            description: course.description || loggedInData.courses[0]?.description,
            validity: course.validity || "N/A",
            category: course.category,
            assignments: course.assignments || 28,
            completion: Math.round(course.completion) || 0,
            image: loggedInData.courses[0]?.image,
            courseUrl: course.courseUrl || course.url_link_name || "",
            sectionUrl: course.sectionUrl || "overview",
          }));

          const inProgressCourse = transformedCourses.find(
            (c: any) => c.completion > 0 && c.completion < 100
          );
          const currentCourse = inProgressCourse || transformedCourses[0] || loggedInData.currentCourse;
          const firstCourse = transformedCourses[0] || loggedInData.courses[0];
          const playlistsList = playlistsData?.playlists || loggedInData.playlists || [];
          const certificatesList = certificatesData?.certificates || loggedInData.certificates || [];

          const updatedData = {
            ...loggedInData,
            user: {
              name: dashboardData.user?.first_name || loggedInData.user.name,
              plan: loggedInData.user.plan,
            },
            currentCourse: {
              title: currentCourse.title,
              instructor: currentCourse.category,
            },
            customizedCourse: {
              title: firstCourse.title,
              lectures: firstCourse.assignments * 3,
              assignments: firstCourse.assignments,
            },
            playlists: playlistsList,
            certificates: certificatesList,
            courses: transformedCourses,
          } as LoggedInData;

          setData(updatedData);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load course data. Using default data.");
        // Keep using loggedInData if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);



  // Fetch recent watch data
  useEffect(() => {
    const fetchRecentWatch = async () => {
      try {
        const response = await csrfFetch(`${API_BASE}/accounts/recent-watch/`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Recent watch API response:", data);
          if (data.success && data.recent_watch) {
            setRecentWatch(data.recent_watch);
          } else {
            // Clear recent watch if no data found
            setRecentWatch(null);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch recent watch:", err);
      }
    };

    // Fetch on initial load
    fetchRecentWatch();

    // Re-fetch when user comes back to this tab/page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("User returned to dashboard, re-fetching recent watch...");
        fetchRecentWatch();
      }
    };

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Also listen for focus events (when user clicks back from another page)
    window.addEventListener("focus", fetchRecentWatch);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", fetchRecentWatch);
    };
  }, [location.pathname]);



  useEffect(() => {
    const index = data.sections.indexOf(activeSection);
    const currentTab = tabsRef.current[index];

    if (currentTab) {
      const { offsetLeft, offsetWidth } = currentTab;
      setIndicatorStyle({
        left: offsetLeft,
        width: offsetWidth,
      });
    }
  }, [activeSection, data.sections]);






  const handleAddCourseClick = () => {
    navigate("/addcourse");
  };




  //Create handleWatch function to navigate to course view page with course info in state --- vikas 9feb
  const handleWatch = (event?: React.MouseEvent<HTMLButtonElement, MouseEvent> | string) => {
    let courseId: string | undefined;
    let course;

    if (typeof event === "string") {
      courseId = event;
      course = data.courses.find((c) => c.id === courseId);
    } else {
      course = data.courses.find(
        (c) => c.completion > 0 && c.completion < 100
      );
      if (!course && data.courses.length > 0) {
        course = data.courses[0];
      }
    }

    // console.log("handleWatch called:", { 
    //   eventType: typeof event, 
    //   courseId, 
    //   coursesLength: data.courses.length,
    //   foundCourse: course
    // });

    if (!course || !course.id) {
      if (loggedInData.courses && loggedInData.courses.length > 0) {
        course = loggedInData.courses[0] as any;
        // console.log("Using fallback course from mock data:", course);
      } else {
        course = {
          id: "1",
          title: "AI-1.0Z: Introductiing",
          image: "https://api.builder.io/api/v1/image/assets/TEMP/d534ad339983623000d55526c9a3e7a6d8407489?width=734"
        } as any;
        console.log("Using hardcoded fallback course:", course);
      }
    }

    if (!course.id) {
      // console.error("Course ID is missing or invalid", { course, coursesLength: data.courses.length });
      return;
    }

    const courseTitle = (course.title && course.title.trim() !== "") ? course.title : "Default Course";
    const courseUrl = (course.courseUrl && course.courseUrl.trim() !== "") ? course.courseUrl : "course";
    const sectionUrl = (course.sectionUrl && course.sectionUrl.trim() !== "") ? course.sectionUrl : "overview";
    const courseImage = course.image || "";

    console.log("Navigating to course:", { id: course.id, title: courseTitle, courseUrl, sectionUrl });
    navigate(
      `/course-view/${course.id}/${courseUrl}/${sectionUrl}`,
      {
        state: {
          courseTitle: courseTitle,
          courseImage: courseImage,
          returnTo: "/user_dashboard"
        }
      }
    );
  };







  const handleDownload = async (
    cert?: Certificate | null,
    action: "open" | "download" = "download",
    format: "png" | "pdf" = "png"
  ) => {
    try {
      const src = cert?.image ?? certificate;
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      if (action === "open") {
        window.open(url, "_blank");
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = cert
          ? `${cert.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_certificate.${format}`
          : `certificate.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Certificate action failed", error);
    }
  };




  const handleShareLinkedIn = (certificate: Certificate) => {
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&title=${encodeURIComponent(certificate.title)}`;
    window.open(linkedInShareUrl, '_blank');
    setSelectedCertificate(null);
  };




  return (
    <div className="min-h-screen sm:px-0 bg-white font-['Bricolage_Grotesque',-apple-system,Roboto,Helvetica,sans-serif]">
      {/* Loading State */}
      {loading && (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#174cd2] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Only show when not loading */}
      {!loading && (
        <>
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#2b1062] to-[#6e228c]">
            <div className="px-4 md:px-8  lg:px-10 xl:px-36 2xl:px-48">
              {/* Welcome Section */}
              <div className="flex flex-row  items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl md:text-3.5xl mt-10 lg:text-4xl text-white font-normal tracking-tight">
                    Welcome, {data.user.name}
                  </h1>
                  <p className="text-base md:text-lg text-white font-light mt-2">
                    {data.messages.welcome}
                  </p>
                </div>

                <div className="inline-flex px-3 py-1.5 mt-10 bg-[#0f9c95] text-white text-sm font-semibold rounded-full self-start">
                  {data.user.plan}
                </div>
              </div>

              {/* Current Course Card - Shows Recent Watch if available, else shows enrolled course */}
              {(recentWatch || (data.courses && data.courses.length > 0)) ? (
                // Recent Watch Card OR Enrolled Course Card
                <div className="bg-white/12 rounded-xl p-5 md:p-7 mb-15">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  
                    
                    <div className="flex-1">
                      {recentWatch ? (
                        // Show recent watch data
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-white/70 text-xs uppercase tracking-wider">
                              {recentWatch.video_title ? "Continue Watching" : "Continue Learning"}
                            </p>
                            {recentWatch.video_duration && (
                              <span className="text-white/50 text-xs">• {recentWatch.video_duration}</span>
                            )}
                            {recentWatch.completed && (
                              <span className="text-green-400 text-xs">• Completed</span>
                            )}
                          </div>
                          <h2 className="text-white text-lg md:text-xl font-semibold tracking-tight line-clamp-1">
                            {recentWatch.video_title || recentWatch.course_title}
                          </h2>
                          <p className="text-white/80 text-sm font-light mt-1 line-clamp-1">
                            {recentWatch.video_title ? recentWatch.course_title : "Continue your learning journey"}
                          </p>
                          {recentWatch.module_name && (
                            <p className="text-white/60 text-xs mt-1">
                              {recentWatch.module_name}
                            </p>
                          )}
                          {/* Watched timestamp */}
                          {recentWatch.watched_at && (
                            <p className="text-white/40 text-xs mt-2">
                              Last watched: {new Date(recentWatch.watched_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          )}
                        </>
                      ) : (
                        // Show enrolled course when no recent watch - use first course with progress or first course
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-white/70 text-xs uppercase tracking-wider">Your Course</p>
                          </div>
                          <h2 className="text-white cursor-pointer text-lg md:text-xl font-semibold tracking-tight line-clamp-1">
                            {data.currentCourse?.title || (data.courses && data.courses[0]?.title) || "Start Learning"}
                          </h2>
                          <p className="text-white/80 text-sm font-light mt-1 line-clamp-1">
                            {data.currentCourse?.instructor || (data.courses && data.courses[0]?.category) || "Begin your learning journey"}
                          </p>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (recentWatch) {
                          navigate(
                            `/course-view/${recentWatch.course_id}/${recentWatch.course_url}/${recentWatch.section_url}`,
                            {
                              state: {
                                courseTitle: recentWatch.course_title,
                                returnTo: "/user_dashboard"
                              }
                            }
                          );
                        } else {
                          // Use enrolled course
                          handleWatch();
                        }
                      }}
                      className="flex items-center cursor-pointer justify-center gap-2 w-full md:w-auto px-4 py-2 border border-white text-white text-sm md:text-base font-semibold rounded-full hover:bg-white/10 transition"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
                      </svg>
                      {recentWatch ? "Continue Watching" : "Start Learning"}
                    </button>
                  </div>
                </div>
              ) : (
                // No enrolled course - show empty state
                <div className="bg-white/12 rounded-xl p-5 md:p-7 mb-15">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-white text-lg md:text-xl font-semibold tracking-tight">
                        No courses enrolled yet
                      </h2>
                      <p className="text-white/80 text-sm font-light mt-1">
                        Browse our courses and start learning today!
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/courses")}
                      className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 border border-white text-white text-sm md:text-base font-semibold rounded-full hover:bg-white/10 transition"
                    >
                      Browse Courses
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <div className="relative">
                {/* Tabs */}
                <div className="flex border-b border-white/20 cursor-pointer overflow-x-auto no-scrollbar relative">
                  {data.sections.map((section, index) => (
                    <button
                      key={section}
                      ref={(el) => { tabsRef.current[index] = el; }}
                      onClick={() => setActiveSection(section)}
                      className={`px-4 py-3 text-sm whitespace-nowrap cursor-pointer transition ${activeSection === section
                        ? "text-white font-semibold"
                        : "text-white/70 hover:text-white"
                        }`}
                    >
                      {section.charAt(0).toUpperCase() +
                        section.slice(1).replace("-", " ")}
                    </button>
                  ))}

                  {/* Underline Indicator */}
                  <span
                    className="absolute bottom-0 h-1 bg-white transition-all duration-300"
                    style={{
                      left: indicatorStyle.left,
                      width: indicatorStyle.width,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          

          {/* Main Content */}
          <div className="px-2 py-12 md:px-8 lg:px-10 xl:px-36 2xl:px-48">
            {/* Courses Section */}
            {activeSection === "courses" && (
              <>



                {/* Customized Course Card */}
                <div className="bg-gradient-to-r from-[#6e53e9] to-[#1d2396] rounded-xl p-6 md:p-8 mb-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                  
                      <div>
                        <h3 className="text-white text-xl md:text-2xl font-bold mb-1">
                          {recentWatch && recentWatch.video_id ? recentWatch.video_title : (recentWatch ? recentWatch.course_title : data.customizedCourse.title)}
                        </h3>
                        {/* Show course/module info when watching video */}
                        {recentWatch && recentWatch.video_id ? (
                          <div className="flex items-center justify-center md:justify-start gap-2 text-white/80 text-sm">
                            <span>{recentWatch.course_title}</span>
                            {recentWatch.module_name && <><span className="text-white/60">•</span><span>{recentWatch.module_name}</span></>}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center md:justify-start gap-3 text-white/80 text-sm">
                            <span>{data.customizedCourse.lectures} Lectures</span>
                            <div className="w-px h-4 bg-white/60"></div>
                            <span>{data.customizedCourse.assignments} Assignments</span>
                          </div>
                        )}
                        {/* Last watched time */}
                        {recentWatch && recentWatch.watched_at && (
                          <p className="text-white/50 text-xs mt-1">
                            {recentWatch.video_id ? 'Last watched' : 'Last accessed'}: {new Date(recentWatch.watched_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (recentWatch && recentWatch.course_id) {
                          navigate(`/course-view/${recentWatch.course_id}/${recentWatch.course_url}/${recentWatch.section_url}`, {
                            state: { courseTitle: recentWatch.course_title, returnTo: "/user_dashboard" }
                          });
                        } else {
                          handleWatch();
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-6 py-3 border border-white text-white text-sm font-semibold rounded-full cursor-pointer transition w-full md:w-auto"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M21.409 9.35306C21.8893 9.60848 22.291 9.98975 22.5712 10.456C22.8514 10.9223 22.9994 11.4561 22.9994 12.0001C22.9994 12.544 22.8514 13.0778 22.5712 13.5441C22.291 14.0104 21.8893 14.3917 21.409 14.6471L8.597 21.6141C6.534 22.7371 4 21.2771 4 18.9681V5.03306C4 2.72306 6.534 1.26406 8.597 2.38506L21.409 9.35306Z" fill="currentColor" />
                      </svg>
                      {recentWatch && recentWatch.video_id ? "Watch Now" : "Play"}
                    </button>
                  </div>
                </div>


                

                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3.5xl text-[#1a212f] font-normal tracking-tight">
                      {data.messages.courses.title}
                    </h2>
                    <p className="text-[#1a212f]/70 text-base font-light mt-2">
                      {data.messages.courses.description}
                    </p>
                  </div>
                  <button
                    onClick={handleAddCourseClick}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-[#174cd2] text-white text-base font-semibold rounded-lg hover:bg-[#174cd2]/90 transition w-full md:w-auto"
                  >
                    Add Course
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {data.courses.map((course) => (
                    <div key={course.id} className="border border-[#1a212f]/24 rounded-xl overflow-hidden hover:shadow-lg transition">
                      {/* Course Image */}
                      <div className="h-62 bg-gray-300 relative overflow-hidden">
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                          <button
                            onClick={() => {
                              if (course.completion > 0 && course.completion < 100) {
                                handleWatch(course.id);
                              }
                            }}
                            className={`px-6 py-2 text-white text-sm font-semibold rounded-full 
                             flex items-center gap-2 transition
                            ${course.completion === 0
                                ? ""
                                : course.completion === 100
                                  ? "bg-green-600 hover:bg-green-70"
                                  : ""
                              }
  `}
                          >
                            {course.completion === 0 && (
                              <button onClick={() => handleWatch(course.id)} className="flex gap-2">
                                <FaPlay className="text-xs cursor-pointer" /> Start Learning
                              </button>
                            )}
                            {course.completion === 100 && (
                              <>
                                <FaCertificate className="text-sm" />
                                View Certificate
                              </>
                            )}
                            {course.completion > 0 && course.completion < 100 && (
                              <button onClick={() => handleWatch(course.id)} className="flex items-center gap-2">
                                <FaPlay className="text-xs" />
                                Resume Learning
                              </button>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Course Content */}
                      <div className="p-5">
                        <h3 className="text-[#1a212f] text-lg font-semibold tracking-tight mb-2 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-[#1a212f]/70 text-sm font-light leading-relaxed mb-3 line-clamp-3">
                          {course.description}
                        </p>

                        <div className="h-px bg-black/8 my-3"></div>

                        {/* Course Meta */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="text-center">
                            <p className="text-[#1a212f]/70 text-xs font-light mb-1">Validity</p>
                            <p className="text-[#1a212f] text-sm font-semibold">{course.validity}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[#1a212f]/70 text-xs font-light mb-1">Category</p>
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-[#1a212f] text-sm font-semibold">{course.category}</span>
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M7.0013 10.3548C7.11733 10.3548 7.22861 10.3087 7.31066 10.2267C7.39271 10.1446 7.4388 10.0334 7.4388 9.91732V6.41732C7.4388 6.30129 7.39271 6.19001 7.31066 6.10796C7.22861 6.02591 7.11733 5.97982 7.0013 5.97982C6.88527 5.97982 6.77399 6.02591 6.69194 6.10796C6.6099 6.19001 6.5638 6.30129 6.5638 6.41732V9.91732C6.5638 10.1588 6.7598 10.3548 7.0013 10.3548ZM7.0013 4.08398C7.15601 4.08398 7.30438 4.14544 7.41378 4.25484C7.52318 4.36424 7.58464 4.51261 7.58464 4.66732C7.58464 4.82203 7.52318 4.9704 7.41378 5.0798C7.30438 5.18919 7.15601 5.25065 7.0013 5.25065C6.84659 5.25065 6.69822 5.18919 6.58882 5.0798C6.47943 4.9704 6.41797 4.82203 6.41797 4.66732C6.41797 4.51261 6.47943 4.36424 6.58882 4.25484C6.69822 4.14544 6.84659 4.08398 7.0013 4.08398Z" fill="#1A212F" fillOpacity="0.4" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M0.730469 6.99935C0.730469 3.5361 3.53805 0.728516 7.0013 0.728516C10.4646 0.728516 13.2721 3.5361 13.2721 6.99935C13.2721 10.4626 10.4646 13.2702 7.0013 13.2702C3.53805 13.2702 0.730469 10.4626 0.730469 6.99935ZM7.0013 1.60352C5.57024 1.60352 4.19779 2.172 3.18587 3.18392C2.17396 4.19583 1.60547 5.56829 1.60547 6.99935C1.60547 8.43041 2.17396 9.80286 3.18587 10.8148C4.19779 11.8267 5.57024 12.3952 7.0013 12.3952C8.43237 12.3952 9.80482 11.8267 10.8167 10.8148C11.8286 9.80286 12.3971 8.43041 12.3971 6.99935C12.3971 5.56829 11.8286 4.19583 10.8167 3.18392C9.80482 2.172 8.43237 1.60352 7.0013 1.60352Z" fill="#1A212F" fillOpacity="0.4" />
                              </svg>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-[#1a212f]/70 text-xs font-light mb-1">Assignments</p>
                            <p className="text-[#1a212f] text-sm font-semibold">{course.assignments}</p>
                          </div>
                        </div>

                        <div className="h-px bg-black/8 my-3"></div>

                        {/* Progress Bar */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 h-1.5 bg-black/4 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${course.completion === 100 ? "bg-green-600" : "bg-[#174cd2]"
                                }`}
                              style={{ width: `${course.completion}%` }}
                            ></div>
                          </div>
                          <span className="text-[#1a212f] text-xs font-light">
                            {course.completion}% Completed
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Certificates Section */}
            {activeSection === "certificates" && (
              <>
                {/* Header */}
                <div className="mb-10">

                  <h2

                    className="text-2xl md:text-3xl font-semibold text-[#1a212f]">

                    {data.messages.certificates.title}
                  </h2>



                  <p className="mt-2 text-[#1a212f]/70 text-base">
                    {data.messages.certificates.description}
                  </p>
                </div>

                {/* Certificates List */}
                <div className="space-y-6">
                  {data.certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="border-b border-black/10 pb-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        {/* Certificate Image */}
                        <div className="w-full md:w-64 flex-shrink-0">
                          <div className="border border-black/10 rounded-lg overflow-hidden bg-white">
                            <img
                              onClick={() => setSelectedCertificate(cert)}
                              src={cert.image}
                              alt={cert.title}
                              className="w-full cursor-pointer h-auto object-contain"
                            />
                          </div>
                        </div>

                        {/* Certificate Details */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[#1a212f] mb-1">
                            {cert.title}
                          </h3>
                          <p className="text-sm text-[#1a212f]/70">
                            Completed on {cert.completionDate}
                          </p>
                          <p className="text-sm text-[#1a212f]/70">
                            Grade Achieved: {cert.grade}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col  sm:flex-row gap-3 w-full md:w-auto">
                          <button
                            onClick={() => setSelectedCertificate(cert)}
                            className="px-6 py-2.5 border border-[#1a212f]/50 cursor-pointer text-[#000] text-sm font-medium rounded-md hover:bg-black/5 transition flex items-center gap-2"
                          >

                            Download
                          </button>
                          <button
                            onClick={() => handleShareLinkedIn(cert)}
                            className="px-5 py-2.5 bg-[#174cd2] text-white cursor-pointer text-sm font-medium rounded-md hover:bg-[#174cd2]/90 transition flex items-center gap-2"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                            </svg>
                            Share to LinkedIn
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Certificate Preview Modal - UPDATED */}
                {selectedCertificate && (
                  <div
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-8"
                    onClick={() => setSelectedCertificate(null)}
                  >
                    <div
                      className="relative max-w-5xl w-full  rounded-xl  overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Modal Header with Title */}
                      <div className="flex items-center justify-between p-6 ">
                        <div>
                          <h2 className="text-2xl font-semibold text-[#fff]">
                            {selectedCertificate.title}
                          </h2>

                        </div>

                        {/* Close Button */}
                        <button
                          onClick={() => setSelectedCertificate(null)}
                          className="bg-gray-100 hover:bg-gray-200 p-2 cursor-pointer rounded-full transition"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>

                      {/* Certificate Image Container */}
                      <div className="p-6 h-[70vh] overflow-auto flex items-center justify-center">
                        <img
                          src={selectedCertificate.image}
                          alt={selectedCertificate.title}
                          className="max-w-full h-[60vh] rounded-lg shadow-lg"
                        />
                      </div>

                      {/* Modal Actions */}
                      <div className="flex flex-col sm:flex-row justify-center gap-4 p-6 ">

                        <button
                          onClick={() => handleDownload(selectedCertificate, "download", "pdf")}
                          className="flex items-center justify-center gap-2 px-6 py-3 border-1 border-[#fff] text-[#fff] rounded-lg hover:bg-[#174cd2]/5 transition"
                        >

                          Download PDF
                        </button>
                        <button
                          onClick={() => handleShareLinkedIn(selectedCertificate)}
                          className="flex items-center justify-center gap-2 px-6 py-3  bg-[#174cd2] text-white rounded-lg hover:bg-[#0077b5]/90 transition"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                          </svg>
                          Share on LinkedIn
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Playlist Section */}
            {activeSection === "playlist" && (
              <div>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">{data.messages.playlists.title}</h1>
                    <p className="text-sm text-gray-500 mt-1">{data.messages.playlists.description}</p>
                    <button className="md:hidden mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      Create Playlist
                      <span className="text-lg">+</span>
                    </button>
                  </div>


                    <button onClick={() => navigate("/make_playlist")} className="hidden md:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      Create Playlist
                      <span className="text-lg">+</span>
                    </button>


                </div>

                {/* Playlist Cards */}
                <div className="space-y-4">
                  {data.playlists.map((playlist) => (
                    <div key={playlist.id} className="border border-gray-200 rounded-xl px-4 py-4 hover:shadow-sm transition">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 flex items-center justify-center">
                            <img src={paylistimg} alt="" />


                          </div>
                          <h3 className="text-sm font-medium text-gray-900">{playlist.title}</h3>
                        </div>
                        <div className="hidden md:flex items-center text-sm text-gray-500 gap-4">
                          <span>{playlist.lectures} Lectures</span>
                          <span className="text-gray-300">|</span>
                          <span>{playlist.assignments} Assignments</span>
                        </div>
                        <div className="flex md:hidden items-center text-sm text-gray-500 gap-3 pl-12">
                          <span>{playlist.lectures} Lectures</span>
                          <span className="text-gray-300">|</span>
                          <span>{playlist.assignments} Assignments</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Labs Section */}
            {activeSection === "ai-labs" && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <h2 className="text-2xl md:text-3.5xl text-[#1a212f] font-semibold mb-4">{data.aiLabs.title}</h2>
                <p className="text-[#1a212f]/70 text-base">{data.aiLabs.description}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}