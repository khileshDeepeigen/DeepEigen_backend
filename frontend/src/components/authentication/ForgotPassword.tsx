import { useState } from "react";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Email submitted:", email);
        // → send API request here
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="w-fit px-6">
                <h1 className="text-[40px] font-semibold text-center mb-3">
                    Forgot your password?
                </h1>

                <p className="text-xl text-center text-gray-600 mb-6">
                    Please enter your email and we will send you a <br /> link reset your password
                </p>

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Email<span className="text-[16px] text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="myname@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-md py-3 px-5 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-medium py-4 px-5 rounded-md hover:bg-blue-700 transition-all cursor-pointer"
                    >
                        Submit
                    </button>

                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
