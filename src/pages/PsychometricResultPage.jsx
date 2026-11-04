import {
  useEffect,
  useState,
} from "react";

import {
  Download,
  Info,
  LockKeyhole,
  Sparkles,
} from "lucide-react";

import {
  useParams,
} from "react-router-dom";

import AppLayout
  from "../components/layout/AppLayout";

import PsychometricTokenModal
  from "../components/psychometrics/PsychometricTokenModal";

import tokenCoin
  from "../assets/token coin.png";

import {
  downloadPsychometricReport,
  getPsychometricAnalysis,
  getPsychometricErrorMessage,
  unlockPsychometricAnswers,
} from "../api/psychometricApi";

import {
  getMyTokenSummary,
} from "../api/tokenApi";

import "../styles/psychometrics.css";
import "../styles/psychometric-results.css";


const ANSWER_UNLOCK_COST = 1;


/* =========================================================
   PROFILE TEST COPY
   ========================================================= */

const PROFILE_COPY = {
  BIG_FIVE: {
    title:
      "Your Personality Insights",

    subtitle:
      "Explore your strongest tendencies and how they may show up day to day.",

    dimensionsTitle:
      "Your Personality Dimensions",

    dimensionsSubtitle:
      "See how your five personality areas compare.",
  },

  PERSONALITY_16PF: {
    title:
      "Your Behavioural Insights",

    subtitle:
      "Explore your behavioural tendencies and how they may show up day to day.",

    dimensionsTitle:
      "Your Behavioural Dimensions",

    dimensionsSubtitle:
      "See how your behavioural areas compare.",
  },

  MOTIVATION_VALUES: {
    title:
      "Your Motivation & Values",

    subtitle:
      "Explore the values and drivers that influence what matters most to you.",

    dimensionsTitle:
      "Your Motivation & Values",

    dimensionsSubtitle:
      "See how your motivational priorities compare.",
  },
};


/* =========================================================
   DIMENSION COLORS
   ========================================================= */

const DIMENSION_COLORS = {
  CONSCIENTIOUSNESS:
    "#8d73d1",

  EMOTIONAL_STABILITY:
    "#6fb1c9",

  OPENNESS:
    "#7c9ad6",

  AGREEABLENESS:
    "#e0b074",

  EXTRAVERSION:
    "#d061d9",
};


const FALLBACK_COLORS = [
  "#8d73d1",
  "#6fb1c9",
  "#7c9ad6",
  "#e0b074",
  "#d061d9",
  "#6baa91",
  "#d18b6e",
  "#9a7cc6",
  "#70a7c7",
  "#c99462",
];


const MARITIME_COLORS = [
  "#8d73d1",
  "#6fb1c9",
  "#e0b074",
];


const BIG_FIVE_ORDER = [
  "CONSCIENTIOUSNESS",
  "EMOTIONAL_STABILITY",
  "OPENNESS",
  "AGREEABLENESS",
  "EXTRAVERSION",
];


/* =========================================================
   HELPERS
   ========================================================= */

function clampPercentage(
  value
) {
  const number =
    Number(
      value ?? 0
    );

  if (
    !Number.isFinite(
      number
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      number
    )
  );
}


function formatPercentage(
  value
) {
  const number =
    clampPercentage(
      value
    );

  if (
    Number.isInteger(
      number
    )
  ) {
    return `${number}%`;
  }

  return `${number.toFixed(
    1
  )}%`;
}


function getDimensionColor(
  key,
  index
) {
  return (
    DIMENSION_COLORS[
      key
    ] ||
    FALLBACK_COLORS[
      index %
      FALLBACK_COLORS.length
    ]
  );
}


function getMaritimeColor(
  index
) {
  return MARITIME_COLORS[
    index %
    MARITIME_COLORS.length
  ];
}


function orderProfileDimensions(
  type,
  dimensions
) {
  if (
    !Array.isArray(
      dimensions
    )
  ) {
    return [];
  }

  if (
    type !==
    "BIG_FIVE"
  ) {
    return dimensions;
  }

  const positions =
    new Map(
      BIG_FIVE_ORDER.map(
        (
          key,
          index
        ) => [
          key,
          index,
        ]
      )
    );

  return [
    ...dimensions,
  ].sort(
    (
      first,
      second
    ) =>
      (
        positions.get(
          first?.key
        ) ??
        999
      ) -
      (
        positions.get(
          second?.key
        ) ??
        999
      )
  );
}


function makeFilename(
  analysis,
  testCode
) {
  const base =
    analysis?.test?.title ||
    testCode ||
    "assessment";

  const safe =
    String(
      base
    )
      .trim()
      .replace(
        /[^a-zA-Z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      )
      .toLowerCase();

  return `${
    safe ||
    "assessment"
  }-report.pdf`;
}


function saveBlob(
  blob,
  filename
) {
  const url =
    window.URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href =
    url;

  link.download =
    filename;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  window.setTimeout(
    () => {
      window.URL.revokeObjectURL(
        url
      );
    },
    1000
  );
}


/* =========================================================
   FIGMA INSIGHT BANNER
   ========================================================= */

function InsightBanner({
  headline,
  summary,
  maritime = false,
}) {
  return (
    <section
      className={`prr-insight ${
        maritime
          ? "prr-insight--maritime"
          : ""
      }`}
    >
      <Sparkles
        size={30}
        strokeWidth={1.7}
      />

      <div>
        <h2>
          {headline}
        </h2>

        {summary ? (
          <p>
            {summary}
          </p>
        ) : null}
      </div>
    </section>
  );
}


/* =========================================================
   FIGMA TOP 3 CARDS
   ========================================================= */

function SummaryCards({
  cards = [],
}) {
  if (
    !cards.length
  ) {
    return null;
  }

  return (
    <section className="prr-summary-grid">
      {cards
        .slice(
          0,
          3
        )
        .map(
          (
            item,
            index
          ) => (
            <article
              className="prr-summary-card"
              key={
                item?.key ||
                index
              }
            >
              <h3>
                {item?.title ||
                  item?.label}
              </h3>

              <div className="prr-summary-card__bottom">
                <strong>
                  {formatPercentage(
                    item?.percentage
                  )}
                </strong>

                <span>
                  {item?.label ||
                    ""}
                </span>
              </div>
            </article>
          )
        )}
    </section>
  );
}


/* =========================================================
   FIGMA LINEAR DIMENSION PANEL
   ========================================================= */

function DimensionPanel({
  title,
  subtitle,
  dimensions = [],
  maritime = false,
}) {
  if (
    !dimensions.length
  ) {
    return null;
  }

  return (
    <section className="prr-dimensions">
      <header className="prr-dimensions__header">
        <h2>
          {title}
        </h2>

        <p>
          {subtitle}
        </p>
      </header>

      <div className="prr-dimension-list">
        {dimensions.map(
          (
            item,
            index
          ) => {
            const color =
              maritime
                ? getMaritimeColor(
                    index
                  )
                : getDimensionColor(
                    item?.key,
                    index
                  );

            const percentage =
              clampPercentage(
                item?.percentage
              );

            return (
              <article
                className="prr-dimension"
                key={
                  item?.key ||
                  item?.code ||
                  index
                }
              >
                <div className="prr-dimension__top">
                  <strong className="prr-dimension__name">
                    {item?.label ||
                      item?.title}
                  </strong>

                  <div className="prr-dimension__score">
                    <strong>
                      {formatPercentage(
                        percentage
                      )}
                    </strong>

                    {item?.level ? (
                      <span
                        style={{
                          backgroundColor:
                            color,
                        }}
                      >
                        {item.level}
                      </span>
                    ) : null}
                  </div>
                </div>

                <p className="prr-dimension__description">
                  {item?.description ||
                    item?.text ||
                    ""}
                </p>

                <div className="prr-progress">
                  <div
                    style={{
                      width:
                        `${percentage}%`,

                      backgroundColor:
                        color,
                    }}
                  />
                </div>
              </article>
            );
          }
        )}
      </div>
    </section>
  );
}


/* =========================================================
   LEGAL NOTE
   ========================================================= */

function ResultNote({
  maritime = false,
}) {
  return (
    <div className="prr-note">
      <Info
        size={17}
        strokeWidth={1.5}
      />

      <p>
        {maritime
          ? "These results are intended to support learning, reflection and professional development. They should not be used as the sole basis for employment, medical, psychological or other high-stakes decisions."
          : "These results describe self-reported preferences and tendencies for development and reflection. They are not a clinical diagnosis and should not be used as the sole basis for employment, medical, psychological or other high-stakes decisions."}
      </p>
    </div>
  );
}


/* =========================================================
   PERSONALITY / BEHAVIOUR / MOTIVATION
   ========================================================= */

function ProfileResult({
  analysis,
}) {
  const type =
    analysis?.test?.type;

  const copy =
    PROFILE_COPY[
      type
    ] ||
    PROFILE_COPY.BIG_FIVE;

  const dimensions =
    orderProfileDimensions(
      type,
      analysis?.dimensions ||
        []
    );

  const topCards =
    Array.isArray(
      analysis?.analysis
        ?.topDimensions
    )
      ? analysis.analysis
          .topDimensions
      : [];

  return (
    <section className="prr-profile-card">
      <InsightBanner
        headline={
          analysis?.analysis
            ?.headline ||
          "Your assessment profile is ready."
        }
        summary={
          analysis?.analysis
            ?.summary ||
          ""
        }
      />

      <SummaryCards
        cards={
          topCards
        }
      />

      <DimensionPanel
        title={
          copy
            .dimensionsTitle
        }
        subtitle={
          copy
            .dimensionsSubtitle
        }
        dimensions={
          dimensions
        }
      />

      <ResultNote />
    </section>
  );
}


/* =========================================================
   MARITIME SCORE
   ========================================================= */

function MaritimeScore({
  analysis,
}) {
  const sections =
    Array.isArray(
      analysis?.sections
    )
      ? analysis.sections
      : [];

  return (
    <section className="prr-maritime-score">
      <div className="prr-maritime-total">
        <strong>
          {formatPercentage(
            analysis?.score
              ?.percentage
          )}
        </strong>

        <span>
          Your total score
        </span>
      </div>

      <h2>
        Score Breakdown
      </h2>

      <div className="prr-maritime-score-grid">
        {sections.map(
          (
            section,
            index
          ) => (
            <article
              key={
                section?.code ||
                index
              }
            >
              <span>
                {section?.title}
              </span>

              <strong>
                {Number(
                  section?.score ||
                    0
                )}
                {" / "}
                {Number(
                  section?.maxScore ||
                    0
                )}
              </strong>
            </article>
          )
        )}
      </div>
    </section>
  );
}


/* =========================================================
   MARITIME ANALYTICS
   ========================================================= */

function MaritimeAnalytics({
  analysis,
}) {
  const capabilities =
    Array.isArray(
      analysis?.capabilities
    ) &&
    analysis.capabilities
      .length
      ? analysis.capabilities
      : (
        Array.isArray(
          analysis?.domains
        )
          ? analysis.domains
          : []
      );

  const summaryCards =
    capabilities.map(
      (
        item
      ) => ({
        key:
          item?.key,

        title:
          item?.resultTitle ||
          item?.label,

        label:
          item?.label,

        percentage:
          item?.percentage,
      })
    );

  const dimensionRows =
    capabilities.map(
      (
        item
      ) => ({
        key:
          item?.key,

        code:
          item?.code,

        label:
          item?.label ||
          item?.title,

        percentage:
          item?.percentage,

        level:
          item?.band ||
          item?.level,

        description:
          item?.resultText ||
          (
            `${Number(
              item?.score ||
                0
            )} of ${Number(
              item?.maxScore ||
                0
            )} correct`
          ),
      })
    );

  return (
    <section className="prr-maritime-analytics">
      <div className="prr-maritime-section-heading">
        <h2>
          Detailed Performance Analysis
        </h2>

        <p>
          Review what your results suggest across the
          three core maritime performance areas.
        </p>
      </div>

      <InsightBanner
        maritime
        headline={
          analysis?.analysis
            ?.headline ||
          analysis?.overall
            ?.title ||
          "Your Maritime Human Performance analysis is ready."
        }
        summary={
          analysis?.analysis
            ?.summary ||
          analysis?.overall
            ?.summary ||
          ""
        }
      />

      <SummaryCards
        cards={
          summaryCards
        }
      />

      <DimensionPanel
        maritime
        title="Your Performance Dimensions"
        subtitle="See how your performance compares across the main assessment areas."
        dimensions={
          dimensionRows
        }
      />

      <ResultNote
        maritime
      />
    </section>
  );
}


/* =========================================================
   LOCKED MARITIME RESULT
   ========================================================= */

function LockedMaritimeResult({
  onUnlock,
}) {
  return (
    <section className="prr-locked">
      <div
        className="prr-locked__preview"
        aria-hidden="true"
      >
        <div />
        <div />
        <div />
        <div />
      </div>

      <div className="prr-unlock-card">
        <img
          src={
            tokenCoin
          }
          alt="Anandam token"
        />

        <h2>
          Unlock Full Analysis
          &amp; Correct Answers
        </h2>

        <p>
          Use 1 token to view your detailed performance
          analytics, full answer sheet and correct answers.
        </p>

        <button
          type="button"
          className="prr-primary-button"
          onClick={
            onUnlock
          }
        >
          <LockKeyhole
            size={16}
            strokeWidth={1.7}
          />

          Use 1 Token
        </button>
      </div>
    </section>
  );
}


/* =========================================================
   MARITIME ANSWER REVIEW
   ========================================================= */

function MaritimeAnswerReview({
  responses = [],
}) {
  return (
    <section className="prr-answer-review">
      <header className="prr-answer-review__header">
        <h2>
          Your Responses
        </h2>

        <p>
          Review your selected option and the correct
          answer for every question.
        </p>
      </header>

      <div className="prr-answer-list">
        {responses.map(
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
              )
                ? item.options
                : [];

            const isCorrect =
              Boolean(
                selectedOption &&
                correctOption &&
                selectedOption ===
                  correctOption
              );

            return (
              <article
                className="prr-answer-question"
                key={
                  item?.attemptQuestionId ||
                  item?.questionId ||
                  index
                }
              >
                <div className="prr-answer-question__top">
                  <strong>
                    Question{" "}
                    {item?.questionNumber ||
                      index +
                        1}
                  </strong>

                  {selectedOption ? (
                    <span
                      className={`prr-answer-status ${
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
                    <span className="prr-answer-status is-unanswered">
                      Unanswered
                    </span>
                  )}
                </div>

                <p className="prr-answer-question__text">
                  {item?.questionText}
                </p>

                <div className="prr-answer-options">
                  {options.map(
                    (
                      option
                    ) => {
                      const key =
                        String(
                          option?.key ||
                          option?.value ||
                          ""
                        ).toUpperCase();

                      const selected =
                        key ===
                        selectedOption;

                      const correct =
                        key ===
                        correctOption;

                      return (
                        <div
                          className={`prr-answer-option ${
                            selected
                              ? "is-selected"
                              : ""
                          } ${
                            correct
                              ? "is-correct"
                              : ""
                          } ${
                            selected &&
                            !correct
                              ? "is-wrong"
                              : ""
                          }`}
                          key={
                            key
                          }
                        >
                          <span className="prr-answer-option__letter">
                            {key}
                          </span>

                          <span className="prr-answer-option__text">
                            {option?.text ||
                              option?.label}
                          </span>

                          <span className="prr-answer-option__badges">
                            {selected ? (
                              <small className="is-user">
                                Your answer
                              </small>
                            ) : null}

                            {correct ? (
                              <small className="is-correct">
                                Correct answer
                              </small>
                            ) : null}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="prr-answer-summary">
                  <span>
                    Your answer:{" "}
                    <strong>
                      {item?.selectedOptionText ||
                        selectedOption ||
                        "Not answered"}
                    </strong>
                  </span>

                  <span>
                    Correct answer:{" "}
                    <strong>
                      {item?.correctOptionText ||
                        correctOption ||
                        "—"}
                    </strong>
                  </span>
                </div>
              </article>
            );
          }
        )}
      </div>
    </section>
  );
}


/* =========================================================
   PAGE
   ========================================================= */

export default function PsychometricResultPage() {
  const {
    testCode,
    attemptId,
  } = useParams();

  const [
    analysis,
    setAnalysis,
  ] = useState(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(
    true
  );

  const [
    error,
    setError,
  ] = useState(
    ""
  );

  const [
    downloading,
    setDownloading,
  ] = useState(
    false
  );

  const [
    tokenModal,
    setTokenModal,
  ] = useState(
    false
  );

  const [
    walletBalance,
    setWalletBalance,
  ] = useState(
    0
  );

  const [
    walletLoading,
    setWalletLoading,
  ] = useState(
    false
  );

  const [
    unlocking,
    setUnlocking,
  ] = useState(
    false
  );

  const [
    unlockError,
    setUnlockError,
  ] = useState(
    ""
  );


  const isMaritime =
    analysis?.resultKind ===
      "MARITIME_SCORED" ||
    analysis?.test?.type ===
      "MARITIME_HUMAN_PERFORMANCE";


  const answersUnlocked =
    Boolean(
      analysis?.answersUnlocked ||
      analysis?.answerKeyAvailable
    );


  const profileCopy =
    PROFILE_COPY[
      analysis?.test?.type
    ];


  useEffect(
    () => {
      let cancelled =
        false;

      async function load() {
        try {
          setLoading(
            true
          );

          setError(
            ""
          );

          const result =
            await getPsychometricAnalysis(
              attemptId
            );

          if (
            cancelled
          ) {
            return;
          }

          setAnalysis(
            result
          );

          const maritime =
            result?.resultKind ===
              "MARITIME_SCORED" ||
            result?.test?.type ===
              "MARITIME_HUMAN_PERFORMANCE";

          if (
            maritime
          ) {
            try {
              setWalletLoading(
                true
              );

              const wallet =
                await getMyTokenSummary();

              if (
                !cancelled
              ) {
                setWalletBalance(
                  Number(
                    wallet?.balance ??
                      0
                  )
                );
              }
            } catch (
              walletError
            ) {
              console.error(
                "Unable to load token balance:",
                walletError
              );
            } finally {
              if (
                !cancelled
              ) {
                setWalletLoading(
                  false
                );
              }
            }
          }
        } catch (
          loadError
        ) {
          if (
            !cancelled
          ) {
            setError(
              getPsychometricErrorMessage(
                loadError,
                "Unable to load assessment results."
              )
            );
          }
        } finally {
          if (
            !cancelled
          ) {
            setLoading(
              false
            );
          }
        }
      }

      load();

      return () => {
        cancelled =
          true;
      };
    },
    [
      attemptId,
    ]
  );


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


  async function openUnlockModal() {
    setUnlockError(
      ""
    );

    await loadWallet();

    setTokenModal(
      true
    );
  }


  async function unlockFullResult() {
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
        "You need 1 token to unlock the full analysis and correct answers."
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

      const result =
        await unlockPsychometricAnswers(
          attemptId
        );

      if (
        result?.walletBalance !==
        undefined
      ) {
        setWalletBalance(
          Number(
            result.walletBalance
          )
        );
      }

      const refreshed =
        await getPsychometricAnalysis(
          attemptId
        );

      setAnalysis(
        refreshed
      );

      setTokenModal(
        false
      );
    } catch (
      unlockFailure
    ) {
      setUnlockError(
        getPsychometricErrorMessage(
          unlockFailure,
          "Unable to unlock this assessment."
        )
      );

      await loadWallet();
    } finally {
      setUnlocking(
        false
      );
    }
  }


  async function handleDownloadReport() {
    if (
      downloading
    ) {
      return;
    }

    /*
      Maritime full analytics + correct-answer report
      is part of the 1-token unlock.

      This also prevents a user from using the PDF
      button as a frontend bypass for the locked view.
    */
    if (
      isMaritime &&
      !answersUnlocked
    ) {
      await openUnlockModal();

      return;
    }

    try {
      setDownloading(
        true
      );

      setError(
        ""
      );

      const blob =
        await downloadPsychometricReport(
          attemptId
        );

      saveBlob(
        blob,
        makeFilename(
          analysis,
          testCode
        )
      );
    } catch (
      downloadFailure
    ) {
      setError(
        getPsychometricErrorMessage(
          downloadFailure,
          "Unable to download the assessment report."
        )
      );
    } finally {
      setDownloading(
        false
      );
    }
  }


  if (
    loading
  ) {
    return (
      <AppLayout>
        <main className="prr-page">
          <div className="prr-shell">
            <div className="prr-loading">
              Loading your results...
            </div>
          </div>
        </main>
      </AppLayout>
    );
  }


  if (
    error &&
    !analysis
  ) {
    return (
      <AppLayout>
        <main className="prr-page">
          <div className="prr-shell">
            <div className="prr-loading">
              {error}
            </div>
          </div>
        </main>
      </AppLayout>
    );
  }


  const pageTitle =
    isMaritime
      ? "Maritime Human Performance Analysis"
      : (
        profileCopy?.title ||
        analysis?.test?.title ||
        "Assessment Results"
      );


  const pageSubtitle =
    isMaritime
      ? "Review your score, detailed performance analysis and assessment responses."
      : (
        profileCopy?.subtitle ||
        ""
      );


  return (
    <AppLayout>
      <main className="prr-page">
        <div className="prr-shell">

          <header className="prr-header">
            <div>
              <h1>
                {pageTitle}
              </h1>

              <p>
                {pageSubtitle}
              </p>
            </div>

            <button
              type="button"
              className="prr-report-button"
              onClick={
                handleDownloadReport
              }
              disabled={
                downloading
              }
            >
              <Download
                size={18}
                strokeWidth={1.6}
              />

              {downloading
                ? "Downloading..."
                : "Download Report"}
            </button>
          </header>


          {error ? (
            <div className="prr-error">
              {error}
            </div>
          ) : null}


          {/* ==================================================
              PERSONALITY / BEHAVIOUR / MOTIVATION

              NO right/wrong score.
              Analytics only.
              ================================================== */}

          {!isMaritime ? (
            <ProfileResult
              analysis={
                analysis
              }
            />
          ) : null}


          {/* ==================================================
              MARITIME

              Score always visible.

              Full analytics + answer sheet only after
              one-token unlock.
              ================================================== */}

          {isMaritime ? (
            <section className="prr-maritime-card">
              <MaritimeScore
                analysis={
                  analysis
                }
              />

              {!answersUnlocked ? (
                <LockedMaritimeResult
                  onUnlock={
                    openUnlockModal
                  }
                />
              ) : (
                <>
                  <MaritimeAnalytics
                    analysis={
                      analysis
                    }
                  />

                  <MaritimeAnswerReview
                    responses={
                      analysis?.responses ||
                        []
                    }
                  />
                </>
              )}
            </section>
          ) : null}

        </div>


        {isMaritime ? (
          <PsychometricTokenModal
            open={
              tokenModal
            }

            loading={
              unlocking ||
              walletLoading
            }

            title="Unlock Full Analysis & Correct Answers"

            description="Use 1 token to unlock your detailed performance analytics, full answer sheet and correct answers."

            tokenCost={
              ANSWER_UNLOCK_COST
            }

            walletBalance={
              walletBalance
            }

            hasEnoughTokens={
              walletBalance >=
              ANSWER_UNLOCK_COST
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
              unlockFullResult
            }
          />
        ) : null}

      </main>
    </AppLayout>
  );
}