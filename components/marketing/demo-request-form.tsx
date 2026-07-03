"use client";

import React from "react";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { CheckIcon } from "./icons";

// Fixes P2 (form cognitive load) and part of P1 (accessibility):
// down to four fields, custom role dropdown aligned to page styling,
// and errors are localised per field rather than one generic banner.

type FormState = "idle" | "submitting" | "submitted" | "error";

type FieldErrors = Partial<Record<"schoolName" | "contactName" | "workEmail" | "role", string>>;

const ROLE_OPTIONS = [
  { value: "senior-leadership", label: "Senior leadership" },
  { value: "it-lead", label: "IT lead" },
  { value: "pastoral", label: "Pastoral / attendance" },
  { value: "other", label: "Other" },
] as const;

export function DemoRequestForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [roleValue, setRoleValue] = useState("");
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  const selectedRoleLabel = ROLE_OPTIONS.find((option) => option.value === roleValue)?.label ?? "Select one";

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (!roleMenuRef.current) return;
      if (!roleMenuRef.current.contains(event.target as Node)) {
        setIsRoleMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  function handleRoleSelect(value: string) {
    setRoleValue(value);
    setIsRoleMenuOpen(false);
    setErrors((current) => {
      if (!current.role) return current;
      const next = { ...current };
      delete next.role;
      return next;
    });
  }

  function handleRoleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsRoleMenuOpen(true);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsRoleMenuOpen(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const nextErrors: FieldErrors = {};
    if (!form.get("schoolName")) nextErrors.schoolName = "Enter your school's name.";
    if (!form.get("contactName")) nextErrors.contactName = "Enter your name.";
    if (!form.get("workEmail")) nextErrors.workEmail = "Enter a work email address.";
    if (!form.get("role")) nextErrors.role = "Select your role.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setState("submitting");

    try {
      // TODO: wire this up to the real submission path once confirmed
      // (Supabase table insert or an /api/demo-request route). Left
      // unimplemented deliberately rather than pointed at a made-up
      // endpoint.
      // await submitDemoRequest(form);
      setState("submitted");
    } catch {
      setState("error");
    }
  }

  if (state === "submitted") {
    return (
      <div className="marketing-form" role="status">
        <h3>Thanks — that's in.</h3>
        <p>We&apos;ll be in touch shortly to arrange a time.</p>
      </div>
    );
  }

  return (
    <section id="demo" className="marketing__section marketing__section--alt">
      <div className="marketing__container marketing-demo__inner">
        <div>
          <h2>Book a 20-minute walkthrough</h2>
          <p className="marketing__lede">
            Four questions, then we&apos;ll be in touch to find a time that works.
          </p>
          <ul className="marketing-demo__reassurance">
            <li><CheckIcon /> No pupil data needed to book a demo</li>
            <li><CheckIcon /> We&apos;ll only use these details to arrange the call</li>
          </ul>
        </div>

        <form className="marketing-form" aria-label="Book a demo" onSubmit={handleSubmit} noValidate>
          <div className={`marketing-form__row ${errors.schoolName ? "marketing-form__row--error" : ""}`}>
            <label htmlFor="school-name">School name</label>
            <input type="text" id="school-name" name="schoolName" autoComplete="organization" aria-invalid={!!errors.schoolName} aria-describedby={errors.schoolName ? "school-name-error" : undefined} />
            {errors.schoolName && <p className="marketing-form__error" id="school-name-error">{errors.schoolName}</p>}
          </div>

          <div className={`marketing-form__row ${errors.contactName ? "marketing-form__row--error" : ""}`}>
            <label htmlFor="contact-name">Your name</label>
            <input type="text" id="contact-name" name="contactName" autoComplete="name" aria-invalid={!!errors.contactName} aria-describedby={errors.contactName ? "contact-name-error" : undefined} />
            {errors.contactName && <p className="marketing-form__error" id="contact-name-error">{errors.contactName}</p>}
          </div>

          <div className={`marketing-form__row ${errors.workEmail ? "marketing-form__row--error" : ""}`}>
            <label htmlFor="work-email">Work email</label>
            <input type="email" id="work-email" name="workEmail" autoComplete="email" aria-invalid={!!errors.workEmail} aria-describedby={errors.workEmail ? "work-email-error" : undefined} />
            {errors.workEmail && <p className="marketing-form__error" id="work-email-error">{errors.workEmail}</p>}
          </div>

          <div className={`marketing-form__row ${errors.role ? "marketing-form__row--error" : ""}`}>
            <label id="role-label" htmlFor="role-trigger">Your role</label>
            <div className="marketing-select" ref={roleMenuRef}>
              <input type="hidden" name="role" value={roleValue} />
              <button
                type="button"
                id="role-trigger"
                className={`marketing-select__trigger ${!roleValue ? "is-placeholder" : ""}`}
                aria-haspopup="listbox"
                aria-expanded={isRoleMenuOpen}
                aria-controls="role-listbox"
                aria-labelledby="role-label role-trigger"
                aria-invalid={!!errors.role}
                aria-describedby={errors.role ? "role-error" : undefined}
                onClick={() => setIsRoleMenuOpen((open) => !open)}
                onKeyDown={handleRoleTriggerKeyDown}
              >
                <span>{selectedRoleLabel}</span>
                <span
                  className={`marketing-select__chevron ${isRoleMenuOpen ? "is-open" : ""}`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>

              {isRoleMenuOpen && (
                <ul id="role-listbox" className="marketing-select__menu" role="listbox" aria-labelledby="role-label">
                  {ROLE_OPTIONS.map((option) => (
                    <li key={option.value}>
                      <button
                        type="button"
                        className={`marketing-select__option ${roleValue === option.value ? "is-selected" : ""}`}
                        role="option"
                        aria-selected={roleValue === option.value}
                        onClick={() => handleRoleSelect(option.value)}
                      >
                        {option.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {errors.role && <p className="marketing-form__error" id="role-error">{errors.role}</p>}
          </div>

          <button type="submit" className="btn btn--primary btn--block" disabled={state === "submitting"}>
            {state === "submitting" ? "Sending request" : "Request school demo"}
          </button>

          <p className="marketing-form__note">
            We&apos;ll only use your work details to arrange this school demo.
          </p>
        </form>
      </div>
    </section>
  );
}
