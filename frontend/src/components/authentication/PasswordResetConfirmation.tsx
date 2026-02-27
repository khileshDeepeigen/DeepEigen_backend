import { useState } from "react"

interface PasswordResetConfirmationProps {
  email: string
  // onResend?: () => Promise<void>
  onResend: () => void;

}

export function PasswordResetConfirmation({ email, onResend }: PasswordResetConfirmationProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")

  const handleResend = async () => {
    try {
      setIsResending(true)
      setResendMessage("")
      if (onResend) {
        await onResend()
      }
      setResendMessage("Email sent successfully!")
      setTimeout(() => setResendMessage(""), 3000)
    } catch {
      setResendMessage("Failed to resend email. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">A link to reset your password has been sent</h1>

        <p className="text-blue-600 font-medium mb-4">{email}</p>

        <p className="text-gray-600 text-sm mb-6">
          We've emailed you a link to reset your password. Please check your inbox (and spam folder just in case).
        </p>

        <div className="text-sm text-gray-600">
          <span>Can't find the email? </span>
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isResending ? "Sending..." : "Resend"}
          </button>
        </div>

        {resendMessage && (
          <p className={`text-sm mt-3 ${resendMessage.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
            {resendMessage}
          </p>
        )}
      </div>
    </div>
  )
}
