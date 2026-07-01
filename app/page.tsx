import Image from "next/image";
import Link from "next/link";
import { CursorFollowBubbles } from "@/app/components/CursorFollowBubbles";
import { LandingPoppableDecor } from "@/app/components/LandingPoppableDecor";

export default function Home() {
  return (
    <div
      className="relative min-h-screen bg-transparent px-3 py-6 md:px-4 md:py-8"
      style={{ color: "#1E2C3B" }}
    >
      <CursorFollowBubbles />
      <LandingPoppableDecor />
      <main className="relative z-10 mx-auto flex min-h-[88vh] w-full max-w-2xl flex-col justify-center rounded-[34px] border border-[#dceef8] bg-transparent p-8 text-center leading-relaxed shadow-[0_18px_40px_rgba(6,62,95,0.14)] md:p-10">
        <Image
          src="/cq-logo.png"
          alt="CiviQuest CQ logo"
          width={112}
          height={112}
          priority
          className="mx-auto mb-4 h-20 w-20 object-contain md:h-24 md:w-24"
        />
        <h1 className="mb-3 font-[var(--font-montserrat)] text-4xl font-black tracking-tight leading-[1.2] md:text-5xl lg:text-6xl">
          CiviQuest
        </h1>
        <p
          className="mb-2 text-lg font-semibold md:text-xl"
          style={{ color: "#063E5F" }}
        >
          Practice civic sense through playful mini-levels.
        </p>
        <p className="mb-10 text-sm md:text-base" style={{ color: "#37556d" }}>
          Built for students in classes 5–8 — short missions, friendly language,
          and real-world situations.
        </p>
        <Link
          href="/play"
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl px-6 py-5 font-[var(--font-montserrat)] text-2xl font-bold text-white transition hover:scale-[1.02] active:scale-[0.98]"
          style={{ backgroundColor: "#4296CD" }}
        >
          Play
        </Link>
      </main>
    </div>
  );
}
