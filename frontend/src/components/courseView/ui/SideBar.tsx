import type { Week, Lecture as LectureType } from '../types/courseView';
import { CheckCircle, Circle, Clock, PlayCircle, Lock } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface SideBarProps {
    weeks: Week[];
    expandedWeeks: number[];
    toggleWeek: (id: number) => void;
    onLectureClick?: (lecture: LectureType) => void;
    currentLectureId?: number;
    accessibleSectionIds?: Set<number>;
    nextUnlockMessage?: string | null;
    courseId?: number;
    enrollmentData?: any;
}

const SideBar: React.FC<SideBarProps> = ({
    weeks,
    expandedWeeks,
    toggleWeek,
    onLectureClick,
    currentLectureId,
    accessibleSectionIds = new Set(),
    nextUnlockMessage,
    courseId,
    enrollmentData
}) => {
    const navigate = useNavigate();

    // Check if a lecture is accessible based on its section ID
    const isLectureAccessible = (lecture: LectureType): boolean => {
        // If no access restrictions, allow all
        if (accessibleSectionIds.size === 0) return true;
        
        // If lecture has a sectionId, check if it's in accessible list
        if (lecture.sectionId) {
            return accessibleSectionIds.has(lecture.sectionId);
        }
        
        // Fallback: if no sectionId, check by lecture ID
        return accessibleSectionIds.has(lecture.id);
    };

    const handleLockClick = async () => {
        // Redirect to billing/invoices page instead of initiating payment
        navigate('/accounts/billings_invoices');
    };

    const handleLectureClick = (lecture: LectureType, section: any) => {
        if (!isLectureAccessible(lecture)) {
            console.log('📦 This section is locked. ' + (nextUnlockMessage || 'Complete payment to unlock.'));
            // Initiate payment flow
            handleLockClick();
            return;
        }
        // Pass the lecture to parent; parent can determine the section id if needed
        onLectureClick?.(lecture);
    };
    return (
        <div className="sidebar-container">
            <div className="desktop-sidebar ">
                <div className="lg:w-[28vw] overflow-y-auto scrollbar-none mr-9 lg:ml-5 lg:p-0 mb:ml-10 h-auto bg-white border-l border-gray-300   overflow-hidden">
                    <div className="pb-8">
                        {weeks.map((week) => {
                            return (
                                <div key={week.id} className="  last:border-b-0">
                                    {/* Week Header */}
                                    <button
                                        className="w-full  py-3 bg-white text-left border-b border-gray-300  cursor-pointer flex justify-between items-center transition-all duration-200"
                                        onClick={() => toggleWeek(week.id)}
                                    >
                                        <div className="flex flex-col    w-full items-start">
                                            <span className="text-lg ml-4 font-semibold text-gray-500">{week.name}</span>

                                        </div>


                                    </button>

                                    {/* Week Content */}
                                    {expandedWeeks.includes(week.id) && week.sections.length > 0 && (
                                        <div className="bg-white animate-in slide-in-from-top-1 duration-300">
                                            {week.sections.map((section, idx) => (
                                                <div key={idx} className="pt-1">
                                                    <div className="px-4 py-2 text-md font-semibold text-gray-600 uppercase tracking-wider">
                                                        {section.name}
                                                    </div>

                                                    <div className="py-1">
                                                        {section.lectures.map((lecture) => {
                                                            const isAccessible = isLectureAccessible(lecture);
                                                            const isLocked = accessibleSectionIds.size > 0 && !isAccessible;

                                                            return (
                                                                <div
                                                                    key={lecture.id}
                                                                    className={`px-4 py-2 transition-colors duration-200 ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer group'} ${currentLectureId === lecture.id
                                                                        ? 'bg-blue-100 border-l-4 border-blue-600'
                                                                        : isLocked ? 'bg-gray-50' : 'hover:bg-blue-50'
                                                                        }`}
                                                                    onClick={() => handleLectureClick(lecture, section)}
                                                                    title={isLocked ? nextUnlockMessage || 'This section is locked. Complete payment to unlock.' : ''}
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="flex items-start gap-2 flex-shrink-0">
                                                                            <div className={`w-6 h-6 flex items-center justify-center rounded-full text-md mt-0.5 ${currentLectureId === lecture.id
                                                                                ? 'text-blue-600 font-semibold'
                                                                                : 'text-gray-400'
                                                                                }`}>
                                                                                {isLocked ? (
                                                                                    <Lock size={16} className="text-orange-500" />
                                                                                ) : (
                                                                                    lecture.id
                                                                                )}
                                                                            </div>
                                                                            <div className={`rounded-full transition-colors mt-0.5 ${currentLectureId === lecture.id
                                                                                ? 'text-blue-600'
                                                                                : isLocked ? 'text-gray-400' : 'text-gray-500'
                                                                                }`}>
                                                                                <PlayCircle size={20} />
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className={`text-md font-medium line-clamp-2 ${currentLectureId === lecture.id
                                                                                    ? 'text-blue-700'
                                                                                    : isLocked ? 'text-gray-500' : 'text-gray-600'
                                                                                    }`}>
                                                                                    {lecture.title}
                                                                                    {isLocked && <span className="text-xs ml-2 text-orange-600">🔒</span>}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                                <Clock size={10} className="text-gray-400" />
                                                                                <span>{lecture.duration}</span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex-shrink-0 mt-0.5">
                                                                            {isLocked ? (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleLockClick();
                                                                                    }}
                                                                                    className="p-1 rounded hover:bg-orange-100 transition-colors"
                                                                                    title="Click to unlock - Go to payment"
                                                                                >
                                                                                    <Lock size={14} className="text-orange-500 hover:text-orange-700" />
                                                                                </button>
                                                                            ) : lecture.completed ? (
                                                                                <CheckCircle size={14} className="text-green-600" />
                                                                            ) : (
                                                                                <Circle size={14} className="text-gray-300" />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SideBar;