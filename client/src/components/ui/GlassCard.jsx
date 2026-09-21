import React from 'react';

/**
 * GlassCard – a reusable card component with glassmorphism style.
 * Uses Tailwind utilities defined in the project's tailwind.config.js.
 * Props:
 *   children – content inside the card.
 *   className – optional additional classes.
 */
export default function GlassCard({ children, className = '' }) {
  return (
    <div
      className={`bg-white/30 backdrop-blur-md rounded-card shadow-soft border border-border ${className}`}
    >
      {children}
    </div>
  );
}
