import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
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
    if (test?.firstAttemptFree === true) {
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


function usesSectionOverview(
  test
) {
  return (
    test?.type ===
      "MARITIME_HUMAN_PERFORMANCE" ||
    test?.type ===
      "SENIOR_LEADERSHIP_PERSONALITY"
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


export default function PsychometricTestIntroPage() {
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


  function openAttempt(
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
      )}`,
      {
        replace:
          true,
      }
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


  async function requestStart() {
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


      openAttempt(
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


      openAttempt(
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


  useEffect(() => {
    let active =
      true;


    async function load() {
      try {
        setLoading(
          true
        );

        setError("");


        const loaded =
          await getPsychometricTest(
            testCode
          );


        if (
          !active
        ) {
          return;
        }


        setTest(
          loaded
        );


        // Sectioned assessments have their own
        // overview page.
        if (
          usesSectionOverview(
            loaded
          )
        ) {
          return;
        }


        // Resume an active attempt
        // without triggering payment.
        const activeAttemptId =
          loaded
            ?.activeAttemptId ||
          loaded
            ?.eligibility
            ?.activeAttemptId;


        if (
          activeAttemptId
        ) {
          openAttempt({
            id:
              activeAttemptId,
          });

          return;
        }


        // No active attempt:
        // ask backend to start.
        //
        // Free attempt -> creates it.
        // Repeat attempt -> backend
        // returns 402 with token info.
        try {
          setStarting(
            true
          );


          const attempt =
            await startPsychometricAttempt(
              testCode
            );


          if (
            active &&
            attempt?.id
          ) {
            openAttempt(
              attempt
            );

            return;
          }
        } catch (
          startError
        ) {
          if (
            !active
          ) {
            return;
          }


          if (
            isPsychometricPaymentRequired(
              startError
            )
          ) {
            const paymentDetails =
              readPaymentDetails(
                startError,
                loaded
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
          if (
            active
          ) {
            setStarting(
              false
            );
          }
        }
      } catch (
        loadError
      ) {
        if (
          active
        ) {
          setError(
            getPsychometricErrorMessage(
              loadError,
              "Unable to load this assessment."
            )
          );
        }
      } finally {
        if (
          active
        ) {
          setLoading(
            false
          );
        }
      }
    }


    load();


    return () => {
      active =
        false;
    };
  }, [
    testCode,
  ]);


  if (
    usesSectionOverview(
      test
    )
  ) {
    return (
      <Navigate
        to={`/app/wellbeing/psychometrics/${encodeURIComponent(
          testCode
        )}/overview`}
        replace
      />
    );
  }


  return (
    <AppLayout>
      <main className="psychometric-page">
        <div className="psychometric-loading">
          {error ? (
            <>
              <div className="psychometric-inline-error">
                {error}
              </div>


              <button
                type="button"
                className="psychometric-button"
                onClick={
                  requestStart
                }
                disabled={
                  starting
                }
              >
                {starting
                  ? "Starting..."
                  : "Try Again"}
              </button>
            </>
          ) : (
            loading ||
            starting
              ? "Preparing assessment..."
              : tokenModal.open
                ? ""
                : "Opening assessment..."
          )}
        </div>


        <PsychometricTokenModal
          open={
            tokenModal.open
          }

          loading={
            starting
          }

          title={
            Number(
              test?.attemptCount ??
              test?.eligibility?.attemptCount ??
              0
            ) === 0 &&
            test?.firstAttemptFree === false
              ? "Start Assessment"
              : "Start Another Attempt"
          }

          description={
            Number(
              test?.attemptCount ??
              test?.eligibility?.attemptCount ??
              0
            ) === 0 &&
            test?.firstAttemptFree === false
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


            navigate(
              "/app/wellbeing",
              {
                replace:
                  true,
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