"use client";

import Link from "next/link";
import { PUBLIC_SECTIONS } from "@/lib/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type Tab = {
  href: string;
  label: string;
  /** Path prefixes that count as this tab. */
  match: string[];
  icon: React.ReactNode;
};

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const HomeIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M3.5 11 L12 4 L20.5 11 V20 H14.5 V14.5 H9.5 V20 H3.5 Z"
      {...stroke}
    />
  </svg>
);

const GearIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M2.5 17.5 V13 Q2.5 10.5 5 10.5 H8.5 L12 14 Q14 15.5 17 15.5 H19 Q21.5 15.5 21.5 18 V19.5 H2.5 Z"
      {...stroke}
    />
    <path d="M9.5 12 L11 10.5 M11.5 13.5 L13 12" {...stroke} />
  </svg>
);

const PlayIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" {...stroke} />
    <path d="M6 5.8 Q10.5 12 6 18.2 M18 5.8 Q13.5 12 18 18.2" {...stroke} />
  </svg>
);

function isActive(pathname: string, match: string[]): boolean {
  return match.some((prefix) =>
    prefix === "/"
      ? pathname === "/"
      : pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Catalogue and Pros are the only public sections. */
export default function BottomNav() {
  const pathname = usePathname() ?? "/";
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty(
        "--bottom-nav-h",
        `${Math.ceil(nav.getBoundingClientRect().height)}px`,
      );
    });
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);
  const tabs: Tab[] = [
    { href: "/", label: "Home", match: ["/"], icon: HomeIcon },
    ...PUBLIC_SECTIONS.map((section) => ({
      href: section.href,
      label: section.label,
      match: [...section.matches],
      icon: section.href === "/gear" ? GearIcon : PlayIcon,
    })),
  ];

  return (
    <nav className="bottom-nav" aria-label="Quick" ref={navRef}>
      <ul>
        {tabs.map((tab) => (
          <li key={tab.label}>
            <Link
              href={tab.href}
              aria-current={isActive(pathname, tab.match) ? "page" : undefined}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
