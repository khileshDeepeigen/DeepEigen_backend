import { useState } from "react"
import { useNavigate } from "react-router-dom"

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: any) => any;
  }
}

interface Lecture {
  id: string
  title: string
  price: number
  purchased?: boolean
}

export default function PlaylistSummary() {
  const [selectedDuration, setSelectedDuration] = useState<
    "1month" | "6months" | "1year"
  >("1year")

  const lectures: Lecture[] = Array.from({ length: 15 }).map((_, i) => ({
    id: `l${i + 1}`,
    title: "AI-102: Introduction to Fundamentals of Machine Learning",
    price: 1,
    purchased: i === 3 || i === 4,
  }))

  const lecturePrice = lectures
    .filter(l => !l.purchased)
    .reduce((s, l) => s + l.price, 0)

  const assignmentPrice = 10
  const total = lecturePrice + assignmentPrice
  const payAmount = 20

  const navigate = useNavigate()






    const handlePayment = () => {
        const options = {
            key: "rzp_test_1DP5mmOlF5G5ag", // 🔑 test key
            amount: 49900, // amount in paise (₹499)
            currency: "INR",
            name: "My App Name",
            description: "Test Payment",
            image: "https://your-logo-url.png",

            handler: function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string; }) {
                alert("Payment Successful 🎉");

                console.log("Payment ID:", response.razorpay_payment_id);
                console.log("Order ID:", response.razorpay_order_id); // undefined (no backend)
                console.log("Signature:", response.razorpay_signature); // undefined
            },

            prefill: {
                name: "Test User",
                email: "test@example.com",
                contact: "9999999999",
            },

            theme: {
                color: "#174cd2",
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

  return (
    <div className=" font-bricolage min-h-screen bg-[#e9effb] px-3 sm:px-4 md:px-8 lg:px-12 py-4 sm:py-6 md:py-10">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center font-bold sm:ml-35 gap-2 text-gray-700 mb-4 sm:mb-6 hover:text-blue-600"
      >
        ← <span className="text-sm sm:text-base font-bold">Go back</span>
      </button>

      {/* Card */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 md:p-8 lg:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">
            Playlist Summary
          </h1>
          <span className="text-xs sm:text-sm text-gray-600 font-medium">
            Order ID: #20472183843
          </span>
        </div>

        {/* Name / Email */}
        <div className="bg-[#f1f5fd] rounded-lg font-bricolage px-4 sm:px-6 py-3 sm:py-4 flex flex-col md:flex-row md:justify-between gap-2 md:gap-0 mb-6 sm:mb-8">
          <p className="text-xs sm:text-sm">
            <span className="font-medium">Name: </span>John Doe
          </p>
          <p className="text-xs font-bricolage sm:text-sm">
            <span className="font-medium">Registered Email: </span>
            johndoe@email.com
          </p>
        </div>

        {/* Subscription */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-sm sm:text-base font-medium mb-3">
            Subscribe for
          </h2>

          <div className="overflow-x-auto scrollbar-hide">
            <div className="inline-flex bg-blue-50 p-1 rounded-full gap-1">
              {[
                ["1month", "1 Month"],
                ["6months", "6 Months"],
                ["1year", "1 Year"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedDuration(key as "1month" | "6months" | "1year")}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition
                    ${
                      selectedDuration === key
                        ? key === "1year"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-blue-600 shadow"
                        : "text-gray-700 hover:bg-blue-100"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lectures */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm sm:text-base font-medium">
              Selected Lectures (15)
            </h3>
            <span className="text-lg sm:text-xl font-medium">
              ${lecturePrice}
            </span>
          </div>

          <div className="max-h-56 sm:max-h-64 md:max-h-72 overflow-y-auto space-y-2 pr-1 sm:pr-2">
            {lectures.map(l => (
              <div
                key={l.id}
                className="flex items-start sm:items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start sm:items-center gap-3 flex-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                    ▶
                  </div>
                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                    {l.title}
                  </p>
                </div>

                {l.purchased ? (
                  <span className="text-xs sm:text-sm text-green-600 font-medium">
                    Purchased
                  </span>
                ) : (
                  <span className="text-xs sm:text-sm text-gray-600">
                    ${l.price}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Assignment */}
        <div className="flex justify-between items-center py-4 border-t">
          <h3 className="text-sm sm:text-base font-medium">
            Custom Assignment
          </h3>
          <span className="text-lg sm:text-xl font-medium">
            ${assignmentPrice}
          </span>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center py-4">
          <h3 className="text-sm sm:text-base font-semibold">Total</h3>
          <span className="text-lg sm:text-xl font-semibold text-blue-600">
            ${total}
          </span>
        </div>

        {/* Pay */}
        <button
        onClick={handlePayment}
         className="w-full mt-2 bg-blue-600 text-white py-3 sm:py-4 rounded-xl text-base sm:text-lg font-medium hover:bg-blue-700 active:scale-[0.98] transition">
          Pay ${payAmount}
        </button>
      </div>
    </div>
  )
}
