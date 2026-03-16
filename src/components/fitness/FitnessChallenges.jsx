// src/components/fitness/FitnessChallenges.jsx
// Original: Monthly Challenges with progress bars
// Our additions: active challenges with badges, available challenges, leaderboard

import { Trophy, Plus } from 'lucide-react';

const DIFF_META = {
  easy:   { cls: 'diff-easy',   label: 'Easy'   },
  medium: { cls: 'diff-medium', label: 'Medium' },
  hard:   { cls: 'diff-hard',   label: 'Hard'   },
};

const COLOR_MAP = {
  blue:   { bar: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  orange: { bar: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
};

// Original page monthly challenges
const MONTHLY_CHALLENGES = [
  { id: 'nautical',  name: 'Nautical November', desc: 'Complete 20 maritime workouts',  current: 15, target: 20, daysLeft: '5 days left',      color: '#3b82f6', valueColor: '#3b82f6' },
  { id: 'sea-legs',  name: 'Sea Legs Challenge', desc: 'Improve balance and stability',  current: 8,  target: 10, daysLeft: '2 sessions left',   color: '#3b82f6', valueColor: '#22c55e' },
  { id: 'crew',      name: 'Crew Fitness',        desc: 'Team workout challenge',         current: 3,  target: 6,  daysLeft: 'Join your crew',    color: '#3b82f6', valueColor: '#8b5cf6' },
];

function MonthlyChallenge({ ch }) {
  const pct = Math.min(100, Math.round((ch.current / ch.target) * 100));
  return (
    <div className="monthly-ch-row">
      <div className="monthly-ch-top">
        <div>
          <div className="monthly-ch-name">{ch.name}</div>
          <div className="monthly-ch-desc">{ch.desc}</div>
        </div>
        <div className="monthly-ch-right">
          <span className="monthly-ch-val" style={{ color: ch.valueColor }}>{ch.current}/{ch.target}</span>
          <span className="monthly-ch-days">{ch.daysLeft}</span>
        </div>
      </div>
      <div className="monthly-ch-track">
        <div className="monthly-ch-fill" style={{ width: `${pct}%`, background: ch.color }} />
      </div>
    </div>
  );
}

function ActiveChallenge({ challenge }) {
  const pct = Math.min(100, Math.round((challenge.progress / challenge.target) * 100));
  const c   = COLOR_MAP[challenge.color] || COLOR_MAP.blue;
  return (
    <div className="active-challenge" style={{ background: c.bg, border: `1.5px solid ${c.border}` }}>
      <div className="ac-header">
        <span className="ac-badge">{challenge.badge}</span>
        <div className="ac-info">
          <h3 className="ac-name">{challenge.name}</h3>
          <p className="ac-desc">{challenge.description}</p>
        </div>
        <div className="ac-reward">{challenge.reward}</div>
      </div>
      <div className="ac-progress">
        <div className="ac-track"><div className="ac-fill" style={{ width: `${pct}%`, background: c.bar }} /></div>
        <div className="ac-progress-row">
          <span style={{ color: c.bar }}>{pct}% complete</span>
          <span className="ac-days">{challenge.daysLeft} days left</span>
        </div>
      </div>
    </div>
  );
}

function AvailableChallenge({ challenge }) {
  const diff = DIFF_META[challenge.difficulty] || DIFF_META.medium;
  return (
    <div className="avail-challenge">
      <div className="avail-badge">{challenge.badge}</div>
      <div className="avail-info">
        <div className="avail-title-row">
          <h4 className="avail-name">{challenge.name}</h4>
          <span className={`diff-chip ${diff.cls}`}>{diff.label}</span>
        </div>
        <p className="avail-desc">{challenge.description}</p>
        <div className="avail-meta">
          <span>{challenge.duration}</span><span>•</span>
          <span className="avail-reward">{challenge.reward}</span>
        </div>
      </div>
      <button type="button" className="join-btn"><Plus size={14} strokeWidth={2.5} /> Join</button>
    </div>
  );
}

function LeaderboardRow({ entry }) {
  const rankClass = entry.rank <= 3 ? `rank-${entry.rank}` : '';
  return (
    <div className={`lb-row ${entry.isUser ? 'lb-row-user' : ''}`}>
      <span className={`lb-rank ${rankClass}`}>{entry.rank}</span>
      <div className="lb-avatar">{entry.initials}</div>
      <div className="lb-info">
        <span className="lb-name">{entry.name}{entry.isUser ? ' (You)' : ''}</span>
        <span className="lb-ship">{entry.ship}</span>
      </div>
      <span className="lb-points">{entry.points.toLocaleString()} pts</span>
    </div>
  );
}

function FitnessChallenges({ challenges }) {
  if (!challenges) return null;
  return (
    <div className="fitness-section">

      {/* Original: Monthly Challenges */}
      <div className="fitness-card">
        <h2 className="section-title">Monthly Challenges</h2>
        <div className="monthly-ch-list">
          {MONTHLY_CHALLENGES.map((ch) => <MonthlyChallenge key={ch.id} ch={ch} />)}
        </div>
      </div>

      {/* Our addition: Active Challenges with badges */}
      <div className="fitness-card">
        <h2 className="section-title">Active Challenges</h2>
        <div className="active-challenges-list">
          {challenges.active.map((c) => <ActiveChallenge key={c.id} challenge={c} />)}
        </div>
      </div>

      {/* Our addition: Available Challenges */}
      <div className="fitness-card">
        <h2 className="section-title">Available Challenges</h2>
        <div className="avail-challenges-list">
          {challenges.available.map((c) => <AvailableChallenge key={c.id} challenge={c} />)}
        </div>
      </div>

      {/* Our addition: Leaderboard */}
      <div className="fitness-card">
        <div className="lb-header">
          <Trophy size={18} strokeWidth={2} className="lb-trophy" />
          <h2 className="section-title" style={{margin:0}}>Ship Leaderboard</h2>
        </div>
        <div className="lb-list">
          {challenges.leaderboard.map((e) => <LeaderboardRow key={e.rank} entry={e} />)}
        </div>
      </div>

    </div>
  );
}

export default FitnessChallenges;