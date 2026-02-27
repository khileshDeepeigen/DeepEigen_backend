// types/discussion.ts

export interface SubReply {
  id: number;
  author?: string;
  user_name?: string;
  user_email?: string;
  avatar?: string;
  content?: string;
  sub_reply?: string;
  timestamp?: string;
  created_date?: string;
}

export interface Reply {
  id: number;
  author?: string;
  user_name?: string;
  user_email?: string;
  avatar?: string;
  content?: string;
  reply?: string;
  timestamp?: string;
  created_date?: string;
  sub_replies?: SubReply[];
}

export interface DiscussionPost {
  id: number;
  author: string;
  avatar: string;
  title: string;
  content: string;
  week: string;
  date: string;
  replyCount: number;
  replies: Reply[];
  isExpanded?: boolean;
}

export interface FilterOption {
  id: string;
  label: string;
}

export interface SortOption {
  id: string;
  label: string;
}

export interface ForumData {
  forum: {
    searchPlaceholder: string;
    filters: FilterOption[];
    sortOptions: SortOption[];
  };
  posts: DiscussionPost[];
  ui: {
    buttons: {
      writePost: string;
      filter: string;
      sort: string;
      viewReplies: string;
      hideReplies: string;
      sendReply: string;
    };
    placeholders: {
      reply: string;
    };
    messages: {
      postAction: string;
      noPosts: string;
    };
  };
}

// API Types for Discussion Forum

export interface Question {
  id: number;
  title: string;
  question: string;
  user_name: string;
  user_email: string;
  created_date: string;
  reply_count?: number;
  replies?: Reply[];
  week?: string;
  section_name?: string;
}

export interface ForumSectionInfo {
  url: string;
  name: string;
  id?: number;
  question_count?: number;
}

export interface Pagination {
  current_page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  total_questions: number;
}

export interface ForumSectionQuestionsResponse {
  success: boolean;
  questions: Question[];
  pagination: Pagination;
}
