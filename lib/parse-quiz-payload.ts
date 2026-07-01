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

export function parseQuizSubmissionBody(body: unknown): SaveDataInput | null {
  if (!isRecord(body)) {
    return null;
  }
  const name = body.name;
  const ageGroup = body.ageGroup;
  const school = body.school;
  const className = body.className;
  const parentEmail = body.parentEmail;
  const answers = body.answers;
  const score = body.score;
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
    !isParentEmail(parentEmail) ||
    !isRecord(answers) ||
    typeof score !== "number" ||
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
  if (
    typeof cs.cleanliness !== "number" ||
    typeof cs.traffic !== "number" ||
    typeof cs.public_behavior !== "number"
  ) {
    return null;
  }

  return {
    name,
    ageGroup,
    school,
    className,
    parentEmail,
    answers: answers as SaveDataInput["answers"],
    score,
    totalTime,
    timePerQuestion: timePerQuestion as number[],
    confidenceLevels: confidenceLevels as ConfidenceLabel[],
    categoryScores: {
      cleanliness: cs.cleanliness as number,
      traffic: cs.traffic as number,
      public_behavior: cs.public_behavior as number,
    },
    quizStatus,
  };
}
