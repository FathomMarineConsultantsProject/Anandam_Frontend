import {
  useEffect,
  useState,
} from "react";

import {
  CircleHelp,
  Clock3,
  Crosshair,
  Rows3,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import AppLayout
  from "../components/layout/AppLayout";

import PsychometricTokenModal
  from "../components/psychometrics/PsychometricTokenModal";

import {
  getPsychometricTest,
  startPsychometricAttempt,
  getPsychometricErrorMessage,
  isPsychometricPaymentRequired,
} from "../api/psychometricApi";

import "../styles/psychometrics.css";


function getFallbackRequiredTokens(
  test
) {
  const attemptCount =
    Number(
      test?.attemptCount ??
      test?.eligibility
        ?.attemptCount ??
      0
    );

  if (attemptCount === 0) {
    if (
      test?.firstAttemptFree ===
      true
    ) {
      return 0;
    }

    return Number(
      test?.firstAttemptTokenCost ??
      test?.eligibility
        ?.firstAttemptTokenCost ??
      getFallbackRequiredTokens(
        test
      )
    );
  }

  return Number(
    test?.repeatTokenCost ??
    test?.eligibility
      ?.repeatTokenCost ??
    1
  );
}


function readPaymentDetails(
  error,
  test
) {
  const data =
    error?.data ||
    error?.response?.data ||
    {};


  const requiredTokens =
    Number(
      data?.requiredTokens ??
      test?.requiredTokens ??
      test?.eligibility
        ?.requiredTokens ??
      test?.repeatTokenCost ??
      1
    );


  const walletBalance =
    Number(
      data?.walletBalance ??
      test?.walletBalance ??
      test?.eligibility
        ?.walletBalance ??
      0
    );


  return {
    requiredTokens,

    walletBalance,

    hasEnoughTokens:
      data?.hasEnoughTokens !==
      undefined
        ? Boolean(
            data.hasEnoughTokens
          )
        : walletBalance >=
          requiredTokens,
  };
}


export default function PsychometricOverviewPage() {
  const {
    testCode,
  } = useParams();


  const navigate =
    useNavigate();


  const [
    test,
    setTest,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    starting,
    setStarting,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    tokenModal,
    setTokenModal,
  ] = useState({
    open: false,
    requiredTokens: 0,
    walletBalance: 0,
    hasEnoughTokens: false,
    error: "",
  });


  useEffect(() => {
    let cancelled =
      false;


    async function load() {
      try {
        setLoading(
          true
        );

        setError("");


        const data =
          await getPsychometricTest(
            testCode
          );


        if (
          !cancelled
        ) {
          setTest(
            data
          );
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
              "Unable to open this assessment."
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
  }, [
    testCode,
  ]);


  function navigateToAttempt(
  attempt
) {
  if (
    !attempt?.id
  ) {
    return;
  }


  navigate(
    `/app/wellbeing/psychometrics/${encodeURIComponent(
      testCode
    )}/attempts/${encodeURIComponent(
      attempt.id
    )}/disclaimer`
  );
}


  function showTokenModal(
    paymentDetails,
    message = ""
  ) {
    setTokenModal({
      open:
        true,

      requiredTokens:
        Number(
          paymentDetails
            ?.requiredTokens ||
          0
        ),

      walletBalance:
        Number(
          paymentDetails
            ?.walletBalance ||
          0
        ),

      hasEnoughTokens:
        Boolean(
          paymentDetails
            ?.hasEnoughTokens
        ),

      error:
        message || "",
    });
  }


  async function start() {
    if (
      starting
    ) {
      return;
    }


    try {
      setStarting(
        true
      );

      setError("");


      const attempt =
        await startPsychometricAttempt(
          testCode
        );


      if (
        !attempt?.id
      ) {
        throw new Error(
          "Assessment attempt was not created."
        );
      }


      navigateToAttempt(
        attempt
      );
    } catch (
      startError
    ) {
      if (
        isPsychometricPaymentRequired(
          startError
        )
      ) {
        const paymentDetails =
          readPaymentDetails(
            startError,
            test
          );


        showTokenModal(
          paymentDetails
        );


        return;
      }


      setError(
        getPsychometricErrorMessage(
          startError,
          "Unable to start this assessment."
        )
      );
    } finally {
      setStarting(
        false
      );
    }
  }


  async function confirmTokenStart() {
    if (
      starting ||
      !tokenModal
        .hasEnoughTokens
    ) {
      return;
    }


    try {
      setStarting(
        true
      );

      setError("");


      setTokenModal(
        (
          current
        ) => ({
          ...current,

          error:
            "",
        })
      );


      const attempt =
        await startPsychometricAttempt(
          testCode,
          {
            confirmTokenSpend:
              true,
          }
        );


      if (
        !attempt?.id
      ) {
        throw new Error(
          "Assessment attempt was not created."
        );
      }


      setTokenModal(
        {
          open: false,
          requiredTokens: 0,
          walletBalance: 0,
          hasEnoughTokens: false,
          error: "",
        }
      );


      navigateToAttempt(
        attempt
      );
    } catch (
      confirmError
    ) {
      if (
        isPsychometricPaymentRequired(
          confirmError
        )
      ) {
        const paymentDetails =
          readPaymentDetails(
            confirmError,
            test
          );


        showTokenModal(
          paymentDetails,
          paymentDetails
            .hasEnoughTokens
            ? getPsychometricErrorMessage(
                confirmError,
                "Unable to start the assessment."
              )
            : ""
        );


        return;
      }


      setTokenModal(
        (
          current
        ) => ({
          ...current,

          error:
            getPsychometricErrorMessage(
              confirmError,
              "Unable to start the assessment."
            ),
        })
      );
    } finally {
      setStarting(
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
            Loading assessment...
          </div>
        </main>
      </AppLayout>
    );
  }


  const sections =
    Array.isArray(
      test?.sections
    ) &&
    test.sections.length
      ? [...test.sections].sort(
          (
            a,
            b
          ) =>
            Number(
              a.sortOrder ||
              0
            ) -
            Number(
              b.sortOrder ||
              0
            )
        )
      : [];


  const duration =
    sections.reduce(
      (
        total,
        section
      ) =>
        total +
        Number(
          section
            .durationMinutes ||
          0
        ),
      0
    );


  const questionCount =
    sections.reduce(
      (
        total,
        section
      ) =>
        total +
        Number(
          section
            .questionsPerAttempt ||
          0
        ),
      0
    );


  const attemptNumber =
    Number(
      test?.eligibility
        ?.nextAttemptNumber ??
      test?.nextAttemptNumber ??
      Number(
        test?.attemptCount ||
        0
      ) +
        1
    );


  const isSeniorLeadership =
    test?.type ===
    "SENIOR_LEADERSHIP_PERSONALITY";


  const isUntimed =
    isSeniorLeadership ||
    duration <= 0;


  const firstAttemptIsPaid =
    attemptNumber === 1 &&
    test?.firstAttemptFree ===
      false;


  return (
    <AppLayout>
      <main className="psychometric-page psychometric-overview-page">
        <div className="psychometric-overview-card">
          <header className="psychometric-overview-header">
            <h1>
              {test?.title ||
                "Maritime Human Performance Analysis"}
            </h1>


            <p>
              {test?.description ||
                "One assessment made up of three timed sections covering pre-joining readiness, leadership and safety behaviour."}
            </p>
          </header>


          <section className="psychometric-stat-grid">
            <div className="psychometric-stat-card">
              <Clock3
                size={22}
                strokeWidth={1.5}
              />

              <span>
                Duration
              </span>

              <strong>
                {isUntimed
                  ? "Untimed"
                  : `${duration} min`}
              </strong>
            </div>


            <div className="psychometric-stat-card">
              <CircleHelp
                size={22}
                strokeWidth={1.5}
              />

              <span>
                Questions
              </span>

              <strong>
                {questionCount}
              </strong>
            </div>


            <div className="psychometric-stat-card">
              <Rows3
                size={22}
                strokeWidth={1.5}
              />

              <span>
                Sections
              </span>

              <strong>
                {sections.length}
              </strong>
            </div>


            <div className="psychometric-stat-card">
              <Crosshair
                size={22}
                strokeWidth={1.5}
              />

              <span>
                Attempt
              </span>

              <strong>
                {attemptNumber}
              </strong>
            </div>
          </section>


          <section className="psychometric-section-summary">
            {sections.map(
              (
                section,
                index
              ) => (
                <div
                  className="psychometric-section-summary__row"
                  key={
                    section.id ||
                    section.code
                  }
                >
                  <span>
                    <strong>
                      Section{" "}
                      {index + 1}
                    </strong>

                    {" — "}

                    {section.title}
                  </span>


                  <span>
                    {
                      section.questionsPerAttempt
                    }{" "}
                    questions
                    {isUntimed ? (
                      <> · Untimed</>
                    ) : (
                      <>
                        {" · "}
                        {section.durationMinutes}{" "}
                        min
                      </>
                    )}
                  </span>
                </div>
              )
            )}
          </section>


          <section className="psychometric-expect">
            <h2>
              What to expect
            </h2>


            <div>
              <span>✓</span>

              {questionCount}{" "}
              {isSeniorLeadership
                ? "personality statements"
                : "multiple-choice questions"}
            </div>


            <div>
              <span>✓</span>

              {sections.length}{" "}
              assessment sections
            </div>


            <div>
              <span>✓</span>

              {isSeniorLeadership
                ? "No time limit — complete each section at your own pace"
                : "Each section has its own time limit"}
            </div>


            <div>
              <span>✓</span>

              {isSeniorLeadership
                ? "Move between sections and revisit your answers before final completion"
                : "Review answers before submission"}
            </div>
          </section>


          {error ? (
            <div className="psychometric-inline-error">
              {error}
            </div>
          ) : null}


          <button
            type="button"
            className="psychometric-button psychometric-start-button"
            onClick={
              start
            }
            disabled={
              starting
            }
          >
            {starting
              ? "Starting..."
              : test?.canResume ||
                test?.eligibility
                  ?.canResume
                ? "Resume Assessment"
                : "Start Assessment"}
          </button>
        </div>


        <PsychometricTokenModal
          open={
            tokenModal.open
          }

          loading={
            starting
          }

          title={
            firstAttemptIsPaid
              ? "Start Assessment"
              : "Start Another Attempt"
          }

          description={
            firstAttemptIsPaid
              ? `${test?.title || "This assessment"} requires ${tokenModal.requiredTokens} token${tokenModal.requiredTokens === 1 ? "" : "s"} for the first attempt.`
              : `A previous attempt for ${test?.title || "this assessment"} has already been used. ${tokenModal.requiredTokens} token${tokenModal.requiredTokens === 1 ? "" : "s"} required to start again.`
          }

          tokenCost={
            tokenModal
              .requiredTokens
          }

          walletBalance={
            tokenModal
              .walletBalance
          }

          hasEnoughTokens={
            tokenModal
              .hasEnoughTokens
          }

          error={
            tokenModal.error
          }

          onClose={() => {
            if (
              starting
            ) {
              return;
            }


            setTokenModal(
              {
                open: false,
                requiredTokens: 0,
                walletBalance: 0,
                hasEnoughTokens: false,
                error: "",
              }
            );
          }}

          onConfirm={
            confirmTokenStart
          }
        />
      </main>
    </AppLayout>
  );
}