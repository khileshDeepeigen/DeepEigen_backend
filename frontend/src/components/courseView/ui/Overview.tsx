import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import instructorIcon from "../../../assets/Logo/ins.svg";
import videoIcon from "../../../assets/Logo/coursedeatils-icon2.svg";
import foreignIcon from "../../../assets/Logo/coursedeatils-icon3.svg";
import indiaIcon from "../../../assets/Logo/coursedeatils-icon4.svg";
import offeredIcon from "../../../assets/Logo/coursedeatils-icon5.svg";
import eggIcon from "../../../assets/Logo/coursedeatils-icon7.svg";
import { API_BASE } from "../../../utils/api";


interface Instructor {
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

interface Course {
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
}

interface CourseResponse {
  canonical_url: string;
  course: Course;
  instructors: Instructor[];
  sections: Section[];
  enrolled_user_flg: boolean;
}



const Overview: React.FC = () => {
  const { id, slug } = useParams();
  const [courseData, setCourseData] = useState<CourseResponse | null>(null);
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);





  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/courses/${id}/${slug}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data: CourseResponse = await res.json();
        // console.log("[Overview] API Response:", data);

        setCourseData(data);

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



  if (loading) return <p className="p-6">Loading course...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!courseData) return null;

  const { course, instructors, sections } = courseData;





  return (
    <div className="p-0 font-bricolage">
      {/* ================= Overview ================= */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          Overview
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {course.meta_description}
        </p>
      </div>

      {/* ================= Course Schema ================= */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Course Schema
        </h3>

        <div className="space-y-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200"
            >
              <span className="font-semibold text-gray-800 min-w-[70px]">
                {section.name}:
              </span>
              <span className="text-gray-900">
                {section.title} <br />   <span className="text-sm text-gray-600">{section.estimated_time}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= Course Details ================= */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Course Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6">
          {/* Instructor */}
          <div className="flex items-start gap-4">
            <div className="w-15 h-15 rounded-xl bg-blue-100 flex items-center justify-center">
              <img src={instructorIcon} alt="" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">
                Instructor
              </p>
              <p className="text-gray-900 font-medium">
                {instructors[0]?.name}
              </p>
            </div>
          </div>

          {/* Free Videos */}
          <div className="flex items-start gap-4">
            <div className="w-15 h-15 rounded-xl bg-green-100 flex items-center justify-center">
              <img src={videoIcon} alt="" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">
                Course Type
              </p>
              <p className="text-gray-900 font-medium">
                {course.course_type}
              </p>
            </div>
          </div>

          {/* Foreign Fee */}
          <div className="flex items-start gap-4">
            <div className="w-15 h-15 rounded-xl bg-purple-100 flex items-center justify-center">
              <img src={foreignIcon} alt="" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">
                Fee (Foreign)
              </p>
              <p className="text-gray-900 font-medium">
                ${course.foreign_fee}
              </p>
            </div>
          </div>

          {/* India Fee */}
          <div className="flex items-start gap-4">
            <div className="w-15 h-15 rounded-xl bg-orange-100 flex items-center justify-center">
              <img src={indiaIcon} alt="" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">
                Fee (India)
              </p>
              <p className="text-gray-900 font-medium">
                ₹{course.indian_fee}
              </p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-start gap-4">
            <div className="w-15 h-15 rounded-xl bg-pink-100 flex items-center justify-center">
              <img src={offeredIcon} alt="" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">
                Duration
              </p>
              <p className="text-gray-900 font-medium">
                {course.duration} Weeks
              </p>
            </div>
          </div>

          {/* Level */}
          <div className="flex items-start gap-4">
            <div className="w-15 h-15 rounded-xl bg-yellow-100 flex items-center justify-center">
              <img src={eggIcon} alt="" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">
                Level
              </p>
              <p className="text-gray-900 font-medium">
                {course.level}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Need Help ================= */}
      <div className="border border-gray-200 rounded-xl px-6 mb-10 py-5">
        <h4 className="text-blue-800 font-semibold mb-1">
          Need Help?
        </h4>
        <p className="text-sm text-gray-600">
          Reach out to us for any course-related questions.
        </p>
      </div>
    </div>
  );
};

export default Overview;
