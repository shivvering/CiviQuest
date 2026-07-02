export type CivicCategory =
  | "cleanliness"
  | "traffic"
  | "public_behavior"
  | "environment";

export type GradeBand = "5-6" | "7-8";

export type CiviQuestion = {
  id: number;
  question: string;
  options: string[];
  correct: number;
  feedback: string;
  category: CivicCategory;
  /** School classes this question is shown to. */
  grades: number[];
};

export const CATEGORY_META: Record<
  CivicCategory,
  { title: string; subtitle: string; emoji: string; color: string }
> = {
  cleanliness: {
    title: "Clean Streets",
    subtitle: "Keep parks, classrooms, and streets shining.",
    emoji: "🧼",
    color: "#2f9bd7",
  },
  traffic: {
    title: "Road Smarts",
    subtitle: "Cross safely and respect every signal.",
    emoji: "🚦",
    color: "#2574d9",
  },
  public_behavior: {
    title: "Kind in Public",
    subtitle: "Queues, quiet voices, and shared spaces.",
    emoji: "🤝",
    color: "#7c5cd9",
  },
  environment: {
    title: "Water & Nature",
    subtitle: "Save every drop and every tree.",
    emoji: "💧",
    color: "#1ba098",
  },
};

export const CATEGORY_ORDER: CivicCategory[] = [
  "cleanliness",
  "traffic",
  "public_behavior",
  "environment",
];

export function gradeBandForClass(className: string): GradeBand {
  return className === "7" || className === "8" ? "7-8" : "5-6";
}

export function questionsForLevel(
  category: CivicCategory,
  className: string,
): CiviQuestion[] {
  const grade = Number.parseInt(className, 10);
  const target = Number.isNaN(grade) ? 6 : Math.min(8, Math.max(5, grade));
  return QUESTIONS.filter(
    (q) => q.category === category && q.grades.includes(target),
  );
}

const ALL = [5, 6, 7, 8];
const JUNIOR = [5, 6];
const SENIOR = [7, 8];

export const QUESTIONS: CiviQuestion[] = [
  // ─── Cleanliness (🧼) ────────────────────────────────────────────
  {
    id: 101,
    category: "cleanliness",
    grades: ALL,
    question:
      "You finish a packet of chips at a busy park in Mumbai. The dustbin is a short walk away, but your friends are calling you to play. What would you most likely do?",
    options: [
      "Drop the wrapper near the bench and run to play",
      "Carry the wrapper and drop it in the bin on the way",
      "Hide the wrapper under a stone so nobody sees it",
      "Hand it to a younger kid to deal with",
    ],
    correct: 1,
    feedback:
      "Carrying trash until you find a bin keeps parks nicer for everyone.",
  },
  {
    id: 102,
    category: "cleanliness",
    grades: ALL,
    question:
      "On the way home you notice plastic wrappers piling near a drain after rain. Nobody is watching. What is closest to what you would do?",
    options: [
      "Walk past — it is not my mess",
      "Pick a few up if it is safe, or tell an adult about the drain",
      "Kick them into the drain so they float away",
      "Take a photo for fun and move on",
    ],
    correct: 1,
    feedback: "Blocked drains cause flooding — small clean-ups really help.",
  },
  {
    id: 103,
    category: "cleanliness",
    grades: ALL,
    question:
      "After art class, coloured paper scraps are lying under your desk. The bell rang and everyone is rushing out. What would you most likely do?",
    options: [
      "Sweep the scraps into the dustbin before leaving",
      "Kick them under someone else's desk",
      "Leave them — the sweeper comes daily",
      "Throw them out of the window",
    ],
    correct: 0,
    feedback: "Cleaning your own area keeps the classroom safe and tidy.",
  },
  {
    id: 104,
    category: "cleanliness",
    grades: ALL,
    question:
      "In the train with your family, your little brother finishes a juice box and looks around confused. What do you tell him?",
    options: [
      "Push it under the seat, everyone does it",
      "Throw it out of the window quickly",
      "Keep it in our bag until we find a dustbin",
      "Leave it on the seat for the cleaners",
    ],
    correct: 2,
    feedback:
      "Keeping trash with you until you find a bin is a superpower habit.",
  },
  {
    id: 105,
    category: "cleanliness",
    grades: ALL,
    question:
      "Your society is doing a Sunday cleanliness drive and your friends say it is boring. What sounds most like you?",
    options: [
      "Skip it and play video games instead",
      "Join for a little while and bring one friend along",
      "Stand around and watch others work",
      "Say you will come but never show up",
    ],
    correct: 1,
    feedback:
      "Even one hour of helping — and one friend brought along — doubles the impact.",
  },
  {
    id: 106,
    category: "cleanliness",
    grades: ALL,
    question:
      "You see a classmate spit paan-style out of the school bus window like a cricketer they admire. What do you think?",
    options: [
      "It looks cool, maybe I should try",
      "Spitting spreads germs and dirties streets — not a habit to copy",
      "It is fine because famous people do it",
      "It is okay as long as teachers do not see",
    ],
    correct: 1,
    feedback:
      "Habits are worth copying only when they make shared spaces better.",
  },
  {
    id: 107,
    category: "cleanliness",
    grades: JUNIOR,
    question:
      "You finish a banana in the playground. Which is the BEST place for the peel?",
    options: [
      "On the ground — it is natural, it will disappear",
      "In the green (wet waste) dustbin",
      "In the blue (dry waste) dustbin",
      "Behind a tree where no one walks",
    ],
    correct: 1,
    feedback:
      "Peels are wet waste — green bin! On the ground they make people slip.",
  },
  {
    id: 108,
    category: "cleanliness",
    grades: JUNIOR,
    question:
      "Your water bottle leaks and makes a puddle in the school corridor. What should you do first?",
    options: [
      "Walk away before anyone sees",
      "Tell a teacher or helper so nobody slips",
      "Put a notebook over the puddle",
      "Blame the kid who walked past",
    ],
    correct: 1,
    feedback: "Telling an adult fast keeps everyone from slipping. Honest and smart!",
  },
  {
    id: 109,
    category: "cleanliness",
    grades: JUNIOR,
    question:
      "At a birthday party in the park, balloons burst and pieces fly everywhere. The party is ending. What do you do?",
    options: [
      "Leave them — birds will not mind",
      "Help collect the pieces; balloon bits can hurt animals",
      "Bury them in the sand pit",
      "Collect only the big pretty pieces",
    ],
    correct: 1,
    feedback:
      "Birds and stray animals can swallow balloon pieces — collecting them protects them.",
  },
  {
    id: 110,
    category: "cleanliness",
    grades: JUNIOR,
    question:
      "You sneeze in class and have no handkerchief. What is the most hygienic thing to do?",
    options: [
      "Sneeze into your hands and continue writing",
      "Sneeze into your elbow, then wash hands when possible",
      "Sneeze towards the window",
      "Hold the sneeze in completely",
    ],
    correct: 1,
    feedback: "The elbow trick stops germs from spreading to everything you touch.",
  },
  {
    id: 111,
    category: "cleanliness",
    grades: SENIOR,
    question:
      "Your family segregates waste, but you notice the society's collection mixes both bins into one truck. What is the most useful response?",
    options: [
      "Stop segregating — clearly it is pointless",
      "Raise it politely in the society group or with the secretary",
      "Argue with the collection staff loudly",
      "Post an angry rant online without checking facts",
    ],
    correct: 1,
    feedback:
      "Asking the right people fixes systems; giving up or shouting fixes nothing.",
  },
  {
    id: 112,
    category: "cleanliness",
    grades: SENIOR,
    question:
      "A food stall you love hands out plastic bags even for one samosa. You are a regular customer. What could you actually do?",
    options: [
      "Nothing — one bag hardly matters",
      "Carry a small cloth bag and politely refuse the plastic one",
      "Stop eating samosas forever",
      "Lecture the stall owner in front of other customers",
    ],
    correct: 1,
    feedback:
      "Refusing politely, as a regular, quietly shows the stall that customers care.",
  },
  {
    id: 113,
    category: "cleanliness",
    grades: SENIOR,
    question:
      "During Ganesh Chaturthi, your colony debates immersing idols in the lake versus an artificial tank. What is the strongest civic argument?",
    options: [
      "Lake immersion is fine because it is tradition",
      "Artificial tanks protect the lake's fish and water for everyone, all year",
      "Neither matters because lakes clean themselves",
      "Whatever the loudest neighbour says",
    ],
    correct: 1,
    feedback:
      "Celebrations and clean lakes can go together — that is what eco-immersion is for.",
  },
  {
    id: 114,
    category: "cleanliness",
    grades: SENIOR,
    question:
      "You are on the school Swachh committee. Which plan would actually reduce litter the most?",
    options: [
      "One big cleaning day with photos for the notice board",
      "More dustbins where litter collects most, checked and emptied on a schedule",
      "A strict fine for younger students only",
      "Posters that say 'Do Not Litter' in every corridor",
    ],
    correct: 1,
    feedback:
      "Litter drops where bins are missing or overflowing — fix the system, not just the symptoms.",
  },

  // ─── Traffic (🚦) ────────────────────────────────────────────────
  {
    id: 201,
    category: "traffic",
    grades: ALL,
    question:
      "You are at a signal crossing with your cousin. It is red for walkers, but a few people start crossing anyway. Your cousin says, \"Come on, everyone is going.\" What do you do?",
    options: [
      "Wait on the footpath until it turns green",
      "Cross quickly in the middle of the group",
      "Run across before the cars speed up",
      "Follow your cousin without thinking",
    ],
    correct: 0,
    feedback: "Waiting for green is safer even when others hurry.",
  },
  {
    id: 202,
    category: "traffic",
    grades: ALL,
    question:
      "An elderly person with heavy bags is crossing a small road slowly while a scooter approaches fast. You are nearby. What matches you best?",
    options: [
      "Offer to carry one bag and walk with them if it is safe",
      "Shout \"hurry up\" from the side",
      "Film it for social media",
      "Keep walking — you might get late",
    ],
    correct: 0,
    feedback: "Small help at crossings can prevent scary moments.",
  },
  {
    id: 203,
    category: "traffic",
    grades: ALL,
    question:
      "Your school van driver starts checking his phone while driving. What is the safest thing you can do?",
    options: [
      "Stay quiet — he is an adult",
      "Politely ask him to check it after we stop, and tell your parents later",
      "Grab the phone from his hand",
      "Shout loudly at him immediately",
    ],
    correct: 1,
    feedback:
      "A calm request plus telling your parents keeps everyone in the van safer.",
  },
  {
    id: 204,
    category: "traffic",
    grades: ALL,
    question:
      "You hear an ambulance siren behind you while walking on the road's edge with friends spread out. What should your group do?",
    options: [
      "Keep walking the same way — ambulances manage",
      "Move to one side in a line so the road stays clear",
      "Run across the road to watch it pass",
      "Wave at the ambulance driver",
    ],
    correct: 1,
    feedback:
      "Clearing space for ambulances can literally save a life. Every second counts.",
  },
  {
    id: 205,
    category: "traffic",
    grades: ALL,
    question:
      "Your auto-rickshaw driver offers to squeeze one more friend in, making it very crowded, so you all save money. What do you think?",
    options: [
      "Great deal — more friends, less money",
      "An overloaded auto is unsafe; better to wait for another one",
      "It is fine if the ride is short",
      "It is fine if you hold on tightly",
    ],
    correct: 1,
    feedback:
      "Overloaded vehicles tip and brake badly. No discount is worth a broken arm.",
  },
  {
    id: 206,
    category: "traffic",
    grades: ALL,
    question:
      "There is a footpath, but it is blocked by parked bikes, so people walk on the road. What is the best mix of actions?",
    options: [
      "Walk on the road close to traffic — no choice",
      "Walk carefully on the road's edge facing traffic, and mention the blocked footpath to an adult",
      "Squeeze between the bikes even if you might knock one over",
      "Turn back and skip going out",
    ],
    correct: 1,
    feedback:
      "Facing traffic keeps you visible, and reporting blockages helps fix the real problem.",
  },
  {
    id: 207,
    category: "traffic",
    grades: JUNIOR,
    question: "Before crossing any road, which is the correct order?",
    options: [
      "Run first, look later",
      "Look right, look left, look right again, then cross when clear",
      "Close your eyes and walk confidently",
      "Follow whoever crosses first",
    ],
    correct: 1,
    feedback: "Right-left-right — the classic check that never gets old.",
  },
  {
    id: 208,
    category: "traffic",
    grades: JUNIOR,
    question:
      "Your ball rolls onto the road while playing. What is the right thing to do?",
    options: [
      "Chase it immediately before a car hits it",
      "Stop at the edge, check the road fully, and only go when it is clear — or ask an adult",
      "Send the smallest kid to fetch it",
      "Throw stones to push the ball back",
    ],
    correct: 1,
    feedback:
      "Balls can be replaced. Stopping at the edge first is what smart players do.",
  },
  {
    id: 209,
    category: "traffic",
    grades: JUNIOR,
    question: "What is the zebra crossing actually for?",
    options: [
      "Decorating the road with stripes",
      "A safe place where walkers should cross and vehicles should slow down",
      "A parking spot for two-wheelers",
      "A racing start line",
    ],
    correct: 1,
    feedback:
      "Zebra crossings are the walker's home ground — use them every time.",
  },
  {
    id: 210,
    category: "traffic",
    grades: JUNIOR,
    question:
      "Your friend dares you to cycle with no hands on a busy street. What do you say?",
    options: [
      "Accept — dares must be done",
      "Say no; you can show off tricks in the park, not in traffic",
      "Do it only for ten seconds",
      "Ask him to do it first",
    ],
    correct: 1,
    feedback:
      "Real confidence is choosing where tricks are safe. Traffic is not a stage.",
  },
  {
    id: 211,
    category: "traffic",
    grades: SENIOR,
    question:
      "Your older cousin, who just got a scooter licence, offers you a ride but has only one helmet — for himself. What do you do?",
    options: [
      "Hop on — it is a short ride",
      "Refuse politely; a pillion without a helmet is not safe or legal",
      "Sit sideways so it does not count",
      "Ask him to drive slowly instead",
    ],
    correct: 1,
    feedback:
      "Most head injuries happen close to home on 'short rides'. Helmet or no ride.",
  },
  {
    id: 212,
    category: "traffic",
    grades: SENIOR,
    question:
      "At a four-way stop with no working signal, traffic is jammed because nobody gives way. What actually unjams such a knot?",
    options: [
      "Everyone honking louder",
      "Each side letting a few vehicles pass in turn",
      "Two-wheelers squeezing through every gap",
      "Pushing to the front fastest",
    ],
    correct: 1,
    feedback:
      "Jams are cooperation puzzles — taking turns moves everyone faster than pushing.",
  },
  {
    id: 213,
    category: "traffic",
    grades: SENIOR,
    question:
      "A classmate proudly says his brother paid a bribe to skip the driving test. What is the sharpest problem with this?",
    options: [
      "He spent money unnecessarily",
      "An untested driver is now on roads everyone shares — the risk lands on all of us",
      "He might get caught someday",
      "Nothing — everyone does it",
    ],
    correct: 1,
    feedback:
      "Skipped tests put untrained drivers next to your family. That is the real cost of that bribe.",
  },
  {
    id: 214,
    category: "traffic",
    grades: SENIOR,
    question:
      "Your school gate area jams every day at closing time with parents' cars. The principal asks students for ideas. Which suggestion helps most?",
    options: [
      "Ban all cars from the area",
      "Staggered closing times and a no-stopping zone right at the gate",
      "More security guards shouting instructions",
      "Students should just leave faster",
    ],
    correct: 1,
    feedback:
      "Spreading demand over time and space is how real traffic planners think.",
  },

  // ─── Public behaviour (🤝) ───────────────────────────────────────
  {
    id: 301,
    category: "public_behavior",
    grades: ALL,
    question:
      "You see someone spit on the footpath near a bus stop. How would you react in real life?",
    options: [
      "Feel uneasy but stay quiet",
      "If it feels safe, politely mention that spitting spreads germs",
      "Laugh and make a joke about it",
      "Do the same so you do not stand out",
    ],
    correct: 1,
    feedback: "A calm word can help — and if it feels unsafe, not copying is already a win.",
  },
  {
    id: 302,
    category: "public_behavior",
    grades: ALL,
    question:
      "At the ice-cream shop, a new kid accidentally stands in front of you in the line. People behind you sigh. What feels fair?",
    options: [
      "Tell them loudly to go to the back",
      "Tap them gently and point to where the line starts",
      "Let it go because you do not like speaking up",
      "Step in front of them to take your place back",
    ],
    correct: 1,
    feedback: "A quiet pointer to the line is usually enough.",
  },
  {
    id: 303,
    category: "public_behavior",
    grades: ALL,
    question:
      "You are practising dance steps at home at 10 p.m. with the music loud. Your neighbour has school early. What would you choose?",
    options: [
      "Lower the volume or use headphones",
      "Keep it loud only until the song ends",
      "Open the window so the sound goes out",
      "Ignore it — it is your house",
    ],
    correct: 0,
    feedback: "Headphones or lower volume show care for neighbours.",
  },
  {
    id: 304,
    category: "public_behavior",
    grades: ALL,
    question:
      "A classmate starts doodling on the classroom wall with a marker \"just for fun\" and offers you the pen. What do you do?",
    options: [
      "Say no and suggest paper or the board instead",
      "Draw a tiny line so you do not look boring",
      "Ignore it completely",
      "Take a photo and walk away",
    ],
    correct: 0,
    feedback: "School walls are shared — paper is a better canvas.",
  },
  {
    id: 305,
    category: "public_behavior",
    grades: ALL,
    question:
      "In a crowded bus, you are seated and an elderly uncle climbs in at the next stop. What would you most likely do?",
    options: [
      "Look out of the window and pretend not to see",
      "Offer your seat with a smile",
      "Wait to see if someone else offers first",
      "Offer only if the conductor tells you to",
    ],
    correct: 1,
    feedback:
      "Offering a seat costs you a little comfort and earns a lot of respect.",
  },
  {
    id: 306,
    category: "public_behavior",
    grades: ALL,
    question:
      "Your friends start commenting loudly on a stranger's clothes in the metro, giggling. What is the best move?",
    options: [
      "Join in — it is just jokes",
      "Change the topic or quietly say \"leave it, yaar\"",
      "Laugh but not too loudly",
      "Record it for your group chat",
    ],
    correct: 1,
    feedback:
      "Steering friends away from mocking strangers is quiet leadership.",
  },
  {
    id: 307,
    category: "public_behavior",
    grades: JUNIOR,
    question:
      "In the library, two students next to you keep whispering and giggling while you read. When you get up to leave, what do YOU do?",
    options: [
      "Slam your book shut so they learn a lesson",
      "Push your chair back quietly and leave without noise",
      "Tell everyone in class about them",
      "Whisper even louder with your own friend",
    ],
    correct: 1,
    feedback:
      "Being the quiet one in a library is a small daily kindness to every reader.",
  },
  {
    id: 308,
    category: "public_behavior",
    grades: JUNIOR,
    question:
      "You visit a temple/mosque/church/gurudwara with your class where footwear is removed. Your new shoes are precious. What do you do?",
    options: [
      "Sneak in with the shoes hidden in your bag",
      "Follow the custom like everyone else — remove them at the stand",
      "Refuse to go inside at all",
      "Argue that rules should change",
    ],
    correct: 1,
    feedback:
      "Respecting a place's customs — any place, any faith — is civic sense too.",
  },
  {
    id: 309,
    category: "public_behavior",
    grades: JUNIOR,
    question:
      "During assembly, the student speaking on stage forgets her lines and pauses awkwardly. Some kids giggle. What do you do?",
    options: [
      "Giggle along — it is funny",
      "Stay quiet and give her an encouraging look; clap when she finishes",
      "Shout out the lines to help",
      "Look away in embarrassment",
    ],
    correct: 1,
    feedback:
      "Everyone forgets lines someday — maybe you next time. Kindness on stage comes back around.",
  },
  {
    id: 310,
    category: "public_behavior",
    grades: JUNIOR,
    question:
      "You find a pencil box with money in it on the school ground. What is the right thing to do?",
    options: [
      "Keep it — finders keepers",
      "Give it to the class teacher or school office so the owner can claim it",
      "Take the money and leave the box",
      "Ask friends if you should keep it",
    ],
    correct: 1,
    feedback:
      "Imagine losing yours — the office is how lost things find their way home.",
  },
  {
    id: 311,
    category: "public_behavior",
    grades: SENIOR,
    question:
      "A viral video shows a person from your city misbehaving, and your group chat is flooding with hate and their home address. What is the responsible move?",
    options: [
      "Forward it — everyone is doing it",
      "Do not share the address or pile on; report doxxing to the platform",
      "Add a funny caption before forwarding",
      "Save it in case it is useful later",
    ],
    correct: 1,
    feedback:
      "Sharing someone's address can lead to real-world harm. Online mobs are a civic problem too.",
  },
  {
    id: 312,
    category: "public_behavior",
    grades: SENIOR,
    question:
      "At a railway station, a family that speaks a different language looks lost and people are ignoring them. You know a little of their language from school. What do you do?",
    options: [
      "Avoid them — talking to strangers is always wrong",
      "In the open, public area, ask if they need help finding their platform",
      "Point vaguely in some direction",
      "Watch and see what happens",
    ],
    correct: 1,
    feedback:
      "Helping visitors in public spaces is hospitality — India's oldest civic tradition.",
  },
  {
    id: 313,
    category: "public_behavior",
    grades: SENIOR,
    question:
      "Your society WhatsApp group turns a small parking dispute into personal insults between two neighbours. Your parents are in the group. What is a genuinely useful thought?",
    options: [
      "Disputes are entertainment — grab popcorn",
      "Suggest to your parents that facts and a society meeting solve this, not public insults",
      "Take a side based on who you like",
      "Post memes about both neighbours",
    ],
    correct: 1,
    feedback:
      "Moving conflicts from insult-trading to fair process is how communities stay livable.",
  },
  {
    id: 314,
    category: "public_behavior",
    grades: SENIOR,
    question:
      "You notice a younger student being teased daily at the bus stop by two students from another school. What is the most effective FIRST step?",
    options: [
      "Fight the teasers yourself",
      "Tell a teacher or parent exactly what you saw, with days and times",
      "Advise the younger kid to take a different bus",
      "Ignore it — not your school, not your problem",
    ],
    correct: 1,
    feedback:
      "Specific reports to adults stop bullying faster than fists or avoidance.",
  },

  // ─── Environment & water (💧) ────────────────────────────────────
  {
    id: 401,
    category: "environment",
    grades: ALL,
    question:
      "In your school washroom, a tap is left running and nobody is around. What would you do?",
    options: [
      "Close the tap",
      "Ignore it — staff will handle it",
      "Splash some water for fun first",
      "Watch it run while washing your hands",
    ],
    correct: 0,
    feedback: "Closing a running tap saves litres every minute. Instant hero move.",
  },
  {
    id: 402,
    category: "environment",
    grades: ALL,
    question:
      "Your building washes cars with running hose pipes every morning while the city faces a water shortage. What is a fair response?",
    options: [
      "It is the watchman's job, not your business",
      "Suggest bucket-washing to your parents for your own car first",
      "Secretly turn off the building's water supply",
      "Complain about it but change nothing",
    ],
    correct: 1,
    feedback:
      "A hose can waste 100+ litres per wash; buckets cut that hugely. Change starts at home.",
  },
  {
    id: 403,
    category: "environment",
    grades: ALL,
    question:
      "During Diwali, your friends want to burst a big box of loud crackers late at night near a hospital lane. What do you suggest?",
    options: [
      "Go along — it is a festival",
      "Celebrate with lights and a few quieter crackers, earlier, away from the hospital",
      "Burst them quickly before anyone complains",
      "Skip the festival completely",
    ],
    correct: 1,
    feedback:
      "Festivals shine brightest when patients, elders, and pets are not paying the price.",
  },
  {
    id: 404,
    category: "environment",
    grades: ALL,
    question:
      "A stray dog in your lane looks weak and thirsty in the summer heat. What is a kind and safe thing to do?",
    options: [
      "Keep a bowl of water outside your gate",
      "Try to hug and carry it home",
      "Chase it away so it finds water elsewhere",
      "Feed it your chips and chocolate",
    ],
    correct: 0,
    feedback:
      "A water bowl outside the gate is safe for you and life-saving for animals in summer.",
  },
  {
    id: 405,
    category: "environment",
    grades: ALL,
    question:
      "While brushing your teeth, what does a water-smart person do?",
    options: [
      "Keep the tap running — it feels normal",
      "Close the tap while brushing, open it to rinse",
      "Brush faster with the tap running",
      "Use bottled water instead",
    ],
    correct: 1,
    feedback:
      "A running tap wastes about 6 litres a minute. Your wrist is the superpower.",
  },
  {
    id: 406,
    category: "environment",
    grades: ALL,
    question:
      "Your school plans to cut a healthy old neem tree to widen the cycle stand. Students are asked for opinions. What do you say?",
    options: [
      "Cut it — cycles matter more",
      "Ask if the stand can be re-designed around the tree first",
      "Say nothing — adults decide anyway",
      "Suggest cutting it during holidays so nobody sees",
    ],
    correct: 1,
    feedback:
      "Old trees cool the whole ground and clean the air. Design around, not through.",
  },
  {
    id: 407,
    category: "environment",
    grades: JUNIOR,
    question:
      "Which bin does a dead leaf and vegetable peel mix belong to?",
    options: [
      "Blue bin (dry waste)",
      "Green bin (wet waste)",
      "Any bin — it is all garbage",
      "No bin — throw it on the road",
    ],
    correct: 1,
    feedback:
      "Wet waste in the green bin can become compost — garbage turning into garden food!",
  },
  {
    id: 408,
    category: "environment",
    grades: JUNIOR,
    question:
      "You get a small plant on Environment Day. What happens if you water it a little every day and keep it in sunlight?",
    options: [
      "Nothing much — school plants never survive",
      "It grows, and one day gives shade, oxygen, or even fruit",
      "It grows only if the teacher checks",
      "Plants only grow in villages",
    ],
    correct: 1,
    feedback:
      "Every big tree in India was once a small plant someone did not give up on.",
  },
  {
    id: 409,
    category: "environment",
    grades: JUNIOR,
    question:
      "Your mother sends you to the shop. Which is the most planet-friendly way to carry things back?",
    options: [
      "Ask for a new plastic bag each time",
      "Carry a cloth bag from home",
      "Ask for two plastic bags so nothing tears",
      "Carry everything loose and drop half",
    ],
    correct: 1,
    feedback:
      "One cloth bag used 100 times beats 100 plastic bags every time.",
  },
  {
    id: 410,
    category: "environment",
    grades: JUNIOR,
    question:
      "Lights and fans are ON in your empty classroom during games period. What do you do on your way out?",
    options: [
      "Leave them — electricity is the school's problem",
      "Switch them off; last one out flips the switch",
      "Switch off only the lights, fans are fine",
      "Tell someone else to do it",
    ],
    correct: 1,
    feedback:
      "'Last one out switches off' — a tiny rule that saves schools thousands of rupees.",
  },
  {
    id: 411,
    category: "environment",
    grades: SENIOR,
    question:
      "Your area's lake is frothing with white foam and smells bad. Which action creates the most real-world pressure to fix it?",
    options: [
      "Share a sad emoji on the news article",
      "A written complaint to the municipal ward office, signed by many residents",
      "Avoid that road so you do not smell it",
      "Throw the froth back with a stick",
    ],
    correct: 1,
    feedback:
      "Collective, written, on-the-record complaints are what officials must respond to.",
  },
  {
    id: 412,
    category: "environment",
    grades: SENIOR,
    question:
      "Delhi-style smog hits your city and your grandfather coughs more every morning. Which family change makes a real difference?",
    options: [
      "Keep windows open so smoke escapes",
      "Carpool or bus for the daily school run instead of two separate cars",
      "Burn the fallen leaves in the garden faster",
      "Buy more room fresheners",
    ],
    correct: 1,
    feedback:
      "Fewer vehicle trips means less exhaust — the maths of clean air starts with your own commute.",
  },
  {
    id: 413,
    category: "environment",
    grades: SENIOR,
    question:
      "Your society is choosing between a borewell and rainwater harvesting for its water problem. The borewell is cheaper this year. What is the long-term civic thinking?",
    options: [
      "Take the borewell — cheapest wins",
      "Harvesting refills the ground; borewells alone keep emptying it for everyone",
      "Buy water tankers forever",
      "Water problems always solve themselves",
    ],
    correct: 1,
    feedback:
      "Groundwater is a shared bank account — harvesting deposits, borewells only withdraw.",
  },
  {
    id: 414,
    category: "environment",
    grades: SENIOR,
    question:
      "An e-waste bin arrives in your school for old phones and batteries. Your friend says, \"Just throw batteries in the normal bin, who cares.\" What do you know that he does not?",
    options: [
      "He is right — batteries are tiny",
      "Battery chemicals leak into soil and water; e-waste bins send them for safe recycling",
      "E-waste bins are just decoration",
      "Batteries dissolve harmlessly in rain",
    ],
    correct: 1,
    feedback:
      "One battery can pollute thousands of litres of groundwater. Tiny thing, huge footprint.",
  },
];
