import "../landing/footer.css"
import { FaLinkedin, FaTwitter} from "react-icons/fa"; // or any icons you prefer
import { IoCall } from "react-icons/io5";
import { IoMdMail } from "react-icons/io";
const SocialIcons = () => {
  return (
    <div className="social-icons">
      <a
        href="https://github.com/deepeigen"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
      >
        <IoCall />
      </a>
      <a
        href="https://instagram.com/deepeigen"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
      >
        <IoMdMail />
      </a>
      <a
        href="https://twitter.com/deepeigen"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Twitter"
      >
        <FaTwitter />
      </a>
      <a
        href="https://www.linkedin.com/company/deepeigen"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
      >
        <FaLinkedin />
      </a>
    </div>
  );
};

export default SocialIcons;
