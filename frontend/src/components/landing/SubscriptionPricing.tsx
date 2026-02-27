import CustomPlaylistCard from '../pricing/CustomPlaylistCard';
import SubscriptionCard from '../pricing/SubscriptionCard';
import './subscriptionPricing.css';

export default function SubscriptionPricing() {
  return (
    <div className="Subscription-container-wrapper">
      <div className="pricing-header">
        <h1 className="pricing-title">Subscription Pricing</h1>
        <p className="pricing-description">
          Select the right learning package to accelerate your journey in
          Al and Applied Mathematics Start with foundational courses in Cat-A,
          expand into specialized fields with Cat-B, or unlock everything with Full Access.
          Upgrade or adjust anytime_ no hidden fees, just learning.
        </p>
      </div>

        <SubscriptionCard />

        <div className="or-divider">
          <div className="line"></div>
          <span>Or</span>
          <div className="line"></div>
        </div>

        <CustomPlaylistCard />

    </div>
  );
}
