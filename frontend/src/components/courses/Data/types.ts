export type TabType = "overview" | "curriculum" | "accessibility" | "refund" | "assignment";

export interface LectureItem {
  id: number;
  title: string;
  description: string;
  duration?: string;
  isFree?: boolean;
}

export interface CurriculumItem {
  week: string;
  title: string;
  lectures: LectureItem[];
  isExpanded: boolean;
}

export interface QnAItem {
  question: string;
  answer: string;
}

export interface CourseDetailsData {
  course: {
    id: string;
    title: string;
    description: string;
    heroImage: string;
    level: string;
    contentDepth: string;
    details: {
      instructor: string;
      freeVideosLink: string;
      feeForeign: string;
      feeIndia: string;
      firstOffered: string;
      currentStatus: string;
      expectedEngagement: string;
    };
    pricing: {
      subscribePrice: number;
      originalPrice: number;
      currency: string;
      period: string;
    };
  };
  tabs: {
    overview: QnAItem[];
    curriculum: CurriculumItem[];
    accessibility: QnAItem[];
    refund: {
      policy: QnAItem[];
      details: {
        title: string;
        description: string;
        gatewayFees: Array<{
          type: string;
          percentage: string;
          description: string;
        }>;
        formulas: {
          amountReceived: string;
          refundInitiated: string;
          refundAfterGST: string;
          finalRefund: string;
        };
        bankTransfer: {
          amountReceived: string;
          refundInitiated: string;
          finalRefund: string;
        };
      };
    };
    assignment: QnAItem[];
  };
}