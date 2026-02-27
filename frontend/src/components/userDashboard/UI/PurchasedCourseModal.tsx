import React from "react";

interface PurchasedCourseModalProps {
  onClose: () => void;
}

const PurchasedCourseModal: React.FC<PurchasedCourseModalProps> = ({ onClose }) => {
  const payments = [
    { id: 1, date: "12 June 2025", amount: "$12", status: "Paid" },
    { id: 2, date: "12 July 2025", amount: "$12", status: "Paid" },
    { id: 3, date: "12 Aug 2025", amount: "$12", status: "Paid" },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-2 sm:px-4 overflow-y-auto py-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl relative 
                      w-full max-w-[95%] xs:max-w-xs sm:max-w-md md:max-w-lg
                      max-h-[90vh] sm:max-h-[92vh] overflow-y-auto p-3 sm:p-4 md:p-6 my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 sm:top-3 sm:right-4 text-xl sm:text-2xl text-gray-500 hover:text-gray-700 cursor-pointer z-10"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-center text-lg sm:text-xl md:text-2xl mt-3 sm:mt-4 font-semibold text-gray-900">
          RL-1.0Y Payment History
        </h2>

        {/* Subtitle */}
        <p className="text-center text-gray-500 mt-1 mb-3 sm:mb-4 text-sm sm:text-base md:text-lg px-2">
          Fundamentals of Reinforcement Learning
        </p>

        {/* Course Info */}
        <div className="bg-gradient-to-r from-[#E5F4FF] to-[#F8FBFF] rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-5">
          <div className="flex flex-col xs:flex-row xs:items-center gap-1.5 xs:gap-2 sm:gap-3 md:gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Course:</span>
              <span className="text-xs sm:text-sm">Machine Learning</span>
            </div>
            <div className="hidden xs:block w-px h-3 sm:h-4 bg-gray-300"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Access till:</span>
              <span className="text-xs sm:text-sm">12 Dec 2025</span>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto -mx-1 sm:-mx-0">
          <table className="w-full text-xs sm:text-sm md:text-base text-left text-gray-700 min-w-[280px]">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2 sm:py-3 px-2 sm:px-3 font-medium whitespace-nowrap">Date</th>
                <th className="py-2 sm:py-3 px-2 sm:px-3 font-medium whitespace-nowrap">Amount</th>
                <th className="py-2 sm:py-3 px-2 sm:px-3 font-medium whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 sm:py-3 px-2 sm:px-3 whitespace-nowrap">{payment.date}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 whitespace-nowrap">{payment.amount}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 font-medium text-green-600 whitespace-nowrap">
                    {payment.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center mt-3 sm:mt-4 md:mt-5 pt-2 sm:pt-3 border-t border-gray-200">
          <span className="text-xs sm:text-sm md:text-base font-medium text-gray-700">Total Paid:</span>
          <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900">$36</span>
        </div>

        {/* Button */}
        <div className="mt-3 sm:mt-4 md:mt-5 text-center">
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 sm:py-2.5 md:py-3 px-4 sm:px-5 md:px-6 rounded-lg text-sm sm:text-base w-full sm:w-auto transition-colors whitespace-nowrap"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchasedCourseModal;