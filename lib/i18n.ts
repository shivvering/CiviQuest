export type Lang = "en" | "hi";

const LANG_KEY = "cq-lang";

export function loadLang(): Lang {
  if (typeof window === "undefined") {
    return "en";
  }
  return window.localStorage.getItem(LANG_KEY) === "hi" ? "hi" : "en";
}

export function saveLang(lang: Lang) {
  window.localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang;
}

/**
 * UI strings. Hindi is written for 10–14 year olds: simple Devanagari with
 * everyday loanwords (डस्टबिन, सिग्नल) rather than shuddh-Hindi formality.
 * Quiz ANSWERS are always stored in English (canonical) — see
 * civiquest-questions-hi.ts for display-only question translations.
 */
export const UI = {
  en: {
    about: "About",
    play: "← Play",
    // Hero
    heroBadge: "Holiday homework · Classes 5–8 · Made in India 🇮🇳",
    heroTitle1: "Civic sense,",
    heroTitle2: "the fun way.",
    heroText:
      "Your holiday homework, turned into a game! Five levels made for your class — clean streets, safe roads, kind behaviour, saving water, and a grand finale — with Civvy the dolphin cheering you on. Finish them all and your teacher will grade your quest.",
    heroCta: "Start your quest →",
    civvyHello: "Hello, I'm Civvy 👋",
    cardPlay: "Play",
    cardPlayText:
      "5 levels for your class, 10 real-life missions each, 60 seconds per mission.",
    cardThink: "Think",
    cardThinkText: "No exam marks — choose what you would really do.",
    cardGrow: "Grow",
    cardGrowText: "XP, streaks, and badges turn habits into adventures.",
    // Onboarding
    obTitle: "Tell Civvy about you 🐬",
    obSubtitle: "This helps us pick the right questions for your class.",
    name: "Name",
    namePh: "Enter your name",
    age: "Age",
    agePh: "10 to 14",
    school: "School",
    schoolPh: "Enter school name",
    className: "Class",
    selectClass: "Select class",
    classWord: "Class",
    parentTitle: "Parent or guardian permission",
    parentNote:
      "We only save quiz answers for our civic-education research with a parent or guardian's okay. The email is just for consent and won't be shared or used for marketing — you can ask us to delete it anytime.",
    parentEmail: "Parent/guardian email",
    consent:
      "I am a parent/guardian and I agree to let CiviQuest save my child's quiz answers for this research study.",
    openMap: "Open the Quest Map →",
    // Map
    hi: "Hi",
    mapStart: "Your quest starts with Clean Streets. Ready?",
    mapAllDone: "All levels submitted — your homework is with your teacher! 👑",
    nextStop: "Next stop:",
    levels5: "5 levels",
    level: "Level",
    bossTag: "Level 5 · Boss",
    start: "Start",
    replay: "Replay",
    submitted: "Submitted ✓",
    locked: "Locked",
    battle: "Battle!",
    mapFooter:
      "Finish a level to unlock the next — 10 missions each, 60 seconds per mission. Beat all four quests to face the Boss! 👑",
    homeworkTitle: "Holiday Homework",
    homeworkNote:
      "This is graded homework — each level can be attempted only once, so answer carefully! Your teacher sees and grades every level you submit.",
    levelsDone: "levels done",
    startHere: "START",
    // Quiz
    mission: "Mission",
    of: "of",
    howSure: "How sure are you?",
    sure: "I am sure",
    notSure: "Not sure",
    guessed: "Just guessed",
    check: "Check ✓",
    continue: "Continue →",
    seeResults: "See results 🏁",
    timeUpQ: "⏰ Time's up for this one!",
    secondsLeft: "seconds left",
    cheersCorrect: [
      "Splash-tastic! 🎉",
      "Your street just got prouder!",
      "Civvy is doing a backflip! 🐬",
      "That's civic-hero thinking!",
    ],
    cheersWrong: [
      "Good try! Here's the trick…",
      "Almost! Civvy learned this the hard way too.",
      "Every answer teaches us something. 💙",
    ],
    // Result
    crownHeadline: "You wear the Crown! 👑",
    champion: "Civic Champion! 🏆",
    risingStar: "Rising Civic Star 🌟",
    questComplete: "Quest complete — thanks for sharing! 💙",
    picksOf: "community-friendly picks",
    time: "Time",
    xpEarned: "XP earned",
    newBadge: "New badge:",
    saved:
      "Homework saved! Your teacher can now see and grade this level. ✓",
    statXp: "TOTAL XP",
    statTime: "TIME",
    statAccuracy: "ACCURACY",
    yourAnswer: "Your answer:",
    notAnswered: "Not answered",
    betterChoice: "A choice that often works:",
    backToMap: "Back to Quest Map 🗺️",
    // Badges
    badgeReef: "Badge Reef 🏆",
    badgesEmpty: "Play your first level to start collecting badges!",
    // Profile
    noProfile: "No explorer profile yet — start your quest to create one!",
    startNow: "Start now →",
    xp: "XP",
    dayStreak: "Day streak",
    badgesWord: "Badges",
    levelsWord: "Levels",
    levelBests: "Level bests",
    notPlayed: "Not played",
    editDetails: "✏️ Edit details",
    teacherLink: "🧑‍🏫 Teacher? Open class dashboard",
    reset: "Reset profile on this device",
    resetConfirm:
      "Reset this device's profile and progress? Saved research answers stay in the study database (parents can email us to remove them).",
    // Nav + footer
    questMap: "Quest Map",
    profileWord: "Profile",
    aboutCiviquest: "About CiviQuest",
    footerTagline:
      "· Built with 💙 to raise civic heroes · Data saved only with parent consent",
    // Level meta
    meta: {
      cleanliness: {
        title: "Clean Streets",
        subtitle: "Keep parks, classrooms, and streets shining.",
      },
      traffic: {
        title: "Road Smarts",
        subtitle: "Cross safely and respect every signal.",
      },
      public_behavior: {
        title: "Kind in Public",
        subtitle: "Queues, quiet voices, and shared spaces.",
      },
      environment: {
        title: "Water & Nature",
        subtitle: "Save every drop and every tree.",
      },
      final: {
        title: "Civic Hero Finale",
        subtitle: "The boss level — every quest, one challenge.",
      },
    },
    badgeDefs: {
      "first-splash": { title: "First Splash", hint: "Finish your first level." },
      "perfect-wave": { title: "Perfect Wave", hint: "Score 100% in any level." },
      "quick-fin": {
        title: "Quick Fin",
        hint: "Finish a level averaging under 20s a question.",
      },
      "all-rounder": { title: "All-Rounder", hint: "Finish all four quests." },
      "boss-crown": {
        title: "Crown of Civvy",
        hint: "Conquer the Civic Hero Finale.",
      },
      "streak-3": { title: "On Fire", hint: "Play on 3 different days in a row." },
      "civic-hero": { title: "Civic Hero", hint: "Collect 300 XP." },
    },
    rowPositive: [
      "Nice one — Civvy is cheering for you!",
      "You thought that through well!",
      "That choice helps your community!",
    ],
    rowGentle: [
      "Nice try! Let's think about it…",
      "Good thinking! Here's a choice many people find works better…",
      "Thanks for being honest — every answer teaches us something.",
    ],
  },
  hi: {
    about: "हमारे बारे में",
    play: "← खेलें",
    heroBadge: "छुट्टियों का होमवर्क · कक्षा 5–8 · मेड इन इंडिया 🇮🇳",
    heroTitle1: "सिविक सेंस,",
    heroTitle2: "मज़ेदार तरीके से।",
    heroText:
      "आपका छुट्टियों का होमवर्क, अब एक खेल! आपकी कक्षा के लिए बने पाँच लेवल — साफ़ सड़कें, सुरक्षित रास्ते, अच्छा व्यवहार, पानी की बचत, और एक ग्रैंड फ़िनाले — सिवी डॉल्फ़िन आपका हौसला बढ़ाती रहेगी। सारे लेवल पूरे करो, आपके टीचर आपकी क्वेस्ट को ग्रेड देंगे।",
    heroCta: "अपनी क्वेस्ट शुरू करो →",
    civvyHello: "नमस्ते, मैं सिवी हूँ 👋",
    cardPlay: "खेलो",
    cardPlayText:
      "आपकी कक्षा के लिए 5 लेवल, हर लेवल में 10 असली ज़िंदगी के मिशन, हर मिशन के लिए 60 सेकंड।",
    cardThink: "सोचो",
    cardThinkText: "कोई परीक्षा के नंबर नहीं — वही चुनो जो तुम सच में करते।",
    cardGrow: "बढ़ो",
    cardGrowText: "XP, स्ट्रीक और बैज आदतों को रोमांच बना देते हैं।",
    obTitle: "सिवी को अपने बारे में बताओ 🐬",
    obSubtitle: "इससे हम आपकी कक्षा के लिए सही सवाल चुन पाएँगे।",
    name: "नाम",
    namePh: "अपना नाम लिखो",
    age: "उम्र",
    agePh: "10 से 14",
    school: "स्कूल",
    schoolPh: "स्कूल का नाम लिखो",
    className: "कक्षा",
    selectClass: "कक्षा चुनो",
    classWord: "कक्षा",
    parentTitle: "माता-पिता या अभिभावक की अनुमति",
    parentNote:
      "हम बच्चों के जवाब सिर्फ़ नागरिक-शिक्षा शोध के लिए, माता-पिता या अभिभावक की सहमति से ही सहेजते हैं। ईमेल केवल सहमति के लिए है — न कभी साझा होगा, न विज्ञापन के लिए इस्तेमाल होगा। आप कभी भी इसे हटाने के लिए कह सकते हैं।",
    parentEmail: "माता-पिता/अभिभावक का ईमेल",
    consent:
      "मैं माता-पिता/अभिभावक हूँ और इस शोध अध्ययन के लिए अपने बच्चे के क्विज़ जवाब सहेजने की अनुमति देता/देती हूँ।",
    openMap: "क्वेस्ट मैप खोलो →",
    hi: "नमस्ते",
    mapStart: "आपकी क्वेस्ट 'साफ़ सड़कें' से शुरू होती है। तैयार?",
    mapAllDone: "सारे लेवल जमा हो गए — तुम्हारा होमवर्क टीचर के पास पहुँच गया! 👑",
    nextStop: "अगला पड़ाव:",
    levels5: "5 लेवल",
    level: "लेवल",
    bossTag: "लेवल 5 · बॉस",
    start: "शुरू करो",
    replay: "फिर खेलो",
    submitted: "जमा हो गया ✓",
    locked: "बंद है",
    battle: "मुक़ाबला!",
    mapFooter:
      "अगला लेवल खोलने के लिए पहला पूरा करो — हर लेवल में 10 मिशन, हर मिशन 60 सेकंड। चारों क्वेस्ट जीतो और बॉस से मुक़ाबला करो! 👑",
    homeworkTitle: "छुट्टियों का होमवर्क",
    homeworkNote:
      "यह ग्रेड वाला होमवर्क है — हर लेवल सिर्फ़ एक बार दिया जा सकता है, इसलिए सोच-समझकर जवाब दो! आपके टीचर हर जमा किया लेवल देखकर ग्रेड देते हैं।",
    levelsDone: "लेवल पूरे",
    startHere: "शुरू करो",
    mission: "मिशन",
    of: "में से",
    howSure: "कितना पक्का यक़ीन है?",
    sure: "मुझे पक्का यक़ीन है",
    notSure: "पक्का नहीं",
    guessed: "बस अंदाज़ा लगाया",
    check: "जाँचो ✓",
    continue: "आगे बढ़ो →",
    seeResults: "नतीजे देखो 🏁",
    timeUpQ: "⏰ इस सवाल का समय ख़त्म!",
    secondsLeft: "सेकंड बाक़ी",
    cheersCorrect: [
      "छप-छपा-छप! शानदार! 🎉",
      "तुम्हारी गली को तुम पर गर्व है!",
      "सिवी ख़ुशी से कलाबाज़ी खा रही है! 🐬",
      "यही तो सिविक-हीरो वाली सोच है!",
    ],
    cheersWrong: [
      "अच्छी कोशिश! अब ट्रिक समझो…",
      "बस थोड़ा-सा चूके! सिवी ने भी यह ग़लती करके ही सीखा था।",
      "हर जवाब हमें कुछ सिखाता है। 💙",
    ],
    crownHeadline: "तुमने ताज पहन लिया! 👑",
    champion: "सिविक चैंपियन! 🏆",
    risingStar: "उभरता सिविक सितारा 🌟",
    questComplete: "क्वेस्ट पूरी — बताने के लिए धन्यवाद! 💙",
    picksOf: "समाज-हितैषी जवाब",
    time: "समय",
    xpEarned: "XP मिले",
    newBadge: "नया बैज:",
    saved: "होमवर्क सहेज लिया! अब आपके टीचर यह लेवल देखकर ग्रेड दे सकते हैं। ✓",
    statXp: "कुल XP",
    statTime: "समय",
    statAccuracy: "सटीकता",
    yourAnswer: "आपका जवाब:",
    notAnswered: "जवाब नहीं दिया",
    betterChoice: "एक तरीक़ा जो अक्सर काम करता है:",
    backToMap: "क्वेस्ट मैप पर वापस 🗺️",
    badgeReef: "बैज रीफ़ 🏆",
    badgesEmpty: "बैज जीतना शुरू करने के लिए पहला लेवल खेलो!",
    noProfile: "अभी कोई प्रोफ़ाइल नहीं — क्वेस्ट शुरू करो और बनाओ!",
    startNow: "अभी शुरू करो →",
    xp: "XP",
    dayStreak: "दिन की स्ट्रीक",
    badgesWord: "बैज",
    levelsWord: "लेवल",
    levelBests: "लेवल के बेस्ट स्कोर",
    notPlayed: "नहीं खेला",
    editDetails: "✏️ जानकारी बदलो",
    teacherLink: "🧑‍🏫 शिक्षक हैं? क्लास डैशबोर्ड खोलें",
    reset: "इस डिवाइस पर प्रोफ़ाइल रीसेट करो",
    resetConfirm:
      "इस डिवाइस की प्रोफ़ाइल और प्रगति रीसेट करें? शोध के लिए सहेजे गए जवाब डेटाबेस में रहेंगे (माता-पिता ईमेल करके हटवा सकते हैं)।",
    questMap: "क्वेस्ट मैप",
    profileWord: "प्रोफ़ाइल",
    aboutCiviquest: "CiviQuest के बारे में",
    footerTagline:
      "· सिविक हीरो बनाने के लिए 💙 से बनाया गया · डेटा सिर्फ़ माता-पिता की सहमति से सहेजा जाता है",
    meta: {
      cleanliness: {
        title: "साफ़ सड़कें",
        subtitle: "पार्क, क्लासरूम और सड़कें चमकती रखो।",
      },
      traffic: {
        title: "सड़क की समझ",
        subtitle: "सुरक्षित पार करो, हर सिग्नल का सम्मान करो।",
      },
      public_behavior: {
        title: "सबके साथ अच्छाई",
        subtitle: "क़तारें, धीमी आवाज़ें और साझा जगहें।",
      },
      environment: {
        title: "पानी और प्रकृति",
        subtitle: "हर बूँद और हर पेड़ बचाओ।",
      },
      final: {
        title: "सिविक हीरो फ़िनाले",
        subtitle: "बॉस लेवल — हर क्वेस्ट, एक चुनौती।",
      },
    },
    badgeDefs: {
      "first-splash": { title: "पहली छलाँग", hint: "अपना पहला लेवल पूरा करो।" },
      "perfect-wave": { title: "परफ़ेक्ट लहर", hint: "किसी लेवल में 100% स्कोर करो।" },
      "quick-fin": {
        title: "तेज़ पंख",
        hint: "हर सवाल औसतन 20 सेकंड से कम में — पूरा लेवल।",
      },
      "all-rounder": { title: "ऑल-राउंडर", hint: "चारों क्वेस्ट पूरी करो।" },
      "boss-crown": { title: "सिवी का ताज", hint: "सिविक हीरो फ़िनाले जीतो।" },
      "streak-3": { title: "स्ट्रीक मास्टर", hint: "लगातार 3 अलग दिनों में खेलो।" },
      "civic-hero": { title: "सिविक हीरो", hint: "300 XP इकट्ठा करो।" },
    },
    rowPositive: [
      "वाह — सिवी तुम्हारे लिए ताली बजा रही है!",
      "तुमने अच्छे से सोचा!",
      "यह चुनाव तुम्हारे समाज की मदद करता है!",
    ],
    rowGentle: [
      "अच्छी कोशिश! चलो इस पर सोचें…",
      "अच्छी सोच! एक तरीक़ा जो अक्सर बेहतर काम करता है…",
      "सच बताने के लिए धन्यवाद — हर जवाब हमें कुछ सिखाता है।",
    ],
  },
} as const;

export type UIStrings = (typeof UI)["en"];

export function ui(lang: Lang): UIStrings {
  return UI[lang] as UIStrings;
}
