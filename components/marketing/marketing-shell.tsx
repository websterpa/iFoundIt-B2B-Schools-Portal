"use client";

import React from "react";
import { useState } from "react";
import Link from "next/link";
import { MenuIcon } from "./icons";

// Fixes the P1 accessibility finding: this is a real <button> with
// aria-expanded/aria-controls, not a div with a click handler, and
// the state is plain useState rather than CSS-only :focus hacks.

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="marketing">
      <a
        href="#main"
        className="sr-only focus:not-sr-only"
        style={{ position: "absolute", left: navOpen ? undefined : "-9999px" }}
      >
        Skip to content
      </a>

      <header className="marketing-header">
        <div className="marketing__container marketing-header__inner">
          <Link href="/" className="marketing-logo">
            iFoundIt <small>for Schools</small>
          </Link>

          <nav
            id="primary-nav"
            className={`marketing-nav ${navOpen ? "is-open" : ""}`}
            aria-label="Primary"
          >
            <Link href="/#features">Product</Link>
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/security">Security</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/login">School Login</Link>
          </nav>

          <div className="marketing-header__actions">
            <Link href="/login" className="btn btn--ghost marketing-header__login">
              School Login
            </Link>
            <Link href="/#demo" className="btn btn--primary">
              Book a school demo
            </Link>
            <button
              type="button"
              className="marketing-nav__toggle"
              aria-expanded={navOpen}
              aria-controls="primary-nav"
              aria-label={navOpen ? "Close menu" : "Open menu"}
              onClick={() => setNavOpen((open) => !open)}
            >
              <MenuIcon />
              <span className="marketing-nav__toggle-label">Menu</span>
            </button>
          </div>
        </div>
      </header>

      <main id="main">{children}</main>

      <footer className="marketing-footer">
        <div className="marketing__container">
          <div className="marketing-footer__grid">
            <div className="marketing-footer__brand">
              <Link href="/" className="marketing-logo">
                iFoundIt <small>for Schools</small>
              </Link>
              <p>
                Tags register to the school account. Pupil contact details
                are never stored on the tag or shown to a finder.
              </p>
            </div>
            <div className="marketing-footer__col">
              <h3>Product</h3>
              <ul>
                <li><Link href="#features">How it works</Link></li>
                <li><Link href="#security">Security</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
              </ul>
            </div>
            <div className="marketing-footer__col">
              <h3>Company</h3>
              <ul>
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/login">School Login</Link></li>
              </ul>
            </div>
            <div className="marketing-footer__col">
              <h3>Legal</h3>
              <ul>
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="marketing-footer__bottom">
            <span>&copy; {new Date().getFullYear()} iFoundIt.io</span>
            <span>Made for UK schools</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
