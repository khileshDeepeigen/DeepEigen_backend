import CourseCardList from "../courses/ui/CourseCardList"
import CustomPlaylistCard from "./CustomPlaylistCard";
import SubscriptionCard from "./SubscriptionCard";

import "./styles/pricing.css"

const index = () => {

    const allCourses = [
        {
            id: 1,
            title: "AI-1.0Z: Introduction to Fundamentals of Machine Learning",
            course_description: "A theoretically deep 7 weeks course to provide the fundamentals of machine learning with mathematical rigour, to for necessary prerequisites for other courses.",
            duration: "6 Months",
            category: "1A",
            assignments: 28,
            indian_fee: 999,
            originalPrice: "5,999",
            course_image: "https://api.builder.io/api/v1/image/assets/TEMP/d534ad339983623000d55526c9a3e7a6d8407489?width=734"
        },
        {
            id: 2,
            title: "AI-1.0Z: Introduction to Fundamentals of Machine Learning",
            course_description: "A theoretically deep 7 weeks course to provide the fundamentals of machine learning with mathematical rigour, to for necessary prerequisites for other courses.",
            duration: "6 Months",
            category: "1A",
            assignments: 28,
            indian_fee: 999,
            originalPrice: "5,999",
            course_image: "https://api.builder.io/api/v1/image/assets/TEMP/d534ad339983623000d55526c9a3e7a6d8407489?width=734"
        },
        {
            id: 3,
            title: "AI-1.0Z: Introduction to Fundamentals of Machine Learning",
            course_description: "A theoretically deep 7 weeks course to provide the fundamentals of machine learning with mathematical rigour, to for necessary prerequisites for other courses.",
            duration: "6 Months",
            category: "1A",
            assignments: 28,
            indian_fee: 999,
            originalPrice: "5,999",
            course_image: "https://api.builder.io/api/v1/image/assets/TEMP/d534ad339983623000d55526c9a3e7a6d8407489?width=734"
        },
        {
            id: 4,
            title: "AI-1.0Z: Introduction to Fundamentals of Machine Learning",
            course_description: "A theoretically deep 7 weeks course to provide the fundamentals of machine learning with mathematical rigour, to for necessary prerequisites for other courses.",
            duration: "6 Months",
            category: "1A",
            assignments: 28,
            indian_fee: 999,
            originalPrice: "5,999",
            course_image: "https://api.builder.io/api/v1/image/assets/TEMP/d534ad339983623000d55526c9a3e7a6d8407489?width=734"
        },
        {
            id: 5,
            title: "AI-1.0Z: Introduction to Fundamentals of Machine Learning",
            course_description: "A theoretically deep 7 weeks course to provide the fundamentals of machine learning with mathematical rigour, to for necessary prerequisites for other courses.",
            duration: "6 Months",
            category: "1A",
            assignments: 28,
            indian_fee: 999,
            originalPrice: "5,999",
            course_image: "https://api.builder.io/api/v1/image/assets/TEMP/d534ad339983623000d55526c9a3e7a6d8407489?width=734"
        },
        {
            id: 6,
            title: "AI-1.0Z: Introduction to Fundamentals of Machine Learning",
            course_description: "A theoretically deep 7 weeks course to provide the fundamentals of machine learning with mathematical rigour, to for necessary prerequisites for other courses.",
            duration: "6 Months",
            category: "1A",
            assignments: 28,
            indian_fee: 999,
            originalPrice: "5,999",
            course_image: "https://api.builder.io/api/v1/image/assets/TEMP/d534ad339983623000d55526c9a3e7a6d8407489?width=734"
        }
    ];

    return (
        <>
            <div className="Pricing-page-wrapper">
                <div className="Pricing__UserHeader">
                    <h1>
                        Subscribtion Pricing
                    </h1>
                    <p >  Select the right learning package to accelerate your journey in AI and Applied Mathematics     Start with foundational courses in Car-A, expand into specialized fields with Car-B, or unlock everything with Full Access. Upgrade or adjust anytime... no hidden fees, just learning.</p>
                </div>

                <div className="Pricing__Container">
                    <SubscriptionCard />

                    <div className="or-divider">
                        <div className="line"></div>
                        <span>Or</span>
                        <div className="line"></div>
                    </div>

                    <CustomPlaylistCard />
                    
                    <div className="P__Courses">
                        <div className="P__Course_Header">
                            <h1>All Courses</h1>
                            <p>Explore all AI & ML courses from Basic to Advance</p>
                        </div>
                        <CourseCardList courses={allCourses} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default index