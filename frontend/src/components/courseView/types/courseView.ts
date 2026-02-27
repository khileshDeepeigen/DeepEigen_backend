export interface Video {
    id: number;
    title: string;
    link: string;
    type: string;
    duration: string;
}

export interface Module {
    id: number;
    name: string;
    title: string;
    videos: Video[];
}

export interface Section {
    id: number;
    name: string;
    title: string;
    part_number: number;
    estimated_time?: string;
    total_assignments?: number;
    modules: Module[];
}

export interface Lecture {
    id: number;
    title: string;
    duration: string;
    completed: boolean;
    videoUrl?: string;
    videoId?: number;
    sectionId?: number; // Store the parent section ID for access control
}

export interface FormattedSection {
    name: string;
    lectures: Lecture[];
}

export interface Week {
    id: number;
    name: string;
    sections: FormattedSection[];
}

export type TabType = 'overview' | 'forum' | 'announcements' | 'assignments';

// Assignment related interfaces
export interface Assignment {
    id: number;
    name: string;
    assignment_type: string;
    module_id: number;
    pdf: string;
    submitted?: boolean;
}

export interface AssignmentSubmission {
    success: boolean;
    message: string;
    data?: {
        course_id: number;
        section: string;
        assignment: string;
        submitted_by: string;
    };
}

