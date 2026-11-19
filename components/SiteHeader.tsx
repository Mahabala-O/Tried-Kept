"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import BallArt from "@/components/art/BallArt";

type Props = {
  /** Null when logged out. */
  level: { name: string; xp: number } | null;
  /** False while email is off and sign-up is paused. */
  signupsOpen?: boolean;
};

const MAIN_LINKS = [
  { href: "/pros", label: "Pros" },
  { href: "/gear", label: "Gear" },
  { href: "/compare", label: "Compare" },
  { href: "/play", label: "Play" },
  { href: "/community", label: "Community" },
];

const PLAY_LINKS = [
  { href: "/play/finder", label: "Gear Match" },
  { href: "/play/rally", label: "Spec Rally" },
  { href: "/play/cost", label: "Cost per hour" },
  { href: "/report/new", label: "Report your gear" },
];

const ABOUT_LINKS = [
  { href: "/disclosure", label: "How this works" },
  { href: "/privacy", label: "Privacy" },
  { href: "/credits", label: "Credits" },
];

function isCurrent(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" className="brand" onClick={onClick}>
      <BallArt />
      <span>
        Tried<span className="amp">&amp;</span>Kept
      </span>
    </Link>
  );
}

function XpChip({ level, signupsOpen = true }: Props) {
  if (!level) {
    return (
      <Link href={signupsOpen ? "/signup" : "/login"} className="nav-xp">
        {signupsOpen ? "Join" : "Log in"}
      </Link>
    );
  }
  return (
    <Link href="/me" className="nav-xp" aria-label={`${level.name}, ${level.xp} XP. Open your locker`}>
      <span className="nav-xp-level">{level.name} · </span>
      {level.xp} XP
    </Link>
  );
}

export default function SiteHeader({ level, signupsOpen = true }: Props) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  // Set when the sheet closes because a link was followed. Focus then stays with the new page.
  const navigating = useRef(false);

  const close = useCallback(() => setOpen(false), []);
  const closeForLink = useCallback(() => {
    navigating.current = true;
    setOpen(false);
  }, []);

  // Show or hide the modal, lock page scroll and hand focus back on close.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const root = document.documentElement;
    if (open) {
      navigating.current = false;
      if (!dialog.open) dialog.showModal();
      const previous = root.style.overflow;
      root.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
      return () => {
        root.style.overflow = previous;
        document.body.style.overflow = "";
      };
    }
    if (dialog.open) {
      dialog.close();
      if (!navigating.current) openerRef.current?.focus();
    }
    navigating.current = false;
  }, [open]);

  // Close the sheet after any navigation.
  useEffect(() => {
    navigating.current = true;
    setOpen(false);
  }, [pathname]);

  // Escape closes (the dialog's cancel event), and Tab wraps inside the sheet.
  const onKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const current = (href: string) => (isCurrent(pathname, href) ? ("page" as const) : undefined);

  return (
    <header className="site-header">
      <div className="wrap">
        <Brand />
        <nav className="nav" aria-label="Main">
          {MAIN_LINKS.map((link) => (
            <Link key={link.href} href={link.href} aria-current={current(link.href)}>
              {link.label}
            </Link>
          ))}
          {level ? (
            <Link href="/me" aria-current={current("/me")}>
              My locker
            </Link>
          ) : (
            <Link href="/login" aria-current={current("/login")}>
              Log in
            </Link>
          )}
          {(level || signupsOpen) && <XpChip level={level} signupsOpen={signupsOpen} />}
        </nav>
        <XpChip level={level} signupsOpen={signupsOpen} />
        <button
          ref={openerRef}
          type="button"
          className="menu-btn"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen(true)}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 5 H17 M3 10 H17 M3 15 H12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Menu
        </button>
      </div>

      <dialog
        ref={dialogRef}
        id="site-menu"
        className="menu-sheet"
        aria-label="Menu"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClose={close}
        onKeyDown={onKeyDown}
      >
        <div className="menu-sheet-head">
          <Brand onClick={closeForLink} />
          <button type="button" className="menu-btn" onClick={close} data-autofocus>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 5 L15 15 M15 5 L5 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Close
          </button>
        </div>
        <div className="menu-sheet-body">
          <nav aria-label="Site sections">
            <ul className="menu-big">
              <li>
                <Link href="/" aria-current={current("/")} onClick={closeForLink}>
                  Home
                </Link>
              </li>
              {MAIN_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} aria-current={current(link.href)} onClick={closeForLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
              {(level || signupsOpen) && (
                <li>
                  <Link href={level ? "/me" : "/signup"} aria-current={current(level ? "/me" : "/signup")} onClick={closeForLink}>
                    {level ? "My locker" : "Start a locker"}
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          <div className="stack">
            <span className="eyebrow">Play and report</span>
            <ul className="menu-small">
              {PLAY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} aria-current={current(link.href)} onClick={closeForLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {level ? (
            <p className="small muted">
              You are a {level.name} with {level.xp} XP.
            </p>
          ) : (
            <div className="stack">
              {signupsOpen ? (
                <Link href="/signup" className="btn btn-optic btn-lg" onClick={closeForLink}>
                  Join
                </Link>
              ) : (
                <p className="small muted">New sign-ups are paused for now. Existing players can still log in.</p>
              )}
              <Link href="/login" className={signupsOpen ? "btn" : "btn btn-optic btn-lg"} onClick={closeForLink}>
                Log in
              </Link>
            </div>
          )}
          <ul className="menu-small">
            {ABOUT_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} aria-current={current(link.href)} onClick={closeForLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </header>
  );
}
