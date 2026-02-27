import { useEffect, useState } from "react";
import { getRequest } from "../../utils/api";
import "./styles/courses.css"
import CourseCardList from "./ui/CourseCardList";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
// import { API_BASE } from "./data/api.ts";
import { API_BASE } from "../../utils/api";




// Type definition for course data from API
interface ApiCourse {
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

// Type definition for component course data
interface CourseCard {
  id: number;
  title: string;
  course_description: string;
  duration: string;
  category: string;
  assignments: number;
  indian_fee: number;
  originalPrice: string;
  course_image: string;
  url_link_name: string;
}

const Courses = () => {
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await getRequest("courses/");
      
      if (res?.data?.success && Array.isArray(res.data.courses)) {
        // Transform API response to component format
        const mappedCourses: CourseCard[] = res.data.courses.map((course: ApiCourse) => ({
          id: course.id,
          title: course.title,
          course_description: `${course.category} course - ${course.duration} weeks`,
          duration: `${course.duration} weeks`,
          category: course.category,
          assignments: 0, // Not available in courses list API
          indian_fee: course.indian_fee,
          originalPrice: "5,999", // Default value
          // course_image: course.course_image || "",
          course_image: course.course_image ? `${API_BASE}${course.course_image}` : "",

          url_link_name: course.url_link_name
        }));
        
        setCourses(mappedCourses);
        setError(null);
      } else {
        setError("Failed to load courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <section className="CourseComp">
      <div className="CourseComp-container">
        <Link to="/">
          <button className="flex items-center gap-2 text-gray-600 font-bold py-2 px-0 sm:px-24 rounded">
            <FaArrowLeft />
            Back
          </button>
        </Link>
        
        <div className="CourseComp-header">
          <h1 className="CourseComp-heading">Courses</h1>
          <p className="CourseComp-subheading">
            Explore all AI & ML courses from Basic to Advance
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading courses...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="text-red-500 text-lg mb-2">⚠️</div>
              <p className="text-gray-600">{error}</p>
              <button 
                onClick={fetchCourses}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Course List */}
        {!loading && !error && (
          <CourseCardList courses={courses} />
        )}
        
        {/* Empty State */}
        {!loading && !error && courses.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">📚</div>
              <p className="text-gray-600">No courses available at the moment.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Courses
