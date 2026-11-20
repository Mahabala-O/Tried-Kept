import type { Metadata } from "next";
import type { ReactNode } from "react";

/** Existing links and user data remain usable without promoting these areas in search. */
export const metadata: Metadata = { robots: { index: false, follow: true } };
export default function LegacyArea({ children }: { children: ReactNode }) {
  return children;
}
