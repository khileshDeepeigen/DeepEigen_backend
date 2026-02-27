// types/makePlaylist.ts

export interface Course {
  id: string;
  title: string;
  selected: number;
  total: number;
  category: string;
}

export interface Lecture {
  id: string;
  courseId: string;
  title: string;
  selected?: boolean;
  lectureNumber?: string;
  lectureName?: string;
}

export interface Assignment {
  id: string;
  lectureIds: string[];
  title: string;
  selected: boolean;
}

export interface PageData {
  title: string;
  description: string;
  buttonText: string;
  selectedText: string;
}

export interface UIData {
  placeholders: {
    searchCourse: string;
    searchLecture: string;
  };
  titles: {
    courses: string;
    lectures: string;
    assignments: string;
    customAssignment: string;
    selectedLectures: string;
    relatedAssignments: string;
  };
  buttons: {
    selectAll: string;
    viewLectures: string;
    hideLectures: string;
  };
  messages: {
    noLectures: string;
    assignmentsDescription: string;
  };
}

export interface Colors {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryText: string;
  primaryTextLight: string;
  border: string;
  background: string;
}

export interface MakePlaylistData {
  page: PageData;
  courses: Course[];
  lectures: Lecture[];
  ui: UIData;
  constants: {
    maxLecturesPerAssignment: number;
    defaultCourseId: string;
  };
  colors: Colors;
}