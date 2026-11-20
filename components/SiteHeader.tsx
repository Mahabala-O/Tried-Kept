"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import BallArt from "@/components/art/BallArt";

import { PUBLIC_SECTIONS, sectionIsCurrent } from "@/lib/navigation";

const MAIN_LINKS = PUBLIC_SECTIONS;

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

export default function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  // Set when the sheet closes because a link was followed. Focus then stays with the new page.
  const navigating = useRef(false);

  const close = useCallback(() => setOpen(false), []);
  // Text enlargement can wrap the header. Keep sticky sections below its actual height.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty(
        "--header-h",
        `${Math.ceil(header.getBoundingClientRect().height)}px`,
      );
    });
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
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
      event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
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

  const current = (href: string) => {
    const section = MAIN_LINKS.find((link) => link.href === href);
    const active = section
      ? sectionIsCurrent(pathname, section.matches)
      : isCurrent(pathname, href);
    return active ? ("page" as const) : undefined;
  };

  return (
    <header className="site-header" ref={headerRef}>
      <div className="wrap">
        <Brand />
        <nav className="nav" aria-label="Main">
          {MAIN_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={current(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
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
            <path
              d="M3 5 H17 M3 10 H17 M3 15 H12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
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
          <button
            type="button"
            className="menu-btn"
            onClick={close}
            data-autofocus
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path
                d="M5 5 L15 15 M15 5 L5 15"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            Close
          </button>
        </div>
        <div className="menu-sheet-body">
          <nav aria-label="Site sections">
            <ul className="menu-big">
              <li>
                <Link
                  href="/"
                  aria-current={current("/")}
                  onClick={closeForLink}
                >
                  Home
                </Link>
              </li>
              {MAIN_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={current(link.href)}
                    onClick={closeForLink}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <ul className="menu-small">
            {ABOUT_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={current(link.href)}
                  onClick={closeForLink}
                >
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
