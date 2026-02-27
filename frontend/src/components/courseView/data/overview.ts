// types/overview.ts

export interface CourseSchemaItem {
  week: string;
  description: string;
}

export interface CourseDetailItem {
  label: string;
  value: string;
  link?: string;
  icon: string;
  color: string;
  iconColor: string;
  bgColor: string;
  isLink?: boolean;
}

export interface CourseDetails {
  instructor: CourseDetailItem;
  freeVideos: CourseDetailItem;
  feeForeign: CourseDetailItem;
  feeIndia: CourseDetailItem;
  firstOffered: CourseDetailItem;
  expectedEngagement: CourseDetailItem;
}

export interface NeedHelp {
  title: string;
  description: string;
}

export interface OverviewData {
  overview: {
    description: string;
  };
  courseSchema: CourseSchemaItem[];
  courseDetails: CourseDetails;
  needHelp: NeedHelp;
}