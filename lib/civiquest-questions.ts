export type CivicCategory = "cleanliness" | "traffic" | "public_behavior";

export type CiviQuestion = {
  id: number;
  question: string;
  options: string[];
  correct: number;
  feedback: string;
  category: CivicCategory;
};

export const QUESTIONS: CiviQuestion[] = [
  {
    id: 1,
    category: "cleanliness",
    question:
      "Imagine you finish a snack at a busy park in Mumbai. The dustbin is a short walk away, but your friends are calling you to play. What would you most likely do?",
    options: [
      "Drop the wrapper near the bench and run to play",
      "Carry the wrapper with me and drop it in the bin on the way",
      "Hide the wrapper under a stone so nobody sees it",
      "Hand it to a younger sibling to deal with",
    ],
    correct: 1,
    feedback:
      "Carrying trash until you find a bin keeps parks nicer for everyone.",
  },
  {
    id: 2,
    category: "traffic",
    question:
      "You are at a signal crossing with your cousin. It is red, but a few people start walking. Your cousin says, “Come on, everyone is going.” What do you do?",
    options: [
      "Wait on the footpath until it turns green",
      "Cross quickly in the middle of the group",
      "Run across before cars speed up",
      "Follow your cousin without thinking much",
    ],
    correct: 0,
    feedback: "Waiting for green is safer even when others hurry.",
  },
  {
    id: 3,
    category: "cleanliness",
    question:
      "On the way home from school you notice plastic wrappers near a drain after rain. Nobody is watching. What is closest to what you would do?",
    options: [
      "Walk past — it is not my mess",
      "Tell a friend we could pick a few on the way if we have time",
      "Kick them into the drain so they float away",
      "Take a photo for fun and move on",
    ],
    correct: 1,
    feedback: "Even small clean-ups can stop drains from clogging.",
  },
  {
    id: 4,
    category: "public_behavior",
    question:
      "You see someone spit on the footpath near a bus stop. How would you react in real life?",
    options: [
      "Feel uneasy but stay quiet",
      "Politely say spitting spreads germs and suggest moving aside",
      "Laugh and make a joke about it",
      "Do the same so I do not stand out",
    ],
    correct: 1,
    feedback: "A calm reminder can help without starting a fight.",
  },
  {
    id: 5,
    category: "cleanliness",
    question:
      "In your school washroom you notice a tap still dripping after everyone leaves for assembly. What would you do?",
    options: [
      "Close the tap if I can reach it",
      "Ignore it — staff will fix it",
      "Turn it tighter until it squeaks",
      "Splash water for fun before going",
    ],
    correct: 0,
    feedback: "Closing a dripping tap saves water little by little.",
  },
  {
    id: 6,
    category: "public_behavior",
    question:
      "At the ice-cream shop, a new kid accidentally cuts in front of you. People behind you sigh. What feels fair to you?",
    options: [
      "Tell them loudly to go to the back",
      "Tap them gently and point to where the line starts",
      "Let it go because I do not like speaking up",
      "Step in front of them to take my place back",
    ],
    correct: 1,
    feedback: "A quiet pointer to the line is usually enough.",
  },
  {
    id: 7,
    category: "public_behavior",
    question:
      "You are practising dance steps at home at 10 p.m. and the beat is loud. Your neighbour has school early. What would you choose?",
    options: [
      "Lower the volume or use headphones",
      "Keep it loud only until the song ends",
      "Open the window so sound goes out",
      "Ignore it — it is my house",
    ],
    correct: 0,
    feedback: "Headphones or lower volume show care for neighbours.",
  },
  {
    id: 8,
    category: "traffic",
    question:
      "An older person is slowly crossing a small road with heavy bags while a scooter is approaching fast. You are nearby. What matches you best?",
    options: [
      "Offer to carry one bag and walk with them if safe",
      "Shout “hurry up” from the side",
      "Film it for social media",
      "Keep walking — I might be late",
    ],
    correct: 0,
    feedback: "Small help at crossings can prevent scary moments.",
  },
  {
    id: 9,
    category: "cleanliness",
    question:
      "After art class, coloured paper scraps are under your desk. The bell rang and the room is noisy. What would you most likely do?",
    options: [
      "Sweep scraps into the dustbin or tell the monitor",
      "Kick them under someone else’s desk",
      "Leave them — the sweeper comes daily",
      "Collect them to throw out the window for fun",
    ],
    correct: 0,
    feedback: "Cleaning your area keeps the room safer and tidier.",
  },
  {
    id: 10,
    category: "public_behavior",
    question:
      "A classmate starts doodling on the classroom wall with marker “just for fun.” They ask you to try a line. What would you do?",
    options: [
      "Say no and suggest paper or the board instead",
      "Draw a tiny line so I do not look boring",
      "Ignore it completely",
      "Take a photo and walk away",
    ],
    correct: 0,
    feedback: "School walls are shared — paper is a better canvas.",
  },
];
