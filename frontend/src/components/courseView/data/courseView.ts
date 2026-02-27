// types/courseView.ts

export interface Lecture {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
}

export interface Section {
  name: string;
  lectures: Lecture[];
}

export interface Week {
  id: number;
  name: string;
  sections: Section[];
}

export interface CourseData {
  course: {
    title: string;
    video: string;
    weeks: Week[];
  };
  tabs: Array<{
    id: 'overview' | 'forum' | 'announcements';
    label: string;
  }>;
  initialExpandedWeeks: number[];
}

export type TabType = 'overview' | 'forum' | 'announcements';