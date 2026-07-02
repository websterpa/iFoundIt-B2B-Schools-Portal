import React from 'react'
import type { ReactNode } from 'react'

type MarketingHeroProps = {
  eyebrow?: string
  title: string
  children: ReactNode
}

export function MarketingHero({ eyebrow, title, children }: MarketingHeroProps) {
  return (
    <section className="marketing-hero">
      <div className="marketing-hero__content">
        {eyebrow ? <p className="marketing-eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        <div className="marketing-stack">{children}</div>
      </div>
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
