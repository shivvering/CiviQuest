"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type QuizStep = "start" | "form" | "quiz" | "result";

type UserInfo = {
  name: string;
  age: string;
  occupation: string;
};

type Question = {
  id: number;
  question: string;
  options: string[];
  correct: number;
  feedback: string;
};

const TOTAL_TIME_SECONDS = 60;

const QUESTIONS: Question[] = [
  {
    id: 1,
    question:
      "You eat chips in a park. There is no dustbin nearby. What will you do?",
    options: [
      "Throw it on the ground",
      "Hide it somewhere",
      "Keep it with you and throw later",
      "Leave it there",
    ],
    correct: 2,
    feedback:
      "Good! Always keep your waste with you and throw it in a dustbin later.",
  },
  {
    id: 2,
    question: "The traffic signal is red. What should you do?",
    options: [
      "Cross the road quickly",
      "Wait for green signal",
      "Run across",
      "Follow others",
    ],
    correct: 1,
    feedback: "Correct! Always wait for the green signal to stay safe.",
  },
  {
    id: 3,
    question: "You see garbage on the road. What should you do?",
    options: ["Ignore it", "Kick it", "Pick it or tell someone", "Walk away"],
    correct: 2,
    feedback: "Nice! Keeping surroundings clean is everyone’s duty.",
  },
  {
    id: 4,
    question: "Someone is spitting on the road. What should you do?",
    options: [
      "Ignore",
      "Do the same",
      "Tell them politely not to do it",
      "Laugh",
    ],
    correct: 2,
    feedback: "Good thinking! Spitting spreads germs and should be avoided.",
  },
  {
    id: 5,
    question: "You see a tap left open. What will you do?",
    options: ["Ignore", "Close it", "Tell someone later", "Walk away"],
    correct: 1,
    feedback: "Correct! Saving water is very important.",
  },
  {
    id: 6,
    question: "Someone cuts the queue. What should you do?",
    options: [
      "Push them",
      "Ignore",
      "Ask them politely to stand in line",
      "Leave the line",
    ],
    correct: 2,
    feedback: "Great! Being polite helps maintain discipline.",
  },
  {
    id: 7,
    question: "You are playing loud music at night. What should you do?",
    options: [
      "Keep playing loudly",
      "Lower the volume",
      "Ignore others",
      "Increase volume",
    ],
    correct: 1,
    feedback: "Correct! Loud noise can disturb others.",
  },
  {
    id: 8,
    question: "You see an old person crossing the road. What will you do?",
    options: ["Ignore", "Watch", "Help them cross", "Walk away"],
    correct: 2,
    feedback: "Nice! Helping others is a good habit.",
  },
  {
    id: 9,
    question: "You see paper on the classroom floor. What will you do?",
    options: ["Ignore", "Kick it", "Pick it or tell teacher", "Leave it"],
    correct: 2,
    feedback: "Good job! Keep your classroom clean.",
  },
  {
    id: 10,
    question: "Someone is writing on a wall. What should you do?",
    options: ["Join them", "Ignore", "Tell them it is wrong", "Take photo"],
    correct: 2,
    feedback: "Correct! Public property should not be damaged.",
  },
];

export default function Home() {
  const [step, setStep] = useState<QuizStep>("start");
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    age: "",
    occupation: "",
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [resultStatus, setResultStatus] = useState<"Completed" | "Time Up">(
    "Completed",
  );
  const [finalScore, setFinalScore] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [recentlySelectedOption, setRecentlySelectedOption] = useState<
    string | null
  >(null);

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  useEffect(() => {
    if (step === "quiz") {
      setTimeLeft(TOTAL_TIME_SECONDS);
    }
  }, [currentQuestionIndex, step]);

  const handleFormChange = (field: keyof UserInfo, value: string) => {
    setUserInfo((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const startQuiz = () => {
    setStep("quiz");
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeLeft(TOTAL_TIME_SECONDS);
    setQuizStartTime(Date.now());
    setFinalScore(0);
    setTimeTaken(0);
    setResultStatus("Completed");
  };

  const selectAnswer = (selectedOptionIndex: number) => {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: selectedOptionIndex,
    }));
    const selectedOption = currentQuestion.options[selectedOptionIndex];
    setRecentlySelectedOption(selectedOption);
    window.setTimeout(() => {
      setRecentlySelectedOption((previous) =>
        previous === selectedOption ? null : previous,
      );
    }, 180);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((previous) => previous + 1);
      return;
    }
    finishQuiz("Completed");
  };

  const handleAnswer = (selectedOptionIndex: number) => {
    if (selectedOptionIndex >= 0) {
      selectAnswer(selectedOptionIndex);
    }
    goToNextQuestion();
  };

  const calculateScore = () => {
    let score = 0;
    for (const question of QUESTIONS) {
      if (answers[question.id] === question.correct) {
        score += 1;
      }
    }
    return score;
  };

  const finishQuiz = (status: "Completed" | "Time Up") => {
    const score = calculateScore();
    const endTime = Date.now();
    const elapsedSeconds = quizStartTime
      ? Math.round((endTime - quizStartTime) / 1000)
      : TOTAL_TIME_SECONDS - timeLeft;

    setFinalScore(score);
    setResultStatus(status);
    setTimeTaken(elapsedSeconds);
    setStep("result");

    const payload = {
      app: "CiviQuest",
      status,
      user: userInfo,
      answers,
      score,
      totalQuestions: QUESTIONS.length,
      timeTakenSeconds: elapsedSeconds,
      timeLimitSeconds: TOTAL_TIME_SECONDS,
      submittedAt: new Date().toISOString(),
    };

    console.log(JSON.stringify(payload, null, 2));
  };

  useEffect(() => {
    if (step === "quiz" && timeLeft > 0) {
      const timer = window.setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => window.clearTimeout(timer);
    }

    if (timeLeft === 0 && step === "quiz") {
      handleAnswer(-1);
    }
  }, [timeLeft, step]);

  const restartApp = () => {
    setStep("start");
    setUserInfo({
      name: "",
      age: "",
      occupation: "",
    });
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeLeft(TOTAL_TIME_SECONDS);
    setQuizStartTime(null);
    setFinalScore(0);
    setTimeTaken(0);
    setResultStatus("Completed");
  };

  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{ backgroundColor: "#F4FBFF", color: "#1E2C3B" }}
    >
      <main className="mx-auto flex min-h-[85vh] w-full max-w-2xl flex-col items-center justify-center rounded-3xl bg-white p-6 text-center leading-relaxed shadow-[0_18px_40px_rgba(6,62,95,0.14)] md:p-10">
        {step === "start" && (
          <>
            <div className="mb-4 flex w-full items-start justify-center gap-3 rounded-3xl bg-gradient-to-b from-[#EAF7FF] via-[#F2FBFF] to-[#DDF3FF] p-4 md:gap-4 md:p-5">
              <p className="mt-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-[#063E5F] shadow-[0_8px_18px_rgba(6,62,95,0.18)] md:text-base">
                Hello I&apos;m Civvy 👋
              </p>
              <Image
                src="/civvy-main.png"
                alt="Civvy dolphin"
                width={190}
                height={190}
                priority
                className="h-28 w-28 object-contain md:h-36 md:w-36"
              />
            </div>

            <Image
              src="/cq-logo.png"
              alt="CiviQuest CQ logo"
              width={112}
              height={112}
              priority
              className="mb-3 h-16 w-16 object-contain md:h-20 md:w-20"
            />
          </>
        )}

        <h1 className="mb-3 font-[var(--font-montserrat)] text-4xl font-black tracking-tight leading-[1.2] md:text-5xl">
          CiviQuest
        </h1>
        <p className="mb-8 text-base md:text-lg" style={{ color: "#063E5F" }}>
          A quick civic sense challenge.
        </p>

        {step === "start" && (
          <section className="w-full">
            <button
              type="button"
              onClick={() => setStep("form")}
              className="w-full rounded-2xl px-6 py-4 font-[var(--font-montserrat)] text-2xl font-bold text-white transition hover:scale-[1.02]"
              style={{ backgroundColor: "#4296CD" }}
            >
              Play
            </button>
          </section>
        )}

        {step === "form" && (
          <section className="w-full space-y-4 text-left">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Name</span>
              <input
                type="text"
                value={userInfo.name}
                onChange={(event) => handleFormChange("name", event.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl border px-4 py-3 text-base outline-none"
                style={{ borderColor: "#E5F6FF" }}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Age</span>
              <input
                type="number"
                min="1"
                value={userInfo.age}
                onChange={(event) => handleFormChange("age", event.target.value)}
                placeholder="Enter your age"
                className="w-full rounded-xl border px-4 py-3 text-base outline-none"
                style={{ borderColor: "#E5F6FF" }}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Occupation</span>
              <input
                type="text"
                value={userInfo.occupation}
                onChange={(event) =>
                  handleFormChange("occupation", event.target.value)
                }
                placeholder="Enter your occupation"
                className="w-full rounded-xl border px-4 py-3 text-base outline-none"
                style={{ borderColor: "#E5F6FF" }}
              />
            </label>

            <button
              type="button"
              onClick={startQuiz}
              disabled={!userInfo.name || !userInfo.age || !userInfo.occupation}
              className="mt-3 w-full rounded-2xl px-6 py-4 font-[var(--font-montserrat)] text-xl font-bold text-white transition enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: "#4296CD" }}
            >
              Start Quiz
            </button>
          </section>
        )}

        {step === "quiz" && currentQuestion && (
          <section className="w-full">
            <div className="relative w-full rounded-[28px] bg-white px-5 pb-16 pt-6 text-center shadow-[0_24px_60px_rgba(6,62,95,0.14)] md:px-10 md:pt-8">
              <div className="mb-6 flex justify-end">
                <span className="rounded-full bg-[#4296CD] px-4 py-2 text-sm font-bold text-white shadow-sm">
                  {timeLeft}s
                </span>
              </div>

              <p className="mb-3 text-sm font-semibold tracking-wide text-[#2589C9] md:text-base">
                Question {currentQuestionIndex + 1}/{QUESTIONS.length}
              </p>

              <h2 className="mb-8 text-3xl font-black leading-[1.3] text-[#063E5F] md:text-4xl">
                {currentQuestion.question}
              </h2>

              <div className="space-y-4">
              {currentQuestion.options.map((option, optionIndex) => {
                const isSelected = answers[currentQuestion.id] === optionIndex;
                const hasRecentClick = recentlySelectedOption === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectAnswer(optionIndex)}
                    className={`w-full rounded-xl border-2 px-5 py-4 text-left text-lg font-bold transition-all duration-200 ease-out md:text-xl ${
                      hasRecentClick ? "scale-[0.98]" : "scale-100"
                    } ${
                      isSelected
                        ? "border-[#4296CD] bg-[#4296CD] text-white"
                        : "border-[#E5F6FF] bg-[#E5F6FF] text-[#063E5F] hover:border-[#4296CD] hover:bg-[#4296CD] hover:text-white"
                    }`}
                    style={{
                      transformOrigin: "center",
                    }}
                  >
                    {option}
                  </button>
                );
              })}
              </div>

              <button
                type="button"
                onClick={goToNextQuestion}
                className="mt-8 w-full rounded-2xl px-6 py-4 font-[var(--font-montserrat)] text-xl font-bold text-white transition hover:scale-[1.02]"
                style={{ backgroundColor: "#4296CD" }}
              >
                {currentQuestionIndex === QUESTIONS.length - 1
                  ? "Submit Quiz"
                  : "Next"}
              </button>

              <Image
                src="/civiquest-logo.png"
                alt="Civvy mascot"
                width={76}
                height={76}
                className="absolute bottom-4 right-4 h-14 w-14 rounded-full object-cover opacity-90 md:h-[76px] md:w-[76px]"
              />
            </div>
          </section>
        )}

        {step === "result" && (
          <section
            className="w-full rounded-2xl p-6 text-left"
            style={{ backgroundColor: "#F4FBFF" }}
          >
            <h2 className="mb-2 text-center font-[var(--font-montserrat)] text-3xl font-black leading-[1.25]">
              Result
            </h2>
            <p className="mb-2 text-center text-lg font-bold">
              Status: {resultStatus}
            </p>
            <p className="mb-2 text-center text-lg font-bold">
              Score: {finalScore} / {QUESTIONS.length}
            </p>
            <p className="mb-6 text-center text-base" style={{ color: "#063E5F" }}>
              Total Time Taken to Complete: {timeTaken}s
            </p>

            <div className="max-h-60 space-y-2 overflow-auto pr-1">
              {QUESTIONS.map((question, index) => {
                const selectedIndex = answers[question.id];
                const selected =
                  typeof selectedIndex === "number"
                    ? question.options[selectedIndex]
                    : "Not answered";
                const correctAnswer = question.options[question.correct];
                const isCorrect = selectedIndex === question.correct;
                return (
                  <div
                    key={question.id}
                    className="rounded-xl border p-3"
                    style={{
                      borderColor: isCorrect ? "#cdebd1" : "#f6c8c8",
                      backgroundColor: isCorrect ? "#edf9ef" : "#fff1f1",
                    }}
                  >
                    <p className="font-semibold">
                      {index + 1}. {question.question}
                    </p>
                    <p className="text-sm">Your answer: {selected}</p>
                    {isCorrect ? (
                      <p className="mt-1 text-sm text-[#555]">{question.feedback}</p>
                    ) : (
                      <>
                        <p className="mt-1 text-sm text-[#555]">Let’s think again 🤔</p>
                        <p className="text-sm">Correct: {correctAnswer}</p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={restartApp}
              className="mt-5 w-full rounded-2xl px-6 py-4 font-[var(--font-montserrat)] text-xl font-bold text-white transition hover:scale-[1.02]"
              style={{ backgroundColor: "#4296CD" }}
            >
              Play Again
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
