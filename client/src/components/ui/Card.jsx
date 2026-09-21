import React from 'react';

/**
 * Card – simple solid‑background card component using the approved light‑theme palette.
 * Props:
 *   children – content inside the card.
 *   className – optional extra Tailwind classes.
 */
export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-secondary border border-tertiary rounded-card shadow-soft p-4 ${className}`}>
      {children}
    </div>
  );
}
