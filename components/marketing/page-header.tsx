import React from "react";

export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <section className="marketing-page-header">
      <div className="marketing__container">
        <p className="marketing-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {lede && <p className="marketing-page-header__lede">{lede}</p>}
      </div>
    </section>
  );
}
