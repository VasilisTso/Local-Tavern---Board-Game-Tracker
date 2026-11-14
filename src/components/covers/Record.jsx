import { Music } from 'lucide-react';
import Art, { Sheen } from './Art';

/** Music: a sleeve with the vinyl peeking out, a CD jewel case, or a streaming tile. */
export default function Record({ item, cover, image }) {
  const art = <Art cover={cover} title={item.title} creator={item.creator} image={image} />;

  if (item.format === 'cd') {
    return (
      <div className="cv-jewel">
        <div className="cv-jewel__hinge" />
        <div className="cv-jewel__booklet">{art}</div>
        <div className="cv-jewel__glare" />
      </div>
    );
  }

  if (item.format === 'digital') {
    return (
      <div className="cv-tile cv-tile--square">
        {art}
        <span className="cv-tile__chip cv-tile__chip--round">
          <Music aria-hidden="true" />
        </span>
        <Sheen />
      </div>
    );
  }

  return (
    <div className="cv-vinyl">
      <div className="cv-vinyl__disc">
        <span className="cv-vinyl__label" />
      </div>
      <div className="cv-vinyl__sleeve">
        {art}
        <Sheen className="cv-sheen--matte" />
      </div>
    </div>
  );
}
