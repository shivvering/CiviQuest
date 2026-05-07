import type { CiviQuestion } from "./civiquest-questions";
import type { CategoryScoreMap, ConfidenceLabel } from "./research-types";

export function deriveAgeGroup(ageString: string): string {
  const age = Number.parseInt(ageString, 10);
  if (Number.isNaN(age)) {
    return "unknown";
  }
  if (age >= 10 && age <= 12) {
    return "10-12";
  }
  if (age >= 13 && age <= 14) {
    return "13-14";
  }
  if (age < 10) {
    return "under-10";
  }
  return "15+";
}

export function buildAnswersMap(
  answers: Record<number, number>,
  questions: CiviQuestion[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const q of questions) {
    const idx = answers[q.id];
    out[String(q.id)] =
      typeof idx === "number" ? q.options[idx] ?? "" : "";
  }
  return out;
}

export function computeCategoryScores(
  questions: CiviQuestion[],
  answers: Record<number, number>,
): CategoryScoreMap {
  const scores: CategoryScoreMap = {
    cleanliness: 0,
    traffic: 0,
    public_behavior: 0,
  };
  for (const q of questions) {
    if (answers[q.id] === q.correct) {
      scores[q.category] += 1;
    }
  }
  return scores;
}

export function padResearchArrays(
  questions: CiviQuestion[],
  timePerQuestion: number[],
  confidenceLevels: Record<number, ConfidenceLabel>,
): { times: number[]; confidences: ConfidenceLabel[] } {
  const times = questions.map((q, index) => timePerQuestion[index] ?? 0);
  const confidences: ConfidenceLabel[] = questions.map(
    (q) => confidenceLevels[q.id] ?? "Just guessed",
  );
  return { times, confidences };
}

export function encouragingMessageForRow(
  isCorrect: boolean,
  questionId: number,
): string {
  const positive = [
    "Nice one — Civvy is cheering for you!",
    "You thought that through well!",
    "That choice helps your community!",
  ];
  const gentle = [
    "Nice try! Let’s think about it…",
    "Good thinking! Here’s a choice many people find works better…",
    "Thanks for being honest — every answer teaches us something.",
  ];
  const list = isCorrect ? positive : gentle;
  return list[questionId % list.length];
}
