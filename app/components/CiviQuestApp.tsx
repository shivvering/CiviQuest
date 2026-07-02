"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LEVEL_SEQUENCE,
  levelMeta,
  questionsForLevel,
  type LevelKey,
} from "@/lib/civiquest-questions";
import { localizeQuestion } from "@/lib/civiquest-questions-hi";
import {
  buildAnswersMap,
  computeCategoryScores,
  deriveAgeGroup,
  padResearchArrays,
} from "@/lib/research-helpers";
import { loadLang, saveLang, ui, type Lang } from "@/lib/i18n";
import type { ConfidenceLabel } from "@/lib/research-types";
import { saveSubmission } from "@/lib/save-submission";
import {
  BADGES,
  EMPTY_PROGRESS,
  clearProfile,
  evaluateBadges,
  loadProfile,
  loadProgress,
  saveProfile,
  saveProgress,
  touchStreak,
  type Progress,
  type StoredProfile,
} from "@/lib/progress";
import { Confetti } from "./Confetti";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";

type Tab = "home" | "badges" | "profile";
type HomeStep = "hero" | "onboarding" | "map" | "quiz" | "result";
type QuizPhase = "answering" | "revealed";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const QUESTION_SECONDS = 60;
const HEARTS_PER_LEVEL = 3;

/** Canonical confidence values — always stored in English. */
const CONFIDENCE_OPTIONS: ConfidenceLabel[] = [
  "I am sure",
  "Not sure",
  "Just guessed",
];

const EMPTY_PROFILE: StoredProfile = {
  name: "",
  age: "",
  school: "",
  className: "",
  parentEmail: "",
  parentConsent: false,
};

export function CiviQuestApp() {
  const [tab, setTab] = useState<Tab>("home");
  const [step, setStep] = useState<HomeStep>("hero");
  const [profile, setProfile] = useState<StoredProfile>(EMPTY_PROFILE);
  const [hasProfile, setHasProfile] = useState(false);
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [hydrated, setHydrated] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const t = ui(lang);

  // Quiz state
  const [category, setCategory] = useState<LevelKey | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [phase, setPhase] = useState<QuizPhase>("answering");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [confidences, setConfidences] = useState<
    Record<number, ConfidenceLabel>
  >({});
  const [hearts, setHearts] = useState(HEARTS_PER_LEVEL);
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);
  const [timedOutIds, setTimedOutIds] = useState<number[]>([]);

  // Result state
  const [finalScore, setFinalScore] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [saveNotice, setSaveNotice] = useState(false);

  const questionStartRef = useRef(0);
  const quizStartRef = useRef(0);
  const timePerQuestionRef = useRef<number[]>([]);
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const wrongAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const stored = loadProfile();
    if (stored) {
      setProfile(stored);
      setHasProfile(true);
      setStep("map");
    }
    setProgress(loadProgress());
    setLang(loadLang());
    setHydrated(true);
  }, []);

  const changeLang = (next: Lang) => {
    setLang(next);
    saveLang(next);
  };

  const questions = useMemo(
    () => (category ? questionsForLevel(category, profile.className) : []),
    [category, profile.className],
  );
  const question = questions[qIndex];
  const localized = question ? localizeQuestion(question, lang) : null;

  const confidenceLabel = (value: ConfidenceLabel): string =>
    value === "I am sure" ? t.sure : value === "Not sure" ? t.notSure : t.guessed;

  const playSound = (isCorrect: boolean) => {
    const ref = isCorrect ? correctAudioRef : wrongAudioRef;
    if (!ref.current) {
      ref.current = new Audio(
        isCorrect
          ? "/soundtrack/correct-answer.mp3"
          : "/soundtrack/wrong-answer.mp3",
      );
      ref.current.preload = "auto";
    }
    ref.current.currentTime = 0;
    void ref.current.play().catch(() => {
      /* device audio restrictions */
    });
  };

  // ─── Quiz engine ─────────────────────────────────────────────────

  const startLevel = (cat: LevelKey) => {
    setCategory(cat);
    setQIndex(0);
    setPhase("answering");
    setAnswers({});
    setConfidences({});
    setHearts(HEARTS_PER_LEVEL);
    setTimeLeft(QUESTION_SECONDS);
    setTimedOutIds([]);
    setSaveNotice(false);
    timePerQuestionRef.current = [];
    quizStartRef.current = performance.now();
    questionStartRef.current = performance.now();
    setStep("quiz");
  };

  const recordElapsed = () => {
    const elapsed = Math.max(
      0,
      Math.round((performance.now() - questionStartRef.current) / 1000),
    );
    timePerQuestionRef.current.push(elapsed);
  };

  const check = useCallback(() => {
    if (!question) return;
    const picked = answers[question.id];
    if (typeof picked !== "number" || !confidences[question.id]) return;
    recordElapsed();
    const isCorrect = picked === question.correct;
    playSound(isCorrect);
    if (!isCorrect) {
      setHearts((h) => Math.max(0, h - 1));
    }
    setPhase("revealed");
  }, [answers, confidences, question]);

  const handleTimeout = useCallback(() => {
    if (!question) return;
    recordElapsed();
    playSound(false);
    setHearts((h) => Math.max(0, h - 1));
    setTimedOutIds((ids) => [...ids, question.id]);
    setPhase("revealed");
  }, [question]);

  useEffect(() => {
    if (step !== "quiz" || phase !== "answering") return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const timer = window.setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [step, phase, timeLeft, handleTimeout]);

  const finishLevel = useCallback(() => {
    if (!category) return;
    let score = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correct) score += 1;
    }
    const totalSeconds = Math.round(
      (performance.now() - quizStartRef.current) / 1000,
    );

    // XP: 10 per correct, +20 finishing, +20 perfect
    const earned = score * 10 + 20 + (score === questions.length ? 20 : 0);

    let next: Progress = {
      ...progress,
      xp: progress.xp + earned,
      levels: {
        ...progress.levels,
        [category]: {
          bestScore: Math.max(
            progress.levels[category]?.bestScore ?? 0,
            score,
          ),
          totalQuestions: questions.length,
          attempts: (progress.levels[category]?.attempts ?? 0) + 1,
        },
      },
    };
    next = touchStreak(next);
    const badges = evaluateBadges(next, {
      score,
      total: questions.length,
      totalTime: totalSeconds,
    });
    saveProgress(next);
    setProgress(next);
    setNewBadges(badges);
    setFinalScore(score);
    setTimeTaken(totalSeconds);
    setXpEarned(earned);
    setStep("result");
    setSaveNotice(false);

    const { times, confidences: paddedConf } = padResearchArrays(
      questions,
      timePerQuestionRef.current,
      confidences,
    );
    // Answers and confidences are saved as canonical English text regardless
    // of the display language, so the research data stays uniform.
    void saveSubmission({
      name: profile.name,
      ageGroup: deriveAgeGroup(profile.age),
      school: profile.school,
      className: profile.className,
      parentEmail: profile.parentEmail,
      levelCategory: category,
      answers: buildAnswersMap(answers, questions),
      score,
      totalQuestions: questions.length,
      totalTime: totalSeconds,
      timePerQuestion: times,
      confidenceLevels: paddedConf,
      categoryScores: computeCategoryScores(questions, answers),
      quizStatus: timedOutIds.length > 0 ? "Time Up" : "Completed",
    }).then((result) => {
      if (result.ok) {
        setSaveNotice(true);
      }
    });
  }, [
    answers,
    category,
    confidences,
    profile,
    progress,
    questions,
    timedOutIds,
  ]);

  const continueNext = () => {
    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
      setPhase("answering");
      setTimeLeft(QUESTION_SECONDS);
      questionStartRef.current = performance.now();
    } else {
      finishLevel();
    }
  };

  // ─── Derived ─────────────────────────────────────────────────────

  const formValid =
    profile.name.trim() &&
    profile.age &&
    profile.school.trim() &&
    profile.className &&
    profile.parentConsent &&
    EMAIL_PATTERN.test(profile.parentEmail);

  const unlockIndex = useMemo(() => {
    let unlocked = 0;
    for (const key of LEVEL_SEQUENCE) {
      if (progress.levels[key]) unlocked += 1;
      else break;
    }
    return unlocked; // nodes 0..unlocked are playable
  }, [progress.levels]);

  const starsFor = (cat: LevelKey): number => {
    const level = progress.levels[cat];
    if (!level || level.totalQuestions === 0) return 0;
    const pct = level.bestScore / level.totalQuestions;
    if (pct >= 0.99) return 3;
    if (pct >= 0.7) return 2;
    if (pct >= 0.4) return 1;
    return 0;
  };

  const metaFor = (key: LevelKey) => {
    const base = levelMeta(key);
    const localizedMeta = t.meta[key];
    return { ...base, ...localizedMeta };
  };

  const scorePercent =
    questions.length > 0 ? finalScore / questions.length : 0;

  // ─── UI pieces ───────────────────────────────────────────────────

  const statChip = (emoji: string, value: string, label: string) => (
    <span
      className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold md:text-sm"
      style={{
        borderColor: "var(--line)",
        backgroundColor: "var(--card)",
        color: "var(--text-strong)",
      }}
      title={label}
    >
      <span aria-hidden>{emoji}</span> {value}
    </span>
  );

  const header = (
    <header className="mx-auto mb-4 flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-1">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/cq-logo.png"
          alt="CiviQuest logo"
          width={44}
          height={44}
          priority
          className="h-10 w-11 object-contain"
        />
        <span
          className="font-[var(--font-montserrat)] text-xl font-black tracking-tight md:text-2xl"
          style={{ color: "var(--text-strong)" }}
        >
          CiviQuest
        </span>
      </Link>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {hydrated && hasProfile && (
          <>
            {statChip("🔥", String(progress.streak.count), t.dayStreak)}
            {statChip("⭐", String(progress.xp), t.xp)}
            {step === "quiz" && statChip("❤️", String(hearts), "Hearts")}
          </>
        )}
        <Link
          href="/about"
          className="hidden rounded-full border px-4 py-2 text-sm font-bold transition hover:scale-105 sm:block"
          style={{
            borderColor: "var(--line)",
            backgroundColor: "var(--card)",
            color: "var(--text-strong)",
          }}
        >
          {t.about}
        </Link>
        <LanguageToggle lang={lang} onChange={changeLang} />
        <ThemeToggle />
      </div>
    </header>
  );

  const bottomNav = (
    <nav
      className="mx-auto mt-6 flex w-full max-w-5xl items-stretch justify-around rounded-2xl border p-1.5 text-sm font-bold"
      style={{
        borderColor: "var(--line)",
        backgroundColor: "var(--card)",
        color: "var(--text-faint)",
      }}
    >
      {(
        [
          ["home", "🗺️", t.questMap],
          ["badges", "🏆", t.badgesWord],
          ["profile", "👤", t.profileWord],
        ] as const
      ).map(([id, emoji, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => {
            setTab(id);
            if (id === "home" && hasProfile && step !== "hero" && step !== "onboarding") {
              setStep("map");
            }
          }}
          aria-current={tab === id ? "page" : undefined}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 transition hover:scale-[1.03] active:scale-95"
          style={
            tab === id
              ? { backgroundColor: "var(--card-softer)", color: "var(--text-strong)" }
              : undefined
          }
        >
          <span aria-hidden>{emoji}</span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );

  // ─── Screens ─────────────────────────────────────────────────────

  const heroScreen = (
    <section className="cq-slide-up mx-auto w-full max-w-5xl">
      <div
        className="relative overflow-hidden rounded-[34px] border p-6 md:p-10"
        style={{
          borderColor: "var(--line)",
          backgroundColor: "var(--card)",
          boxShadow: "var(--shadow)",
        }}
      >
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="text-left">
            <p
              className="mb-3 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
              style={{
                backgroundColor: "var(--card-softer)",
                color: "var(--brand-strong)",
              }}
            >
              {t.heroBadge}
            </p>
            <h1
              className="mb-4 font-[var(--font-montserrat)] text-4xl font-black leading-[1.15] tracking-tight md:text-6xl"
              style={{ color: "var(--text-strong)" }}
            >
              {t.heroTitle1}
              <br />
              {t.heroTitle2}
            </h1>
            <p className="mb-6 text-base md:text-lg" style={{ color: "var(--text-soft)" }}>
              {t.heroText}
            </p>
            <div className="mb-8 flex flex-wrap gap-2">
              {LEVEL_SEQUENCE.map((key) => {
                const meta = metaFor(key);
                return (
                  <span
                    key={key}
                    className="rounded-full border px-3 py-1.5 text-xs font-bold md:text-sm"
                    style={{
                      borderColor: key === "final" ? "var(--gold)" : "var(--line)",
                      backgroundColor: "var(--card-soft)",
                      color: "var(--text-strong)",
                    }}
                  >
                    {meta.emoji} {meta.title}
                  </span>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setStep("onboarding")}
              className="w-full rounded-2xl px-8 py-5 font-[var(--font-montserrat)] text-2xl font-bold transition hover:scale-[1.03] active:scale-[0.97] md:w-auto"
              style={{
                backgroundColor: "var(--brand)",
                color: "var(--on-brand)",
                boxShadow: "var(--shadow-pop)",
              }}
            >
              {t.heroCta}
            </button>
          </div>
          <div className="relative flex items-center justify-center">
            <div
              className="absolute inset-4 rounded-full opacity-60 blur-3xl"
              style={{ backgroundColor: "var(--card-softer)" }}
            />
            <p
              className="cq-pop-in absolute -top-1 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-bold shadow-lg md:text-base"
              style={{
                backgroundColor: "var(--card)",
                color: "var(--text-strong)",
                boxShadow: "var(--shadow-pop)",
              }}
            >
              {t.civvyHello}
            </p>
            <Image
              src="/Civvy-v2.png"
              alt="Civvy the dolphin, CiviQuest's civic-hero mascot"
              width={340}
              height={340}
              priority
              className="cq-float relative h-56 w-56 object-contain md:h-80 md:w-80"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {(
          [
            ["🎮", t.cardPlay, t.cardPlayText],
            ["🧠", t.cardThink, t.cardThinkText],
            ["🌟", t.cardGrow, t.cardGrowText],
          ] as const
        ).map(([emoji, title, text]) => (
          <div
            key={title}
            className="rounded-3xl border p-5 text-left transition hover:-translate-y-1"
            style={{
              borderColor: "var(--line)",
              backgroundColor: "var(--card)",
              boxShadow: "var(--shadow-pop)",
            }}
          >
            <p className="mb-2 text-3xl">{emoji}</p>
            <p className="mb-1 text-lg font-black" style={{ color: "var(--text-strong)" }}>
              {title}
            </p>
            <p className="text-sm" style={{ color: "var(--text-soft)" }}>
              {text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );

  const inputStyle = {
    borderColor: "var(--line)",
    backgroundColor: "var(--card-soft)",
    color: "var(--text)",
  } as const;

  const onboardingScreen = (
    <section
      className="cq-slide-up mx-auto w-full max-w-3xl rounded-[34px] border p-6 text-left md:p-8"
      style={{
        borderColor: "var(--line)",
        backgroundColor: "var(--card)",
        boxShadow: "var(--shadow)",
      }}
    >
      <h2
        className="mb-1 font-[var(--font-montserrat)] text-2xl font-black md:text-3xl"
        style={{ color: "var(--text-strong)" }}
      >
        {t.obTitle}
      </h2>
      <p className="mb-5 text-sm" style={{ color: "var(--text-soft)" }}>
        {t.obSubtitle}
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{t.name}</span>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder={t.namePh}
            className="min-h-[48px] w-full rounded-xl border px-4 py-3 text-base outline-none"
            style={inputStyle}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{t.age}</span>
          <input
            type="number"
            min="9"
            max="15"
            value={profile.age}
            onChange={(e) => setProfile({ ...profile, age: e.target.value })}
            placeholder={t.agePh}
            className="min-h-[48px] w-full rounded-xl border px-4 py-3 text-base outline-none"
            style={inputStyle}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{t.school}</span>
          <input
            type="text"
            value={profile.school}
            onChange={(e) => setProfile({ ...profile, school: e.target.value })}
            placeholder={t.schoolPh}
            className="min-h-[48px] w-full rounded-xl border px-4 py-3 text-base outline-none"
            style={inputStyle}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{t.className}</span>
          <select
            value={profile.className}
            onChange={(e) =>
              setProfile({ ...profile, className: e.target.value })
            }
            className="min-h-[48px] w-full rounded-xl border px-4 py-3 text-base outline-none"
            style={inputStyle}
          >
            <option value="">{t.selectClass}</option>
            {["5", "6", "7", "8"].map((c) => (
              <option key={c} value={c}>
                {t.classWord} {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        className="mt-4 rounded-2xl border p-4"
        style={{ borderColor: "var(--line)", backgroundColor: "var(--card-soft)" }}
      >
        <p className="mb-1 text-sm font-bold" style={{ color: "var(--text-strong)" }}>
          {t.parentTitle}
        </p>
        <p className="mb-3 text-xs" style={{ color: "var(--text-faint)" }}>
          {t.parentNote}
        </p>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{t.parentEmail}</span>
          <input
            type="email"
            value={profile.parentEmail}
            onChange={(e) =>
              setProfile({ ...profile, parentEmail: e.target.value })
            }
            placeholder="parent@example.com"
            className="min-h-[48px] w-full rounded-xl border px-4 py-3 text-base outline-none"
            style={{ ...inputStyle, backgroundColor: "var(--card)" }}
          />
        </label>
        <label className="mt-3 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={profile.parentConsent}
            onChange={(e) =>
              setProfile({ ...profile, parentConsent: e.target.checked })
            }
            className="mt-1 h-5 w-5 shrink-0"
          />
          <span style={{ color: "var(--text-strong)" }}>{t.consent}</span>
        </label>
      </div>

      <button
        type="button"
        disabled={!formValid}
        onClick={() => {
          saveProfile(profile);
          setHasProfile(true);
          setStep("map");
        }}
        className="mt-5 min-h-[52px] w-full rounded-2xl px-6 py-4 font-[var(--font-montserrat)] text-xl font-bold transition enabled:hover:scale-[1.02] enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        style={{ backgroundColor: "var(--brand)", color: "var(--on-brand)" }}
      >
        {t.openMap}
      </button>
    </section>
  );

  const mapScreen = (
    <section className="cq-slide-up mx-auto w-full max-w-3xl">
      <div
        className="mb-6 flex items-center gap-4 rounded-3xl border p-4 md:p-5"
        style={{
          borderColor: "var(--line)",
          backgroundColor: "var(--card)",
          boxShadow: "var(--shadow-pop)",
        }}
      >
        <Image
          src="/Civvy-v2.png"
          alt=""
          width={80}
          height={80}
          priority
          className="cq-float h-16 w-16 object-contain md:h-20 md:w-20"
        />
        <div className="min-w-0 flex-1 text-left">
          <p className="text-lg font-black md:text-xl" style={{ color: "var(--text-strong)" }}>
            {t.hi} {profile.name.split(" ")[0] || "explorer"}! 🌊
          </p>
          <p className="text-sm" style={{ color: "var(--text-soft)" }}>
            {unlockIndex === 0
              ? t.mapStart
              : unlockIndex >= LEVEL_SEQUENCE.length
                ? t.mapAllDone
                : `${t.nextStop} ${metaFor(LEVEL_SEQUENCE[unlockIndex]).title}!`}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-black md:text-sm"
          style={{
            borderColor: "var(--line)",
            backgroundColor: "var(--card-soft)",
            color: "var(--brand-strong)",
          }}
        >
          {t.classWord} {profile.className} · {t.levels5}
        </span>
      </div>

      <div className="relative">
        <svg
          aria-hidden
          className="absolute left-1/2 top-0 h-full w-2 -translate-x-1/2"
          preserveAspectRatio="none"
          viewBox="0 0 4 100"
        >
          <line
            x1="2"
            y1="0"
            x2="2"
            y2="100"
            stroke="var(--line)"
            strokeWidth="4"
            strokeDasharray="8 16"
            strokeLinecap="round"
            className="cq-path-dash"
          />
        </svg>

        <ol className="relative space-y-5">
          {LEVEL_SEQUENCE.map((cat, index) => {
            const meta = metaFor(cat);
            const isBoss = cat === "final";
            const unlocked = index <= unlockIndex;
            const played = Boolean(progress.levels[cat]);
            const stars = starsFor(cat);
            const side = isBoss
              ? "md:mx-auto"
              : index % 2 === 0
                ? "md:mr-auto"
                : "md:ml-auto";
            return (
              <li key={cat} className={`relative md:w-[calc(50%+56px)] ${side}`}>
                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => startLevel(cat)}
                  className="group flex w-full items-center gap-4 rounded-3xl border p-4 text-left transition enabled:hover:-translate-y-1 enabled:hover:shadow-lg disabled:opacity-55 md:p-5"
                  style={{
                    borderColor: isBoss && unlocked ? "var(--gold)" : "var(--line)",
                    borderWidth: isBoss ? 2 : 1,
                    backgroundColor: "var(--card)",
                    boxShadow: "var(--shadow-pop)",
                  }}
                >
                  <span
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 text-3xl transition group-enabled:group-hover:scale-110"
                    style={{
                      backgroundColor: unlocked ? meta.color : "var(--card-softer)",
                      borderColor: "var(--card)",
                      boxShadow: "var(--shadow-pop)",
                    }}
                  >
                    {unlocked ? meta.emoji : "🔒"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className="block text-xs font-bold uppercase tracking-wider"
                      style={{ color: isBoss ? "var(--gold)" : "var(--brand-strong)" }}
                    >
                      {isBoss ? t.bossTag : `${t.level} ${index + 1}`}
                    </span>
                    <span
                      className="block truncate text-lg font-black md:text-xl"
                      style={{ color: "var(--text-strong)" }}
                    >
                      {meta.title}
                    </span>
                    <span className="block text-xs md:text-sm" style={{ color: "var(--text-soft)" }}>
                      {meta.subtitle}
                    </span>
                    <span className="mt-1 block text-sm tracking-widest" aria-label={`${stars}/3`}>
                      {"★".repeat(stars)}
                      <span style={{ color: "var(--text-faint)", opacity: 0.4 }}>
                        {"★".repeat(3 - stars)}
                      </span>
                    </span>
                  </span>
                  <span
                    className="shrink-0 rounded-full px-4 py-2 text-sm font-bold"
                    style={
                      unlocked
                        ? {
                            backgroundColor: isBoss ? "var(--gold)" : "var(--brand)",
                            color: isBoss ? "#4a3800" : "var(--on-brand)",
                          }
                        : { backgroundColor: "var(--card-softer)", color: "var(--text-faint)" }
                    }
                  >
                    {played ? t.replay : unlocked ? (isBoss ? t.battle : t.start) : t.locked}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <p className="mt-5 text-center text-xs md:text-sm" style={{ color: "var(--text-faint)" }}>
        {t.mapFooter}
      </p>
    </section>
  );

  const quizScreen = question && localized && category && (
    <section
      className="cq-slide-up mx-auto w-full max-w-5xl rounded-[34px] border p-5 md:p-8"
      style={{
        borderColor: "var(--line)",
        backgroundColor: "var(--card)",
        boxShadow: "var(--shadow)",
      }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0 text-left">
          <p className="truncate text-xs font-bold uppercase tracking-wider" style={{ color: "var(--brand-strong)" }}>
            {metaFor(category).emoji} {metaFor(category).title} · {t.mission}{" "}
            {qIndex + 1} {t.of} {questions.length}
          </p>
          <div
            className="mt-2 h-2.5 w-40 overflow-hidden rounded-full md:w-64"
            style={{ backgroundColor: "var(--card-softer)" }}
            role="progressbar"
            aria-valuenow={qIndex + 1}
            aria-valuemin={1}
            aria-valuemax={questions.length}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((qIndex + (phase === "revealed" ? 1 : 0)) / questions.length) * 100}%`,
                backgroundColor: "var(--brand)",
              }}
            />
          </div>
        </div>
        <span
          className={`rounded-full px-4 py-2 text-base font-black tabular-nums md:text-lg ${
            phase === "answering" && timeLeft <= 10 ? "cq-pulse-danger" : ""
          }`}
          style={{
            backgroundColor:
              phase === "revealed"
                ? "var(--card-softer)"
                : timeLeft <= 10
                  ? "var(--wrong-bg)"
                  : timeLeft <= 20
                    ? "var(--gold)"
                    : "var(--brand)",
            color:
              phase === "revealed"
                ? "var(--text-faint)"
                : timeLeft <= 10
                  ? "var(--wrong-text)"
                  : timeLeft <= 20
                    ? "#5b4300"
                    : "var(--on-brand)",
          }}
          aria-label={`${timeLeft} ${t.secondsLeft}`}
        >
          ⏱ {phase === "revealed" ? "—" : `${timeLeft}s`}
        </span>
      </div>

      <div className="md:grid md:grid-cols-2 md:items-start md:gap-10">
        <h2
          className="mb-6 text-left text-xl font-black leading-[1.4] md:mb-0 md:text-2xl lg:text-3xl"
          style={{ color: "var(--text-strong)" }}
        >
          {localized.question}
        </h2>

        <div>
          <div className="space-y-3">
            {localized.options.map((option, idx) => {
              const picked = answers[question.id] === idx;
              const revealed = phase === "revealed";
              const isCorrectOption = idx === question.correct;
              let bg = "var(--card-softer)";
              let border = "var(--line)";
              let color = "var(--text-strong)";
              if (revealed && isCorrectOption) {
                bg = "var(--correct-bg)";
                border = "var(--correct-line)";
                color = "var(--correct-text)";
              } else if (revealed && picked && !isCorrectOption) {
                bg = "var(--wrong-bg)";
                border = "var(--wrong-line)";
                color = "var(--wrong-text)";
              } else if (picked) {
                bg = "var(--brand)";
                border = "var(--brand)";
                color = "var(--on-brand)";
              }
              return (
                <button
                  key={`${question.id}-${idx}`}
                  type="button"
                  disabled={revealed}
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [question.id]: idx }))
                  }
                  className="flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-base font-bold transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:active:scale-[0.98] md:text-lg"
                  style={{ backgroundColor: bg, borderColor: border, color }}
                >
                  <span
                    aria-hidden
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-black"
                    style={{
                      borderColor: "color-mix(in srgb, currentColor 25%, transparent)",
                      opacity: 0.85,
                    }}
                  >
                    {revealed && isCorrectOption
                      ? "✓"
                      : revealed && picked && !isCorrectOption
                        ? "✗"
                        : String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          {phase === "answering" && typeof answers[question.id] === "number" && (
            <div className="cq-slide-up mt-6 text-left">
              <p className="mb-2 text-sm font-bold md:text-base" style={{ color: "var(--text-strong)" }}>
                {t.howSure}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                {CONFIDENCE_OPTIONS.map((option) => {
                  const picked = confidences[question.id] === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setConfidences((prev) => ({
                          ...prev,
                          [question.id]: option,
                        }))
                      }
                      className="flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition hover:scale-[1.03] active:scale-95 md:text-base"
                      style={
                        picked
                          ? {
                              backgroundColor: "var(--brand-strong)",
                              borderColor: "var(--brand-strong)",
                              color: "var(--on-brand)",
                            }
                          : {
                              backgroundColor: "var(--card)",
                              borderColor: "var(--line)",
                              color: "var(--text-strong)",
                            }
                      }
                    >
                      {confidenceLabel(option)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {phase === "answering" ? (
            <button
              type="button"
              disabled={
                typeof answers[question.id] !== "number" ||
                !confidences[question.id]
              }
              onClick={check}
              className="mt-6 min-h-[54px] w-full rounded-2xl px-6 py-4 font-[var(--font-montserrat)] text-xl font-bold transition enabled:hover:scale-[1.02] enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: "var(--brand)", color: "var(--on-brand)" }}
            >
              {t.check}
            </button>
          ) : (
            <div className="cq-pop-in mt-6 text-left">
              <div
                className="rounded-2xl border-2 p-4"
                style={
                  timedOutIds.includes(question.id)
                    ? {
                        backgroundColor: "var(--card-softer)",
                        borderColor: "var(--line)",
                      }
                    : answers[question.id] === question.correct
                      ? {
                          backgroundColor: "var(--correct-bg)",
                          borderColor: "var(--correct-line)",
                        }
                      : {
                          backgroundColor: "var(--wrong-bg)",
                          borderColor: "var(--wrong-line)",
                        }
                }
              >
                <p className="mb-1 font-black" style={{ color: "var(--text-strong)" }}>
                  {timedOutIds.includes(question.id)
                    ? t.timeUpQ
                    : answers[question.id] === question.correct
                      ? t.cheersCorrect[question.id % t.cheersCorrect.length]
                      : t.cheersWrong[question.id % t.cheersWrong.length]}
                  {answers[question.id] === question.correct &&
                    !timedOutIds.includes(question.id) && (
                      <span className="cq-xp-rise ml-2 inline-block font-black" style={{ color: "var(--gold)" }}>
                        +10 XP
                      </span>
                    )}
                </p>
                <p className="text-sm" style={{ color: "var(--text-soft)" }}>
                  {localized.feedback}
                </p>
              </div>
              <button
                type="button"
                onClick={continueNext}
                autoFocus
                className="mt-4 min-h-[54px] w-full rounded-2xl px-6 py-4 font-[var(--font-montserrat)] text-xl font-bold transition hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: "var(--brand)", color: "var(--on-brand)" }}
              >
                {qIndex === questions.length - 1 ? t.seeResults : t.continue}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const resultScreen = category && (
    <section
      className="cq-slide-up relative mx-auto w-full max-w-3xl overflow-hidden rounded-[34px] border p-6 text-center md:p-8"
      style={{
        borderColor: "var(--line)",
        backgroundColor: "var(--card)",
        boxShadow: "var(--shadow)",
      }}
    >
      {scorePercent >= 0.7 && <Confetti />}
      <Image
        src="/Civvy-v2.png"
        alt="Civvy celebrating"
        width={160}
        height={160}
        className="cq-float mx-auto mb-3 h-28 w-28 object-contain md:h-32 md:w-32"
      />
      <h2
        className="mb-2 font-[var(--font-montserrat)] text-3xl font-black md:text-4xl"
        style={{ color: "var(--text-strong)" }}
      >
        {category === "final" && scorePercent >= 0.8
          ? t.crownHeadline
          : scorePercent >= 0.8
            ? t.champion
            : scorePercent >= 0.5
              ? t.risingStar
              : t.questComplete}
      </h2>
      <p className="mb-1 text-lg font-bold" style={{ color: "var(--text-strong)" }}>
        {finalScore}/{questions.length} {t.picksOf} ·{" "}
        {"★".repeat(starsFor(category))}
      </p>
      <p className="mb-4 text-sm" style={{ color: "var(--text-soft)" }}>
        {t.time}: {timeTaken}s · {t.xpEarned}:{" "}
        <span className="font-black" style={{ color: "var(--gold)" }}>
          +{xpEarned}
        </span>
      </p>

      {newBadges.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
          {newBadges.map((id) => {
            const def = t.badgeDefs[id as keyof typeof t.badgeDefs];
            const badge = BADGES.find((b) => b.id === id);
            if (!badge || !def) return null;
            return (
              <span
                key={id}
                className="cq-pop-in flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-black"
                style={{
                  borderColor: "var(--gold)",
                  backgroundColor: "var(--card-soft)",
                  color: "var(--text-strong)",
                }}
              >
                <span className="text-xl">{badge.emoji}</span> {t.newBadge}{" "}
                {def.title}
              </span>
            );
          })}
        </div>
      )}

      {saveNotice && (
        <p className="mb-4 text-sm font-semibold" style={{ color: "var(--correct-text)" }}>
          {t.saved}
        </p>
      )}

      <div className="max-h-64 space-y-2 overflow-auto pr-1 text-left">
        {questions.map((q, index) => {
          const loc = localizeQuestion(q, lang);
          const selectedIndex = answers[q.id];
          const selected =
            typeof selectedIndex === "number"
              ? loc.options[selectedIndex]
              : t.notAnswered;
          const isCorrect = selectedIndex === q.correct;
          const rowMessages = isCorrect ? t.rowPositive : t.rowGentle;
          return (
            <div
              key={q.id}
              className="rounded-xl border p-3"
              style={{
                borderColor: isCorrect ? "var(--correct-line)" : "var(--wrong-line)",
                backgroundColor: isCorrect ? "var(--correct-bg)" : "var(--wrong-bg)",
              }}
            >
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                {index + 1}. {loc.question}
              </p>
              <p className="text-sm" style={{ color: "var(--text-soft)" }}>
                {t.yourAnswer} {selected}
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-soft)" }}>
                {rowMessages[q.id % rowMessages.length]}{" "}
                {isCorrect
                  ? loc.feedback
                  : `${t.betterChoice} ${loc.options[q.correct]}`}
              </p>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setStep("map")}
        className="mt-5 min-h-[54px] w-full rounded-2xl px-6 py-4 font-[var(--font-montserrat)] text-xl font-bold transition hover:scale-[1.02] active:scale-[0.98]"
        style={{ backgroundColor: "var(--brand)", color: "var(--on-brand)" }}
      >
        {t.backToMap}
      </button>
    </section>
  );

  const badgesScreen = (
    <section className="cq-slide-up mx-auto w-full max-w-3xl">
      <h2
        className="mb-4 text-left font-[var(--font-montserrat)] text-2xl font-black md:text-3xl"
        style={{ color: "var(--text-strong)" }}
      >
        {t.badgeReef}
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {BADGES.map((badge) => {
          const def = t.badgeDefs[badge.id as keyof typeof t.badgeDefs];
          const earned = progress.badges.includes(badge.id);
          return (
            <div
              key={badge.id}
              className={`rounded-3xl border p-5 text-center transition hover:-translate-y-1 ${
                earned ? "" : "opacity-55 grayscale"
              }`}
              style={{
                borderColor: earned ? "var(--gold)" : "var(--line)",
                backgroundColor: "var(--card)",
                boxShadow: "var(--shadow-pop)",
              }}
            >
              <p className="mb-2 text-4xl">{earned ? badge.emoji : "❔"}</p>
              <p className="font-black" style={{ color: "var(--text-strong)" }}>
                {def?.title ?? badge.title}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-soft)" }}>
                {def?.hint ?? badge.hint}
              </p>
            </div>
          );
        })}
      </div>
      {progress.badges.length === 0 && (
        <p className="mt-5 text-center text-sm" style={{ color: "var(--text-faint)" }}>
          {t.badgesEmpty}
        </p>
      )}
    </section>
  );

  const profileScreen = (
    <section className="cq-slide-up mx-auto w-full max-w-3xl text-left">
      {!hasProfile ? (
        <div
          className="rounded-[34px] border p-8 text-center"
          style={{
            borderColor: "var(--line)",
            backgroundColor: "var(--card)",
            boxShadow: "var(--shadow)",
          }}
        >
          <p className="mb-4 text-5xl">🐬</p>
          <p className="mb-4 font-bold" style={{ color: "var(--text-strong)" }}>
            {t.noProfile}
          </p>
          <button
            type="button"
            onClick={() => {
              setTab("home");
              setStep("onboarding");
            }}
            className="rounded-2xl px-6 py-3 font-bold"
            style={{ backgroundColor: "var(--brand)", color: "var(--on-brand)" }}
          >
            {t.startNow}
          </button>
        </div>
      ) : (
        <>
          <div
            className="mb-4 flex items-center gap-4 rounded-[34px] border p-6"
            style={{
              borderColor: "var(--line)",
              backgroundColor: "var(--card)",
              boxShadow: "var(--shadow)",
            }}
          >
            <span
              className="flex h-20 w-20 items-center justify-center rounded-full text-4xl"
              style={{ backgroundColor: "var(--card-softer)" }}
            >
              🐬
            </span>
            <div className="min-w-0">
              <p className="truncate text-2xl font-black" style={{ color: "var(--text-strong)" }}>
                {profile.name}
              </p>
              <p className="text-sm" style={{ color: "var(--text-soft)" }}>
                {t.classWord} {profile.className} · {profile.school}
              </p>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {(
              [
                ["⭐", String(progress.xp), t.xp],
                ["🔥", String(progress.streak.count), t.dayStreak],
                ["🏆", String(progress.badges.length), t.badgesWord],
                [
                  "🗺️",
                  `${Object.keys(progress.levels).length}/${LEVEL_SEQUENCE.length}`,
                  t.levelsWord,
                ],
              ] as const
            ).map(([emoji, value, label]) => (
              <div
                key={label}
                className="rounded-2xl border p-4 text-center"
                style={{
                  borderColor: "var(--line)",
                  backgroundColor: "var(--card)",
                }}
              >
                <p className="text-2xl">{emoji}</p>
                <p className="text-xl font-black" style={{ color: "var(--text-strong)" }}>
                  {value}
                </p>
                <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div
            className="mb-4 rounded-3xl border p-5"
            style={{ borderColor: "var(--line)", backgroundColor: "var(--card)" }}
          >
            <p className="mb-3 font-black" style={{ color: "var(--text-strong)" }}>
              {t.levelBests}
            </p>
            <div className="space-y-3">
              {LEVEL_SEQUENCE.map((cat) => {
                const meta = metaFor(cat);
                const level = progress.levels[cat];
                const pct = level
                  ? Math.round((level.bestScore / level.totalQuestions) * 100)
                  : 0;
                return (
                  <div key={cat}>
                    <div className="mb-1 flex justify-between text-sm font-semibold">
                      <span style={{ color: "var(--text-strong)" }}>
                        {meta.emoji} {meta.title}
                      </span>
                      <span style={{ color: "var(--text-soft)" }}>
                        {level
                          ? `${level.bestScore}/${level.totalQuestions}`
                          : t.notPlayed}
                      </span>
                    </div>
                    <div
                      className="h-2.5 overflow-hidden rounded-full"
                      style={{ backgroundColor: "var(--card-softer)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: meta.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setTab("home");
                setStep("onboarding");
              }}
              className="flex-1 rounded-2xl border px-5 py-3 font-bold transition hover:scale-[1.02]"
              style={{
                borderColor: "var(--line)",
                backgroundColor: "var(--card)",
                color: "var(--text-strong)",
              }}
            >
              {t.editDetails}
            </button>
            <Link
              href="/teacher"
              className="flex-1 rounded-2xl px-5 py-3 text-center font-bold transition hover:scale-[1.02]"
              style={{ backgroundColor: "var(--brand-strong)", color: "var(--on-brand)" }}
            >
              {t.teacherLink}
            </Link>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm(t.resetConfirm)) {
                clearProfile();
                setProfile(EMPTY_PROFILE);
                setHasProfile(false);
                setProgress(EMPTY_PROGRESS);
                setTab("home");
                setStep("hero");
              }
            }}
            className="mt-3 w-full rounded-2xl px-5 py-3 text-sm font-semibold transition hover:scale-[1.01]"
            style={{ color: "var(--text-faint)" }}
          >
            {t.reset}
          </button>
        </>
      )}
    </section>
  );

  // ─── Shell ───────────────────────────────────────────────────────

  const showNav = step !== "quiz";

  return (
    <div className="relative min-h-screen px-3 py-5 md:px-6 md:py-7">
      {header}
      <main className="relative z-10">
        {tab === "home" && (
          <>
            {step === "hero" && heroScreen}
            {step === "onboarding" && onboardingScreen}
            {step === "map" && mapScreen}
            {step === "quiz" && quizScreen}
            {step === "result" && resultScreen}
          </>
        )}
        {tab === "badges" && badgesScreen}
        {tab === "profile" && profileScreen}
      </main>
      {showNav && bottomNav}
      <footer className="mx-auto mt-6 max-w-5xl text-center text-xs" style={{ color: "var(--text-faint)" }}>
        <Link href="/about" className="underline underline-offset-2">
          {t.aboutCiviquest}
        </Link>{" "}
        {t.footerTagline}
      </footer>
    </div>
  );
}
