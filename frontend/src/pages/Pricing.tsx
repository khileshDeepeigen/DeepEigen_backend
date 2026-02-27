import SubscriptionCard from "../components/pricing/SubscriptionCard"

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      
      {/* Header */}
      <div className="max-w-4xl text-center mb-10">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
          Subscription Pricing
        </h1>

        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          Select the right learning package to accelerate your journey in AI and
          Applied Mathematics. Start with foundational courses in Car-A, expand
          into specialized fields with Car-B, or unlock everything with Full
          Access. Upgrade or adjust anytime — no hidden fees, just learning.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="w-full flex justify-center">
        <SubscriptionCard />
      </div>
    </div>
  )
}

export default Pricing
