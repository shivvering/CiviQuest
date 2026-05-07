export type ConfidenceLabel = "I am sure" | "Not sure" | "Just guessed";

export type CategoryScoreMap = {
  cleanliness: number;
  traffic: number;
  public_behavior: number;
};

export type CapstoneResearchDocument = {
  name: string;
  ageGroup: string;
  school: string;
  className: string;
  answers: Record<string, string>;
  score: number;
  totalTime: number;
  timePerQuestion: number[];
  confidenceLevels: ConfidenceLabel[];
  categoryScores: CategoryScoreMap;
  quizStatus: "Completed" | "Time Up";
};

export type SaveDataInput = CapstoneResearchDocument;
