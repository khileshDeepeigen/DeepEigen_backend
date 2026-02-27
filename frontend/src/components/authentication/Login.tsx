// import { useEffect, useState } from 'react';
// import './auth.css'; // Import the external CSS file
// import { Link, useNavigate } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
// import type { AppDispatch } from '../../redux/store';
// import { setUser } from '../../redux/slices/auth';

// import GoogleLoginButton from './GoogleLogin';

// export interface User {
//   id: number;
//   name: string;
//   email: string;
//   role: "user" | "admin";
//   pass: string;
// }


// const Login: React.FC = () => {

//   const navigate = useNavigate();
//   const dispatch = useDispatch<AppDispatch>();

//   const [rememberMe, setRememberMe] = useState(false)

//   // State to toggle password visibility
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");

//   const [email, setEmail] = useState<string>("");
// const [password, setPassword] = useState<string>("");


// const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//   e.preventDefault();

//   setLoading(true);
//   setErrorMsg("");

//   // dummy credentials
//   const DUMMY_EMAIL = "test@deepeigen.ai";
//   const DUMMY_PASSWORD = "123456";

//   if (email === DUMMY_EMAIL && password === DUMMY_PASSWORD) {
//     const dummyUser = {
//       id: 1,
//       name: "Test User",
//       email: DUMMY_EMAIL,
//     };

//     dispatch(setUser(dummyUser));
//     navigate("/user_dashboard");
//   } else {
//     setErrorMsg("Invalid email or password");
//   }

//   setLoading(false);
// };


//   useEffect(() => {
//     fetch("http://localhost:8000/accounts/get-csrf-token", {
//       credentials: "include",
//     });
//   }, []);

//   return (
//     <div className="register-page">
//       {/* Left panel with branding and purple gradient */}

//       <div className="flex-[0_0_45%] bg-gradient-to-b from-[#1D1F8E] to-[#3d024f] text-white p-[80px_60px] flex justify-center items-center relative overflow-hidden">


//   <div className="slogan">
//     <h1 className="text-4xl font-bold tracking-wide">BRILLIANCE</h1>
//     <h1 className="text-4xl font-bold tracking-wide mt-2">INITIATED</h1>
//   </div>
// </div>

//       {/* Right panel with the registration form */}
//       <div className="register-panel-right">
//         <div className='register-sub'>



//         <h1 className="register-title">Login</h1>
//         <p className="register-subtitle">Let's continue the learning</p>

//         <form className="register-form" onSubmit={handleSubmit}>

//           <div className="form-group">
//             <label htmlFor="email">Email<span className="required">*</span></label>
//             <input
//               id="email"
//               type="email"
//               name="email"

//               placeholder="Enter email"
//              value={email}
//              onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           <div className="form-group password-group">
//             <label htmlFor="password">Password<span className="required">*</span></label>
//             <div className="password-input-container">
//               <input
//                 id="password"
//                 type={showPassword ? 'text' : 'password'}
//                 name="password"
//                 placeholder="Enter password"
//                 value={password}
//             onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//               <button
//                 type="button"
//                 className="password-toggle"
//                 onClick={() => setShowPassword(!showPassword)}
//                 aria-label={showPassword ? 'Hide password' : 'Show password'}
//               >
//                 {/* Icon Placeholder (using text for simplicity, could be an Eye icon) */}
//                 {showPassword ? '👁️' : '🔒'}
//               </button>
//             </div>
//           </div>

//           <div className='login__rememberMeForm'>
//             <label className='login__rememberMe'>
//               <input
//                 className='remember_checkbox'
//                 type="checkbox"
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//               />
//               <span>Remember me</span>
//             </label>
//             <Link to="/forgot_password" className='login__forgotPassword'>
//               Forgot password ?
//             </Link>
//           </div>

//           {errorMsg && (
//             <div className="w-full bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">
//               {errorMsg}
//             </div>
//           )}

//           <button type="submit" className="register-button">
//             {loading ? "Logging in..." : "login"}
//           </button>
//         </form>

//         <button className='gooogle'>
//           <GoogleLoginButton />
//         </button>

//         <p className="login-link-container">
//           Don't have an have an account? <Link to="/register" className="login-link">Register</Link>
//         </p>
//       </div>
//     </div>
//     </div>
//   );
// };

// export default Login;




import { useState } from "react";
import "./auth.css";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { setUser } from "../../redux/slices/auth";

import GoogleLoginButton from "./GoogleLogin";

// Define complete user interface matching backend response
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone_number?: string;
  profession?: string;
  country?: string;
  is_active: boolean;
  is_staff: boolean;
  is_superadmin: boolean;
  date_joined: string;
  last_login?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔑 REAL LOGIN HANDLER
  // Helper to get csrftoken from cookie
  function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(
      new RegExp("(^|; )" + name + "=([^;]*)")
    );
    return match ? decodeURIComponent(match[2]) : null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // Always fetch CSRF cookie before login POST
      await fetch("http://localhost:8000/accounts/csrf/", {
        credentials: "include",
      });

      const csrftoken = getCookie("csrftoken");

      const response = await fetch("http://localhost:8000/accounts/login/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrftoken ? { "X-CSRFToken": csrftoken } : {}),
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMsg(data.message || "Login failed");
        setLoading(false);
        return;
      }

      dispatch(
        setUser({
          id: data.user.id,
          email: data.user.email,
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          username: data.user.username,
          is_active: data.user.is_active,
          is_staff: data.user.is_staff,
          is_superadmin: data.user.is_superadmin,
          date_joined: data.user.date_joined,
          last_login: data.user.last_login,
          rememberMe,
        })
      );
      navigate("/user_dashboard");
    } catch (error) {
      setErrorMsg("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Left Panel */}
      <div className="flex-[0_0_45%] bg-gradient-to-b from-[#1D1F8E] to-[#3d024f] text-white p-[80px_60px] flex justify-center items-center">
        <div className="slogan">
          <h1 className="text-4xl font-bold tracking-wide">BRILLIANCE</h1>
          <h1 className="text-4xl font-bold tracking-wide mt-2">INITIATED</h1>
        </div>
      </div>

      {/* Right Panel */}
      <div className="register-panel-right">
        <div className="register-sub">
          <h1 className="register-title">Login</h1>
          <p className="register-subtitle">Let's continue the learning</p>

          <form className="register-form" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">
                Email<span className="required">*</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="form-group password-group">
              <label htmlFor="password">
                Password<span className="required">*</span>
              </label>
              <div className="password-input-container">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "🔒"}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="login__rememberMeForm">
              <label className="login__rememberMe">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot_password" className="login__forgotPassword">
                Forgot password ?
              </Link>
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="w-full bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">
                {errorMsg}
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="register-button">
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Google Login */}
          <button className="gooogle">
            <GoogleLoginButton />
          </button>

          <p className="login-link-container">
            Don't have an account?{" "}
            <Link to="/register" className="login-link">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
