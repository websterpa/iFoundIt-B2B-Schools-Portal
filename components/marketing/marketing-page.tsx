import React from 'react'
import type { ReactNode } from 'react'

type MarketingHeroProps = {
  eyebrow?: string
  title: string
  children: ReactNode
  aside?: ReactNode
}

export function MarketingHero({ eyebrow, title, children, aside }: MarketingHeroProps) {
  return (
    <section className={aside ? 'marketing-hero marketing-hero--with-stamp' : 'marketing-hero'}>
      <div className="marketing-hero__content">
        {eyebrow ? <p className="marketing-eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        <div className="marketing-stack">{children}</div>
      </div>
      {aside ? <div className="marketing-hero__aside">{aside}</div> : null}
    </section>
  )
}

export function MarketingSection({
  children,
  labelledBy
}: {
  children: ReactNode
  labelledBy?: string
}) {
  return (
    <section aria-labelledby={labelledBy} className="marketing-section">
      {children}
    </section>
  )
}

export function MarketingSectionHeading({
  id,
  title,
  intro
}: {
  id?: string
  title: string
  intro?: string
}) {
  return (
    <div className="marketing-section__heading">
      <h2 id={id}>{title}</h2>
      {intro ? <p className="marketing-lead">{intro}</p> : null}
    </div>
  )
}

export function MarketingCtaRow({ children }: { children: ReactNode }) {
  return <div className="marketing-actions">{children}</div>
}

export function SerialStamp({
  serial,
  small = false
}: {
  serial: `IFS-${string}`
  small?: boolean
}) {
  return (
    <div className={small ? 'serial-stamp serial-stamp--small' : 'serial-stamp'} aria-label={`Serial ${serial}`}>
      <span className="serial-stamp__label">Serial</span>
      <span className="serial-stamp__value">{serial}</span>
    </div>
  )
}

export function MarketingFootnotes({ children }: { children: ReactNode }) {
  return <div className="marketing-footnotes">{children}</div>
}
