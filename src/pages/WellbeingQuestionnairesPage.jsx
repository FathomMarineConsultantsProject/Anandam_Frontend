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

import PsychometricTokenModal
  from "../components/psychometrics/PsychometricTokenModal";

import {
  getWellbeingQuestionnaires,
  getWellbeingQuestionnaireErrorMessage,
} from "../api/wellbeingQuestionnaireApi";

import {
  getPsychometricTests,
  startPsychometricAttempt,
  getPsychometricErrorMessage,
  isPsychometricPaymentRequired,
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


  const hasEnoughTokens =
    data?.hasEnoughTokens !==
    undefined
      ? Boolean(
          data.hasEnoughTokens
        )
      : walletBalance >=
        requiredTokens;


  return {
    requiredTokens,
    walletBalance,
    hasEnoughTokens,
  };
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


  const [
    selectedPsychometricTest,
    setSelectedPsychometricTest,
  ] = useState(null);


  const [
    tokenModal,
    setTokenModal,
  ] = useState({
    open:
      false,

    requiredTokens:
      0,

    walletBalance:
      0,

    hasEnoughTokens:
      false,

    error:
      "",
  });


  async function loadPage() {
    setLoading(
      true
    );

    setError(
      ""
    );


    try {
      const [
        wellbeingData,
        psychometricData,
      ] =
        await Promise.all([
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
    } catch (
      loadError
    ) {
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
      setLoading(
        false
      );
    }
  }


  useEffect(() => {
    loadPage();
  }, []);


  useEffect(() => {
    if (
      !notice
    ) {
      return undefined;
    }


    const timer =
      window.setTimeout(
        () => {
          setNotice(
            ""
          );
        },

        3500
      );


    return () =>
      window.clearTimeout(
        timer
      );
  }, [
    notice,
  ]);


  const maritimeTest =
    useMemo(
      () =>
        psychometricTests.find(
          (test) =>
            test.type ===
            "MARITIME_HUMAN_PERFORMANCE"
        ) ||
        null,

      [
        psychometricTests,
      ]
    );


  const personalTests =
    useMemo(
      () =>
        [
          "BIG_FIVE",
          "PERSONALITY_16PF",
          "MOTIVATION_VALUES",
        ]
          .map(
            (type) =>
              psychometricTests.find(
                (test) =>
                  test.type ===
                  type
              )
          )
          .filter(
            Boolean
          ),

      [
        psychometricTests,
      ]
    );


  function openWellbeing(
    questionnaire
  ) {
    if (
      !questionnaire?.slug ||
      questionnaire
        ?.eligibility
        ?.canSubmit ===
        false
    ) {
      return;
    }


    navigate(
      `/app/wellbeing/${encodeURIComponent(
        questionnaire.slug
      )}`
    );
  }


  function navigateToPsychometricAttempt(
    test,
    attempt
  ) {
    if (
      !test?.code ||
      !attempt?.id
    ) {
      return;
    }


    navigate(
      `/app/wellbeing/psychometrics/${encodeURIComponent(
        test.code
      )}/attempts/${encodeURIComponent(
        attempt.id
      )}`
    );
  }


  function showTokenModal(
    test,
    paymentDetails,
    message = ""
  ) {
    setSelectedPsychometricTest(
      test
    );


    setTokenModal({
      open:
        true,

      requiredTokens:
        Number(
          paymentDetails
            ?.requiredTokens ||
          test?.repeatTokenCost ||
          0
        ),

      walletBalance:
        Number(
          paymentDetails
            ?.walletBalance ??
          test?.walletBalance ??
          test?.eligibility
            ?.walletBalance ??
          0
        ),

      hasEnoughTokens:
        Boolean(
          paymentDetails
            ?.hasEnoughTokens
        ),

      error:
        message ||
        "",
    });
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
      Maritime assessment keeps
      its overview page.
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
      Personality / behavioural /
      motivation tests start here.
    */

    try {
      setStartingId(
        test.id ||
        test.code
      );


      setError(
        ""
      );


      const attempt =
        await startPsychometricAttempt(
          test.code
        );


      if (
        !attempt?.id
      ) {
        throw new Error(
          "Assessment attempt was not created."
        );
      }


      navigateToPsychometricAttempt(
        test,
        attempt
      );
    } catch (
      startError
    ) {
      /*
        IMPORTANT:

        402 from backend is NOT
        shown as page error.

        It opens token modal.
      */

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
          test,
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
      setStartingId(
        null
      );
    }
  }


  async function confirmTokenStart() {
    const test =
      selectedPsychometricTest;


    if (
      !test?.code ||
      startingId ||
      !tokenModal
        .hasEnoughTokens
    ) {
      return;
    }


    try {
      setStartingId(
        test.id ||
        test.code
      );


      setError(
        ""
      );


      setTokenModal(
        (
          current
        ) => ({
          ...current,

          error:
            "",
        })
      );


      /*
        This is the IMPORTANT
        second request.

        Backend will now:
        - verify balance
        - deduct tokens
        - create attempt
      */

      const attempt =
        await startPsychometricAttempt(
          test.code,

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


      setTokenModal({
        open:
          false,

        requiredTokens:
          0,

        walletBalance:
          0,

        hasEnoughTokens:
          false,

        error:
          "",
      });


      setSelectedPsychometricTest(
        null
      );


      navigateToPsychometricAttempt(
        test,
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
          test,
          paymentDetails,

          paymentDetails
            .hasEnoughTokens
            ? getPsychometricErrorMessage(
                confirmError,
                "Unable to start this assessment."
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
              "Unable to start this assessment."
            ),
        })
      );
    } finally {
      setStartingId(
        null
      );
    }
  }


  function closeTokenModal() {
    if (
      startingId
    ) {
      return;
    }


    setTokenModal({
      open:
        false,

      requiredTokens:
        0,

      walletBalance:
        0,

      hasEnoughTokens:
        false,

      error:
        "",
    });


    setSelectedPsychometricTest(
      null
    );
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
              Personal Analysis
              &amp; Development
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
                  (
                    test
                  ) => (
                    <PsychometricCard
                      key={
                        test.id ||
                        test.code
                      }

                      test={
                        test
                      }

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


        <PsychometricTokenModal
          open={
            tokenModal.open
          }

          loading={
            Boolean(
              startingId
            )
          }

          title="Start Another Attempt"

          description={`Your free attempt for ${
            selectedPsychometricTest
              ?.title ||
            "this assessment"
          } has already been used.`}

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

          onClose={
            closeTokenModal
          }

          onConfirm={
            confirmTokenStart
          }
        />
      </main>
    </AppLayout>
  );
}