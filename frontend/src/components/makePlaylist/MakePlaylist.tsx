import { useState, useEffect, useRef, useLayoutEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import makePlaylistData from "./data/makePlaylistData.json";
import type { MakePlaylistData, Course, Lecture, Assignment } from "./data/makePlaylist";

export default function MakePlaylist() {
  const navigate = useNavigate();
  
  // Load data from JSON
  const data = makePlaylistData as MakePlaylistData;
  
  // State
  const [courses, setCourses] = useState<Course[]>(data.courses);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(data.constants.defaultCourseId);
  const [lectures, setLectures] = useState<Lecture[]>(
    data.lectures
      .filter(l => l.courseId === data.constants.defaultCourseId)
      .map(lecture => ({ ...lecture, selected: false }))
  );
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showAssignments, setShowAssignments] = useState(false);
  const [searchCourse, setSearchCourse] = useState("");
  const [searchLecture, setSearchLecture] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showCourseList, setShowCourseList] = useState(false);
  const [selectAllAssignments, setSelectAllAssignments] = useState(false);
  const [openCourse, setOpenCourse] = useState<Record<string, boolean>>({});

  const lectureRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const assignmentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [paths, setPaths] = useState<string[]>([]);

  // Get selected lectures
  const selectedLectures = useMemo(() => lectures.filter(l => l.selected), [lectures]);
  
  // Get selected assignments count
  const selectedAssignmentsCount = assignments.filter(a => a.selected).length;
  
  // Get active course
  const activeCourse = courses.find(course => course.id === activeCourseId);

  // Update courses selected count when lectures change
  useEffect(() => {
    const updatedCourses = data.courses.map(course => {
      const selectedLecturesCount = lectures.filter(l => 
        l.courseId === course.id && l.selected
      ).length;
      return {
        ...course,
        selected: selectedLecturesCount
      };
    });
    
    setCourses(updatedCourses);
  }, [lectures, data.courses]);

  // Update assignments when lectures change - MAIN LOGIC
  useEffect(() => {
    if (selectedLectures.length === 0) {
      setAssignments([]);
      return;
    }

    const MAX = data.constants.maxLecturesPerAssignment;
    const newAssignments: Assignment[] = [];

    for (let i = 0; i < selectedLectures.length; i += MAX) {
      const group = selectedLectures.slice(i, i + MAX);

      newAssignments.push({
        id: `assignment-${group.map(l => l.id).join("-")}`,
        lectureIds: group.map(l => l.id),
        title: `Assignment ${Math.floor(i / MAX) + 1}`,
        selected: true,
      });
    }

    setAssignments(newAssignments);

  }, [selectedLectures, data.constants.maxLecturesPerAssignment]);

  // Update SVG paths when assignments change (Desktop only)
  useLayoutEffect(() => {
    if (!isDesktop) return;
    
    const updatePaths = () => {
      const newPaths: string[] = [];
      
      assignments.forEach(assignment => {
        assignment.lectureIds.forEach(lectureId => {
          const lecture = lectures.find(l => l.id === lectureId);
          if (!lecture) return;
          
          const lectureEl = lectureRefs.current[lectureId];
          const assignmentEl = assignmentRefs.current[assignment.id];
          
          if (!lectureEl || !assignmentEl) return;
          
          const lRect = lectureEl.getBoundingClientRect();
          const aRect = assignmentEl.getBoundingClientRect();
          const container = lectureEl.closest(".assignment-row") as HTMLElement;
          
          if (!container) return;
          
          const cRect = container.getBoundingClientRect();
          
          // Start point (right side of lecture)
          const x1 = lRect.right - cRect.left;
          const y1 = lRect.top + lRect.height / 2 - cRect.top;
          
          // End point (left side of assignment)
          const x2 = aRect.left - cRect.left;
          const y2 = aRect.top + aRect.height / 2 - cRect.top;
          
          // Create curved SVG path
          newPaths.push(
            `M ${x1} ${y1} C ${x1 + 80} ${y1}, ${x2 - 80} ${y2}, ${x2} ${y2}`
          );
        });
      });
      
      setPaths(newPaths);
    };
    
    if (showAssignments) {
      // Small delay to ensure DOM is updated
      setTimeout(updatePaths, 0);
    }
  }, [selectedLectures, assignments, showAssignments, isDesktop, lectures]);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
      
      // On desktop, always show course list
      if (width >= 1024) {
        setShowCourseList(true);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Toggle lecture selection
  const toggleLecture = (lectureId: string) => {
    setLectures(prev =>
      prev.map(lecture =>
        lecture.id === lectureId ? { ...lecture, selected: !lecture.selected } : lecture
      )
    );
  };

  // Toggle assignment selection
  const toggleAssignment = (assignmentId: string) => {
    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === assignmentId
          ? { ...assignment, selected: !assignment.selected }
          : assignment
      )
    );
  };

  // Select/Deselect all assignments
  const handleSelectAllAssignments = () => {
    const newValue = !selectAllAssignments;
    setSelectAllAssignments(newValue);
    setAssignments(prev =>
      prev.map(assignment => ({ ...assignment, selected: newValue }))
    );
  };

  // Handle subscribe function
  const handleSubscribe = () => {
    console.log("Navigating to playlist-summary");
    navigate("/playlist-summary");
  };

  const handleCourseClick = (courseId: string) => {
    setActiveCourseId(courseId);
    const courseLectures = data.lectures
      .filter(lecture => lecture.courseId === courseId)
      .map(lecture => ({ ...lecture, selected: false }));
    setLectures(courseLectures);
    setSearchLecture("");
    if (isMobile) {
      setShowCourseList(false);
    }
  };

  // Filter courses based on search
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchCourse.toLowerCase()) ||
    course.category.toLowerCase().includes(searchCourse.toLowerCase())
  );

  // Filter lectures based on search
  const filteredLectures = lectures.filter(lecture =>
    lecture.title.toLowerCase().includes(searchLecture.toLowerCase()) ||
    lecture.lectureName?.toLowerCase().includes(searchLecture.toLowerCase()) ||
    lecture.lectureNumber?.toLowerCase().includes(searchLecture.toLowerCase())
  );

  // Group assignments by course
  const groupAssignmentsByCourse = () => {
    const groups: { courseTitle: string; lectures: Lecture[]; assignments: Assignment[] }[] = [];
    
    selectedLectures.forEach(lecture => {
      const course = courses.find(c => c.id === lecture.courseId);
      if (!course) return;
      
      // Find assignments that contain this lecture
      const lectureAssignments = assignments.filter(assignment =>
        assignment.lectureIds.includes(lecture.id)
      );
      
      const existingGroup = groups.find(g => g.courseTitle === course.title);
      if (existingGroup) {
        if (!existingGroup.lectures.some(l => l.id === lecture.id)) {
          existingGroup.lectures.push(lecture);
        }
        lectureAssignments.forEach(assignment => {
          if (!existingGroup.assignments.some(a => a.id === assignment.id)) {
            existingGroup.assignments.push(assignment);
          }
        });
      } else {
        groups.push({
          courseTitle: course.title,
          lectures: [lecture],
          assignments: lectureAssignments
        });
      }
    });
    
    return groups;
  };

  // Get color styles
  const getColorStyles = () => ({
    primary: data.colors.primary,
    primaryHover: data.colors.primaryHover,
    primaryLight: data.colors.primaryLight,
    primaryText: data.colors.primaryText,
    primaryTextLight: data.colors.primaryTextLight,
    border: data.colors.border,
    background: data.colors.background
  });

  const colors = getColorStyles();

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="w-full lg:w-[83.5vw] mx-auto p-4 md:p-6 lg:p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-8 mb-8 md:mb-12">
          <div className="flex-1 w-full">
            <h1 className="text-2xl md:text-3xl lg:text-[2.5rem] text-[#1a212f] font-normal tracking-[-0.05rem] mb-2 md:mb-3">
              {data.page.title}
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-[rgba(26,33,47,0.7)] font-normal">
              {data.page.description}
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-2 md:gap-3 w-full md:w-auto">
            <button
              className="px-4 md:px-5 py-3 md:py-4 bg-[#174cd2] text-white text-base md:text-lg lg:text-xl font-bold rounded-lg cursor-pointer w-full md:min-w-[14.875rem] hover:bg-[rgba(23,76,210,0.9)] transition-colors"
              onClick={handleSubscribe}
              style={{ backgroundColor: colors.primary }}
            >
              {data.page.buttonText}
            </button>

            <p className="text-sm md:text-base flex gap-2 text-[rgba(26,33,47,0.7)] text-center">
              <span className="text-[#174cd2] font-bold" style={{ color: colors.primary }}>
                {selectedLectures.length}
              </span> 
              {data.page.selectedText.replace("{count1}", selectedLectures.length.toString()).replace("{count2}", selectedAssignmentsCount.toString())}
              <span className="text-[#174cd2] font-bold" style={{ color: colors.primary }}>
                {selectedAssignmentsCount}
              </span>
            </p>
          </div>
        </div>

        {/* Mobile Course Selection Button */}
        {isMobile && (
          <div className="mb-4">
            <button
              onClick={() => setShowCourseList(!showCourseList)}
              className="w-full flex justify-between items-center px-4 py-3 bg-white border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="truncate mr-2">{activeCourse ? activeCourse.title : "Select Course"}</span>
              <svg 
                className={`w-5 h-5 flex-shrink-0 transition-transform ${showCourseList ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[27.438rem_1px_1fr] gap-6 my-8 md:my-12">
          {/* Courses Section */}
          {((isDesktop || isTablet) || (isMobile && showCourseList)) && (
            <div className={`flex flex-col gap-3.5 ${isMobile && showCourseList ? 'fixed inset-0 z-50 bg-white p-4 overflow-y-auto' : ''}`}>
              {isMobile && showCourseList && (
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4 pt-2">
                  <h2 className="text-xl font-semibold text-[#1a212f]">{data.ui.titles.courses}</h2>
                  <button 
                    onClick={() => setShowCourseList(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              <h2 className="text-lg md:text-xl lg:text-[1.375rem] text-[#1a212f] font-normal leading-8">
                {data.ui.titles.courses}
              </h2>
              
              {/* Search Bar */}
              <div className="mb-4 md:mb-5">
                <input 
                  type="text" 
                  placeholder={data.ui.placeholders.searchCourse}
                  className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base text-gray-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={searchCourse}
                  onChange={(e) => setSearchCourse(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col gap-3">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className={`flex items-center gap-4 md:gap-5 p-3 md:p-4 rounded-lg cursor-pointer transition-all ${
                      activeCourseId === course.id 
                        ? `border border-[#174cd2] bg-[rgba(23,76,210,0.08)]` 
                        : "hover:bg-[rgba(23,76,210,0.04)] border border-transparent"
                    }`}
                    style={{
                      borderColor: activeCourseId === course.id ? colors.primary : 'transparent',
                      backgroundColor: activeCourseId === course.id ? colors.primaryLight : 'transparent'
                    }}
                    onClick={() => handleCourseClick(course.id)}
                  >
                    <div 
                      className="flex justify-center items-center p-4 md:p-[1.625rem] rounded-md 
                      bg-gradient-to-b from-[#000155] to-[#153f9a] text-white text-sm md:text-base font-bold
                      leading-tight text-center shrink-0 w-20 md:w-32 h-16 md:h-[5.625rem]"
                    >
                      <span className="text-xs md:text-sm line-clamp-2">{course.category}</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-1 md:gap-2 min-w-0">
                      <h3 className="text-sm md:text-base text-[#1a212f] font-bold leading-snug line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs md:text-sm text-[#1a212f] font-normal leading-6">
                        <span className="text-[#174cd2] font-bold" style={{ color: colors.primary }}>
                          {course.selected}
                        </span>
                        /{course.total} lectures {course.selected > 0 ? "selected" : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          {isDesktop && (
            <div className="bg-[rgba(26,33,47,0.24)] self-stretch hidden lg:block"></div>
          )}

          {/* Lectures Section */}
          <div className="flex flex-col gap-3.5">
            <div className="flex justify-between items-center">
              <h2 className="text-lg md:text-xl lg:text-[1.375rem] text-[#1a212f] font-normal leading-8">
                {data.ui.titles.lectures} {isMobile && activeCourse && `- ${activeCourse.title}`}
              </h2>
            </div>
            
            {/* Search Bar for Lectures */}
            {activeCourseId && (
              <div className="mb-4 md:mb-5">
                <input 
                  type="text" 
                  placeholder={data.ui.placeholders.searchLecture}
                  className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base text-gray-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={searchLecture}
                  onChange={(e) => setSearchLecture(e.target.value)}
                />
              </div>
            )}
            
            <div 
              className="relative rounded-xl md:rounded-2xl border border-[#4e4e4f9d] p-1 md:p-1.5 bg-[#f1f4fc] overflow-hidden min-h-[300px] md:min-h-[400px]"
              style={{ backgroundColor: colors.background }}
            >
              <div className="flex flex-col gap-2 md:gap-2.5 max-h-[45rem] overflow-y-auto p-3 md:p-4 lg:p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {filteredLectures.map((lecture) => (
                  <div
                    key={lecture.id}
                    className={`flex justify-between items-start rounded-lg cursor-pointer transition-all p-4 md:p-6 ${
                      lecture.selected 
                        ? "border border-[#174cd2] bg-[rgba(23,76,210,0.2)]" 
                        : "bg-white border border-transparent hover:border-gray-200"
                    }`}
                    style={{
                      borderColor: lecture.selected ? colors.primary : 'transparent',
                      backgroundColor: lecture.selected ? 'rgba(23, 76, 210, 0.2)' : 'white'
                    }}
                    onClick={() => toggleLecture(lecture.id)}
                  >
                    <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                      <svg className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0" viewBox="0 0 32 32" fill="none">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M16.0013 29.3333C23.3653 29.3333 29.3346 23.364 29.3346 16C29.3346 8.636 23.3653 2.66666 16.0013 2.66666C8.6373 2.66666 2.66797 8.636 2.66797 16C2.66797 23.364 8.6373 29.3333 16.0013 29.3333ZM14.26 21.128L20.5533 17.412C21.5946 16.796 21.5946 15.204 20.5533 14.588L14.26 10.872C13.2466 10.2747 12.0013 11.0533 12.0013 12.2853V19.716C12.0013 20.9467 13.2466 21.7253 14.26 21.128Z"
                          fill="#174CD2"
                        />
                      </svg>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm md:text-base text-[#1a212f] font-normal leading-[1.4] line-clamp-2">
                          {lecture.title}
                        </span>
                        {lecture.lectureNumber && lecture.lectureName && (
                          <span className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-1">
                            {lecture.lectureNumber}: {lecture.lectureName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex p-1 flex-col justify-center items-center ml-2">
                      <div className="relative flex p-1.5 md:p-2.5 justify-center items-center rounded-full">
                        {lecture.selected ? (
                          <>
                            <div 
                              className="w-4 h-4 md:w-[1.125rem] md:h-[1.125rem] rounded-[0.125rem]"
                              style={{ backgroundColor: colors.primary }}
                            ></div>
                            <svg className="absolute w-5 h-5 md:w-6 md:h-6 left-1.5 top-1.5 md:left-2 md:top-2" width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M10 16.4L6 12.4L7.4 11L10 13.6L16.6 7L18 8.4L10 16.4Z"
                                fill="white"
                              />
                            </svg>
                          </>
                        ) : (
                          <div className="w-4 h-4 md:w-[1.125rem] md:h-[1.125rem] rounded-[0.125rem] border-2 border-[#49454f]"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Assignments Header */}
        <div className="border-b border-[rgba(26,33,47,0.12)] pb-6 md:pb-8">
          <div className="max-w-full">
            <h2 className="text-lg md:text-xl font-semibold text-[#1A212F] mb-2 md:mb-3">
              {data.ui.titles.assignments}
            </h2>
            <p className="text-xs md:text-sm leading-5 md:leading-6 text-[rgba(26,33,47,0.7)]">
              {data.ui.messages.assignmentsDescription}
            </p>
          </div>
        </div>

        {/* Custom Assignment Checkbox */}
        <div className="mt-6 md:mt-8 flex items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="custom-assignment"
                checked={showAssignments}
                onChange={() => setShowAssignments(!showAssignments)}
                className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 cursor-pointer rounded border-gray-300 text-[#174cd2] focus:ring-[#174cd2]"
                style={{ color: colors.primary }}
              />
              <label htmlFor="custom-assignment" className="text-base md:text-lg lg:text-xl cursor-pointer text-[#1A212F]">
                {data.ui.titles.customAssignment}
              </label>
            </div>
          </div>
        </div>

        {/* Assignments Panel */}
        {showAssignments && (
          <div 
            className="mt-6 rounded-2xl border p-4 md:p-6"
            style={{ borderColor: colors.border, backgroundColor: colors.background }}
          >
            {/* Assignment Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                {/* Desktop title */}
                <h3 className="text-lg md:text-xl font-semibold text-[#1A212F] hidden md:block">
                  {data.ui.titles.selectedLectures}
                </h3>

                {/* Mobile title */}
                <h3 className="text-lg font-semibold text-[#1A212F] md:hidden">
                  {data.ui.titles.relatedAssignments}
                </h3>

                <p className="text-sm text-gray-600 mt-1">
                  {data.ui.titles.relatedAssignments} ({selectedAssignmentsCount} Selected)
                </p>
              </div>

              <button
                onClick={handleSelectAllAssignments}
                className="flex items-center gap-2 px-4 py-2 bg-white border text-blue-800 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full md:w-auto justify-center"
              >
                <div
                  className={`w-5 h-5 border rounded flex  items-center justify-center ${
                    selectAllAssignments
                      ? "bg-[#174cd2] border-[#174cd2]"
                      : "border-gray-400"
                  }`}
                  style={{ 
                    backgroundColor: selectAllAssignments ? colors.primary : 'white',
                    borderColor: selectAllAssignments ? colors.primary : '#d1d5db'
                  }}
                >
                  {selectAllAssignments && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium">{data.ui.buttons.selectAll}</span>
              </button>
            </div>

            {/* Assignment Groups */}
            {groupAssignmentsByCourse().map((group) => {
              if (group.lectures.length === 0) return null;

              const mobileLectureGroups = [];
              for (let i = 0; i < group.lectures.length; i += 4) {
                mobileLectureGroups.push(group.lectures.slice(i, i + 4));
              }

              const desktopLectureGroups = [];
              for (let i = 0; i < group.lectures.length; i += 4) {
                desktopLectureGroups.push(group.lectures.slice(i, i + 4));
              }

              return (
                <div
                  key={group.courseTitle}
                  className="assignment-row relative rounded-xl border border-[#dbe4ff] bg-[#f3f6ff] p-4 md:p-6 mb-6"
                >
                  <p className="text-xs text-gray-500 mb-4 line-clamp-1">
                    {group.courseTitle}
                  </p>

                  {/* Mobile accordion button */}
                  <button
                    onClick={() =>
                      setOpenCourse((prev) => ({
                        ...prev,
                        [group.courseTitle]: !prev[group.courseTitle],
                      }))
                    }
                    className="text-sm text-[#174cd2] mb-4 md:hidden flex items-center gap-1 hover:text-[#1342b5]"
                    style={{ color: colors.primary }}
                  >
                    {openCourse[group.courseTitle]
                      ? data.ui.buttons.hideLectures
                      : data.ui.buttons.viewLectures}
                    <span>
                      {openCourse[group.courseTitle] ? "▲" : "▼"}
                    </span>
                  </button>

                  {/* SVG Connectors (desktop only) */}
                  {isDesktop && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible hidden md:block">
                      {paths.map((path, index) => (
                        <path
                          key={index}
                          d={path}
                          fill="none"
                          stroke={colors.primary}
                          strokeWidth="2"
                          strokeOpacity="0.4"
                        />
                      ))}
                    </svg>
                  )}

                  <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 md:gap-8">
                    {/* Left - Lectures */}
                    <div className="flex flex-col gap-4 flex-1 max-w-full md:max-w-[400px]">
                      <div className="md:hidden">
                        {(openCourse[group.courseTitle] === undefined || openCourse[group.courseTitle]) && (
                          <div className="flex flex-col gap-4">
                            {mobileLectureGroups.map((lectureGroup, groupIndex) => (
                              <div key={`mobile-${groupIndex}`}>
                                {/* Lectures */}
                                <div className="flex flex-col gap-4 mb-4">
                                  {lectureGroup.map((lecture) => (
                                    <div
                                      key={lecture.id}
                                      className="bg-white rounded-lg px-4 py-3 text-sm font-medium text-[#1A212F] shadow-sm border border-gray-200"
                                    >
                                      {lecture.lectureNumber}: {lecture.lectureName}
                                    </div>
                                  ))}
                                </div>

                                {/* Assignment for this group (if exists) */}
                                {group.assignments[groupIndex] && (
                                  <div
                                    key={group.assignments[groupIndex].id}
                                    onClick={() => toggleAssignment(group.assignments[groupIndex].id)}
                                    className={`rounded-lg px-4 py-2 sm:py-4 mb-6 flex flex-col cursor-pointer transition-all ${
                                      group.assignments[groupIndex].selected
                                        ? "text-white shadow-lg border-2"
                                        : "bg-white border border-[#d1d5db] hover:border-[#174cd2]"
                                    }`}
                                    style={{ 
                                      backgroundColor: group.assignments[groupIndex].selected ? colors.primary : 'white',
                                      borderColor: group.assignments[groupIndex].selected ? colors.primary : '#d1d5db'
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {group.assignments[groupIndex].title}
                                      </span>
                                      <span className={`text-xs mt-1 ${group.assignments[groupIndex].selected ? 'text-blue-100' : 'text-gray-500'}`}>
                                        Contains {group.assignments[groupIndex].lectureIds.length} lecture(s)
                                      </span>
                                    </div>
                                    
                                    <div className="flex h-1 justify-end">
                                      <div
                                        className={`w-6 h-6 rounded-full mt-[-30px] flex items-center justify-center ${
                                          group.assignments[groupIndex].selected
                                            ? "text-[#174cd2]"
                                            : "border-2 border-gray-300"
                                        }`}
                                        style={{ 
                                          backgroundColor: group.assignments[groupIndex].selected ? 'white' : 'transparent',
                                          color: group.assignments[groupIndex].selected ? colors.primary : 'inherit'
                                        }}
                                      >
                                        {group.assignments[groupIndex].selected && (
                                          <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeWidth={3}
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="M5 13l4 4L19 7"
                                            />
                                          </svg>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Desktop View */}
                      <div className="hidden md:block">
                        {desktopLectureGroups.map((lectureGroup, groupIndex) => (
                          <div
                            key={`desktop-${groupIndex}`}
                            className={`flex flex-col gap-4 ${
                              groupIndex > 0 ? "md:mt-8" : "mb-20"
                            }`}
                          >
                            {lectureGroup.map((lecture) => (
                              <div
                                key={lecture.id}
                                ref={(el) => { lectureRefs.current[lecture.id] = el; }}
                                className="bg-white rounded-lg px-4 py-3 text-sm font-medium text-[#1A212F] shadow-sm border border-gray-200"
                              >
                                {lecture.lectureNumber}: {lecture.lectureName}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right - Assignments (Desktop only) */}
                    <div className="hidden md:flex flex-col gap-4 flex-1 max-w-full md:max-w-[400px]">
                      {group.assignments.map((assignment, assignmentIndex) => (
                        <div
                          key={assignment.id}
                          ref={(el) => { assignmentRefs.current[assignment.id] = el; }}
                          onClick={() => toggleAssignment(assignment.id)}
                          className={`rounded-lg px-4 md:px-6 py-4 mb-50 flex flex-col md:flex-row md:justify-between md:items-center cursor-pointer transition-all ${
                            assignment.selected
                              ? "text-white shadow-lg border-2"
                              : "bg-white border border-[#d1d5db] hover:border-[#174cd2]"
                          } ${assignmentIndex > 0 ? "md:mt-8" : ""}`}
                          style={{ 
                            backgroundColor: assignment.selected ? colors.primary : 'white',
                            borderColor: assignment.selected ? colors.primary : '#d1d5db'
                          }}
                        >
                          <div className="flex flex-col mb-2 md:mb-0">
                            <span className="text-sm font-medium">
                              {assignment.title}
                            </span>
                            <span className={`text-xs mt-1 ${assignment.selected ? 'text-blue-100' : 'text-gray-500'}`}>
                              Contains {assignment.lectureIds.length} lecture(s)
                            </span>
                          </div>

                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center self-end md:self-auto ${
                              assignment.selected
                                ? "text-[#174cd2]"
                                : "border-2 border-gray-300"
                            }`}
                            style={{ 
                              backgroundColor: assignment.selected ? 'white' : 'transparent',
                              color: assignment.selected ? colors.primary : 'inherit'
                            }}
                          >
                            {assignment.selected && (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeWidth={3}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty State */}
            {selectedLectures.length === 0 && (
              <div className="text-center py-10 text-gray-500 text-sm">
                {data.ui.messages.noLectures}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}