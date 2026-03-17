// src/components/fitness/WorkoutToast.jsx
// ---------------------------------------------------------------------------
// Bottom toast notification shown when a workout begins
// Dismissable via X button; auto-dismissed by parent after 3 s
// ---------------------------------------------------------------------------

import { X, CheckCircle } from 'lucide-react';

function WorkoutToast({ title, message, onClose }) {
  return (
    <div className="workout-toast">
      <div className="toast-icon">
        <CheckCircle size={18} strokeWidth={2} />
      </div>
      <div className="toast-body">
        <p className="toast-title">{title}</p>
        <p className="toast-message">{message}</p>
      </div>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Dismiss">
        <X size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export default WorkoutToast;