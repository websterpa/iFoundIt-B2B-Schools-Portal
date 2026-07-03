import React from "react";

const STEPS = [
  {
    title: "Pouch is locked",
    body: "The pupil's phone goes into its usual mag-lock pouch as part of the school day.",
  },
  {
    title: "Finder taps the tag",
    body: "If a pouch is misplaced, whoever finds it taps the NFC tag or scans the printed code on it.",
  },
  {
    title: "School is notified",
    body: "The finder lands on a short return page and the school gets a notification. No pupil details are shown.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="marketing__section marketing__section--alt">
      <div className="marketing__container">
        <div className="marketing__section-head">
          <h2>From locked pouch to safe return</h2>
        </div>

        <ol className="marketing-steps">
          {STEPS.map((step, index) => (
            <li className="marketing-steps__item" key={step.title}>
              <span className="marketing-steps__number">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
