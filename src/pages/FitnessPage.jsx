// src/pages/FitnessPage.jsx
import { useState } from 'react';
import '../styles/fitness.css';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/layout/BottomNav';
import FitnessDashboard from '../components/fitness/FitnessDashboard';
import FitnessWorkouts from '../components/fitness/FitnessWorkouts';
import FitnessVRGym from '../components/fitness/FitnessVRGym';
import FitnessProgress from '../components/fitness/FitnessProgress';
import FitnessChallenges from '../components/fitness/FitnessChallenges';
import WorkoutToast from '../components/fitness/WorkoutToast';
import WorkoutSession from '../components/fitness/WorkoutSession';
import { fitnessPageMockData } from '../data/fitnessData';
import { homePageMockData } from '../data/homeData';

const TABS = [
  { id: 'dashboard',  label: 'Dashboard'  },
  { id: 'workouts',   label: 'Workouts'   },
  { id: 'vr-gym',     label: 'VR Gym'     },
  { id: 'progress',   label: 'Progress'   },
  { id: 'challenges', label: 'Challenges' },
];

function FitnessPage() {
  const [activeTab, setActiveTab]         = useState('dashboard');
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [toast, setToast]                 = useState(null);
  const [showSession, setShowSession]     = useState(false);

  const data = fitnessPageMockData;

  function handleStartWorkout(workout) {
    setActiveWorkout(workout);
    setShowSession(true);
    setToast({ message: `${workout.name} session begun` });
    setTimeout(() => setToast(null), 3000);
  }

  function handleStopWorkout() {
    setShowSession(false);
    setActiveWorkout(null);
  }

  return (
    <div className="app-shell">
      <AppHeader header={homePageMockData.header} />

      <main className="page-content fitness-page">
        <div className="fitness-tab-bar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`fitness-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard'  && <FitnessDashboard data={data.dashboard} onStartWorkout={handleStartWorkout} />}
        {activeTab === 'workouts'   && <FitnessWorkouts  workouts={data.workouts} onStartWorkout={handleStartWorkout} />}
        {activeTab === 'vr-gym'     && <FitnessVRGym     vrGym={data.vrGym} vrWorkouts={data.vrWorkouts} onStartWorkout={handleStartWorkout} />}
        {activeTab === 'progress'   && <FitnessProgress  progress={data.progress} />}
        {activeTab === 'challenges' && <FitnessChallenges challenges={data.challenges} />}
      </main>

      {showSession && activeWorkout && (
        <WorkoutSession workout={activeWorkout} onStop={handleStopWorkout} />
      )}
      {toast && (
        <WorkoutToast title="Workout Started" message={toast.message} onClose={() => setToast(null)} />
      )}

      <BottomNav navigation={homePageMockData.navigation} />
    </div>
  );
}

export default FitnessPage;