import React from "react"

const Sitemap: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#EEF2FF] flex justify-center py-16 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md px-10 py-12">
        
        {/* Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-10">
          Sitemap
        </h1>

        {/* Courses */}
        <Section title="Courses">
          <LinkItem text="AI-102: Introduction to Fundamentals of Machine Learning" link="/course_details" />
          <LinkItem text="CV-10X: Introduction to Computer Vision" link="/course_computer" />
          <LinkItem text="RL-10Y: Fundamentals of Reinforcement Learning" link="/course_Reinforcement_Learning" />
          <LinkItem text="CV-2.0X: Introduction to Visual Odometry and Mapping" link="/course_details" />
          <LinkItem text="GenAI-10X: Generative AI" link="/course_details" />
          <LinkItem text="MO-10X: Introduction to Mathematical Optimization" link="/course_details" />
        </Section>

        <Divider />

        {/* About */}
        <Section title="About">
          <LinkItem text="Team" link="/team" />
          <LinkItem text="FAQ’s" link="/faqs" />
          <LinkItem text="Terms" link="/terms_conditio" />
        </Section>

        <Divider />

        {/* Careers */}
        <Section title="Careers">
          <LinkItem text="Careers" link="/career" />
        </Section>

        <Divider />

        {/* Contact */}
        <Section title="Contact">
          <LinkItem text="Contact" link="/contactus" />
        </Section>
      </div>
    </div>
  )
}

export default Sitemap

/* ---------- Reusable Components ---------- */

const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="mb-8">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">
      {title}
    </h2>
    <ul className="space-y-2">{children}</ul>
  </div>
)

const LinkItem = ({
  text,
  link,
}: {
  text: string
  link: string
}) => (
  <li className="flex items-start gap-2 text-sm">
    <span className="text-blue-600 mt-1">•</span>
    <a
      href={link}
      className="text-blue-600 hover:underline"
    >
      {text}
    </a>
  </li>
)

const Divider = () => (
  <div className="border-t border-gray-300 my-8" />
)
