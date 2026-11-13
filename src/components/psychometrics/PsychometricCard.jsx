import {
  ClipboardList,
  Gift,
} from "lucide-react";

import {
  getPsychometricIllustration,
} from "../../utils/psychometricAssets";


function getFirstAttemptCost(
  test
) {
  return Number(
    test?.firstAttemptTokenCost ??
    test?.eligibility
      ?.firstAttemptTokenCost ??
    0
  );
}


export default function PsychometricCard({
  test,
  featured = false,
  onOpen,
}) {
  const illustration =
    getPsychometricIllustration(
      test
    );


  const attemptCount =
    Number(
      test?.attemptCount ??
      test?.eligibility
        ?.attemptCount ??
      0
    );


  const firstAttemptUsed =
    Boolean(
      test?.eligibility
        ?.firstAttemptUsed ??
      test?.firstAttemptUsed ??
      attemptCount > 0
    );


  const firstAttemptFree =
    test?.firstAttemptFree !==
    false;


  const firstAttemptCost =
    getFirstAttemptCost(
      test
    );


  const questionCount =
    Number(
      test?.questionCount ??
      test?.questionsPerAttempt ??
      20
    );


  const repeatCost =
    Number(
      test?.repeatTokenCost ??
      test?.eligibility
        ?.repeatTokenCost ??
      1
    );


  const isSeniorLeadership =
    test?.type ===
    "SENIOR_LEADERSHIP_PERSONALITY";


  const badgeText =
    firstAttemptUsed
      ? "First attempt used"
      : firstAttemptFree
        ? "First attempt is free"
        : `${firstAttemptCost} Token${
            firstAttemptCost === 1
              ? ""
              : "s"
          } first attempt`;


  const requiredCost =
    firstAttemptUsed
      ? repeatCost
      : firstAttemptFree
        ? 0
        : firstAttemptCost;


  /*
    =====================================================
    FULL-WIDTH FEATURED CARD

    Used for:
    - Maritime Human Performance
    - Senior Leadership Personality
    =====================================================
  */

  if (featured) {
    const duration =
      Number(
        test?.durationMinutes ??
        test?.sections?.reduce(
          (
            total,
            section
          ) =>
            total +
            Number(
              section?.durationMinutes ||
                0
            ),
          0
        ) ??
        0
      );


    const sectionCount =
      Number(
        test?.sectionCount ??
        test?.sections?.length ??
        3
      );


    return (
      <article className="pad-featured-card">

        <div className="pad-featured-card__top">

          <div>

            {illustration ? (
              <img
                src={illustration}
                alt=""
                aria-hidden="true"
                className="pad-featured-card__image"
              />
            ) : null}


            <h2>
              {test?.title ||
                "Assessment"}
            </h2>


            <p>
              {test?.description ||
                ""}
            </p>

          </div>


          <div
            className={`pad-attempt-badge ${
              firstAttemptUsed
                ? "is-used"
                : ""
            }`}
          >
            <Gift
              size={15}
              strokeWidth={1.5}
            />

            {badgeText}
          </div>

        </div>


        <div className="pad-featured-card__bottom">

          <div className="pad-meta">

            <span>
              <ClipboardList
                size={17}
                strokeWidth={1.4}
              />

              {questionCount} Questions
            </span>


            <span>
              ◷{" "}
              {isSeniorLeadership ||
              duration <= 0
                ? "Untimed"
                : `${duration} Minutes`}
            </span>


            <span>
              ☷ {sectionCount} Sections
            </span>

          </div>


          {requiredCost > 0 ? (
            <span className="pad-token-required">
              {requiredCost}{" "}
              {requiredCost === 1
                ? "Token"
                : "Tokens"}{" "}
              required
            </span>
          ) : null}


          <button
            type="button"
            className="psychometric-button pad-get-started"
            onClick={() =>
              onOpen?.(test)
            }
          >
            Get started
          </button>

        </div>

      </article>
    );
  }


  /*
    =====================================================
    NORMAL SMALL CARD

    Personality / Behaviour / Motivation
    =====================================================
  */

  return (
    <article className="pad-assessment-card">

      <div className="pad-assessment-card__top">

        {illustration ? (
          <img
            src={illustration}
            alt=""
            aria-hidden="true"
            className="pad-assessment-card__image"
          />
        ) : null}


        <div
          className={`pad-attempt-badge ${
            firstAttemptUsed
              ? "is-used"
              : ""
          }`}
        >
          <Gift
            size={14}
            strokeWidth={1.5}
          />

          {badgeText}
        </div>

      </div>


      <h2>
        {test?.title ||
          "Assessment"}
      </h2>


      <p>
        {test?.description ||
          ""}
      </p>


      <div className="pad-assessment-card__footer">

        <span>
          <ClipboardList
            size={17}
            strokeWidth={1.4}
          />

          {questionCount} questions
        </span>


        <button
          type="button"
          className="psychometric-button"
          onClick={() =>
            onOpen?.(test)
          }
        >
          Get started
        </button>

      </div>

    </article>
  );
}