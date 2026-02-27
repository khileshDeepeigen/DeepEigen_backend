import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_BASE } from "../../utils/api";
import { csrfFetch } from "../../utils/csrfFetch";



type TabType = "overview" | "curriculum" | "accessibility" | "refund" | "assignment";

interface Instructor {
  id: number;
  name: string;
  email: string;
  role: string;
  profile_picture: string;
}

interface TeachingAssistant {
  id: number;
  name: string;
  email: string;
  role: string;
  profile_picture: string;
}

interface Section {
  id: number;
  name: string;
  title: string;
  part_number: number;
  estimated_time: string;
}

interface CourseResponse {
  success: boolean;
  course: {
    id: number;
    title: string;
    meta_description: string;
    category: string;
    duration: number;
    level: string;
    course_type: string;
    indian_fee: number;
    foreign_fee: number;
    image: string;
  };
  teaching_assistants: TeachingAssistant[];
  instructors: Instructor[];
  sections: Section[];
  enrolled_user_flg: boolean;
  thumbnail_flag: boolean;
  canonical_url: string;
}

export default function ReinforcementLearning() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });
  const [isRefundDetailsOpen, setIsRefundDetailsOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id, slug } = useParams();
  
  // const BASE_URL = "http://127.0.0.1:8000";

  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<TabType, HTMLButtonElement | null>>({
    overview: null,
    curriculum: null,
    accessibility: null,
    refund: null,
    assignment: null,
  });

  const updateIndicator = (tab: TabType) => {
    const button = tabRefs.current[tab];
    const container = tabsRef.current;

    if (!button || !container) return;

    const buttonRect = button.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setIndicatorStyle({
      left: buttonRect.left - containerRect.left + container.scrollLeft,
      width: buttonRect.width,
    });
  };

  useEffect(() => {
    updateIndicator(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await csrfFetch(
          `${API_BASE}/courses/${id}/${slug}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CourseResponse = await response.json();
        setCourse(data);
        console.log("data vikas", data)
        
        // Expand first section by default
        if (data.sections.length > 0) {
          setExpandedSections([data.sections[0].id]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-4">
          <div className="text-red-500 text-lg mb-2">Error loading course</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-4">
          <div className="text-gray-500 text-lg mb-2">Course not found</div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Course Description</h3>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {course.course.meta_description}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-700 mb-2">Duration</h4>
                <p className="text-gray-700">{course.course.duration} weeks</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-700 mb-2">Level</h4>
                <p className="text-gray-700">{course.course.level}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-700 mb-2">Course Type</h4>
                <p className="text-gray-700">{course.course.course_type}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-700 mb-2">Category</h4>
                <p className="text-gray-700">{course.course.category}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Instructors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.instructors.map((instructor) => (
                  <div key={instructor.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={`${API_BASE}${instructor.profile_picture}`} 
                      alt={instructor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold">{instructor.name}</h4>
                      <p className="text-sm text-gray-600">{instructor.role}</p>
                      <p className="text-xs text-gray-500">{instructor.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {course.teaching_assistants.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-4">Teaching Assistants</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.teaching_assistants.map((ta) => (
                    <div key={ta.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={`${API_BASE}${ta.profile_picture}`}
                        alt={ta.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold">{ta.name}</h4>
                        <p className="text-sm text-gray-600">{ta.role}</p>
                        <p className="text-xs text-gray-500">{ta.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "curriculum":
        return (
          <div className="w-full">
            <div className="space-y-3 md:space-y-4">
              {course.sections.map((section) => (
                <div
                  key={section.id}
                  className="border-b border-gray-200 rounded-lg overflow-hidden transition-all bg-white"
                >
                  <div
                    className="bg-white px-3 md:px-4 py-3 flex justify-between items-center cursor-pointer transition-colors hover:bg-blue-50 select-none min-h-[60px] md:min-h-[70px] w-full"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-2">
                        {section.name}: {section.title}
                      </h3>
                      <div className="text-xs text-gray-600">
                        {section.estimated_time}
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`transition-transform ${expandedSections.includes(section.id) ? 'transform rotate-180' : ''}`}
                      >
                        <path
                          d="M5 7.5L10 12.5L15 7.5"
                          stroke="#1a212f"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {expandedSections.includes(section.id) && (
                    <div className="max-h-[2000px] overflow-hidden transition-all py-2">
                      <div className="px-3 md:px-4 py-2 text-sm text-gray-600">
                        Content for this section will be loaded from the API.
                        <br />
                        Part {section.part_number} of the course curriculum.
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "accessibility":
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2">Course Access</h3>
              <p className="text-gray-700">
                Lifetime access to course materials after enrollment.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Technical Requirements</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Stable internet connection</li>
                <li>Modern web browser (Chrome, Firefox, Safari)</li>
                <li>Python 3.6+ for assignments</li>
                <li>Basic knowledge of linear algebra and calculus</li>
              </ul>
            </div>
          </div>
        );

      case "refund":
        return (
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-700 mb-2">Refund Policy</h3>
              <p className="text-gray-700">
                Refunds can be requested within 7 days of enrollment. 
                Please contact support@deepeigen.com for refund requests.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Terms</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Full refund if requested within 7 days</li>
                <li>No refund after 7 days of enrollment</li>
                <li>Processing time: 5-7 business days</li>
              </ul>
            </div>
          </div>
        );

      case "assignment":
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2">Assignments</h3>
              <p className="text-gray-700">
                This course includes hands-on assignments to reinforce learning concepts.
                Assignments are designed to test your understanding of machine learning fundamentals.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Assignment Guidelines</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Assignments must be submitted before deadlines</li>
                <li>Python programming required</li>
                <li>Submit via the course portal</li>
                <li>Graded by teaching assistants</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white px-2 sm:px-3 md:px-4 lg:px-6 w-full overflow-x-hidden">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-center mb-8 md:mb-10 lg:mb-12">
        <div className="w-full sm:max-w-[80vw] sm:px-3 md:px-4">
          <div className="rounded-xl md:rounded-2xl min-h-[300px] md:min-h-[320px] lg:min-h-[380px] mt-4 md:mt-6 py-4 md:py-6 lg:py-8 px-3 md:px-4 lg:px-6 bg-gradient-to-r from-[#2B1062] to-[#6E228C] flex flex-col lg:flex-row gap-4 md:gap-6 w-full">
            <div className="flex-1 py-6 md:py-8 lg:py-10 flex flex-col gap-3 md:gap-4 w-full">
              <div className="flex flex-col gap-2 md:gap-3 w-full">
                <h1 className="text-white font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl leading-tight">
                  {course.course.title}
                </h1>
                <p className="text-white text-opacity-70 text-xs sm:text-sm md:text-base font-normal leading-relaxed">
                  {course.course.meta_description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 w-full mt-3 md:mt-4">
                <div className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-white/10 flex-shrink-0">
                  <span className="text-gray-300 text-sm md:text-base font-semibold whitespace-nowrap">
                    Level:
                  </span>
                  <span className="text-white text-sm md:text-base whitespace-nowrap">
                    {course.course.level}
                  </span>
                </div>

                <div className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-white/10 flex-shrink-0">
                  <span className="text-gray-300 text-sm md:text-base font-semibold whitespace-nowrap">
                    Duration:
                  </span>
                  <span className="text-white text-sm md:text-base whitespace-nowrap">
                    {course.course.duration} weeks
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[55%] xl:w-[50%] lg:mt-0 mt-4 md:mt-5">
              <div className="w-full aspect-video rounded-xl overflow-hidden">
                <img
                  src={`${API_BASE}${course.course.image}`}
                  alt="Course Video"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`mx-auto ${windowWidth < 768 ? 'px-0' : 'px-2 sm:px-3 md:px-4 lg:px-6'} sm:max-w-[81vw]`}>
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8 items-start w-full">
          {/* Main Content */}
          <div className="flex-1 w-full lg:w-[calc(100%-432px)] xl:w-[calc(100%-480px)]">
            <div className="flex flex-col gap-4 md:gap-6 w-full">
              {/* Tab Navigation & Content */}
              <div className="rounded-lg md:rounded-xl border border-gray-200 px-2 md:px-3 lg:px-4 py-2 mb-3 bg-white overflow-hidden w-full">
                <div
                  className="relative flex gap-15 md:gap-3 lg:gap-20 px-1 border-b border-gray-200 overflow-x-auto scrollbar-hide"
                  ref={tabsRef}
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                >
                  {(["overview", "curriculum", "accessibility", "refund", "assignment"] as TabType[]).map((tab) => (
                    <button
                      key={tab}
                      ref={(el) => { tabRefs.current[tab] = el; }}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-shrink-0 bg-transparent px-2 sm:px-3 md:px-4 py-3 text-sm md:text-base font-medium cursor-pointer transition-colors whitespace-nowrap 
                           ${activeTab === tab ? "text-blue-700" : "text-gray-600 hover:text-blue-700"}`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}

                  <div
                    className="absolute bottom-0 h-0.5 bg-blue-700 transition-all duration-300 rounded"
                    style={{
                      left: indicatorStyle.left,
                      width: indicatorStyle.width,
                    }}
                  />
                </div>

                <div className="p-3 md:p-4 lg:p-6 bg-white">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[384px] xl:w-[432px] flex-shrink-0 lg:sticky lg:top-6 mt-6 lg:mt-0">
            <div className="rounded-lg md:rounded-xl bg-white shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#2B1062] to-[#6E228C] px-3 md:px-4 lg:px-5 py-3 md:py-4">
                <h2 className="text-white font-semibold text-base md:text-lg mb-1">Course Details</h2>
                <p className="text-white text-opacity-80 text-sm">Everything you need to know</p>
              </div>

              <div className="px-3 md:px-4 lg:px-5 py-3 md:py-4 lg:py-5 flex flex-col gap-30 md:gap-4">
                <div className="space-y-3 md:space-y-7">
                  {/* Instructor */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 md:p-2.5 rounded-lg bg-blue-50 flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="text-xs md:text-sm text-gray-700 font-semibold truncate">Instructor</div>
                      <div className="text-sm md:text-base font-semibold break-words">
                        {course.instructors[0]?.name || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Fee Foreign */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 md:p-2.5 rounded-lg bg-blue-50 flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="text-xs md:text-sm text-gray-700 font-semibold truncate">Fee: Foreign</div>
                      <div className="text-sm md:text-base font-semibold break-words">${course.course.foreign_fee}</div>
                    </div>
                  </div>

                  {/* Fee India */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 md:p-2.5 rounded-lg bg-blue-50 flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="text-xs md:text-sm text-gray-700 font-semibold truncate">Fee: India</div>
                      <div className="text-sm md:text-base font-semibold break-words">₹{course.course.indian_fee}</div>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 md:p-2.5 rounded-lg bg-blue-50 flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="text-xs md:text-sm text-gray-700 font-semibold truncate">Duration</div>
                      <div className="text-sm md:text-base font-semibold break-words">{course.course.duration} weeks</div>
                    </div>
                  </div>

                  {/* Level */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 md:p-2.5 rounded-lg bg-blue-50 flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="text-xs md:text-sm text-gray-700 font-semibold truncate">Level</div>
                      <div className="text-sm md:text-base font-semibold break-words">{course.course.level}</div>
                    </div>
                  </div>

                  {/* Course Type */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 md:p-2.5 rounded-lg bg-blue-50 flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="text-xs md:text-sm text-gray-700 font-semibold truncate">Course Type</div>
                      <div className="text-sm md:text-base font-semibold break-words">{course.course.course_type}</div>
                    </div>
                  </div>
                </div>

                {/* Buy Button */}
                <Link to="/payment">
                  <button className="w-full py-3 px-4 bg-blue-700 text-white font-semibold text-sm md:text-base rounded-lg cursor-pointer transition-colors hover:bg-blue-900 min-h-[44px] md:min-h-[48px] flex items-center justify-center">
                    Buy this course
                  </button>
                </Link>

                {/* Divider with "or" */}
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="flex-1 h-px bg-gray-300 bg-opacity-30"></div>
                  <span className="text-xs md:text-sm font-medium">or</span>
                  <div className="flex-1 h-px bg-gray-300 bg-opacity-30"></div>
                </div>

                {/* Get Full Access */}
                <div className="flex flex-col gap-3 md:gap-4">
                  <div>
                    <h3 className="font-semibold text-base md:text-lg mb-1">Get Full Access</h3>
                    <p className="text-xs md:text-sm text-gray-700 mb-2">of complete curriculum & all premium courses at</p>
                    <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                      <div className="text-lg md:text-xl font-bold">₹{course.course.indian_fee}</div>
                      <span className="text-xs md:text-sm">/one-time</span>
                    </div>
                  </div>

                  <button className="w-full py-2.5 md:py-3 px-4 border border-blue-700 text-blue-700 bg-transparent font-semibold text-xs md:text-sm rounded-lg cursor-pointer transition-colors hover:bg-blue-50 hover:border-blue-900 hover:text-blue-900 min-h-[40px] md:min-h-[44px] flex items-center justify-center">
                    Subscribe
                  </button>
                </div>

                <div className="p-3 md:p-3.5 border-2 border-gray-300 border-opacity-30 rounded-lg md:rounded-xl flex flex-col gap-1 bg-blue-50">
                  <h4 className="text-blue-700 text-xs font-semibold mb-0.5">Need Help?</h4>
                  <p className="text-xs text-gray-700 font-light leading-relaxed">
                    If you have any questions about the course, feel free to reach out to our support team.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

