"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QUESTIONS, type CivicCategory } from "@/lib/civiquest-questions";
import {
  buildAnswersMap,
  computeCategoryScores,
  deriveAgeGroup,
  encouragingMessageForRow,
  padResearchArrays,
} from "@/lib/research-helpers";
import type { ConfidenceLabel } from "@/lib/research-types";
import { saveSubmission } from "@/lib/save-submission";

type QuizStep = "start" | "form" | "levels" | "quiz" | "result";
type LevelId = Extract<CivicCategory, "cleanliness" | "traffic">;

type UserInfo = {
  name: string;
  age: string;
  school: string;
  className: string;
  parentEmail: string;
  parentConsent: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TOTAL_TIME_SECONDS = 60;

const CONFIDENCE_OPTIONS: ConfidenceLabel[] = [
  "I am sure",
  "Not sure",
  "Just guessed",
];

const LEVELS: Array<{
  id: LevelId;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
}> = [
  {
    id: "cleanliness",
    title: "Level 1: Cleanliness",
    subtitle: "Keep parks, classrooms, and streets clean.",
    emoji: "🧼",
    color: "#2f9bd7",
  },
  {
    id: "traffic",
    title: "Level 2: Traffic Rules",
    subtitle: "Cross safely and respect signals.",
    emoji: "🚦",
    color: "#2574d9",
  },
];

export function CiviQuestApp() {
  const [step, setStep] = useState<QuizStep>("start");
  const [selectedLevel, setSelectedLevel] = useState<LevelId | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    age: "",
    school: "",
    className: "",
    parentEmail: "",
    parentConsent: false,
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [confidenceByQuestion, setConfidenceByQuestion] = useState<
    Record<number, ConfidenceLabel>
  >({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);
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
  const quizStartRef = useRef<number | null>(null);
  const timePerQuestionRef = useRef<number[]>([]);
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const wrongAudioRef = useRef<HTMLAudioElement | null>(null);

  const activeQuestions = useMemo(
    () =>
      selectedLevel
        ? QUESTIONS.filter((question) => question.category === selectedLevel)
        : [],
    [selectedLevel],
  );
  const currentQuestion = activeQuestions[currentQuestionIndex];

  const handleFormChange = (
    field: keyof UserInfo,
    value: string | boolean,
  ) => {
    setUserInfo((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const startQuiz = (level: LevelId, startedAt: number) => {
    setSelectedLevel(level);
    timePerQuestionRef.current = [];
    setStep("quiz");
    setCurrentQuestionIndex(0);
    setAnswers({});
    setConfidenceByQuestion({});
    setTimeLeft(TOTAL_TIME_SECONDS);
    setFinalScore(0);
    setTimeTaken(0);
    setResultStatus("Completed");
    quizStartRef.current = startedAt;
    questionStartRef.current = startedAt;
  };

  const playFeedbackSound = (isCorrect: boolean) => {
    const targetRef = isCorrect ? correctAudioRef : wrongAudioRef;
    if (!targetRef.current) {
      targetRef.current = new Audio(
        isCorrect
          ? "/soundtrack/correct-answer.mp3"
          : "/soundtrack/wrong-answer.mp3",
      );
      targetRef.current.preload = "auto";
    }

    targetRef.current.currentTime = 0;
    void targetRef.current.play().catch(() => {
      // Ignore autoplay/device audio restrictions silently.
    });
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
    const now = performance.now();
    const elapsed = Math.max(
      0,
      Math.round((now - questionStartRef.current) / 1000),
    );
    timePerQuestionRef.current.push(elapsed);
    questionStartRef.current = now;
  };

  const goToNextQuestion = () => {
    const selectedOptionIndex = answers[currentQuestion.id];
    const hasAnswer = typeof selectedOptionIndex === "number";
    const hasConfidence = Boolean(confidenceByQuestion[currentQuestion.id]);
    if (!hasAnswer || !hasConfidence) {
      return;
    }

    playFeedbackSound(selectedOptionIndex === currentQuestion.correct);
    recordElapsedForCurrentQuestion();

    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex((previous) => previous + 1);
      setTimeLeft(TOTAL_TIME_SECONDS);
      return;
    }
    finishQuiz("Completed");
  };

  const calculateScore = useCallback(() => {
    let score = 0;
    for (const question of activeQuestions) {
      if (answers[question.id] === question.correct) {
        score += 1;
      }
    }
    return score;
  }, [activeQuestions, answers]);

  const finishQuiz = useCallback((status: "Completed" | "Time Up") => {
    const score = calculateScore();
    const endTime = performance.now();
    const elapsedSeconds = quizStartRef.current
      ? Math.round((endTime - quizStartRef.current) / 1000)
      : TOTAL_TIME_SECONDS - timeLeft;

    if (status === "Time Up") {
      const partial = Math.max(
        0,
        Math.round((performance.now() - questionStartRef.current) / 1000),
      );
      timePerQuestionRef.current = [...timePerQuestionRef.current, partial];
    }

    const { times, confidences } = padResearchArrays(
      activeQuestions,
      timePerQuestionRef.current,
      confidenceByQuestion,
    );

    setFinalScore(score);
    setResultStatus(status);
    setTimeTaken(elapsedSeconds);
    setStep("result");
    setSaveNotice(null);

    const answersMap = buildAnswersMap(answers, activeQuestions);
    const categoryScores = computeCategoryScores(activeQuestions, answers);

    void saveSubmission({
      name: userInfo.name,
      ageGroup: deriveAgeGroup(userInfo.age),
      school: userInfo.school,
      className: userInfo.className,
      parentEmail: userInfo.parentEmail,
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
  }, [activeQuestions, answers, calculateScore, confidenceByQuestion, timeLeft, userInfo.age, userInfo.className, userInfo.name, userInfo.parentEmail, userInfo.school]);

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
    setSelectedLevel(null);
    setUserInfo({
      name: "",
      age: "",
      school: "",
      className: "",
      parentEmail: "",
      parentConsent: false,
    });
    setCurrentQuestionIndex(0);
    setAnswers({});
    setConfidenceByQuestion({});
    setTimeLeft(TOTAL_TIME_SECONDS);
    quizStartRef.current = null;
    setFinalScore(0);
    setTimeTaken(0);
    setResultStatus("Completed");
    setSaveNotice(null);
    timePerQuestionRef.current = [];
  };

  const progressFraction =
    activeQuestions.length > 0
      ? (currentQuestionIndex + 1) / activeQuestions.length
      : 0;

  const resultTips = useMemo(() => {
    const scores = computeCategoryScores(activeQuestions, answers);
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
  }, [activeQuestions, answers]);

  const scorePercent =
    activeQuestions.length > 0 ? finalScore / activeQuestions.length : 0;
  const resultHeadline =
    scorePercent >= 0.8
      ? "You are a Civic Champion 🐬"
      : scorePercent >= 0.5
        ? "You are a Rising Civic Star 🌟"
        : "Thanks for sharing how you think! 💙";

  const canAdvanceQuestion =
    typeof answers[currentQuestion?.id ?? 0] === "number" &&
    Boolean(confidenceByQuestion[currentQuestion?.id ?? 0]);
  const activeLevelMeta = selectedLevel
    ? LEVELS.find((level) => level.id === selectedLevel)
    : null;

  return (
    <div
      className="relative min-h-screen px-3 py-6 md:px-4 md:py-8"
      style={{
        background:
          "linear-gradient(180deg, #EAF7FF 0%, #F6FCFF 42%, #ECF8FF 100%)",
        color: "#1E2C3B",
      }}
    >
      <main className="relative z-10 mx-auto flex min-h-[88vh] w-full max-w-2xl flex-col rounded-[34px] border border-[#dceef8] bg-white p-5 text-center leading-relaxed shadow-[0_18px_40px_rgba(6,62,95,0.14)] md:max-w-4xl md:p-8 lg:max-w-5xl">
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-[#f0f9ff] px-3 py-2 text-xs font-bold text-[#29516d] md:text-sm">
          <span>⚡ {selectedLevel ? "In Level Mode" : "Warmup"}</span>
          <span>🪙 {finalScore}</span>
          <span>❤️ {step === "quiz" ? "3" : "∞"}</span>
        </div>

        {step === "start" && (
          <div className="mb-4 flex w-full items-start justify-center gap-3 rounded-3xl bg-gradient-to-b from-[#EAF7FF] via-[#F2FBFF] to-[#DDF3FF] p-4 md:gap-4 md:p-5">
            <p className="mt-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-[#063E5F] shadow-[0_8px_18px_rgba(6,62,95,0.18)] md:text-base">
              Hello, I&apos;m Civvy 👋
            </p>
            <Image
              src="/Civvy-v2.png"
              alt="Civvy dolphin"
              width={220}
              height={220}
              priority
              className="h-32 w-32 object-contain md:h-40 md:w-40"
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

        <h1 className="mb-2 font-[var(--font-montserrat)] text-4xl font-black tracking-tight leading-[1.2] md:text-5xl">
          CiviQuest
        </h1>
        <p className="mb-6 text-sm md:text-base" style={{ color: "#063E5F" }}>
          Learn real-world civic skills through mini game levels.
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

        {step === "form" && (
          <section className="w-full space-y-4 text-left">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            </div>

            <div
              className="rounded-2xl border p-4"
              style={{ borderColor: "#E5F6FF", backgroundColor: "#f7fcff" }}
            >
              <p className="mb-1 text-sm font-bold text-[#063E5F]">
                Parent or guardian permission
              </p>
              <p className="mb-3 text-xs text-[#4d6e86]">
                We only save quiz answers for our civic-education research with a
                parent or guardian&apos;s okay. Your email is just for consent and
                won&apos;t be shared or used for marketing — you can ask us to
                delete it anytime.
              </p>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">
                  Parent/guardian email
                </span>
                <input
                  type="email"
                  value={userInfo.parentEmail}
                  onChange={(event) =>
                    handleFormChange("parentEmail", event.target.value)
                  }
                  placeholder="parent@example.com"
                  className="min-h-[48px] w-full rounded-xl border px-4 py-3 text-base outline-none"
                  style={{ borderColor: "#E5F6FF" }}
                />
              </label>
              <label className="mt-3 flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={userInfo.parentConsent}
                  onChange={(event) =>
                    handleFormChange("parentConsent", event.target.checked)
                  }
                  className="mt-1 h-5 w-5 shrink-0"
                />
                <span className="text-[#063E5F]">
                  I am a parent/guardian and I agree to let CiviQuest save my
                  child&apos;s quiz answers for this research study.
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => setStep("levels")}
              disabled={
                !userInfo.name ||
                !userInfo.age ||
                !userInfo.school ||
                !userInfo.className ||
                !userInfo.parentConsent ||
                !EMAIL_PATTERN.test(userInfo.parentEmail)
              }
              className="mt-3 min-h-[52px] w-full rounded-2xl px-6 py-5 font-[var(--font-montserrat)] text-xl font-bold text-white transition enabled:hover:scale-[1.02] enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: "#4296CD" }}
            >
              Continue
            </button>
          </section>
        )}

        {step === "levels" && (
          <section className="w-full text-left">
            <p className="mb-4 rounded-2xl bg-[#E5F6FF] px-4 py-3 text-sm font-semibold text-[#063E5F] md:text-base">
              Pick your level, just like a game map. You can finish one level now
              and come back for the next.
            </p>
            <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-2">
              {LEVELS.map((level, index) => {
                const isLast = index === LEVELS.length - 1;
                return (
                  <div key={`${level.id}-node`} className="flex items-center gap-2">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-white text-xl shadow-md"
                      style={{ backgroundColor: level.color }}
                    >
                      {level.emoji}
                    </div>
                    {!isLast && (
                      <div className="h-2 w-12 shrink-0 rounded-full bg-[#cfe8f8]" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mb-5 flex gap-4 overflow-x-auto pb-1">
              {LEVELS.map((level) => {
                const questionCount = QUESTIONS.filter(
                  (question) => question.category === level.id,
                ).length;
                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={(event) => startQuiz(level.id, event.timeStamp)}
                    className="min-w-[264px] flex-1 rounded-3xl border border-[#d7ecf8] bg-white p-4 text-left shadow-[0_12px_24px_rgba(6,62,95,0.12)] transition hover:-translate-y-0.5"
                  >
                    <p className="text-2xl">{level.emoji}</p>
                    <p className="mt-2 text-lg font-black text-[#063E5F]">
                      {level.title}
                    </p>
                    <p className="mt-1 text-sm text-[#37556d]">{level.subtitle}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-bold text-white"
                        style={{ backgroundColor: level.color }}
                      >
                        {questionCount} missions
                      </span>
                      <span className="text-sm font-bold text-[#2589C9]">
                        Start →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-[#4f6c83] md:text-sm">
              Designed for classes 5–8: shorter levels, bigger buttons, and kid-friendly language.
            </p>
          </section>
        )}

        {step === "quiz" && currentQuestion && (
          <section className="w-full">
            <div className="relative w-full rounded-[28px] border border-[#dbeef9] bg-white px-5 pb-10 pt-5 text-center shadow-[0_24px_60px_rgba(6,62,95,0.14)] md:px-8 md:pt-6">
              <div className="mb-4 flex justify-end">
                <span className="rounded-full bg-[#4296CD] px-4 py-2 text-sm font-bold text-white shadow-sm">
                  {timeLeft}s
                </span>
              </div>

              <div className="md:grid md:grid-cols-2 md:items-start md:gap-8 lg:gap-10">
                <div>
                  {activeLevelMeta && (
                    <div className="mb-4 rounded-2xl bg-[#f4fbff] px-3 py-2 text-left">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#2589C9]">
                        {activeLevelMeta.title}
                      </p>
                      <p className="text-xs text-[#3d5f78]">{activeLevelMeta.subtitle}</p>
                    </div>
                  )}

                  <div className="mb-4 text-left">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-[#2589C9] md:text-base">
                        Question {currentQuestionIndex + 1} of {activeQuestions.length}
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
                      aria-valuemax={activeQuestions.length}
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

                  <h2 className="mb-8 text-2xl font-black leading-[1.35] text-[#063E5F] md:mb-0 md:text-3xl">
                    {currentQuestion.question}
                  </h2>
                </div>

                <div>
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
                    {currentQuestionIndex === activeQuestions.length - 1
                      ? "Submit"
                      : "Next question"}
                  </button>
                </div>
              </div>
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
              {activeQuestions.length} picks that match our “kind to community”
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
              src="/Civvy-v2.png"
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
              {activeQuestions.map((question, index) => {
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
              Back to Level Map
            </button>
          </section>
        )}

        {(step === "levels" || step === "quiz" || step === "result") && (
          <div className="mt-auto pt-5">
            <div className="flex items-center justify-around rounded-2xl border border-[#d9ebf7] bg-[#f7fcff] px-3 py-2 text-xs font-bold text-[#4d6e86]">
              <Link
                href="/"
                className="transition hover:text-[#063E5F]"
              >
                🏠 Home
              </Link>
              <span>🗺️ Levels</span>
              <span>🏆 Badges</span>
              <span>👤 Profile</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
