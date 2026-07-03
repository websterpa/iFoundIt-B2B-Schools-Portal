"use client";

import React from "react";
import { FormEvent, useState } from "react";

type FormState = "idle" | "submitting" | "submitted" | "error";
type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const nextErrors: FieldErrors = {};
    if (!form.get("name")) nextErrors.name = "Enter your name.";
    if (!form.get("email")) nextErrors.email = "Enter an email address.";
    if (!form.get("message")) nextErrors.message = "Add a short message.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setState("submitting");

    try {
      // TODO: wire this up to the real submission path (Supabase insert
      // or an /api/contact route) once confirmed.
      setState("submitted");
    } catch {
      setState("error");
    }
  }

  if (state === "submitted") {
    return (
      <div className="marketing-form" role="status">
        <h3>Message sent.</h3>
        <p>We&apos;ll get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form className="marketing-form" aria-label="Contact us" onSubmit={handleSubmit} noValidate>
      <div className={`marketing-form__row ${errors.name ? "marketing-form__row--error" : ""}`}>
        <label htmlFor="contact-name">Name</label>
        <input type="text" id="contact-name" name="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "contact-name-error" : undefined} />
        {errors.name && <p className="marketing-form__error" id="contact-name-error">{errors.name}</p>}
      </div>

      <div className={`marketing-form__row ${errors.email ? "marketing-form__row--error" : ""}`}>
        <label htmlFor="contact-email">Email</label>
        <input type="email" id="contact-email" name="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "contact-email-error" : undefined} />
        {errors.email && <p className="marketing-form__error" id="contact-email-error">{errors.email}</p>}
      </div>

      <div className={`marketing-form__row ${errors.message ? "marketing-form__row--error" : ""}`}>
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          style={{
            width: "100%",
            fontFamily: "inherit",
            fontSize: 15,
            padding: "11px 12px",
            border: "1px solid var(--colour-border-strong)",
            borderRadius: "var(--radius-sm)",
            resize: "vertical",
          }}
        />
        {errors.message && <p className="marketing-form__error" id="contact-message-error">{errors.message}</p>}
      </div>

      <button type="submit" className="btn btn--primary btn--block" disabled={state === "submitting"}>
        {state === "submitting" ? "Sending" : "Send message"}
      </button>
    </form>
  );
}
