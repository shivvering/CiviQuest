import type { LevelKey } from "./civiquest-questions";

export type StoredProfile = {
  name: string;
  age: string;
  school: string;
  className: string;
  parentEmail: string;
  parentConsent: boolean;
};

export type LevelResult = {
  bestScore: number;
  totalQuestions: number;
  attempts: number;
};

export type Progress = {
  xp: number;
  levels: Partial<Record<LevelKey, LevelResult>>;
  badges: string[];
  streak: { lastDay: string; count: number };
};

const PROFILE_KEY = "cq-profile";
const PROGRESS_KEY = "cq-progress";
const THEME_KEY = "cq-theme";

export const EMPTY_PROGRESS: Progress = {
  xp: 0,
  levels: {},
  badges: [],
  streak: { lastDay: "", count: 0 },
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadProfile(): StoredProfile | null {
  if (typeof window === "undefined") {
    return null;
  }
  return safeParse<StoredProfile>(window.localStorage.getItem(PROFILE_KEY));
}

export function saveProfile(profile: StoredProfile) {
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearProfile() {
  window.localStorage.removeItem(PROFILE_KEY);
  window.localStorage.removeItem(PROGRESS_KEY);
}

export function loadProgress(): Progress {
  if (typeof window === "undefined") {
    return EMPTY_PROGRESS;
  }
  return (
    safeParse<Progress>(window.localStorage.getItem(PROGRESS_KEY)) ??
    EMPTY_PROGRESS
  );
}

export function saveProgress(progress: Progress) {
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Bumps the daily streak; call once when a level is finished. */
export function touchStreak(progress: Progress): Progress {
  const today = todayString();
  if (progress.streak.lastDay === today) {
    return progress;
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
  const continues = progress.streak.lastDay === yesterdayString;
  return {
    ...progress,
    streak: { lastDay: today, count: continues ? progress.streak.count + 1 : 1 },
  };
}

export function loadTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

export function saveTheme(theme: "light" | "dark") {
  window.localStorage.setItem(THEME_KEY, theme);
  document.documentElement.dataset.theme = theme;
}

// ─── Badges ────────────────────────────────────────────────────────

export type BadgeDef = {
  id: string;
  emoji: string;
  title: string;
  hint: string;
};

export const BADGES: BadgeDef[] = [
  {
    id: "first-splash",
    emoji: "🌊",
    title: "First Splash",
    hint: "Finish your first level.",
  },
  {
    id: "perfect-wave",
    emoji: "🏆",
    title: "Perfect Wave",
    hint: "Score 100% in any level.",
  },
  {
    id: "quick-fin",
    emoji: "⚡",
    title: "Quick Fin",
    hint: "Finish a level averaging under 20s a question.",
  },
  {
    id: "all-rounder",
    emoji: "🧭",
    title: "All-Rounder",
    hint: "Finish all four quests.",
  },
  {
    id: "boss-crown",
    emoji: "👑",
    title: "Crown of Civvy",
    hint: "Conquer the Civic Hero Finale.",
  },
  {
    id: "streak-3",
    emoji: "🔥",
    title: "On Fire",
    hint: "Play on 3 different days in a row.",
  },
  {
    id: "civic-hero",
    emoji: "🦸",
    title: "Civic Hero",
    hint: "Collect 300 XP.",
  },
];

export function evaluateBadges(
  progress: Progress,
  lastLevel: { score: number; total: number; totalTime: number },
): string[] {
  const earned = new Set(progress.badges);
  const newly: string[] = [];
  const award = (id: string) => {
    if (!earned.has(id)) {
      earned.add(id);
      newly.push(id);
    }
  };

  const questsDone = Object.keys(progress.levels).filter(
    (key) => key !== "final",
  ).length;
  if (Object.keys(progress.levels).length >= 1) award("first-splash");
  if (lastLevel.total > 0 && lastLevel.score === lastLevel.total)
    award("perfect-wave");
  if (lastLevel.total > 0 && lastLevel.totalTime / lastLevel.total < 20)
    award("quick-fin");
  if (questsDone >= 4) award("all-rounder");
  if (progress.levels.final) award("boss-crown");
  if (progress.streak.count >= 3) award("streak-3");
  if (progress.xp >= 300) award("civic-hero");

  progress.badges = [...earned];
  return newly;
}
