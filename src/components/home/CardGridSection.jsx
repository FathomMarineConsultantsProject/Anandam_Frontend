import { iconMap } from '../IconMap';

function CardGridSection({ section, variant = 'default' }) {
  if (!section) return null;

  const isEmergency = variant === 'emergency';
  const isCommunication = variant === 'communication';

  return (
    <section
      className={`panel-section ${isEmergency ? 'panel-section-emergency' : ''}`}
    >
      <div className="section-heading-block">
        <h2 className="section-title-with-icon">
          {isEmergency ? (
            <span className="section-title-icon emergency-title-icon">⚠</span>
          ) : isCommunication ? (
            <span className="section-title-icon">◉</span>
          ) : null}
          <span>{section.title}</span>
        </h2>

        {section.subtitle ? <p className="section-subtitle">{section.subtitle}</p> : null}
      </div>

      <div className="dashboard-grid-two-col">
        {section.cards?.map((card) => {
          const Icon = iconMap[card.icon];

          return (
            <article key={card.id} className={`feature-card ${card.bg}`}>
              <div className={`feature-icon ${card.accent}`}>
                {Icon ? <Icon size={28} strokeWidth={1.9} /> : null}
              </div>

              <div className="feature-text">
                <h3>{card.title}</h3>
                <p>{card.subtitle}</p>
              </div>
            </article>
          );
        })}
      </div>

      {section.ctaLabel ? (
        <button
          type="button"
          className={`section-cta-button ${
            isEmergency ? 'section-cta-button-danger' : ''
          }`}
        >
          {section.ctaLabel}
        </button>
      ) : null}
    </section>
  );
}

export default CardGridSection;