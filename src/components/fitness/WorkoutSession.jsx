// src/components/fitness/WorkoutSession.jsx
// ---------------------------------------------------------------------------
// Active workout session overlay with timer, pause, and stop controls.
// Appears as a full-screen overlay when a workout is started.
// ---------------------------------------------------------------------------

import { useState, useEffect, useRef } from 'react';
import { Pause, Play, Square, X, Clock, Flame, Zap } from 'lucide-react';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function WorkoutSession({ workout, onStop }) {
  const [elapsed, setElapsed] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!paused) {
      intervalRef.current = setInterval(() => setElapsed(t => t + 1), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [paused]);

  // Estimated calories: linear based on workout duration target
  const caloriesEst = Math.round((elapsed / (workout.duration * 60)) * workout.calories);

  function handleStop() {
    clearInterval(intervalRef.current);
    onStop();
  }

  return (
    <div className="workout-session-overlay">
      <div className="session-backdrop" onClick={handleStop} />
      <div className="session-panel">
        {/* Close */}
        <button type="button" className="session-close" onClick={handleStop} aria-label="Close">
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Header */}
        <div className="session-header">
          <div className={`session-status-dot ${paused ? 'paused' : 'active'}`} />
          <span className="session-status-text">{paused ? 'Paused' : 'In Progress'}</span>
        </div>

        {/* Workout name */}
        <h2 className="session-name">{workout.name}</h2>
        <p className="session-desc">{workout.description}</p>

        {/* Timer */}
        <div className="session-timer">
          <Clock size={20} strokeWidth={2} className="session-timer-icon" />
          <span className="session-timer-value">{formatTime(elapsed)}</span>
        </div>

        {/* Live stats */}
        <div className="session-stats">
          <div className="session-stat">
            <Flame size={16} strokeWidth={2} />
            <span className="ss-value">{caloriesEst}</span>
            <span className="ss-label">cal burned</span>
          </div>
          <div className="session-stat">
            <Zap size={16} strokeWidth={2} />
            <span className="ss-value">{workout.intensity}</span>
            <span className="ss-label">intensity</span>
          </div>
        </div>

        {/* Exercises */}
        <div className="session-exercises">
          <p className="exercises-label">Exercises</p>
          {workout.exercises.map((ex, i) => (
            <p key={i} className="exercise-item">• {ex}</p>
          ))}
        </div>

        {/* Controls */}
        <div className="session-controls">
          <button
            type="button"
            className="session-btn pause-btn"
            onClick={() => setPaused(p => !p)}
          >
            {paused
              ? <><Play size={16} strokeWidth={2.5} /> Resume</>
              : <><Pause size={16} strokeWidth={2.5} /> Pause</>
            }
          </button>
          <button
            type="button"
            className="session-btn stop-btn"
            onClick={handleStop}
          >
            <Square size={16} strokeWidth={2.5} />
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkoutSession;