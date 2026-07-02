import type { Metadata } from "next";
import { AboutContent } from "@/app/components/AboutContent";

export const metadata: Metadata = {
  title: "About CiviQuest — why civic sense, why classes 5–8",
  description:
    "CiviQuest is a gamified civic awareness platform for Indian children in classes 5–8, built on the idea that small everyday actions create better communities.",
};

export default function AboutPage() {
  return <AboutContent />;
}
