import { useState } from "react";
import "./faqComp.css";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
    {
        question: "What are you going to learn?",
        answer: (
            <>
                <p>
                    Deep Eigen AI Labs offers courses in two primary categories: (i)
                    Category-I (Cat-I), and (ii) Category-II (Cat-II). Cat-I is further
                    subdivided into Cat-IA and Cat-IB.
                </p>
                <p>
                    The primary categories divide courses into two broad segments: (i)
                    deeply theoretical and practical, and (ii) broad and practical, with
                    deep theory wherever required.
                </p>
                <p>
                    (i) The deep theoretical courses are designed to cover theoretical
                    concepts of the particular topic, with mathematical derivations
                    wherever applicable. The assignments are designed to train you to
                    implement theoretical concepts presented in the lectures, with
                    relevance to the 21st century real-world industrial problems. Such
                    courses are Cat-I courses.
                </p>
                <p>
                    (ii) The broad practical, with deep enough required theory, courses
                    mostly focus on the practical applications of a particular theoretical
                    concept, and the emphasis is on learning to apply those concepts
                    rather than deep theoretical analysis. Such courses are Cat-II
                    courses.
                </p>
            </>
        ),
    },
    {
        question: 'How do courses marked "Cat-I" compare with top graduate programs?',
        answer: (
            <>
                <p>
                    Courses at top graduate programs provide you the state-of-the-art
                    knowledge in the field. However, graudate programs are very selective
                    and expensive. Furthermore, they assume that you already have
                    lot of background knowledge before you begin a course.
                </p>

                <p>
                    The Cat-I courses at Deep Eigen AI Labs also provide you the state-of-the-art
                    knowledge, combining information from text-books and research papers. However,
                    our courses try to teach concepts from scratch, covering most of the required
                    background knowledge. We assume that the audience has little background knowledge
                    of the particular field, and thus the primary lectures combined with secondary
                    TA lectures provide you a holistic course which is easy to follow and understand.
                    The programming assignments on the other hand ensure that you know how every
                    concept is applied to solve a real-world problem.
                </p>

                <p>
                    The courses are detailed and deep enough, and after thoroughly
                    completing a course, along with all the mandatory and optional
                    assignments, you may be in a position to compare yourself with
                    (i) graduate students of top universities in the world, and (ii)
                    leading industry experts in the field.
                </p>

            </>
        )
    },
    {
        question: "What are other options?",
        answer: (
            <>
                <p>
                    Deep Eigen AI Labs courses are typically more deeper and broader
                    than other online courses. Our courses are designed to provide
                    both the depth and breadth of a particular topic. Such knowledge
                    base may help a candidate in securing a job in the relevant areas.
                </p>

                <p>
                    For example, while Cat-I courses specifically are designed to be
                    as knowledgeable and as competitive as best of the best graduate
                    programs' courses, the Cat-II courses do not necessarily contain
                    graudate level theory. However, often this boundary is blurred in
                    Cat-II courses. Often, there are more hidden topics and other
                    added topics, as compared to those indicated in the course outline
                    -- this depends on a course instructor, if they want to include
                    additional topics (other than those mentioned in a course-outline)
                    to provide a more holistic experience to the registrants.
                </p>

                <p>
                    There are rarely any alternative to the Cat-I courses offered by
                    Deep Eigen AI Labs, as they aim to provide you state-of-the-art
                    knowledge. We consider that the only real alternative to Deep Eigen
                    AI Labs's Cat-I courses is a structured graduate program in a
                    developed country. Graudate programs can provide you equivalent
                    (or better) knowledge in the fielld. However, not everyone can
                    get into such graduate programs, and not everyone can afford them,
                    given that the fee is increasing every year.
                </p>

                <p>
                    The other alternative, for masses, is to enroll in courses by other
                    online platforms. Some such platforms have already trained thousands
                    of students and professionals. However, the knowledge provided by
                    such platforms is very basic, and is good enough only when you want
                    to get a limited knowledge of a particular field. Sometimes these
                    courses can be very demanding in terms of fees, which is not justified
                    (in our opinion) given the content.
                </p>
            </>
        )
    },
    {
        question: "What are prerequisites?",
        answer: (
            <>
                <p>
                    The lectures are provided in such a fashion that anyone with a basic
                    knowledge of linear algebra and multivariate calculus can take a course,
                    and follow the entire course, including the mathematical derivations
                    (if they are part of a course outline). Any other prerequisites are
                    specifically mentioned on a course page.
                </p>
            </>
        )
    },
    {
        question: "What are the objectives of Cat-IA, IB and II courses?",
        answer: (
            <>
                <p>
                    To informally define these categories:
                </p>

                <p>
                    Cat-IA courses can be considered as one semester course on the same
                    topic at top graudate programs in the world, with additional emphasis
                    on research papers.
                </p>

                <p>
                    Cat-IB courses are equivalent to a one semester course on the
                    same topic at top graduate programs in the world.
                </p>

                <p>
                    Cat-II courses are very broad (they are a combination of several
                    courses into one) and practical in nature. The theoretical depth
                    of some of the topics may be as that of a graduate program course,
                    but often such courses tend to be less intensive on theory.
                    Any deep additional theoretical concept (other than the course outline,
                    or on a topic mentioned in the outline) may be added if an instructor
                    would like to do so.
                </p>

                <p>
                    When Cat-I courses are designed to be an advanced undergraduate level
                    course, the course page will specifically indicate that.
                </p>
            </>
        )
    },
];

const FAQComp = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    // Type the parameter explicitly
    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="w-full font-bricolage max-h-[150vh] h-full bg-[#f5f5f5] sm:p-15 p-5 ">


   
        <section className="fq_wrapper ">
            <h2 className="faq__title">Frequently Asked Questions</h2>

            {faqs.map((faq, index: number) => (
                <div key={index} className="faq__item">
                    <div className="faq__question" onClick={() => toggleFAQ(index)}>
                        <h3>{faq.question}</h3>
                        {openIndex === index ? (
                            <ChevronUp className="faq__icon" />
                        ) : (
                            <ChevronDown className="faq__icon" />
                        )}
                    </div>
                    {openIndex === index && <div className="faq__answer">{faq.answer}</div>}
                    <hr />
                </div>
            ))}
        </section>
             </div>
    );
};

export default FAQComp;