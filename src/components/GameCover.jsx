import { useMemo } from 'react';
import { coverFor } from '../lib/cover';

/**
 * A game box drawn from its title: warm hue, darker spine, a light band or frame, and an
 * Alegreya monogram. Decorative; the title is always rendered as text next to it.
 * `color` is an optional COVER_COLORS id. Size it with `className` (it fills its box; 3:4 portrait looks most like a box).
 */
export default function GameCover({ title, color = null, className = '', monogramClassName = 'text-2xl' }) {
  const cover = useMemo(() => coverFor(title, color), [title, color]);
  return (
    <div
      aria-hidden="true"
      className={`relative isolate overflow-hidden rounded-sm shadow-[0_1px_2px_oklch(0.1_0.02_55/0.35)] select-none ${className}`}
      style={{ backgroundColor: cover.base }}
    >
      {/* spine */}
      <div className="absolute inset-y-0 left-0 w-[14%]" style={{ backgroundColor: cover.spine }} />
      <div className="absolute inset-y-0 left-[14%] w-px opacity-40" style={{ backgroundColor: cover.band }} />

      {cover.variant === 'bands' && (
        <>
          <div className="absolute inset-x-0 top-[14%] h-[5%]" style={{ backgroundColor: cover.band }} />
          <div className="absolute inset-x-0 bottom-[14%] h-[2%]" style={{ backgroundColor: cover.band }} />
        </>
      )}
      {cover.variant === 'frame' && (
        <div
          className="absolute top-[9%] right-[9%] bottom-[9%] left-[23%] rounded-[2px] border opacity-70"
          style={{ borderColor: cover.band }}
        />
      )}
      {cover.variant === 'corner' && (
        <div
          className="absolute -right-1/4 -bottom-1/4 size-3/4 rotate-45 opacity-35"
          style={{ backgroundColor: cover.band }}
        />
      )}

      <span
        className={`absolute inset-y-0 right-0 left-[14%] flex items-center justify-center font-display font-bold leading-none tracking-tight ${monogramClassName}`}
        style={{ color: cover.ink }}
      >
        {cover.monogram}
      </span>
    </div>
  );
}
