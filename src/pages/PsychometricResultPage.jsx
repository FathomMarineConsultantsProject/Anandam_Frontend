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

import tokenCoin
  from "../assets/token coin.png";

import {
  getPsychometricResults,
  unlockPsychometricAnswers,
  getPsychometricErrorMessage,
} from "../api/psychometricApi";

import {
  getMyTokenSummary,
} from "../api/tokenApi";

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


  const [
    walletBalance,
    setWalletBalance,
  ] = useState(0);


  const [
    walletLoading,
    setWalletLoading,
  ] = useState(false);


  // Correct-answer unlock costs
  // exactly one token.
  const ANSWER_UNLOCK_COST =
    1;


  async function loadWallet() {
    try {
      setWalletLoading(
        true
      );


      const wallet =
        await getMyTokenSummary();


      const balance =
        Number(
          wallet?.balance ??
          0
        );


      setWalletBalance(
        balance
      );


      return balance;
    } catch (
      walletError
    ) {
      console.error(
        "Unable to load token balance:",
        walletError
      );


      return 0;
    } finally {
      setWalletLoading(
        false
      );
    }
  }


  async function load() {
    try {
      setLoading(
        true
      );

      setError(
        ""
      );


      const [
        resultData,
        walletData,
      ] =
        await Promise.all([
          getPsychometricResults(
            attemptId
          ),

          getMyTokenSummary()
            .catch(
              () => ({
                balance:
                  0,
              })
            ),
        ]);


      setResults(
        resultData
      );


      setWalletBalance(
        Number(
          walletData
            ?.balance ??
          0
        )
      );
    } catch (
      loadError
    ) {
      setError(
        getPsychometricErrorMessage(
          loadError,
          "Unable to load assessment results."
        )
      );
    } finally {
      setLoading(
        false
      );
    }
  }


  useEffect(
    () => {
      load();
    },
    [
      attemptId,
    ]
  );


  const test =
    results?.test ||
    results?.attempt
      ?.test ||
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
      [
        results,
      ]
    );


  const traitResults =
    useMemo(
      () =>
        results
          ?.traits ||
        results
          ?.traitScores ||
        [],
      [
        results,
      ]
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
    sections.length >
      0;


  const hasEnoughTokens =
    walletBalance >=
    ANSWER_UNLOCK_COST;


  async function openUnlockModal() {
    setUnlockError(
      ""
    );


    // Always get a fresh balance
    // before opening the popup.
    await loadWallet();


    setTokenModal(
      true
    );
  }


  async function unlockAnswers() {
    if (
      unlocking
    ) {
      return;
    }


    if (
      walletBalance <
      ANSWER_UNLOCK_COST
    ) {
      setUnlockError(
        "Insufficient token balance. You need 1 token to unlock the correct answers."
      );

      return;
    }


    try {
      setUnlocking(
        true
      );

      setUnlockError(
        ""
      );


      const updated =
        await unlockPsychometricAnswers(
          attemptId
        );


      setResults(
        (
          current
        ) => ({
          ...current,

          ...updated,

          answersUnlocked:
            true,

          correctAnswersUnlocked:
            true,

          answers:
            updated?.answers ||
            updated
              ?.answerReview ||
            current?.answers ||
            [],
        })
      );


      if (
        updated
          ?.walletBalance !==
        undefined
      ) {
        setWalletBalance(
          Number(
            updated
              .walletBalance
          )
        );
      } else {
        await loadWallet();
      }


      setTokenModal(
        false
      );
    } catch (
      unlockErrorValue
    ) {
      const message =
        getPsychometricErrorMessage(
          unlockErrorValue,
          "Unable to unlock the correct answers."
        );


      setUnlockError(
        message
      );


      // Refresh balance in case
      // it changed elsewhere.
      await loadWallet();
    } finally {
      setUnlocking(
        false
      );
    }
  }


  if (
    loading
  ) {
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


  if (
    error
  ) {
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
                            {
                              info.title ||
                              section.title
                            }
                          </span>

                          <strong>
                            {scoreText(
                              section
                                .score,
                              section
                                .maxScore
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
                          trait.trait ||
                          index
                        }
                      >
                        <span>
                          {
                            trait.label ||
                            trait.name ||
                            trait.trait ||
                            trait.key
                          }
                        </span>

                        <strong>
                          {trait.percentage !==
                          undefined
                            ? `${Math.round(
                                trait
                                  .percentage
                              )}%`
                            : trait.average !==
                                undefined
                              ? trait.average
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
                  {answersUnlocked &&
answerReview.length ? (
  answerReview.map(
    (
      item,
      index
    ) => {
      const selectedOption =
        String(
          item?.selectedOption ||
          ""
        ).toUpperCase();


      const correctOption =
        String(
          item?.correctOption ||
          ""
        ).toUpperCase();


      const options =
        Array.isArray(
          item?.options
        ) &&
        item.options.length
          ? item.options.map(
              (
                option
              ) => ({
                key:
                  String(
                    option?.key ||
                    option?.value ||
                    ""
                  ).toUpperCase(),

                text:
                  option?.text ||
                  option?.label ||
                  "",
              })
            )
          : [
              {
                key: "A",
                text:
                  item?.optionA ||
                  "",
              },

              {
                key: "B",
                text:
                  item?.optionB ||
                  "",
              },

              {
                key: "C",
                text:
                  item?.optionC ||
                  "",
              },

              {
                key: "D",
                text:
                  item?.optionD ||
                  "",
              },
            ].filter(
              (
                option
              ) =>
                Boolean(
                  option.text
                )
            );


      const isCorrect =
        selectedOption &&
        correctOption &&
        selectedOption ===
          correctOption;


      return (
        <div
          className="psychometric-review-row psychometric-review-question"
          key={
            item.id ||
            item.questionId ||
            index
          }
        >
          <div className="psychometric-review-question__header">
            <strong>
              Question{" "}
              {
                item
                  .questionNumber ||
                index +
                  1
              }
            </strong>


            {selectedOption ? (
              <span
                className={`psychometric-review-result-badge ${
                  isCorrect
                    ? "is-correct"
                    : "is-incorrect"
                }`}
              >
                {isCorrect
                  ? "Correct"
                  : "Incorrect"}
              </span>
            ) : (
              <span className="psychometric-review-result-badge is-unanswered">
                Unanswered
              </span>
            )}
          </div>


          {item.questionText ? (
            <p className="psychometric-review-question__text">
              {
                item.questionText
              }
            </p>
          ) : null}


          {options.length ? (
            <div className="psychometric-review-options">
              {options.map(
                (
                  option
                ) => {
                  const isSelected =
                    option.key ===
                    selectedOption;


                  const isCorrectOption =
                    option.key ===
                    correctOption;


                  return (
                    <div
                      key={
                        option.key
                      }
                      className={`psychometric-review-option ${
                        isCorrectOption
                          ? "is-correct"
                          : ""
                      } ${
                        isSelected
                          ? "is-selected"
                          : ""
                      } ${
                        isSelected &&
                        !isCorrectOption
                          ? "is-wrong"
                          : ""
                      }`}
                    >
                      <div className="psychometric-review-option__letter">
                        {
                          option.key
                        }
                      </div>


                      <div className="psychometric-review-option__text">
                        {
                          option.text
                        }
                      </div>


                      <div className="psychometric-review-option__labels">
                        {isSelected ? (
                          <span className="psychometric-review-option__your-answer">
                            Your answer
                          </span>
                        ) : null}


                        {isCorrectOption ? (
                          <span className="psychometric-review-option__correct-answer">
                            Correct answer
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : null}


          <div className="psychometric-review-answer-summary">
            <span>
              Your answer:{" "}
              <strong>
                {selectedOption ||
                  "Not answered"}
              </strong>
            </span>


            <span>
              Correct answer:{" "}
              <strong>
                {correctOption ||
                  "—"}
              </strong>
            </span>
          </div>
        </div>
      );
    }
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
                    <img
                      src={
                        tokenCoin
                      }
                      alt="Anandam token"
                      className="psychometric-token-image"
                    />


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
                        className="psychometric-button"
                        onClick={
                          openUnlockModal
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
            unlocking ||
            walletLoading
          }

          title="View Correct Answers"

          description="Use 1 token to unlock the correct answers for this completed assessment."

          tokenCost={
            ANSWER_UNLOCK_COST
          }

          walletBalance={
            walletBalance
          }

          hasEnoughTokens={
            hasEnoughTokens
          }

          error={
            unlockError
          }

          onClose={() => {
            if (
              unlocking
            ) {
              return;
            }


            setTokenModal(
              false
            );

            setUnlockError(
              ""
            );
          }}

          onConfirm={
            unlockAnswers
          }
        />
      </main>
    </AppLayout>
  );
}