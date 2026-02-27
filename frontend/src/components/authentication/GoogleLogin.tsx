import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch } from "../../redux/store";
import { setUser } from "../../redux/slices/auth";
import { csrfFetch } from "../../utils/csrfFetch";

interface GoogleUser {
    email: string;
    name: string;
    picture: string;
    // add more fields if needed
}

const GoogleLoginButton: React.FC = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    return (
        <GoogleLogin
            onSuccess={(credentialResponse) => {
                const token = credentialResponse.credential;
                if (!token) return;

                const user: GoogleUser = jwtDecode(token);
                console.log("Google User:", user);

                // ✅ Using csrfFetch wrapper instead of bare fetch
                csrfFetch("http://localhost:8000/accounts/google-login/", {
                    method: "POST",
                    body: JSON.stringify({
                        token: token,
                    }),
                })
                    .then((res) => res.json())
                    .then((data) => {
                        console.log("Backend Response:", data);
                        // Save your backend token/session later
                        const user = data;
                        dispatch(setUser(user));
                        navigate("/user_dashboard");
                    })
                    .catch((err) => console.error("Error:", err));


            }}
            onError={() => {
                console.log("Google Login Failed");
            }}
        />
    );
};

export default GoogleLoginButton;
