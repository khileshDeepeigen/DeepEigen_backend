export type SectionType = "courses" | "playlist" | "certificates" | "ai-labs";

export interface Course {
  id: string;
  title: string;
  description: string;
  validity: string;
  category: string;
  assignments: number;
  completion: number;
  image: string;
  courseUrl?: string;
  sectionUrl?: string;
}

export interface Certificate {
  id: string;
  title: string;
  completionDate: string;
  grade: string;
  image: string;
}

export interface Playlist {
  id: string;
  title: string;
  lectures: number;
  assignments: number;
}

export interface UserData {
  name: string;
  plan: string;
}

export interface CurrentCourse {
  id?: string;
  title: string;
  instructor: string;
}

export interface CustomizedCourse {
  title: string;
  lectures: number;
  assignments: number;
}

export interface Messages {
  welcome: string;
  courses: {
    title: string;
    description: string;
  };
  certificates: {
    title: string;
    description: string;
  };
  playlists: {
    title: string;
    description: string;
  };
  aiLabs: {
    title: string;
    description: string;
  };
}

export interface AILabs {
  title: string;
  description: string;
}

export interface LoggedInData {
  user: UserData;
  currentCourse: CurrentCourse;
  sections: SectionType[];
  customizedCourse: CustomizedCourse;
  courses: Course[];
  certificates: Certificate[];
  playlists: Playlist[];
  aiLabs: AILabs;
  messages: Messages;
}