import React from 'react'
import Link from 'next/link'

export default function SchoolsMobileHeaderHero() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <nav
          aria-label="Primary"
          className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6"
        >
          <Link
            href="/"
            className="min-w-0 shrink text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            <span className="block text-lg font-extrabold leading-none text-slate-900 sm:text-xl">
              iFoundIt
            </span>
            <span className="block text-xs font-semibold leading-tight text-slate-600 sm:text-sm">
              for Schools
            </span>
          </Link>

          <div className="ml-3 flex shrink-0 items-center gap-2 max-[399px]:gap-1.5">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 max-[399px]:px-2.5 max-[399px]:text-xs"
            >
              School Login
            </Link>

            <button
              type="button"
              aria-label="Open menu"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 max-[399px]:px-2.5 max-[399px]:text-xs"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
              <span>Menu</span>
            </button>
          </div>
        </nav>
      </header>

      <main id="main">
        <section className="mx-auto w-full max-w-7xl px-4 pb-14 pt-10 sm:px-6 sm:pt-14">
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-blue-700 sm:text-sm">
            BYOD DEVICE RECOVERY FOR SCHOOLS
          </p>

          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
            One tap on the pouch brings a lost phone home.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Help students recover misplaced devices fast with a simple, secure flow that protects
            privacy and reduces disruption across your school day.
          </p>

          <div className="mt-7 flex w-full max-w-md flex-col gap-3">
            <Link
              href="/book-demo"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
            >
              Book a school demo
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
            >
              How recovery works
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
