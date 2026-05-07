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

export function parseQuizSubmissionBody(body: unknown): SaveDataInput | null {
  if (!isRecord(body)) {
    return null;
  }
  const name = body.name;
  const ageGroup = body.ageGroup;
  const occupation = body.occupation;
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
    typeof occupation !== "string" ||
    !isRecord(answers) ||
    typeof score !== "number" ||
    typeof totalTime !== "number" ||
    !Array.isArray(timePerQuestion) ||
    timePerQuestion.length !== 10 ||
    !Array.isArray(confidenceLevels) ||
    confidenceLevels.length !== 10 ||
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
    occupation,
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
