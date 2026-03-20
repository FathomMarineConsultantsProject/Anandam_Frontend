import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/layout/BottomNav';
import MoodScale from '../components/mood/MoodScale';
import MoodHistoryTable from '../components/mood/MoodHistoryTable';
import CloverRain from '../components/mood/CloverRain';
import { getMoodPageData, submitMoodCheck } from '../api/moodApi';
import { homePageMockData } from '../data/homeData';
import { completeMoodGate } from '../utils/storage';
import '../styles/mood.css';

// How long the clover rain plays before we navigate away.
// Must be >= the longest animation in CloverRain (duration + delay).
// CSS uses up to ~4200 ms total, so we wait the full duration.
const CLOVER_DURATION_MS = 4200;

// Non-clover mood: navigate almost immediately
const DEFAULT_REDIRECT_MS = 250;

function MoodPage() {
  const navigate = useNavigate();

  const [pageData, setPageData]       = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [history, setHistory]         = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCloverRain, setShowCloverRain] = useState(false);

  useEffect(() => {
    async function loadMoodPage() {
      const data = await getMoodPageData();
      setPageData(data);
      setHistory(data.history);
    }
    loadMoodPage();
  }, []);

  // Auto-hide clover rain after it finishes (safety net — navigate fires first)
  useEffect(() => {
    if (!showCloverRain) return;
    const timer = setTimeout(() => setShowCloverRain(false), CLOVER_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showCloverRain]);

  const moodNavigation = useMemo(() => ({
    ...homePageMockData.navigation,
    activeTab: 'mood',
  }), []);

  async function handleSubmit() {
    if (!selectedMood || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const response = await submitMoodCheck(selectedMood);
      setHistory(response.history);

      const isBestMood = selectedMood === 5;

      if (isBestMood) {
        // Reset then re-trigger so the animation always restarts cleanly
        setShowCloverRain(false);
        requestAnimationFrame(() => setShowCloverRain(true));
      }

      completeMoodGate();

      // Wait the full clover animation before navigating so leaves
      // have time to fall all the way down the screen.
      setTimeout(() => {
        navigate('/app/dashboard');
      }, isBestMood ? CLOVER_DURATION_MS : DEFAULT_REDIRECT_MS);

    } finally {
      setIsSubmitting(false);
    }
  }

  if (!pageData) {
    return (
      <div className="app-shell">
        <AppHeader header={homePageMockData.header} />
        <main className="page-content">
          <div className="mood-page-loading">Loading mood check-in...</div>
        </main>
        <BottomNav navigation={moodNavigation} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <CloverRain active={showCloverRain} />

      <AppHeader header={homePageMockData.header} />

      <main className="page-content mood-page-content">
        <section className="mood-page-section">
          <h1 className="mood-page-title">{pageData.pageTitle}</h1>

          <div className="mood-page-card">
            <h2 className="mood-card-title">{pageData.cardTitle}</h2>
            <p className="mood-card-subtitle">{pageData.cardSubtitle}</p>

            <MoodScale
              items={pageData.scale}
              selectedMood={selectedMood}
              onSelect={setSelectedMood}
            />

            <button
              type="button"
              className="mood-submit-button"
              onClick={handleSubmit}
              disabled={!selectedMood || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : pageData.submitLabel}
            </button>

            <MoodHistoryTable
              headers={pageData.tableHeaders}
              history={history}
            />
          </div>
        </section>
      </main>

      <BottomNav navigation={moodNavigation} />
    </div>
  );
}

export default MoodPage;