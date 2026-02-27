import "./mediaComp.css";
import logo from "../../assets/Media/Images/image 4.svg"

const MediaComp = () => {
    const mediaItems = [
        {
            id: 1,
            logo: "../../assets/Media/Images/image 4.svg",
            title: "Online Education Startup Deep Eigen AI Labs Raises Funding to Offer Advanced Courses",
            description:
                "Deep Eigen AI Labs, an online education platform that focuses on offering graduate-level courses related to engineering, science, and mathematics (including, but not limited to, robotics, AI, and automation).",
            link: "#",
        },
        {
            id: 2,
            logo: "../../assets/Media/Images/image 4.svg",
            title: "Bhopal-Based Online Education Startup Deep Eigen AI Labs Raises $250,000 Funding",
            description:
                "Deep Eigen AI Labs was previously an internal education system at Swaayatt Robots. Its purpose was to let the team acquire the knowledge to be able to do cutting-edge research and keep up with...",
            link: "#",
        },
    ];

    return (
        <section className="media-coverage">
            <div className="media-container">
                <div className="media-header">
                    <h1 className="media-heading">Media Coverage</h1>
                    <p className="media-subheading">
                        Meet the incredible people who are making a difference at our organization.
                    </p>
                </div>

                <div className="media-grid">
                    {mediaItems.map((item) => (
                        <div key={item.id} className="media-card">
                            <div className="media-imagebox">
                                <div className="media-backgroundImage">
                                    <img src={logo} alt="" />
                                </div>
                                <img src={logo} alt="Media Logo" className="media-logo" />
                            </div>
                            <div className="media-content">
                                <h3 className="media-title">{item.title}</h3>
                                <p className="media-description">{item.description}</p>
                                <a href={item.link} className="media-button">
                                    Learn More
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MediaComp;
