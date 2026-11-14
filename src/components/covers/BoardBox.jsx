import Art, { Sheen } from './Art';

/** "2–4 players · 60 min", printed along the bottom of the box. */
function boxFacts({ minPlayers, maxPlayers, length }) {
  const facts = [];
  if (minPlayers && maxPlayers) facts.push(minPlayers === maxPlayers ? `${minPlayers}p` : `${minPlayers}–${maxPlayers}p`);
  if (length) facts.push(`${length}′`);
  return facts;
}

/** A game box seen from the front: lid with a lip at the bottom, shaded corners. Card games are tuck boxes. */
export default function BoardBox({ item, cover, image }) {
  const facts = boxFacts(item);
  const card = item.format === 'card';
  return (
    <div className={`cv-box ${card ? 'cv-box--card' : ''}`}>
      <div className="cv-box__lid">
        <Art
          cover={cover}
          title={item.title}
          creator={item.creator}
          image={image}
          className="cv-box__art"
          footer={
            facts.length > 0 && (
              <span className="cv-box__facts">
                {facts.map((fact) => (
                  <span key={fact}>{fact}</span>
                ))}
              </span>
            )
          }
        />
        {card && <div className="cv-box__flap" />}
        <div className="cv-box__rim" />
        <Sheen />
      </div>
    </div>
  );
}
