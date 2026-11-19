import s from "@/components/games.module.css";

export type RallyBallState = "todo" | "current" | "done" | "right" | "wrong";

/**
 * A row of tennis balls that tracks a game's progress. Decorative: every game shows the
 * same progress as text ("Question 3 of 6"), so the row is hidden from screen readers.
 */
export default function BallRally({ states }: { states: RallyBallState[] }) {
  return (
    <ol className={s.rally} aria-hidden="true">
      {states.map((state, index) => (
        <li key={index} className={s.rallySlot} data-state={state}>
          <svg viewBox="0 0 100 100" className={s.rallyBall} focusable="false">
            <circle className={s.rallyBody} cx={50} cy={50} r={42} />
            {state !== "todo" && state !== "wrong" && (
              <g className={s.rallySeam}>
                <path d="M22 22 Q46 50 22 78" />
                <path d="M78 22 Q54 50 78 78" />
              </g>
            )}
            {state === "wrong" && <path className={s.rallyCross} d="M34 34 L66 66 M66 34 L34 66" />}
          </svg>
        </li>
      ))}
    </ol>
  );
}
