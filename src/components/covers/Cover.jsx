import { useMemo } from 'react';
import { coverFor, frontAspect, spineSize } from '../../lib/cover';
import { kindMeta } from '../../lib/kinds';
import BoardBox from './BoardBox';
import Book from './Book';
import FilmCase from './FilmCase';
import GameCase from './GameCase';
import Record from './Record';
import Spine from './Spine';
import { useCoverImage } from './useCoverImage';
import './covers.css';

const RENDERERS = { BoardBox, Book, GameCase, FilmCase, Record };

/**
 * An item drawn as its real object. Decorative (`aria-hidden`): the title must be present as
 * text or as the accessible name of the control around it.
 *
 * - `view="front"` (default): fills its width; the height follows the object's aspect ratio.
 *   Size it with a width class.
 * - `view="spine"`: the item edge-on, at its natural size in rem times `scale`.
 */
export default function Cover({ item, view = 'front', scale = 1, className = '', style }) {
  const cover = useMemo(() => coverFor(item.title, item.color), [item.title, item.color]);
  const image = useCoverImage(item.coverId, item.coverUrl);
  const vars = { '--cv-base': cover.base, '--cv-spine': cover.spine, '--cv-band': cover.band, '--cv-ink': cover.ink };

  if (view === 'spine') {
    const size = spineSize(item);
    return (
      <div
        aria-hidden="true"
        className={`cv cv--spine ${className}`}
        style={{ ...vars, width: `${size.width * scale}rem`, height: `${size.height * scale}rem`, ...style }}
      >
        <Spine item={item} cover={cover} />
      </div>
    );
  }

  const Renderer = RENDERERS[kindMeta(item.kind).renderer];
  return (
    <div
      aria-hidden="true"
      className={`cv ${className}`}
      style={{ ...vars, aspectRatio: frontAspect(item.kind, item.format), ...style }}
    >
      <Renderer item={item} cover={cover} image={image} />
    </div>
  );
}
