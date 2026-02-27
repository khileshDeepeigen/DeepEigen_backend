import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_BASE } from "../../../utils/api";

interface Course {
  id: number;
  title: string;
  course_description: string;
  course_image: string;
  duration: number;
  category: string;
  level: string;
  indian_fee: number;
  foreign_fee: number;
  url_link_name: string;
  assignments?: number;
  originalPrice?: string;
}

export default function Showallcourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE}/courses/`);

        if (!response.ok) {
          throw new Error(`Failed to fetch courses: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched courses:', data);

        // Backend returns array directly
        if (Array.isArray(data)) {
          setCourses(data);
        } else if (data.courses && Array.isArray(data.courses)) {
          // Fallback: check for data.courses
          setCourses(data.courses);
        } else {
          setError('Invalid response format');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load courses');
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="ai-courses-hero">
        <div className="ai-courses-container">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-white text-xl">Loading courses...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-courses-hero">
        <div className="ai-courses-container">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-red-400 text-xl">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-black py-16">
      <div className="max-w-[85vw] mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-start mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center ml-6 gap-2 cursor-pointer text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>
          </div>



          <h1
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            className="text-4xl md:text-5xl text-gray-700 font-semibold mb-4"
          >
            AI Courses
          </h1>



          <p className="text-gray-500 text-lg">
            Explore all AI & ML courses from Basic to Advance
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {courses.map((course) => {
            const courseUrl = course.url_link_name
              ? `/courses/${course.id}/${course.url_link_name}`
              : `/courses/${course.id}`;

            const buyCourseUrl = course.url_link_name
              ? `/buycourse/${course.id}/${course.url_link_name}`
              : `/buycourse/${course.id}`;

            return (
              <div
                key={course.id}
                className=" rounded-2xl border border-gray-200 overflow-hidden shadow-lg flex flex-col"
              >
                {/* Image */}
                <div className="relative group">
                  <img
                    src={
                      course.course_image?.startsWith("http")
                        ? course.course_image
                        : `${API_BASE}${course.course_image}`
                    }
                    alt={course.title}
                    className="w-full h-56 object-cover  transition duration-500"
                  />

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-300">
                    <Link
                      to={courseUrl}
                      className="bg-white text-black px-5 py-2 rounded-lg font-semibold"
                    >
                      View Course →
                    </Link>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold">
                    {course.title}
                  </h3>

                  <p className="text-gray-400 text-sm line-clamp-3">
                    {course.course_description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex justify-between text-sm text-gray-400 border-t border-b border-slate-300 py-4">
                    <div>
                      <p className="text-gray-500">Duration</p>
                      <p className="text-black font-medium">
                        {course.duration} months
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Category</p>
                      <p className="text-black font-medium">
                        {course.category}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Level</p>
                      <p className="text-black font-medium">
                        {course.level}
                      </p>
                    </div>
                  </div>

                  {/* Price + Button */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-end gap-2">
                      <div className="flex items-baseline font-semibold text-lg">
                        <span className="mr-0.5">₹</span>
                        <span>{course.indian_fee}</span>
                      </div>

                      {course.foreign_fee && (
                        <span className="text-sm text-gray-400 line-through">
                          ${course.foreign_fee}
                        </span>
                      )}
                    </div>

                    <Link
                      to={buyCourseUrl}
                      className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition"
                    >
                      Buy Course
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {courses.length === 0 && !loading && (
          <div className="flex items-center justify-center min-h-[200px]">
            <p className="text-gray-400 text-xl">
              No courses available
            </p>
          </div>
        )}
      </div>
    </div>

  );
}
