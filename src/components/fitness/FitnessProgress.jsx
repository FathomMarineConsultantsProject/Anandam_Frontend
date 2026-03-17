// src/components/fitness/FitnessProgress.jsx
import { Clock, Flame, TrendingUp, Headset, Award, Heart, Target, Activity } from 'lucide-react';

const ICON_MAP = { clock: Clock, flame: Flame, trending: TrendingUp, vr: Headset };

const COLOR_MAP = {
  blue:   { bar: '#3b82f6', bg: '#eff6ff', text: '#1d4ed8' },
  green:  { bar: '#22c55e', bg: '#f0fdf4', text: '#15803d' },
  orange: { bar: '#f97316', bg: '#fff7ed', text: '#c2410c' },
  purple: { bar: '#a855f7', bg: '#faf5ff', text: '#7e22ce' },
};

const DAILY_GOALS = [
  { id: 'move',     label: 'Move Goal',     current: 67,   target: 60,    unit: 'min', color: '#3b82f6' },
  { id: 'steps',    label: 'Steps Goal',    current: 8247, target: 10000, unit: '',    color: '#3b82f6' },
  { id: 'calories', label: 'Calories Goal', current: 1842, target: 2000,  unit: '',    color: '#3b82f6' },
];

const ACHIEVEMENTS = [
  { id: 'streak',   name: '5 Day Streak',  desc: 'Workout consistency',       icon: Award,    color: '#f59e0b', bg: '#fffbeb' },
  { id: 'maritime', name: 'Maritime Fit',  desc: 'Completed 10 sea workouts', icon: Target,   color: '#3b82f6', bg: '#eff6ff' },
  { id: 'steps',    name: 'Step Master',   desc: '10,000 steps in a day',     icon: Activity, color: '#22c55e', bg: '#f0fdf4' },
  { id: 'zen',      name: 'Zen Sailor',    desc: '5 yoga sessions',           icon: Heart,    color: '#a855f7', bg: '#faf5ff' },
];

function DailyGoalRow({ goal }) {
  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
  const display = goal.unit
    ? `${goal.current}/${goal.target} ${goal.unit}`
    : `${goal.current.toLocaleString()}/${goal.target.toLocaleString()}`;
  return (
    <div className="orig-goal-row">
      <div className="orig-goal-top">
        <span className="orig-goal-label">{goal.label}</span>
        <span className="orig-goal-val">{display}</span>
      </div>
      <div className="orig-goal-track">
        <div className="orig-goal-fill" style={{ width: `${pct}%`, background: goal.color }} />
      </div>
    </div>
  );
}

function WeeklyBar({ day, minutes, max }) {
  const pct = max ? (minutes / max) * 100 : 0;
  return (
    <div className="weekly-bar-col">
      <div className="weekly-bar-track">
        <div className="weekly-bar-fill" style={{ height: `${pct}%` }} />
      </div>
      <span className="weekly-bar-label">{day}</span>
      {minutes > 0 && <span className="weekly-bar-value">{minutes}m</span>}
    </div>
  );
}

function GoalRow({ goal }) {
  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
  const c   = COLOR_MAP[goal.color] || COLOR_MAP.blue;
  return (
    <div className="goal-row">
      <div className="goal-row-top">
        <span className="goal-label">{goal.label}</span>
        <span className="goal-pct" style={{ color: c.text }}>{pct}%</span>
      </div>
      <div className="goal-track">
        <div className="goal-fill" style={{ width: `${pct}%`, background: c.bar }} />
      </div>
      <div className="goal-row-bottom">
        <span className="goal-current" style={{ color: c.text }}>{goal.current.toLocaleString()} {goal.unit}</span>
        <span className="goal-target">/ {goal.target.toLocaleString()} {goal.unit}</span>
      </div>
    </div>
  );
}

function PBCard({ pb }) {
  const Icon = ICON_MAP[pb.icon] || TrendingUp;
  return (
    <div className="pb-card">
      <Icon size={18} strokeWidth={2} className="pb-icon" />
      <div className="pb-value">{pb.value}</div>
      <div className="pb-label">{pb.label}</div>
    </div>
  );
}

function FitnessProgress({ progress }) {
  if (!progress) return null;
  const { weeklyStats, weeklyChart, monthlyGoals, personalBests } = progress;
  const maxMinutes = Math.max(...weeklyChart.map(d => d.minutes), 1);

  return (
    <div className="fitness-section">
      {/* Original: Weekly Progress goal bars */}
      <div className="fitness-card">
        <h2 className="section-title">Weekly Progress</h2>
        <div className="orig-goals-list">
          {DAILY_GOALS.map((g) => <DailyGoalRow key={g.id} goal={g} />)}
        </div>
      </div>

      {/* Original: Achievements grid */}
      <div className="fitness-card">
        <h2 className="section-title">Achievements</h2>
        <div className="ach-grid">
          {ACHIEVEMENTS.map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.id} className="ach-card" style={{ background: a.bg }}>
                <Icon size={28} strokeWidth={2} style={{ color: a.color }} />
                <div className="ach-name">{a.name}</div>
                <div className="ach-desc">{a.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Our: This Week summary + bar chart */}
      <div className="fitness-card weekly-summary-card">
        <div className="ws-header">
          <h2 className="section-title" style={{ margin: 0 }}>This Week</h2>
          <span className="ws-change"><TrendingUp size={14} /> {weeklyStats.change}</span>
        </div>
        <div className="ws-stats">
          <div className="ws-stat"><span className="ws-val">{weeklyStats.workouts}</span><span className="ws-lbl">Workouts</span></div>
          <div className="ws-stat"><span className="ws-val">{weeklyStats.totalMinutes}</span><span className="ws-lbl">Minutes</span></div>
          <div className="ws-stat"><span className="ws-val">{weeklyStats.totalCalories.toLocaleString()}</span><span className="ws-lbl">Calories</span></div>
          <div className="ws-stat"><span className="ws-val">{weeklyStats.avgHeartRate}</span><span className="ws-lbl">Avg BPM</span></div>
        </div>
        <div className="weekly-chart">
          {weeklyChart.map((d) => (
            <WeeklyBar key={d.day} day={d.day} minutes={d.minutes} max={maxMinutes} />
          ))}
        </div>
      </div>

      {/* Our: Monthly Goals */}
      <div className="fitness-card">
        <h2 className="section-title">Monthly Goals</h2>
        <div className="goals-list">
          {monthlyGoals.map((g) => <GoalRow key={g.id} goal={g} />)}
        </div>
      </div>

      {/* Our: Personal Bests */}
      <div className="fitness-card">
        <h2 className="section-title">Personal Bests</h2>
        <div className="pb-grid">
          {personalBests.map((pb) => <PBCard key={pb.id} pb={pb} />)}
        </div>
      </div>
    </div>
  );
}

export default FitnessProgress;