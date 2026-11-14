import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { SPRING } from '../lib/motion';

/**
 * ARIA tabs (automatic activation). Arrow keys move between tabs, Home/End jump to the ends.
 * Pair with `TabPanel` so ids and labels line up.
 */
export default function Tabs({ tabs, active, onChange, label }) {
  const refs = useRef({});
  const reduceMotion = useReducedMotion();

  const onKeyDown = (event) => {
    const index = tabs.findIndex((t) => t.id === active);
    let next = null;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    if (next == null) return;
    event.preventDefault();
    const id = tabs[next].id;
    onChange(id);
    refs.current[id]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className="-mb-px flex gap-1" onKeyDown={onKeyDown}>
      {tabs.map(({ id, label: tabLabel, icon: Icon, badge, badgeLabel }) => {
        const selected = id === active;
        return (
          <button
            key={id}
            ref={(el) => {
              refs.current[id] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={selected}
            aria-controls={`panel-${id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(id)}
            className={`relative inline-flex h-12 items-center gap-2 px-3 text-sm font-semibold transition-colors duration-150 sm:px-4 sm:text-base ${
              selected ? 'text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            {Icon && <Icon aria-hidden="true" className="size-4 shrink-0" strokeWidth={2} />}
            <span>{tabLabel}</span>
            {badge != null && (
              <span className="tabular rounded-sm bg-raised px-1.5 text-xs font-semibold text-muted">
                {badge}
                {badgeLabel && <span className="sr-only"> {badgeLabel}</span>}
              </span>
            )}
            {selected && (
              <motion.span
                layoutId="tab-underline"
                aria-hidden="true"
                className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent"
                transition={reduceMotion ? { duration: 0 } : SPRING.indicator}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Panel for a tab. Inactive panels stay mounted (hidden) so filters and spins survive tab switches. */
export function TabPanel({ id, active, className = '', children }) {
  return (
    <section
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      hidden={id !== active}
      tabIndex={-1}
      className={`outline-none ${className}`}
    >
      {children}
    </section>
  );
}
