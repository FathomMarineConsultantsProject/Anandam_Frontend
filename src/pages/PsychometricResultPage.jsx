import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import AppLayout
  from "../components/layout/AppLayout";

import PsychometricTokenModal
  from "../components/psychometrics/PsychometricTokenModal";

import {
  getPsychometricResults,
  unlockPsychometricAnswers,
  getPsychometricErrorMessage,
} from "../api/psychometricApi";

import "../styles/psychometrics.css";


function scoreText(
  score,
  maximum
) {
  return `${Number(
    score || 0
  )} / ${Number(
    maximum || 0
  )}`;
}


export default function PsychometricResultPage() {
  const {
    testCode,
    attemptId,
  } = useParams();

  const navigate =
    useNavigate();

  const [
    results,
    setResults,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    tokenModal,
    setTokenModal,
  ] = useState(false);

  const [
    unlocking,
    setUnlocking,
  ] = useState(false);

  const [
    unlockError,
    setUnlockError,
  ] = useState("");


  async function load() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getPsychometricResults(
          attemptId
        );

      setResults(
        data
      );
    } catch (loadError) {
      setError(
        getPsychometricErrorMessage(
          loadError,
          "Unable to load assessment results."
        )
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    load();
  }, [attemptId]);


  const test =
    results?.test ||
    results?.attempt?.test ||
    {};


  const percentage =
    Math.round(
      Number(
        results?.percentage ??
        results?.attempt
          ?.percentage ??
        0
      )
    );


  const sections =
    useMemo(
      () =>
        results
          ?.sections ||
        results
          ?.sectionScores ||
        results?.attempt
          ?.sections ||
        [],
      [results]
    );


  const traitResults =
    useMemo(
      () =>
        results
          ?.traits ||
        results
          ?.traitScores ||
        [],
      [results]
    );


  const answersUnlocked =
    Boolean(
      results
        ?.answersUnlocked ||
      results
        ?.correctAnswersUnlocked
    );


  const answerReview =
    results
      ?.answers ||
    results
      ?.answerReview ||
    [];


  const isMaritime =
    test?.type ===
      "MARITIME_HUMAN_PERFORMANCE" ||
    sections.length > 0;


  async function unlockAnswers() {
    if (unlocking) {
      return;
    }

    try {
      setUnlocking(true);
      setUnlockError("");

      const updated =
        await unlockPsychometricAnswers(
          attemptId
        );

      setResults(
        (current) => ({
          ...current,
          ...updated,

          answersUnlocked:
            true,
        })
      );

      setTokenModal(
        false
      );
    } catch (unlockErrorValue) {
      setUnlockError(
        getPsychometricErrorMessage(
          unlockErrorValue,
          "Unable to unlock the correct answers."
        )
      );
    } finally {
      setUnlocking(false);
    }
  }


  function contactAnandam() {
    const email =
      import.meta.env
        .VITE_ANANDAM_CONTACT_EMAIL;

    if (!email) {
      setUnlockError(
        "Anandam contact email is not configured."
      );

      return;
    }

    window.location.href =
      `mailto:${email}`;
  }


  if (loading) {
    return (
      <AppLayout>
        <main className="psychometric-page">
          <div className="psychometric-loading">
            Loading results...
          </div>
        </main>
      </AppLayout>
    );
  }


  if (error) {
    return (
      <AppLayout>
        <main className="psychometric-page">
          <div className="psychometric-loading">
            {error}
          </div>
        </main>
      </AppLayout>
    );
  }


  return (
    <AppLayout>
      <main className="psychometric-result-page">
        <div className="psychometric-result-shell">
          <header className="psychometric-result-header">
            <h1>
              Assessment complete
            </h1>

            <p>
              Your responses have
              been submitted
              successfully
            </p>
          </header>


          <section className="psychometric-result-card">
            <div className="psychometric-total-score">
              <strong>
                {percentage}%
              </strong>

              <span>
                Your total score
              </span>
            </div>


            {isMaritime ? (
              <>
                <h2 className="psychometric-breakdown-title">
                  Score Breakdown
                </h2>

                <div className="psychometric-score-grid">
                  {sections.map(
                    (
                      section,
                      index
                    ) => {
                      const info =
                        section
                          ?.section ||
                        section;

                      return (
                        <div
                          className="psychometric-score-card"
                          key={
                            info.id ||
                            info.code ||
                            index
                          }
                        >
                          <span>
                            {info.title ||
                              section.title}
                          </span>

                          <strong>
                            {scoreText(
                              section.score,
                              section.maxScore
                            )}
                          </strong>
                        </div>
                      );
                    }
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="psychometric-breakdown-title">
                  Your Results
                </h2>

                <div className="psychometric-score-grid">
                  {traitResults.map(
                    (
                      trait,
                      index
                    ) => (
                      <div
                        className="psychometric-score-card"
                        key={
                          trait.key ||
                          trait.name ||
                          index
                        }
                      >
                        <span>
                          {
                            trait.label ||
                            trait.name ||
                            trait.key
                          }
                        </span>

                        <strong>
                          {trait.percentage !==
                          undefined
                            ? `${Math.round(
                                trait.percentage
                              )}%`
                            : trait.score}
                        </strong>
                      </div>
                    )
                  )}
                </div>
              </>
            )}


            {isMaritime ? (
              <section
                className={`psychometric-answer-review ${
                  !answersUnlocked
                    ? "is-locked"
                    : ""
                }`}
              >
                <div className="psychometric-answer-review__content">
                  {answerReview.length ? (
                    answerReview.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          className="psychometric-review-row"
                          key={
                            item.id ||
                            item.questionId ||
                            index
                          }
                        >
                          <strong>
                            Question{" "}
                            {index + 1}
                          </strong>

                          <span>
                            Your answer:{" "}
                            {item.selectedOption ||
                              "—"}
                          </span>

                          <span>
                            Correct answer:{" "}
                            {item.correctOption ||
                              "—"}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <>
                      <div className="psychometric-review-placeholder" />
                      <div className="psychometric-review-placeholder" />
                      <div className="psychometric-review-placeholder" />
                      <div className="psychometric-review-placeholder" />
                    </>
                  )}
                </div>


                {!answersUnlocked ? (
                  <div className="psychometric-unlock-card">
                    <div className="psychometric-token-coin">
                      <span>
                        U
                      </span>
                    </div>

                    <h2>
                      View Correct
                      Answers
                    </h2>

                    <p>
                      Unlock the correct
                      answers for this
                      assessment.
                    </p>

                    <div className="psychometric-unlock-card__actions">
                      <button
                        type="button"
                        className="psychometric-button psychometric-button--outline"
                        onClick={
                          contactAnandam
                        }
                      >
                        Contact anandam
                      </button>

                      <button
                        type="button"
                        className="psychometric-button"
                        onClick={() =>
                          setTokenModal(
                            true
                          )
                        }
                      >
                        Use 1 Token
                      </button>
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}
          </section>


          <div className="psychometric-result-actions">
            <button
              type="button"
              className="psychometric-button"
              onClick={() =>
                navigate(
                  "/app/wellbeing"
                )
              }
            >
              Back to Personal
              Analysis &amp;
              Development
            </button>
          </div>
        </div>


        <PsychometricTokenModal
          open={
            tokenModal
          }
          loading={
            unlocking
          }
          error={
            unlockError
          }
          onClose={() => {
            setTokenModal(
              false
            );

            setUnlockError(
              ""
            );
          }}
          onContact={
            contactAnandam
          }
          onUnlock={
            unlockAnswers
          }
        />
      </main>
    </AppLayout>
  );
}