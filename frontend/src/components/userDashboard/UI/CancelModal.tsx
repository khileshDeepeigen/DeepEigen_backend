import React from "react";

interface CancelModalProps {
  onClose: () => void;
}

const CancelModal: React.FC<CancelModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 px-3 sm:px-4 overflow-y-auto py-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-[95%] xs:max-w-xs sm:max-w-md p-3 sm:p-4 md:p-6 relative my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 sm:top-3 sm:right-4 text-lg sm:text-xl text-gray-500 hover:text-gray-700 cursor-pointer z-10"
        >
          ✕
        </button>

        {/* Warning Icon */}
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="bg-[#FFF4E5] p-2 sm:p-3 rounded-full">
            <span className="text-2xl sm:text-3xl">⚠️</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 px-2">
          Cancel Subscription?
        </h2>

        {/* Sub-title */}
        <p className="text-center text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base px-2">
          <span className="font-medium">Basic Plan</span>{" "}
          <span className="text-indigo-600 font-semibold">$15/Month</span>
        </p>

        {/* Description */}
        <p className="text-center text-gray-500 mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm leading-relaxed px-1 sm:px-2">
          Are you sure you want to cancel this subscription? You will lose access
          to all courses and resources provided in this plan.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center mt-4 sm:mt-5 md:mt-6 gap-2 sm:gap-3 md:gap-4">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 md:px-5 py-2 cursor-pointer rounded-md font-medium border border-purple-600 text-purple-700 hover:bg-purple-50 flex items-center justify-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base"
          >
            <span>←</span> Go Back
          </button>

          <button className="px-3 sm:px-4 md:px-5 py-2 cursor-pointer rounded-md font-medium border border-red-500 text-red-600 hover:bg-red-50 transition-colors text-sm sm:text-base">
            Cancel Subscription
          </button>
        </div>

        {/* Refund Policy Link */}
        <p className="text-center text-gray-500 text-xs mt-3 sm:mt-4 md:mt-5 px-1">
          To check the eligibility of refund, please refer our{" "}
          <a href="#" className="text-blue-600 underline hover:text-blue-800">
            Refund Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default CancelModal;