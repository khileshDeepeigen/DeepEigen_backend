import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import type { FC } from "react";
import CourseCardITem from "../CourseCardITem";

interface Course {
  id: number;
  title: string;
  course_description: string;
  course_image: string;
  duration: string;
  category: string;
  assignments: number;
  indian_fee: number;
  originalPrice: string;
  url_link_name?: string;
  level: string;
}

interface CourseCardListProps {
  courses: Course[];
  useSwiper?: boolean;
}

const CourseCardList: FC<CourseCardListProps> = ({
  courses,
  useSwiper = false,
}) => {
  if (useSwiper) {
    return (
      <>
        {/* 📱 Mobile View — ONLY 3 cards (vertical, no swiper) */}
        <div className="grid grid-cols-1 gap-6 sm:hidden">
          {courses.slice(0, 3).map((course) => (
            <CourseCardITem key={course.id} course={course} />
          ))}
        </div>

        {/* 💻 Tablet & Desktop — Swiper */}
        <div className="relative hidden sm:block">
          {/* Navigation Buttons */}
          <div className="btn absolute -top-14 right-0 z-10 flex gap-2">
            <button className="swiper-prev flex h-9 w-9 items-center justify-center rounded-full bg-gray-500  cursor-pointer text-white">
              <span className="text-3xl"><i className="ri-arrow-left-s-line"></i></span>
            </button>
            <button className="swiper-next flex h-9 w-9 items-center justify-center rounded-full bg-gray-500 cursor-pointer text-white">
              <span className="text-3xl "><i className="ri-arrow-right-s-line"></i></span>
            </button>
          </div>

          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: ".swiper-prev",
              nextEl: ".swiper-next",
            }}
            spaceBetween={20}
            slidesPerView={3}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {courses.map((course) => (
              <SwiperSlide key={course.id}>
                <CourseCardITem course={course} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </>
    );
  }

  // Normal grid fallback
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCardITem key={course.id} course={course} />
      ))}
    </div>
  );
};

export default CourseCardList;
