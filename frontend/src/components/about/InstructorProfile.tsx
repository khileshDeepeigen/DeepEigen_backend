import type React from "react"

interface InstructorProfileProps {
  name: string
  title?: string
  bio: string
  visionStatement: string
  imageUrl: string
}

export const InstructorProfile: React.FC<InstructorProfileProps> = ({
  name,
  title = "Instructor",
  bio,
  visionStatement,
  imageUrl,
}) => {
  return (
    <div className="w-full md:w-[80vw]  mx-auto my-3 px-4 py-12 ">
      {/* Instructor Header Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-8">Our {title}</h2>

        <div className="flex flex-col md:flex-row gap-8 items-start max-w-[80vw] mx-auto ">
          {/* Instructor Image */}
          <div className="flex-shrink-0 w-full md:w-[30vw] ">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={name}
              className="w-full h-100 rounded-lg object-cover shadow-lg"
            />
          </div>

          {/* Instructor Info */}
          <div className="flex-1 w-full md:w-[45vw] px-10p py-5">
            <h3 className="text-xl font-semibold text-blue-600 hover:text-blue-700 cursor-pointer mb-4 transition-colors">
              {name}
            </h3>

            <p className="text-foreground/80 leading-relaxed text-sm md:text-base space-y-4">
              {bio.split("\n").map((paragraph, idx) => (
                <span key={idx} className="block">
                  {paragraph}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>

      {/* Vision Statement */}
      <div className="bg-muted/50 rounded-lg p-8 md:p-12 bg-gray-200">
        <blockquote className="text-lg md:text-2xl font-normal text-center text-foreground leading-relaxed italic">
          {`"${visionStatement}"`}
        </blockquote>
      </div>
    </div>
  )
}

export default InstructorProfile
