import React from "react";
import { ShieldIcon, TapIcon, PouchIcon } from "./icons";

const FEATURES = [
  {
    icon: <ShieldIcon />,
    title: "Registered to the school",
    body: "Every tag is tied to the school's account, not a pupil record, so recovery never depends on personal data changing hands.",
  },
  {
    icon: <TapIcon />,
    title: "No app for finders",
    body: "A tap or scan takes the finder straight to a simple return page from their own phone. Nothing to install.",
  },
  {
    icon: <PouchIcon />,
    title: "Fits your existing pouches",
    body: "Tags attach to standard mag-lock pouches, so a BYOD policy stays exactly as it is today.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="marketing__section">
      <div className="marketing__container">
        <div className="marketing__section-head">
          <h2>Designed around the pouch you already own</h2>
          <p className="marketing__lede">
            No new hardware to roll out and no pupil-facing app to install.
          </p>
        </div>

        <div className="marketing-grid marketing-grid--3col">
          {FEATURES.map((feature) => (
            <div className="marketing-card" key={feature.title}>
              <div className="marketing-card__icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
