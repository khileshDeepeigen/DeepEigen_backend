import "./heroSection.css";
import certificates from "../../assets/Hero/Images/certificate.svg"
import books from "../../assets/Hero/Images/books.svg"
import lab from "../../assets/Hero/Images/lab.svg"
import teacher from "../../assets/Hero/Images/teacher.svg"
import note from "../../assets/Hero/Images/note.svg"

import banner_video from "../../assets/Hero/Videos/Web-Video-1.mp4"
import drone_video from "../../assets/Hero/Videos/drone.mp4"
import roboarm_video from "../../assets/Hero/Videos/robo-arm.mp4"
import robodog_video from "../../assets/Hero/Videos/robo-dog.mp4"
import { useEffect, useState } from "react";


export default function HeroSection() {

  const videos = [drone_video, roboarm_video, robodog_video];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 5000)
    return ()=> clearInterval(interval);
  }, [videos.length]);


  return (
    <>
      <div className="home-container">
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

        {/* Hero Section */}
        <section className="hero">
          {/* Left Content */}
          <div className="hero__content">
            <div>
              <h2 className="hero__title">
                State of the Art AI Learning and Research Tools
              </h2>
              <p className="hero__desc">
                The most easiest and affordable AI & Machine Learning courses
                and research tools
              </p>
            </div>
            <button className="hero__cta">Join Now</button>
          </div>

          {/* Right Content - Hero Image */}
          <div className="hero__media">
            <div className="hero__media-oval">
              <video
              key={videos[currentIndex]}
                className="hero-banner__video fade-in"
                src={videos[currentIndex]}
                autoPlay
                loop
                muted
                playsInline
              ></video>
            </div>
          </div>
          
        </section>

        {/* Feature Cards */}
        <section className="features">
          {/* Basic to Advanced Courses */}
          <div className="feature">
            <img src={books} alt="Certificates" />
            <p className="feature__title">Basic to Advanced Courses</p>
          </div>

          <div className="divider" />

          {/* Access to Research Tools */}
          <div className="feature">
            <img src={lab} alt="Certificates" />
            <p className="feature__title">Access to Research Tools</p>
          </div>

          <div className="divider" />

          {/* Experienced Coach */}
          <div className="feature">
            <img src={teacher} alt="Certificates" />
            <p className="feature__title">Experienced Coach</p>
          </div>

          <div className="divider" />

          {/* Hands on Training */}
          <div className="feature">
            <img src={note} alt="Certificates" />
            <p className="feature__title">Hands on Training</p>
          </div>

          <div className="divider" />

          {/* Earn Certificates */}
          <div className="feature">
            <img src={certificates} alt="Certificates" />
            <p className="feature__title">Earn Certificates</p>
          </div>
        </section>
      </div>
    </>
  );
}
