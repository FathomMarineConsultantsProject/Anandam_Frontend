import { Activity } from 'lucide-react';

function StatsSection({ wellness }) {
  if (!wellness) return null;

  const { title, stats = [] } = wellness;

  return (
    <section className="panel-section">
      <div className="section-heading">
        <Activity size={22} strokeWidth={2} />
        <h2>{title}</h2>
      </div>

      <div className="wellness-stats-grid">
        {stats.map((stat) => (
          <div className="wellness-stat-item" key={stat.id}>
            <div className={`wellness-stat-value ${stat.colorClass}`}>
              {stat.value}
            </div>
            <div className="wellness-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default StatsSection;