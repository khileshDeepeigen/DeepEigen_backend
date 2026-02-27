// import "./auth.css"

// const Verification = () => {
//   return (
//     <div className="verification__container">
//       <div className="verification__header">
//         <h1 className="verification__title">Verify your email</h1>
//         <h3>We've sent an email to</h3>
//         <h4 className="verification__mail">myname@email.com</h4>
//       </div>

//       <div className="verification__desc">
//         <p>Just click on the link in that email to complete your signup.
//         If you don't see it, you may need to check your spam folder.</p>
//       </div>

//       <div className="verification__resend">
//         <p>Can't find the email? <span className="verification__click"> Resend Verification Email</span></p>
//       </div>
//     </div>
//   )
// }

// export default Verification  


import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./auth.css";

const Verification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); 
  const [message, setMessage] = useState("");

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!uid || !token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    const activateAccount = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/accounts/activate/${uid}/${token}/`
        );

        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage(data.message);

          // optional redirect after 3 sec
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.message);
        }
      } catch (error) {
        setStatus("error");
        setMessage("Server error. Please try again.");
      }
    };

    activateAccount();
  }, [uid, token, navigate]);

  return (
    <div className="verification__container">
      {status === "loading" && (
        <>
          <h1 className="verification__title">Verifying your email…</h1>
          <p>Please wait while we activate your account.</p>
        </>
      )}

      {status === "success" && (
        <>
          <h1 className="verification__title">Email Verified ✅</h1>
          <p>{message}</p>
          <p>Redirecting to login…</p>
        </>
      )}

      {status === "error" && (
        <>
          <h1 className="verification__title">Verification Failed ❌</h1>
          <p>{message}</p>
        </>
      )}
    </div>
  );
};

export default Verification;


