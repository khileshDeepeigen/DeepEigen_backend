import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import "swiper/css";

const ReminderSwiperCard = () => {
  const reminders = [
    {
      title: "Payment reminder",
      course: "AI-1.0Z: Introduction to Fundamentals of Machine Learning",
      due: "November 02, 2025",
      amount: "$12",
    },
    {
      title: "Payment reminder",
      course: "ML-2.0Z: Deep Learning Essentials",
      due: "November 15, 2025",
      amount: "$25",
    },
    {
      title: "Payment reminder",
      course: "AI-3.0Z: Advanced Neural Networks",
      due: "December 01, 2025",
      amount: "$40",
    },
  ];

  return (
    <div className="w-full px-2 sm:px-4">
      <Swiper
        modules={[Pagination]}
        pagination={{ 
          clickable: true,
          bulletClass: 'swiper-pagination-bullet',
          bulletActiveClass: 'swiper-pagination-bullet-active'
        }}
        spaceBetween={16}
        slidesPerView={1}
        className="w-full max-w-[1150px] mx-auto"
      >
        {reminders.map((item, i) => (
          <SwiperSlide key={i}>
            <div className="flex justify-center px-2 sm:px-0">
              <div className="bg-[#ffd06c] p-4 sm:p-6 md:p-8 rounded-xl w-full">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6 lg:gap-8">
                  {/* Left Section */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-[#1a212f] font-bricolage text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">
                      {item.title} {i + 1}
                    </h2>
                    <div className="pb-3 sm:pb-4">
                      <p className="text-[rgba(26,33,47,0.7)] text-xs sm:text-sm md:text-base leading-relaxed">
                        <span>Your course: </span>
                        <span className="font-semibold">{item.course}</span>{" "}
                        payment is due. Please complete the payment to continue
                        uninterrupted access to courses and learning tools.
                      </p>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex flex-col items-center lg:items-start gap-3 sm:gap-4 w-full lg:w-auto">
                    <button className="bg-[#174cd2] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base w-full lg:w-auto hover:bg-[#1546c0] transition-colors">
                      Pay {item.amount}
                    </button>
                    <p className="text-[rgba(26,33,47,0.7)] text-xs sm:text-sm">
                      Due on {item.due}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Custom Swiper Pagination Styles */}
      
    </div>
  );
};

export default ReminderSwiperCard;