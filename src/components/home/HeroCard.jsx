import { Download, Waves } from 'lucide-react';

function HeroCard({ hero }) {
  if (!hero) return null;

  return (
    <section className="hero-card">
      <div className="hero-top">
        <div className="hero-left">
          <div className="hero-title-row">
            <Waves size={24} strokeWidth={2.3} />
            <h2>Welcome back, {hero.name}!</h2>
          </div>

          <p className="hero-role">
            {hero.role} - {hero.ship}
          </p>

          <div className="hero-port-row">
            <span>Next Port: {hero.nextPort}</span>
            <span>ETA: {hero.eta}</span>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-days">{hero.daysAtSea}</div>
          <div className="hero-days-label">Days at sea</div>
        </div>
      </div>

      <div className="hero-progress-wrap">
        <div className="hero-progress-label-row">
          <span>Contract Progress</span>
          <span>{hero.contractProgress}%</span>
        </div>

        <div className="hero-progress-bar">
          <div
            className="hero-progress-fill"
            style={{ width: `${hero.contractProgress}%` }}
          />
        </div>
      </div>

      <div className="hero-footer">
        <button className="hero-export-btn" type="button">
          <Download size={16} />
          <span>Export Report</span>
        </button>

        <p>{hero.message}</p>
      </div>
    </section>
  );
}

export default HeroCard;