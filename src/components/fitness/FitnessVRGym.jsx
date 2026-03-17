// src/components/fitness/FitnessVRGym.jsx
import { useState } from 'react';
import { Clock, Flame, Play, Star, Users, Headset, Settings, Monitor,
         Wifi, Gamepad2, MapPin, Activity, Target } from 'lucide-react';

const INTENSITY_META = {
  low:    { label: 'low',    cls: 'badge-low'    },
  medium: { label: 'medium', cls: 'badge-medium' },
  high:   { label: 'high',   cls: 'badge-high'   },
};

const VR_EQUIPMENT = [
  { id: 'headset',   name: 'VR Headset',     icon: Headset,  status: 'Ready', detail: 'Battery: 85%',      battery: 85   },
  { id: 'ctrlr',    name: 'Controllers',     icon: Gamepad2, status: 'Ready', detail: 'Battery: 92%',      battery: 92   },
  { id: 'tracking', name: 'Tracking System', icon: Wifi,     status: 'Ready', detail: 'Quality: Excellent', battery: null },
  { id: 'area',     name: 'Play Area',       icon: MapPin,   status: 'Ready', detail: 'Size: 3m x 2m',     battery: null },
];

const VR_STATS = [
  { id: 'sessions', label: 'VR Sessions', value: '12',    color: '#6366f1', bg: '#eef2ff', icon: Headset },
  { id: 'hours',    label: 'Hours in VR', value: '6.5',   color: '#8b5cf6', bg: '#f5f3ff', icon: Clock   },
  { id: 'calories', label: 'VR Calories', value: '1,240', color: '#22c55e', bg: '#f0fdf4', icon: Flame   },
  { id: 'accuracy', label: 'Accuracy',    value: '85%',   color: '#f97316', bg: '#fff7ed', icon: Target  },
];

const VR_ACHIEVEMENTS = [
  { id: 'deep-sea',   name: 'Deep Sea Explorer', desc: 'Completed 5 ocean VR sessions',   icon: Headset,  color: '#6366f1', bg: '#eef2ff' },
  { id: 'warrior',    name: 'VR Warrior',         desc: 'Maritime combat training expert',  icon: Gamepad2, color: '#ef4444', bg: '#fff1f2' },
  { id: 'storm',      name: 'Storm Survivor',     desc: 'Survived 3 VR storm scenarios',   icon: Monitor,  color: '#22c55e', bg: '#f0fdf4' },
  { id: 'port',       name: 'Port Master',         desc: 'Explored 10 virtual ports',       icon: MapPin,   color: '#8b5cf6', bg: '#faf5ff' },
];

function EquipmentCard({ eq }) {
  const Icon = eq.icon;
  return (
    <div className="vr-eq-card">
      <div className="vr-eq-header">
        <div className="vr-eq-title"><Icon size={16} strokeWidth={2} /><span>{eq.name}</span></div>
        <span className="vr-eq-status">{eq.status}</span>
      </div>
      <div className="vr-eq-detail">{eq.detail}</div>
      {eq.battery !== null && (
        <div className="vr-eq-bar-track">
          <div className="vr-eq-bar-fill" style={{ width: `${eq.battery}%` }} />
        </div>
      )}
    </div>
  );
}

function VRWorkoutCard({ workout, onStart }) {
  const meta    = INTENSITY_META[workout.intensity] || INTENSITY_META.medium;
  const preview = workout.exercises.slice(0, 3);
  const extra   = workout.exercises.length - 3;
  return (
    <div className="workout-card vr-workout-card">
      <div className="workout-card-header">
        <div className="workout-card-title-row">
          <Headset size={20} strokeWidth={2} className="workout-card-icon vr-icon" />
          <h3 className="workout-card-title">{workout.name}</h3>
        </div>
        <span className={`intensity-badge ${meta.cls}`}>{meta.label}</span>
      </div>
      <p className="workout-card-desc">{workout.description}</p>
      <div className="workout-card-stats">
        <span className="workout-stat"><Clock size={14} /> {workout.duration} min</span>
        <span className="workout-stat"><Flame size={14} /> ~{workout.calories} cal</span>
      </div>
      {workout.vrEnvironment && (
        <div className="vr-field">
          <span className="vr-field-label">VR Environment:</span>
          <span className="vr-field-value">{workout.vrEnvironment}</span>
        </div>
      )}
      {workout.requiredEquipment && (
        <div className="vr-field">
          <span className="vr-field-label">Required Equipment:</span>
          <span className="vr-field-detail">{workout.requiredEquipment}</span>
        </div>
      )}
      <div className="workout-exercises">
        <p className="exercises-label">VR Exercises:</p>
        {preview.map((ex, i) => (
          <div key={i} className="vr-exercise-item">
            <Headset size={11} strokeWidth={2} className="vr-ex-icon" /><span>{ex}</span>
          </div>
        ))}
        {extra > 0 && <p className="exercise-more">+{extra} more immersive activities</p>}
      </div>
      <div className="vr-card-actions">
        <button type="button" className="start-workout-btn vr-start-btn" onClick={() => onStart(workout)}>
          <Play size={14} strokeWidth={2.5} /> Enter VR
        </button>
        <button type="button" className="vr-headset-btn" aria-label="VR info"><Headset size={16} strokeWidth={2} /></button>
      </div>
    </div>
  );
}

function FitnessVRGym({ vrGym, vrWorkouts = [], onStartWorkout }) {
  return (
    <div className="fitness-section">
      {/* Featured banner */}
      <div className="vr-featured-banner">
        <div className="vr-banner-glow" />
        <div className="vr-banner-content">
          <div className="vr-banner-badge"><Headset size={14} strokeWidth={2} /> VR Featured</div>
          <h2 className="vr-banner-title">{vrGym.featured.name}</h2>
          <p className="vr-banner-tagline">{vrGym.featured.tagline}</p>
          <div className="vr-banner-stats">
            <span><Users size={13} /> {vrGym.featured.stats.users} users</span>
            <span><Star size={13} /> {vrGym.featured.stats.rating}</span>
            <span>{vrGym.featured.stats.sessions} sessions</span>
          </div>
        </div>
      </div>

      {/* Original: VR Equipment Status */}
      <div className="fitness-card">
        <div className="fitness-card-header"><Headset size={20} strokeWidth={2} /><h2>VR Equipment Status</h2></div>
        <p className="fitness-card-subtitle">Virtual Reality fitness equipment diagnostics</p>
        <div className="vr-eq-grid">
          {VR_EQUIPMENT.map((eq) => <EquipmentCard key={eq.id} eq={eq} />)}
        </div>
        <div className="vr-eq-actions">
          <button type="button" className="vr-action-btn"><Settings size={14} /> Calibrate VR</button>
          <button type="button" className="vr-action-btn"><Monitor size={14} /> Test Equipment</button>
        </div>
      </div>

      {/* Original: Virtual Reality Workouts */}
      <div className="fitness-card">
        <div className="fitness-card-header"><Headset size={20} strokeWidth={2} /><h2>Virtual Reality Workouts</h2></div>
        <p className="fitness-card-subtitle">Immersive fitness experiences in virtual environments</p>
        <div className="workout-grid">
          {vrWorkouts.map((w) => <VRWorkoutCard key={w.id} workout={w} onStart={onStartWorkout} />)}
        </div>
      </div>

      {/* Our addition: VR Statistics */}
      <div className="fitness-card">
        <h2 className="section-title">VR Fitness Statistics</h2>
        <div className="vr-stats-grid">
          {VR_STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.id} className="vr-stat-card" style={{ background: s.bg }}>
                <Icon size={22} strokeWidth={2} style={{ color: s.color }} />
                <div className="vr-stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="vr-stat-label">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Our addition: VR Achievements */}
      <div className="fitness-card">
        <h2 className="section-title">VR Achievements</h2>
        <div className="vr-ach-grid">
          {VR_ACHIEVEMENTS.map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.id} className="vr-ach-card" style={{ background: a.bg }}>
                <Icon size={24} strokeWidth={2} style={{ color: a.color }} />
                <div className="vr-ach-name">{a.name}</div>
                <div className="vr-ach-desc">{a.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FitnessVRGym;