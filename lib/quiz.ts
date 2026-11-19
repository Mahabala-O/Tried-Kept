import { getPro, sources, type Source } from "./catalog";

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  /** Null only for a worked example, whose numbers are an illustration and not a sourced fact. */
  source: Source | null;
};

const ALCARAZ_CAVEAT = getPro("carlos-alcaraz")?.caveat ?? "";

/** Spec Rally. Every fact comes from the research with its source. Examples are labelled as examples. */
export const quizQuestions: QuizQuestion[] = [
  {
    id: "alcaraz-shoe",
    prompt: "Kit Tennis dated which shoe on Carlos Alcaraz to March 13, 2026?",
    options: ["Nike Vapor Pro 3", "Nike Vapor 12", "ASICS GEL-Resolution 9"],
    answerIndex: 1,
    explanation: `Kit Tennis's entry dates the Vapor 12 identification to March 13, 2026. ${ALCARAZ_CAVEAT}`,
    source: sources.kitAlcaraz,
  },
  {
    id: "price-gap",
    prompt: "How much more did the Vapor 12 cost than the Vapor Pro 3 on Nike's U.S. pages?",
    options: ["$25", "$45", "$60"],
    answerIndex: 1,
    explanation: "$180 for the Vapor 12 and $135 for the Vapor Pro 3, checked November 18, 2026.",
    source: sources.nikeV12,
  },
  {
    id: "zoom-v12",
    prompt: "Where is the Vapor 12's Air Zoom unit, according to Nike?",
    options: ["Heel", "Forefoot", "Midfoot"],
    answerIndex: 0,
    explanation: "Nike places the Vapor 12's Air Zoom in the heel.",
    source: sources.nikeV12,
  },
  {
    id: "zoom-pro3",
    prompt: "Where is the Vapor Pro 3's Air Zoom unit, according to Nike?",
    options: ["Heel", "Forefoot", "Full length"],
    answerIndex: 1,
    explanation: "Nike places the Vapor Pro 3's Air Zoom in the forefoot.",
    source: sources.nikePro3,
  },
  {
    id: "lighter",
    prompt: "Which shoe weighed less in RunRepeat's lab?",
    options: ["Vapor 12", "Vapor Pro 3", "They weighed the same"],
    answerIndex: 1,
    explanation: "The Vapor Pro 3 weighed 383 g and the Vapor 12 weighed 390 g.",
    source: sources.rrPro3,
  },
  {
    id: "roomier",
    prompt: "Which test shoe measured wider inside at the ball of the foot?",
    options: ["Vapor 12", "Vapor Pro 3", "They measured the same"],
    answerIndex: 1,
    explanation: "The Vapor Pro 3 measured 93.2 mm against 89.9 mm for the Vapor 12.",
    source: sources.rrPro3,
  },
  {
    id: "break-even",
    prompt: "Suppose a $135 pair lasts 60 hours. How long must a $180 pair last to match its cost per hour?",
    options: ["70 hours", "80 hours", "90 hours"],
    answerIndex: 1,
    explanation:
      "$135 over 60 hours is $2.25 an hour, and $180 at $2.25 an hour is 80 hours. The 60 hours is an illustration, not a measured lifespan.",
    source: null,
  },
  {
    id: "demo",
    prompt: "What does Tennis Warehouse publicly list for its racquet demo program?",
    options: ["Three demos for a week for $25", "One demo for a month for $10", "Five demos for a week for $50"],
    answerIndex: 0,
    explanation: "Three demos for a week for $25, with a purchase credit under its terms.",
    source: sources.twDemo,
  },
];

export function gradeQuiz(answers: Record<string, number>) {
  const results = quizQuestions.map((q) => ({ id: q.id, correct: answers[q.id] === q.answerIndex }));
  return { results, score: results.filter((r) => r.correct).length, total: quizQuestions.length };
}
