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
    problemTitle: "The problem we're solving 🧩",
    problemLead:
      "More than 4,000 years ago, Mohenjo-daro had covered drains. Today, litter still lands a metre away from the bin. India's civic sense problem isn't about what children know — it's about what they practise.",
    problemPoints: [
      {
        emoji: "🧠",
        title: "A habit gap, not a knowledge gap",
        text: "Children already know littering is wrong. Litter dropped next to a bin, traffic lanes treated as suggestions, taps left running — these aren't only enforcement failures. They're habits, and habits form early.",
      },
      {
        emoji: "📖",
        title: "Taught once, then forgotten",
        text: "In most schools, civic education is a textbook chapter, examined once and forgotten. What's missing is repetition and delivery — something that makes the right choice habitual, not occasional.",
      },
      {
        emoji: "🔁",
        title: "Borrowing what already works",
        text: "Duolingo didn't make languages easier with better textbooks. It made them stick with short, repeatable daily practice and visible progress. CiviQuest brings those same mechanics to everyday civic choices.",
      },
      {
        emoji: "🗣️",
        title: "Two languages from day one",
        text: "A civic tool that works only in English isn't civic education for most Indian schoolchildren. Every scenario is written to read naturally in both English and Hindi — not translated as an afterthought.",
      },
    ],
    problemQuote:
      "We cannot work towards a clean India without first being able to imagine one. That imagining has to start young.",
    problemHonest:
      "An honest note: CiviQuest is a prototype, not yet a proven intervention. We'll only know whether it changes how children behave at a bus stop once schools use it and there is real data to study.",
    whyTitle: "Why classes 5 to 8? 🌱",
    why1:
      "Ten to fourteen is the window where behaviour hardens into values. Younger children mostly follow instructions; older ones have already formed their positions. In between, a child is old enough to reason about why something matters — and young enough to change what they do about it. Habits formed now, like carrying litter to a bin or waiting for the green signal, tend to stick for life.",
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
    susuTitle: "Civvy's real-life cousin 🌊",
    susuText1:
      "Civvy is inspired by the Ganges river dolphin — India's national aquatic animal, lovingly called the “susu” for the sound it makes when it surfaces to breathe. It is nearly blind and finds its way through our rivers using sound alone.",
    susuText2:
      "Today the susu is endangered: only a few thousand remain, threatened by polluted water, plastic waste, and shrinking rivers. That is exactly why Civvy wears the civic-hero cape — every wrapper that reaches a bin instead of a drain, and every drop of water saved, makes India's rivers safer for Civvy's real family. Your civic sense is their lifeline.",
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
    problemTitle: "हम कौन-सी समस्या हल कर रहे हैं 🧩",
    problemLead:
      "4,000 से भी ज़्यादा साल पहले मोहनजोदड़ो में ढकी हुई नालियाँ थीं। आज भी कचरा डस्टबिन से एक मीटर दूर गिरता है। भारत की सिविक सेंस की समस्या यह नहीं कि बच्चे क्या जानते हैं — बल्कि यह है कि वे क्या अभ्यास करते हैं।",
    problemPoints: [
      {
        emoji: "🧠",
        title: "आदत की कमी, जानकारी की नहीं",
        text: "बच्चे पहले से जानते हैं कि कचरा फैलाना ग़लत है। डस्टबिन के पास फेंका कचरा, ट्रैफ़िक लेन को बस सुझाव समझना, खुला छोड़ा नल — ये सिर्फ़ नियम लागू न होने की ग़लती नहीं। ये आदतें हैं, और आदतें बचपन में बनती हैं।",
      },
      {
        emoji: "📖",
        title: "एक बार पढ़ाया, फिर भुला दिया",
        text: "ज़्यादातर स्कूलों में नागरिक शिक्षा किताब का एक पाठ है — एक बार परीक्षा हुई और भूल गए। कमी है दोहराव और सही तरीक़े की — कुछ ऐसा जो सही चुनाव को कभी-कभार की बजाय आदत बना दे।",
      },
      {
        emoji: "🔁",
        title: "जो पहले से काम करता है, वही अपनाया",
        text: "Duolingo ने भाषाएँ बेहतर किताबों से आसान नहीं कीं। छोटे, रोज़ दोहराए जाने वाले अभ्यास और दिखती प्रगति से उन्हें पक्का किया। CiviQuest यही तरीक़ा रोज़ के नागरिक चुनावों पर लाता है।",
      },
      {
        emoji: "🗣️",
        title: "पहले दिन से दो भाषाएँ",
        text: "जो नागरिक-शिक्षा का साधन सिर्फ़ अंग्रेज़ी में चले, वह ज़्यादातर भारतीय स्कूली बच्चों के लिए नागरिक शिक्षा नहीं है। हर परिस्थिति अंग्रेज़ी और हिंदी दोनों में स्वाभाविक लगे, इस तरह लिखी गई है — बाद में अनुवाद करके नहीं।",
      },
    ],
    problemQuote:
      "हम साफ़ भारत की ओर तभी बढ़ सकते हैं, जब पहले उसकी कल्पना कर सकें। और यह कल्पना बचपन से शुरू होनी चाहिए।",
    problemHonest:
      "एक ईमानदार बात: CiviQuest अभी एक प्रोटोटाइप है, साबित हुआ समाधान नहीं। यह बस स्टॉप पर बच्चों का व्यवहार बदलता है या नहीं, यह तभी पता चलेगा जब स्कूल इसे इस्तेमाल करेंगे और असली डेटा आएगा।",
    whyTitle: "कक्षा 5 से 8 ही क्यों? 🌱",
    why1:
      "10 से 14 साल वह उम्र है जब व्यवहार मूल्यों में बदलता है। छोटे बच्चे ज़्यादातर बस निर्देश मानते हैं; बड़े बच्चे अपनी राय पहले ही बना चुके होते हैं। बीच की इस उम्र में बच्चा यह समझने लायक़ बड़ा होता है कि कोई बात क्यों ज़रूरी है — और अपना व्यवहार बदलने लायक़ छोटा भी। अभी बनी आदतें, जैसे कचरा डस्टबिन तक ले जाना या हरी बत्ती का इंतज़ार, ज़िंदगी भर साथ रहती हैं।",
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
    susuTitle: "सिवी की असली बहन 🌊",
    susuText1:
      "सिवी की प्रेरणा है गंगा नदी की डॉल्फ़िन — भारत का राष्ट्रीय जलीय जीव, जिसे साँस लेने के लिए ऊपर आने पर निकलने वाली आवाज़ के कारण प्यार से “सूसू” कहते हैं। यह लगभग देख नहीं पाती और सिर्फ़ आवाज़ के सहारे हमारी नदियों में रास्ता खोजती है।",
    susuText2:
      "आज सूसू संकट में है: कुछ ही हज़ार बची हैं — गंदे पानी, प्लास्टिक कचरे और सूखती नदियों के कारण। इसीलिए सिवी ने सिविक-हीरो केप पहनी है — नाले की जगह डस्टबिन में पहुँचा हर रैपर और बचाई गई पानी की हर बूँद भारत की नदियों को सिवी के असली परिवार के लिए सुरक्षित बनाती है। तुम्हारा सिविक सेंस ही उनकी ज़िंदगी की डोर है।",
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
    const stored = loadLang();
    setLang(stored);
    document.documentElement.lang = stored;
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
            {c.problemTitle}
          </h2>
          <p
            className="mb-5 text-base md:text-lg"
            style={{ color: "var(--text-soft)" }}
          >
            {c.problemLead}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {c.problemPoints.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--line)",
                  backgroundColor: "var(--card-soft)",
                }}
              >
                <p className="mb-1 text-2xl" aria-hidden>
                  {point.emoji}
                </p>
                <p className="mb-1 font-black" style={{ color: "var(--text-strong)" }}>
                  {point.title}
                </p>
                <p className="text-sm" style={{ color: "var(--text-soft)" }}>
                  {point.text}
                </p>
              </div>
            ))}
          </div>
          <blockquote
            className="mt-5 rounded-2xl border-l-4 px-5 py-4 text-lg font-bold italic md:text-xl"
            style={{
              borderColor: "var(--brand)",
              backgroundColor: "var(--card-softer)",
              color: "var(--text-strong)",
            }}
          >
            “{c.problemQuote}”
          </blockquote>
          <p className="mt-4 text-sm" style={{ color: "var(--text-faint)" }}>
            {c.problemHonest}
          </p>
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

        <section
          className="rounded-[34px] border-2 p-6 md:p-8"
          style={{
            borderColor: "var(--brand)",
            background:
              "linear-gradient(160deg, var(--card) 0%, var(--card-soft) 100%)",
            boxShadow: "var(--shadow-pop)",
          }}
        >
          <h2
            className="mb-3 font-[var(--font-montserrat)] text-2xl font-black md:text-3xl"
            style={{ color: "var(--text-strong)" }}
          >
            {c.susuTitle}
          </h2>
          <div className="space-y-3" style={{ color: "var(--text-soft)" }}>
            <p>{c.susuText1}</p>
            <p>{c.susuText2}</p>
          </div>
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
