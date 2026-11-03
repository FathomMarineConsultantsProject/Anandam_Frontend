import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Clock3,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import AppLayout
  from "../components/layout/AppLayout";

import {
  acknowledgePsychometricDisclaimer,
  getPsychometricAttempt,
  getPsychometricDisclaimer,
  getPsychometricErrorMessage,
} from "../api/psychometricApi";

import "../styles/psychometrics.css";


function splitParagraphs(
  value
) {
  return String(
    value || ""
  )
    .split(/\n\s*\n/)
    .map(
      (item) =>
        item.trim()
    )
    .filter(Boolean);
}


function getSectionCode(
  section
) {
  return (
    section?.code ||
    section?.section?.code ||
    null
  );
}


function buildAssessmentUrl(
  testCode,
  attemptId,
  attempt
) {
  const base =
    `/app/wellbeing/psychometrics/${encodeURIComponent(
      testCode
    )}/attempts/${encodeURIComponent(
      attemptId
    )}`;


  const testType =
    attempt?.test?.type ||
    attempt?.testType ||
    null;


  if (
    testType !==
    "MARITIME_HUMAN_PERFORMANCE"
  ) {
    return base;
  }


  const sections =
    Array.isArray(
      attempt?.sections
    )
      ? attempt.sections
      : [];


  const nextOpenSection =
    sections.find(
      (section) =>
        !section?.submittedAt &&
        !section?.locked
    );


  const sectionCode =
    attempt?.currentSectionCode ||
    getSectionCode(
      nextOpenSection
    ) ||
    getSectionCode(
      sections[0]
    ) ||
    "PJS";


  return `${base}?section=${encodeURIComponent(
    sectionCode
  )}`;
}


export default function PsychometricDisclaimerPage() {
  const {
    testCode,
    attemptId,
  } = useParams();


  const navigate =
    useNavigate();


  const [
    disclaimer,
    setDisclaimer,
  ] = useState(null);


  const [
    secondsRemaining,
    setSecondsRemaining,
  ] = useState(45);


  const [
    acknowledged,
    setAcknowledged,
  ] = useState(false);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const disclaimerParagraphs =
    useMemo(
      () =>
        splitParagraphs(
          disclaimer
            ?.disclaimerText
        ),
      [
        disclaimer
          ?.disclaimerText,
      ]
    );


  const acknowledgementParagraphs =
    useMemo(
      () =>
        splitParagraphs(
          disclaimer
            ?.acknowledgementText
        ),
      [
        disclaimer
          ?.acknowledgementText,
      ]
    );


  const moveToAssessment =
    useCallback(
      async () => {
        const attempt =
          await getPsychometricAttempt(
            attemptId
          );


        const url =
          buildAssessmentUrl(
            testCode,
            attemptId,
            attempt
          );


        navigate(
          url,
          {
            replace: true,
          }
        );
      },
      [
        attemptId,
        navigate,
        testCode,
      ]
    );


  const loadDisclaimer =
    useCallback(
      async () => {
        try {
          setLoading(true);

          setError("");


          const data =
            await getPsychometricDisclaimer(
              attemptId
            );


          setDisclaimer(
            data
          );


          setSecondsRemaining(
            Math.max(
              0,
              Number(
                data
                  ?.secondsRemaining ??
                45
              )
            )
          );


          /*
            If this same attempt was already acknowledged,
            don't make the user acknowledge the SAME
            attempt twice.

            A NEW retake gets a NEW attemptId and therefore
            gets a NEW disclaimer acknowledgement.
          */
          if (
            data?.accepted ===
              true &&
            data
              ?.canBeginAssessment ===
              true
          ) {
            await moveToAssessment();
          }
        } catch (
          loadError
        ) {
          setError(
            getPsychometricErrorMessage(
              loadError,
              "Unable to load the assessment disclaimer."
            )
          );
        } finally {
          setLoading(false);
        }
      },
      [
        attemptId,
        moveToAssessment,
      ]
    );


  useEffect(() => {
    loadDisclaimer();
  }, [
    loadDisclaimer,
  ]);


  /*
    Visual countdown.

    Backend remains the final authority.
    Changing this timer in DevTools does NOT bypass
    the backend 45-second validation.
  */
  useEffect(() => {
    if (
      loading ||
      secondsRemaining <= 0
    ) {
      return undefined;
    }


    const timer =
      window.setInterval(
        () => {
          setSecondsRemaining(
            (current) =>
              Math.max(
                0,
                current - 1
              )
          );
        },
        1000
      );


    return () =>
      window.clearInterval(
        timer
      );
  }, [
    loading,
    secondsRemaining,
  ]);


  async function beginAssessment() {
    if (
      submitting ||
      secondsRemaining > 0 ||
      !acknowledged
    ) {
      return;
    }


    try {
      setSubmitting(true);

      setError("");


      const result =
        await acknowledgePsychometricDisclaimer(
          attemptId
        );


      if (
        result
          ?.canBeginAssessment !==
          true &&
        result?.accepted !==
          true
      ) {
        throw new Error(
          "The disclaimer acknowledgement could not be completed."
        );
      }


      await moveToAssessment();
    } catch (
      acknowledgeError
    ) {
      setError(
        getPsychometricErrorMessage(
          acknowledgeError,
          "Unable to acknowledge the disclaimer."
        )
      );


      /*
        Re-fetch from server.

        This keeps the timer accurate if the backend
        still says a few seconds remain.
      */
      try {
        const latest =
          await getPsychometricDisclaimer(
            attemptId
          );


        setDisclaimer(
          latest
        );


        setSecondsRemaining(
          Math.max(
            0,
            Number(
              latest
                ?.secondsRemaining ??
              0
            )
          )
        );
      } catch {
        // Keep the original acknowledgement error.
      }
    } finally {
      setSubmitting(false);
    }
  }


  if (loading) {
    return (
      <AppLayout>
        <main className="psychometric-page psychometric-disclaimer-page">
          <div className="psychometric-loading">
            Loading disclaimer...
          </div>
        </main>
      </AppLayout>
    );
  }


  const canBegin =
    secondsRemaining === 0 &&
    acknowledged &&
    !submitting;


  return (
    <AppLayout>
      <main className="psychometric-page psychometric-disclaimer-page">
        <section className="psychometric-disclaimer-card">
          <div className="psychometric-disclaimer-content">

            <section className="psychometric-disclaimer-section">
              <h1>
                {disclaimer?.title ||
                  "Important Disclaimer - Not a clinical diagnosis"}
              </h1>

              <div className="psychometric-disclaimer-copy">
                {disclaimerParagraphs.map(
                  (
                    paragraph,
                    index
                  ) => (
                    <p
                      key={`disclaimer-${index}`}
                    >
                      {paragraph}
                    </p>
                  )
                )}
              </div>
            </section>


            <div className="psychometric-disclaimer-divider" />


            <section className="psychometric-disclaimer-section psychometric-disclaimer-acknowledgement">
              <h2>
                Participant Acknowledgement
              </h2>

              <div className="psychometric-disclaimer-copy">
                {acknowledgementParagraphs.map(
                  (
                    paragraph,
                    index
                  ) => (
                    <p
                      key={`acknowledgement-${index}`}
                    >
                      {paragraph}
                    </p>
                  )
                )}
              </div>


              <div className="psychometric-disclaimer-controls">
                <div
                  className={
                    secondsRemaining > 0
                      ? "psychometric-disclaimer-countdown"
                      : "psychometric-disclaimer-countdown is-complete"
                  }
                  role="status"
                  aria-live="polite"
                >
                  <Clock3
                    size={24}
                    strokeWidth={1.6}
                  />

                  <span>
                    {secondsRemaining > 0
                      ? `You can continue in ${secondsRemaining} second${
                          secondsRemaining === 1
                            ? ""
                            : "s"
                        }`
                      : "You can now continue"}
                  </span>
                </div>


                <label className="psychometric-disclaimer-checkbox">
                  <input
                    type="checkbox"
                    checked={
                      acknowledged
                    }
                    onChange={
                      (event) =>
                        setAcknowledged(
                          event.target
                            .checked
                        )
                    }
                  />

                  <span>
                    I have read and understood the Assessment Disclaimer and Limitation of Liability.
                  </span>
                </label>
              </div>
            </section>


            {error ? (
              <div className="psychometric-inline-error psychometric-disclaimer-error">
                {error}
              </div>
            ) : null}
          </div>


          <div className="psychometric-disclaimer-actions">
            <button
              type="button"
              className="psychometric-button psychometric-disclaimer-begin"
              disabled={
                !canBegin
              }
              onClick={
                beginAssessment
              }
            >
              {submitting
                ? "Starting..."
                : "Begin Assessment"}
            </button>
          </div>
        </section>
      </main>
    </AppLayout>
  );
}