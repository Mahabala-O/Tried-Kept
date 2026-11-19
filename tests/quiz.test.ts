import { describe, expect, it } from "vitest";
import { getPro } from "@/lib/catalog";
import { breakEvenHours } from "@/lib/finder";
import { gradeQuiz, quizQuestions } from "@/lib/quiz";

const correct = Object.fromEntries(quizQuestions.map((q) => [q.id, q.answerIndex]));

describe("gradeQuiz", () => {
  it("scores all correct answers", () => {
    const graded = gradeQuiz(correct);
    expect(graded.score).toBe(quizQuestions.length);
    expect(graded.total).toBe(quizQuestions.length);
    expect(graded.results.every((r) => r.correct)).toBe(true);
  });

  it("scores no answers as zero", () => {
    const graded = gradeQuiz({});
    expect(graded.score).toBe(0);
    expect(graded.total).toBe(quizQuestions.length);
  });

  it("marks one wrong answer", () => {
    const first = quizQuestions[0];
    const wrong = (first.answerIndex + 1) % first.options.length;
    const graded = gradeQuiz({ ...correct, [first.id]: wrong });
    expect(graded.score).toBe(quizQuestions.length - 1);
    expect(graded.results.find((r) => r.id === first.id)?.correct).toBe(false);
  });

  it("ignores unknown question ids", () => {
    expect(gradeQuiz({ ...correct, invented: 0 }).score).toBe(quizQuestions.length);
    expect(gradeQuiz({ invented: 0 }).results).toHaveLength(quizQuestions.length);
  });
});

describe("quizQuestions", () => {
  it.each(quizQuestions.map((q) => [q.id, q] as const))("%s has an answer in range", (_id, q) => {
    expect(Number.isInteger(q.answerIndex)).toBe(true);
    expect(q.answerIndex).toBeGreaterThanOrEqual(0);
    expect(q.answerIndex).toBeLessThan(q.options.length);
  });

  it("has unique ids", () => {
    const ids = quizQuestions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has no repeated options within a question", () => {
    for (const q of quizQuestions) expect(new Set(q.options).size).toBe(q.options.length);
  });

  it("cites an https source for every sourced fact", () => {
    for (const q of quizQuestions) {
      if (q.source) expect(new URL(q.source.url).protocol).toBe("https:");
    }
  });

  it("labels the break-even hours as an illustration with no retailer source", () => {
    const q = quizQuestions.find((x) => x.id === "break-even")!;
    expect(q.source).toBeNull();
    expect(q.explanation).toContain("illustration");
  });

  it("carries the pro caveat with the pro gear question", () => {
    const q = quizQuestions.find((x) => x.id === "alcaraz-shoe")!;
    expect(q.explanation).toContain(getPro("carlos-alcaraz")!.caveat);
  });

  it("agrees with the break-even calculation", () => {
    const q = quizQuestions.find((x) => x.id === "break-even")!;
    expect(q.options[q.answerIndex]).toBe(`${breakEvenHours(135, 60, 180)} hours`);
  });
});
