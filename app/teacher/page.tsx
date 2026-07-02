"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CATEGORY_META, QUESTIONS } from "@/lib/civiquest-questions";
import type { TeacherSubmissionRow } from "@/lib/research-types";
import { ThemeToggle } from "@/app/components/ThemeToggle";

const GRADES = ["A+", "A", "B", "C", "Needs Practice"];

type RowState = {
  grade: string;
  comment: string;
  saving: boolean;
  savedTick: boolean;
};

export default function TeacherPage() {
  const [teacherName, setTeacherName] = useState("");
  const [school, setSchool] = useState("");
  const [className, setClassName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<TeacherSubmissionRow[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [rowState, setRowState] = useState<Record<string, RowState>>({});

  const questionById = useMemo(() => {
    const map = new Map<string, (typeof QUESTIONS)[number]>();
    for (const q of QUESTIONS) {
      map.set(String(q.id), q);
    }
    return map;
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    setRows(null);
    try {
      const params = new URLSearchParams({ school, className });
      const res = await fetch(`/api/quiz-submissions?${params}`, {
        headers: { "x-teacher-code": code },
      });
      const data = (await res.json()) as {
        submissions?: TeacherSubmissionRow[];
        error?: string;
      };
      if (!res.ok || !data.submissions) {
        setError(data.error ?? `Could not load (${res.status}).`);
        return;
      }
      setRows(data.submissions);
      const initial: Record<string, RowState> = {};
      for (const row of data.submissions) {
        initial[row.id] = {
          grade: row.teacherGrade ?? "",
          comment: row.teacherComment ?? "",
          saving: false,
          savedTick: false,
        };
      }
      setRowState(initial);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveGrade = async (id: string) => {
    const state = rowState[id];
    if (!state?.grade) return;
    setRowState((prev) => ({
      ...prev,
      [id]: { ...prev[id], saving: true, savedTick: false },
    }));
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-teacher-code": code,
        },
        body: JSON.stringify({
          id,
          grade: state.grade,
          comment: state.comment,
          teacherName,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not save grade.");
        setRowState((prev) => ({
          ...prev,
          [id]: { ...prev[id], saving: false },
        }));
        return;
      }
      setRowState((prev) => ({
        ...prev,
        [id]: { ...prev[id], saving: false, savedTick: true },
      }));
    } catch {
      setError("Network error while saving grade.");
      setRowState((prev) => ({
        ...prev,
        [id]: { ...prev[id], saving: false },
      }));
    }
  };

  const inputStyle = {
    borderColor: "var(--line)",
    backgroundColor: "var(--card-soft)",
    color: "var(--text)",
  } as const;

  return (
    <div className="min-h-screen px-4 py-6 md:px-6 md:py-8">
      <header className="mx-auto mb-6 flex w-full max-w-5xl items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/cq-logo.png"
            alt="CiviQuest logo"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
          />
          <span
            className="font-[var(--font-montserrat)] text-xl font-black tracking-tight md:text-2xl"
            style={{ color: "var(--text-strong)" }}
          >
            CiviQuest <span style={{ color: "var(--brand-strong)" }}>· Teachers</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-full border px-4 py-2 text-sm font-bold transition hover:scale-105"
            style={{
              borderColor: "var(--line)",
              backgroundColor: "var(--card)",
              color: "var(--text-strong)",
            }}
          >
            ← Student app
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl text-left">
        <section
          className="mb-6 rounded-[28px] border p-5 md:p-6"
          style={{
            borderColor: "var(--line)",
            backgroundColor: "var(--card)",
            boxShadow: "var(--shadow)",
          }}
        >
          <h1
            className="mb-1 font-[var(--font-montserrat)] text-2xl font-black md:text-3xl"
            style={{ color: "var(--text-strong)" }}
          >
            Class dashboard 🧑‍🏫
          </h1>
          <p className="mb-4 text-sm" style={{ color: "var(--text-soft)" }}>
            See how your class answered, spot weak civic areas, and leave an
            encouraging grade. Enter the school and class exactly as your
            students typed them, plus the teacher access code.
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
                Your name
              </span>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="e.g. Mrs. Sharma"
                className="min-h-[46px] w-full rounded-xl border px-3 py-2.5 outline-none"
                style={inputStyle}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
                School
              </span>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="School name"
                className="min-h-[46px] w-full rounded-xl border px-3 py-2.5 outline-none"
                style={inputStyle}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
                Class
              </span>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="min-h-[46px] w-full rounded-xl border px-3 py-2.5 outline-none"
                style={inputStyle}
              >
                <option value="">Select</option>
                <option value="5">Class 5</option>
                <option value="6">Class 6</option>
                <option value="7">Class 7</option>
                <option value="8">Class 8</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
                Access code
              </span>
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Teacher code"
                className="min-h-[46px] w-full rounded-xl border px-3 py-2.5 outline-none"
                style={inputStyle}
              />
            </label>
          </div>
          <button
            type="button"
            disabled={!teacherName.trim() || !school.trim() || !className || !code || loading}
            onClick={load}
            className="mt-4 min-h-[48px] w-full rounded-2xl px-6 py-3 font-[var(--font-montserrat)] text-lg font-bold transition enabled:hover:scale-[1.01] enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            style={{ backgroundColor: "var(--brand)", color: "var(--on-brand)" }}
          >
            {loading ? "Loading…" : "Load class responses →"}
          </button>
          {error && (
            <p className="mt-3 text-sm font-semibold" style={{ color: "var(--wrong-text)" }}>
              {error}
            </p>
          )}
        </section>

        {rows && rows.length === 0 && (
          <p className="text-center text-sm" style={{ color: "var(--text-faint)" }}>
            No responses yet for {school}, class {className}. Ask your students
            to play a level!
          </p>
        )}

        {rows && rows.length > 0 && (
          <section className="space-y-3">
            <p className="text-sm font-semibold" style={{ color: "var(--text-soft)" }}>
              {rows.length} response{rows.length === 1 ? "" : "s"} · newest
              first
            </p>
            {rows.map((row) => {
              const p = row.payload;
              const meta =
                CATEGORY_META[p.levelCategory as keyof typeof CATEGORY_META];
              const state = rowState[row.id];
              const isOpen = openId === row.id;
              const total = p.totalQuestions || Object.keys(p.answers).length;
              return (
                <article
                  key={row.id}
                  className="rounded-3xl border p-4 md:p-5"
                  style={{
                    borderColor: "var(--line)",
                    backgroundColor: "var(--card)",
                    boxShadow: "var(--shadow-pop)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : row.id)}
                    className="flex w-full flex-wrap items-center gap-3 text-left"
                    aria-expanded={isOpen}
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl"
                      style={{ backgroundColor: meta?.color ?? "var(--card-softer)" }}
                    >
                      {meta?.emoji ?? "📝"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-black" style={{ color: "var(--text-strong)" }}>
                        {p.name}{" "}
                        <span className="font-semibold" style={{ color: "var(--text-faint)" }}>
                          · {meta?.title ?? p.levelCategory}
                        </span>
                      </span>
                      <span className="block text-xs" style={{ color: "var(--text-faint)" }}>
                        {new Date(row.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}{" "}
                        · {p.totalTime}s · {p.quizStatus}
                      </span>
                    </span>
                    <span
                      className="rounded-full px-3 py-1.5 text-sm font-black"
                      style={{
                        backgroundColor: "var(--card-softer)",
                        color: "var(--text-strong)",
                      }}
                    >
                      {p.score}/{total}
                    </span>
                    {row.teacherGrade && !isOpen && (
                      <span
                        className="rounded-full px-3 py-1.5 text-sm font-black"
                        style={{ backgroundColor: "var(--gold)", color: "#5b4300" }}
                      >
                        {row.teacherGrade}
                      </span>
                    )}
                    <span aria-hidden style={{ color: "var(--text-faint)" }}>
                      {isOpen ? "▲" : "▼"}
                    </span>
                  </button>

                  {isOpen && state && (
                    <div className="cq-slide-up mt-4 space-y-4">
                      <div className="grid gap-2 md:grid-cols-2">
                        {Object.entries(p.answers).map(([qid, answer], i) => {
                          const q = questionById.get(qid);
                          if (!q) return null;
                          const correct = answer === q.options[q.correct];
                          return (
                            <div
                              key={qid}
                              className="rounded-xl border p-3 text-sm"
                              style={{
                                borderColor: correct
                                  ? "var(--correct-line)"
                                  : "var(--wrong-line)",
                                backgroundColor: correct
                                  ? "var(--correct-bg)"
                                  : "var(--wrong-bg)",
                              }}
                            >
                              <p className="font-semibold" style={{ color: "var(--text)" }}>
                                {i + 1}. {q.question}
                              </p>
                              <p style={{ color: "var(--text-soft)" }}>
                                {correct ? "✅" : "❌"}{" "}
                                {answer || "(no answer — timed out)"}
                                {!correct && (
                                  <>
                                    {" "}
                                    · Expected:{" "}
                                    <span className="font-semibold">
                                      {q.options[q.correct]}
                                    </span>
                                  </>
                                )}
                              </p>
                              <p className="mt-1 text-xs" style={{ color: "var(--text-faint)" }}>
                                Confidence: {p.confidenceLevels[i] ?? "—"} ·{" "}
                                {p.timePerQuestion[i] ?? "—"}s
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      <div
                        className="rounded-2xl border p-4"
                        style={{
                          borderColor: "var(--line)",
                          backgroundColor: "var(--card-soft)",
                        }}
                      >
                        <p className="mb-2 text-sm font-black" style={{ color: "var(--text-strong)" }}>
                          Grade this attempt
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {GRADES.map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() =>
                                setRowState((prev) => ({
                                  ...prev,
                                  [row.id]: {
                                    ...prev[row.id],
                                    grade: g,
                                    savedTick: false,
                                  },
                                }))
                              }
                              className="rounded-full border-2 px-4 py-1.5 text-sm font-bold transition hover:scale-105"
                              style={
                                state.grade === g
                                  ? {
                                      backgroundColor: "var(--brand)",
                                      borderColor: "var(--brand)",
                                      color: "var(--on-brand)",
                                    }
                                  : {
                                      backgroundColor: "var(--card)",
                                      borderColor: "var(--line)",
                                      color: "var(--text-strong)",
                                    }
                              }
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={state.comment}
                          onChange={(e) =>
                            setRowState((prev) => ({
                              ...prev,
                              [row.id]: {
                                ...prev[row.id],
                                comment: e.target.value,
                                savedTick: false,
                              },
                            }))
                          }
                          placeholder="Encouraging note (optional) — e.g. 'Great road sense, let's practise water habits!'"
                          rows={2}
                          className="mt-3 w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                          style={inputStyle}
                        />
                        <div className="mt-2 flex items-center gap-3">
                          <button
                            type="button"
                            disabled={!state.grade || state.saving}
                            onClick={() => saveGrade(row.id)}
                            className="rounded-xl px-5 py-2.5 font-bold transition enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                            style={{
                              backgroundColor: "var(--brand-strong)",
                              color: "var(--on-brand)",
                            }}
                          >
                            {state.saving ? "Saving…" : "Save grade"}
                          </button>
                          {state.savedTick && (
                            <span className="cq-pop-in text-sm font-bold" style={{ color: "var(--correct-text)" }}>
                              ✅ Saved
                            </span>
                          )}
                          {row.gradedBy && (
                            <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                              Last graded by {row.gradedBy}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}

        <p className="mt-8 text-center text-xs" style={{ color: "var(--text-faint)" }}>
          Teachers see only their own class&apos;s responses. Grades are meant
          to encourage — Civvy never punishes. 💙
        </p>
      </main>
    </div>
  );
}
