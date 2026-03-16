// src/components/fitness/FitnessWorkouts.jsx
// ---------------------------------------------------------------------------
// Workouts tab — grid of workout cards (non-VR workouts)
// ---------------------------------------------------------------------------

import { Clock, Flame, Zap, Heart, Target, Activity, Play } from 'lucide-react';

const INTENSITY_META = {
  low:    { label: 'low',    cls: 'badge-low'    },
  medium: { label: 'medium', cls: 'badge-medium' },
  high:   { label: 'high',   cls: 'badge-high'   },
};

const ICONS = { zap: Zap, heart: Heart, target: Target, activity: Activity };

function WorkoutCard({ workout, onStart }) {
  const Icon = ICONS[workout.icon] || Activity;
  const meta = INTENSITY_META[workout.intensity] || INTENSITY_META.medium;
  const preview = workout.exercises.slice(0, 3);
  const extra   = workout.exercises.length - 3;

  return (
    <div className="workout-card">
      <div className="workout-card-header">
        <div className="workout-card-title-row">
          <Icon size={20} strokeWidth={2} className="workout-card-icon" />
          <h3 className="workout-card-title">{workout.name}</h3>
        </div>
        <span className={`intensity-badge ${meta.cls}`}>{meta.label}</span>
      </div>
      <p className="workout-card-desc">{workout.description}</p>

      <div className="workout-card-stats">
        <span className="workout-stat"><Clock size={14} /> {workout.duration} min</span>
        <span className="workout-stat"><Flame size={14} /> ~{workout.calories} cal</span>
      </div>

      <div className="workout-exercises">
        <p className="exercises-label">Exercises:</p>
        {preview.map((ex, i) => (
          <p key={i} className="exercise-item">• {ex}</p>
        ))}
        {extra > 0 && <p className="exercise-more">+{extra} more</p>}
      </div>

      <button
        type="button"
        className="start-workout-btn"
        onClick={() => onStart(workout)}
      >
        <Play size={14} strokeWidth={2.5} />
        Start Workout
      </button>
    </div>
  );
}

function FitnessWorkouts({ workouts = [], onStartWorkout }) {
  return (
    <div className="fitness-section">
      <div className="workout-grid">
        {workouts.map((w) => (
          <WorkoutCard key={w.id} workout={w} onStart={onStartWorkout} />
        ))}
      </div>
    </div>
  );
}

export default FitnessWorkouts;