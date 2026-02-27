import React, { useState, useEffect, useCallback } from 'react';
import './styles/courseView.css';
import { ChevronLeft } from 'lucide-react';
import { useParams, useLocation } from 'react-router-dom';
import video_c from '../../assets/Hero/Videos/drone.mp4';
import SideBar from './ui/SideBar';
import VideoPlayer from './ui/VideoPlayer';
import type { Week, TabType, Lecture } from './types/courseView';
import Overview from './ui/Overview';
import DiscussionForum from './ui/DiscussionForum';
import Announcements from './ui/Announcements';
import Assignments from './ui/Assignments';
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../utils/api";
import { csrfFetch } from "../../utils/csrfFetch";


// Interface for API response
interface CourseAPIResponse {
  success: boolean;
  course: {
    id: number;
    title: string;
    level: string;
    category: string;
  };
  sections: SectionData[];
  enrolled_user: {
    id: number;
    enrolled: boolean;
    end_at: string;
    full_access_flag: boolean;
    no_of_installments: number;
  } | null;
  title: string;
  canonical_url: string;
}

interface VideoData {
  id: number;
  title: string;
  link: string;
  type: string;
  duration: string;
}

interface ModuleData {
  id: number;
  name: string;
  title: string;
  videos: VideoData[];
}

interface SectionData {
  id: number;
  name: string;
  title: string;
  part_number: number;
  estimated_time?: string;
  total_assignments?: number;
  modules: ModuleData[];
}

const Index: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const params = useParams();
  const courseIdStr = params.id;
  const courseUrl = params.course_url || params.slug;
  const sectionUrl = params.section_url || params.sectionUrl;
  const courseId = courseIdStr ? parseInt(courseIdStr, 10) : undefined;

  // Get course title and image from navigation state
  const courseTitle = location.state?.courseTitle || '';
  const courseImage = location.state?.courseImage || null;


  // State for real data
  const [courseData, setCourseData] = useState<CourseAPIResponse | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const isReady = courseId && courseUrl && sectionUrl;
  const [_accessData, setAccessData] = useState<any>(null);
  const [_accessibleSectionIds, setAccessibleSectionIds] = useState<Set<number>>(new Set());
  const [_nextUnlockMessage, setNextUnlockMessage] = useState<string | null>(null);
  // Video player state
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'forum', label: 'Discussion' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'assignments', label: 'Assignments' }
  ];




  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId || !courseUrl) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await csrfFetch(`${API_BASE}/courses/${courseId}/${courseUrl}/overview`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Check if response is HTML (login page, 404, etc.)
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();

          if (text.includes('login') || text.includes('Login') || response.status === 302) {
            setError('Please log in to access this course.');
          } else {
            console.error('Received non-JSON response:', text.substring(0, 200));
            setError('Failed to load course data. Please try again.');
          }
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CourseAPIResponse = await response.json();
        // console.log('API Response course view:', data);


        if (data.success) {
          setCourseData(data);

          // Transform sections to weeks format
          const weeksData: Week[] = transformSectionsToWeeks(data.sections);

          // Fetch video progress to get completed videos
          try {
            console.log('Fetching video progress for course:', courseId);
            const progressResponse = await csrfFetch(`${API_BASE}/courses/${courseId}/get-video-progress/`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            console.log('Progress response status:', progressResponse.status);

            if (progressResponse.ok) {
              const progressData = await progressResponse.json();
              console.log('Progress data:', progressData);

              if (progressData.success && progressData.data.completed_videos) {
                const completedVideoIds = new Set(
                  progressData.data.completed_videos.map((v: { video_id: number }) => v.video_id)
                );
                console.log('Completed video IDs:', completedVideoIds);

                // Update weeks with completed status
                weeksData.forEach(week => {
                  week.sections.forEach(section => {
                    section.lectures.forEach(lecture => {
                      console.log('Checking lecture:', lecture.id, lecture.videoId, 'completed:', completedVideoIds.has(lecture.videoId));
                      if (completedVideoIds.has(lecture.videoId)) {
                        lecture.completed = true;
                      }
                    });
                  });
                });
              }
            } else {
              console.error('Failed to fetch progress:', progressResponse.status);
            }
          } catch (progressErr) {
            console.warn('Failed to fetch video progress:', progressErr);
          }




          try {
            console.log('Fetching accessible sections for course:', courseId);
            const accessResponse = await csrfFetch(`${API_BASE}/courses/${courseId}/sections/accessible/`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (accessResponse.ok) {
              const accessDataResponse = await accessResponse.json();
              console.log('Access data:', accessDataResponse);

              if (accessDataResponse.success && accessDataResponse.data.sections) {
                setAccessData(accessDataResponse.data);

                const accessibleIds = new Set<number>(
                  accessDataResponse.data.sections.map((s: any) => s.id)
                );
                setAccessibleSectionIds(accessibleIds);

                // Save the next unlock message for displaying to user
                if (accessDataResponse.data.access?.next_unlock_requirement) {
                  setNextUnlockMessage(accessDataResponse.data.access.next_unlock_requirement);
                  console.log('🔓 Unlock message:', accessDataResponse.data.access.next_unlock_requirement);
                }
              }
            } else {
              console.warn('Failed to fetch access data:', accessResponse.status);
              // If access check fails, allow full access (don't block user)
              const allSectionIds = new Set(data.sections.map(s => s.id));
              setAccessibleSectionIds(allSectionIds);
            }
          } catch (accessErr) {
            console.warn('Failed to fetch access data:', accessErr);
            // Fallback: allow access to all sections if API fails
            const allSectionIds = new Set(data.sections.map(s => s.id));
            setAccessibleSectionIds(allSectionIds);
          }


          setWeeks(weeksData);

          // Expand first week by default
          if (weeksData.length > 0) {
            setExpandedWeeks([weeksData[0].id]);
          }

          // Track last accessed course when course is loaded
          try {
            // ✅ Using csrfFetch wrapper for POST
            await csrfFetch(`${API_BASE}/accounts/track-last-accessed-course/`, {
              method: 'POST',
              body: JSON.stringify({
                course_id: courseId,
              }),
            });
            console.log('Course access tracked for course ID:', courseId);
          } catch (trackErr) {
            console.warn('Failed to track course access:', trackErr);
          }
        } else {
          setError('Failed to load course data');
        }
      } catch (err) {
        console.error('Failed to fetch course data:', err);
        setError('Failed to load course data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, courseUrl]);






  const transformSectionsToWeeks = (sections: SectionData[]): Week[] => {
    const weekMap = new Map<number, Week>();

    sections.forEach((section) => {
      const weekId = section.part_number;

      if (!weekMap.has(weekId)) {
        weekMap.set(weekId, {
          id: weekId,
          name: `Week - ${weekId}`,
          sections: []
        });
      }

      const week = weekMap.get(weekId)!;

      // Map section name to expected format
      let sectionName = 'Main Lectures';
      if (section.name.toLowerCase().includes('ta')) {
        sectionName = 'TA-Lectures';
      } else if (section.name.toLowerCase().includes('programming')) {
        sectionName = 'Programming Lectures';
      } else if (section.name.toLowerCase().includes('assignment')) {
        sectionName = 'Assignments';
      }

      // Check if section already exists
      let existingSection = week.sections.find(s => s.name === sectionName);
      if (!existingSection) {
        existingSection = {
          name: sectionName,
          lectures: []
        };
        week.sections.push(existingSection);
      }

      // Process modules and their videos
      if (section.modules && section.modules.length > 0) {
        section.modules.forEach((module) => {
          // Group videos by type within this module
          const mainVideos = module.videos.filter(v => v.type === 'main_lectures');
          const taVideos = module.videos.filter(v => v.type === 'ta_lectures');
          const progVideos = module.videos.filter(v => v.type === 'programming_lectures');


          // Add main lectures
          mainVideos.forEach((video) => {
            existingSection!.lectures.push({
              id: video.id,
              title: video.title,
              duration: video.duration || '00:00',
              completed: false,
              videoUrl: video.link,
              videoId: video.id,
              sectionId: section.id // Store the parent section ID for access control
            });
          });

          // Add TA lectures if any
          if (taVideos.length > 0) {
            let taSection = week.sections.find(s => s.name === 'TA-Lectures');
            if (!taSection) {
              taSection = {
                name: 'TA-Lectures',
                lectures: []
              };
              week.sections.push(taSection);
            }
            taVideos.forEach((video) => {
              taSection!.lectures.push({
                id: video.id,
                title: video.title,
                duration: video.duration || '00:00',
                completed: false,
                videoUrl: video.link,
                videoId: video.id,
                sectionId: section.id // Store the parent section ID for access control
              });
            });
          }

          // Add programming lectures if any
          if (progVideos.length > 0) {
            let progSection = week.sections.find(s => s.name === 'Programming Lectures');
            if (!progSection) {
              progSection = {
                name: 'Programming Lectures',
                lectures: []
              };
              week.sections.push(progSection);
            }
            progVideos.forEach((video) => {
              progSection!.lectures.push({
                id: video.id,
                title: video.title,
                duration: video.duration || '00:00',
                completed: false,
                videoUrl: video.link,
                videoId: video.id,
                sectionId: section.id // Store the parent section ID for access control
              });
            });
          }
        });
      } else {
        // Fallback: use section data as lecture if no modules
        existingSection.lectures.push({
          id: section.id,
          title: section.title || section.name,
          duration: section.estimated_time || '00:00',
          completed: false,
          sectionId: section.id // Store the parent section ID for access control
        });
      }
    });

    return Array.from(weekMap.values());
  };





  const toggleWeek = (weekId: number) => {
    setExpandedWeeks((prev) =>
      prev.includes(weekId) ? prev.filter((id) => id !== weekId) : [...prev, weekId]
    );
  };

  // Handle lecture click to play video
  const handleLectureClick = useCallback((lecture: Lecture) => {
    setCurrentLecture(lecture);

    // Save video progress to backend when user clicks on a video
    const saveVideoProgress = async () => {
      if (courseId && lecture.videoId) {
        try {
          // Get section ID from the current section URL
          const sectionId = courseData?.sections?.[0]?.id || 1;

          // ✅ Using csrfFetch wrapper for POST
          await csrfFetch(`${API_BASE}/courses/save-video-progress/`, {
            method: 'POST',
            body: JSON.stringify({
              video_id: lecture.videoId,
              course_id: courseId,
              section_id: sectionId,
              completed: false,
            }),
          });
          console.log('Video progress saved for:', lecture.title);
        } catch (err) {
          console.warn('Failed to save video progress:', err);
        }
      }
    };

    // Save progress when lecture is clicked
    saveVideoProgress();


    // console.log('Lecture clicked:', lecture);
    // console.log('Video URL:', lecture.videoUrl);



    if (lecture.videoUrl) {
      setCurrentVideoUrl(lecture.videoUrl);
      console.log('Setting actual video URL:', lecture.videoUrl);
    } else {
      console.log('No video URL found, using fallback');
      setCurrentVideoUrl(video_c);
    }
    setActiveTab('overview');
  }, [courseId, courseData]);



  // Helper to find next/previous lecture
  const findNextLecture = useCallback(() => {
    if (!currentLecture) return null;

    for (const week of weeks) {
      for (const section of week.sections) {
        const lectureIndex = section.lectures.findIndex(l => l.id === currentLecture.id);
        if (lectureIndex !== -1 && lectureIndex < section.lectures.length - 1) {
          return section.lectures[lectureIndex + 1];
        }
        if (lectureIndex !== -1 && lectureIndex === section.lectures.length - 1) {
          // Check next section in same week
          const sectionIndex = week.sections.findIndex(s => s.name === section.name);
          if (sectionIndex !== -1 && sectionIndex < week.sections.length - 1) {
            return week.sections[sectionIndex + 1].lectures[0];
          }
        }
      }
    }
    return null;
  }, [currentLecture, weeks]);




  const findPreviousLecture = useCallback(() => {
    if (!currentLecture) return null;

    for (const week of weeks) {
      for (const section of week.sections) {
        const lectureIndex = section.lectures.findIndex(l => l.id === currentLecture.id);
        if (lectureIndex !== -1 && lectureIndex > 0) {
          return section.lectures[lectureIndex - 1];
        }
        if (lectureIndex !== -1 && lectureIndex === 0) {
          // Check previous section in same week
          const sectionIndex = week.sections.findIndex(s => s.name === section.name);
          if (sectionIndex !== -1 && sectionIndex > 0) {
            const prevSection = week.sections[sectionIndex - 1];
            return prevSection.lectures[prevSection.lectures.length - 1];
          }
        }
      }
    }
    return null;
  }, [currentLecture, weeks]);



  const handleVideoEnded = useCallback(() => {
    // Mark current lecture as completed
    if (currentLecture) {
      // Update the weeks state to mark this lecture as completed
      setWeeks(prevWeeks => {
        return prevWeeks.map(week => ({
          ...week,
          sections: week.sections.map(section => ({
            ...section,
            lectures: section.lectures.map(lecture =>
              lecture.id === currentLecture.id
                ? { ...lecture, completed: true }
                : lecture
            )
          }))
        }));
      });

      // Save video progress to backend with completed: true
      const markVideoCompleted = async () => {
        if (courseId && currentLecture.videoId) {
          try {
            const sectionId = courseData?.sections?.[0]?.id || 1;

            // ✅ Using csrfFetch wrapper for POST
            await csrfFetch(`${API_BASE}/courses/save-video-progress/`, {
              method: 'POST',
              body: JSON.stringify({
                video_id: currentLecture.videoId,
                course_id: courseId,
                section_id: sectionId,
                completed: true,
              }),
            });
            console.log('Video marked as completed:', currentLecture.title);
          } catch (err) {
            console.warn('Failed to mark video as completed:', err);
          }
        }
      };

      markVideoCompleted();
    }

    // Move to next lecture
    const nextLecture = findNextLecture();
    if (nextLecture) {
      handleLectureClick(nextLecture);
    }
  }, [currentLecture, courseId, courseData, findNextLecture, handleLectureClick]);

  // Handle video progress - mark as completed when 90% watched
  // Only update progress bar, do not mark completed or switch video here
  const handleVideoProgress = useCallback((_progress: number) => {
    // No completion logic here, only update progress bar
  }, []);




  // Handle back button - return to previous page or fallback
  const handleBackBtn = () => {
    const locationState = location.state as { returnTo?: string; from?: string } | null;
    const returnTo = locationState?.returnTo;

    // If we have a valid return path that's not the current page, use it
    if (returnTo && returnTo !== location.pathname) {
      navigate(returnTo, { replace: true });
    } else {
      // Try browser history first, then fallback
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/user_dashboard", { replace: true });
      }
    }
  };





  const renderTabContent = () => {
    if (loading) {
      return <div className="loading-container">Loading course content...</div>;
    }

    if (error) {
      return <div className="error-container">{error}</div>;
    }

    switch (activeTab) {
      case 'overview':
        if (!isReady) {
          return <div>Loading overview...</div>;
        }
        return <Overview />;

      case 'forum':
        return (
          <DiscussionForum
            courseId={courseId}
            courseUrl={courseUrl}
            sectionUrl={sectionUrl || 'main-lectures'}
            sectionId={courseData?.sections[0]?.id || 1}
          />
        );
      case 'announcements':
        return <Announcements />;
      case 'assignments':
        return (
          <Assignments
            courseId={courseId}
            courseUrl={courseUrl}
          />
        );
      default:
        return <Overview />;
    }
  };




  const displayTitle = courseTitle || courseData?.course?.title || 'Course';

  return (
    <div className="course-view-wrapper">
      <div className='course-view-container'>
        <div className="course-view-main">
          <div className="course-view-header">
            <button
              onClick={handleBackBtn}
              className="back-button"
            >
              <ChevronLeft size={26} />
              <span className=''>{displayTitle}</span>
            </button>
          </div>

          <div className="video-section">
            {currentVideoUrl && currentLecture ? (
              <VideoPlayer
                key={currentLecture.id}
                src={currentVideoUrl}
                title={currentLecture.title}
                autoPlay={true}
                onNext={() => {
                  const next = findNextLecture();
                  if (next) handleLectureClick(next);
                }}
                onPrevious={() => {
                  const prev = findPreviousLecture();
                  if (prev) handleLectureClick(prev);
                }}
                hasNext={!!findNextLecture()}
                hasPrevious={!!findPreviousLecture()}
                onEnded={handleVideoEnded}
                onProgress={handleVideoProgress}
              />
            ) : courseImage ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <img src={courseImage} alt={displayTitle} className="w-full h-full object-contain" />
              </div>
            ) : (
              <video
                src={video_c}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full"
              />
            )}
          </div>

          <div className="course-view-sidebar-mobile">
            <SideBar
              weeks={weeks}
              expandedWeeks={expandedWeeks}
              toggleWeek={toggleWeek}
              onLectureClick={handleLectureClick}
              currentLectureId={currentLecture?.id}
              accessibleSectionIds={_accessibleSectionIds}
              courseId={courseId}
              enrollmentData={courseData?.enrolled_user}
            />
          </div>

          <div className="tabs-container">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id as TabType)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {renderTabContent()}
        </div>

        <div className="course-view-sidebar">
          <SideBar
            weeks={weeks}
            expandedWeeks={expandedWeeks}
            toggleWeek={toggleWeek}
            onLectureClick={handleLectureClick}
            currentLectureId={currentLecture?.id}
            accessibleSectionIds={_accessibleSectionIds}
            courseId={courseId}
            enrollmentData={courseData?.enrolled_user}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;

