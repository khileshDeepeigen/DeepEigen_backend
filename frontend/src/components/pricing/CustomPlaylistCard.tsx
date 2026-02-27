import { Link } from "react-router-dom"
import "./styles/customplaylist.css"

const CustomPlaylistCard = () => {
    return (
        <div className="custom-playlist">
            <div className="playlist-header">
                <h2 className="playlist-title">Create Your Own Playlist</h2>
                <p className="playlist-description">Choose or select any courses or lectures of your liking and create a custom plan</p>
            </div>
            <Link to="/make_playlist">
                <button className="create-playlist-btn">Create Playlist →</button>
            </Link>
        </div>
    )
}

export default CustomPlaylistCard