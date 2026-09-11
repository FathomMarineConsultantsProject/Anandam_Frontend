import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  X,
} from "lucide-react";

import AppHeader from "../components/layout/AppHeader";
import BottomNav from "../components/layout/BottomNav";

import {
  MoodDetails,
  MoodOverview,
} from "../components/mood/full/MoodOverview";

import MoodCheckinWizard from "../components/mood/full/MoodCheckinWizard";

import {
  getFullMoodHistory,
  getMoodCheckinById,
} from "../api/moodCheckinApi";

import "../styles/mood-checkin.css";

function MoodCheckinPage() {
  /*
    overview
    wizard
    details
  */
  const [
    screen,
    setScreen,
  ] = useState("overview");

  const [
    history,
    setHistory,
  ] = useState([]);

  const [
    selectedEntry,
    setSelectedEntry,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);

  const [
    toast,
    setToast,
  ] = useState(null);

  const loadHistory =
    useCallback(
      async (
        showLoader = true
      ) => {
        try {
          if (showLoader) {
            setLoading(true);
          }

          const data =
            await getFullMoodHistory(
              50
            );

          setHistory(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (error) {
          console.error(
            "Failed to load full mood history:",
            error
          );

          setHistory([]);

          setToast({
            type: "error",
            title:
              "Unable to load check-ins",
            message:
              error?.message ||
              "Please try again.",
          });
        } finally {
          if (showLoader) {
            setLoading(false);
          }
        }
      },
      []
    );

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer =
      window.setTimeout(
        () => {
          setToast(null);
        },
        4000
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [toast]);

  function startNewCheckin() {
  setSelectedEntry(null);
  setScreen("wizard");

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "auto",
  });
}

  async function viewDetails(
    entry
  ) {
    if (!entry?.id) {
      return;
    }

    try {
      setDetailLoading(true);

      const details =
        await getMoodCheckinById(
          entry.id
        );

      setSelectedEntry(
        details || entry
      );

      setScreen("details");
    } catch (error) {
      console.error(
        "Failed to load check-in:",
        error
      );

      setToast({
        type: "error",
        title:
          "Unable to open check-in",
        message:
          error?.message ||
          "Please try again.",
      });
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleCompleted() {
    await loadHistory(false);

    setToast({
      type: "success",
      title:
        "Check-in completed",
      message:
        "Your wellbeing check-in has been saved successfully.",
    });

    /*
      Leave the success state visible
      very briefly before returning to history.
    */
    window.setTimeout(() => {
      setScreen("overview");
    }, 700);
  }

  return (
    <div className="app-shell">
      {/* UNIVERSAL HEADER */}
      <AppHeader />

      <main className="full-mood-page">
        <div className="full-mood-container">
          {screen ===
            "overview" && (
            <MoodOverview
              history={history}
              loading={loading}
              onStart={
                startNewCheckin
              }
              onViewDetails={
                viewDetails
              }
            />
          )}

          {screen ===
            "wizard" && (
            <MoodCheckinWizard
              onComplete={
                handleCompleted
              }
            />
          )}

          {screen ===
            "details" &&
            (detailLoading ? (
              <div className="full-mood-loading-card">
                Loading check-in
                details...
              </div>
            ) : (
              <MoodDetails
                entry={
                  selectedEntry
                }
                onBack={() =>
                  setScreen(
                    "overview"
                  )
                }
              />
            ))}
        </div>
      </main>

      {/* UNIVERSAL LEFT NAV */}
      <BottomNav />

      {toast && (
        <div
          className={`full-mood-toast is-${toast.type}`}
          role="status"
        >
          <span className="full-mood-toast__icon">
            {toast.type ===
            "success" ? (
              <CheckCircle2
                size={21}
              />
            ) : (
              <span>!</span>
            )}
          </span>

          <div className="full-mood-toast__content">
            <strong>
              {toast.title}
            </strong>

            <p>
              {toast.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setToast(null)
            }
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

export default MoodCheckinPage;