import React from "react";
import Link from "next/link";
import Image from "next/image";
import heroPeopleImage from "./Website front page image of people AdobeStock_46912032.jpeg";

export function MarketingHero() {
  return (
    <>
      <section className="marketing-hero">
        <div className="marketing__container marketing-hero__inner">
          <div>
            <p className="marketing-eyebrow">BYOD device recovery for schools</p>
            <h1>One tap on the pouch brings a lost phone home.</h1>
            <p className="marketing-hero__sub">
              Uniquely encoded iFoundIt NFC tags attach to the mag-lock phone
              pouches you already use. Every tag is registered to the school,
              not the pupil, so no new devices, no new app for finders, and no
              pupil data are shown to a person that finds a lost pouch.
            </p>
            <div className="marketing-hero__actions">
              <Link href="#demo" className="btn btn--primary">Book a school demo</Link>
              <Link href="#how-it-works" className="btn btn--ghost">How recovery works</Link>
            </div>
          </div>

          <div className="marketing-hero__aside">
            <Image
              src={heroPeopleImage}
              alt="Students and staff walking through a school campus concourse"
              width={3813}
              height={1358}
              style={{ width: "100%", height: "auto", display: "block" }}
              priority
              sizes="(max-width: 900px) 100vw, 48vw"
            />
          </div>
        </div>
      </section>

      <p className="marketing-trust-line">
        Built for UK schools already running mag-lock pouch policies for BYOD phones.
      </p>
    </>
  );
}
