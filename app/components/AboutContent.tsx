"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CATEGORY_ORDER, FINAL_META, levelMeta } from "@/lib/civiquest-questions";
import { loadLang, saveLang, ui, type Lang } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";

const COPY = {
  en: {
    heroTitle1: "Small actions.",
    heroTitle2: "Better India.",
    heroText:
      "Children learn civic rules in school — but often only in theory. CiviQuest turns that passive learning into a game: real-life situations from Indian streets, parks, buses, and classrooms, where every choice you practise here becomes easier to make out there.",
    whyTitle: "Why classes 5 to 8? 🌱",
    why1:
      "Ages 10 to 14 are a golden window. Research in child development calls these the years when values move from “rules parents gave me” to “things I believe myself.” Habits formed now — carrying litter to a bin, waiting for the green signal, saving water — tend to stick for life.",
    why2:
      "Children this age are also natural influencers at home: a 10-year-old who insists on segregating waste often gets the whole family doing it. Reaching one child in class 6 can quietly reach a household of five.",
    why3:
      "That is why CiviQuest speaks to classes 5–8 in their own language: short missions, instant feedback, streaks and badges — the same playful mechanics kids love, pointed at littering, traffic discipline, public kindness, and water wastage, the civic challenges most visible across India. Values inculcated in this window don't just make polite students — they grow into citizens who build a better India.",
    questsTitle: "Five levels for every class 🗺️",
    questsText:
      "Every class from 5 to 8 gets its own five-level quest — four themed quests with questions written for that grade, and a golden Boss Level 👑 that mixes them all into one final challenge.",
    civvyTitle: "Meet Civvy 🐬",
    civvyText:
      "Civvy is a bright blue dolphin in a civic-hero cape. We chose a dolphin because dolphins are intelligent, friendly, and deeply social — exactly the qualities of a thoughtful citizen. Civvy is not a teacher or an examiner; Civvy is a teammate who celebrates every kind choice you make.",
    responsibleTitle: "Responsible by design 🔒",
    responsible: [
      "Answers are saved for civic-education research only after a parent or guardian gives consent with their email.",
      "Nothing is shared or used for marketing — ever.",
      "Parents can ask us to delete their child's data anytime.",
      "Teachers see only their own class's responses, through a protected dashboard, to encourage — never to punish.",
    ],
    capstone:
      "CiviQuest currently doubles as a product prototype and a data collection tool for a Google Data Analytics capstone project. The dream: leaderboards, school dashboards, animated explainers, and a multilingual platform for classrooms across India and beyond.",
    cta: "Start your quest →",
    back: "← Play",
  },
  hi: {
    heroTitle1: "छोटे क़दम।",
    heroTitle2: "बेहतर भारत।",
    heroText:
      "बच्चे स्कूल में नागरिक नियम सीखते हैं — पर अक्सर सिर्फ़ किताबों में। CiviQuest उस किताबी सीख को खेल बना देता है: भारतीय सड़कों, पार्कों, बसों और क्लासरूम की असली परिस्थितियाँ, जहाँ यहाँ अभ्यास किया हर चुनाव बाहर करना आसान हो जाता है।",
    whyTitle: "कक्षा 5 से 8 ही क्यों? 🌱",
    why1:
      "10 से 14 साल की उम्र सुनहरी खिड़की है। बाल-विकास शोध कहता है कि इन्हीं सालों में मूल्य “मम्मी-पापा के नियम” से बदलकर “मेरी अपनी सोच” बनते हैं। अभी बनी आदतें — कचरा डस्टबिन तक ले जाना, हरी बत्ती का इंतज़ार, पानी की बचत — ज़िंदगी भर साथ रहती हैं।",
    why2:
      "इस उम्र के बच्चे घर के क़ुदरती इन्फ़्लुएंसर भी होते हैं: कचरा अलग करने की ज़िद करने वाला 10 साल का बच्चा अक्सर पूरे परिवार से करवा लेता है। कक्षा 6 के एक बच्चे तक पहुँचना चुपचाप पाँच लोगों के घर तक पहुँचना है।",
    why3:
      "इसीलिए CiviQuest कक्षा 5–8 से उन्हीं की भाषा में बात करता है: छोटे मिशन, तुरंत फ़ीडबैक, स्ट्रीक और बैज — वही खेल वाली चीज़ें जो बच्चों को पसंद हैं, और निशाना: कचरा, ट्रैफ़िक अनुशासन, सार्वजनिक दयालुता और पानी की बर्बादी — भारत की सबसे दिखती नागरिक चुनौतियाँ। इस उम्र में पड़े संस्कार सिर्फ़ विनम्र छात्र नहीं बनाते — वे नागरिक बनते हैं जो बेहतर भारत गढ़ते हैं।",
    questsTitle: "हर कक्षा के लिए पाँच लेवल 🗺️",
    questsText:
      "कक्षा 5 से 8 तक हर कक्षा को अपनी पाँच-लेवल की क्वेस्ट मिलती है — उस कक्षा के लिए लिखे सवालों वाली चार थीम क्वेस्ट, और एक सुनहरा बॉस लेवल 👑 जो सबको मिलाकर आख़िरी चुनौती बनाता है।",
    civvyTitle: "मिलो सिवी से 🐬",
    civvyText:
      "सिवी सिविक-हीरो केप वाली चमकीली नीली डॉल्फ़िन है। हमने डॉल्फ़िन चुनी क्योंकि डॉल्फ़िन बुद्धिमान, दोस्ताना और मिलनसार होती हैं — बिल्कुल एक समझदार नागरिक के गुण। सिवी न टीचर है, न परीक्षक; सिवी वह साथी है जो तुम्हारे हर अच्छे चुनाव पर जश्न मनाती है।",
    responsibleTitle: "ज़िम्मेदारी हमारी बनावट में है 🔒",
    responsible: [
      "जवाब सिर्फ़ नागरिक-शिक्षा शोध के लिए, और सिर्फ़ माता-पिता/अभिभावक की ईमेल-सहमति के बाद सहेजे जाते हैं।",
      "कुछ भी साझा या विज्ञापन के लिए इस्तेमाल नहीं होता — कभी नहीं।",
      "माता-पिता कभी भी अपने बच्चे का डेटा हटवाने के लिए कह सकते हैं।",
      "शिक्षक सुरक्षित डैशबोर्ड से सिर्फ़ अपनी कक्षा के जवाब देखते हैं — हौसला बढ़ाने के लिए, सज़ा के लिए कभी नहीं।",
    ],
    capstone:
      "CiviQuest अभी एक प्रोडक्ट प्रोटोटाइप और Google Data Analytics कैपस्टोन प्रोजेक्ट के लिए डेटा-संग्रह उपकरण, दोनों है। सपना: लीडरबोर्ड, स्कूल डैशबोर्ड, एनिमेटेड समझाने वाले वीडियो, और भारत तथा उसके बाहर की कक्षाओं के लिए बहुभाषी मंच।",
    cta: "अपनी क्वेस्ट शुरू करो →",
    back: "← खेलें",
  },
} as const;

export function AboutContent() {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    setLang(loadLang());
  }, []);
  const c = COPY[lang];
  const t = ui(lang);

  const changeLang = (next: Lang) => {
    setLang(next);
    saveLang(next);
  };

  const card = {
    borderColor: "var(--line)",
    backgroundColor: "var(--card)",
    boxShadow: "var(--shadow-pop)",
  } as const;

  return (
    <div className="min-h-screen px-4 py-6 md:px-6 md:py-8">
      <header className="mx-auto mb-8 flex w-full max-w-4xl flex-wrap items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/cq-logo.png"
            alt="CiviQuest logo"
            width={44}
            height={44}
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
          <Link
            href="/"
            className="rounded-full border px-4 py-2 text-sm font-bold transition hover:scale-105"
            style={{
              borderColor: "var(--line)",
              backgroundColor: "var(--card)",
              color: "var(--text-strong)",
            }}
          >
            {c.back}
          </Link>
          <LanguageToggle lang={lang} onChange={changeLang} />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl space-y-6 text-left">
        <section
          className="rounded-[34px] border p-6 md:p-10"
          style={{ ...card, boxShadow: "var(--shadow)" }}
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
                {c.heroTitle1}
                <br />
                {c.heroTitle2}
              </h1>
              <p style={{ color: "var(--text-soft)" }}>{c.heroText}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border p-6 md:p-8" style={card}>
          <h2
            className="mb-3 font-[var(--font-montserrat)] text-2xl font-black md:text-3xl"
            style={{ color: "var(--text-strong)" }}
          >
            {c.whyTitle}
          </h2>
          <div className="space-y-3" style={{ color: "var(--text-soft)" }}>
            <p>{c.why1}</p>
            <p>{c.why2}</p>
            <p>{c.why3}</p>
          </div>
        </section>

        <section className="rounded-[34px] border p-6 md:p-8" style={card}>
          <h2
            className="mb-3 font-[var(--font-montserrat)] text-2xl font-black md:text-3xl"
            style={{ color: "var(--text-strong)" }}
          >
            {c.questsTitle}
          </h2>
          <p className="mb-4 text-sm md:text-base" style={{ color: "var(--text-soft)" }}>
            {c.questsText}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[...CATEGORY_ORDER, "final" as const].map((key) => {
              const base = key === "final" ? FINAL_META : levelMeta(key);
              const loc = t.meta[key];
              return (
                <div
                  key={key}
                  className="flex items-start gap-3 rounded-2xl border p-4"
                  style={{
                    borderColor: key === "final" ? "var(--gold)" : "var(--line)",
                    backgroundColor: "var(--card-soft)",
                  }}
                >
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl"
                    style={{ backgroundColor: base.color }}
                  >
                    {base.emoji}
                  </span>
                  <div>
                    <p className="font-black" style={{ color: "var(--text-strong)" }}>
                      {loc.title}
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-soft)" }}>
                      {loc.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[34px] border p-6 md:p-8" style={card}>
          <h2
            className="mb-3 font-[var(--font-montserrat)] text-2xl font-black md:text-3xl"
            style={{ color: "var(--text-strong)" }}
          >
            {c.civvyTitle}
          </h2>
          <p style={{ color: "var(--text-soft)" }}>{c.civvyText}</p>
        </section>

        <section className="rounded-[34px] border p-6 md:p-8" style={card}>
          <h2
            className="mb-3 font-[var(--font-montserrat)] text-2xl font-black md:text-3xl"
            style={{ color: "var(--text-strong)" }}
          >
            {c.responsibleTitle}
          </h2>
          <ul
            className="list-inside list-disc space-y-2 text-sm md:text-base"
            style={{ color: "var(--text-soft)" }}
          >
            {c.responsible.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm" style={{ color: "var(--text-faint)" }}>
            {c.capstone}
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
            {c.cta}
          </Link>
        </div>
      </main>
    </div>
  );
}
