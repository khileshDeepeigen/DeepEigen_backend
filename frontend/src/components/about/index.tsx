import InstructorProfile from "./InstructorProfile"
import SanjeevsharmaImage from "../../assets/AboutUs/Images/sanjeevLNCT.png"
import banner_video from "../../assets/Hero/Videos/Web-Video-1.mp4"
import './styles/aboutus.css'
import TeamSection from "../team"

const index = () => {

    const instructorData = {
        name: "Sanjeev Sharma",
        title: "Instructor",
        bio: `He has been researching in motion planning, decision making under uncertainty and autonomous navigation since 2008.
            Over the past four years his research spanned across several areas of autonomous driving, including deep learning, computer vision, SLAM and visual odometry.
            He is a recipient of the AI Most Impact Global Smart Leaders Award in 2018. He is also a recipient of Top 40 Under 40 Data Scientist in India in 2019 award.
            His research at Swapapti Robots is to enable autonomous driving on Indian roads, has been covered by both the national and international media on several occasions.`,
        visionStatement: "Our vision is to educate a billion people & provide highest quality of knowledge through our courses, making cutting-edge education affordable and available to everyone",
        imageUrl: SanjeevsharmaImage,
    }

    return (
        <div className="about-us-wrapper">
            <div className="about-us-container">

                {/* Brilliance Initiated Banner */}
                <div className="hero-banner">
                    <video
                        className="hero-banner__video"
                        src={banner_video}
                        autoPlay
                        loop
                        muted
                        playsInline
                    ></video>
                    <div className="hero-banner__overlay"></div>
                    <h1 className="hero-banner__title">Brilliance Initiated</h1>
                </div>
                <InstructorProfile {...instructorData} />
                <TeamSection />
            </div>
        </div>
    )
}

export default index