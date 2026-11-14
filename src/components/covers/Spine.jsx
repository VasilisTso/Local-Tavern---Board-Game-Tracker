import { formatMeta, isDigitalFormat } from '../../lib/kinds';

/** Which spine an item shows on the shelf. */
function spineFamily(kind, format) {
  if (isDigitalFormat(format)) return 'digital';
  if (kind === 'book') return 'book';
  if (kind === 'board' || format === 'series') return 'box';
  if (kind === 'music') return format === 'cd' ? 'case' : 'record';
  return 'case';
}

/** Book spines carry the author's surname at the foot, as real ones do. */
const surname = (creator) => creator.trim().split(/\s+/).pop() ?? '';

/**
 * The item seen edge-on: title set bottom-to-top in condensed Bricolage, a cap at the top
 * (bookcloth band, platform banner, box lid edge), and a foot mark. Decorative.
 */
export default function Spine({ item, cover }) {
  const family = spineFamily(item.kind, item.format);
  const Icon = formatMeta(item.kind, item.format).icon;
  const foot = family === 'book' || family === 'record' ? surname(item.creator) : '';

  return (
    <div className={`cv-spine cv-spine--${family} cv-spine--${item.format}`} data-ornament={cover.ornament}>
      <span className="cv-spine__cap" />
      <span className="cv-spine__title">{item.title}</span>
      {foot ? <span className="cv-spine__foot">{foot}</span> : <Icon className="cv-spine__icon" aria-hidden="true" />}
      <span className="cv-spine__round" />
    </div>
  );
}
