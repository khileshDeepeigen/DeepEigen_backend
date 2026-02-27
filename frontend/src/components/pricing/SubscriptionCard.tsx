import { useState } from "react";
import "./styles/subscriptionCard.css"
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
const   SubscriptionCard = () => {

    const pricingData = {
        Monthly: {
            basic: { inr: 99, usd: 2 },
            standard: { inr: 299, usd: 4 },
            premium: { inr: 699, usd: 8 },
        },
        Quarterly: {
            basic: { inr: 249, usd: 5 },
            standard: { inr: 749, usd: 10 },
            premium: { inr: 1699, usd: 20 },
        },
        Yearly: {
            basic: { inr: 830, usd: 10 },
            standard: { inr: 2999, usd: 50 },
            premium: { inr: 3735, usd: 50 },
        },
    } as const;

    const tabs = Object.keys(pricingData) as (keyof typeof pricingData)[];
    const [active, setActive] = useState<keyof typeof pricingData>("Yearly");


    const basic = pricingData[active].basic;
    const standard = pricingData[active].standard;
    const premium = pricingData[active].premium;

    return (
        <div className="Pricing-card-wrapper">
            <div className="pricing-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActive(tab)}
                        className={`tab-button ${active === tab ? "tab-active" : ""}`}>
                        {tab}
                    </button>
                ))}
            </div>

            <div className="pricing-cards">

                <div className="pricing-card basic-access">

                    <div className="card-header">
                        <h2 className="card-title">Basic</h2>
                        <p className="card-subtitle">Essential & foundation courses</p>
                    </div>

                    <div className="full-access-pricing">
                        <div className="full-divider"></div>

                        <div className="full-price-row">
                            <div className="price-group">
                                <span className="currency">₹</span>
                                <span className="price-large">{basic.inr}</span>
                                <span className="price-period">/year</span>
                            </div>
                            <div className="price-divider"></div>
                            <div className="price-group">
                                <span className="currency-small">$</span>
                                <span className="price-medium">{basic.usd}</span>
                                <span className="price-period-small">/year</span>
                            </div>
                        </div>

                        <div className="full-divider"></div>

                        <h3 className="plus-title1">CAT-II</h3>

                        <div className="feature-list">
                            <div className="feature-item">
                                <svg className="check-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_63_707)">
                                        <path d="M5.62508 12.2501L15.0834 2.79175L16.2917 4.04175L5.62508 14.7084L0.666748 9.75008L1.91675 8.50008L5.62508 12.2501Z" fill="#0F9C0F" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_63_707">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span>Introduction to AI Fundamentals</span>
                            </div>
                            <div className="feature-item">
                                <svg className="check-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_63_711)">
                                        <path d="M5.62508 12.2501L15.0834 2.79175L16.2917 4.04175L5.62508 14.7084L0.666748 9.75008L1.91675 8.50008L5.62508 12.2501Z" fill="#0F9C0F" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_63_711">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span>Machine Learning Essentials</span>
                            </div>
                            <div className="feature-item">
                                <svg className="check-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_63_715)">
                                        <path d="M5.62508 12.2501L15.0834 2.79175L16.2917 4.04175L5.62508 14.7084L0.666748 9.75008L1.91675 8.50008L5.62508 12.2501Z" fill="#0F9C0F" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_63_715">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span>Core Mathematics for AI/ML</span>
                            </div>
                            <div className="feature-item">
                                <svg className="check-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_63_719)">
                                        <path d="M5.62508 12.2501L15.0834 2.79175L16.2917 4.04175L5.62508 14.7084L0.666748 9.75008L1.91675 8.50008L5.62508 12.2501Z" fill="#0F9C0F" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_63_719">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span>Algorithm Foundations</span>
                            </div>
                            <div className="feature-item">
                                <svg className="check-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_63_723)">
                                        <path d="M5.62508 12.2501L15.0834 2.79175L16.2917 4.04175L5.62508 14.7084L0.666748 9.75008L1.91675 8.50008L5.62508 12.2501Z" fill="#0F9C0F" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_63_723">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span>Conceptual Reasoning Skills</span>
                            </div>
                            <div className="feature-item">
                                <svg className="check-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_63_727)">
                                        <path d="M5.62508 12.2501L15.0834 2.79175L16.2917 4.04175L5.62508 14.7084L0.666748 9.75008L1.91675 8.50008L5.62508 12.2501Z" fill="#0F9C0F" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_63_727">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span>Introduction to Generative AI</span>
                            </div>
                            <div className="feature-item">
                                <svg className="check-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_63_731)">
                                        <path d="M5.62508 12.2501L15.0834 2.79175L16.2917 4.04175L5.62508 14.7084L0.666748 9.75008L1.91675 8.50008L5.62508 12.2501Z" fill="#0F9C0F" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_63_731">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span>Advanced Reinforced Learning</span>
                            </div>



                            <div className="flex items-center mt-4 cursor-pointer gap-2">
                                <span className="text-sm font-semibold text-blue-700 leading-none">
                                    View Courses
                                </span>
                                <FaArrowRight className="text-blue-700 text-base" />
                            </div>





                        </div>
                    </div>

                    <Link to="/chooseplan" className="join-now-btn basic-access-btn">Choose Plan</Link>
                </div>

                <div className="pricing-card standard-access">
                    <div className="card-header">
                        <h2 className="card-title">Standard</h2>
                        <p className="card-subtitle">Deep & specialized courses</p>
                    </div>

                    <div className="full-access-pricing">
                        <div className="full-divider"></div>

                        <div className="full-price-row">
                            <div className="price-group">
                                <span className="currency">₹</span>
                                <span className="price-large">{standard.inr}</span>
                                <span className="price-period">/year</span>
                            </div>
                            <div className="price-divider"></div>
                            <div className="price-group">
                                <span className="currency-small">$</span>
                                <span className="price-medium">{standard.usd}</span>
                                <span className="price-period-small">/year</span>
                            </div>
                        </div>

                        <div className="full-divider"></div>

                        <h3 className="plus-title2">CAT-IA & CAT-II</h3>

                        <div className="feature-list">
                            <div className="feature-item">
                                <svg className="check-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_63_707)">
                                        <path d="M5.62508 12.2501L15.0834 2.79175L16.2917 4.04175L5.62508 14.7084L0.666748 9.75008L1.91675 8.50008L5.62508 12.2501Z" fill="#0F9C0F" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_63_707">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span>Advanced Machine Learning Techniques</span>
                            </div>
                            <div className="feature-item">
                                <svg className="check-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_63_711)">
                                        <path d="M5.62508 12.2501L15.0834 2.79175L16.2917 4.04175L5.62508 14.7084L0.666748 9.75008L1.91675 8.50008L5.62508 12.2501Z" fill="#0F9C0F" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_63_711">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span>Deep Learning Masterclass</span>
                            </div>
                            <div className="feature-item">
                                <svg className="check-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_63_715)">
                                        <path d="M5.62508 12.2501L15.0834 2.79175L16.2917 4.04175L5.62508 14.7084L0.666748 9.75008L1.91675 8.50008L5.62508 12.2501Z" fill="#0F9C0F" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_63_715">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span>Mathematical Optimization for AI</span>
                            </div>
                            <div className="feature-item">
                                <svg className="check-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_63_719)">
                                        <path d="M5.62508 12.2501L15.0834 2.79175L16.2917 4.04175L5.62508 14.7084L0.666748 9.75008L1.91675 8.50008L5.62508 12.2501Z" fill="#0F9C0F" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_63_719">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span>Generative AI</span>
                            </div>
                            <div className="feature-item">
                                <svg className="check-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_63_723)">
                                        <path d="M5.62508 12.2501L15.0834 2.79175L16.2917 4.04175L5.62508 14.7084L0.666748 9.75008L1.91675 8.50008L5.62508 12.2501Z" fill="#0F9C0F" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_63_723">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span>Computer Vision with Advanced Architectures</span>
                            </div>
                            <div className="feature-item">
                                <svg className="check-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_63_727)">
                                        <path d="M5.62508 12.2501L15.0834 2.79175L16.2917 4.04175L5.62508 14.7084L0.666748 9.75008L1.91675 8.50008L5.62508 12.2501Z" fill="#0F9C0F" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_63_727">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span>Graph Neural Networks</span>
                            </div>
                            <div className="feature-item">
                                <svg className="check-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_63_731)">
                                        <path d="M5.62508 12.2501L15.0834 2.79175L16.2917 4.04175L5.62508 14.7084L0.666748 9.75008L1.91675 8.50008L5.62508 12.2501Z" fill="#0F9C0F" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_63_731">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span>Advanced Reinforced Learning</span>
                            </div>
                        


                               <div className="flex items-center mt-4 cursor-pointer gap-2">
                                <span className="text-sm font-semibold text-blue-700 leading-none">
                                    View Courses
                                </span>
                                <FaArrowRight className="text-blue-700 text-base" />
                            </div>
                        </div>
                    </div>

                    <Link to="/choosestandard" className="join-now-btn standard-access-btn">Choose Plan</Link>
                </div>

                <div className="pricing-card premium-access">
                    <div className="best-value-badge">Best Value</div>

                    <div className="card-header">
                        <h2 className="card-title">Premium</h2>
                        <p className="card-subtitle">Complete curriculum & all premium courses</p>
                    </div>

                    <div className="full-access-pricing">
                        <div className="full-divider"></div>

                        <div className="full-price-row">
                            <div className="price-group">
                                <span className="currency">₹</span>
                                <span className="price-large">{premium.inr}</span>
                                {/* <span className="price-strikethrough">₹9,999</span> */}
                                <span className="price-period">/year</span>
                            </div>
                            <div className="price-divider"></div>
                            <div className="price-group">
                                <span className="currency-small">$</span>
                                <span className="price-medium">{premium.usd}</span>
                                {/* <span className="price-strikethrough-small">$75</span> */}
                                <span className="price-period-small">/year</span>
                            </div>
                        </div>

                        <div className="full-divider"></div>

                        <h3 className="plus-title3">CAT-IA + CAT-IB + CAT-II</h3>

                        <div className="feature-list">
                            <div className="feature-item">
                                <svg className="check-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_63_707)">
                                        <path d="M5.62508 12.2501L15.0834 2.79175L16.2917 4.04175L5.62508 14.7084L0.666748 9.75008L1.91675 8.50008L5.62508 12.2501Z" fill="#0F9C0F" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_63_707">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span>Advanced Machine Learning Techniques</span>
                            </div>
                            <div className="feature-item">
                                <svg className="check-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_63_711)">
                                        <path d="M5.62508 12.2501L15.0834 2.79175L16.2917 4.04175L5.62508 14.7084L0.666748 9.75008L1.91675 8.50008L5.62508 12.2501Z" fill="#0F9C0F" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_63_711">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span>Deep Learning Masterclass</span>
                            </div>
                            <div className="feature-item">
                                <svg className="check-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_63_715)">
                                        <path d="M5.62508 12.2501L15.0834 2.79175L16.2917 4.04175L5.62508 14.7084L0.666748 9.75008L1.91675 8.50008L5.62508 12.2501Z" fill="#0F9C0F" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_63_715">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span>Mathematical Optimization for AI</span>
                            </div>
                            <div className="feature-item">
                                <svg className="check-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_63_719)">
                                        <path d="M5.62508 12.2501L15.0834 2.79175L16.2917 4.04175L5.62508 14.7084L0.666748 9.75008L1.91675 8.50008L5.62508 12.2501Z" fill="#0F9C0F" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_63_719">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span>Generative AI</span>
                            </div>
                            <div className="feature-item">
                                <svg className="check-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_63_723)">
                                        <path d="M5.62508 12.2501L15.0834 2.79175L16.2917 4.04175L5.62508 14.7084L0.666748 9.75008L1.91675 8.50008L5.62508 12.2501Z" fill="#0F9C0F" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_63_723">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span>Computer Vision with Advanced Architectures</span>
                            </div>
                            <div className="feature-item">
                                <svg className="check-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_63_727)">
                                        <path d="M5.62508 12.2501L15.0834 2.79175L16.2917 4.04175L5.62508 14.7084L0.666748 9.75008L1.91675 8.50008L5.62508 12.2501Z" fill="#0F9C0F" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_63_727">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span>Graph Neural Networks</span>
                            </div>
                            <div className="feature-item">
                                <svg className="check-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_63_731)">
                                        <path d="M5.62508 12.2501L15.0834 2.79175L16.2917 4.04175L5.62508 14.7084L0.666748 9.75008L1.91675 8.50008L5.62508 12.2501Z" fill="#0F9C0F" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_63_731">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span>Advanced Reinforced Learning</span>
                            </div>
                        

                               <div className="flex items-center mt-4 cursor-pointer gap-2">
                                <span className="text-sm font-semibold text-blue-700 leading-none">
                                    View Courses
                                </span>
                                <FaArrowRight className="text-blue-700 text-base" />
                            </div>
                        </div>
                    </div>

                    <Link to="/choosepremium" className="join-now-btn premium-access-btn">Get Full Access | Join Now</Link>
                </div>

            </div>
        </div>

    )
}

export default SubscriptionCard