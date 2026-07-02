import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/civiquest-questions";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export const metadata: Metadata = {
  title: "About CiviQuest — why civic sense, why classes 5–8",
  description:
    "CiviQuest is a gamified civic awareness platform for Indian children in classes 5–8, built on the idea that small everyday actions create better communities.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen px-4 py-6 md:px-6 md:py-8">
      <header className="mx-auto mb-8 flex w-full max-w-4xl items-center justify-between gap-3">
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
            CiviQuest
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
            ← Play
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl space-y-6 text-left">
        <section
          className="rounded-[34px] border p-6 md:p-10"
          style={{
            borderColor: "var(--line)",
            backgroundColor: "var(--card)",
            boxShadow: "var(--shadow)",
          }}
        >
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <Image
              src="/Civvy-v2.png"
              alt="Civvy the dolphin"
              width={220}
              height={220}
              priority
              className="cq-float h-40 w-40 object-contain md:h-52 md:w-52"
            />
            <div>
              <h1
                className="mb-3 font-[var(--font-montserrat)] text-3xl font-black md:text-5xl"
                style={{ color: "var(--text-strong)" }}
              >
                Small actions.
                <br />
                Better India.
              </h1>
              <p style={{ color: "var(--text-soft)" }}>
                Children learn civic rules in school — but often only in
                theory. CiviQuest turns that passive learning into a game:
                real-life situations from Indian streets, parks, buses, and
                classrooms, where every choice you practise here becomes easier
                to make out there.
              </p>
            </div>
          </div>
        </section>

        <section
          className="rounded-[34px] border p-6 md:p-8"
          style={{
            borderColor: "var(--line)",
            backgroundColor: "var(--card)",
            boxShadow: "var(--shadow-pop)",
          }}
        >
          <h2
            className="mb-3 font-[var(--font-montserrat)] text-2xl font-black md:text-3xl"
            style={{ color: "var(--text-strong)" }}
          >
            Why classes 5 to 8? 🌱
          </h2>
          <div className="space-y-3" style={{ color: "var(--text-soft)" }}>
            <p>
              Ages 10 to 14 are a golden window. Research in child development
              calls these the years when values move from &ldquo;rules parents
              gave me&rdquo; to &ldquo;things I believe myself.&rdquo; Habits
              formed now — carrying litter to a bin, waiting for the green
              signal, saving water — tend to stick for life.
            </p>
            <p>
              Children this age are also natural influencers at home: a
              10-year-old who insists on segregating waste often gets the whole
              family doing it. Reaching one child in class 6 can quietly reach
              a household of five.
            </p>
            <p>
              That is why CiviQuest speaks to classes 5–8 in their own
              language: short missions, instant feedback, streaks and badges —
              the same playful mechanics kids love, pointed at littering,
              traffic discipline, public kindness, and water wastage, the civic
              challenges most visible across India. Values inculcated in this
              window don&apos;t just make polite students — they grow into
              citizens who build a better India.
            </p>
          </div>
        </section>

        <section
          className="rounded-[34px] border p-6 md:p-8"
          style={{
            borderColor: "var(--line)",
            backgroundColor: "var(--card)",
            boxShadow: "var(--shadow-pop)",
          }}
        >
          <h2
            className="mb-3 font-[var(--font-montserrat)] text-2xl font-black md:text-3xl"
            style={{ color: "var(--text-strong)" }}
          >
            The four quests 🗺️
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {CATEGORY_ORDER.map((cat) => {
              const meta = CATEGORY_META[cat];
              return (
                <div
                  key={cat}
                  className="flex items-start gap-3 rounded-2xl border p-4"
                  style={{
                    borderColor: "var(--line)",
                    backgroundColor: "var(--card-soft)",
                  }}
                >
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl"
                    style={{ backgroundColor: meta.color }}
                  >
                    {meta.emoji}
                  </span>
                  <div>
                    <p className="font-black" style={{ color: "var(--text-strong)" }}>
                      {meta.title}
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-soft)" }}>
                      {meta.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section
          className="rounded-[34px] border p-6 md:p-8"
          style={{
            borderColor: "var(--line)",
            backgroundColor: "var(--card)",
            boxShadow: "var(--shadow-pop)",
          }}
        >
          <h2
            className="mb-3 font-[var(--font-montserrat)] text-2xl font-black md:text-3xl"
            style={{ color: "var(--text-strong)" }}
          >
            Meet Civvy 🐬
          </h2>
          <p style={{ color: "var(--text-soft)" }}>
            Civvy is a bright blue dolphin in a civic-hero cape. We chose a
            dolphin because dolphins are intelligent, friendly, and deeply
            social — exactly the qualities of a thoughtful citizen. Civvy is
            not a teacher or an examiner; Civvy is a teammate who celebrates
            every kind choice you make.
          </p>
        </section>

        <section
          className="rounded-[34px] border p-6 md:p-8"
          style={{
            borderColor: "var(--line)",
            backgroundColor: "var(--card)",
            boxShadow: "var(--shadow-pop)",
          }}
        >
          <h2
            className="mb-3 font-[var(--font-montserrat)] text-2xl font-black md:text-3xl"
            style={{ color: "var(--text-strong)" }}
          >
            Responsible by design 🔒
          </h2>
          <ul className="list-inside list-disc space-y-2 text-sm md:text-base" style={{ color: "var(--text-soft)" }}>
            <li>
              Answers are saved for civic-education research only after a
              parent or guardian gives consent with their email.
            </li>
            <li>Nothing is shared or used for marketing — ever.</li>
            <li>Parents can ask us to delete their child&apos;s data anytime.</li>
            <li>
              Teachers see only their own class&apos;s responses, through a
              protected dashboard, to encourage — never to punish.
            </li>
          </ul>
          <p className="mt-4 text-sm" style={{ color: "var(--text-faint)" }}>
            CiviQuest currently doubles as a product prototype and a data
            collection tool for a Google Data Analytics capstone project. The
            dream: leaderboards, school dashboards, animated explainers, and a
            multilingual platform for classrooms across India and beyond.
          </p>
        </section>

        <div className="pb-4 text-center">
          <Link
            href="/"
            className="inline-block rounded-2xl px-8 py-4 font-[var(--font-montserrat)] text-xl font-bold transition hover:scale-105"
            style={{
              backgroundColor: "var(--brand)",
              color: "var(--on-brand)",
              boxShadow: "var(--shadow-pop)",
            }}
          >
            Start your quest →
          </Link>
        </div>
      </main>
    </div>
  );
}
