import { useState } from "react"
import { Link } from "react-router-dom"

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: any) => any;
  }
}

type InstallmentType = "one" | "two" | "three"

export default function PaymentCard() {
  const [installment, setInstallment] =
    useState<InstallmentType>("three")

  const totalAmount = 120
  const installmentAmount =
    installment === "one"
      ? totalAmount
      : installment === "two"
        ? totalAmount / 2
        : totalAmount / 3

  const handlePayment = () => {
    const rzp = new window.Razorpay({
      key: "rzp_test_1DP5mmOlF5G5ag",
      amount: installmentAmount * 100,
      currency: "USD",
      name: "Deep Eigen AI Labs",
      theme: { color: "#174CD2" },
    })
    rzp.open()
  }

  return (
    <div className="min-h-screen bg-[#EEF2FF] font-bricolage relative">
      {/* Back */}
      <Link
        to="/user_dashboard"
        className="absolute top-6 sm:left-50 left-2 text-md font-bold text-gray-600 hover:text-gray-900"
      >
        ← Go back
      </Link>

      {/* Card */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-[880px] bg-white rounded-2xl shadow-sm px-6 py-7 sm:px-10 sm:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Purchase Summary
            </h1>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Order ID:</span> #20472183843
            </p>
          </div>

          {/* User Info */}
          <div className="bg-[#F3F6FC] rounded-xl px-5 py-3 flex flex-col sm:flex-row sm:justify-between gap-2 mb-10">
            <p className="text-sm text-gray-800">
              <span className="font-medium">Name:</span> John Doe
            </p>
            <p className="text-sm text-gray-800 break-all">
              <span className="font-medium">Registered Email:</span>{" "}
              johndoe@email.com
            </p>
          </div>

          {/* Subscribe */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-10">
            <p className="text-2xl font-semibold text-gray-900">
              Subscribe for
            </p>

            <div className="flex border border-blue-500 rounded-full p-1">
              {[
                { key: "one", label: "1 Month" },
                { key: "two", label: "6 Months" },
                { key: "three", label: "1 Year" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() =>
                    setInstallment(item.key as InstallmentType)
                  }
                  className={`px-5 py-2 text-sm rounded-full transition font-medium ${installment === item.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-700"
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Plan */}
          <div className="border-b mb-2 flex items-center justify-between pb-4">
            <p className="text-2xl  font-bold text-gray-900">
              Subscription Plan
            </p>

            <div>
              <p className="text-2xl font-semibold text-gray-900">
                ${totalAmount}
              </p>
            </div>

          </div>



          <div className=" pt-4 mb-4">
            <div className="flex justify-between gap-4">
              <div className="">






                <p className="text-md text-gray-600 mt-1 max-w-[520px]">
                  Basic – Essential & foundational courses
                </p>
              </div>

            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-md font-semibold text-gray-900">
              Total
            </p>
            <div className="text-right">
              <p className="text-xl font-semibold text-blue-600">
                ${installmentAmount.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">
                Per Year
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handlePayment}
            className="w-full h-12 bg-blue-700 hover:bg-blue-800 transition rounded-xl text-white font-semibold text-sm"
          >
            Pay ${installmentAmount.toFixed(0)}
          </button>
        </div>
      </div>
    </div>
  )
}
