import React from "react";

interface CustomPlanModalProps {
  onClose: () => void;
}

const CustomPlanModal: React.FC<CustomPlanModalProps> = ({ onClose }) => {
  const installments = [
    { id: 1, paid: "$10", status: "Paid" },
    { id: 2, paid: "$10", status: "Paid" },
    { id: 3, paid: "$0", status: "Due" },
    { id: 4, paid: "$0", status: "Due" },
    { id: 5, paid: "$0", status: "Due" },
    { id: 6, paid: "$0", status: "Due" },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-2 sm:px-4 overflow-y-auto py-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl relative 
                      w-full max-w-[95%] xs:max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl
                      max-h-[90vh] sm:max-h-[92vh] overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 sm:top-3 sm:right-4 text-xl sm:text-2xl md:text-3xl text-gray-500 hover:text-gray-700 cursor-pointer z-10"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-center text-lg sm:text-xl md:text-2xl lg:text-3xl mt-4 sm:mt-5 font-semibold text-gray-900">
          Custom plan
        </h2>

        {/* Subtitle */}
        <p className="text-center text-gray-500 mt-1 sm:mt-2 mb-4 sm:mb-5 text-sm sm:text-base md:text-lg lg:text-xl">
          Yearly Subscription
        </p>

        {/* TABLE */}
        <div className="overflow-x-auto -mx-1 sm:-mx-0">
          <table className="w-full text-xs sm:text-sm md:text-base text-left text-gray-700 min-w-[280px]">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2 sm:py-3 px-2 sm:px-3 font-medium whitespace-nowrap">Installment</th>
                <th className="py-2 sm:py-3 px-2 sm:px-3 font-medium whitespace-nowrap">Amount</th>
                <th className="py-2 sm:py-3 px-2 sm:px-3 font-medium whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {installments.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 sm:py-3 px-2 sm:px-3 whitespace-nowrap">Installment {item.id}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 whitespace-nowrap">{item.paid}</td>
                  <td
                    className={`py-2 sm:py-3 px-2 sm:px-3 font-medium whitespace-nowrap ${
                      item.status === "Paid" ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {item.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Button */}
        <div className="mt-4 sm:mt-5 text-center">
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 sm:py-2.5 md:py-3 px-4 sm:px-5 md:px-6 rounded-lg text-sm sm:text-base md:text-lg w-full sm:w-auto transition-colors whitespace-nowrap"
          >
            Okay, Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomPlanModal;