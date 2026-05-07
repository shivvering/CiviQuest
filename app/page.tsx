"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QUESTIONS } from "@/lib/civiquest-questions";
import {
  buildAnswersMap,
  computeCategoryScores,
  deriveAgeGroup,
  encouragingMessageForRow,
  padResearchArrays,
} from "@/lib/research-helpers";
import type { ConfidenceLabel } from "@/lib/research-types";
import { saveSubmission } from "@/lib/save-submission";

type QuizStep = "start" | "intro" | "form" | "quiz" | "result";

type UserInfo = {
  name: string;
  age: string;
  school: string;
  className: string;
};

const TOTAL_TIME_SECONDS = 60;

const CONFIDENCE_OPTIONS: ConfidenceLabel[] = [
  "I am sure",
  "Not sure",
  "Just guessed",
];

export default function Home() {
  const [step, setStep] = useState<QuizStep>("start");
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    age: "",
    school: "",
    className: "",
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [confidenceByQuestion, setConfidenceByQuestion] = useState<
    Record<number, ConfidenceLabel>
  >({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [resultStatus, setResultStatus] = useState<"Completed" | "Time Up">(
    "Completed",
  );
  const [finalScore, setFinalScore] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [recentlySelectedOption, setRecentlySelectedOption] = useState<
    string | null
  >(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const questionStartRef = useRef(0);
  const timePerQuestionRef = useRef<number[]>([]);

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  const handleFormChange = (field: keyof UserInfo, value: string) => {
    setUserInfo((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const startQuiz = () => {
    timePerQuestionRef.current = [];
    setStep("quiz");
    setCurrentQuestionIndex(0);
    setAnswers({});
    setConfidenceByQuestion({});
    setTimeLeft(TOTAL_TIME_SECONDS);
    setQuizStartTime(Date.now());
    setFinalScore(0);
    setTimeTaken(0);
    setResultStatus("Completed");
    questionStartRef.current = Date.now();
  };

  const selectAnswer = (selectedOptionIndex: number) => {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: selectedOptionIndex,
    }));
    const selectedOption = currentQuestion.options[selectedOptionIndex];
    setRecentlySelectedOption(selectedOption);
    window.setTimeout(() => {
      setRecentlySelectedOption((previous) =>
        previous === selectedOption ? null : previous,
      );
    }, 180);
  };

  const setConfidence = (level: ConfidenceLabel) => {
    setConfidenceByQuestion((previous) => ({
      ...previous,
      [currentQuestion.id]: level,
    }));
  };

  const recordElapsedForCurrentQuestion = () => {
    const elapsed = Math.max(
      0,
      Math.round((Date.now() - questionStartRef.current) / 1000),
    );
    timePerQuestionRef.current.push(elapsed);
    questionStartRef.current = Date.now();
  };

  const goToNextQuestion = () => {
    const hasAnswer = typeof answers[currentQuestion.id] === "number";
    const hasConfidence = Boolean(confidenceByQuestion[currentQuestion.id]);
    if (!hasAnswer || !hasConfidence) {
      return;
    }

    recordElapsedForCurrentQuestion();

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((previous) => previous + 1);
      setTimeLeft(TOTAL_TIME_SECONDS);
      return;
    }
    finishQuiz("Completed");
  };

  const calculateScore = useCallback(() => {
    let score = 0;
    for (const question of QUESTIONS) {
      if (answers[question.id] === question.correct) {
        score += 1;
      }
    }
    return score;
  }, [answers]);

  const finishQuiz = useCallback((status: "Completed" | "Time Up") => {
    const score = calculateScore();
    const endTime = Date.now();
    const elapsedSeconds = quizStartTime
      ? Math.round((endTime - quizStartTime) / 1000)
      : TOTAL_TIME_SECONDS - timeLeft;

    if (status === "Time Up") {
      const partial = Math.max(
        0,
        Math.round((Date.now() - questionStartRef.current) / 1000),
      );
      timePerQuestionRef.current = [...timePerQuestionRef.current, partial];
    }

    const { times, confidences } = padResearchArrays(
      QUESTIONS,
      timePerQuestionRef.current,
      confidenceByQuestion,
    );

    setFinalScore(score);
    setResultStatus(status);
    setTimeTaken(elapsedSeconds);
    setStep("result");
    setSaveNotice(null);

    const answersMap = buildAnswersMap(answers, QUESTIONS);
    const categoryScores = computeCategoryScores(QUESTIONS, answers);

    void saveSubmission({
      name: userInfo.name,
      ageGroup: deriveAgeGroup(userInfo.age),
      school: userInfo.school,
      className: userInfo.className,
      answers: answersMap,
      score,
      totalTime: elapsedSeconds,
      timePerQuestion: times,
      confidenceLevels: confidences,
      categoryScores,
      quizStatus: status,
    }).then((result) => {
      if (result.ok) {
        setSaveNotice("Your answers were saved. Thank you for helping our study!");
      }
    });
  }, [answers, calculateScore, confidenceByQuestion, quizStartTime, timeLeft, userInfo.age, userInfo.className, userInfo.name, userInfo.school]);

  useEffect(() => {
    if (step === "quiz" && timeLeft > 0) {
      const timer = window.setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => window.clearTimeout(timer);
    }

    if (timeLeft === 0 && step === "quiz") {
      finishQuiz("Time Up");
    }
  }, [finishQuiz, step, timeLeft]);

  const restartApp = () => {
    setStep("start");
    setUserInfo({
      name: "",
      age: "",
      school: "",
      className: "",
    });
    setCurrentQuestionIndex(0);
    setAnswers({});
    setConfidenceByQuestion({});
    setTimeLeft(TOTAL_TIME_SECONDS);
    setQuizStartTime(null);
    setFinalScore(0);
    setTimeTaken(0);
    setResultStatus("Completed");
    setSaveNotice(null);
    timePerQuestionRef.current = [];
  };

  const progressFraction = (currentQuestionIndex + 1) / QUESTIONS.length;

  const resultTips = useMemo(() => {
    const scores = computeCategoryScores(QUESTIONS, answers);
    const entries = Object.entries(scores) as [
      keyof typeof scores,
      number,
    ][];
    const tips: Record<string, string> = {
      cleanliness:
        "When you spot wrappers near drains after rain, telling a teacher or parent can help stop flooding later.",
      traffic:
        "Even if friends cross early, waiting on the footpath for a green signal is one of the safest habits you can build.",
      public_behavior:
        "In busy places, a soft voice and a small gesture often work better than shouting — people listen more.",
    };
    entries.sort((a, b) => a[1] - b[1]);
    const out: string[] = [];
    for (const [key] of entries) {
      const line = tips[key];
      if (line) {
        out.push(line);
      }
      if (out.length >= 2) {
        break;
      }
    }
    return out;
  }, [answers]);

  const resultHeadline =
    finalScore >= 7
      ? "You are a Civic Champion 🐬"
      : finalScore >= 4
        ? "You are a Rising Civic Star 🌟"
        : "Thanks for sharing how you think! 💙";

  const canAdvanceQuestion =
    typeof answers[currentQuestion?.id ?? 0] === "number" &&
    Boolean(confidenceByQuestion[currentQuestion?.id ?? 0]);

  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{ backgroundColor: "#F4FBFF", color: "#1E2C3B" }}
    >
      <main className="mx-auto flex min-h-[85vh] w-full max-w-2xl flex-col items-center justify-center rounded-3xl bg-white p-6 text-center leading-relaxed shadow-[0_18px_40px_rgba(6,62,95,0.14)] md:p-10">
        {step === "start" && (
          <div className="mb-4 flex w-full items-start justify-center gap-3 rounded-3xl bg-gradient-to-b from-[#EAF7FF] via-[#F2FBFF] to-[#DDF3FF] p-4 md:gap-4 md:p-5">
            <p className="mt-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-[#063E5F] shadow-[0_8px_18px_rgba(6,62,95,0.18)] md:text-base">
              Hello I&apos;m Civvy 👋
            </p>
            <Image
              src="/civvy-main.png"
              alt="Civvy dolphin"
              width={190}
              height={190}
              priority
              className="h-28 w-28 object-contain md:h-36 md:w-36"
            />
          </div>
        )}

        <Image
          src="/cq-logo.png"
          alt="CiviQuest CQ logo"
          width={112}
          height={112}
          priority
          className="mb-3 h-16 w-16 object-contain md:h-20 md:w-20"
        />

        <h1 className="mb-3 font-[var(--font-montserrat)] text-4xl font-black tracking-tight leading-[1.2] md:text-5xl">
          CiviQuest
        </h1>
        <p className="mb-8 text-base md:text-lg" style={{ color: "#063E5F" }}>
          A quick civic sense challenge.
        </p>

        {step === "start" && (
          <section className="w-full">
            <button
              type="button"
              onClick={() => setStep("form")}
              className="min-h-[52px] w-full rounded-2xl px-6 py-5 font-[var(--font-montserrat)] text-2xl font-bold text-white transition hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: "#4296CD" }}
            >
              Play
            </button>
          </section>
        )}

        {step === "intro" && (
          <section className="w-full space-y-5 text-left text-base leading-relaxed md:text-lg">
            <p className="rounded-2xl bg-[#E5F6FF] px-4 py-4 font-semibold text-[#063E5F]">
              This quiz helps us understand how children think about everyday
              situations in India. There are no right or wrong answers — we care
              about your honest choices.
            </p>
            <p style={{ color: "#063E5F" }}>
              After each story, pick what feels most like you, then tell us how
              sure you were. Take your time — Civvy is on your side!
            </p>
            <button
              type="button"
              onClick={startQuiz}
              className="min-h-[52px] w-full rounded-2xl px-6 py-5 font-[var(--font-montserrat)] text-xl font-bold text-white transition hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: "#4296CD" }}
            >
              I&apos;m ready!
            </button>
          </section>
        )}

        {step === "form" && (
          <section className="w-full space-y-4 text-left">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Name</span>
              <input
                type="text"
                value={userInfo.name}
                onChange={(event) => handleFormChange("name", event.target.value)}
                placeholder="Enter your name"
                className="min-h-[48px] w-full rounded-xl border px-4 py-3 text-base outline-none"
                style={{ borderColor: "#E5F6FF" }}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Age</span>
              <input
                type="number"
                min="10"
                max="14"
                value={userInfo.age}
                onChange={(event) => handleFormChange("age", event.target.value)}
                placeholder="10 to 14"
                className="min-h-[48px] w-full rounded-xl border px-4 py-3 text-base outline-none"
                style={{ borderColor: "#E5F6FF" }}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">School</span>
              <input
                type="text"
                value={userInfo.school}
                onChange={(event) =>
                  handleFormChange("school", event.target.value)
                }
                placeholder="Enter school name"
                className="min-h-[48px] w-full rounded-xl border px-4 py-3 text-base outline-none"
                style={{ borderColor: "#E5F6FF" }}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Class</span>
              <select
                value={userInfo.className}
                onChange={(event) =>
                  handleFormChange("className", event.target.value)
                }
                className="min-h-[48px] w-full rounded-xl border px-4 py-3 text-base outline-none"
                style={{ borderColor: "#E5F6FF" }}
              >
                <option value="">Select class</option>
                <option value="5">Class 5</option>
                <option value="6">Class 6</option>
                <option value="7">Class 7</option>
                <option value="8">Class 8</option>
                <option value="9">Class 9</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => setStep("intro")}
              disabled={
                !userInfo.name ||
                !userInfo.age ||
                !userInfo.school ||
                !userInfo.className
              }
              className="mt-3 min-h-[52px] w-full rounded-2xl px-6 py-5 font-[var(--font-montserrat)] text-xl font-bold text-white transition enabled:hover:scale-[1.02] enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: "#4296CD" }}
            >
              Continue
            </button>
          </section>
        )}

        {step === "quiz" && currentQuestion && (
          <section className="w-full">
            <div className="relative w-full rounded-[28px] bg-white px-5 pb-16 pt-6 text-center shadow-[0_24px_60px_rgba(6,62,95,0.14)] md:px-10 md:pt-8">
              <div className="mb-4 flex justify-end">
                <span className="rounded-full bg-[#4296CD] px-4 py-2 text-sm font-bold text-white shadow-sm">
                  {timeLeft}s
                </span>
              </div>

              <div className="mb-4 text-left">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[#2589C9] md:text-base">
                    Question {currentQuestionIndex + 1} of {QUESTIONS.length}
                  </p>
                  <span className="text-xs font-semibold text-[#063E5F] md:text-sm">
                    {Math.round(progressFraction * 100)}%
                  </span>
                </div>
                <div
                  className="h-3 w-full overflow-hidden rounded-full bg-[#E5F6FF]"
                  role="progressbar"
                  aria-valuenow={currentQuestionIndex + 1}
                  aria-valuemin={1}
                  aria-valuemax={QUESTIONS.length}
                >
                  <div
                    className="h-full rounded-full bg-[#4296CD] transition-all duration-300 ease-out"
                    style={{ width: `${progressFraction * 100}%` }}
                  />
                </div>
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#2589C9]">
                {currentQuestion.category.replaceAll("_", " ")}
              </p>

              <h2 className="mb-8 text-2xl font-black leading-[1.35] text-[#063E5F] md:text-3xl">
                {currentQuestion.question}
              </h2>

              <div className="space-y-4">
                {currentQuestion.options.map((option, optionIndex) => {
                  const isSelected =
                    answers[currentQuestion.id] === optionIndex;
                  const hasRecentClick = recentlySelectedOption === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectAnswer(optionIndex)}
                      className={`min-h-[56px] w-full rounded-xl border-2 px-5 py-5 text-left text-lg font-bold transition-all duration-200 ease-out md:text-xl ${
                        hasRecentClick ? "scale-[0.98]" : "scale-100"
                      } ${
                        isSelected
                          ? "border-[#4296CD] bg-[#4296CD] text-white shadow-md"
                          : "border-[#E5F6FF] bg-[#E5F6FF] text-[#063E5F] hover:border-[#4296CD] hover:bg-[#4296CD] hover:text-white active:scale-[0.98]"
                      }`}
                      style={{
                        transformOrigin: "center",
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {typeof answers[currentQuestion.id] === "number" && (
                <div className="mt-8 space-y-3 text-left">
                  <p className="text-center text-base font-bold text-[#063E5F] md:text-lg">
                    How sure do you feel about that pick?
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
                    {CONFIDENCE_OPTIONS.map((option) => {
                      const picked =
                        confidenceByQuestion[currentQuestion.id] === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setConfidence(option)}
                          className={`min-h-[52px] flex-1 rounded-2xl border-2 px-4 py-3 text-center text-base font-bold transition hover:scale-[1.02] active:scale-[0.98] sm:min-w-[140px] ${
                            picked
                              ? "border-[#2589C9] bg-[#2589C9] text-white shadow-md"
                              : "border-[#E5F6FF] bg-white text-[#063E5F]"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={goToNextQuestion}
                disabled={!canAdvanceQuestion}
                className="mt-8 min-h-[56px] w-full rounded-2xl px-6 py-5 font-[var(--font-montserrat)] text-xl font-bold text-white transition enabled:hover:scale-[1.02] enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: "#4296CD" }}
              >
                {currentQuestionIndex === QUESTIONS.length - 1
                  ? "Submit"
                  : "Next question"}
              </button>

            </div>
          </section>
        )}

        {step === "result" && (
          <section
            className="w-full rounded-2xl p-6 text-left"
            style={{ backgroundColor: "#F4FBFF" }}
          >
            <h2 className="mb-2 text-center font-[var(--font-montserrat)] text-3xl font-black leading-[1.25]">
              {resultHeadline}
            </h2>
            <p className="mb-2 text-center text-lg font-bold text-[#063E5F]">
              You shared{" "}
              <span className="text-[#4296CD]">{finalScore}</span> out of{" "}
              {QUESTIONS.length} picks that match our “kind to community”
              coding — like collecting stars in a game, not like an exam score.
            </p>
            <p className="mb-4 text-center text-sm" style={{ color: "#063E5F" }}>
              {resultStatus === "Time Up"
                ? "Time ran out — thanks for every answer you gave!"
                : "Great job finishing all the stories!"}
            </p>
            <p className="mb-6 text-center text-base" style={{ color: "#063E5F" }}>
              Total time: {timeTaken}s
            </p>

            <Image
              src="/civvy-main.png"
              alt="Civvy dolphin"
              width={160}
              height={160}
              className="mx-auto mb-4 h-24 w-24 object-contain md:h-28 md:w-28"
            />

            {saveNotice && (
              <p
                className="mb-4 text-center text-sm font-semibold"
                style={{ color: "#063E5F" }}
              >
                {saveNotice}
              </p>
            )}

            {resultTips.length > 0 && (
              <div
                className="mb-5 rounded-2xl border border-[#cdebd1] bg-white px-4 py-4"
                style={{ borderColor: "#cdebd1" }}
              >
                <p className="mb-2 font-bold text-[#063E5F]">Civvy&apos;s tips</p>
                <ul className="list-inside list-disc space-y-2 text-sm text-[#1E2C3B]">
                  {resultTips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="max-h-60 space-y-2 overflow-auto pr-1">
              {QUESTIONS.map((question, index) => {
                const selectedIndex = answers[question.id];
                const selected =
                  typeof selectedIndex === "number"
                    ? question.options[selectedIndex]
                    : "Not answered";
                const correctAnswer = question.options[question.correct];
                const isCorrect = selectedIndex === question.correct;
                return (
                  <div
                    key={question.id}
                    className="rounded-xl border p-3"
                    style={{
                      borderColor: isCorrect ? "#cdebd1" : "#f6c8c8",
                      backgroundColor: isCorrect ? "#edf9ef" : "#fff1f1",
                    }}
                  >
                    <p className="font-semibold">
                      {index + 1}. {question.question}
                    </p>
                    <p className="text-sm">Your answer: {selected}</p>
                    <p className="mt-1 text-sm font-medium text-[#555]">
                      {encouragingMessageForRow(isCorrect, question.id)}
                    </p>
                    {isCorrect ? (
                      <p className="mt-1 text-sm text-[#555]">{question.feedback}</p>
                    ) : (
                      <p className="text-sm text-[#555]">
                        Another choice that often works well:{" "}
                        <span className="font-semibold">{correctAnswer}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={restartApp}
              className="mt-5 min-h-[56px] w-full rounded-2xl px-6 py-5 font-[var(--font-montserrat)] text-xl font-bold text-white transition hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: "#4296CD" }}
            >
              Play Again
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
