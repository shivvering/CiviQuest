import type { ConfidenceLabel, SaveDataInput } from "./research-types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const CONFIDENCE: ConfidenceLabel[] = [
  "I am sure",
  "Not sure",
  "Just guessed",
];

function isConfidence(value: unknown): value is ConfidenceLabel {
  return (
    typeof value === "string" &&
    (CONFIDENCE as readonly string[]).includes(value)
  );
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isParentEmail(value: unknown): value is string {
  return typeof value === "string" && EMAIL_PATTERN.test(value);
}

const CATEGORY_KEYS = [
  "cleanliness",
  "traffic",
  "public_behavior",
  "environment",
] as const;

export function parseQuizSubmissionBody(body: unknown): SaveDataInput | null {
  if (!isRecord(body)) {
    return null;
  }
  const name = body.name;
  const ageGroup = body.ageGroup;
  const school = body.school;
  const className = body.className;
  const parentEmail = body.parentEmail;
  const levelCategory = body.levelCategory;
  const answers = body.answers;
  const score = body.score;
  const totalQuestions = body.totalQuestions;
  const totalTime = body.totalTime;
  const timePerQuestion = body.timePerQuestion;
  const confidenceLevels = body.confidenceLevels;
  const categoryScores = body.categoryScores;
  const quizStatus = body.quizStatus;

  if (
    typeof name !== "string" ||
    typeof ageGroup !== "string" ||
    typeof school !== "string" ||
    typeof className !== "string" ||
    typeof levelCategory !== "string" ||
    !isParentEmail(parentEmail) ||
    !isRecord(answers) ||
    typeof score !== "number" ||
    typeof totalQuestions !== "number" ||
    typeof totalTime !== "number" ||
    !Array.isArray(timePerQuestion) ||
    !Array.isArray(confidenceLevels) ||
    timePerQuestion.length === 0 ||
    confidenceLevels.length === 0 ||
    timePerQuestion.length !== confidenceLevels.length ||
    !isRecord(categoryScores) ||
    (quizStatus !== "Completed" && quizStatus !== "Time Up")
  ) {
    return null;
  }

  for (const t of timePerQuestion) {
    if (typeof t !== "number") {
      return null;
    }
  }
  for (const c of confidenceLevels) {
    if (!isConfidence(c)) {
      return null;
    }
  }

  const cs = categoryScores as Record<string, unknown>;
  for (const key of CATEGORY_KEYS) {
    if (typeof cs[key] !== "number") {
      return null;
    }
  }

  return {
    name,
    ageGroup,
    school,
    className,
    parentEmail,
    levelCategory,
    answers: answers as SaveDataInput["answers"],
    score,
    totalQuestions,
    totalTime,
    timePerQuestion: timePerQuestion as number[],
    confidenceLevels: confidenceLevels as ConfidenceLabel[],
    categoryScores: {
      cleanliness: cs.cleanliness as number,
      traffic: cs.traffic as number,
      public_behavior: cs.public_behavior as number,
      environment: cs.environment as number,
    },
    quizStatus,
  };
}
