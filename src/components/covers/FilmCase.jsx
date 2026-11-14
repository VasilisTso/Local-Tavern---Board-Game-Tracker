import { Play } from 'lucide-react';
import Art, { Sheen } from './Art';

/** A film: Blu-ray or DVD keep-case, a series box set showing its cases from the side, or a streaming tile. */
export default function FilmCase({ item, cover, image }) {
  const art = <Art cover={cover} title={item.title} creator={item.creator} image={image} />;

  if (item.format === 'digital') {
    return (
      <div className="cv-tile">
        {art}
        <span className="cv-tile__chip cv-tile__chip--round">
          <Play aria-hidden="true" />
        </span>
        <Sheen />
      </div>
    );
  }

  if (item.format === 'series') {
    return (
      <div className="cv-boxset">
        <div className="cv-boxset__cases">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="cv-boxset__front">
          {art}
          <Sheen />
        </div>
      </div>
    );
  }

  const bluray = item.format === 'bluray';
  return (
    <div className={`cv-case ${bluray ? 'cv-case--bluray' : 'cv-case--dvd'}`}>
      <div className="cv-case__hinge" />
      <div className="cv-case__insert">
        {bluray && <div className="cv-case__banner">Blu-ray</div>}
        {art}
      </div>
      <div className="cv-case__sleeve" />
    </div>
  );
}
