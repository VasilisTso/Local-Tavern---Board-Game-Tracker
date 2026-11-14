// Motion tokens (DESIGN.md › Motion). framer-motion only. Every helper that moves something takes
// `reduceMotion` (from `useReducedMotion()`) and falls back to a short opacity fade: reduced motion
// keeps feedback and state changes legible, it only removes travel.

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

export const DURATION = { fast: 0.12, base: 0.2, slow: 0.32 };

export const SPRING = {
  /** Objects landing on a board. */
  settle: { type: 'spring', stiffness: 380, damping: 30 },
  /** Spine lift and pull-out. */
  pull: { type: 'spring', stiffness: 520, damping: 34 },
  /** Sheets and dialogs. */
  sheet: { type: 'spring', stiffness: 300, damping: 32 },
  /** Small indicators that slide between options (the tab underline). */
  indicator: { type: 'spring', stiffness: 520, damping: 40 },
  /** The wheel winner flying out of its slice: loose enough to overshoot once and settle. */
  fly: { type: 'spring', stiffness: 170, damping: 17, mass: 0.9 },
};

/** Reduced-motion stand-in: a short opacity fade, never movement. */
export const fade = { duration: 0.15, ease: 'linear' };

/** Confident arrival for fades and reveals; exits run faster than entrances. */
export const enter = { duration: DURATION.base, ease: EASE_OUT_EXPO };
export const exit = { duration: DURATION.fast, ease: 'easeIn' };

/** Per-object stagger, capped so a long board never waits more than 320ms. */
export const STAGGER = 0.024;
export const STAGGER_CAP = 0.32;
export const staggerDelay = (index, step = STAGGER, cap = STAGGER_CAP) => Math.min(index * step, cap);

/** Objects dropping onto a board, staggered left to right. */
export function dropIn(index, reduceMotion) {
  if (reduceMotion) return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: fade };
  const delay = staggerDelay(index);
  return {
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0 },
    transition: { ...SPRING.settle, delay, opacity: { duration: DURATION.base, delay } },
  };
}

/** Dense list rows: a quick fade with a short stagger (no travel, rows are not objects). */
export function rowIn(index, reduceMotion) {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: reduceMotion ? fade : { duration: DURATION.base, delay: staggerDelay(index, 0.012, 0.2) },
  };
}

/** A card or panel arriving in place (a locked pick, a result). */
export function riseIn(reduceMotion) {
  if (reduceMotion) return { initial: { opacity: 0 }, animate: { opacity: 1, transition: fade }, exit: { opacity: 0, transition: fade } };
  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.36, ease: EASE_OUT_EXPO } },
    exit: { opacity: 0, transition: exit },
  };
}

/**
 * Rows added to or removed from a list (activity entries, guests): height opens so the rows
 * below make room instead of jumping. Use with `<AnimatePresence initial={false}>`.
 */
export function collapse(reduceMotion) {
  if (reduceMotion) return { initial: { opacity: 0 }, animate: { opacity: 1, transition: fade }, exit: { opacity: 0, transition: fade } };
  return {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: 'auto', transition: { duration: 0.24, ease: EASE_OUT_EXPO } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.16, ease: 'easeIn' } },
  };
}

/** Wheel: a long decelerating spin, the pointer flicking on each peg. */
export const WHEEL = {
  spin: { duration: 4.4, ease: [0.12, 0.72, 0.1, 1] },
  tick: { duration: 0.22, ease: 'easeOut' },
  tickAngle: -24,
};
