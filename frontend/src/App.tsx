import { Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { ensureCSRFToken } from './utils/csrf'
import LandingPage from './pages/LandingPage'
import Login from './components/authentication/Login'
import Register from './components/authentication/Register'
import MainLayout from './layouts/MainLayout'
import Team from './pages/TeamPage'
import Verification from './components/authentication/Verification'
import Careers from './pages/CareersPage'
import Contact from './pages/ContactPage'
import Media from './pages/Media'
import Courses from './pages/CoursesPage'
import Pricing from './pages/Pricing'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsCondition from './pages/TermsCondition'
import PrivacyPolicyGDPR from './pages/PrivacyPolicyGDPR'
import FAQ from './pages/FAQ'
import CourseDetails from './components/courses/CourseDetails'
import MakePlaylist from './components/makePlaylist/MakePlaylist'
import AboutUs from './pages/AboutUsPage'
import ForgotPassword from './components/authentication/ForgotPassword'
import { ResetPassword } from './components/authentication/ResetPassword'
import { PasswordResetConfirmation } from './components/authentication/PasswordResetConfirmation'

import UserDashboard from './pages/UserDashboard'
import Profile from './components/userDashboard/Profile'
import EditProfile from './components/userDashboard/EditProfile'
import Settings from './components/userDashboard/Settings'
import Billing_Invoice from './components/userDashboard/BillingAndInvoices'
import AccountLayout from './components/userDashboard/AccountLayout'
import CourseViewPage from './pages/CourseViewPage'
import PlaylistSummary from './components/playlist/Playlist-Summary'
import CourseComputer from './components/courses/courseComputer'
import ReinforcementLearning from './components/courses/ReinforcementLearning'
import AddCourse from './components/userDashboard/AddCourse'
import Payment from './components/userDashboard/UI/Payment'
import PaymentCard from './components/playlist/PaymentCard'
import Sitemap from './pages/Sitemap'
import ChoosePlanCard from './components/landing/ChoosePlanCard'
import ChoosePlanStandard from './components/landing/ChoosePlanStandard'
import ChoosePlanPremium from './components/landing/ChoosePlanPremium'
import Showallcourses from './components/courses/ui/Showallcourses'


function App() {
  // ✅ Initialize CSRF token on app startup
  // This ensures Django's ensure_csrf_cookie decorator is triggered
  // and the csrftoken cookie is set before any POST requests are made
  useEffect(() => {
    ensureCSRFToken().catch(err =>
      console.warn('Failed to initialize CSRF token on app startup:', err)
    );
  }, []);

  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>

          {/* Home page Route */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/forgot_password" element={<ForgotPassword />} />
          <Route path="/reset_password" element={<ResetPassword />} />
          <Route path="/password_reset_confirmation" element={<PasswordResetConfirmation
            email="test@example.com"
            onResend={() => { }}
          />} />

          {/* Courses routes */}
          <Route path="/courses" element={<Courses />} />
          <Route path="/course_details" element={<CourseDetails />} />
          <Route path="/course_Reinforcement_Learning" element={<ReinforcementLearning />} />
          <Route path="/course_computer" element={<CourseComputer />} />
          <Route path="/course-view" element={<CourseViewPage />} />
          <Route path="/course-view/:id/:slug" element={<CourseViewPage />} />
          <Route path="/course-view/:id/:slug/:sectionUrl" element={<CourseViewPage />} />
          <Route path="/payment" element={<PaymentCard />} />
          <Route path="/chooseplan" element={<ChoosePlanCard />} />
          <Route path="/choosestandard" element={<ChoosePlanStandard />} />
          <Route path="/choosepremium" element={<ChoosePlanPremium />} />


          <Route path="/Showallcourses" element={<Showallcourses
          />} />

          {/* added by vikas */}


          {/* <Route path="/courses" element={<Courses />} />



          // <Route path="/courses/:id/:slug" element={<CourseDetails />} />
          <Route path="/course_Reinforcement_Learning" element={<ReinforcementLearning />} />                                    <Route path="/course_computer" element={<CourseComputer />} />
          <Route path="/course-view" element={<CourseViewPage />} /> */}

          <Route path="/courses/:id/:slug" element={<CourseDetails />} />





          {/* Pricing Routes */}
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/make_playlist" element={<MakePlaylist />} />
          <Route path="/playlist-summary" element={<PlaylistSummary />} />

          {/* user dashboard */}
          <Route path="/user_dashboard" element={<UserDashboard />} />

          {/* User Account Routes - /accounts/* */}
          <Route element={<AccountLayout />}>
            <Route path="/accounts/profile" element={<Profile />} />
            <Route path="/accounts/edit_profile" element={<EditProfile />} />
            <Route path="/accounts/settings" element={<Settings />} />
            <Route path="/accounts/billings_invoices" element={<Billing_Invoice />} />
          </Route>

          {/* Legacy routes (backward compatibility) */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit_profile" element={<EditProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/billings_invoices" element={<Billing_Invoice />} />

          <Route path="/addcourse" element={<AddCourse />} />
          <Route path="/buycourse/:id/:slug" element={<Payment />} />

          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/team" element={<Team />} />
          <Route path="/career" element={<Careers />} />
          <Route path="/contactus" element={<Contact />} />
          <Route path="/media" element={<Media />} />

          <Route path="/privacy_policy" element={<PrivacyPolicy />} />
          <Route path="/privacy_policyGDPR" element={<PrivacyPolicyGDPR />} />
          <Route path="/terms_conditions" element={<TermsCondition />} />
          <Route path="/faqs" element={<FAQ />} />
          <Route path="/sitemap" element={<Sitemap />} />

        </Route>
      </Routes>
    </>
  )
}

export default App
