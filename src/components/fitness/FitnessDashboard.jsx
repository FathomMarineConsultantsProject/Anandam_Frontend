// src/components/fitness/FitnessDashboard.jsx
import { Heart, Clock, Flame, TrendingUp, Zap, Target, Activity, Headset } from 'lucide-react';

const INTENSITY_META = {
  low:    { label: 'low',    cls: 'badge-low'    },
  medium: { label: 'medium', cls: 'badge-medium' },
  high:   { label: 'high',   cls: 'badge-high'   },
};

const WORKOUT_ICONS = {
  vr: Headset, zap: Zap, heart: Heart, target: Target, activity: Activity,
};

// Matches original app ring sizes
function RingGauge({ ring, size = 88 }) {
  const stroke = 10;
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (ring.value / 100) * circ;
  const c      = size / 2;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
           style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle cx={c} cy={c} r={r} fill="none" stroke={ring.color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', lineHeight: 1 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: ring.color, lineHeight: 1 }}>
          {Math.round(ring.value)}
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', marginTop: 2, letterSpacing: '0.5px' }}>
          {ring.label}
        </div>
      </div>
    </div>
  );
}

function VitalCard({ vital }) {
  const icons    = { heart: Heart, clock: Clock, flame: Flame, trending: TrendingUp };
  const Icon     = icons[vital.icon] || Activity;
  const colorMap = { red: '#ef4444', blue: '#3b82f6', orange: '#f97316', green: '#22c55e' };
  return (
    <div className="vital-card">
      <div className="vital-icon" style={{ color: colorMap[vital.color] }}>
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="vital-value" style={{ color: colorMap[vital.color] }}>{vital.value}</div>
      <div className="vital-label">{vital.label}</div>
    </div>
  );
}

function RecentWorkoutRow({ workout }) {
  const Icon = WORKOUT_ICONS[workout.icon] || Activity;
  const meta = INTENSITY_META[workout.intensity] || INTENSITY_META.medium;
  return (
    <div className="recent-workout-row">
      <div className="rw-icon"><Icon size={16} strokeWidth={2} /></div>
      <div className="rw-info">
        <div className="rw-name">{workout.name}</div>
        <div className="rw-meta">{workout.duration} min • {workout.calories} cal</div>
      </div>
      <span className={`intensity-badge ${meta.cls}`}>{meta.label}</span>
    </div>
  );
}

function FitnessDashboard({ data }) {
  if (!data) return null;
  const { dailyActivity, vitals, recentWorkouts } = data;
  const statColor = { red: '#ef4444', green: '#22c55e', blue: '#3b82f6' };

  return (
    <div className="fitness-section">

      {/* Daily Activity */}
      <div className="fitness-card">
        <div className="fitness-card-header">
          <Activity size={18} strokeWidth={2} />
          <h2>Daily Activity</h2>
        </div>
        <p className="fitness-card-subtitle">Your fitness rings for today</p>

        {/* Rings row — centred with flex, generous vertical breathing room */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, padding: '16px 0 28px' }}>
          {dailyActivity.rings.map((ring) => (
            <RingGauge key={ring.id} ring={ring} size={88} />
          ))}
        </div>

        {/* Stats */}
        <div className="activity-stats">
          {dailyActivity.stats.map((stat) => (
            <div key={stat.id} className="activity-stat">
              <div className="activity-stat-value" style={{ color: statColor[stat.color] }}>
                {stat.value.toLocaleString()}
              </div>
              <div className="activity-stat-label">{stat.label}</div>
              <div className="activity-stat-goal">{stat.goal}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Vitals */}
      <div className="vitals-row">
        {vitals.map((v) => <VitalCard key={v.id} vital={v} />)}
      </div>

      {/* Recent Workouts */}
      <div className="fitness-card">
        <h2 className="section-title">Recent Workouts</h2>
        <div className="recent-workouts-list">
          {recentWorkouts.map((w) => (
            <RecentWorkoutRow key={w.id} workout={w} />
          ))}
        </div>
      </div>

    </div>
  );
}

export default FitnessDashboard;