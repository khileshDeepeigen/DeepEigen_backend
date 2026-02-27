import { useState } from "react";
import { changePassword } from "../data/typesprofile";
import { spread } from "axios";

export default function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showReNew, setShowReNew] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password cannot be the same as current password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (response.success) {
        setSuccess(response.message || "Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(response.message || "Failed to change password");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Password change error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-full lg:max-w-md w-full">
      <h1 className="text-[#1A212F] text-[32px] lg:text-[40px] font-normal leading-normal tracking-[-0.64px] lg:tracking-[-0.8px] mb-6 lg:mb-10">
        Change Password
      </h1>
      <form className="max-w-full sm:ml-10  lg:max-w-md w-full space-y-4 lg:space-y-5" onSubmit={handleSubmit}>

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Avatar */}
        <div className="w-32 h-32 lg:w-40 lg:h-40 flex justify-center items-center rounded-xl bg-[rgba(0,0,0,0.04)] self-center lg:self-start">
          <svg
            className="w-[48px] h-[48px] lg:w-[68px] lg:h-[68px] flex-shrink-0"
            width="68"
            height="68"
            viewBox="0 0 68 68"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M33.9974 28.3334C40.2566 28.3334 45.3307 23.2593 45.3307 17.0001C45.3307 10.7409 40.2566 5.66675 33.9974 5.66675C27.7382 5.66675 22.6641 10.7409 22.6641 17.0001C22.6641 23.2593 27.7382 28.3334 33.9974 28.3334Z"
              fill="#1A212F"
              fillOpacity="0.4"
            />
            <path
              d="M56.6693 49.5833C56.6693 56.6241 56.6693 62.3333 34.0026 62.3333C11.3359 62.3333 11.3359 56.6241 11.3359 49.5833C11.3359 42.5424 21.4849 36.8333 34.0026 36.8333C46.5203 36.8333 56.6693 42.5424 56.6693 49.5833Z"
              fill="#1A212F"
              fillOpacity="0.4"
            />
          </svg>
        </div>
        {/* Current Password */}
        <div className="flex flex-col gap-1">
          <label className="text-sm lg:text-base font-medium text-gray-700">
            Current Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isLoading}
              className="border border-gray-300 rounded-md px-3 py-3 lg:py-4 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm lg:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter current password"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 disabled:opacity-50 cursor-pointer"
            >
              {showCurrent ? <span><i className="ri-eye-fill"></i></span> : <span><i className="ri-eye-off-fill"></i></span>}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="flex flex-col gap-1">
          <label className="text-sm lg:text-base font-medium text-gray-700">
            New Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              className="border border-gray-300 rounded-md px-3 py-3 lg:py-4 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm lg:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 disabled:opacity-50 cursor-pointer"
            >
              {showNew ? <span><i className="ri-eye-fill"></i></span> : <span><i className="ri-eye-off-fill"></i></span>}
            </button>
          </div>
        </div>

        {/* Re-enter Password */}
        <div className="flex flex-col gap-1">
          <label className="text-sm lg:text-base font-medium text-gray-700">
            Re-enter Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showReNew ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className="border border-gray-300 rounded-md px-3 py-3 lg:py-4 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm lg:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Re-enter new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowReNew(!showReNew)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 disabled:opacity-50 cursor-pointer"
            >
              {showReNew ? <span><i className="ri-eye-fill"></i></span> : <span><i className="ri-eye-off-fill"></i></span>}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full cursor-pointer bg-blue-600 text-white font-semibold py-2 lg:py-3 rounded-md hover:bg-blue-700 transition text-sm lg:text-base disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Changing...
            </>
          ) : (
            "Change Password"
          )}
        </button>
      </form>
    </div>
  );
}

