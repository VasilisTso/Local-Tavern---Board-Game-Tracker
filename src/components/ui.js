// Shared class recipes so controls look and behave the same everywhere.

export const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold whitespace-nowrap transition-[background-color,color,border-color,transform] duration-150 motion-safe:active:translate-y-px disabled:pointer-events-none disabled:opacity-50';

export const btnPrimary = `${btnBase} h-10 px-4 bg-accent-fill text-on-accent hover:bg-[oklch(0.84_0.14_74)]`;

export const btnSecondary = `${btnBase} h-10 px-4 border border-line-strong text-ink hover:bg-raised`;

export const btnGhost = `${btnBase} h-10 px-3 text-muted hover:text-ink hover:bg-raised`;

export const iconBtn =
  'inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-raised hover:text-ink';

export const iconBtnDanger =
  'inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-raised hover:text-danger';

export const field =
  'h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-base text-ink transition-colors duration-150 hover:border-muted aria-[invalid=true]:border-danger';

export const label = 'block text-sm font-semibold text-ink';

export const hint = 'text-sm text-muted';

/** Pill used by radio/checkbox chip groups; pair with a visually hidden `peer` input. */
export const chip =
  'inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-md border border-line px-3 text-sm font-medium text-muted transition-colors duration-150 hover:border-line-strong hover:text-ink peer-checked:border-accent peer-checked:bg-raised peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent';
