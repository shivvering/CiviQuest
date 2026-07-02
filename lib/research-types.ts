export type ConfidenceLabel = "I am sure" | "Not sure" | "Just guessed";

export type CategoryScoreMap = {
  cleanliness: number;
  traffic: number;
  public_behavior: number;
  environment: number;
};

export type CapstoneResearchDocument = {
  name: string;
  ageGroup: string;
  school: string;
  className: string;
  parentEmail: string;
  /** Category of the level this attempt belongs to. */
  levelCategory: string;
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  totalTime: number;
  timePerQuestion: number[];
  confidenceLevels: ConfidenceLabel[];
  categoryScores: CategoryScoreMap;
  quizStatus: "Completed" | "Time Up";
};

export type SaveDataInput = CapstoneResearchDocument;

/** A submission row as returned to the teacher dashboard. */
export type TeacherSubmissionRow = {
  id: string;
  createdAt: string;
  parentEmail: string;
  payload: CapstoneResearchDocument;
  teacherGrade: string | null;
  teacherComment: string | null;
  gradedBy: string | null;
  gradedAt: string | null;
};
