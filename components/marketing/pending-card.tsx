// Same pattern as security-section.tsx: content that needs a named
// sign-off (legal, DPO, commercial) is locked in this visual state
// rather than shipped as copy that looks finished but isn't.

import React from "react";

export function PendingCard({ title, note }: { title: string; note: string }) {
  return (
    <div className="marketing-card marketing-card--warn">
      <span className="marketing-pending__badge">Pending verification</span>
      <h3>{title}</h3>
      <p>{note}</p>
    </div>
  );
}
