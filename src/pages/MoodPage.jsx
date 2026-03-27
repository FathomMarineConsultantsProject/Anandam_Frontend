import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/layout/AppHeader";
import BottomNav from "../components/layout/BottomNav";
import MoodScale from "../components/mood/MoodScale";
import MoodHistoryTable from "../components/mood/MoodHistoryTable";
import CloverRain from "../components/mood/CloverRain";
import { getMoodPageData, submitMoodCheck } from "../api/moodApi";
import { homePageMockData } from "../data/homeData";
import { completeMoodGate } from "../utils/storage";
import "../styles/mood.css";

const CLOVER_DURATION_MS = 4200;
const DEFAULT_REDIRECT_MS = 250;

function MoodPage() {
  const navigate = useNavigate();

  const [pageData, setPageData] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [history, setHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCloverRain, setShowCloverRain] = useState(false);

  useEffect(() => {
    async function loadMoodPage() {
      try {
        const data = await getMoodPageData();
        setPageData(data);
        setHistory(data.history || []);
      } catch (error) {
        console.error("Failed to load mood page:", error);
        setPageData({
          pageTitle: "Mood Check-in",
          cardTitle: "How are you feeling today?",
          cardSubtitle: "Your daily mood tracking helps us provide better support",
          submitLabel: "Submit Mood Check",
          tableHeaders: {
            date: "Date",
            mood: "Mood",
          },
          scale: [
            { value: 1, emoji: "😧" },
            { value: 2, emoji: "😟" },
            { value: 3, emoji: "😐" },
            { value: 4, emoji: "😊" },
            { value: 5, emoji: "😄" },
          ],
          history: [],
        });
      }
    }

    loadMoodPage();
  }, []);

  useEffect(() => {
    if (!showCloverRain) return;

    const timer = setTimeout(() => {
      setShowCloverRain(false);
    }, CLOVER_DURATION_MS);

    return () => clearTimeout(timer);
  }, [showCloverRain]);

  const moodNavigation = useMemo(
    () => ({
      ...homePageMockData.navigation,
      activeTab: "mood",
    }),
    []
  );

  async function handleSubmit() {
    if (!selectedMood || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const response = await submitMoodCheck(selectedMood);
      setHistory(response.history || []);

      const isBestMood = selectedMood === 5;

      if (isBestMood) {
        setShowCloverRain(false);
        requestAnimationFrame(() => setShowCloverRain(true));
      }

      completeMoodGate();

      setTimeout(() => {
        navigate("/dashboard");
      }, isBestMood ? CLOVER_DURATION_MS : DEFAULT_REDIRECT_MS);
    } catch (error) {
      console.error("Mood submit failed:", error);
      alert(error.message || "Failed to submit mood check.");
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
              {isSubmitting ? "Submitting..." : pageData.submitLabel}
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