import {
  useEffect,
  useMemo,
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

import AppLayout
  from "../components/layout/AppLayout";

import PsychometricCard
  from "../components/psychometrics/PsychometricCard";

import {
  getWellbeingQuestionnaires,
  getWellbeingQuestionnaireErrorMessage,
} from "../api/wellbeingQuestionnaireApi";

import {
  getPsychometricTests,
  startPsychometricAttempt,
  getPsychometricErrorMessage,
} from "../api/psychometricApi";

import {
  getQuestionnaireIllustration,
} from "../utils/questionnaireAssets";

import "../styles/wellbeing-questionnaires.css";
import "../styles/psychometrics.css";


function QuestionnaireCard({
  questionnaire,
  onOpen,
}) {
  const version =
    questionnaire?.version || {};

  const eligibility =
    questionnaire?.eligibility;

  const canSubmit =
    eligibility?.canSubmit !==
    false;

  const daysRemaining =
    Number(
      eligibility?.daysRemaining ||
        0
    );

  const illustration =
    getQuestionnaireIllustration(
      questionnaire
    );


  return (
    <article className="pad-wellbeing-card">
      {illustration ? (
        <img
          src={illustration}
          alt=""
          aria-hidden="true"
          className="pad-wellbeing-card__image"
        />
      ) : null}

      <div className="pad-wellbeing-card__content">
        <h2>
          {version.title ||
            "Wellbeing check-in"}
        </h2>

        <p>
          {version.subtitle ||
            version.description ||
            "Take a moment to check in with yourself."}
        </p>

        <div className="pad-wellbeing-card__footer">
          <span>
            <ClipboardList
              size={17}
              strokeWidth={1.4}
            />

            {questionnaire
              ?.questionCount || 0}{" "}
            {(questionnaire
              ?.questionCount ||
              0) === 1
              ? "question"
              : "questions"}
          </span>

          <button
            type="button"
            className="psychometric-button"
            disabled={!canSubmit}
            onClick={() =>
              onOpen(
                questionnaire
              )
            }
          >
            {canSubmit
              ? "Get started"
              : daysRemaining > 0
              ? `Available in ${daysRemaining} ${
                  daysRemaining ===
                  1
                    ? "day"
                    : "days"
                }`
              : "Completed"}
          </button>
        </div>
      </div>
    </article>
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
    psychometricTests,
    setPsychometricTests,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    startingId,
    setStartingId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    notice,
    setNotice,
  ] = useState(
    location.state
      ?.questionnaireToast ||
      ""
  );


  async function loadPage() {
    setLoading(true);
    setError("");

    try {
      const [
        wellbeingData,
        psychometricData,
      ] = await Promise.all([
        getWellbeingQuestionnaires(),
        getPsychometricTests(),
      ]);

      setQuestionnaires(
        Array.isArray(
          wellbeingData
        )
          ? wellbeingData
          : []
      );

      setPsychometricTests(
        Array.isArray(
          psychometricData
        )
          ? psychometricData
          : []
      );
    } catch (loadError) {
      setError(
        getPsychometricErrorMessage(
          loadError,
          getWellbeingQuestionnaireErrorMessage(
            loadError,
            "We couldn't load Personal Analysis & Development right now."
          )
        )
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadPage();
  }, []);


  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer =
      window.setTimeout(
        () => {
          setNotice("");
        },
        3500
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [notice]);


  const maritimeTest =
    useMemo(
      () =>
        psychometricTests.find(
          (test) =>
            test.type ===
            "MARITIME_HUMAN_PERFORMANCE"
        ) || null,
      [psychometricTests]
    );


  const personalTests =
    useMemo(
      () =>
        [
          "BIG_FIVE",
          "PERSONALITY_16PF",
          "MOTIVATION_VALUES",
        ]
          .map((type) =>
            psychometricTests.find(
              (test) =>
                test.type ===
                type
            )
          )
          .filter(Boolean),
      [psychometricTests]
    );


  function openWellbeing(
    questionnaire
  ) {
    if (
      !questionnaire?.slug ||
      questionnaire
        ?.eligibility
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


  async function openPsychometric(
    test
  ) {
    if (
      !test?.code ||
      startingId
    ) {
      return;
    }

    /*
      Maritime has a Figma
      introduction / overview
      screen before starting.
    */

    if (
      test.type ===
      "MARITIME_HUMAN_PERFORMANCE"
    ) {
      navigate(
        `/app/wellbeing/psychometrics/${encodeURIComponent(
          test.code
        )}/overview`
      );

      return;
    }


    /*
      Personality tests go
      directly into their
      questionnaire, matching
      the supplied Figma.
    */

    try {
      setStartingId(
        test.id ||
          test.code
      );

      setError("");

      const attempt =
        await startPsychometricAttempt(
          test.code
        );

      if (!attempt?.id) {
        throw new Error(
          "Assessment attempt was not created."
        );
      }

      navigate(
        `/app/wellbeing/psychometrics/${encodeURIComponent(
          test.code
        )}/attempts/${encodeURIComponent(
          attempt.id
        )}`
      );
    } catch (startError) {
      setError(
        getPsychometricErrorMessage(
          startError,
          "Unable to start this assessment."
        )
      );
    } finally {
      setStartingId(null);
    }
  }


  return (
    <AppLayout>
      <main className="pad-page">
        <div className="pad-shell">
          {notice ? (
            <div
              className="wellbeing-toast"
              role="status"
            >
              {notice}
            </div>
          ) : null}

          <header className="pad-page-header">
            <h1>
              Personal Analysis &amp;
              Development
            </h1>

            <p>
              Understand yourself
              better
            </p>
          </header>


          {error ? (
            <div className="pad-error">
              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={
                  loadPage
                }
              >
                <RefreshCw
                  size={16}
                  strokeWidth={1.5}
                />

                Retry
              </button>
            </div>
          ) : null}


          {loading ? (
            <div className="pad-loading">
              Loading...
            </div>
          ) : (
            <>
              {maritimeTest ? (
                <PsychometricCard
                  test={
                    maritimeTest
                  }
                  featured
                  onOpen={
                    openPsychometric
                  }
                />
              ) : null}


              <section className="pad-card-grid">
                {personalTests.map(
                  (test) => (
                    <PsychometricCard
                      key={
                        test.id ||
                        test.code
                      }
                      test={test}
                      onOpen={
                        openPsychometric
                      }
                    />
                  )
                )}
              </section>


              <section className="pad-card-grid pad-card-grid--wellbeing">
                {questionnaires.map(
                  (
                    questionnaire
                  ) => (
                    <QuestionnaireCard
                      key={
                        questionnaire.id ||
                        questionnaire.slug
                      }
                      questionnaire={
                        questionnaire
                      }
                      onOpen={
                        openWellbeing
                      }
                    />
                  )
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </AppLayout>
  );
}