// Chip controls shared by the Library toolbar and the Pick filters.
import { useEffect, useRef } from 'react';
import { ChevronDown, Tags } from 'lucide-react';
import { KINDS } from '../lib/kinds';
import { chip } from './ui';

export function ChipGroup({ legend, name, options, value, onChange }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-xs font-semibold text-muted">{legend}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <label key={option.id} title={option.title} className="relative">
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
              className="peer sr-only"
            />
            <span className={chip}>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Kind chips: several can be on; none on means every kind. */
export function KindChips({ value, onChange, legend = 'Show kinds', visibleLegend = false }) {
  const toggle = (id) => onChange(value.includes(id) ? value.filter((k) => k !== id) : [...value, id]);
  return (
    <fieldset className="min-w-0">
      <legend className={visibleLegend ? 'mb-1.5 text-xs font-semibold text-muted' : 'sr-only'}>{legend}</legend>
      <div className="flex flex-wrap gap-1.5">
        {KINDS.map((kind) => {
          const Icon = kind.icon;
          return (
            <label key={kind.id} className="relative">
              <input type="checkbox" checked={value.includes(kind.id)} onChange={() => toggle(kind.id)} className="peer sr-only" />
              <span className={chip}>
                <Icon aria-hidden="true" className="size-4" />
                {kind.plural}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function TagPicker({ tags, selected, onChange, legend = 'Show items with any of these tags' }) {
  const ref = useRef(null);

  // <details> stays open on outside clicks; close it like a menu.
  useEffect(() => {
    const onPointerDown = (event) => {
      if (ref.current?.open && !ref.current.contains(event.target)) ref.current.open = false;
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const onKeyDown = (event) => {
    if (event.key === 'Escape' && ref.current?.open) {
      event.stopPropagation();
      ref.current.open = false;
      ref.current.querySelector('summary')?.focus();
    }
  };

  const toggle = (tag) => onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);

  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-xs font-semibold text-muted" aria-hidden="true">
        Tags
      </p>
      <details ref={ref} className="group relative" onKeyDown={onKeyDown}>
        <summary
          className={`${chip} list-none [&::-webkit-details-marker]:hidden ${selected.length ? 'border-accent bg-raised text-ink' : ''}`}
          aria-label={`Tags${selected.length ? `, ${selected.length} selected` : ''}`}
        >
          <Tags aria-hidden="true" className="size-4" />
          {selected.length ? `${selected.length} selected` : 'Any tag'}
          <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="absolute left-0 z-20 mt-1.5 w-64 max-w-[calc(100vw-2rem)] rounded-md border border-line-strong bg-surface p-1.5 shadow-[0_12px_32px_-12px_oklch(0.1_0.02_55/0.55)]">
          <fieldset>
            <legend className="sr-only">{legend}</legend>
            <div className="max-h-72 overflow-y-auto overscroll-contain">
              {tags.map(({ tag, count }) => (
                <label key={tag} className="flex min-h-10 items-center gap-2.5 rounded-sm px-2 text-sm text-ink hover:bg-raised">
                  <input type="checkbox" checked={selected.includes(tag)} onChange={() => toggle(tag)} className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{tag}</span>
                  <span className="tabular text-xs text-muted">{count}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-1 flex h-9 w-full items-center justify-center rounded-sm border-t border-line text-sm font-semibold text-accent hover:bg-raised"
            >
              Clear tags
            </button>
          )}
        </div>
      </details>
    </div>
  );
}
