import {
  useEffect,
  useState,
} from "react";

import {
  ClipboardList,
  RefreshCw,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";

import {
  getWellbeingQuestionnaires,
  getWellbeingQuestionnaireErrorMessage,
} from "../api/wellbeingQuestionnaireApi";

import {
  getQuestionnaireIllustration,
} from "../utils/questionnaireAssets";

import "../styles/wellbeing-questionnaires.css";


function QuestionnaireCard({
  questionnaire,
  onOpen,
}) {
  const version =
    questionnaire?.version || {};

  const eligibility =
    questionnaire?.eligibility;

  const canSubmit =
    eligibility?.canSubmit !== false;

  const daysRemaining =
    Number(
      eligibility?.daysRemaining || 0
    );

  const illustration =
    getQuestionnaireIllustration(
      questionnaire
    );


  return (
    <article className="wellbeing-list-card">

      <div className="wellbeing-list-card__main">

        {illustration ? (
          <img
            src={illustration}
            alt=""
            aria-hidden="true"
            className="wellbeing-list-card__illustration"
          />
        ) : null}


        <div className="wellbeing-list-card__content">

          <h2>
            {version.title ||
              "Wellbeing check-in"}
          </h2>

          <p className="wellbeing-list-card__description">
            {version.subtitle ||
              version.description ||
              "Take a moment to check in with yourself."}
          </p>


          <div className="wellbeing-list-card__questions">
            <ClipboardList
              size={18}
              strokeWidth={1.5}
              aria-hidden="true"
            />

            <span>
              {questionnaire?.questionCount || 0}{" "}
              {(questionnaire?.questionCount || 0) === 1
                ? "question"
                : "questions"}
            </span>
          </div>

        </div>
      </div>


      <div className="wellbeing-list-card__action">

        <button
          type="button"
          className="wellbeing-primary-button"
          disabled={!canSubmit}
          onClick={() =>
            onOpen(questionnaire)
          }
        >
          {canSubmit
            ? "Start Check-in"
            : daysRemaining > 0
            ? `Available in ${daysRemaining} ${
                daysRemaining === 1
                  ? "day"
                  : "days"
              }`
            : "Completed"}
        </button>

      </div>

    </article>
  );
}


function QuestionnaireSkeleton() {
  return (
    <div className="wellbeing-list-card wellbeing-list-card--skeleton">
      <div className="wellbeing-skeleton wellbeing-skeleton--illustration" />

      <div className="wellbeing-list-card__content">
        <div className="wellbeing-skeleton wellbeing-skeleton--title" />
        <div className="wellbeing-skeleton wellbeing-skeleton--text" />
        <div className="wellbeing-skeleton wellbeing-skeleton--small" />
      </div>
    </div>
  );
}


export default function WellbeingQuestionnairesPage() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    questionnaires,
    setQuestionnaires,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    notice,
    setNotice,
  ] = useState(
    location.state?.questionnaireToast ||
      ""
  );


  async function loadQuestionnaires() {
    setLoading(true);
    setError("");

    try {
      const data =
        await getWellbeingQuestionnaires();

      setQuestionnaires(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (loadError) {
      setError(
        getWellbeingQuestionnaireErrorMessage(
          loadError,
          "We couldn't load your wellbeing check-ins right now."
        )
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadQuestionnaires();
  }, []);


  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer =
      window.setTimeout(
        () => setNotice(""),
        3500
      );

    return () =>
      window.clearTimeout(timer);
  }, [notice]);


  function handleOpen(
    questionnaire
  ) {
    if (!questionnaire?.slug) {
      return;
    }

    if (
      questionnaire?.eligibility
        ?.canSubmit === false
    ) {
      return;
    }

    navigate(
      `/app/wellbeing/${encodeURIComponent(
        questionnaire.slug
      )}`
    );
  }


  return (
    <AppLayout>
      <main className="wellbeing-page">

        <div className="wellbeing-shell">

          {notice ? (
            <div
              className="wellbeing-toast"
              role="status"
            >
              {notice}
            </div>
          ) : null}


          <header className="wellbeing-page-header">
            <h1>Your Wellbeing</h1>

            <p>
              A little perspective for your day.
            </p>
          </header>


          {error ? (
            <div className="wellbeing-error-panel">
              <span>{error}</span>

              <button
                type="button"
                onClick={loadQuestionnaires}
              >
                <RefreshCw
                  size={16}
                  strokeWidth={1.6}
                />

                Retry
              </button>
            </div>
          ) : null}


          <section
            className="wellbeing-list"
            aria-busy={loading}
          >

            {loading ? (
              <>
                <QuestionnaireSkeleton />
                <QuestionnaireSkeleton />
                <QuestionnaireSkeleton />
              </>
            ) : (
              questionnaires.map(
                (questionnaire) => (
                  <QuestionnaireCard
                    key={
                      questionnaire.id ||
                      questionnaire.slug
                    }
                    questionnaire={
                      questionnaire
                    }
                    onOpen={
                      handleOpen
                    }
                  />
                )
              )
            )}

          </section>


          {!loading &&
          !error &&
          questionnaires.length === 0 ? (
            <div className="wellbeing-empty">
              <h2>
                No wellbeing check-ins available
              </h2>

              <p>
                New questionnaires will
                appear here when available.
              </p>
            </div>
          ) : null}

        </div>

      </main>
    </AppLayout>
  );
}