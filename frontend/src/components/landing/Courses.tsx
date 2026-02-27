import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './courses.css';
import CourseCardList from '../courses/ui/CourseCardList';
import { API_BASE } from "../../utils/api";


export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
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

        // Backend returns data.courses array
        if (data.courses && Array.isArray(data.courses)) {
          setCourses(data.courses);
        } else {
          setError('Invalid response format');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load courses');
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="ai-courses-hero">
      <div className="ai-courses-container">
        <div className="ai-courses-header">
          <div className="header-content">
            <h1 className="course-hero-title">AI Courses</h1>
            <p className="course-hero-description">Explore all AI & ML courses from Basic to Advance</p>
          </div>
          <Link to="/showallcourses">
            <button className="explore-button">
              Explore All Courses <i className="ri-arrow-right-line"></i>
            </button>
          </Link>
        </div>

        <div className="courses-wrapper">
          {loading && <p style={{ textAlign: 'center', padding: '20px' }}>Loading courses...</p>}
          {error && <p style={{ textAlign: 'center', padding: '20px', color: 'red' }}>Error: {error}</p>}
          {!loading && courses.length > 0 && <CourseCardList courses={courses} useSwiper />}
          {!loading && courses.length === 0 && !error && <p style={{ textAlign: 'center', padding: '20px' }}>No courses available</p>}
        </div>
      </div>
    </div>
  );
}
